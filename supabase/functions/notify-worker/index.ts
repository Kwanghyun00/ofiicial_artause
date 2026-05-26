import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.7";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const QUIET_START = 22;
const QUIET_END = 8;
const MAX_ATTEMPTS = 3;
const BASE_URL = Deno.env.get("NEXT_PUBLIC_SITE_URL") ?? "https://artause.co.kr";
const FROM_EMAIL = "알터즈 <noreply@artause.co.kr>";

serve(async () => {
  const now = new Date();
  const hour = now.getHours();
  const inQuietHours = hour >= QUIET_START || hour < QUIET_END;

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("state", "queued")
    .lte("deliver_at", now.toISOString())
    .lt("attempts", MAX_ATTEMPTS)
    .limit(50);

  if (!notifications?.length) {
    return new Response("No queued notifications", { status: 200 });
  }

  // 조용한 시간대: 리마인더/광고성 알림은 오전 8시로 미루기
  const quietTemplates = ["review_reminder", "partner_slot_low", "partner_entry_new"];
  if (inQuietHours) {
    const tomorrow = new Date(now);
    tomorrow.setHours(QUIET_END, 0, 0, 0);
    if (now.getHours() >= QUIET_START) tomorrow.setDate(tomorrow.getDate() + 1);

    for (const note of notifications) {
      if (quietTemplates.includes(note.template)) {
        await supabase.from("notifications")
          .update({ deliver_at: tomorrow.toISOString() })
          .eq("id", note.id);
      }
    }
  }

  let sent = 0;
  let failed = 0;

  for (const note of notifications) {
    if (inQuietHours && quietTemplates.includes(note.template)) continue;

    const ok = await sendNotification(note);
    await supabase.from("notifications")
      .update({
        state: ok ? "sent" : (note.attempts + 1 >= MAX_ATTEMPTS ? "failed" : "queued"),
        attempts: note.attempts + 1,
        error_msg: ok ? null : "Resend API error",
      })
      .eq("id", note.id);

    ok ? sent++ : failed++;
  }

  return new Response(
    JSON.stringify({ sent, failed, total: notifications.length }),
    { headers: { "Content-Type": "application/json" } },
  );
});

async function sendNotification(note: Record<string, unknown>): Promise<boolean> {
  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!resendKey) {
    console.error("[notify-worker] RESEND_API_KEY not configured");
    return false;
  }

  const payload = (note.payload ?? {}) as Record<string, unknown>;
  const to = (payload.email ?? payload.userEmail) as string | undefined;
  if (!to) {
    console.warn("[notify-worker] No recipient email in payload", note.id);
    return false;
  }

  const template = note.template as string;
  const subject = renderSubject(template, payload);
  const html = renderBody(template, payload);

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error(`[notify-worker] Resend error (${note.id}):`, err);
  }

  return response.ok;
}

// ============================================================================
// 제목 렌더러
// ============================================================================
function renderSubject(template: string, p: Record<string, unknown>): string {
  const show = p.showTitle ?? p.campaignTitle ?? "공연";
  switch (template) {
    case "entry_received":
      return `[알터즈] ${show} 체험단 지원이 접수되었습니다`;
    case "entry_selected":
      return `[알터즈] 🎉 ${show} 체험단으로 선정되셨습니다!`;
    case "entry_confirmed":
      return `[알터즈] ✓ 참석이 확정되었습니다 — QR 코드를 확인하세요`;
    case "entry_declined":
      return `[알터즈] ${show} 체험단 불참 처리 안내`;
    case "review_reminder":
      return `[알터즈] ⏰ 체험단 후기 제출 마감이 ${p.daysLeft ?? 3}일 남았습니다`;
    case "review_received":
      return `[알터즈] 후기가 접수되었습니다. 포트폴리오에 등재 예정입니다`;
    case "report_verified":
      return `[알터즈] ✦ 체험단 후기가 검증 완료되어 포트폴리오에 등재되었습니다`;
    case "partner_entry_new":
      return `[알터즈 파트너] ${show} 체험단에 신규 지원자가 있습니다`;
    case "partner_slot_low":
      return `[알터즈 파트너] 크레딧 잔액이 ${p.balance ?? 0}원입니다 — 충전이 필요합니다`;
    // 하위호환
    case "winner":
      return `[초대권 당첨] ${show} 공연을 확인해주세요`;
    case "waitlist_promoted":
      return `[대기자 승급] 초대권 기회를 잡으세요`;
    default:
      return "[알터즈] 알림을 확인해주세요";
  }
}

// ============================================================================
// 본문 렌더러
// ============================================================================
function renderBody(template: string, p: Record<string, unknown>): string {
  const show = p.showTitle ?? p.campaignTitle ?? "공연";
  const name = p.applicantName ?? p.name ?? "지원자";
  const confirmUrl = p.confirmToken
    ? `${BASE_URL}/recruit/${p.campaignSlug}/confirm?token=${p.confirmToken}`
    : `${BASE_URL}/recruit`;
  const reportUrl = p.qrToken
    ? `${BASE_URL}/recruit/${p.campaignSlug}/report?token=${p.qrToken}`
    : `${BASE_URL}/recruit`;
  const myUrl = `${BASE_URL}/my`;

  const wrap = (content: string) => `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>알터즈</title>
  <style>
    body { margin: 0; padding: 0; background: #f5f5f5; font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; }
    .container { max-width: 560px; margin: 32px auto; background: #ffffff; border: 1px solid #e2e2e2; }
    .header { padding: 24px 32px; border-bottom: 2px solid #1a1a1a; }
    .logo { font-size: 18px; font-weight: 900; letter-spacing: -0.02em; color: #1a1a1a; }
    .body { padding: 32px; }
    h2 { font-size: 22px; font-weight: 800; color: #1a1a1a; margin: 0 0 12px; }
    p { font-size: 15px; line-height: 1.7; color: #444; margin: 0 0 16px; }
    .highlight { background: #fff8f0; border-left: 3px solid #e07b39; padding: 12px 16px; margin: 20px 0; }
    .btn { display: inline-block; background: #e07b39; color: #fff; text-decoration: none;
           font-weight: 800; font-size: 15px; padding: 14px 28px; margin: 20px 0; }
    .btn-outline { background: transparent; color: #1a1a1a; border: 2px solid #1a1a1a; }
    .qr-note { background: #f8f8f8; border: 1px solid #e2e2e2; padding: 16px; text-align: center;
                font-size: 13px; color: #666; margin: 20px 0; }
    .footer { padding: 20px 32px; border-top: 1px solid #e2e2e2; font-size: 12px; color: #999; }
    .tier-badge { display: inline-block; padding: 4px 10px; font-size: 12px; font-weight: 700;
                  border-radius: 2px; background: #e07b39; color: #fff; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><span class="logo">ARTAUSE ✦</span></div>
    <div class="body">${content}</div>
    <div class="footer">
      © 알터즈 · <a href="${BASE_URL}" style="color:#999;">artause.co.kr</a>
      <br/>본 메일은 발신 전용입니다. 문의: contact@artause.co.kr
    </div>
  </div>
</body>
</html>`;

  switch (template) {

    case "entry_received":
      return wrap(`
        <h2>체험단 지원이 접수되었습니다</h2>
        <p>${name}님, <strong>${show}</strong> 체험단에 지원해 주셔서 감사합니다.</p>
        <div class="highlight">
          <strong>📋 지원 정보 확인</strong><br/>
          공연: ${show}<br/>
          지원자: ${name}<br/>
          SNS 티어: <span class="tier-badge">${snsKorTier(p.snsTier as string)}</span>
        </div>
        <p>파트너가 지원 내용을 검토한 후 선정 결과를 이메일로 안내드립니다.<br/>
        결과 발표는 보통 모집 마감 후 <strong>2-3 영업일</strong> 내에 이루어집니다.</p>
        <a href="${myUrl}" class="btn btn-outline">내 지원 현황 확인</a>
      `);

    case "entry_selected":
      return wrap(`
        <h2>🎉 체험단으로 선정되셨습니다!</h2>
        <p><strong>${name}</strong>님, <strong>${show}</strong> 체험단으로 선정되셨습니다. 축하합니다!</p>
        <div class="highlight">
          아래 버튼을 눌러 <strong>참석 날짜를 선택하고 확정</strong>해 주세요.<br/>
          <small>⚠️ 링크는 <strong>24시간</strong> 이내에만 유효합니다.</small>
        </div>
        <a href="${confirmUrl}" class="btn">참석 날짜 선택 및 확정하기 →</a>
        <p style="font-size:13px;color:#999;">위 버튼이 작동하지 않으면 아래 주소를 브라우저에 직접 입력하세요:<br/>
        <a href="${confirmUrl}" style="color:#e07b39;word-break:break-all;">${confirmUrl}</a></p>
      `);

    case "entry_confirmed":
      return wrap(`
        <h2>✓ 참석이 확정되었습니다</h2>
        <p>${name}님, <strong>${show}</strong> 관람이 확정되었습니다.</p>
        <div class="highlight">
          <strong>📅 관람 일정</strong><br/>
          날짜: ${p.confirmedDate ?? "별도 안내"}<br/>
          시간: ${p.confirmedTime ?? "별도 안내"}<br/>
          장소: ${p.venue ?? "별도 안내"}
        </div>
        <div class="qr-note">
          <strong>QR 코드 안내</strong><br/>
          관람 당일 입구에서 아래 QR 코드를 제시해 주세요.<br/>
          <code style="font-size:16px;font-weight:bold;">${p.qrToken ?? ""}</code>
        </div>
        <p style="font-size:13px;">관람 후 <strong>${p.reviewDeadlineDays ?? 7}일 이내</strong>에
        ${platformNames(p.requiredPlatforms as string[])} 후기를 제출해 주세요.</p>
        <a href="${myUrl}" class="btn btn-outline">내 체험단 활동 확인</a>
      `);

    case "entry_declined":
      return wrap(`
        <h2>불참 처리 안내</h2>
        <p>${name}님, <strong>${show}</strong> 체험단 참석을 취소하셨습니다.</p>
        <p>다음 체험단 모집에서 다시 만나요. 좋은 공연들이 기다리고 있습니다.</p>
        <a href="${BASE_URL}/recruit" class="btn btn-outline">다른 체험단 보기</a>
      `);

    case "review_reminder":
      return wrap(`
        <h2>⏰ 후기 제출 마감이 얼마 남지 않았습니다</h2>
        <p>${name}님, <strong>${show}</strong> 체험단 후기 제출 마감까지
        <strong>${p.daysLeft ?? 3}일</strong> 남았습니다.</p>
        <div class="highlight">
          제출 플랫폼: ${platformNames(p.requiredPlatforms as string[])}<br/>
          마감일: ${p.deadline ?? ""}
        </div>
        <p>후기를 제출하지 않으면 향후 체험단 신청이 제한될 수 있습니다.</p>
        <a href="${reportUrl}" class="btn">후기 제출하기 →</a>
      `);

    case "review_received":
      return wrap(`
        <h2>후기가 접수되었습니다</h2>
        <p>${name}님, <strong>${show}</strong> 체험단 후기를 제출해 주셨습니다. 감사합니다!</p>
        <p>파트너가 콘텐츠를 확인한 후 <strong>3-5 영업일</strong> 이내에 검증 결과를 안내드립니다.<br/>
        검증 완료 시 내 포트폴리오에 자동으로 등재됩니다.</p>
        <a href="${myUrl}" class="btn btn-outline">내 포트폴리오 확인</a>
      `);

    case "report_verified":
      return wrap(`
        <h2>✦ 체험단 후기가 포트폴리오에 등재되었습니다</h2>
        <p>${name}님, <strong>${show}</strong> 체험단 후기 검증이 완료되어
        포트폴리오에 등재되었습니다!</p>
        <div class="highlight">
          이제 내 체험단 활동 이력에서 확인할 수 있습니다.<br/>
          포트폴리오 링크를 SNS에 공유해 더 많은 기회를 얻어보세요.
        </div>
        <a href="${myUrl}" class="btn">내 포트폴리오 보기 →</a>
      `);

    case "partner_entry_new":
      return wrap(`
        <h2>신규 체험단 지원자가 있습니다</h2>
        <p><strong>${show}</strong>에 새로운 체험단 지원자가 있습니다.</p>
        <div class="highlight">
          지원자: ${name}<br/>
          SNS 티어: <span class="tier-badge">${snsKorTier(p.snsTier as string)}</span><br/>
          파워 스코어: ${p.powerScore ?? 0}점
        </div>
        <a href="${BASE_URL}/event-center" class="btn btn-outline">지원자 관리 바로가기</a>
      `);

    case "partner_slot_low":
      return wrap(`
        <h2>크레딧 잔액 부족 안내</h2>
        <p>현재 크레딧 잔액이 <strong>${(p.balance as number)?.toLocaleString() ?? 0}원</strong>입니다.</p>
        <p>체험단 선발 시 크레딧이 자동 차감됩니다. 잔액이 부족하면 선발이 제한될 수 있습니다.</p>
        <a href="${BASE_URL}/event-center/billing" class="btn">크레딧 충전하기 →</a>
      `);

    // 하위호환
    case "winner":
      return wrap(`<p>${show} 초대권에 당첨되었습니다.</p>`);
    case "waitlist_promoted":
      return wrap(`<p>${show} 대기 순번이 승급되었습니다.</p>`);

    default:
      return wrap(`<p>알림을 확인해주세요.</p>`);
  }
}

// ============================================================================
// 유틸
// ============================================================================
function snsKorTier(tier: string): string {
  const map: Record<string, string> = {
    general: "일반",
    power: "파워",
    micro: "마이크로 인플루언서",
    influencer: "인플루언서",
  };
  return map[tier] ?? tier ?? "-";
}

function platformNames(platforms: string[] | null | undefined): string {
  if (!platforms?.length) return "SNS";
  const map: Record<string, string> = {
    instagram: "인스타그램",
    blog_naver: "네이버 블로그",
    youtube: "유튜브",
    tiktok: "틱톡",
  };
  return platforms.map((p) => map[p] ?? p).join(", ");
}
