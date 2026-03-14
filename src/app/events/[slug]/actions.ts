"use server"

import { isSupabaseConfigured } from "@/lib/config"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export type WinnerStatus =
  | { found: false; message: string }
  | { found: true; status: "pending" | "selected" | "not_selected"; message: string; attendanceStatus?: string | null }

/**
 * 이메일로 해당 이벤트 당첨 여부를 조회합니다.
 */
export async function checkWinnerStatusAction(
  campaignId: string,
  email: string
): Promise<WinnerStatus> {
  if (!email.trim()) {
    return { found: false, message: "이메일을 입력해 주세요." }
  }

  if (!isSupabaseConfigured) {
    // Mock 모드: 테스트용 결과
    return {
      found: true,
      status: "selected",
      message: "축하합니다! 당첨되셨습니다. 안내 이메일을 확인해 주세요.",
      attendanceStatus: null,
    }
  }

  try {
    const supabase = await createServerSupabaseClient()

    const { data: entry, error } = await supabase
      .from("ticket_entries")
      .select("id, selection_status, attendance_status")
      .eq("campaign_id", campaignId)
      .eq("applicant_email", email.trim().toLowerCase())
      .maybeSingle()

    if (error) {
      console.error("checkWinnerStatusAction error", error)
      return { found: false, message: "조회 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." }
    }

    if (!entry) {
      return { found: false, message: "해당 이메일로 접수된 응모 내역이 없습니다." }
    }

    const sel = entry.selection_status

    if (sel === "selected") {
      return {
        found: true,
        status: "selected",
        message: "축하합니다! 당첨되셨습니다. 안내 이메일을 확인해 주세요.",
        attendanceStatus: entry.attendance_status,
      }
    }

    if (sel === "not_selected") {
      return {
        found: true,
        status: "not_selected",
        message: "아쉽게도 이번 이벤트에 선정되지 않으셨습니다. 다음 이벤트를 기대해 주세요!",
      }
    }

    // selection_status가 null이면 아직 추첨 전
    return {
      found: true,
      status: "pending",
      message: "응모가 정상 접수되었습니다. 추첨 후 결과를 이메일로 안내드립니다.",
    }
  } catch (err) {
    console.error("checkWinnerStatusAction exception", err)
    return { found: false, message: "일시적인 오류가 발생했습니다." }
  }
}
