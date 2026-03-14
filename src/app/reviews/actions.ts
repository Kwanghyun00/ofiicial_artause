"use server"

import { revalidatePath } from "next/cache"
import { isSupabaseConfigured } from "@/lib/config"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { checkReservationForVerification } from "@/lib/supabase/queries"
import type { ReviewInsert } from "@/lib/supabase/review-types"
import type { ReviewFormState } from "./form-state"

const ALLOWED_TAGS = [
  "감동",
  "몰입감",
  "연기력",
  "연출",
  "음악",
  "무대",
  "분위기",
  "에너지",
  "스토리",
  "배경",
  "의상",
  "감성",
] as const

export async function checkVerificationAction(
  _prevState: ReviewFormState,
  formData: FormData
): Promise<ReviewFormState> {
  const email = formData.get("email")
  const performanceId = formData.get("performance_id")

  if (typeof email !== "string" || !email.trim()) {
    return { status: "error", message: "이메일을 입력해 주세요." }
  }
  if (typeof performanceId !== "string" || !performanceId.trim()) {
    return { status: "error", message: "공연 정보를 확인할 수 없습니다." }
  }

  const { verified, reservationId } = await checkReservationForVerification(
    email.trim(),
    performanceId.trim()
  )

  if (verified) {
    return {
      status: "verified",
      message: "예매 이력이 확인되었습니다. 인증 관람 배지가 부여됩니다.",
      verifiedAttendance: true,
      reservationId,
    }
  }
  return {
    status: "unverified",
    message: "예매 이력을 찾을 수 없습니다. 미인증으로 후기를 작성할 수 있습니다.",
    verifiedAttendance: false,
    reservationId: null,
  }
}

export async function submitReviewAction(
  _prevState: ReviewFormState,
  formData: FormData
): Promise<ReviewFormState> {
  const performanceId = formData.get("performance_id")
  const performanceSlug = formData.get("performance_slug")
  const authorName = formData.get("author_name")
  const authorEmail = formData.get("author_email")
  const reservationId = formData.get("reservation_id")
  const verifiedAttendance = formData.get("verified_attendance") === "true"
  const ratingOverall = formData.get("rating_overall")
  const ratingActing = formData.get("rating_acting")
  const ratingDirection = formData.get("rating_direction")
  const ratingImmersion = formData.get("rating_immersion")
  const tagsRaw = formData.getAll("tags")
  const reviewHeadline = formData.get("review_headline")
  const reviewText = formData.get("review_text")
  const spoilerFlag = formData.get("spoiler_flag") === "true"

  if (typeof performanceId !== "string" || !performanceId.trim()) {
    return { status: "error", message: "공연 정보를 확인할 수 없습니다." }
  }
  if (typeof authorName !== "string" || !authorName.trim()) {
    return { status: "error", message: "이름을 입력해 주세요." }
  }
  if (typeof authorEmail !== "string" || !authorEmail.trim()) {
    return { status: "error", message: "이메일을 입력해 주세요." }
  }
  if (typeof ratingOverall !== "string" || !ratingOverall) {
    return { status: "error", message: "별점을 입력해 주세요." }
  }

  const ratingOverallNum = parseInt(ratingOverall, 10)
  if (isNaN(ratingOverallNum) || ratingOverallNum < 1 || ratingOverallNum > 5) {
    return { status: "error", message: "별점은 1~5 사이의 숫자여야 합니다." }
  }

  const parseOptionalRating = (val: FormDataEntryValue | null): number | null => {
    if (typeof val !== "string" || !val) return null
    const n = parseInt(val, 10)
    return !isNaN(n) && n >= 1 && n <= 5 ? n : null
  }

  const tags = tagsRaw
    .filter((t): t is string => typeof t === "string")
    .filter((t) => (ALLOWED_TAGS as readonly string[]).includes(t))

  const payload: ReviewInsert = {
    performance_id: performanceId.trim(),
    author_name: authorName.trim(),
    author_email: authorEmail.trim().toLowerCase(),
    reservation_id:
      typeof reservationId === "string" && reservationId && reservationId !== "null"
        ? reservationId
        : null,
    verified_attendance: verifiedAttendance,
    rating_overall: ratingOverallNum,
    rating_acting: parseOptionalRating(ratingActing),
    rating_direction: parseOptionalRating(ratingDirection),
    rating_immersion: parseOptionalRating(ratingImmersion),
    tags: tags.length > 0 ? tags : null,
    review_headline:
      typeof reviewHeadline === "string" && reviewHeadline.trim()
        ? reviewHeadline.trim()
        : null,
    review_text:
      typeof reviewText === "string" && reviewText.trim() ? reviewText.trim() : null,
    spoiler_flag: spoilerFlag,
    status: "published",
  }

  if (!isSupabaseConfigured) {
    console.info("Review submission received (mock mode):", payload)
    if (typeof performanceSlug === "string" && performanceSlug) {
      revalidatePath(`/performances/${performanceSlug}`)
    }
    revalidatePath("/reviews")
    return {
      status: "success",
      message: "후기가 등록되었습니다. (개발 모드)",
      reviewId: "mock-review-id",
    }
  }

  try {
    const supabase = await createServerSupabaseClient()

    // 동일 이메일+공연 중복 체크
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing } = await (supabase as any)
      .from("reviews")
      .select("id")
      .eq("performance_id", performanceId.trim())
      .eq("author_email", authorEmail.trim().toLowerCase())
      .maybeSingle()

    if (existing) {
      return { status: "error", message: "이미 이 공연에 대한 후기를 작성하셨습니다." }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("reviews")
      .insert(payload)
      .select("id")
      .single()

    if (error) {
      console.error("submitReviewAction insert error", error)
      return { status: "error", message: "후기 등록에 실패했습니다. 잠시 후 다시 시도해 주세요." }
    }

    if (typeof performanceSlug === "string" && performanceSlug) {
      revalidatePath(`/performances/${performanceSlug}`)
    }
    revalidatePath("/reviews")

    return {
      status: "success",
      message: "후기가 등록되었습니다. 감사합니다!",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      reviewId: (data as any)?.id,
    }
  } catch (err) {
    console.error("submitReviewAction exception", err)
    return { status: "error", message: "일시적인 문제가 발생했습니다. 잠시 후 다시 시도해 주세요." }
  }
}
