import {
  CallToAction,
  CategoryShowcase,
  ExperienceMetrics,
  FeaturedInvitations,
  HomeHero,
  HowItWorks,
  InvitationGallery,
  MembershipSection,
  PerformanceShowcase,
  TestimonialsSection,
  TrustMarquee,
  ValuePropSection,
} from "@/components/home/sections"
import type { Campaign, Organization as OrganizationSummary, Show } from "@/components/home/types"
import { getFeaturedPerformances, getOrganizations, getTicketCampaigns } from "@/lib/supabase/queries"

type RawCampaign = Awaited<ReturnType<typeof getTicketCampaigns>>[number]
type RawPerformance = Awaited<ReturnType<typeof getFeaturedPerformances>>[number]
type RawOrganization = Awaited<ReturnType<typeof getOrganizations>>[number]

const isCampaignRecord = (record: RawCampaign): record is RawCampaign & { id: string; title: string } =>
  Boolean(record && typeof record === "object" && "id" in record && "title" in record)

const isPerformanceRecord = (record: RawPerformance): record is RawPerformance & { id: string; title: string } =>
  Boolean(record && typeof record === "object" && "id" in record && "title" in record)

const isOrganizationRecord = (record: RawOrganization): record is RawOrganization & { id: string; name: string } =>
  Boolean(record && typeof record === "object" && "id" in record && "name" in record)

export default async function WebServicePage() {
  const [campaignRecords, performanceRecords, organizationRecords] = await Promise.all([
    getTicketCampaigns(),
    getFeaturedPerformances({ allowKopis: true }),
    getOrganizations(),
  ])

  const campaigns = campaignRecords.filter(isCampaignRecord).map(normalizeCampaign)
  const shows = performanceRecords.filter(isPerformanceRecord).slice(0, 6).map(normalizeShow)
  const organizations = organizationRecords.filter(isOrganizationRecord).map(normalizeOrganization)

  const heroStats = createHeroStats(campaigns)
  const partnerBadges = organizations.slice(0, 6).map((org) => ({
    name: org.name,
    label: org.region ? `${org.region} 기반` : "문화 파트너",
  }))

  const featuredCampaigns = campaigns.slice(0, 2)
  const galleryCampaigns = campaigns.slice(0, 8)

  return (
    <div className="space-y-16 bg-[#F7F4EC] pb-20 pt-10">
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

      <TrustMarquee partners={partnerBadges} />

      <section>
        <div className="mx-auto max-w-6xl space-y-12 px-4 sm:px-6 lg:px-8">
          <ExperienceMetrics />
          <FeaturedInvitations campaigns={featuredCampaigns} />
          <InvitationGallery campaigns={galleryCampaigns} />
          <CategoryShowcase />
          <PerformanceShowcase shows={shows} />
          <HowItWorks />
          <MembershipSection />
          <TestimonialsSection />
          <ValuePropSection />
          <CallToAction />
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
    tags?: string[] | null
    period_start?: string | null
    period_end?: string | null
    poster_url?: string | null
  }

  return {
    id: performance.id,
    slug: performance.slug ?? performance.id,
    title: performance.title,
    region: performance.region ?? null,
    tags: performance.tags ?? null,
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
    .filter((timestamp): timestamp is number => Boolean(timestamp) && timestamp > now)
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

