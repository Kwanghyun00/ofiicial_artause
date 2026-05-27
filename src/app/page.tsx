import type { Metadata } from "next"
import {
  FeaturedInvitations,
  HomeHero,
  HomeDidPopup,
  PerformanceShowcase,
  TestimonialsSection,
  CallToAction,
} from "@/components/home/sections"
import { PersonalizedSection } from "@/components/home/PersonalizedSection"
import { Reveal } from "@/components/motion/Reveal"
import type { Campaign, Show } from "@/components/home/types"
import { buildActiveCampaignSlugMap, isCampaignActiveNow } from "@/lib/campaigns"
import { getRecentReviews, getShowsPerformances, getTicketCampaigns } from "@/lib/supabase/queries"

type RawCampaign = Awaited<ReturnType<typeof getTicketCampaigns>>[number]
type RawPerformance = Awaited<ReturnType<typeof getShowsPerformances>>[number]

export const metadata: Metadata = {
  title: "공연 탐색 · 초대권 이벤트",
  description:
    "연극·뮤지컬·클래식 공연을 직접 찾아보고, 연결된 초대권 이벤트가 있으면 바로 응모하세요.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "알터즈 | 공연 탐색 · 초대권 이벤트",
    description:
      "공연을 먼저 탐색하고 초대권 이벤트까지 이어지는 공연 발견 플랫폼.",
    url: "/",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "알터즈 | 공연 탐색 · 초대권 이벤트",
    description:
      "공연을 먼저 탐색하고 초대권 이벤트까지 이어지는 공연 발견 플랫폼.",
  },
}

const isCampaignRecord = (record: RawCampaign): record is RawCampaign & { id: string; title: string } =>
  Boolean(record && typeof record === "object" && "id" in record && "title" in record)

const isPerformanceRecord = (
  record: RawPerformance
): record is RawPerformance & { id: string; title: string } =>
  Boolean(record && typeof record === "object" && "id" in record && "title" in record)

export default async function HomePage() {
  const [campaignRecords, performanceRecords, recentReviews] = await Promise.all([
    getTicketCampaigns(),
    getShowsPerformances(),
    getRecentReviews({ limit: 3 }),
  ])

  const campaigns = campaignRecords.filter(isCampaignRecord).map(normalizeCampaign)
  const performances = performanceRecords.filter(isPerformanceRecord)
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now()
  const campaignByPerformanceId = buildActiveCampaignSlugMap(campaignRecords, now)

  const activeCampaigns = campaigns.filter((campaign) => isCampaignActiveNow(campaign, now))
  const featuredCampaign = activeCampaigns[0]
  const featuredCampaigns = activeCampaigns.slice(0, 12)

  const visibleShows = performances.filter((performance) => isDiscoverableShow(performance, now))
  const showcaseShows = (visibleShows.length > 0 ? visibleShows : performances)
    .slice(0, 6)
    .map((performance) => normalizeShow(performance, campaignByPerformanceId[performance.id] ?? null))

  const heroStats = createHeroStats(campaigns)

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "알터즈",
    url: "https://artause.co.kr",
    logo: "https://artause.co.kr/images/brand/artause-symbol.png",
    description: "공연을 먼저 탐색하고 초대권 이벤트까지 이어지는 공연 발견 플랫폼",
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
        <HomeHero
          totalCampaigns={heroStats.totalCampaigns}
          activeCampaigns={heroStats.activeCampaigns}
          liveApplicants={heroStats.liveApplicants}
          nextDeadline={heroStats.nextDeadline}
          featuredCampaign={featuredCampaign}
        />
      </Reveal>

      {/* 구분선 */}
      <div className="stage-divider mx-auto max-w-7xl" />

      {/* 공연 쇼케이스 */}
      <Reveal>
        <PerformanceShowcase shows={showcaseShows} />
      </Reveal>

      {/* 구분선 */}
      <div className="stage-divider mx-auto max-w-7xl" />

      {/* 초대권 이벤트 */}
      <Reveal>
        <FeaturedInvitations campaigns={featuredCampaigns} />
      </Reveal>

      {/* 구분선 */}
      <div className="stage-divider mx-auto max-w-7xl" />

      {/* 취향 기반 개인화 추천 */}
      <Reveal>
        <PersonalizedSection campaigns={featuredCampaigns} />
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

function normalizeCampaign(record: RawCampaign): Campaign {
  const campaign = record as RawCampaign & {
    slug?: string | null
    description?: string | null
    one_line_intro?: string | null
    poster_image?: string | null
    reward?: string | null
    starts_at?: string | null
    ends_at?: string | null
    entry_count?: number | null
  }

  return {
    id: campaign.id ?? "",
    slug: campaign.slug ?? null,
    title: campaign.title ?? "",
    description: campaign.description ?? null,
    one_line_intro: campaign.one_line_intro ?? null,
    poster_image: campaign.poster_image ?? null,
    reward: campaign.reward ?? null,
    starts_at: campaign.starts_at ?? null,
    ends_at: campaign.ends_at ?? null,
    entry_count: campaign.entry_count ?? null,
  }
}

function normalizeShow(record: RawPerformance & { id: string; title: string }, campaignSlug: string | null): Show {
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
    campaign_slug: campaignSlug,
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

function createHeroStats(campaigns: Campaign[]) {
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now()
  const totalCampaigns = campaigns.length
  const activeCampaigns = campaigns.filter((campaign) => isCampaignActiveNow(campaign, now)).length
  const liveApplicants = campaigns.reduce((total, campaign) => total + (campaign.entry_count ?? 0), 0)

  const upcomingDeadline = campaigns
    .map((campaign) => (campaign.ends_at ? new Date(campaign.ends_at).getTime() : null))
    .filter((timestamp): timestamp is number => timestamp !== null && Number.isFinite(timestamp) && timestamp > now)
    .sort((a, b) => a - b)[0]

  return {
    totalCampaigns,
    activeCampaigns,
    liveApplicants,
    nextDeadline: upcomingDeadline ? formatDeadline(upcomingDeadline) : undefined,
  }
}

function formatDeadline(timestamp: number) {
  return new Date(timestamp).toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
  })
}
