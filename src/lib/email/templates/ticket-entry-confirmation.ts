import { Resend } from 'resend';

export interface TicketEntryConfirmationData {
  applicantName: string;
  applicantEmail: string;
  campaignTitle: string;
  campaignSlug: string;
  appliedAt: string;
  endsAt?: string | null;
}

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_ADDRESS = process.env.EMAIL_FROM ?? 'Artause <noreply@artause.co.kr>';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://artause.co.kr';

export async function sendTicketEntryConfirmation(
  data: TicketEntryConfirmationData
): Promise<void> {
  const { applicantName, applicantEmail, campaignTitle, campaignSlug, appliedAt, endsAt } = data;

  const appliedAtFormatted = new Date(appliedAt).toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Seoul',
  });

  const endsAtFormatted = endsAt
    ? new Date(endsAt).toLocaleString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Seoul',
      })
    : null;

  const eventUrl = `${SITE_URL}/invites/${campaignSlug}`;

  await resend.emails.send({
    from: FROM_ADDRESS,
    to: applicantEmail,
    subject: `[알터즈] ${campaignTitle} 초대권 신청이 완료되었습니다`,
    html: `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>초대권 신청 완료</title>
</head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:'Apple SD Gothic Neo','Noto Sans KR',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
          <!-- Header -->
          <tr>
            <td style="background:#1a1a2e;padding:28px 40px;">
              <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">Artause</p>
              <p style="margin:4px 0 0;font-size:13px;color:#a0aec0;">공연과 당신을 잇는 플랫폼</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:36px 40px 28px;">
              <p style="margin:0 0 8px;font-size:20px;font-weight:700;color:#1a1a2e;">초대권 신청이 완료되었습니다 ✦</p>
              <p style="margin:0 0 24px;font-size:14px;color:#64748b;line-height:1.6;">
                안녕하세요, <strong>${applicantName}</strong>님.<br />
                초대권 신청이 정상적으로 접수되었습니다.
              </p>

              <!-- Info Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:6px 0;font-size:13px;color:#64748b;width:90px;">이벤트명</td>
                        <td style="padding:6px 0;font-size:13px;color:#1a1a2e;font-weight:600;">${campaignTitle}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;font-size:13px;color:#64748b;">신청 일시</td>
                        <td style="padding:6px 0;font-size:13px;color:#1a1a2e;">${appliedAtFormatted}</td>
                      </tr>
                      ${endsAtFormatted ? `
                      <tr>
                        <td style="padding:6px 0;font-size:13px;color:#64748b;">마감 일시</td>
                        <td style="padding:6px 0;font-size:13px;color:#1a1a2e;">${endsAtFormatted}</td>
                      </tr>` : ''}
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 20px;font-size:13px;color:#64748b;line-height:1.7;">
                추첨 결과는 마감일 이후 등록하신 이메일로 개별 안내드립니다.<br />
                당첨되셨을 경우 안내에 따라 공연 당일 현장에서 티켓을 수령하실 수 있습니다.
              </p>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:24px;background:#1a1a2e;">
                    <a href="${eventUrl}" target="_blank" style="display:inline-block;padding:12px 28px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;">이벤트 페이지 바로가기 →</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #f1f5f9;">
              <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.6;">
                본 메일은 알터즈(Artause) 서비스에서 발송되었습니다.<br />
                문의: <a href="mailto:hello@artause.co.kr" style="color:#6366f1;text-decoration:none;">hello@artause.co.kr</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  });
}
