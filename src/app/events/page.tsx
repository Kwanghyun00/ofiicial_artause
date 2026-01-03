import { EventsExplorer } from "@/components/events/EventsExplorer"
import { EventsHero } from "@/components/events/EventsHero"
import { EventsGrid } from "@/components/events/EventsGrid"
import { getTicketCampaigns } from "@/lib/supabase/queries"

type CampaignResult = Awaited<ReturnType<typeof getTicketCampaigns>>[number]
type ValidCampaign = Extract<CampaignResult, { id: string }>

const isCampaign = (record: CampaignResult): record is ValidCampaign =>
  Boolean(record && typeof record === "object" && "id" in record)

export const metadata = {
  title: "초대 이벤트 캘린더",
  description: "뮤지컬·전시·콘서트 초대권을 한눈에 확인하고 조건에 맞게 검색해 보세요.",
}

export default async function EventsPage() {
  const campaigns = (await getTicketCampaigns()).filter(isCampaign)
  const activeCampaigns = campaigns.filter((campaign) => getStatus(campaign) === "active")
  const closingSoonCount = countClosingSoon(campaigns)
  const totalApplicants = campaigns.reduce((total, campaign) => total + (campaign.entry_count ?? 0), 0)

  const insights = [
    { label: "누적 신청", value: `${totalApplicants.toLocaleString()}명` },
    { label: "진행 중 초대", value: `${activeCampaigns.length}건` },
    { label: "마감 임박", value: `${closingSoonCount}건` },
    { label: "전체 프로그램", value: `${campaigns.length}건` },
  ]

  return (
    <div className="space-y-12">
      <section className="bg-gradient-to-b from-[#F7F4EC] via-white to-white py-12">
        <div className="mx-auto max-w-6xl space-y-10 px-4 sm:px-6 md:px-8">
          <EventsHero campaignCount={campaigns.length} closingSoonCount={closingSoonCount} activeCount={activeCampaigns.length} />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {insights.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-border bg-card/90 p-4 text-center shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">{stat.label}</p>
                <p className="mt-2 text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
            ))}
          </div>

          <EventsGrid campaigns={campaigns.slice(0, 6)} />
        </div>
      </section>

      <section className="bg-white/90 py-12">
        <div className="mx-auto max-w-6xl space-y-6 px-4 sm:px-6 md:px-8">
          <div className="space-y-2 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-primary">실시간 탐색</p>
            <h2 className="text-3xl font-bold text-foreground">초대 이벤트 라이브 탐색</h2>
            <p className="text-base text-muted-foreground">
              Supabase 데이터와 로컬 큐레이션 정보를 기반으로 원하는 조건의 초대만 골라볼 수 있습니다.
            </p>
          </div>
          <EventsExplorer campaigns={campaigns} />
        </div>
      </section>
    </div>
  )
}

type CampaignStatus = "active" | "upcoming" | "closed"

function getStatus(campaign: ValidCampaign): CampaignStatus {
  const now = Date.now()
  const starts = campaign.starts_at ? new Date(campaign.starts_at).getTime() : null
  const ends = campaign.ends_at ? new Date(campaign.ends_at).getTime() : null
  if (starts && starts > now) return "upcoming"
  if (ends && ends < now) return "closed"
  return "active"
}

function countClosingSoon(campaigns: ValidCampaign[]) {
  const now = Date.now()
  return campaigns.filter((campaign) => {
    if (!campaign.ends_at) return false
    const diff = new Date(campaign.ends_at).getTime() - now
    return diff > 0 && diff <= 1000 * 60 * 60 * 24 * 3
  }).length
}
