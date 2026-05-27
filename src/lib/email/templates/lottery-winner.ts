import type { Database } from '@/lib/supabase/types';

export interface LotteryWinnerData {
  winnerName: string;
  winnerEmail: string;
  performanceTitle: string;
  performanceDate: string;
  venue: string;
  confirmationMethod: string;
  myPageUrl: string;
  entryId?: string;
  campaignId?: string;
}

function formatKoreanDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

export function renderLotteryWinnerHtml(winner: LotteryWinnerData): string {
  const formattedDate = winner.performanceDate
    ? formatKoreanDate(winner.performanceDate)
    : '추후 안내';

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>아르토즈 초대권 당첨 안내</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Noto Sans KR',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:#1a1a2e;padding:32px 40px;text-align:center;">
              <p style="margin:0;color:#a78bfa;font-size:13px;letter-spacing:2px;text-transform:uppercase;">ARTAUSE</p>
              <h1 style="margin:8px 0 0;color:#ffffff;font-size:24px;font-weight:700;">🎭 초대권 당첨을 축하합니다!</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 24px;font-size:16px;color:#333;line-height:1.7;">
                안녕하세요, <strong>${winner.winnerName}</strong>님!<br />
                <strong>${winner.performanceTitle}</strong> 초대권 이벤트에 당첨되셨습니다.
              </p>

              <!-- Info Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f4ff;border-left:4px solid #7c3aed;border-radius:4px;margin-bottom:32px;">
                <tr>
                  <td style="padding:24px;">
                    <p style="margin:0 0 12px;font-size:13px;color:#7c3aed;font-weight:600;letter-spacing:1px;">공연 정보</p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:6px 0;width:80px;font-size:14px;color:#666;">공연명</td>
                        <td style="padding:6px 0;font-size:14px;color:#111;font-weight:600;">${winner.performanceTitle}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;font-size:14px;color:#666;">공연일</td>
                        <td style="padding:6px 0;font-size:14px;color:#111;">${formattedDate}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;font-size:14px;color:#666;">장소</td>
                        <td style="padding:6px 0;font-size:14px;color:#111;">${winner.venue}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Confirmation Method -->
              <h2 style="margin:0 0 12px;font-size:16px;color:#111;">티켓 수령 방법</h2>
              <p style="margin:0 0 24px;font-size:14px;color:#444;line-height:1.8;">${winner.confirmationMethod}</p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td align="center">
                    <a href="${winner.myPageUrl}" style="display:inline-block;background:#7c3aed;color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:8px;font-size:15px;font-weight:600;">마이페이지에서 확인하기</a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:13px;color:#888;line-height:1.7;">
                본 이메일은 아르토즈(Artause) 이벤트 응모 시 입력하신 이메일로 발송되었습니다.<br />
                문의: <a href="mailto:support@artause.co.kr" style="color:#7c3aed;">support@artause.co.kr</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9f9f9;padding:20px 40px;text-align:center;border-top:1px solid #eee;">
              <p style="margin:0;font-size:12px;color:#aaa;">© 2026 Artause. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function renderLotteryWinnerText(winner: LotteryWinnerData): string {
  const formattedDate = winner.performanceDate
    ? formatKoreanDate(winner.performanceDate)
    : '추후 안내';

  return [
    `[아르토즈] ${winner.performanceTitle} 초대권 당첨 안내`,
    '',
    `${winner.winnerName}님, 초대권 이벤트에 당첨되셨습니다!`,
    '',
    '■ 공연 정보',
    `공연명: ${winner.performanceTitle}`,
    `공연일: ${formattedDate}`,
    `장소: ${winner.venue}`,
    '',
    '■ 티켓 수령 방법',
    winner.confirmationMethod,
    '',
    `마이페이지 바로가기: ${winner.myPageUrl}`,
    '',
    '문의: support@artause.co.kr',
    '© 2026 Artause',
  ].join('\n');
}

/**
 * 당첨자에게 이메일을 발송합니다.
 * SMTP_HOST 등 환경변수가 없으면 콘솔에만 출력(Mock 모드)합니다.
 */
export async function sendLotteryWinnerNotification(
  winner: LotteryWinnerData
): Promise<{ success: boolean; error?: string }> {
  if (!winner.winnerEmail) {
    return { success: false, error: '수신자 이메일이 없습니다.' };
  }

  const html = renderLotteryWinnerHtml(winner);
  const text = renderLotteryWinnerText(winner);
  const subject = `[아르토즈] ${winner.performanceTitle} 초대권 당첨을 축하합니다! 🎭`;

  // SMTP 환경변수가 없으면 Mock 모드
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM ?? 'noreply@artause.co.kr';

  if (!smtpHost || !smtpUser || !smtpPass) {
    console.info('[Email Mock] 당첨 이메일 발송 (SMTP 미설정):', {
      to: winner.winnerEmail,
      subject,
      text,
    });
    return { success: true };
  }

  try {
    // nodemailer는 선택적 의존성이므로 동적 import로 처리합니다.
    // package.json에 nodemailer를 추가해야 실제 발송이 가능합니다.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const nodemailer = require('nodemailer') as typeof import('nodemailer');

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: smtpUser, pass: smtpPass },
    });

    await transporter.sendMail({
      from: `아르토즈 <${smtpFrom}>`,
      to: winner.winnerEmail,
      subject,
      text,
      html,
    });

    return { success: true };
  } catch (err) {
    console.error('[Email] 당첨 이메일 발송 실패:', err);
    return { success: false, error: String(err) };
  }
}
