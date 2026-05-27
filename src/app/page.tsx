import type { Metadata } from "next"
import {
  HomeHero,
  HomeDidPopup,
  PerformanceShowcase,
  TestimonialsSection,
  CallToAction,
} from "@/components/home/sections"
import { LatestBlogSection } from "@/components/home/LatestBlogSection"
import { SnsPicksSection } from "@/components/home/SnsPicksSection"
import { Reveal } from "@/components/motion/Reveal"
import type { Show } from "@/components/home/types"
import { getRecentReviews, getShowsPerformances, getCommunityPosts, getActiveSnsPicksWithPerformances } from "@/lib/supabase/queries"

type RawPerformance = Awaited<ReturnType<typeof getShowsPerformances>>[number]

export const metadata: Metadata = {
  title: "공연 큐레이션 · 알터즈",
  description:
    "에디터가 직접 큐레이션한 공연 에세이와 알터즈가 주목하는 공연들을 만나보세요.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "알터즈 | 공연 큐레이션",
    description:
      "SNS에서 소개한 공연부터 지금 주목할 작품까지, 알터즈 에디터가 큐레이션한 공연을 발견하세요.",
    url: "/",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "알터즈 | 공연 큐레이션",
    description:
      "SNS에서 소개한 공연부터 지금 주목할 작품까지, 알터즈 에디터가 큐레이션한 공연을 발견하세요.",
  },
}

const isPerformanceRecord = (
  record: RawPerformance
): record is RawPerformance & { id: string; title: string } =>
  Boolean(record && typeof record === "object" && "id" in record && "title" in record)

export default async function HomePage() {
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now()

  const [performanceRecords, recentReviews, latestPosts, snsPicks] = await Promise.all([
    getShowsPerformances(),
    getRecentReviews({ limit: 3 }),
    getCommunityPosts({ limit: 3 }),
    getActiveSnsPicksWithPerformances(),
  ])

  const performances = performanceRecords.filter(isPerformanceRecord)

  const visibleShows = performances.filter((performance) => isDiscoverableShow(performance, now))
  const showcaseShows = (visibleShows.length > 0 ? visibleShows : performances)
    .slice(0, 6)
    .map((performance) => normalizeShow(performance))

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "알터즈",
    url: "https://artause.co.kr",
    logo: "https://artause.co.kr/images/brand/artause-symbol.png",
    description: "에디터 큐레이션으로 공연을 발견하는 가장 좋은 방법",
    sameAs: ["https://www.instagram.com/artause_official"],
  }

  return (
    <div className="pb-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <HomeDidPopup />

      {/* Hero — 전체 너비 */}
      <Reveal>
        <HomeHero />
      </Reveal>

      {/* 구분선 */}
      <div className="stage-divider mx-auto max-w-7xl" />

      {/* 알터즈 픽 캐러셀 (SNS 에디터 픽) */}
      {snsPicks.length > 0 && (
        <Reveal>
          <SnsPicksSection picks={snsPicks} />
        </Reveal>
      )}
      {snsPicks.length > 0 && <div className="stage-divider mx-auto max-w-7xl" />}

      {/* 공연 쇼케이스 */}
      <Reveal>
        <PerformanceShowcase shows={showcaseShows} />
      </Reveal>

      {/* 구분선 */}
      <div className="stage-divider mx-auto max-w-7xl" />

      {/* 최신 블로그 에세이 */}
      <Reveal>
        <LatestBlogSection posts={latestPosts} />
      </Reveal>

      {/* 구분선 */}
      <div className="stage-divider mx-auto max-w-7xl" />

      {/* 관람 후기 */}
      <Reveal>
        <TestimonialsSection reviews={recentReviews} />
      </Reveal>

      {/* CTA — 전체 너비 */}
      <Reveal>
        <CallToAction />
      </Reveal>
    </div>
  )
}

function normalizeShow(record: RawPerformance & { id: string; title: string }): Show {
  const performance = record as RawPerformance & {
    slug?: string | null
    region?: string | null
    tags?: string[] | null
    period_start?: string | null
    period_end?: string | null
    poster_url?: string | null
    synopsis?: string | null
    description?: string | null
  }

  return {
    id: performance.id,
    slug: performance.slug ?? null,
    title: performance.title,
    region: performance.region ?? null,
    tags: performance.tags ?? null,
    period_start: performance.period_start ?? null,
    period_end: performance.period_end ?? null,
    poster_url: performance.poster_url ?? null,
    summary: performance.synopsis ?? performance.description ?? null,
    campaign_slug: null,
  }
}

function isDiscoverableShow(
  performance: RawPerformance & { id: string; title: string },
  now: number
) {
  const record = performance as {
    period_end?: string | null
  }

  if (!record.period_end) return true
  const endTime = new Date(record.period_end).getTime()
  if (Number.isNaN(endTime)) return true
  return endTime >= now
}

