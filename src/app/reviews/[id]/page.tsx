import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Star, ShieldCheck, ChevronLeft } from "lucide-react"
import {
  getPerformanceBySlug,
  getReviewsByPerformance,
  getReviewSummary,
} from "@/lib/supabase/queries"
import { ReviewCard } from "@/components/reviews/ReviewCard"
import { WriteReviewFlow } from "@/components/reviews/WriteReviewFlow"
import { getPosterFallback } from "@/constants/posters"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://artause.co.kr"

// ─── Metadata ────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id: slug } = await params
  const performance = await getPerformanceBySlug(slug).catch(() => null)

  if (!performance || !("id" in performance)) {
    return { title: "리뷰 | 알터즈" }
  }

  const summary = await getReviewSummary(performance.id).catch(() => ({
    avgRating: 0,
    totalCount: 0,
    verifiedCount: 0,
    tagFrequency: {},
  }))

  const title = `${performance.title} 리뷰 | 알터즈`
  const ratingText =
    summary.totalCount > 0
      ? `평균 ${summary.avgRating.toFixed(1)}점 · ${summary.totalCount}개 후기`
      : "후기를 남겨보세요"
  const description = `${performance.title} 공연 관람 후기. ${ratingText}`
  const posterImage =
    ("poster_url" in performance && performance.poster_url)
      ? (performance.poster_url as string)
      : getPosterFallback(0)

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/reviews/${slug}`,
      images: [{ url: posterImage, alt: performance.title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [posterImage],
    },
    alternates: { canonical: `${SITE_URL}/reviews/${slug}` },
  }
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function PerformanceReviewsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: slug } = await params

  const performance = await getPerformanceBySlug(slug).catch(() => null)
  if (!performance || !("id" in performance)) notFound()

  const [summary, reviews] = await Promise.all([
    getReviewSummary(performance.id),
    getReviewsByPerformance(performance.id, { limit: 50 }),
  ])

  const title = performance.title
  const posterUrl =
    ("poster_url" in performance && performance.poster_url)
      ? (performance.poster_url as string)
      : getPosterFallback(0)

  const topTags = Object.entries(summary.tagFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([tag]) => tag)

  // JSON-LD AggregateRating
  const jsonLd =
    summary.totalCount > 0
      ? {
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: title,
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: String(summary.avgRating),
            bestRating: "5",
            worstRating: "1",
            ratingCount: String(summary.totalCount),
          },
        }
      : null

  return (
    <div className="pb-24 pt-10 text-foreground">
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        {/* 브레드크럼 */}
        <Link
          href="/reviews"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-primary"
        >
          <ChevronLeft className="h-4 w-4" />
          후기 전체보기
        </Link>

        {/* 공연 헤더 */}
        <header className="stage-panel mb-8 overflow-hidden">
          <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-start sm:gap-8 sm:p-8">
            {/* 포스터 */}
            <div className="relative h-40 w-28 shrink-0 overflow-hidden rounded-lg shadow-md sm:h-52 sm:w-36">
              <Image
                src={posterUrl}
                alt={title}
                fill
                sizes="(max-width: 640px) 112px, 144px"
                className="object-cover"
              />
            </div>

            {/* 정보 */}
            <div className="flex-1 space-y-3">
              <span className="cue">Performance Review</span>
              <h1 className="text-2xl font-bold leading-tight text-foreground sm:text-3xl">
                {title}
              </h1>

              {/* 평점 요약 */}
              {summary.totalCount > 0 ? (
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-foreground tabular-nums">
                      {summary.avgRating.toFixed(1)}
                    </span>
                    <div className="flex flex-col gap-0.5">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`h-3.5 w-3.5 ${
                              s <= Math.round(summary.avgRating)
                                ? "fill-primary text-primary"
                                : "fill-transparent text-muted-foreground/40"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {summary.totalCount}개 후기
                      </span>
                    </div>
                  </div>
                  {summary.verifiedCount > 0 && (
                    <div className="flex items-center gap-1.5 text-sm text-emerald-600">
                      <ShieldCheck className="h-4 w-4" />
                      인증 관람 {summary.verifiedCount}명
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">아직 등록된 후기가 없어요.</p>
              )}

              {/* 인기 태그 */}
              {topTags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
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

              {/* 공연 상세 링크 */}
              <Link
                href={`/shows/${slug}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition hover:text-primary"
              >
                공연 상세 보기 →
              </Link>
            </div>
          </div>
        </header>

        {/* 후기 목록 */}
        {reviews.length > 0 ? (
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">
              전체 후기 <span className="text-primary">{reviews.length}</span>개
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  performanceName={title}
                />
              ))}
            </div>
          </section>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-background/60 p-12 text-center">
            <p className="mb-2 text-base font-semibold text-foreground">
              첫 번째 후기를 남겨보세요
            </p>
            <p className="text-sm text-muted-foreground">
              관람 경험을 공유하면 다른 분들께 큰 도움이 됩니다.
            </p>
          </div>
        )}

        {/* 후기 작성 */}
        <div className="mt-10">
          <WriteReviewFlow
            preselectedPerformance={{
              id: performance.id,
              slug,
              title,
              category: ("category" in performance ? performance.category as string : undefined) ?? undefined,
            }}
          />
        </div>
      </div>
    </div>
  )
}
