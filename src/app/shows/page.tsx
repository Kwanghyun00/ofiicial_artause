import Image from "next/image"
import Link from "next/link"
import { CalendarDays, MapPin, Ticket } from "lucide-react"
import { Reveal } from "@/components/motion/Reveal"
import { getAllPerformances, getTicketCampaigns } from "@/lib/supabase/queries"
import { PerformanceFilter } from "@/components/shows/PerformanceFilter"
import { getPosterFallback } from "@/constants/posters"

type RawPerformance = Awaited<ReturnType<typeof getAllPerformances>>[number]
type RawCampaign = Awaited<ReturnType<typeof getTicketCampaigns>>[number]

const isPerformanceRecord = (record: RawPerformance): record is RawPerformance & { id: string; title: string } =>
  Boolean(record && typeof record === "object" && "id" in record && "title" in record)

const isCampaignRecord = (record: RawCampaign): record is RawCampaign & { id: string; title: string } =>
  Boolean(record && typeof record === "object" && "id" in record && "title" in record)

const MAX_PERFORMANCES = 60

export default async function ShowsPage() {
  const [performanceRecords, campaignRecords] = await Promise.all([getAllPerformances(), getTicketCampaigns()])
  const performances = performanceRecords.filter(isPerformanceRecord).slice(0, MAX_PERFORMANCES)
  const campaigns = campaignRecords.filter(isCampaignRecord).slice(0, 6)

  return (
    <div className="bg-gradient-to-b from-[#F6F4EE] via-[#FBF8F2] to-white pb-24 pt-12 text-foreground">
      <Reveal>
        <section className="mx-auto max-w-6xl space-y-4 px-4 sm:px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">NOW</p>
          <h1 className="text-3xl font-semibold sm:text-4xl">지금 만날 수 있는 공연/이벤트</h1>
          <p className="text-base text-muted-foreground">
            KOPIS 기반 데이터를 바탕으로, 진행 중인 공연과 이벤트를 큐레이션합니다.
          </p>
        </section>
      </Reveal>

      <section className="mx-auto mt-12 max-w-6xl space-y-4 px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">공연 리스트</h2>
              <p className="text-sm text-muted-foreground">장르/지역별로 빠르게 필터링해 보세요.</p>
            </div>
            <div className="text-xs text-muted-foreground">최대 {MAX_PERFORMANCES}개 노출</div>
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          <PerformanceFilter performances={performances} />
        </Reveal>
      </section>

      <section className="mx-auto mt-16 max-w-6xl space-y-4 px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-semibold">초대권 이벤트 모아보기</h2>
              <p className="text-sm text-muted-foreground">진행 중인 이벤트를 한눈에 확인하세요.</p>
            </div>
            <Link href="/events" className="text-sm font-semibold text-primary hover:text-primary/80">
              초대권 응모 페이지
            </Link>
          </div>
        </Reveal>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign, index) => {
            const posterUrl =
              (campaign as { performances?: { poster_url?: string | null } | null }).performances?.poster_url ??
              getPosterFallback(index + 3)
            return (
              <Reveal key={campaign.id} delay={0.05 * index}>
                <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border/60 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                  <div className="relative h-48 w-full overflow-hidden">
                    <Image src={posterUrl} alt={campaign.title} fill className="object-cover transition duration-500 group-hover:scale-105" />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span className="rounded-full bg-[#f2efe7] px-3 py-1 text-foreground/80">초대권</span>
                      {campaign.reward && (
                        <span className="rounded-full bg-[#f2efe7] px-3 py-1 text-foreground/80">{campaign.reward}</span>
                      )}
                    </div>
                    <div className="mt-3 space-y-2">
                      <h3 className="text-lg font-semibold">{campaign.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {campaign.description ?? "공연 초대권 이벤트로 관객과의 접점을 확장합니다."}
                      </p>
                    </div>
                    <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                      {campaign.ends_at && (
                        <p className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-primary" />
                          마감 {formatShortDate(campaign.ends_at)}
                        </p>
                      )}
                      <p className="flex items-center gap-2">
                        <Ticket className="h-4 w-4 text-primary" />
                        참여 {(campaign.entry_count ?? 0).toLocaleString()}명
                      </p>
                      <p className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        온라인 참여
                      </p>
                    </div>
                    <Link
                      href={campaign.slug ? `/events/${campaign.slug}` : "/events"}
                      className="mt-4 inline-flex items-center justify-center rounded-full border border-black/20 px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary"
                    >
                      이벤트 보기
                    </Link>
                  </div>
                </article>
              </Reveal>
            )
          })}
        </div>
      </section>
    </div>
  )
}

function formatShortDate(value: string) {
  return new Date(value).toLocaleDateString("ko-KR", {
    month: "short",
    day: "numeric",
  })
}
