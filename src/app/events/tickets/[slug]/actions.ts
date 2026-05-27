"use server";

import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { submitTicketEntry } from "@/lib/supabase/queries";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/config";
import type { TicketEntryPayload } from "@/lib/models/ticket-entry";
import type { TicketEntryFormState } from "./form-state";

function hashContact(email: string, phone?: string | null) {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPhone = typeof phone === "string" ? phone.replace(/\D/g, "") : "";
  const source = `${normalizedEmail}|${normalizedPhone}`;
  return createHash("sha256").update(source).digest("hex");
}

export async function submitTicketEntryAction(
  _prevState: TicketEntryFormState,
  formData: FormData,
): Promise<TicketEntryFormState> {
  const campaignId = formData.get("campaignId");
  const slug = formData.get("slug");
  const applicantName = formData.get("applicantName");
  const applicantEmail = formData.get("applicantEmail");
  const applicantPhone = formData.get("applicantPhone");
  const instagramHandle = formData.get("instagramHandle");
  const reviewUrl = formData.get("reviewUrl");
  const preferredDate = formData.get("preferredDate");
  const ticketCount = formData.get("ticketCount");
  const expectation = formData.get("expectation");
  // TODO: ADGATE_RESTORE — adSessionId 필드 복원 시 아래 주석 해제
  // const adSessionId = formData.get("adSessionId");
  const consentMarketing = formData.get("consentMarketing") === "on";
  const rulesAgreed = formData.get("rulesAgreed") === "on";

  // 기본 검증
  if (typeof campaignId !== "string" || !campaignId) {
    return { status: "error", message: "캠페인 정보를 확인해 주세요." };
  }
  if (typeof applicantName !== "string" || !applicantName.trim()) {
    return { status: "error", message: "이름을 입력해 주세요." };
  }
  if (typeof applicantEmail !== "string" || !applicantEmail.trim()) {
    return { status: "error", message: "이메일을 입력해 주세요." };
  }
  if (typeof applicantPhone !== "string" || !applicantPhone.trim()) {
    return { status: "error", message: "전화번호를 입력해 주세요." };
  }
  if (typeof instagramHandle !== "string" || !instagramHandle.trim()) {
    return { status: "error", message: "인스타그램 아이디를 입력해 주세요." };
  }
  if (typeof reviewUrl !== "string" || !reviewUrl.trim()) {
    return { status: "error", message: "후기를 남길 SNS 주소를 입력해 주세요." };
  }
  if (typeof preferredDate !== "string" || !preferredDate.trim()) {
    return { status: "error", message: "희망 관람일자를 선택해 주세요." };
  }
  if (typeof ticketCount !== "string" || !ticketCount.trim()) {
    return { status: "error", message: "매수를 선택해 주세요." };
  }
  if (!["1", "2"].includes(ticketCount.trim())) {
    return { status: "error", message: "일반 관람권 1매 또는 2매만 선택할 수 있습니다." };
  }
  // TODO: ADGATE_RESTORE — adSessionId 검증 비활성화 (광고 계정 준비 후 복원)
  // if (typeof adSessionId !== "string" || !adSessionId.trim()) {
  //   return { status: "error", message: "광고 시청 완료 후 응모할 수 있습니다." };
  // }
  // const normalizedAdSessionId = adSessionId.trim();
  // if (!/^rw_[a-z0-9_-]{10,}$/i.test(normalizedAdSessionId)) {
  //   return { status: "error", message: "광고 인증 정보가 올바르지 않습니다. 다시 시도해 주세요." };
  // }

  // 규칙 동의 확인 (필수)
  if (!rulesAgreed) {
    return { status: "error", message: "이용 규칙에 동의해주세요." };
  }

  // Trust Score 체크 (Supabase 설정된 경우에만)
  if (isSupabaseConfigured) {
    try {
      const supabase = await createServerSupabaseClient();

      // 이메일로 사용자 조회
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: user }: any = (await supabase
        .from("users")
        .select("id, trust_score, is_restricted, restriction_reason")
        .eq("email", applicantEmail.trim().toLowerCase())
        .maybeSingle());

      // 사용자가 존재하고 제한된 경우
      if (user) {
        if (user.is_restricted) {
          return {
            status: "error",
            message: `응모가 제한되었습니다. 사유: ${user.restriction_reason || "신뢰도 점수 부족"}`,
          };
        }

        if (user.trust_score < 60) {
          return {
            status: "error",
            message: `신뢰도 점수가 낮아 응모할 수 없습니다. (현재: ${user.trust_score}점, 필요: 60점 이상)`,
          };
        }

        // 활성 패널티 확인
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { count: activePenalties }: any = (await supabase
          .from("user_penalties")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .gt("expires_at", new Date().toISOString()));

        if (activePenalties && activePenalties >= 3) {
          return {
            status: "error",
            message: `활성 패널티가 너무 많습니다. (${activePenalties}건) 패널티 만료 후 다시 시도해주세요.`,
          };
        }
      }
    } catch (error) {
      console.error("Trust score check error:", error);
      // Trust score 체크 실패 시 계속 진행 (DB 오류로 정상 사용자 차단 방지)
    }
  }

  const answers: Record<string, string> = {};

  // 필수 필드들
  const trimmedInstagram = instagramHandle.trim();
  answers.instagramHandle = trimmedInstagram.startsWith("@") ? trimmedInstagram : `@${trimmedInstagram}`;
  answers.reviewUrl = reviewUrl.trim();
  answers.preferredDate = preferredDate.trim();
  answers.ticketCount = ticketCount.trim();
  answers.ticketType = "일반 관람권";

  // 선택 필드들
  if (typeof expectation === "string" && expectation.trim()) {
    answers.expectation = expectation.trim();
  }

  const contactHash = hashContact(applicantEmail, applicantPhone);

  const metadata = {
    applicantName: applicantName.trim(),
    email: applicantEmail.trim(),
    consentMarketing,
    phone: applicantPhone.trim(),
    answers: answers,
  } satisfies TicketEntryPayload["metadata"];

  const payload: TicketEntryPayload = {
    campaignId,
    contactHash,
    adSessionId: "", // TODO: ADGATE_RESTORE — normalizedAdSessionId 로 교체
    metadata,
  };

  try {
    await submitTicketEntry(payload);
    // entry_count가 표시되는 모든 페이지 캐시 갱신
    if (typeof slug === "string" && slug) {
      revalidatePath(`/events/${slug}`);
    }
    revalidatePath("/events");
    revalidatePath("/shows");
    revalidatePath("/");
    return { status: "success", message: "응모가 완료되었습니다. 선정 결과는 이메일로 안내드릴게요." };
  } catch (error) {
    // PostgreSQL unique violation → 중복 신청
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code: string }).code === "23505"
    ) {
      return {
        status: "duplicate",
        message: "이미 신청하셨습니다. 이 이메일로는 해당 이벤트에 중복 신청할 수 없습니다.",
      };
    }
    console.error("submitTicketEntryAction error", error);
    return { status: "error", message: "일시적인 문제가 발생했습니다. 잠시 후 다시 시도해 주세요." };
  }
}
