import {
  FeaturedInvitations,
  HomeHero,
  HomeDidPopup,
  TestimonialsSection,
  CallToAction,
} from "@/components/home/sections"
import { Reveal } from "@/components/motion/Reveal"
import type { Campaign } from "@/components/home/types"
import { getTicketCampaigns, getRecentReviews } from "@/lib/supabase/queries"

type RawCampaign = Awaited<ReturnType<typeof getTicketCampaigns>>[number]

const isCampaignRecord = (record: RawCampaign): record is RawCampaign & { id: string; title: string } =>
  Boolean(record && typeof record === "object" && "id" in record && "title" in record)

export default async function HomePage() {
  const [campaignRecords, recentReviews] = await Promise.all([
    getTicketCampaigns(),
    getRecentReviews({ limit: 3 }),
  ])

  const campaigns = campaignRecords.filter(isCampaignRecord).map(normalizeCampaign)
  const now = Date.now()
  const activeCampaigns = campaigns.filter((c) => !c.ends_at || new Date(c.ends_at).getTime() > now)

  const heroStats = createHeroStats(campaigns)
  const featuredCampaign = activeCampaigns[0] ?? campaigns[0]
  const featuredCampaigns = activeCampaigns.slice(0, 12)

  return (
    <div className="space-y-16 pb-24 pt-12 sm:space-y-20 lg:space-y-24">
      <HomeDidPopup />

      {/* 1. Hero — 핵심 액션 3버튼 */}
      <Reveal>
        <section>
          <div className="mx-auto max-w-6xl space-y-10 px-4 sm:px-6 lg:px-8">
            <HomeHero
              totalCampaigns={heroStats.totalCampaigns}
              activeCampaigns={heroStats.activeCampaigns}
              liveApplicants={heroStats.liveApplicants}
              nextDeadline={heroStats.nextDeadline}
              featuredCampaign={featuredCampaign}
            />
          </div>
        </section>
      </Reveal>

      <section>
        <div className="mx-auto max-w-6xl space-y-12 px-4 sm:px-6 lg:px-8">
          {/* 2. 진행 중 초대권 이벤트 */}
          <Reveal>
            <FeaturedInvitations campaigns={featuredCampaigns} />
          </Reveal>

          {/* 3. 관객 후기 하이라이트 — 신뢰 구축 */}
          <Reveal delay={0.05}>
            <TestimonialsSection reviews={recentReviews} />
          </Reveal>
        </div>
      </section>

      {/* 4. 관객용 최종 CTA */}
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
    id: campaign.id,
    slug: campaign.slug ?? null,
    title: campaign.title,
    description: campaign.description ?? null,
    one_line_intro: campaign.one_line_intro ?? null,
    poster_image: campaign.poster_image ?? null,
    reward: campaign.reward ?? null,
    starts_at: campaign.starts_at ?? null,
    ends_at: campaign.ends_at ?? null,
    entry_count: campaign.entry_count ?? null,
  }
}

function createHeroStats(campaigns: Campaign[]) {
  const now = Date.now()
  const totalCampaigns = campaigns.length
  const activeCampaigns = campaigns.filter((campaign) => {
    const starts = campaign.starts_at ? new Date(campaign.starts_at).getTime() : null
    const ends = campaign.ends_at ? new Date(campaign.ends_at).getTime() : null
    if (starts && starts > now) return false
    if (ends && ends < now) return false
    return true
  }).length
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
