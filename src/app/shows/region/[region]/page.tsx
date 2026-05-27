import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { CalendarDays, ChevronRight, MapPin, Ticket } from "lucide-react"
import { getPerformancesByRegion, getTicketCampaigns } from "@/lib/supabase/queries"
import { buildActiveCampaignSlugMap } from "@/lib/campaigns"
import { GENRE_MAP, REGION_MAP, REGION_SLUGS } from "@/constants/curation"
import { getPosterFallback } from "@/constants/posters"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://artause.co.kr"

// ─── 정적 파라미터 (빌드 타임 사전 렌더링) ───────────────────────────────────

export function generateStaticParams() {
  return REGION_SLUGS.map((region) => ({ region }))
}

// ─── 동적 메타데이터 ──────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ region: string }>
}): Promise<Metadata> {
  const { region } = await params
  const meta = REGION_MAP[region]
  if (!meta) return {}

  const title = `${meta.label} 공연 일정 2026 | 알터즈`
  const description = meta.description

  return {
    title,
    description,
    alternates: { canonical: `/shows/region/${region}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/shows/region/${region}`,
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  }
}

// ─── 페이지 컴포넌트 ──────────────────────────────────────────────────────────

export default async function RegionCurationPage({
  params,
  searchParams,
}: {
  params: Promise<{ region: string }>
  searchParams: Promise<{ genre?: string }>
}) {
  const [{ region }, { genre }] = await Promise.all([params, searchParams])
  const meta = REGION_MAP[region]
  if (!meta) notFound()

  const [performances, campaigns] = await Promise.all([
    getPerformancesByRegion(meta.categoryValue),
    getTicketCampaigns(),
  ])
  const campaignByPerfId = buildActiveCampaignSlugMap(campaigns)

  // 장르 필터 (searchParams ?genre=musical 형태)
  const genreMeta = genre ? GENRE_MAP[genre] : undefined
  const filtered = genreMeta
    ? performances.filter((p) => {
        const cat = (p as Record<string, unknown>).category
        return typeof cat === "string" && cat.includes(genreMeta.categoryValue)
      })
    : performances

  // 현재 진행/예정 공연 우선
  const sorted = [...filtered].sort((a, b) => {
    const now = Date.now()
    const aEnd = (a as Record<string, unknown>).period_end
      ? new Date((a as Record<string, unknown>).period_end as string).getTime()
      : Infinity
    const bEnd = (b as Record<string, unknown>).period_end
      ? new Date((b as Record<string, unknown>).period_end as string).getTime()
      : Infinity
    const aActive = aEnd > now ? 1 : 0
    const bActive = bEnd > now ? 1 : 0
    if (aActive !== bActive) return bActive - aActive
    return bEnd - aEnd
  })

  // 이 지역에 있는 장르 목록 (필터 칩 표시용)
  const genresInRegion = Array.from(
    new Set(
      performances
        .map((p) => (p as Record<string, unknown>).category)
        .filter((c): c is string => typeof c === "string" && Boolean(c))
    )
  )

  return (
    <div className="pb-24 pt-12 text-foreground">
      {/* 헤더 */}
      <section className="mx-auto max-w-6xl space-y-4 px-4 sm:px-6 lg:px-8">
        {/* 브레드크럼 */}
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/shows" className="hover:text-foreground transition">공연 검색</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">지역</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-semibold">{meta.label}</span>
          {genreMeta && (
            <>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground font-semibold">{genreMeta.label}</span>
            </>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <span className="text-3xl" role="img" aria-hidden="true">{meta.emoji}</span>
          <div>
            <span className="text-xs font-semibold tracking-widest text-primary uppercase">지역</span>
            <h1 className="text-3xl font-bold text-foreground">
              {meta.label} {genreMeta ? `${genreMeta.label} ` : ""}공연
            </h1>
          </div>
        </div>
        <p className="max-w-2xl text-base text-muted-foreground leading-relaxed">{meta.description}</p>

        {/* 지역 빠른 이동 */}
        <div className="flex flex-wrap gap-2 pt-1">
          {Object.entries(REGION_MAP).map(([slug, r]) => (
            <Link
              key={slug}
              href={`/shows/region/${slug}`}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all ${
                slug === region
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:border-primary/50 hover:text-primary"
              }`}
            >
              <span>{r.emoji}</span>
              {r.label}
            </Link>
          ))}
        </div>

        {/* 이 지역 내 장르 필터 */}
        {genresInRegion.length > 1 && (
          <div className="space-y-2 pt-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">장르로 좁히기</p>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/shows/region/${region}`}
                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                  !genre
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:border-primary/40 hover:text-primary"
                }`}
              >
                전체
              </Link>
              {Object.entries(GENRE_MAP)
                .filter(([, g]) => genresInRegion.includes(g.categoryValue))
                .map(([slug, g]) => (
                  <Link
                    key={slug}
                    href={`/shows/region/${region}?genre=${slug}`}
                    className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                      genre === slug
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-foreground hover:border-primary/40 hover:text-primary"
                    }`}
                  >
                    <span>{g.emoji}</span>
                    {g.label}
                  </Link>
                ))}
            </div>
          </div>
        )}
      </section>

      {/* 공연 그리드 */}
      <section className="mx-auto mt-12 max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">
            {meta.label}{genreMeta ? ` ${genreMeta.label}` : ""} 공연 목록
            <span className="ml-2 text-sm font-normal text-muted-foreground">({sorted.length}개)</span>
          </h2>
          <Link href="/shows" className="text-sm text-primary font-semibold hover:underline underline-offset-2">
            전체 보기
          </Link>
        </div>

        {sorted.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-background/60 p-16 text-center">
            <p className="text-sm font-semibold text-foreground">
              현재 등록된 {meta.label}{genreMeta ? ` ${genreMeta.label}` : ""} 공연이 없습니다
            </p>
            <p className="mt-1 text-xs text-muted-foreground">KOPIS 데이터와 파트너 공연은 매일 업데이트됩니다.</p>
            <Link
              href="/shows"
              className="mt-4 inline-block rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90"
            >
              전체 공연 보기
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {sorted.map((perf) => {
              const p = perf as Record<string, unknown>
              const campaignSlug = typeof p.id === "string" ? campaignByPerfId[p.id] : undefined
              return (
                <PerformanceCard
                  key={typeof p.id === "string" ? p.id : Math.random().toString()}
                  perf={p}
                  campaignSlug={campaignSlug}
                />
              )
            })}
          </div>
        )}
      </section>

      {/* SEO 텍스트 섹션 */}
      <section className="mx-auto mt-16 max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border/60 bg-muted/20 p-6 space-y-3">
          <h2 className="text-base font-bold text-foreground">{meta.label} 공연 초대권 이벤트</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            알터즈는 {meta.label} 지역 공연 파트너사와 협력하여 다양한 공연 초대권 이벤트를 진행합니다.
            이벤트에 응모하고 추첨을 통해 무료로 공연을 관람해 보세요.
            당첨자는 이메일로 안내를 받으실 수 있습니다.
          </p>
          <Link
            href="/invites"
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline underline-offset-2"
          >
            진행 중인 초대권 이벤트 보기 →
          </Link>
        </div>
      </section>

      {/* 장르별 큐레이션 링크 */}
      <section className="mx-auto mt-12 max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-muted-foreground">장르별 공연 탐색</h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(GENRE_MAP).map(([slug, g]) => (
            <Link
              key={slug}
              href={`/shows/genre/${slug}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3.5 py-1.5 text-sm font-medium text-foreground transition hover:border-primary/50 hover:text-primary"
            >
              <span>{g.emoji}</span>
              {g.label}
            </Link>
          ))}
        </div>
      </section>

      {/* 초대 이벤트 CTA */}
      <section className="mx-auto mt-10 max-w-6xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/invites"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80"
        >
          <Ticket className="h-4 w-4" />
          {meta.label} 초대권 이벤트 전체 보기
        </Link>
      </section>
    </div>
  )
}

// ─── 공연 카드 ─────────────────────────────────────────────────────────────────

type Perf = Record<string, unknown>

function PerformanceCard({ perf, campaignSlug }: { perf: Perf; campaignSlug?: string }) {
  const slug = typeof perf.slug === "string" ? perf.slug : null
  const title = typeof perf.title === "string" ? perf.title : "공연"
  const posterUrl = (typeof perf.poster_url === "string" ? perf.poster_url : null) ?? getPosterFallback(0)
  const region = typeof perf.region === "string" ? perf.region : null
  const category = typeof perf.category === "string" ? perf.category : null
  const periodStart = typeof perf.period_start === "string" ? perf.period_start : null
  const periodEnd = typeof perf.period_end === "string" ? perf.period_end : null

  const isActive = periodEnd ? new Date(periodEnd) > new Date() : true
  const href = slug ? `/shows/${slug}` : null

  const content = (
    <div className={`group rounded-2xl border overflow-hidden transition-all hover:shadow-md ${
      isActive ? "border-border" : "border-border/50 opacity-70"
    }`}>
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
        <Image
          src={posterUrl}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        {campaignSlug && (
          <div className="absolute bottom-2 left-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground shadow">
              <Ticket className="h-2.5 w-2.5" />
              초대권
            </span>
          </div>
        )}
        {!isActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-white">공연 종료</span>
          </div>
        )}
      </div>

      <div className="p-3 space-y-1">
        <p className="text-sm font-semibold text-foreground line-clamp-2 leading-tight">{title}</p>
        <div className="flex flex-col gap-0.5 text-[11px] text-muted-foreground">
          {category && (
            <span className="inline-flex w-fit rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              {category}
            </span>
          )}
          {(periodStart || periodEnd) && (
            <span className="flex items-center gap-1">
              <CalendarDays className="h-2.5 w-2.5 shrink-0" />
              {formatPeriod(periodStart, periodEnd)}
            </span>
          )}
        </div>
      </div>
    </div>
  )

  return href ? <Link href={href} className="block">{content}</Link> : <div>{content}</div>
}

// ─── 날짜 유틸 ─────────────────────────────────────────────────────────────────

function formatDate(v: string | null | undefined) {
  if (!v) return ""
  const d = new Date(v)
  if (isNaN(d.getTime())) return v
  return d.toLocaleDateString("ko-KR", { month: "long", day: "numeric" })
}

function formatPeriod(start: string | null | undefined, end: string | null | undefined) {
  if (!start && !end) return ""
  if (start && end) return `${formatDate(start)} ~ ${formatDate(end)}`
  return formatDate(start ?? end)
}
