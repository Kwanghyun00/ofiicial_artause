import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.7";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

serve(async () => {
  const now = new Date();
  const isoNow = now.toISOString();

  const { data: pendingResponses, error: responseErr } = await supabase
    .from("campaign_winner_responses")
    .select(`
      id,
      draw_id,
      participant_id,
      deadline,
      campaign_draws!inner (
        campaign_id
      )
    `)
    .eq("status", "pending")
    .lt("deadline", isoNow);

  if (responseErr) {
    console.error("load responses", responseErr);
    return new Response("Failed", { status: 500 });
  }

  if (!pendingResponses || pendingResponses.length === 0) {
    return new Response("No expirations", { status: 200 });
  }

  let promotions = 0;

  for (const response of pendingResponses) {
    const campaignId = response.campaign_draws.campaign_id;

    await supabase
      .from("campaign_winner_responses")
      .update({ status: "timeout", responded_at: isoNow })
      .eq("id", response.id);

    const { data: campaign } = await supabase
      .from("ticket_campaigns")
      .select("config")
      .eq("id", campaignId)
      .single();

    const responseHours = Number(campaign?.config?.response_hours ?? 24);

    const { data: nextCandidate } = await supabase
      .from("campaign_entries")
      .select("id, participant_id")
      .eq("campaign_id", campaignId)
      .eq("status", "waitlist")
      .order("updated_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (!nextCandidate) {
      continue;
    }

    await supabase
      .from("campaign_entries")
      .update({ status: "winner", reason: "waitlist_promoted" })
      .eq("id", nextCandidate.id);

    const deadline = new Date(now.getTime() + responseHours * 3600 * 1000).toISOString();

    const { data: draw } = await supabase
      .from("campaign_draws")
      .select("id")
      .eq("campaign_id", campaignId)
      .order("run_at", { ascending: false })
      .limit(1)
      .single();

    if (!draw) {
      continue;
    }

    const { data: responseRow } = await supabase
      .from("campaign_winner_responses")
      .insert({
        draw_id: draw.id,
        participant_id: nextCandidate.participant_id,
        status: "pending",
        deadline,
        metadata: { source: "waitlist_promotion" },
      })
      .select("id")
      .single();

    const { data: audit } = await supabase
      .from("audit_logs")
      .insert({
        actor_type: "service",
        actor_id: "waitlist-promote",
        action: "WAITLIST_PROMOTED",
        entity: "campaign_entries",
        entity_id: nextCandidate.id,
        payload: {
          campaignId,
          promotedEntry: nextCandidate.id,
          deadline,
        },
      })
      .select("id")
      .single();

    await supabase
      .from("campaign_waitlist_promotions")
      .insert({
        campaign_id: campaignId,
        participant_id: nextCandidate.participant_id,
        promoted_from: promotions + 1,
        promoted_to: promotions + 1,
        trigger: "timeout",
        log_id: audit?.id ?? null,
      });

    if (responseRow) {
      promotions += 1;
    }
  }

  return new Response(`Promoted ${promotions}`, { status: 200 });
});
