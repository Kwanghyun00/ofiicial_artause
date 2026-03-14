import { EventsHero } from "@/components/events/EventsHero"
import { EventsGrid } from "@/components/events/EventsGrid"
import { Reveal } from "@/components/motion/Reveal"
import { getTicketCampaigns } from "@/lib/supabase/queries"

type CampaignResult = Awaited<ReturnType<typeof getTicketCampaigns>>[number]
type ValidCampaign = Extract<CampaignResult, { id: string }>
type CampaignWithEntries = ValidCampaign & { entry_count?: number | null }

const isCampaign = (record: CampaignResult): record is ValidCampaign =>
  Boolean(record && typeof record === "object" && "id" in record)

export const revalidate = 60 // 최대 60초마다 entry_count 갱신

export const metadata = {
  title: "초대권 응모",
  description: "알터즈의 초대권 이벤트를 확인하고 응모하세요.",
}

export default async function EventsPage() {
  const campaigns = (await getTicketCampaigns())
    .filter(isCampaign)
    .map((campaign: ValidCampaign) => ({
      ...campaign,
      entry_count: (campaign as { entry_count?: number | null }).entry_count ?? null,
    })) as CampaignWithEntries[]
  const activeCampaigns = campaigns.filter((campaign) => getStatus(campaign) === "active")
  const closingSoonCount = countClosingSoon(campaigns)
  const totalApplicants = campaigns.reduce((total, campaign) => total + (campaign.entry_count ?? 0), 0)

  const insights = [
    { label: "누적 응모", value: `${totalApplicants.toLocaleString()}명` },
    { label: "진행 중 이벤트", value: `${activeCampaigns.length}건` },
    { label: "마감 임박", value: `${closingSoonCount}건` },
    { label: "전체 이벤트", value: `${campaigns.length}건` },
  ]

  return (
    <div className="space-y-12 pb-24 pt-12">
      <Reveal>
        <section className="py-12">
          <div className="mx-auto max-w-6xl space-y-10 px-4 sm:px-6 md:px-8">
            <EventsHero campaignCount={campaigns.length} closingSoonCount={closingSoonCount} activeCount={activeCampaigns.length} />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {insights.map((stat) => (
                <div
                  key={stat.label}
                  className="spotlight-card p-4 text-center"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">{stat.label}</p>
                  <p className="mt-2 text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
              ))}
            </div>

            <EventsGrid campaigns={campaigns.slice(0, 6)} />
          </div>
        </section>
      </Reveal>

      {/* NOTE: 중복된 이벤트 리스트(EventsExplorer) 섹션 제거 */}
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
