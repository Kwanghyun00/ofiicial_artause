/**
 * Email sending utility using Resend
 * Supports both transactional emails and campaign notifications
 */

import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

export interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  from?: string
  replyTo?: string
}

/**
 * Send an email using Resend API
 * Falls back to console logging in development if RESEND_API_KEY is not set
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
  from = 'Artause <noreply@artause.co.kr>',
  replyTo,
}: SendEmailOptions): Promise<{ success: boolean; error?: string; messageId?: string }> {
  // Development fallback: log to console
  if (!resend) {
    console.log('[Email Mock Mode] Email would be sent:')
    console.log({ to, subject, from, replyTo })
    console.log('HTML Body:', html)
    return { success: true, messageId: 'mock-' + Date.now() }
  }

  try {
    const { data, error } = await resend.emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      ...(text && { text }),
      ...(replyTo && { replyTo }),
    })

    if (error) {
      console.error('[Resend Error]', error)
      return { success: false, error: error.message }
    }

    return { success: true, messageId: data?.id }
  } catch (err) {
    console.error('[Email Send Error]', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }
}

/**
 * Send notification email for lottery selection
 */
export async function sendLotteryWinnerEmail(to: string, campaignTitle: string, userName: string) {
  return sendEmail({
    to,
    subject: `🎉 ${campaignTitle} 당첨을 축하드립니다!`,
    html: `
      <div style="font-family: 'Noto Sans KR', sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a1a1a; font-size: 24px;">${userName}님, 당첨되셨습니다!</h1>
        <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">
          <strong>${campaignTitle}</strong> 추첨 결과, ${userName}님께서 당첨되셨습니다.
        </p>
        <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">
          마이페이지에서 당첨 내역을 확인하시고 예매 안내를 확인해주세요.
        </p>
        <a href="https://artause.co.kr/my" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 4px;">
          마이페이지 바로가기
        </a>
        <p style="color: #888; font-size: 14px; margin-top: 40px;">
          이 메일은 Artause에서 자동으로 발송되었습니다.
        </p>
      </div>
    `,
  })
}

/**
 * Send campaign approval notification to partner
 */
export async function sendCampaignApprovalEmail(to: string, campaignTitle: string, partnerName: string) {
  return sendEmail({
    to,
    subject: `✅ ${campaignTitle} 캠페인이 승인되었습니다`,
    html: `
      <div style="font-family: 'Noto Sans KR', sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a1a1a; font-size: 24px;">${partnerName}님, 캠페인이 승인되었습니다</h1>
        <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">
          <strong>${campaignTitle}</strong> 캠페인이 관리자 검토를 통과하여 공개되었습니다.
        </p>
        <a href="https://artause.co.kr/event-center" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 4px;">
          캠페인 대시보드 보기
        </a>
      </div>
    `,
  })
}
