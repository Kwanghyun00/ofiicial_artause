"use server";

import { revalidatePath } from "next/cache";
import { submitTicketEntry } from "@/lib/supabase/queries";
import type { TicketEntryPayload } from "@/lib/models/ticket-entry";

export interface TicketEntryFormState {
  status: "idle" | "success" | "error";
  message?: string;
}

export const ticketEntryInitialState: TicketEntryFormState = {
  status: "idle",
};

export async function submitTicketEntryAction(
  prevState: TicketEntryFormState,
  formData: FormData,
): Promise<TicketEntryFormState> {
  const campaignId = formData.get("campaignId");
  const slug = formData.get("slug");
  const applicantName = formData.get("applicantName");
  const applicantEmail = formData.get("applicantEmail");
  const applicantPhone = formData.get("applicantPhone");
  const memo = formData.get("memo");
  const consentMarketing = formData.get("consentMarketing") === "on";

  if (typeof campaignId !== "string" || !campaignId) {
    return { status: "error", message: "캠페인 정보를 확인할 수 없습니다." };
  }
  if (typeof applicantName !== "string" || !applicantName.trim()) {
    return { status: "error", message: "이름을 입력해 주세요." };
  }
  if (typeof applicantEmail !== "string" || !applicantEmail.trim()) {
    return { status: "error", message: "이메일을 입력해 주세요." };
  }

  const payload: TicketEntryPayload = {
    campaignId,
    applicantName: applicantName.trim(),
    applicantEmail: applicantEmail.trim(),
    applicantPhone: typeof applicantPhone === "string" && applicantPhone.trim() ? applicantPhone.trim() : undefined,
    answers: typeof memo === "string" && memo.trim() ? { memo: memo.trim() } : undefined,
    consentMarketing,
  };

  try {
    await submitTicketEntry(payload);
    if (typeof slug === "string" && slug) {
      revalidatePath(`/events/tickets/${slug}`);
    } else {
      revalidatePath("/events/tickets");
    }
    return { status: "success", message: "응모가 접수되었습니다. 결과를 곧 안내드립니다." };
  } catch (error) {
    console.error("submitTicketEntryAction error", error);
    return { status: "error", message: "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." };
  }
}
