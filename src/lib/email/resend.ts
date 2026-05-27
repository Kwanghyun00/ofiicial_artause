import type { TicketEntryPayload } from "@/lib/models/ticket-entry"

const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM_EMAIL = process.env.EMAIL_FROM ?? "알터즈 <noreply@artause.co.kr>"

interface InviteConfirmationParams {
  applicantName: string
  applicantEmail: string
  campaignTitle: string
  venueName?: string | null
  performancePeriod?: string | null
  slug: string
}

function buildInviteConfirmationHtml(params: InviteConfirmationParams): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://artause.co.kr"
  const campaignUrl = `${siteUrl}/invites/${params.slug}`

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>초대권 신청 완료</title>
</head>
<body style="margin:0;padding:0;background:#f8f7f4;font-family:'Noto Sans KR',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f7f4;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
          <!-- 헤더 -->
          <tr>
            <td style="background:#1a1a2e;padding:28px 40px;">
              <p style="margin:0;color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.3px;">알터즈</p>
              <p style="margin:4px 0 0;color:#a0a0c0;font-size:12px;">Artause — 공연과 관객을 잇다</p>
            </td>
          </tr>

          <!-- 본문 -->
          <tr>
            <td style="padding:36px 40px 20px;">
              <p style="margin:0 0 8px;color:#1a1a2e;font-size:22px;font-weight:700;">초대권 신청이 완료되었습니다 ✦</p>
              <p style="margin:0 0 24px;color:#555;font-size:15px;line-height:1.6;">
                안녕하세요, <strong>${params.applicantName}</strong>님!<br />
                아래 공연의 초대권 응모가 정상적으로 접수되었습니다.
              </p>

              <!-- 공연 정보 카드 -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f7f4;border-radius:8px;padding:20px;margin-bottom:24px;">
                <tr>
                  <td>
                    <p style="margin:0 0 4px;color:#888;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">공연명</p>
                    <p style="margin:0 0 16px;color:#1a1a2e;font-size:17px;font-weight:700;">${params.campaignTitle}</p>
                    ${params.venueName ? `<p style="margin:0 0 4px;color:#888;font-size:12px;font-weight:600;">공연장</p><p style="margin:0 0 16px;color:#333;font-size:14px;">${params.venueName}</p>` : ""}
                    ${params.performancePeriod ? `<p style="margin:0 0 4px;color:#888;font-size:12px;font-weight:600;">공연 기간</p><p style="margin:0;color:#333;font-size:14px;">${params.performancePeriod}</p>` : ""}
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 24px;color:#555;font-size:14px;line-height:1.7;">
                당첨 여부는 응모 마감 후 개별 안내드릴 예정입니다.<br />
                신청 내용은 아래 링크에서 확인하실 수 있습니다.
              </p>

              <a href="${campaignUrl}" style="display:inline-block;background:#1a1a2e;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:8px;font-size:15px;font-weight:600;">이벤트 페이지 확인하기 →</a>
            </td>
          </tr>

          <!-- 푸터 -->
          <tr>
            <td style="padding:24px 40px 32px;border-top:1px solid #eee;margin-top:24px;">
              <p style="margin:0;color:#aaa;font-size:12px;line-height:1.6;">
                본 메일은 알터즈 초대권 이벤트 응모 시 발송되는 자동 발신 메일입니다.<br />
                문의: <a href="mailto:hello@artause.co.kr" style="color:#888;">hello@artause.co.kr</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export async function sendInviteConfirmationEmail(
  params: InviteConfirmationParams
): Promise<void> {
  if (!RESEND_API_KEY) {
    console.info("[email] RESEND_API_KEY not set — skipping confirmation email", {
      to: params.applicantEmail,
      subject: `[알터즈] ${params.campaignTitle} 초대권 신청 완료`,
    })
    return
  }

  const payload = {
    from: FROM_EMAIL,
    to: [params.applicantEmail],
    subject: `[알터즈] ${params.campaignTitle} 초대권 신청이 완료되었습니다`,
    html: buildInviteConfirmationHtml(params),
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(`Resend API error ${res.status}: ${body}`)
  }
}
