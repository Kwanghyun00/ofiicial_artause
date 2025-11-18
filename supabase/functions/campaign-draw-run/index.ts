import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.7";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

type DrawPayload = {
  campaignId: string;
  winners?: number;
  waitlist?: number;
  seedOverride?: number;
};

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

async function hashToSeed(input: string) {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  const first = new DataView(digest).getUint32(0, false);
  return first >>> 0;
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const serviceKey = req.headers.get("x-service-key");
  if (serviceKey !== Deno.env.get("DRAW_SERVICE_KEY")) {
    return new Response("Unauthorized", { status: 401 });
  }

  let payload: DrawPayload;
  try {
    payload = await req.json();
  } catch (_err) {
    return new Response("Invalid JSON", { status: 400 });
  }

  if (!payload?.campaignId) {
    return new Response("Unprocessable Entity", { status: 422 });
  }

  const correlationId = crypto.randomUUID();

  const { data: campaign, error: campaignErr } = await supabase
    .from("ticket_campaigns")
    .select("id, allocation, config, algorithm_version, snapshot_seed")
    .eq("id", payload.campaignId)
    .single();

  if (campaignErr || !campaign) {
    return new Response("Campaign not found", { status: 404 });
  }

  const requestedWinners = payload.winners ?? Number(campaign.allocation?.winners ?? 0);
  const requestedWaitlist = payload.waitlist ?? Number(campaign.allocation?.waitlist ?? 0);

  const { data: entries, error: entriesErr } = await supabase
    .from("campaign_entries")
    .select("id, participant_id, weight, random_seed, fingerprint, extra")
    .eq("campaign_id", payload.campaignId)
    .eq("status", "eligible");

  if (entriesErr) {
    console.error(entriesErr);
    return new Response("Failed to load entries", { status: 500 });
  }

  if (!entries || entries.length === 0) {
    return new Response("No eligible entries", { status: 412 });
  }

  const seed = payload.seedOverride ??
    campaign.snapshot_seed ??
    (await hashToSeed(`${payload.campaignId}:${entries.length}`));

  const rng = mulberry32(seed);
  const scored = entries
    .map((entry) => {
      const r = Math.max(rng(), Number.EPSILON);
      const score = Math.log(r) / (entry.weight > 0 ? entry.weight : Number.MIN_VALUE);
      return { ...entry, score };
    })
    .sort((a, b) => a.score - b.score);

  const winners = scored.slice(0, requestedWinners);
  const waitlist = scored.slice(requestedWinners, requestedWinners + requestedWaitlist);
  const expired = scored.slice(requestedWinners + requestedWaitlist);

  const updateStatus = async (ids: string[], status: string) => {
    if (!ids.length) return;
    await supabase
      .from("campaign_entries")
      .update({ status, reason: status === "expired" ? "not_selected" : "selected_draw" })
      .in("id", ids);
  };

  await updateStatus(winners.map((w) => w.id), "winner");
  await updateStatus(waitlist.map((w) => w.id), "waitlist");
  await updateStatus(expired.map((e) => e.id), "expired");

  const preparedWinners = winners.map((entry, index) => ({
    entry_id: entry.id,
    participant_id: entry.participant_id,
    weight: entry.weight,
    rank: index + 1,
    score: entry.score,
  }));

  const preparedWaitlist = waitlist.map((entry, index) => ({
    entry_id: entry.id,
    participant_id: entry.participant_id,
    weight: entry.weight,
    rank: index + 1,
    score: entry.score,
  }));

  const runStarted = performance.now();

  const { data: drawRecord, error: drawErr } = await supabase
    .from("campaign_draws")
    .insert({
      campaign_id: payload.campaignId,
      algorithm_version: campaign.algorithm_version,
      seed,
      config: {
        winners: requestedWinners,
        waitlist: requestedWaitlist,
        weights: campaign.config?.weights ?? {},
      },
      winners: preparedWinners,
      waitlist: preparedWaitlist,
      duration_ms: 0,
    })
    .select("id")
    .single();

  if (drawErr || !drawRecord) {
    console.error(drawErr);
    return new Response("Failed to persist draw", { status: 500 });
  }

  const duration = Math.round(performance.now() - runStarted);

  await supabase
    .from("campaign_draws")
    .update({ duration_ms: duration })
    .eq("id", drawRecord.id);

  const responseDeadlineHours = Number(campaign.config?.response_hours ?? 24);
  const deadline = new Date(Date.now() + responseDeadlineHours * 3600 * 1000).toISOString();

  if (preparedWinners.length) {
    const responseRows = preparedWinners.map((winner) => ({
      draw_id: drawRecord.id,
      participant_id: winner.participant_id,
      status: "pending",
      deadline,
      metadata: { rank: winner.rank },
    }));
    await supabase.from("campaign_winner_responses").insert(responseRows);
  }

  await supabase
    .from("ticket_campaigns")
    .update({ last_draw_at: new Date().toISOString(), snapshot_seed: seed })
    .eq("id", payload.campaignId);

  const { data: audit } = await supabase
    .from("audit_logs")
    .insert({
      actor_type: "service",
      actor_id: "campaign-draw-run",
      action: "DRAW_COMPLETED",
      entity: "campaign_draws",
      entity_id: drawRecord.id,
      correlation_id,
      payload: {
        campaignId: payload.campaignId,
        winners: preparedWinners,
        waitlist: preparedWaitlist,
        seed,
        duration_ms: duration,
      },
    })
    .select("id")
    .single();

  if (audit?.id) {
    await supabase
      .from("campaign_draws")
      .update({ log_id: audit.id })
      .eq("id", drawRecord.id);
  }

  return new Response(
    JSON.stringify({
      drawId: drawRecord.id,
      winners: preparedWinners,
      waitlist: preparedWaitlist,
      seed,
      durationMs: duration,
      correlationId,
    }),
    { headers: { "Content-Type": "application/json" } },
  );
});
