import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { CalendarDays, ChevronRight, MapPin, Ticket } from "lucide-react"
import { getPerformancesByGenre, getTicketCampaigns } from "@/lib/supabase/queries"
import { buildActiveCampaignSlugMap } from "@/lib/campaigns"
import { GENRE_MAP, GENRE_SLUGS, REGION_MAP } from "@/constants/curation"
import { getPosterFallback } from "@/constants/posters"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://artause.co.kr"

// ─── 정적 파라미터 (빌드 타임 사전 렌더링) ───────────────────────────────────

export function generateStaticParams() {
  return GENRE_SLUGS.map((genre) => ({ genre }))
}

// ─── 동적 메타데이터 ──────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ genre: string }>
}): Promise<Metadata> {
  const { genre } = await params
  const meta = GENRE_MAP[genre]
  if (!meta) return {}

  const title = `${meta.label} 공연 목록 2026 | 알터즈`
  const description = meta.description

  return {
    title,
    description,
    alternates: { canonical: `/shows/genre/${genre}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/shows/genre/${genre}`,
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

export default async function GenreCurationPage({
  params,
}: {
  params: Promise<{ genre: string }>
}) {
  const { genre } = await params
  const meta = GENRE_MAP[genre]
  if (!meta) notFound()

  const [performances, campaigns] = await Promise.all([
    getPerformancesByGenre(meta.categoryValue),
    getTicketCampaigns(),
  ])
  const campaignByPerfId = buildActiveCampaignSlugMap(campaigns)

  // 현재 진행/예정 공연 우선, 종료 공연은 뒤로
  const sorted = [...performances].sort((a, b) => {
    const now = Date.now()
    const aEnd = a.period_end ? new Date(a.period_end).getTime() : Infinity
    const bEnd = b.period_end ? new Date(b.period_end).getTime() : Infinity
    const aActive = aEnd > now ? 1 : 0
    const bActive = bEnd > now ? 1 : 0
    if (aActive !== bActive) return bActive - aActive
    return bEnd - aEnd
  })

  // 관련 장르 (현재 장르 제외)
  const relatedGenres = Object.entries(GENRE_MAP)
    .filter(([slug]) => slug !== genre)
    .slice(0, 5)

  return (
    <div className="pb-24 pt-12 text-foreground">
      {/* 헤더 */}
      <section className="mx-auto max-w-6xl space-y-4 px-4 sm:px-6 lg:px-8">
        {/* 브레드크럼 */}
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/shows" className="hover:text-foreground transition">공연 검색</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">장르</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-semibold">{meta.label}</span>
        </nav>

        <div className="flex items-center gap-3">
          <span className="text-3xl" role="img" aria-hidden="true">{meta.emoji}</span>
          <div>
            <span className="text-xs font-semibold tracking-widest text-primary uppercase">장르</span>
            <h1 className="text-3xl font-bold text-foreground">{meta.label} 공연</h1>
          </div>
        </div>
        <p className="max-w-2xl text-base text-muted-foreground leading-relaxed">{meta.description}</p>

        {/* 장르 빠른 이동 */}
        <div className="flex flex-wrap gap-2 pt-1">
          {Object.entries(GENRE_MAP).map(([slug, g]) => (
            <Link
              key={slug}
              href={`/shows/genre/${slug}`}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all ${
                slug === genre
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:border-primary/50 hover:text-primary"
              }`}
            >
              <span>{g.emoji}</span>
              {g.label}
            </Link>
          ))}
        </div>
      </section>

      {/* 공연 그리드 */}
      <section className="mx-auto mt-12 max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">
            {meta.label} 공연 목록
            <span className="ml-2 text-sm font-normal text-muted-foreground">({sorted.length}개)</span>
          </h2>
          <Link href="/shows" className="text-sm text-primary font-semibold hover:underline underline-offset-2">
            전체 보기
          </Link>
        </div>

        {sorted.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-background/60 p-16 text-center">
            <p className="text-sm font-semibold text-foreground">현재 등록된 {meta.label} 공연이 없습니다</p>
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
              const campaignSlug = "id" in perf ? campaignByPerfId[(perf as { id: string }).id] : undefined
              return (
                <PerformanceCard
                  key={"id" in perf ? String((perf as { id: string }).id) : Math.random().toString()}
                  perf={perf}
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
          <h2 className="text-base font-bold text-foreground">{meta.label} 공연 초대권 이벤트란?</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            알터즈는 공연 파트너사와 협력하여 {meta.label} 공연 초대권 이벤트를 정기적으로 진행합니다.
            응모 후 추첨을 통해 선정된 분들께 무료 초대권을 제공하며,
            당첨자는 이메일로 안내를 받으실 수 있습니다.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            초대권 이벤트에 참여하려면 이벤트 페이지에서 간단한 정보를 입력하고 응모하시면 됩니다.
            노쇼 없이 공연을 즐기신 후 짧은 후기를 남겨주시면 다음 이벤트에 우선권이 생깁니다.
          </p>
          <Link
            href="/invites/guide"
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline underline-offset-2"
          >
            초대권 이벤트 참여 가이드 →
          </Link>
        </div>
      </section>

      {/* 지역별 큐레이션 링크 */}
      <section className="mx-auto mt-12 max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-muted-foreground">지역별 공연 탐색</h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(REGION_MAP).map(([slug, r]) => (
            <Link
              key={slug}
              href={`/shows/region/${slug}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3.5 py-1.5 text-sm font-medium text-foreground transition hover:border-primary/50 hover:text-primary"
            >
              <span>{r.emoji}</span>
              {r.label}
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
  const periodStart = typeof perf.period_start === "string" ? perf.period_start : null
  const periodEnd = typeof perf.period_end === "string" ? perf.period_end : null

  const isActive = periodEnd ? new Date(periodEnd) > new Date() : true

  const href = slug ? `/shows/${slug}` : null

  const content = (
    <div className={`group rounded-2xl border overflow-hidden transition-all hover:shadow-md ${
      isActive ? "border-border" : "border-border/50 opacity-70"
    }`}>
      {/* 포스터 */}
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

      {/* 정보 */}
      <div className="p-3 space-y-1">
        <p className="text-sm font-semibold text-foreground line-clamp-2 leading-tight">{title}</p>
        <div className="flex flex-col gap-0.5 text-[11px] text-muted-foreground">
          {region && (
            <span className="flex items-center gap-1">
              <MapPin className="h-2.5 w-2.5 shrink-0" />
              {region}
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

  return href ? (
    <Link href={href} className="block">{content}</Link>
  ) : (
    <div>{content}</div>
  )
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
