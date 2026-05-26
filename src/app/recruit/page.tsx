import type { Metadata } from "next"
import { EventsHero } from "@/components/events/EventsHero"
import { EventsGrid } from "@/components/events/EventsGrid"
import { Reveal } from "@/components/motion/Reveal"
import { getTicketCampaigns } from "@/lib/supabase/queries"

type CampaignWithEntries = {
  id: string
  slug?: string | null
  title: string
  description?: string | null
  one_line_intro?: string | null
  starts_at?: string | null
  ends_at?: string | null
  reward?: string | null
  entry_count?: number | null
  poster_image?: string | null
  performances?: { region?: string | null; title?: string | null } | null
}

const isCampaign = (record: unknown): record is CampaignWithEntries =>
  Boolean(
    record &&
    typeof record === "object" &&
    "id" in record &&
    typeof (record as { id: unknown }).id === "string" &&
    (record as { id: unknown }).id !== ""
  )

export const revalidate = 60

export const metadata: Metadata = {
  title: "체험단 모집",
  description: "연극·뮤지컬·클래식·무용 공연의 체험단으로 지원하세요. 선정되면 무료 관람 후 SNS 후기를 제출하는 방식으로 문화생활 포트폴리오를 쌓을 수 있습니다.",
  alternates: {
    canonical: "/recruit",
  },
  openGraph: {
    title: "알터즈 | 공연 체험단 모집",
    description: "지금 모집 중인 공연 체험단을 확인하고 지원하세요. 연극·뮤지컬·클래식·무용 등 다양한 장르의 체험단이 기다립니다.",
    url: "/recruit",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "알터즈 | 공연 체험단 모집",
    description: "지금 모집 중인 공연 체험단을 확인하고 지원하세요.",
  },
}

export default async function RecruitPage() {
  const raw = await getTicketCampaigns()
  const campaigns: CampaignWithEntries[] = raw.filter(isCampaign) as unknown as CampaignWithEntries[]

  const activeCampaigns = campaigns.filter((campaign) => getStatus(campaign) === "active")
  const closingSoonCount = countClosingSoon(campaigns)
  const totalApplicants = campaigns.reduce((total, campaign) => total + (campaign.entry_count ?? 0), 0)

  const insights = [
    { label: "누적 지원", value: `${totalApplicants.toLocaleString()}명` },
    { label: "모집 중", value: `${activeCampaigns.length}건` },
    { label: "마감 임박", value: `${closingSoonCount}건` },
    { label: "전체 모집", value: `${campaigns.length}건` },
  ]

  return (
    <div className="pb-24">
      <Reveal>
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          {/* 헤더 */}
          <div className="mb-12">
            <EventsHero
              campaignCount={campaigns.length}
              closingSoonCount={closingSoonCount}
              activeCount={activeCampaigns.length}
            />
          </div>

          {/* 누적 통계 */}
          <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {insights.map((stat) => (
              <div key={stat.label} className="rounded-xl border border-border/60 bg-card p-4 text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {stat.label}
                </p>
                <p className="mt-1.5 text-xl font-bold text-foreground sm:text-2xl">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* 카드 그리드 — 전체 캠페인 전달 (필터는 클라이언트) */}
          <EventsGrid campaigns={campaigns} />
        </div>
      </Reveal>
    </div>
  )
}

type CampaignStatus = "active" | "upcoming" | "closed"

function getStatus(campaign: CampaignWithEntries): CampaignStatus {
  const now = Date.now()
  const starts = campaign.starts_at ? new Date(campaign.starts_at).getTime() : null
  const ends = campaign.ends_at ? new Date(campaign.ends_at).getTime() : null
  if (starts && starts > now) return "upcoming"
  if (ends && ends < now) return "closed"
  return "active"
}

function countClosingSoon(campaigns: CampaignWithEntries[]) {
  const now = Date.now()
  return campaigns.filter((campaign) => {
    if (!campaign.ends_at) return false
    const diff = new Date(campaign.ends_at).getTime() - now
    return diff > 0 && diff <= 1000 * 60 * 60 * 24 * 3
  }).length
}
