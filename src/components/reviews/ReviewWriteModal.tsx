"use client"

import { useActionState, useState } from "react"
import { X, BadgeCheck, AlertCircle } from "lucide-react"
import { useFormStatus } from "react-dom"
import { StarRating } from "./StarRating"
import { checkVerificationAction, submitReviewAction } from "@/app/reviews/actions"
import { reviewInitialState } from "@/app/reviews/form-state"

const AVAILABLE_TAGS = [
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

interface ReviewWriteModalProps {
  performanceId: string
  performanceSlug: string
  onClose: () => void
}

export function ReviewWriteModal({
  performanceId,
  performanceSlug,
  onClose,
}: ReviewWriteModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1)

  // Step 1 상태: 이름/이메일 (Step 3 hidden input에 전달하기 위해 관리)
  const [authorName, setAuthorName] = useState("")
  const [authorEmail, setAuthorEmail] = useState("")

  // Step 1: 본인 확인
  const [verifyState, verifyAction] = useActionState(checkVerificationAction, reviewInitialState)

  // Step 2: 별점 상태
  const [ratingOverall, setRatingOverall] = useState(0)
  const [ratingActing, setRatingActing] = useState(0)
  const [ratingDirection, setRatingDirection] = useState(0)
  const [ratingImmersion, setRatingImmersion] = useState(0)

  // Step 3: 콘텐츠 상태
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [spoilerFlag, setSpoilerFlag] = useState(false)

  // 최종 제출
  const [submitState, submitAction] = useActionState(submitReviewAction, reviewInitialState)

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const handleVerifyFormAction = async (formData: FormData) => {
    await verifyAction(formData)
  }

  const canProceedFromStep1 =
    verifyState.status === "verified" || verifyState.status === "unverified"

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-border/70 bg-card/95 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(255,210,140,0.16),_transparent_60%)] px-6 py-5 border-b border-border/40">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">
                Review
              </p>
              <h2 className="text-xl font-bold text-foreground">후기 작성</h2>
              <p className="text-xs text-muted-foreground">
                {step === 1 && "본인 확인 (선택 사항)"}
                {step === 2 && "공연 별점 평가"}
                {step === 3 && "상세 후기 작성"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((s) => (
                <span
                  key={s}
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                    s === step
                      ? "bg-primary text-primary-foreground"
                      : s < step
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {s}
                </span>
              ))}
            </div>
            <button
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background/60 text-muted-foreground transition hover:border-primary hover:text-primary"
              aria-label="닫기"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Step 1: 본인 확인 */}
        {step === 1 && (
          <form action={handleVerifyFormAction} className="space-y-5 p-6">
            <input type="hidden" name="performance_id" value={performanceId} />
            <p className="text-sm text-muted-foreground">
              아르타우스 초대권으로 관람하셨다면 이메일로 예매 인증 배지를 받을 수 있습니다.
              건너뛰기도 가능합니다.
            </p>

            <div className="space-y-2">
              <label htmlFor="review-name" className="text-sm font-semibold text-foreground">
                이름 <span className="text-rose-500">*</span>
              </label>
              <input
                id="review-name"
                type="text"
                name="author_name"
                required
                placeholder="홍길동"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full rounded-2xl border border-border bg-background/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="review-email" className="text-sm font-semibold text-foreground">
                이메일 <span className="text-rose-500">*</span>
              </label>
              <input
                id="review-email"
                type="email"
                name="email"
                required
                placeholder="example@email.com"
                value={authorEmail}
                onChange={(e) => setAuthorEmail(e.target.value)}
                className="w-full rounded-2xl border border-border bg-background/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
              />
            </div>

            {verifyState.status === "verified" && (
              <div className="flex items-center gap-2 rounded-2xl border border-emerald-400/40 bg-emerald-500/10 p-3 text-sm text-emerald-600">
                <BadgeCheck className="h-4 w-4 flex-shrink-0" />
                {verifyState.message}
              </div>
            )}
            {verifyState.status === "unverified" && (
              <div className="rounded-2xl border border-amber-300/40 bg-amber-500/5 p-3 text-sm text-amber-700">
                {verifyState.message}
              </div>
            )}
            {verifyState.status === "error" && (
              <div className="flex items-center gap-2 rounded-2xl border border-rose-400/40 bg-rose-500/10 p-3 text-sm text-rose-600">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {verifyState.message}
              </div>
            )}

            <div className="flex gap-3">
              {canProceedFromStep1 ? (
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
                >
                  다음
                </button>
              ) : (
                <VerifySubmitButton />
              )}
              <button
                type="button"
                onClick={() => {
                  if (!authorName || !authorEmail) {
                    return
                  }
                  setStep(2)
                }}
                disabled={!authorName || !authorEmail}
                className="flex-1 rounded-2xl border border-border bg-background/60 px-4 py-3 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary disabled:opacity-40"
              >
                건너뛰기
              </button>
            </div>
          </form>
        )}

        {/* Step 2: 별점 */}
        {step === 2 && (
          <div className="space-y-6 p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">
                  종합 별점 <span className="text-rose-500">*</span>
                </label>
                <StarRating value={ratingOverall} onChange={setRatingOverall} size="lg" />
                {ratingOverall === 0 && (
                  <p className="text-xs text-muted-foreground">별점을 선택해 주세요</p>
                )}
              </div>

              <div className="space-y-3 rounded-2xl border border-border bg-muted/30 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  세부 항목 (선택)
                </p>
                {(
                  [
                    { label: "연기력", value: ratingActing, setter: setRatingActing },
                    { label: "연출", value: ratingDirection, setter: setRatingDirection },
                    { label: "몰입감", value: ratingImmersion, setter: setRatingImmersion },
                  ] as const
                ).map(({ label, value, setter }) => (
                  <div key={label} className="flex items-center justify-between gap-4">
                    <span className="w-14 text-sm text-foreground">{label}</span>
                    <StarRating value={value} onChange={setter} size="sm" />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-2xl border border-border bg-background/60 px-4 py-3 text-sm font-semibold text-foreground"
              >
                이전
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                disabled={ratingOverall === 0}
                className="flex-1 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
              >
                다음
              </button>
            </div>
          </div>
        )}

        {/* Step 3: 상세 내용 + 제출 */}
        {step === 3 && (
          <form action={submitAction} className="space-y-5 p-6">
            {/* 숨김 필드 */}
            <input type="hidden" name="performance_id" value={performanceId} />
            <input type="hidden" name="performance_slug" value={performanceSlug} />
            <input type="hidden" name="author_name" value={authorName} />
            <input type="hidden" name="author_email" value={authorEmail} />
            <input
              type="hidden"
              name="reservation_id"
              value={verifyState.reservationId ?? ""}
            />
            <input
              type="hidden"
              name="verified_attendance"
              value={String(verifyState.verifiedAttendance ?? false)}
            />
            <input type="hidden" name="rating_overall" value={String(ratingOverall)} />
            <input
              type="hidden"
              name="rating_acting"
              value={ratingActing > 0 ? String(ratingActing) : ""}
            />
            <input
              type="hidden"
              name="rating_direction"
              value={ratingDirection > 0 ? String(ratingDirection) : ""}
            />
            <input
              type="hidden"
              name="rating_immersion"
              value={ratingImmersion > 0 ? String(ratingImmersion) : ""}
            />
            {selectedTags.map((tag) => (
              <input key={tag} type="hidden" name="tags" value={tag} />
            ))}
            <input type="hidden" name="spoiler_flag" value={String(spoilerFlag)} />

            {/* 태그 선택 */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">
                키워드 태그 (선택)
              </label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                      selectedTags.includes(tag)
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* 한줄 제목 */}
            <div className="space-y-2">
              <label htmlFor="review-headline" className="text-sm font-semibold text-foreground">
                한줄 제목 (선택)
              </label>
              <input
                id="review-headline"
                type="text"
                name="review_headline"
                maxLength={80}
                placeholder="공연을 한 문장으로 표현한다면?"
                className="w-full rounded-2xl border border-border bg-background/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
              />
            </div>

            {/* 상세 후기 */}
            <div className="space-y-2">
              <label htmlFor="review-text" className="text-sm font-semibold text-foreground">
                상세 후기 (선택)
              </label>
              <textarea
                id="review-text"
                name="review_text"
                rows={4}
                maxLength={2000}
                placeholder="공연에 대한 솔직한 감상을 자유롭게 남겨주세요."
                className="w-full resize-none rounded-2xl border border-border bg-background/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
              />
            </div>

            {/* 스포일러 체크 */}
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={spoilerFlag}
                onChange={(e) => setSpoilerFlag(e.target.checked)}
                className="h-4 w-4 accent-primary rounded"
              />
              <span className="text-sm text-foreground">스포일러 포함</span>
            </label>

            {/* 상태 메시지 */}
            {submitState.status === "error" && (
              <div className="flex items-center gap-2 rounded-2xl border border-rose-400/40 bg-rose-500/10 p-3 text-sm text-rose-600">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {submitState.message}
              </div>
            )}
            {submitState.status === "success" && (
              <div className="rounded-2xl border border-emerald-400/40 bg-emerald-500/10 p-4 text-center text-sm text-emerald-600">
                <p className="font-semibold">후기가 등록되었습니다!</p>
                <p className="mt-1 text-xs">{submitState.message}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={submitState.status === "success"}
                className="rounded-2xl border border-border bg-background/60 px-4 py-3 text-sm font-semibold text-foreground disabled:opacity-40"
              >
                이전
              </button>
              {submitState.status === "success" ? (
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
                >
                  닫기
                </button>
              ) : (
                <SubmitReviewButton />
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

function VerifySubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex-1 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
    >
      {pending ? "확인 중..." : "인증 시도"}
    </button>
  )
}

function SubmitReviewButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex-1 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
    >
      {pending ? "등록 중..." : "후기 등록"}
    </button>
  )
}
