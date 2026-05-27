import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  CalendarDays,
  ChevronLeft,
  ExternalLink,
  Globe,
  Instagram,
  MapPin,
  Users,
  Youtube,
} from "lucide-react"
import { getOrganizationBySlug, getPerformancesByOrganization } from "@/lib/supabase/queries"
import { getPosterFallback } from "@/constants/posters"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://artause.co.kr"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const org = await getOrganizationBySlug(slug).catch(() => null)

  if (!org) return { title: "공연 단체 | 알터즈" }

  const title = `${org.name} | 알터즈`
  const description =
    org.tagline ?? org.description?.slice(0, 120) ?? `${org.name}의 공연 소개와 활동을 확인하세요.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/partners/${slug}`,
      ...(org.logo_url && { images: [{ url: org.logo_url, alt: org.name }] }),
    },
    alternates: { canonical: `${SITE_URL}/partners/${slug}` },
  }
}

export default async function PartnerProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const [org, performances] = await Promise.all([
    getOrganizationBySlug(slug).catch(() => null),
    getOrganizationBySlug(slug)
      .then((o) => (o ? getPerformancesByOrganization(o.id) : []))
      .catch(() => []),
  ])

  if (!org) notFound()

  // JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "PerformingGroup",
    name: org.name,
    description: org.tagline ?? org.description ?? undefined,
    url: `${SITE_URL}/partners/${slug}`,
    ...(org.logo_url && { logo: org.logo_url }),
    ...(org.instagram && { sameAs: [`https://instagram.com/${org.instagram.replace("@", "")}`] }),
  }

  const genreList = Array.isArray(org.genre_focus) ? org.genre_focus : []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ongoing = performances.filter((p: any) => p.status !== "completed")
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const completed = performances.filter((p: any) => p.status === "completed")

  return (
    <div className="pb-24 pt-8 text-foreground">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        {/* 브레드크럼 */}
        <Link
          href="/shows"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-primary"
        >
          <ChevronLeft className="h-4 w-4" />
          공연 목록으로
        </Link>

        {/* 프로필 헤더 */}
        <header className="stage-panel mb-10 overflow-hidden">
          {/* 커버 이미지 */}
          {org.cover_image_url && (
            <div className="relative h-40 w-full sm:h-52">
              <Image
                src={org.cover_image_url}
                alt={`${org.name} 커버`}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
            </div>
          )}

          <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-end sm:gap-6 sm:p-8">
            {/* 로고 */}
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 border-border bg-background shadow-md sm:h-24 sm:w-24">
              {org.logo_url ? (
                <Image src={org.logo_url} alt={org.name} fill className="object-contain p-2" sizes="96px" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                  <Users className="h-10 w-10" />
                </div>
              )}
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="cue">Performance Company</span>
                {genreList.map((g) => (
                  <span
                    key={g}
                    className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary"
                  >
                    {g}
                  </span>
                ))}
              </div>
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{org.name}</h1>
              {org.tagline && (
                <p className="text-sm text-muted-foreground">{org.tagline}</p>
              )}
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                {org.region && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {org.region}
                  </span>
                )}
                {org.follower_count > 0 && (
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    팔로워 {org.follower_count.toLocaleString()}명
                  </span>
                )}
              </div>
            </div>

            {/* SNS 링크 */}
            <div className="flex gap-2">
              {org.instagram && (
                <a
                  href={`https://instagram.com/${org.instagram.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background/70 text-muted-foreground transition hover:border-primary/40 hover:text-primary"
                >
                  <Instagram className="h-4 w-4" />
                </a>
              )}
              {org.youtube && (
                <a
                  href={org.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background/70 text-muted-foreground transition hover:border-primary/40 hover:text-primary"
                >
                  <Youtube className="h-4 w-4" />
                </a>
              )}
              {org.website && (
                <a
                  href={org.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Website"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background/70 text-muted-foreground transition hover:border-primary/40 hover:text-primary"
                >
                  <Globe className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        </header>

        {/* 소개글 */}
        {org.description && (
          <section className="mb-10 space-y-3">
            <h2 className="text-lg font-bold text-foreground">단체 소개</h2>
            <p className="whitespace-pre-line text-sm text-muted-foreground leading-relaxed">
              {org.description}
            </p>
          </section>
        )}

        {/* 진행 중 공연 */}
        {ongoing.length > 0 && (
          <section className="mb-10 space-y-4">
            <h2 className="text-lg font-bold text-foreground">
              현재 공연 <span className="text-primary">{ongoing.length}</span>
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {ongoing.map((p: any) => (
                <PerformanceCard key={p.id} performance={p} />
              ))}
            </div>
          </section>
        )}

        {/* 지난 공연 */}
        {completed.length > 0 && (
          <section className="mb-10 space-y-4">
            <h2 className="text-lg font-bold text-foreground">
              지난 공연 <span className="text-muted-foreground">{completed.length}</span>
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {completed.slice(0, 12).map((p: any) => (
                <PerformanceCard key={p.id} performance={p} compact />
              ))}
            </div>
          </section>
        )}

        {performances.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-background/60 p-12 text-center">
            <p className="text-sm text-muted-foreground">등록된 공연 정보가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PerformanceCard({
  performance,
  compact = false,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  performance: any
  compact?: boolean
}) {
  const posterUrl = performance.poster_url ?? getPosterFallback(0)
  const isCompleted = performance.status === "completed"

  return (
    <Link
      href={`/shows/${performance.slug}`}
      className="group flex gap-3 rounded-2xl border border-border bg-background/60 p-3 transition hover:border-primary/30 hover:bg-primary/5"
    >
      <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded-lg shadow-sm">
        <Image
          src={posterUrl}
          alt={performance.title}
          fill
          className={`object-cover transition group-hover:scale-105 ${isCompleted ? "opacity-60 grayscale" : ""}`}
          sizes="56px"
        />
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        {isCompleted && (
          <span className="text-xs font-semibold text-muted-foreground">종료</span>
        )}
        <p className={`font-semibold text-foreground leading-tight line-clamp-2 ${compact ? "text-sm" : "text-base"}`}>
          {performance.title}
        </p>
        {performance.venue && (
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" />
            {performance.venue}
          </p>
        )}
        {(performance.period_start || performance.period_end) && (
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <CalendarDays className="h-3 w-3 shrink-0" />
            {formatPeriod(performance.period_start, performance.period_end)}
          </p>
        )}
      </div>
    </Link>
  )
}

function formatShortDate(value?: string | null) {
  if (!value) return "미정"
  return new Date(value).toLocaleDateString("ko-KR", { year: "numeric", month: "short", day: "numeric" })
}

function formatPeriod(start?: string | null, end?: string | null) {
  if (!start && !end) return "일정 미정"
  const s = formatShortDate(start)
  const e = formatShortDate(end)
  return s === e ? s : `${s} ~ ${e}`
}
