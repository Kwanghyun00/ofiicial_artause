"use server"

import { createAdminSupabaseClient } from "@/lib/supabase/server"

type ConfirmResult = { ok: boolean; qrToken?: string; error?: string }

export async function confirmAttendance({
  entryId,
  token,
  confirmedDate,
  confirmedTime,
}: {
  entryId: string
  token: string
  confirmedDate: string
  confirmedTime: string
}): Promise<ConfirmResult> {
  const supabase = createAdminSupabaseClient()

  // 토큰 재검증
  const { data: entry } = await supabase
    .from("ticket_entries")
    .select("id, confirm_token, confirm_token_exp, confirmed_at, qr_token, applicant_name, applicant_email, campaign_id")
    .eq("id", entryId)
    .eq("confirm_token", token)
    .maybeSingle()

  if (!entry) return { ok: false, error: "유효하지 않은 링크입니다." }
  if (entry.confirmed_at) return { ok: true, qrToken: entry.qr_token ?? undefined }
  if (entry.confirm_token_exp && new Date(entry.confirm_token_exp) < new Date()) {
    return { ok: false, error: "링크가 만료되었습니다." }
  }

  const { error } = await supabase
    .from("ticket_entries")
    .update({
      confirmed_at: new Date().toISOString(),
      confirmed_date: confirmedDate,
      confirmed_time: confirmedTime,
    })
    .eq("id", entryId)

  if (error) return { ok: false, error: "처리 중 오류가 발생했습니다." }

  // 캠페인 정보 조회
  const { data: campaign } = await supabase
    .from("ticket_campaigns")
    .select("title, slug, required_review_platforms, review_deadline_days, venue_name, venue_address")
    .eq("id", entry.campaign_id)
    .maybeSingle()

  // 확정 이메일 큐에 추가
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from("notifications") as any).insert({
    template: "entry_confirmed",
    state: "queued",
    payload: {
      email: entry.applicant_email,
      applicantName: entry.applicant_name,
      showTitle: campaign?.title ?? "",
      campaignSlug: campaign?.slug ?? "",
      qrToken: entry.qr_token,
      confirmedDate,
      confirmedTime,
      venue: campaign?.venue_name ?? "",
      requiredPlatforms: campaign?.required_review_platforms ?? ["instagram"],
      reviewDeadlineDays: campaign?.review_deadline_days ?? 7,
    },
    deliver_at: new Date().toISOString(),
  })

  return { ok: true, qrToken: entry.qr_token ?? undefined }
}

export async function declineAttendance({
  entryId,
  token,
}: {
  entryId: string
  token: string
}): Promise<{ ok: boolean; error?: string }> {
  const supabase = createAdminSupabaseClient()

  const { data: entry } = await supabase
    .from("ticket_entries")
    .select("id, confirm_token, confirm_token_exp, declined_at")
    .eq("id", entryId)
    .eq("confirm_token", token)
    .maybeSingle()

  if (!entry) return { ok: false, error: "유효하지 않은 링크입니다." }
  if (entry.declined_at) return { ok: true }

  const { error } = await supabase
    .from("ticket_entries")
    .update({
      declined_at: new Date().toISOString(),
      selection_status: "declined" as const,
    })
    .eq("id", entryId)

  if (error) return { ok: false, error: "처리 중 오류가 발생했습니다." }

  return { ok: true }
}
