import Link from "next/link"
import { Star, ShieldCheck } from "lucide-react"
import { getReviewSummary, getReviewsByPerformance } from "@/lib/supabase/queries"
import { ReviewCard } from "./ReviewCard"
import { ReviewWriteModalTrigger } from "./ReviewWriteModalTrigger"

interface ReviewSummaryProps {
  performanceId: string
  performanceSlug: string
}

export async function ReviewSummary({ performanceId, performanceSlug }: ReviewSummaryProps) {
  const [summary, reviews] = await Promise.all([
    getReviewSummary(performanceId),
    getReviewsByPerformance(performanceId, { limit: 3 }),
  ])

  const topTags = Object.entries(summary.tagFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag]) => tag)

  return (
    <section id="reviews" className="space-y-6">
      {/* 섹션 레이블 */}
      <div className="flex items-center justify-between">
        <span className="cue">
          <Star className="h-3 w-3" />
          관람 후기
        </span>
        {summary.totalCount > 0 && (
          <Link
            href={`/reviews?performance=${performanceSlug}`}
            className="text-sm font-semibold text-primary hover:underline"
          >
            전체 {summary.totalCount}개 후기 보기 →
          </Link>
        )}
      </div>

      {summary.totalCount > 0 ? (
        <>
          {/* 요약 카드 */}
          <div className="stage-panel p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
              {/* 평균 평점 */}
              <div className="flex flex-col items-center gap-1">
                <span className="text-5xl font-bold text-foreground tabular-nums">
                  {summary.avgRating.toFixed(1)}
                </span>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= Math.round(summary.avgRating)
                          ? "fill-primary text-primary"
                          : "fill-transparent text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  {summary.totalCount}개 후기
                </span>
              </div>

              <div className="hidden h-16 w-px bg-border sm:block" />

              {/* 인증 수 + 인기 태그 */}
              <div className="flex-1 space-y-3">
                {summary.verifiedCount > 0 && (
                  <div className="flex items-center gap-2 text-sm text-emerald-600">
                    <ShieldCheck className="h-4 w-4" />
                    <span>
                      <strong>{summary.verifiedCount}명</strong>의 인증 관람 후기
                    </span>
                  </div>
                )}
                {topTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {topTags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 최신 후기 3개 */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.slice(0, 3).map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-background/60 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            아직 등록된 후기가 없습니다. 첫 번째 후기를 남겨보세요!
          </p>
        </div>
      )}

      {/* 후기 작성 CTA */}
      <ReviewWriteModalTrigger
        performanceId={performanceId}
        performanceSlug={performanceSlug}
      />
    </section>
  )
}
