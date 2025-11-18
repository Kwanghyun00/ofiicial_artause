import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.7";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const QUIET_START = 22;
const QUIET_END = 8;

serve(async () => {
  const now = new Date();
  const hour = now.getHours();
  const inQuietHours = hour >= QUIET_START || hour < QUIET_END;

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("state", "queued")
    .lte("deliver_at", now.toISOString())
    .limit(50);

  if (!notifications?.length) {
    return new Response("No queued notifications", { status: 200 });
  }

  if (inQuietHours) {
    for (const note of notifications) {
      const deliverAt = new Date(note.deliver_at);
      deliverAt.setHours(QUIET_END, 0, 0, 0);
      await supabase.from("notifications")
        .update({ deliver_at: deliverAt.toISOString() })
        .eq("id", note.id);
    }
    return new Response("Rescheduled for quiet hours", { status: 200 });
  }

  for (const note of notifications) {
    const result = await sendNotification(note);
    await supabase.from("notifications")
      .update({
        state: result ? "sent" : "failed",
      })
      .eq("id", note.id);
  }

  return new Response(`Processed ${notifications.length}`, { status: 200 });
});

async function sendNotification(note: any) {
  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!resendKey) return false;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Artause <noreply@artause.com>",
      to: note.payload?.email ?? note.payload?.userEmail,
      subject: renderSubject(note.template),
      html: renderBody(note.template, note.payload ?? {}),
    }),
  });
  return response.ok;
}

function renderSubject(template: string) {
  switch (template) {
    case "winner":
      return "[초대권 당첨] 공연을 확인해주세요";
    case "waitlist_promoted":
      return "[대기자 승급] 초대권 기회를 잡으세요";
    default:
      return "[알림] Artause 안내";
  }
}

function renderBody(template: string, payload: Record<string, unknown>) {
  if (template === "winner") {
    return `<p>${payload.showTitle ?? "공연"} 초대권에 당첨되었습니다.</p>`;
  }
  if (template === "waitlist_promoted") {
    return `<p>${payload.show ?? "공연"} 대기 순번이 승급되었습니다.</p>`;
  }
  return `<p>알림을 확인해주세요.</p>`;
}
