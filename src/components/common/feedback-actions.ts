// @ts-nocheck
"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/config";
import { headers } from "next/headers";

type FeedbackType = "bug" | "feature" | "improvement" | "question" | "other";

type SubmitFeedbackPayload = {
  type: FeedbackType;
  title: string;
  description: string;
  authorName: string | null;
  authorEmail: string | null;
};

type ActionResult =
  | { success: true }
  | { success: false; error: string };

/**
 * 피드백 제출
 */
export async function submitFeedback(
  payload: SubmitFeedbackPayload
): Promise<ActionResult> {
  // 1. 입력값 검증
  if (!payload.title.trim() || !payload.description.trim()) {
    return {
      success: false,
      error: "제목과 내용을 입력해주세요.",
    };
  }

  // 2. Mock 모드 처리
  if (!isSupabaseConfigured) {
    console.info("[Mock Mode] 피드백 제출:", payload);
    return { success: true };
  }

  try {
    const supabase = await createServerSupabaseClient();
    const headersList = await headers();

    // 페이지 정보 수집
    const referer = headersList.get("referer") || null;
    const userAgent = headersList.get("user-agent") || null;

    // 3. 피드백 저장
    // @ts-ignore - feedback table not in types yet
    const { error } = await supabase.from("feedback").insert({
      type: payload.type,
      title: payload.title,
      description: payload.description,
      author_name: payload.authorName,
      author_email: payload.authorEmail,
      author_role: "anonymous", // 향후 로그인 시스템과 연동 가능
      page_url: referer,
      user_agent: userAgent,
      status: "new",
      priority: "medium",
    });

    if (error) {
      console.error("Feedback submission error:", error);
      return {
        success: false,
        error: "피드백 제출에 실패했습니다.",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected error in submitFeedback:", error);
    return {
      success: false,
      error: "서버 오류가 발생했습니다.",
    };
  }
}

/**
 * 관리자용: 모든 피드백 조회
 */
export async function getAllFeedback() {
  if (!isSupabaseConfigured) {
    return [];
  }

  try {
    const supabase = await createServerSupabaseClient();

    // @ts-ignore - feedback table not in types yet
    const { data, error } = await supabase
      .from("feedback")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching feedback:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Unexpected error in getAllFeedback:", error);
    return [];
  }
}

/**
 * 관리자용: 피드백 상태 업데이트
 */
export async function updateFeedbackStatus(
  feedbackId: string,
  status: "new" | "in_review" | "planned" | "completed" | "rejected",
  adminNotes?: string
): Promise<ActionResult> {
  if (!isSupabaseConfigured) {
    console.info("[Mock Mode] 피드백 상태 업데이트:", feedbackId, status);
    return { success: true };
  }

  try {
    const supabase = await createServerSupabaseClient();

    const updateData: Record<string, unknown> = {
      status,
      reviewed_at: new Date().toISOString(),
    };

    if (adminNotes) {
      updateData.admin_notes = adminNotes;
    }

    // @ts-ignore - feedback table not in types yet
    const { error } = await supabase
      .from("feedback")
      .update(updateData)
      .eq("id", feedbackId);

    if (error) {
      console.error("Feedback status update error:", error);
      return {
        success: false,
        error: "상태 업데이트에 실패했습니다.",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected error in updateFeedbackStatus:", error);
    return {
      success: false,
      error: "서버 오류가 발생했습니다.",
    };
  }
}
