import type { Metadata } from "next"
import Link from "next/link"
import { Ticket } from "lucide-react"
import { Reveal } from "@/components/motion/Reveal"
import { PerformanceFilter } from "@/components/shows/PerformanceFilter"
import { ShowsAutoRefresh } from "@/components/shows/ShowsAutoRefresh"
import { buildActiveCampaignSlugMap } from "@/lib/campaigns"
import { getShowsPerformances, getTicketCampaigns } from "@/lib/supabase/queries"
import { GENRE_MAP, REGION_MAP } from "@/constants/curation"

type RawPerformance = Awaited<ReturnType<typeof getShowsPerformances>>[number]
type RawCampaign = Awaited<ReturnType<typeof getTicketCampaigns>>[number]

export const metadata: Metadata = {
  title: "공연 검색",
  description: "장르·지역·날짜로 원하는 공연을 검색하고, 초대권 이벤트가 연결된 공연은 바로 응모까지 이어지세요.",
  alternates: {
    canonical: "/shows",
  },
  openGraph: {
    title: "공연 검색 | 알터즈",
    description: "연극, 뮤지컬, 클래식 등 다양한 공연을 검색하고 초대권 이벤트를 찾아보세요.",
    url: "/shows",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "공연 검색 | 알터즈",
    description: "연극, 뮤지컬, 클래식 등 다양한 공연을 검색하고 초대권 이벤트를 찾아보세요.",
  },
}

const isPerformanceRecord = (record: RawPerformance): record is RawPerformance & { id: string; title: string } =>
  Boolean(record && typeof record === "object" && "id" in record && "title" in record)

const MAX_PERFORMANCES = readPositiveIntEnv("SHOWS_MAX_PERFORMANCES", 100)
const AUTO_REFRESH_MS = readPositiveIntEnv("SHOWS_AUTO_REFRESH_MS", 60_000)

export default async function ShowsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const [performanceRecords, campaignRecords] = await Promise.all([getShowsPerformances(), getTicketCampaigns()])
  const valid = performanceRecords.filter(isPerformanceRecord)
  // is_featured 공연은 한도와 무관하게 항상 포함
  const featured = valid.filter((p) => p.is_featured)
  const others = valid.filter((p) => !p.is_featured).slice(0, Math.max(0, MAX_PERFORMANCES - featured.length))
  const performances = [...featured, ...others]
  const campaignByPerfId = buildActiveCampaignSlugMap(campaignRecords)

  return (
    <div className="pb-24 pt-12 text-foreground">
      <Reveal>
        <section className="mx-auto max-w-6xl space-y-4 px-4 sm:px-6 lg:px-8">
          <span className="cue">공연 탐색</span>
          <h1 className="text-3xl font-semibold sm:text-4xl">관심 있는 공연을 찾아보세요</h1>
          <p className="max-w-2xl text-base text-muted-foreground">
            장르, 지역, 일정 기준으로 작품을 둘러보고 초대 이벤트가 연결된 공연은 바로 응모까지 이어질 수
            있도록 구성했습니다.
          </p>
        </section>
      </Reveal>

      <section className="mx-auto mt-12 max-w-6xl space-y-4 px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">공연 목록</h2>
              <p className="text-sm text-muted-foreground">필터를 이용해 공연을 빠르게 좁혀 볼 수 있습니다.</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>최대 {MAX_PERFORMANCES}개 표시</span>
              <ShowsAutoRefresh intervalMs={AUTO_REFRESH_MS} />
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          <PerformanceFilter performances={performances} initialQuery={q} campaignByPerfId={campaignByPerfId} />
        </Reveal>
      </section>

      {/* 장르별 큐레이션 빠른 탐색 */}
      <section className="mx-auto mt-12 max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">장르별 공연</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(GENRE_MAP).map(([slug, meta]) => (
                <Link
                  key={slug}
                  href={`/shows/genre/${slug}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3.5 py-2 text-sm font-medium text-foreground transition hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
                >
                  <span>{meta.emoji}</span>
                  {meta.label}
                </Link>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* 지역별 큐레이션 빠른 탐색 */}
      <section className="mx-auto mt-6 max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">지역별 공연</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(REGION_MAP)
                .filter(([slug]) => ["seoul", "gyeonggi", "busan", "daegu", "incheon", "gwangju", "daejeon"].includes(slug))
                .map(([slug, meta]) => (
                  <Link
                    key={slug}
                    href={`/shows/region/${slug}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3.5 py-2 text-sm font-medium text-foreground transition hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
                  >
                    <span>{meta.emoji}</span>
                    {meta.label}
                  </Link>
                ))}
              <Link
                href="/shows/region/gangwon"
                className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background px-3.5 py-2 text-sm font-medium text-muted-foreground transition hover:border-primary/50 hover:text-primary"
              >
                + 더 많은 지역
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="mx-auto mt-8 max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <Link
            href="/invites"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80"
          >
            <Ticket className="h-4 w-4" />
            진행 중인 초대 이벤트 전체 보기
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
