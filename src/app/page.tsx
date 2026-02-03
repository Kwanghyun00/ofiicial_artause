import {
  CallToAction,
  CategoryShowcase,
  CompanySnapshot,
  ExperienceMetrics,
  FeaturedInvitations,
  HomeHero,
  HowItWorks,
  MembershipSection,
  PerformanceShowcase,
  TestimonialsSection,
  TrustMarquee,
  ValuePropSection,
} from "@/components/home/sections"
import { Reveal } from "@/components/motion/Reveal"
import type { Campaign, Organization as OrganizationSummary, Show } from "@/components/home/types"
import { getOrganizations, getRecentPerformances, getTicketCampaigns } from "@/lib/supabase/queries"

type RawCampaign = Awaited<ReturnType<typeof getTicketCampaigns>>[number]
type RawPerformance = Awaited<ReturnType<typeof getRecentPerformances>>[number]
type RawOrganization = Awaited<ReturnType<typeof getOrganizations>>[number]

const isCampaignRecord = (record: RawCampaign): record is RawCampaign & { id: string; title: string } =>
  Boolean(record && typeof record === "object" && "id" in record && "title" in record)

const isPerformanceRecord = (record: RawPerformance): record is RawPerformance & { id: string; title: string } =>
  Boolean(record && typeof record === "object" && "id" in record && "title" in record)

const isOrganizationRecord = (record: RawOrganization): record is RawOrganization & { id: string; name: string } =>
  Boolean(record && typeof record === "object" && "id" in record && "name" in record)

export default async function HomePage() {
  const [campaignRecords, performanceRecords, organizationRecords] = await Promise.all([
    getTicketCampaigns(),
    getRecentPerformances(),
    getOrganizations(),
  ])

  const campaigns = campaignRecords.filter(isCampaignRecord).map(normalizeCampaign)
  const shows = performanceRecords.filter(isPerformanceRecord).slice(0, 6).map(normalizeShow)
  const organizations = organizationRecords.filter(isOrganizationRecord).map(normalizeOrganization)

  const heroStats = createHeroStats(campaigns)
  const partnerBadges = organizations.length
    ? organizations.slice(0, 6).map((org) => ({
        name: org.name,
        label: org.region ? `${org.region} 지역` : "파트너",
      }))
    : undefined

  const featuredCampaigns = campaigns.slice(0, 2)

  return (
    <div className="space-y-20 bg-gradient-to-b from-[#F7F4EC] via-[#FAF7F0] to-white pb-24 pt-10">
      <Reveal>
        <section>
          <div className="mx-auto max-w-6xl space-y-10 px-4 sm:px-6 lg:px-8">
            <HomeHero
              totalCampaigns={heroStats.totalCampaigns}
              activeCampaigns={heroStats.activeCampaigns}
              liveApplicants={heroStats.liveApplicants}
              nextDeadline={heroStats.nextDeadline}
            />
          </div>
        </section>
      </Reveal>

      <Reveal>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <TrustMarquee partners={partnerBadges} />
        </div>
      </Reveal>

      <section>
        <div className="mx-auto max-w-6xl space-y-12 px-4 sm:px-6 lg:px-8">
          <Reveal>
            <FeaturedInvitations campaigns={featuredCampaigns} />
          </Reveal>
          <Reveal delay={0.05}>
            <ExperienceMetrics />
          </Reveal>
          <Reveal delay={0.1}>
            <CategoryShowcase />
          </Reveal>
          <Reveal delay={0.15}>
            <PerformanceShowcase shows={shows} />
          </Reveal>
          <Reveal delay={0.2}>
            <HowItWorks />
          </Reveal>
          <Reveal delay={0.25}>
            <MembershipSection />
          </Reveal>
          <Reveal delay={0.3}>
            <TestimonialsSection />
          </Reveal>
          <Reveal delay={0.35}>
            <ValuePropSection />
          </Reveal>
          <Reveal delay={0.4}>
            <CompanySnapshot />
          </Reveal>
          <Reveal delay={0.45}>
            <CallToAction />
          </Reveal>
        </div>
      </section>
    </div>
  )
}

function normalizeCampaign(record: RawCampaign): Campaign {
  const campaign = record as RawCampaign & {
    slug?: string | null
    description?: string | null
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
    reward: campaign.reward ?? null,
    starts_at: campaign.starts_at ?? null,
    ends_at: campaign.ends_at ?? null,
    entry_count: campaign.entry_count ?? null,
  }
}

function normalizeShow(record: RawPerformance): Show {
  const performance = record as RawPerformance & {
    slug?: string | null
    region?: string | null
    period_start?: string | null
    period_end?: string | null
    poster_url?: string | null
  }

  return {
    id: performance.id,
    slug: performance.slug ?? performance.id,
    title: performance.title,
    region: performance.region ?? null,
    tags: null,
    period_start: performance.period_start ?? null,
    period_end: performance.period_end ?? null,
    poster_url: performance.poster_url ?? null,
  }
}

function normalizeOrganization(record: RawOrganization): OrganizationSummary {
  const organization = record as RawOrganization & {
    region?: string | null
  }

  return {
    id: organization.id,
    name: organization.name,
    region: organization.region ?? null,
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
