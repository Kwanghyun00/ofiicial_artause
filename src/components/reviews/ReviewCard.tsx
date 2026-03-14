"use client"

import { useState, useTransition } from "react"
import { BadgeCheck, ChevronDown, ChevronUp } from "lucide-react"
import { StarRating } from "./StarRating"
import type { Review } from "@/lib/supabase/review-types"

interface ReviewCardProps {
  review: Review
  performanceName?: string
}

function formatKoreanDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function authorInitial(name: string): string {
  return name.charAt(0).toUpperCase()
}

export function ReviewCard({ review, performanceName }: ReviewCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [helpfulCount, setHelpfulCount] = useState(review.helpful_count)
  const [helpfulClicked, setHelpfulClicked] = useState(false)
  const [spoilerRevealed, setSpoilerRevealed] = useState(false)
  const [, startTransition] = useTransition()

  const hasLongText = review.review_text && review.review_text.length > 120
  const displayText =
    review.review_text && !expanded && hasLongText
      ? review.review_text.slice(0, 120) + "..."
      : review.review_text

  const handleHelpful = () => {
    if (helpfulClicked) return
    setHelpfulClicked(true)
    setHelpfulCount((c) => c + 1)
    startTransition(async () => {
      try {
        const response = await fetch("/api/reviews", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reviewId: review.id }),
        })

        if (!response.ok) {
          throw new Error(`Failed to increment helpful count: ${response.status}`)
        }
      } catch (error) {
        console.error("Failed to increment review helpful count", error)
      }
    })
  }

  return (
    <article className="spotlight-card p-5 space-y-3">
      {/* 공연명 뱃지 */}
      {performanceName && (
        <div>
          <span className="inline-block rounded-full bg-primary/10 px-3 py-0.5 text-xs font-semibold text-primary">
            {performanceName}
          </span>
        </div>
      )}

      {/* 헤더: 아바타 + 이름 + 인증 뱃지 + 날짜 + 별점 */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary flex-shrink-0">
          {authorInitial(review.author_name)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-foreground text-sm">
              {review.author_name}
            </span>
            {review.verified_attendance && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600">
                <BadgeCheck className="h-3 w-3" />
                인증 관람
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {formatKoreanDate(review.created_at)}
          </p>
        </div>
        <StarRating value={review.rating_overall} size="sm" />
      </div>

      {/* 태그 */}
      {review.tags && review.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {review.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border/60 bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* 헤드라인 */}
      {review.review_headline && (
        <p className="font-semibold text-foreground text-sm">{review.review_headline}</p>
      )}

      {/* 후기 텍스트 */}
      {review.review_text && (
        <div className="space-y-1">
          {review.spoiler_flag && !spoilerRevealed ? (
            <div className="rounded-xl border border-amber-300/40 bg-amber-500/5 p-3">
              <p className="text-xs text-amber-700 font-medium mb-2">
                스포일러가 포함된 후기입니다.
              </p>
              <button
                type="button"
                onClick={() => setSpoilerRevealed(true)}
                className="text-xs font-semibold text-primary underline"
              >
                내용 보기
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground leading-relaxed">{displayText}</p>
              {hasLongText && (
                <button
                  type="button"
                  onClick={() => setExpanded((e) => !e)}
                  className="flex items-center gap-1 text-xs font-semibold text-primary"
                >
                  {expanded ? (
                    <>
                      접기 <ChevronUp className="h-3 w-3" />
                    </>
                  ) : (
                    <>
                      더보기 <ChevronDown className="h-3 w-3" />
                    </>
                  )}
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* 도움돼요 버튼 */}
      <div className="border-t border-border/40 pt-3">
        <button
          type="button"
          onClick={handleHelpful}
          disabled={helpfulClicked}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition ${
            helpfulClicked
              ? "border-primary/40 bg-primary/5 text-primary"
              : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-primary"
          }`}
        >
          도움돼요{helpfulCount > 0 && <span>{helpfulCount}</span>}
        </button>
      </div>
    </article>
  )
}
