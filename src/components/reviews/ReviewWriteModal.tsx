"use client"

import { useActionState, useState } from "react"
import {
  X,
  BadgeCheck,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  Star,
  ThumbsUp,
  MessageSquare,
  CheckCircle2,
} from "lucide-react"
import { useFormStatus } from "react-dom"
import { StarRating } from "./StarRating"
import { Portal } from "@/components/ui/Portal"
import { submitReviewAction } from "@/app/reviews/actions"
import { reviewInitialState } from "@/app/reviews/form-state"

/* ── 태그 그룹 ── */
const TAG_GROUPS = [
  {
    label: "🎭 이런 점이 좋았어요",
    tags: [
      { value: "감동",   label: "감동적" },
      { value: "몰입감", label: "몰입감 최고" },
      { value: "연기력", label: "배우 연기력" },
      { value: "연출",   label: "연출이 탁월" },
      { value: "음악",   label: "음악·OST" },
      { value: "무대",   label: "무대·세트" },
    ],
  },
  {
    label: "🙋 이런 분께 추천해요",
    tags: [
      { value: "연인추천",     label: "연인과 함께" },
      { value: "친구추천",     label: "친구와 함께" },
      { value: "아이추천",     label: "아이와 함께" },
      { value: "울고싶을때",   label: "울고 싶을 때" },
      { value: "기분전환",     label: "기분 전환" },
      { value: "첫관람자추천", label: "첫 관람자에게" },
    ],
  },
  {
    label: "🎫 나의 관람 상황",
    tags: [
      { value: "최초관람",     label: "첫 관람" },
      { value: "재관람",       label: "재관람" },
      { value: "원작팬",       label: "원작 팬" },
      { value: "뮤지컬입문자", label: "공연 입문자" },
    ],
  },
] as const

/* ── 작성 가이드라인 ── */
const WRITING_GUIDES = [
  { emoji: "🌟", text: "어떤 장면이 가장 기억에 남았나요?" },
  { emoji: "🎭", text: "배우의 연기, 무대 연출, 음악 중 특히 인상적인 것은?" },
  { emoji: "💬", text: "처음 보는 사람에게 이 공연을 어떻게 설명하겠어요?" },
  { emoji: "👥", text: "누구와 함께 보면 더 좋을 것 같나요?" },
  { emoji: "😢", text: "예상치 못하게 감동받은 순간이 있었나요?" },
]

/* ── 별점 레이블 ── */
const RATING_LABELS: Record<number, string> = {
  1: "별로였어요",
  2: "아쉬웠어요",
  3: "평범했어요",
  4: "좋았어요",
  5: "최고였어요!",
}

interface ReviewWriteModalProps {
  performanceId: string
  performanceSlug: string
  performanceCategory?: string
  onClose: () => void
}

export function ReviewWriteModal({
  performanceId,
  performanceSlug,
  performanceCategory,
  onClose,
}: ReviewWriteModalProps) {
  /* 단계: 1(평점·태그) → 2(블로그형 작성·제출) */
  const [step, setStep] = useState<1 | 2>(1)

  /* Step 1 */
  const [ratingOverall, setRatingOverall] = useState(0)
  const [ratingActing, setRatingActing] = useState(0)
  const [ratingDirection, setRatingDirection] = useState(0)
  const [ratingImmersion, setRatingImmersion] = useState(0)
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  /* Step 2 */
  const [reviewHeadline, setReviewHeadline] = useState("")
  const [goodPoints, setGoodPoints] = useState("")    // "좋았던 점"
  const [badPoints, setBadPoints] = useState("")      // "아쉬웠던 점"
  const [spoilerFlag, setSpoilerFlag] = useState(false)
  const [showGuide, setShowGuide] = useState(true)    // 가이드라인 토글
  const [authorName, setAuthorName] = useState("")
  const [authorEmail, setAuthorEmail] = useState("")

  const [submitState, submitAction] = useActionState(submitReviewAction, reviewInitialState)

  const toggleTag = (value: string) => {
    setSelectedTags((prev) =>
      prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value]
    )
  }

  /* 두 textarea를 서버의 review_text 하나로 합치기 */
  const buildReviewText = () => {
    const parts: string[] = []
    if (goodPoints.trim()) parts.push(`[좋았던 점]\n${goodPoints.trim()}`)
    if (badPoints.trim()) parts.push(`[아쉬웠던 점]\n${badPoints.trim()}`)
    return parts.join("\n\n")
  }

  const reviewTextValue = buildReviewText()
  const totalChars = goodPoints.length + badPoints.length

  const similarShowsHref = performanceCategory
    ? `/shows?genre=${encodeURIComponent(performanceCategory)}`
    : "/shows"

  return (
    <Portal>
    <div
      role="dialog"
      aria-modal="true"
      aria-label="후기 작성"
      className="fixed inset-0 z-[200] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-6 lg:p-8"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative flex w-full flex-col overflow-hidden rounded-t-2xl border border-border/70 bg-card shadow-2xl
          h-[92svh]
          sm:h-[88svh] sm:max-w-2xl sm:rounded-2xl
          lg:h-[82svh]"
        onMouseDown={(e) => e.stopPropagation()}
      >

        {/* ── 모달 헤더 ── */}
        <div className="flex shrink-0 items-center justify-between border-b border-border/50 bg-card px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              {[1, 2].map((s) => (
                <div key={s} className="flex items-center gap-1">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                      s === step
                        ? "bg-primary text-primary-foreground"
                        : s < step
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {s < step ? "✓" : s}
                  </span>
                  {s < 2 && <div className="h-px w-4 bg-border" />}
                </div>
              ))}
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">
                {step === 1 ? "평점 & 태그" : "후기 작성"}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {step === 1 ? "별점과 해당하는 태그를 선택해 주세요" : "공연에 대한 솔직한 감상을 남겨주세요"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:border-primary hover:text-primary"
            aria-label="닫기"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── 스크롤 영역 ── */}
        <div className="flex-1 overflow-y-auto">

          {/* ═══════════════════════════════
              STEP 1: 평점 + 태그
          ═══════════════════════════════ */}
          {step === 1 && (
            <div className="space-y-6 p-5 sm:p-6">

              {/* 종합 별점 */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <Star className="h-4 w-4 text-primary" />
                  종합 별점
                  <span className="text-destructive">*</span>
                </label>
                <div className="flex flex-col items-start gap-2">
                  <StarRating value={ratingOverall} onChange={setRatingOverall} size="lg" />
                  {ratingOverall > 0 ? (
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                      {RATING_LABELS[ratingOverall]}
                    </span>
                  ) : (
                    <p className="text-xs text-muted-foreground">별점을 선택해 주세요 (필수)</p>
                  )}
                </div>
              </div>

              {/* 세부 항목 */}
              <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground/70">
                  세부 항목 <span className="font-normal normal-case tracking-normal">(선택)</span>
                </p>
                <div className="space-y-3">
                  {(
                    [
                      { label: "연기력", value: ratingActing, setter: setRatingActing },
                      { label: "연출",   value: ratingDirection, setter: setRatingDirection },
                      { label: "몰입감", value: ratingImmersion, setter: setRatingImmersion },
                    ] as const
                  ).map(({ label, value, setter }) => (
                    <div key={label} className="flex items-center justify-between gap-4">
                      <span className="w-16 text-sm text-foreground/80">{label}</span>
                      <StarRating value={value} onChange={setter} size="sm" />
                    </div>
                  ))}
                </div>
              </div>

              {/* 태그 그룹 */}
              <div className="space-y-5">
                {TAG_GROUPS.map((group) => (
                  <div key={group.label} className="space-y-2.5">
                    <p className="text-sm font-semibold text-foreground">{group.label}</p>
                    <div className="flex flex-wrap gap-2">
                      {group.tags.map(({ value, label }) => {
                        const active = selectedTags.includes(value)
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => toggleTag(value)}
                            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all ${
                              active
                                ? "border-primary bg-primary/10 text-primary shadow-sm shadow-primary/10"
                                : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                            }`}
                          >
                            {active && <span className="mr-1 text-xs">✓</span>}
                            {label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* 선택된 태그 요약 */}
              {selectedTags.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  선택한 태그 {selectedTags.length}개 · 다음 단계에서 후기를 작성합니다
                </p>
              )}
            </div>
          )}

          {/* ═══════════════════════════════
              STEP 2: 블로그형 후기 작성
          ═══════════════════════════════ */}
          {step === 2 && (
            <div className="space-y-5 p-5 sm:p-6">

              {/* ── 작성 가이드라인 (화해 스타일) ── */}
              <div className="overflow-hidden rounded-xl border border-primary/20 bg-primary/5">
                <button
                  type="button"
                  onClick={() => setShowGuide((v) => !v)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left"
                >
                  <span className="text-sm font-semibold text-primary">
                    💡 이런 내용을 담으면 다른 관객에게 도움이 돼요
                  </span>
                  {showGuide
                    ? <ChevronUp className="h-4 w-4 text-primary/60" />
                    : <ChevronDown className="h-4 w-4 text-primary/60" />
                  }
                </button>
                {showGuide && (
                  <ul className="border-t border-primary/15 px-4 py-3 space-y-2">
                    {WRITING_GUIDES.map((g) => (
                      <li key={g.emoji} className="flex items-start gap-2 text-sm text-foreground/80">
                        <span className="shrink-0">{g.emoji}</span>
                        <span>{g.text}</span>
                      </li>
                    ))}
                    <li className="mt-2 border-t border-primary/15 pt-2 text-xs text-muted-foreground">
                      스포일러 내용은 하단의 스포일러 체크를 꼭 표시해 주세요.
                    </li>
                  </ul>
                )}
              </div>

              {/* ── 제목 (블로그 포스트 스타일) ── */}
              <div className="space-y-1.5">
                <label htmlFor="review-headline" className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  제목
                  <span className="text-xs font-normal text-muted-foreground">(선택)</span>
                </label>
                <input
                  id="review-headline"
                  type="text"
                  maxLength={80}
                  placeholder="공연을 한 문장으로 표현한다면? (예: 2시간이 5분처럼 느껴진 공연)"
                  value={reviewHeadline}
                  onChange={(e) => setReviewHeadline(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                />
                <p className="text-right text-[11px] text-muted-foreground/60">{reviewHeadline.length}/80</p>
              </div>

              {/* ── 좋았던 점 ── */}
              <div className="space-y-1.5">
                <label htmlFor="review-good" className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <ThumbsUp className="h-4 w-4 text-primary" />
                  좋았던 점
                  <span className="text-xs font-normal text-muted-foreground">(선택)</span>
                </label>
                <textarea
                  id="review-good"
                  rows={5}
                  maxLength={1000}
                  placeholder={"예) 배우들의 열연이 정말 대단했어요. 특히 주인공이 감정을 표현하는 장면에서는 눈물이 나올 것 같았어요.\n무대 세트도 굉장히 디테일했고, 조명 연출이 분위기를 완벽하게 살려줬습니다."}
                  value={goodPoints}
                  onChange={(e) => setGoodPoints(e.target.value)}
                  className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                />
                <p className="text-right text-[11px] text-muted-foreground/60">{goodPoints.length}/1000</p>
              </div>

              {/* ── 아쉬웠던 점 ── */}
              <div className="space-y-1.5">
                <label htmlFor="review-bad" className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <span className="text-base">💭</span>
                  아쉬웠던 점
                  <span className="text-xs font-normal text-muted-foreground">(선택)</span>
                </label>
                <textarea
                  id="review-bad"
                  rows={3}
                  maxLength={500}
                  placeholder={"예) 러닝타임이 좀 길게 느껴졌어요. 2막에서 흐름이 살짝 끊기는 부분이 있었습니다."}
                  value={badPoints}
                  onChange={(e) => setBadPoints(e.target.value)}
                  className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                />
                <p className="text-right text-[11px] text-muted-foreground/60">{badPoints.length}/500</p>
              </div>

              {/* ── 스포일러 & 총 글자수 ── */}
              <div className="flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={spoilerFlag}
                    onChange={(e) => setSpoilerFlag(e.target.checked)}
                    className="h-4 w-4 accent-primary"
                  />
                  <span className="text-sm text-foreground">스포일러 포함</span>
                </label>
                <span className="text-xs text-muted-foreground">총 {totalChars}자 작성</span>
              </div>

              {/* ── 구분선 ── */}
              <div className="h-px bg-border/50" />

              {/* ── 작성자 정보 ── */}
              <div className="space-y-4">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                  작성자 정보 <span className="font-normal normal-case tracking-normal text-muted-foreground/50">(모두 선택사항)</span>
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label htmlFor="review-name" className="text-sm font-medium text-foreground">
                      닉네임
                    </label>
                    <input
                      id="review-name"
                      type="text"
                      placeholder="익명의 관람객"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="review-email" className="text-sm font-medium text-foreground">
                      이메일
                    </label>
                    <input
                      id="review-email"
                      type="email"
                      placeholder="example@email.com"
                      value={authorEmail}
                      onChange={(e) => setAuthorEmail(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
                  <BadgeCheck className="h-4 w-4 shrink-0 text-emerald-500" />
                  Artause 초대권으로 관람하셨다면 이메일로 <strong className="text-foreground">인증 관람 배지</strong>를 받을 수 있습니다.
                </div>
              </div>

              {/* ── 상태 메시지 ── */}
              {submitState.status === "error" && (
                <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {submitState.message}
                </div>
              )}
              {submitState.status === "verified" && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  <BadgeCheck className="h-4 w-4 shrink-0" />
                  예매 이력이 확인되었습니다. 인증 관람 배지가 부여됩니다.
                </div>
              )}
            </div>
          )}

          {/* ── 성공 화면 ── */}
          {submitState.status === "success" && (
            <div className="flex flex-col items-center gap-5 px-6 py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle2 className="h-9 w-9 text-primary" />
              </div>
              <div className="space-y-1.5">
                <p className="text-xl font-bold text-foreground">후기가 등록되었습니다!</p>
                <p className="text-sm text-muted-foreground">
                  소중한 후기 감사해요. 다른 관람객에게 큰 도움이 됩니다.
                </p>
              </div>

              {/* 작성 내용 요약 */}
              <div className="w-full rounded-xl border border-border/60 bg-muted/20 p-4 text-left space-y-2">
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < ratingOverall ? "fill-primary text-primary" : "text-border"}`}
                    />
                  ))}
                  <span className="ml-1 text-sm font-semibold text-foreground">{RATING_LABELS[ratingOverall]}</span>
                </div>
                {selectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTags.map((t) => (
                      <span key={t} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
                {reviewHeadline && (
                  <p className="text-sm font-semibold text-foreground">&ldquo;{reviewHeadline}&rdquo;</p>
                )}
              </div>

              <div className="flex w-full flex-col gap-2">
                <a
                  href="/taste"
                  className="flex items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
                >
                  ✨ 내 공연 취향 알아보기
                </a>
                <div className="flex gap-2">
                  <a
                    href={similarShowsHref}
                    className="flex-1 rounded-full border border-border py-3 text-center text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary"
                  >
                    비슷한 공연 찾기
                  </a>
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 rounded-full border border-border py-3 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary"
                  >
                    닫기
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── 하단 고정 액션 버튼 ── */}
        {submitState.status !== "success" && (
          <div className="shrink-0 border-t border-border/50 bg-card px-5 py-4">
            {step === 1 ? (
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={ratingOverall === 0}
                className="w-full rounded-full bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-stage transition-all hover:-translate-y-px hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
                style={{ transitionTimingFunction: "var(--ease-out-expo)" }}
              >
                {ratingOverall === 0 ? "별점을 선택해 주세요" : "다음 — 후기 작성하기 →"}
              </button>
            ) : (
              /* Step 2: form action으로 제출 */
              <form action={submitAction} className="space-y-0">
                {/* 숨김 필드 전달 */}
                <input type="hidden" name="performance_id" value={performanceId} />
                <input type="hidden" name="performance_slug" value={performanceSlug} />
                <input type="hidden" name="rating_overall" value={String(ratingOverall)} />
                <input type="hidden" name="rating_acting"    value={ratingActing > 0 ? String(ratingActing) : ""} />
                <input type="hidden" name="rating_direction" value={ratingDirection > 0 ? String(ratingDirection) : ""} />
                <input type="hidden" name="rating_immersion" value={ratingImmersion > 0 ? String(ratingImmersion) : ""} />
                {selectedTags.map((t) => (
                  <input key={t} type="hidden" name="tags" value={t} />
                ))}
                <input type="hidden" name="spoiler_flag" value={String(spoilerFlag)} />
                {reviewHeadline && <input type="hidden" name="review_headline" value={reviewHeadline} />}
                {reviewTextValue && <input type="hidden" name="review_text" value={reviewTextValue} />}
                <input type="hidden" name="author_name" value={authorName} />
                <input type="hidden" name="author_email" value={authorEmail} />

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-flex h-12 items-center justify-center rounded-full border border-border px-5 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary"
                  >
                    이전
                  </button>
                  <SubmitReviewButton />
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
    </Portal>
  )
}

function SubmitReviewButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-bold text-primary-foreground shadow-stage transition-all hover:-translate-y-px hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
      style={{ transitionTimingFunction: "var(--ease-out-expo)" }}
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          등록 중...
        </>
      ) : (
        "후기 등록하기 ✦"
      )}
    </button>
  )
}
