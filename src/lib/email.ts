const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM_EMAIL = process.env.EMAIL_FROM ?? "noreply@artause.co.kr"
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://artause.co.kr"

export interface InviteConfirmationEmailParams {
  to: string
  applicantName: string
  campaignTitle: string
  campaignSlug: string
  reward: string | null
  endsAt: string | null
}

export async function sendInviteConfirmationEmail(params: InviteConfirmationEmailParams): Promise<void> {
  const { to, applicantName, campaignTitle, campaignSlug, reward, endsAt } = params

  const deadlineText = endsAt
    ? new Date(endsAt).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })
    : null

  const campaignUrl = `${SITE_URL}/invites/${campaignSlug}`

  const html = `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>초대권 신청 확인</title>
</head>
<body style="margin:0;padding:0;background:#f8f7f4;font-family:'Apple SD Gothic Neo',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f7f4;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#1a1a2e;padding:28px 40px;">
              <p style="margin:0;color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.3px;">알터즈 <span style="color:#c9a96e;">artause</span></p>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 40px 28px;">
              <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1a1a2e;">${campaignTitle}</p>
              <p style="margin:0 0 24px;font-size:14px;color:#6b7280;">초대권 신청이 완료되었습니다.</p>
              <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.6;">
                안녕하세요, <strong>${applicantName}</strong>님.<br />
                알터즈 공연 초대 이벤트에 신청해 주셔서 감사합니다.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f5ef;border-radius:8px;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 10px;font-size:13px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;">신청 정보</p>
                    <p style="margin:0 0 6px;font-size:14px;color:#374151;"><strong>공연명</strong>&nbsp;&nbsp;${campaignTitle}</p>
                    ${reward ? `<p style="margin:0 0 6px;font-size:14px;color:#374151;"><strong>혜택</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${reward}</p>` : ""}
                    ${deadlineText ? `<p style="margin:0;font-size:14px;color:#374151;"><strong>마감일</strong>&nbsp;&nbsp;${deadlineText}</p>` : ""}
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 20px;font-size:14px;color:#6b7280;line-height:1.6;">
                당첨자 발표 후 개별 연락드릴 예정입니다.<br />
                이벤트 상세 페이지에서 당첨 여부를 확인하실 수 있습니다.
              </p>
              <a href="${campaignUrl}" style="display:inline-block;background:#1a1a2e;color:#ffffff;font-size:14px;font-weight:600;padding:12px 24px;border-radius:6px;text-decoration:none;">이벤트 페이지 보기</a>
            </td>
          </tr>
          <tr>
            <td style="background:#f3f4f6;padding:20px 40px;">
              <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
                본 이메일은 알터즈(artause.co.kr) 초대 이벤트 신청 시 자동으로 발송됩니다.<br />
                문의: <a href="mailto:hello@artause.co.kr" style="color:#9ca3af;">hello@artause.co.kr</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

  if (RESEND_API_KEY) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to,
        subject: `[알터즈] ${campaignTitle} 초대권 신청이 완료되었습니다`,
        html,
      }),
    })
    if (!res.ok) {
      const body = await res.text()
      throw new Error(`Resend API error ${res.status}: ${body}`)
    }
    return
  }

  // Supabase Edge Function fallback (send-email)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (supabaseUrl && serviceKey) {
    const res = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ to, subject: `[알터즈] ${campaignTitle} 초대권 신청이 완료되었습니다`, html }),
    })
    if (!res.ok) {
      const body = await res.text()
      throw new Error(`Supabase send-email error ${res.status}: ${body}`)
    }
    return
  }

  console.info("[email mock] invite confirmation would be sent to", to, "for campaign", campaignTitle)
}
