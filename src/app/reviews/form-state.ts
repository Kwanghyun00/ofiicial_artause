export interface ReviewFormState {
  status: "idle" | "success" | "error" | "verified" | "unverified"
  message?: string
  reviewId?: string
  verifiedAttendance?: boolean
  reservationId?: string | null
}

export const reviewInitialState: ReviewFormState = { status: "idle" }
