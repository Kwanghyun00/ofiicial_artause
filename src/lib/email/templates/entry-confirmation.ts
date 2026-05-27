export interface EntryConfirmationData {
  applicantName: string
  performanceName: string
  appliedAt: Date | string
}

function formatKST(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}

export function buildEntryConfirmationEmail(data: EntryConfirmationData): {
  subject: string
  html: string
  text: string
} {
  const { applicantName, performanceName, appliedAt } = data
  const kstTime = formatKST(appliedAt)

  const subject = `[아르토즈] ${performanceName} 티켓 신청이 접수되었습니다`

  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
  <style>
    body { margin: 0; padding: 0; background: #f5f5f5; font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; }
    .wrapper { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .header { background: #1a1a1a; padding: 32px 40px; text-align: center; }
    .header img { height: 32px; }
    .header-title { color: #ffffff; font-size: 18px; font-weight: 700; margin: 12px 0 0; letter-spacing: -0.3px; }
    .body { padding: 40px; }
    .greeting { font-size: 16px; color: #111; font-weight: 700; margin-bottom: 12px; }
    .message { font-size: 14px; color: #444; line-height: 1.7; margin-bottom: 32px; }
    .info-box { background: #f8f8f8; border-radius: 8px; padding: 24px; margin-bottom: 32px; }
    .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eeeeee; }
    .info-row:last-child { border-bottom: none; }
    .info-label { font-size: 13px; color: #888; font-weight: 500; }
    .info-value { font-size: 13px; color: #111; font-weight: 600; text-align: right; max-width: 60%; }
    .notice { font-size: 12px; color: #999; line-height: 1.6; padding-top: 16px; border-top: 1px solid #eee; }
    .footer { background: #f8f8f8; padding: 24px 40px; text-align: center; }
    .footer p { font-size: 11px; color: #aaa; margin: 4px 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="header-title">아르토즈 · Artause</div>
    </div>
    <div class="body">
      <div class="greeting">${applicantName}님, 신청이 접수되었습니다! 🎭</div>
      <div class="message">
        공연 초대 이벤트에 신청해 주셔서 감사합니다.<br />
        추첨 결과는 이벤트 종료 후 개별 이메일로 안내드립니다.
      </div>
      <div class="info-box">
        <div class="info-row">
          <span class="info-label">신청자</span>
          <span class="info-value">${applicantName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">공연명</span>
          <span class="info-value">${performanceName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">신청일시</span>
          <span class="info-value">${kstTime}</span>
        </div>
      </div>
      <div class="notice">
        본 메일은 신청 접수 확인을 위해 자동 발송된 메일입니다.<br />
        문의사항은 아르토즈 고객센터로 연락해 주세요.
      </div>
    </div>
    <div class="footer">
      <p>© 2025 Artause. All rights reserved.</p>
      <p>본 메일은 발신 전용입니다.</p>
    </div>
  </div>
</body>
</html>`

  const text = [
    `[아르토즈] 티켓 신청 접수 확인`,
    ``,
    `${applicantName}님, 신청이 접수되었습니다.`,
    ``,
    `▶ 신청자: ${applicantName}`,
    `▶ 공연명: ${performanceName}`,
    `▶ 신청일시: ${kstTime}`,
    ``,
    `추첨 결과는 이벤트 종료 후 개별 이메일로 안내드립니다.`,
    ``,
    `© 2025 Artause`,
  ].join("\n")

  return { subject, html, text }
}

export async function sendEntryConfirmation(entry: EntryConfirmationData): Promise<void> {
  const RESEND_API_KEY = process.env.RESEND_API_KEY
  const FROM_ADDRESS = process.env.EMAIL_FROM ?? "no-reply@artause.co.kr"

  if (!RESEND_API_KEY) {
    console.info("[email] RESEND_API_KEY not set — skipping entry confirmation email", {
      applicantName: entry.applicantName,
      performanceName: entry.performanceName,
    })
    return
  }

  const recipientEmail = (entry as EntryConfirmationData & { applicantEmail?: string }).applicantEmail
  if (!recipientEmail) {
    console.warn("[email] sendEntryConfirmation called without applicantEmail — skipping")
    return
  }

  const { subject, html, text } = buildEntryConfirmationEmail(entry)

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_ADDRESS,
      to: [recipientEmail],
      subject,
      html,
      text,
    }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => "")
    console.error("[email] Resend API error", res.status, body)
  }
}
