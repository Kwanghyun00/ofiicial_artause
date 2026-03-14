import Link from "next/link"
import { Ticket } from "lucide-react"
import { Reveal } from "@/components/motion/Reveal"
import { getShowsPerformances, getTicketCampaigns } from "@/lib/supabase/queries"
import { PerformanceFilter } from "@/components/shows/PerformanceFilter"
import { ShowsAutoRefresh } from "@/components/shows/ShowsAutoRefresh"

type RawPerformance = Awaited<ReturnType<typeof getShowsPerformances>>[number]
type RawCampaign = Awaited<ReturnType<typeof getTicketCampaigns>>[number]

const isPerformanceRecord = (record: RawPerformance): record is RawPerformance & { id: string; title: string } =>
  Boolean(record && typeof record === "object" && "id" in record && "title" in record)

const MAX_PERFORMANCES = readPositiveIntEnv("SHOWS_MAX_PERFORMANCES", 180)
const AUTO_REFRESH_MS = readPositiveIntEnv("SHOWS_AUTO_REFRESH_MS", 60_000)

export default async function ShowsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const [performanceRecords, campaignRecords] = await Promise.all([getShowsPerformances(), getTicketCampaigns()])
  const performances = performanceRecords.filter(isPerformanceRecord).slice(0, MAX_PERFORMANCES)

  // performanceId → campaign slug 맵 (이벤트 뱃지 표시용)
  const campaignByPerfId: Record<string, string> = {}
  for (const c of campaignRecords) {
    const perf_id = (c as { performance_id?: string | null }).performance_id
    const slug = (c as { slug?: string | null }).slug
    if (perf_id && slug) {
      campaignByPerfId[perf_id] = slug
    }
  }

  return (
    <div className="pb-24 pt-12 text-foreground">
      <Reveal>
        <section className="mx-auto max-w-6xl space-y-4 px-4 sm:px-6 lg:px-8">
          <span className="cue">공연검색</span>
          <h1 className="text-3xl font-semibold sm:text-4xl">공연 검색</h1>
          <p className="text-base text-muted-foreground">
            장르, 지역, 기간으로 공연을 검색하고 초대권 이벤트로 바로 연결하세요.
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
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>최대 {MAX_PERFORMANCES}개 노출</span>
              <ShowsAutoRefresh intervalMs={AUTO_REFRESH_MS} />
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          <PerformanceFilter performances={performances} initialQuery={q} campaignByPerfId={campaignByPerfId} />
        </Reveal>
      </section>

      <section className="mx-auto mt-12 max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80"
          >
            <Ticket className="h-4 w-4" />
            진행 중인 초대권 이벤트 전체 보기 →
          </Link>
        </Reveal>
      </section>
    </div>
  )
}

function readPositiveIntEnv(key: string, fallback: number) {
  const raw = process.env[key]
  if (!raw) return fallback

  const parsed = Number.parseInt(raw, 10)
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback

  return parsed
}
