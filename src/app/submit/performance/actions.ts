"use server";

import { revalidatePath } from "next/cache";
import { submitPerformanceSubmission } from "@/lib/supabase/queries";
import type { PerformanceSubmissionPayload } from "@/lib/models/performance-submission";

export interface PerformanceSubmissionState {
  status: "idle" | "success" | "error";
  message?: string;
}

const initialState: PerformanceSubmissionState = {
  status: "idle",
};

export function getInitialPerformanceSubmissionState(): PerformanceSubmissionState {
  return { ...initialState };
}

export async function submitPerformanceSubmissionAction(
  prevState: PerformanceSubmissionState,
  formData: FormData,
): Promise<PerformanceSubmissionState> {
  const submissionType = formData.get("submissionType");
  const organizationName = formData.get("organizationName");
  const organizationSlug = formData.get("organizationSlug");
  const organizationWebsite = formData.get("organizationWebsite");
  const contactName = formData.get("contactName");
  const contactEmail = formData.get("contactEmail");
  const contactPhone = formData.get("contactPhone");
  const performanceTitle = formData.get("performanceTitle");
  const performanceSlug = formData.get("performanceSlug");
  const performanceCategory = formData.get("performanceCategory");
  const performanceRegion = formData.get("performanceRegion");
  const performanceTagsRaw = formData.get("performanceTags");
  const periodStart = formData.get("periodStart");
  const periodEnd = formData.get("periodEnd");
  const venue = formData.get("venue");
  const synopsis = formData.get("synopsis");
  const assetsUrl = formData.get("assetsUrl");
  const additionalNotes = formData.get("additionalNotes");

  if (submissionType !== "listing" && submissionType !== "full_service") {
    return { status: "error", message: "Please choose how you would like Artause to help." };
  }
  if (typeof organizationName !== "string" || !organizationName.trim()) {
    return { status: "error", message: "Please enter the organisation name." };
  }
  if (typeof contactName !== "string" || !contactName.trim()) {
    return { status: "error", message: "Please enter the contact name." };
  }
  if (typeof contactEmail !== "string" || !contactEmail.trim()) {
    return { status: "error", message: "Please enter a contact email." };
  }
  if (typeof performanceTitle !== "string" || !performanceTitle.trim()) {
    return { status: "error", message: "Please enter the performance title." };
  }

  const parsedTags =
    typeof performanceTagsRaw === "string"
      ? performanceTagsRaw
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      : undefined;

  const payload: PerformanceSubmissionPayload = {
    submissionType,
    organizationName: organizationName.trim(),
    organizationSlug: typeof organizationSlug === "string" && organizationSlug.trim() ? organizationSlug.trim() : undefined,
    organizationWebsite:
      typeof organizationWebsite === "string" && organizationWebsite.trim() ? organizationWebsite.trim() : undefined,
    contactName: contactName.trim(),
    contactEmail: contactEmail.trim(),
    contactPhone: typeof contactPhone === "string" && contactPhone.trim() ? contactPhone.trim() : undefined,
    performanceTitle: performanceTitle.trim(),
    performanceSlug: typeof performanceSlug === "string" && performanceSlug.trim() ? performanceSlug.trim() : undefined,
    performanceCategory:
      typeof performanceCategory === "string" && performanceCategory.trim() ? performanceCategory.trim() : undefined,
    performanceRegion:
      typeof performanceRegion === "string" && performanceRegion.trim() ? performanceRegion.trim() : undefined,
    performanceTags: parsedTags && parsedTags.length ? parsedTags : undefined,
    periodStart: typeof periodStart === "string" && periodStart ? periodStart : undefined,
    periodEnd: typeof periodEnd === "string" && periodEnd ? periodEnd : undefined,
    venue: typeof venue === "string" && venue.trim() ? venue.trim() : undefined,
    synopsis: typeof synopsis === "string" && synopsis.trim() ? synopsis.trim() : undefined,
    assetsUrl: typeof assetsUrl === "string" && assetsUrl.trim() ? assetsUrl.trim() : undefined,
    additionalNotes:
      typeof additionalNotes === "string" && additionalNotes.trim() ? additionalNotes.trim() : undefined,
  };

  try {
    await submitPerformanceSubmission(payload);
    revalidatePath("/submit/performance");
    return { status: "success", message: "Submission received. Our team will review it shortly." };
  } catch (error) {
    console.error("submitPerformanceSubmissionAction error", error);
    return { status: "error", message: "Something went wrong. Please try again later." };
  }
}