export type ReviewFormState =
  | { status: 'idle' }
  | { status: 'error'; message: string }
  | { status: 'verified'; message: string; verifiedAttendance: true; reservationId: string | null }
  | { status: 'unverified'; message: string; verifiedAttendance: false; reservationId: null }
  | { status: 'success'; message: string; reviewId?: string }

export const reviewInitialState: ReviewFormState = { status: 'idle' }
