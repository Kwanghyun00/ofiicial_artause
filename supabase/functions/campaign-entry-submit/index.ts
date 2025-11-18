import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.7";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

type EntryPayload = {
  campaignId: string;
  adSessionId: string;
  contactHash: string;
  fingerprint?: Record<string, unknown>;
  noveltyOverride?: number;
  referralFactor?: number;
  metadata?: Record<string, unknown>;
};

const NOVELTY_WINDOW_DAYS = 180;

async function sha256(value: string) {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function bigIntFromHash(hash: string) {
  return BigInt("0x" + hash.slice(0, 16));
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const jwt = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!jwt) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { data: auth } = await supabase.auth.getUser(jwt);
  const user = auth.user;
  if (!user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  let payload: EntryPayload;
  try {
    payload = await req.json();
  } catch (_error) {
    return new Response("Invalid JSON", { status: 400 });
  }

  if (
    !payload?.campaignId ||
    !payload.adSessionId ||
    !payload.contactHash
  ) {
    return new Response("Unprocessable Entity", { status: 422 });
  }

  const correlationId = crypto.randomUUID();

  const { data: campaign, error: campaignErr } = await supabase
    .from("ticket_campaigns")
    .select("id, status, starts_at, ends_at, allocation, config, algorithm_version")
    .eq("id", payload.campaignId)
    .single();

  if (campaignErr || !campaign) {
    return new Response("Campaign not found", { status: 404 });
  }

  const now = new Date();
  if (
    campaign.status === "closed" ||
    (campaign.starts_at && now < new Date(campaign.starts_at)) ||
    (campaign.ends_at && now > new Date(campaign.ends_at))
  ) {
    await supabase.from("audit_logs").insert({
      actor_type: "user",
      actor_id: user.id,
      action: "ENTRY_BLOCKED_CAMPAIGN_WINDOW",
      entity: "campaign_entries",
      correlation_id: correlationId,
      payload: { campaignId: payload.campaignId, now: now.toISOString() },
    });
    return new Response(
      JSON.stringify({ reason: "campaign_closed" }),
      { status: 412 },
    );
  }

  const hashedContact = payload.contactHash;

  const { data: participant } = await supabase
    .from("campaign_participants")
    .upsert({
      campaign_id: payload.campaignId,
      external_user_id: user.id,
      hashed_contact: hashedContact,
      nickname: user.user_metadata?.name ?? null,
    }, {
      onConflict: "campaign_id,external_user_id",
    })
    .select("id")
    .single();

  if (!participant) {
    return new Response("Failed to register participant", { status: 500 });
  }

  // Refresh hashed contact if newly provided
  await supabase.from("campaign_participants")
    .update({ hashed_contact: hashedContact })
    .eq("id", participant.id)
    .neq("hashed_contact", hashedContact);

  const { data: verification } = await supabase
    .from("campaign_ad_watch_verifications")
    .select("id, watched_ratio, verification_payload, completed_at")
    .eq("campaign_id", payload.campaignId)
    .eq("participant_id", participant.id)
    .maybeSingle();

  if (!verification) {
    return new Response(
      JSON.stringify({ reason: "ad_verification_missing" }),
      { status: 412 },
    );
  }

  const ttlHours = verification.verification_payload?.config?.ttl_hours ?? 24;
  const expiresAt = new Date(new Date(verification.completed_at ?? now).getTime() + ttlHours * 3600 * 1000);
  if (expiresAt < now) {
    return new Response(
      JSON.stringify({ reason: "ad_verification_expired" }),
      { status: 412 },
    );
  }

  const { data: blacklistEntry } = await supabase
    .from("campaign_blacklist")
    .select("id, expires_at")
    .eq("external_user_id", user.id)
    .maybeSingle();

  const { data: existingEntry } = await supabase
    .from("campaign_entries")
    .select("id, status, reason")
    .eq("campaign_id", payload.campaignId)
    .eq("participant_id", participant.id)
    .maybeSingle();

  if (existingEntry?.id) {
    return new Response(
      JSON.stringify({ reason: "duplicate_entry" }),
      { status: 409 },
    );
  }

  let status: "eligible" | "blacklisted" | "duplicate" = "eligible";
  let reason: string | null = null;

  if (
    blacklistEntry &&
    (!blacklistEntry.expires_at || new Date(blacklistEntry.expires_at) > now)
  ) {
    status = "blacklisted";
    reason = "blacklist";
  }

  // Duplicate detection via fingerprint hash (simple heuristic)
  const duplicateGroup = payload.fingerprint?.deviceId
    ? `${payload.fingerprint.deviceId}`
    : undefined;

  if (status === "eligible" && duplicateGroup) {
    const { data: duplicateCandidate } = await supabase
      .from("campaign_entries")
      .select("id")
      .eq("campaign_id", payload.campaignId)
      .eq("duplicate_group", duplicateGroup)
      .maybeSingle();

    if (duplicateCandidate?.id) {
      status = "duplicate";
      reason = "fingerprint_duplicate";
    }
  }

  const weightsConfig = campaign.config?.weights ?? {};
  const baseWeight = Number(weightsConfig.base ?? 1);
  const noveltyFactorConfig = Number(weightsConfig.novelty_multiplier ?? 0.3);

  let noveltyFactor = 1;
  if (status === "eligible") {
    const threshold = new Date(now);
    threshold.setDate(threshold.getDate() - NOVELTY_WINDOW_DAYS);

    const { data: priorWins } = await supabase
      .from("campaign_entries")
      .select("updated_at")
      .eq("participant_id", participant.id)
      .eq("status", "winner")
      .gte("updated_at", threshold.toISOString())
      .limit(1);

    if (priorWins && priorWins.length > 0) {
      noveltyFactor = weightsConfig?.novelty_multiplier ?? noveltyFactorConfig;
    }
  }

  if (typeof payload.noveltyOverride === "number") {
    noveltyFactor = payload.noveltyOverride;
  }

  const referralFactor = typeof payload.referralFactor === "number"
    ? payload.referralFactor
    : Number(weightsConfig.referral_multiplier ?? 1);

  const weight = status === "eligible"
    ? Math.max(0, baseWeight * noveltyFactor * referralFactor)
    : 0;

  const seedHash = await sha256(`${payload.campaignId}:${participant.id}`);
  const randomSeed = Number(bigIntFromHash(seedHash) % BigInt(Number.MAX_SAFE_INTEGER));

  const { data: entry, error: insertErr } = await supabase
    .from("campaign_entries")
    .insert({
      campaign_id: payload.campaignId,
      participant_id: participant.id,
      ad_verification_id: verification.id,
      status,
      reason,
      weight,
      novelty_factor: noveltyFactor,
      referral_factor: referralFactor,
      duplicate_group: duplicateGroup,
      random_seed: randomSeed,
      fingerprint: payload.fingerprint ?? null,
      extra: payload.metadata ?? null,
    })
    .select("id, status, weight")
    .single();

  if (insertErr || !entry) {
    console.error("entry insert error", insertErr);
    return new Response("Failed to create entry", { status: 500 });
  }

  await supabase.from("audit_logs").insert({
    actor_type: "user",
    actor_id: user.id,
    action: "ENTRY_SUBMITTED",
    entity: "campaign_entries",
    entity_id: entry.id,
    correlation_id: correlationId,
    payload: {
      campaignId: payload.campaignId,
      participantId: participant.id,
      status: entry.status,
      weight: entry.weight,
      fingerprint: payload.fingerprint ?? null,
    },
  });

  return new Response(
    JSON.stringify({
      entryId: entry.id,
      status: entry.status,
      weight: entry.weight,
    }),
    { headers: { "Content-Type": "application/json" } },
  );
});
