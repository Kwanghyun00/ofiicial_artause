"use server"

import { revalidatePath } from "next/cache"
import { submitTicketEntry } from "@/lib/supabase/queries"
import { getTicketCampaignBySlug } from "@/lib/supabase/queries"
import { sendInviteConfirmationEmail } from "@/lib/email/resend"
import type { TicketEntryPayload } from "@/lib/models/ticket-entry"

export async function submitInviteEntryAction(
  _prevState: { success: boolean; error?: string },
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const campaignId = formData.get("campaign_id")
  const slug = formData.get("slug")
  const applicantName = formData.get("applicant_name")
  const applicantEmail = formData.get("applicant_email")
  const applicantPhone = formData.get("applicant_phone")
  const contactHash = formData.get("contact_hash")
  const consentMarketing = formData.get("consent_marketing") === "true"

  if (typeof campaignId !== "string" || !campaignId) {
    return { success: false, error: "캠페인 정보를 확인할 수 없습니다." }
  }
  if (typeof applicantEmail !== "string" || !applicantEmail.trim()) {
    return { success: false, error: "이메일을 입력해 주세요." }
  }
  if (typeof contactHash !== "string" || !contactHash) {
    return { success: false, error: "연락처 정보가 올바르지 않습니다." }
  }

  const resolvedName =
    typeof applicantName === "string" && applicantName.trim()
      ? applicantName.trim()
      : "익명의 관람객"

  const payload: TicketEntryPayload = {
    campaignId,
    contactHash,
    metadata: {
      applicantName: resolvedName,
      email: applicantEmail.trim(),
      phone: typeof applicantPhone === "string" ? applicantPhone.trim() : null,
      consentMarketing,
    },
  }

  try {
    await submitTicketEntry(payload)
  } catch (err) {
    // 중복 신청 (unique violation 23505)
    if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "23505") {
      return { success: false, error: "이미 신청하셨습니다. 이 이메일로는 해당 이벤트에 중복 신청할 수 없습니다." }
    }
    console.error("submitInviteEntryAction submitTicketEntry error", err)
    return { success: false, error: "신청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." }
  }

  // 신청 성공 후 이메일 발송 — 실패해도 신청은 롤백되지 않음
  try {
    const campaignSlug = typeof slug === "string" && slug ? slug : campaignId
    const campaign = await getTicketCampaignBySlug(campaignSlug)

    const campaignTitle =
      campaign && "title" in campaign && typeof (campaign as { title?: unknown }).title === "string"
        ? (campaign as { title: string }).title
        : "공연 초대권"

    const venueName =
      campaign && "venue_name" in campaign
        ? ((campaign as { venue_name?: unknown }).venue_name as string | null | undefined) ?? null
        : null

    const periodStart =
      campaign && "performance_period_start" in campaign
        ? ((campaign as { performance_period_start?: unknown }).performance_period_start as string | null | undefined) ?? null
        : null

    const periodEnd =
      campaign && "performance_period_end" in campaign
        ? ((campaign as { performance_period_end?: unknown }).performance_period_end as string | null | undefined) ?? null
        : null

    const performancePeriod = formatPeriod(periodStart, periodEnd)

    await sendInviteConfirmationEmail({
      applicantName: resolvedName,
      applicantEmail: applicantEmail.trim(),
      campaignTitle,
      venueName,
      performancePeriod,
      slug: campaignSlug,
    })
  } catch (emailErr) {
    console.error("submitInviteEntryAction email error (non-fatal)", emailErr)
  }

  revalidatePath(`/invites/${typeof slug === "string" ? slug : campaignId}`)

  return { success: true }
}

function formatPeriod(start?: string | null, end?: string | null): string | null {
  if (!start && !end) return null
  const fmt = (v: string) =>
    new Date(v).toLocaleDateString("ko-KR", { month: "long", day: "numeric" })
  if (start && end) return `${fmt(start)} ~ ${fmt(end)}`
  if (start) return `${fmt(start)} ~`
  if (end) return `~ ${fmt(end!)}`
  return null
}
