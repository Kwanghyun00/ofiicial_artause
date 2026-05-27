'use server'

import { revalidatePath } from 'next/cache'
import { submitTicketEntry } from '@/lib/supabase/queries'
import { isSupabaseConfigured } from '@/lib/config'
import { createAdminSupabaseClient, createServerSupabaseClient } from '@/lib/supabase/server'

interface EntryEmailPayload {
  applicantEmail: string
  applicantName: string
  campaignTitle: string
  campaignSlug: string
  submittedAt: string
}

async function sendEntryConfirmationEmail(payload: EntryEmailPayload): Promise<void> {
  const resendApiKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.EMAIL_FROM ?? 'noreply@artause.co.kr'
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://artause.co.kr'

  const submittedDate = new Date(payload.submittedAt).toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const resultUrl = `${siteUrl}/invites/${payload.campaignSlug}`

  const html = `
<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8" /><title>초대권 신청 확인</title></head>
<body style="font-family: 'Apple SD Gothic Neo', sans-serif; background: #f9f9f9; margin: 0; padding: 0;">
  <div style="max-width: 560px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08);">
    <div style="background: #1a1a2e; padding: 32px 40px;">
      <p style="color: #a78bfa; font-size: 13px; letter-spacing: 0.08em; margin: 0 0 8px;">ARTAUSE</p>
      <h1 style="color: #ffffff; font-size: 22px; font-weight: 700; margin: 0;">초대권 신청이 완료되었습니다</h1>
    </div>
    <div style="padding: 32px 40px;">
      <p style="color: #374151; font-size: 15px; line-height: 1.7; margin: 0 0 24px;">
        안녕하세요, <strong>${payload.applicantName}</strong>님.<br />
        아래 공연 초대권 이벤트 신청이 정상적으로 접수되었습니다.
      </p>
      <div style="background: #f3f4f6; border-radius: 8px; padding: 20px 24px; margin-bottom: 24px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #374151;">
          <tr>
            <td style="padding: 6px 0; color: #6b7280; width: 90px;">공연명</td>
            <td style="padding: 6px 0; font-weight: 600;">${payload.campaignTitle}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280;">신청 일시</td>
            <td style="padding: 6px 0;">${submittedDate}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280;">신청 이메일</td>
            <td style="padding: 6px 0;">${payload.applicantEmail}</td>
          </tr>
        </table>
      </div>
      <p style="color: #6b7280; font-size: 14px; line-height: 1.7; margin: 0 0 24px;">
        추첨 결과는 이벤트 마감 후 이메일로 별도 안내됩니다.<br />
        당첨 여부는 아래 버튼을 통해 직접 확인하실 수도 있습니다.
      </p>
      <a href="${resultUrl}" style="display: inline-block; background: #7c3aed; color: #fff; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 9999px;">결과 확인하기</a>
    </div>
    <div style="padding: 20px 40px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af;">
      본 메일은 발신 전용입니다. 문의는 artause.co.kr을 통해 주세요.
    </div>
  </div>
</body>
</html>
`

  if (resendApiKey) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [payload.applicantEmail],
        subject: `[알터즈] ${payload.campaignTitle} 초대권 신청 완료`,
        html,
      }),
    })
    if (!res.ok) {
      const body = await res.text()
      throw new Error(`Resend API error ${res.status}: ${body}`)
    }
    return
  }

  // Supabase Edge Function fallback
  if (isSupabaseConfigured) {
    const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createAdminSupabaseClient()
      : await createServerSupabaseClient()
    const { error } = await supabase.functions.invoke('send-email', {
      body: {
        to: payload.applicantEmail,
        subject: `[알터즈] ${payload.campaignTitle} 초대권 신청 완료`,
        html,
      },
    })
    if (error) throw error
    return
  }

  // mock mode
  console.info('[Mock] Entry confirmation email would be sent to:', payload.applicantEmail, payload.campaignTitle)
}

export async function submitInviteEntry(
  campaignId: string,
  campaignSlug: string,
  campaignTitle: string,
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  const applicantName = (formData.get('applicantName') as string | null)?.trim() ?? ''
  const applicantEmail = (formData.get('applicantEmail') as string | null)?.trim().toLowerCase() ?? ''
  const applicantPhone = (formData.get('applicantPhone') as string | null)?.trim() || null
  const consentMarketing = formData.get('consentMarketing') === 'on'

  if (!applicantName || !applicantEmail) {
    return { success: false, error: '이름과 이메일은 필수 항목입니다.' }
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailPattern.test(applicantEmail)) {
    return { success: false, error: '올바른 이메일 주소를 입력해주세요.' }
  }

  const submittedAt = new Date().toISOString()

  try {
    // contactHash: 중복 신청 방지용 식별자 (이메일 기반 간이 해시)
    const contactHash = Buffer.from(applicantEmail.toLowerCase().trim()).toString('base64')
    await submitTicketEntry({
      campaignId,
      contactHash,
      metadata: {
        applicantName,
        email: applicantEmail,
        phone: applicantPhone,
        consentMarketing,
        answers: null,
      },
    })
  } catch (err) {
    // 중복 신청 (unique violation 23505)
    if (err && typeof err === 'object' && 'code' in err && (err as { code: string }).code === '23505') {
      return { success: false, error: '이미 신청하셨습니다. 이 이메일로는 해당 이벤트에 중복 신청할 수 없습니다.' }
    }
    console.error('submitInviteEntry: ticket entry failed', err)
    return { success: false, error: '신청 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' }
  }

  // 이메일 발송 실패가 신청 트랜잭션을 롤백하지 않도록 분리
  try {
    await sendEntryConfirmationEmail({
      applicantEmail,
      applicantName,
      campaignTitle,
      campaignSlug,
      submittedAt,
    })
  } catch (emailErr) {
    console.error('submitInviteEntry: confirmation email failed (non-fatal)', emailErr)
  }

  revalidatePath(`/invites/${campaignSlug}`)

  return { success: true }
}
