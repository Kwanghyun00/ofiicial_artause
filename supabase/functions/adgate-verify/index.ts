import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.7";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

type VerifyPayload = {
  campaignId: string;
  adSessionId: string;
  watchedRatio: number;
  durationMs: number;
  focusLostMs: number;
  muted: boolean;
  quartiles?: Record<string, boolean>;
  vendor?: string;
  utm?: Record<string, string>;
  visitedUrl: string;
};

const ALLOWED_DOMAINS = (Deno.env.get("AD_WHITELIST") ?? "")
  .split(",")
  .map((v) => v.trim())
  .filter(Boolean);

async function sha256(value: string) {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
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

  const payload = (await req.json()) as VerifyPayload;
  if (
    !payload?.campaignId ||
    !payload.adSessionId ||
    typeof payload.watchedRatio !== "number" ||
    typeof payload.durationMs !== "number"
  ) {
    return new Response("Unprocessable Entity", { status: 422 });
  }

  const urlHost = new URL(payload.visitedUrl).host;
  if (ALLOWED_DOMAINS.length && !ALLOWED_DOMAINS.includes(urlHost)) {
    return new Response(
      JSON.stringify({ reason: "domain_not_allowed" }),
      { status: 412 },
    );
  }

  const { data: campaign, error: campaignErr } = await supabase
    .from("ticket_campaigns")
    .select("config, starts_at, ends_at, status")
    .eq("id", payload.campaignId)
    .single();

  if (campaignErr || !campaign) {
    return new Response("Campaign not found", { status: 404 });
  }

  const now = new Date();
  if (
    (campaign.starts_at && now < new Date(campaign.starts_at)) ||
    (campaign.ends_at && now > new Date(campaign.ends_at)) ||
    campaign.status === "closed"
  ) {
    return new Response(
      JSON.stringify({ reason: "campaign_closed" }),
      { status: 412 },
    );
  }

  const adgate = (campaign.config ?? {})["adgate"] ?? {};
  const minRatio = typeof adgate.min_ratio === "number" ? adgate.min_ratio : 0.95;
  const maxFocusLossMs = typeof adgate.max_focus_loss_ms === "number"
    ? adgate.max_focus_loss_ms
    : 2000;
  const ttlHours = typeof adgate.ttl_hours === "number" ? adgate.ttl_hours : 24;
  const muteAllowed = adgate.mute_allowed === true;

  if (payload.watchedRatio < minRatio) {
    return new Response(
      JSON.stringify({ reason: "insufficient_watch", minRatio }),
      { status: 412 },
    );
  }

  if (!muteAllowed && payload.muted) {
    return new Response(
      JSON.stringify({ reason: "muted_not_allowed" }),
      { status: 412 },
    );
  }

  if (payload.focusLostMs > maxFocusLossMs) {
    return new Response(
      JSON.stringify({ reason: "focus_lost" }),
      { status: 412 },
    );
  }

  const hashedContactSource = user.email ?? user.phone ?? user.id;
  const hashedContact = await sha256(hashedContactSource);

  const { data: participant } = await supabase
    .from("campaign_participants")
    .upsert({
      campaign_id: payload.campaignId,
      external_user_id: user.id,
      hashed_contact: hashedContact,
      nickname: user.user_metadata?.name ?? null,
      consent_marketing: Boolean(user.user_metadata?.consent_marketing ?? false),
    }, {
      onConflict: "campaign_id,external_user_id",
    })
    .select("id")
    .single();

  if (!participant) {
    return new Response("Failed to register participant", { status: 500 });
  }

  const ttlExp = new Date(Date.now() + ttlHours * 3600 * 1000).toISOString();
  const verificationPayload = {
    ...payload,
    verifiedAt: now.toISOString(),
    config: adgate,
  };

  const { error: upsertErr } = await supabase
    .from("campaign_ad_watch_verifications")
    .upsert({
      campaign_id: payload.campaignId,
      participant_id: participant.id,
      ad_session_id: payload.adSessionId,
      watched_ratio: payload.watchedRatio,
      focus_lost: payload.focusLostMs > 0,
      muted: payload.muted,
      completed_at: now.toISOString(),
      verification_payload: verificationPayload,
    }, {
      onConflict: "campaign_id,participant_id",
    });

  if (upsertErr) {
    return new Response("Failed to persist verification", { status: 500 });
  }

  await supabase.from("audit_logs").insert({
    actor_type: "user",
    actor_id: user.id,
    action: "AD_VERIFICATION_COMPLETED",
    entity: "campaign_ad_watch_verifications",
    entity_id: participant.id,
    payload: verificationPayload,
  });

  return new Response(
    JSON.stringify({ verified: true, ttlExp }),
    { headers: { "Content-Type": "application/json" } },
  );
});
