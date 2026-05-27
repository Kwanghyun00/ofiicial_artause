import type { TicketEntryPayload } from "@/lib/models/ticket-entry"

interface ConfirmationEmailParams {
  to: string
  applicantName: string
  campaignTitle: string
  submittedAt: string
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Seoul",
  })
}

function buildHtml(params: ConfirmationEmailParams): string {
  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>초대권 신청 완료</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Apple SD Gothic Neo','Malgun Gothic',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;max-width:600px;width:100%;">
          <tr>
            <td style="background:#1a1a2e;padding:32px 40px;text-align:center;">
              <p style="margin:0;color:#a78bfa;font-size:13px;font-weight:600;letter-spacing:2px;text-transform:uppercase;">ARTAUSE</p>
              <h1 style="margin:8px 0 0;color:#ffffff;font-size:22px;font-weight:700;">초대권 신청 완료</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.7;">
                안녕하세요, <strong>${params.applicantName}</strong>님!<br />
                알터즈 초대권 이벤트에 신청해 주셔서 감사합니다.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;margin-bottom:28px;">
                <tr>
                  <td style="padding:24px 28px;">
                    <p style="margin:0 0 6px;color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">신청 공연</p>
                    <p style="margin:0 0 20px;color:#111827;font-size:17px;font-weight:700;">${params.campaignTitle}</p>
                    <p style="margin:0 0 6px;color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">신청 일시</p>
                    <p style="margin:0;color:#374151;font-size:14px;">${params.submittedAt}</p>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="background:#ede9fe;border-radius:8px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 8px;color:#5b21b6;font-size:13px;font-weight:700;">📢 당첨 결과 안내</p>
                    <p style="margin:0;color:#4c1d95;font-size:13px;line-height:1.6;">
                      당첨자는 이벤트 마감 후 개별 이메일로 안내드립니다.<br />
                      발표 일정은 해당 이벤트 페이지에서 확인하세요.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px;color:#6b7280;font-size:12px;line-height:1.6;">
                • 1인 1회 응모 원칙이 적용됩니다.<br />
                • 당첨 후 양도는 불가합니다.<br />
                • 문의: <a href="mailto:hello@artause.co.kr" style="color:#7c3aed;">hello@artause.co.kr</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">
                © 2025 Artause. All rights reserved.<br />
                본 메일은 발신 전용입니다.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

function buildText(params: ConfirmationEmailParams): string {
  return [
    `[알터즈] 초대권 신청 완료`,
    ``,
    `안녕하세요, ${params.applicantName}님!`,
    `알터즈 초대권 이벤트에 신청해 주셔서 감사합니다.`,
    ``,
    `■ 신청 공연: ${params.campaignTitle}`,
    `■ 신청 일시: ${params.submittedAt}`,
    ``,
    `당첨자는 이벤트 마감 후 개별 이메일로 안내드립니다.`,
    `발표 일정은 해당 이벤트 페이지에서 확인하세요.`,
    ``,
    `• 1인 1회 응모 원칙이 적용됩니다.`,
    `• 당첨 후 양도는 불가합니다.`,
    `• 문의: hello@artause.co.kr`,
    ``,
    `© 2025 Artause`,
  ].join("\n")
}

async function sendViaResend(
  params: ConfirmationEmailParams,
  apiKey: string
): Promise<void> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: "알터즈 <noreply@artause.co.kr>",
      to: [params.to],
      subject: `[알터즈] '${params.campaignTitle}' 초대권 신청이 완료되었습니다`,
      html: buildHtml(params),
      text: buildText(params),
    }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(`Resend API error ${res.status}: ${body}`)
  }
}

/**
 * 초대권 신청 확인 이메일 발송 (non-blocking — 실패해도 신청은 유지)
 */
export async function sendInviteConfirmationEmail(
  payload: TicketEntryPayload,
  campaignTitle: string
): Promise<void> {
  const resendApiKey = process.env.RESEND_API_KEY
  if (!resendApiKey) return

  const metadata = (payload.metadata ?? {}) as Record<string, unknown>
  const email = typeof metadata.email === "string" ? metadata.email.trim() : ""
  if (!email) return

  const applicantName =
    typeof metadata.applicantName === "string" && metadata.applicantName.trim()
      ? metadata.applicantName.trim()
      : "관람객"

  const params: ConfirmationEmailParams = {
    to: email,
    applicantName,
    campaignTitle,
    submittedAt: formatDate(new Date().toISOString()),
  }

  try {
    await sendViaResend(params, resendApiKey)
  } catch (err) {
    console.error("sendInviteConfirmationEmail failed (non-blocking):", err)
  }
}
