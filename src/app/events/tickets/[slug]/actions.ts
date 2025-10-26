"use server";

import { revalidatePath } from "next/cache";
import { submitTicketEntry } from "@/lib/supabase/queries";
import type { TicketEntryPayload } from "@/lib/models/ticket-entry";
import type { TicketEntryFormState } from "./form-state";

export async function submitTicketEntryAction(
  prevState: TicketEntryFormState,
  formData: FormData,
): Promise<TicketEntryFormState> {
  const campaignId = formData.get("campaignId");
  const slug = formData.get("slug");
  const applicantName = formData.get("applicantName");
  const applicantEmail = formData.get("applicantEmail");
  const applicantPhone = formData.get("applicantPhone");
  const instagramHandle = formData.get("instagramHandle");
  const referralCode = formData.get("referralCode");
  const memo = formData.get("memo");
  const consentMarketing = formData.get("consentMarketing") === "on";

  if (typeof campaignId !== "string" || !campaignId) {
    return { status: "error", message: "캠페인 정보를 확인할 수 없습니다." };
  }
  if (typeof applicantName !== "string" || !applicantName.trim()) {
    return { status: "error", message: "이름을 입력해주세요." };
  }
  if (typeof applicantEmail !== "string" || !applicantEmail.trim()) {
    return { status: "error", message: "이메일을 입력해주세요." };
  }

  const answers: Record<string, string> = {};

  if (typeof instagramHandle === "string" && instagramHandle.trim()) {
    const trimmed = instagramHandle.trim();
    answers.instagramHandle = trimmed.startsWith("@") ? trimmed : `@${trimmed}`;
  }

  if (typeof referralCode === "string" && referralCode.trim()) {
    answers.referralCode = referralCode.trim();
  }

  if (typeof memo === "string" && memo.trim()) {
    answers.memo = memo.trim();
  }

  const payload: TicketEntryPayload = {
    campaignId,
    applicantName: applicantName.trim(),
    applicantEmail: applicantEmail.trim(),
    applicantPhone: typeof applicantPhone === "string" && applicantPhone.trim() ? applicantPhone.trim() : undefined,
    answers: Object.keys(answers).length ? answers : undefined,
    consentMarketing,
  };

  try {
    await submitTicketEntry(payload);
    if (typeof slug === "string" && slug) {
      revalidatePath(`/events/tickets/${slug}`);
      revalidatePath(`/events/${slug}`);
    } else {
      revalidatePath("/events/tickets");
    }
    return { status: "success", message: "응모가 접수되었습니다. 추첨 결과를 이메일과 SMS로 안내드릴게요." };
  } catch (error) {
    console.error("submitTicketEntryAction error", error);
    return { status: "error", message: "일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요." };
  }
}
