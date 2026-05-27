import type { Metadata } from "next"
import type React from "react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  Award,
  CalendarDays,
  ChevronLeft,
  Clapperboard,
  Clock,
  ExternalLink,
  Globe,
  MapPin,
  Share2,
  Ticket,
  Users,
} from "lucide-react"
import { DetailImageGallery } from "@/components/performances/DetailImageGallery"
import { ReviewSummary } from "@/components/reviews/ReviewSummary"
import { BookmarkButton } from "@/components/shows/BookmarkButton"
import { getPosterFallback } from "@/constants/posters"
import {
  getCampaignByPerformanceId,
  getCommunityPostsByPerformance,
  getOrganizationById,
  getPerformanceBySlug,
  getReviewSummary,
  getSnsPickForPerformance,
} from "@/lib/supabase/queries"
import { BlogCard } from "@/components/blog/BlogCard"
import { checkIsBookmarked } from "@/app/my/actions"
import { GENRE_MAP, REGION_MAP } from "@/constants/curation"

type RawPerformance = Awaited<ReturnType<typeof getPerformanceBySlug>>

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://artause.co.kr"

const isPerformanceRecord = (record: RawPerformance): record is NonNullable<RawPerformance> =>
  Boolean(record && typeof record === "object" && "id" in record && "title" in record)

/** OG 이미지 URL 결정 */
function resolveOgImage(
  title: string,
  description: string,
  posterUrl?: string | null
): { url: string; width: number; height: number; alt: string } {
  if (posterUrl) return { url: posterUrl, width: 800, height: 600, alt: title }
  const params = new URLSearchParams({ title, description: description.slice(0, 120), type: "show" })
  return { url: `${SITE_URL}/api/og?${params.toString()}`, width: 1200, height: 630, alt: `${title} | 알터즈` }
}

/** cast_info/crew_info 파싱: "홍길동, 김철수(역할)" → ["홍길동", "김철수(역할)"] */
function parseNames(raw: string | null | undefined): string[] {
  if (!raw) return []
  return raw
    .split(/[,，\n]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 30)
}

/** price_info 파싱: "R석 80,000원, S석 50,000원" → [{grade, price}] */
function parsePrices(raw: string | null | undefined): Array<{ grade: string; price: string }> {
  if (!raw) return []
  // 한국 금액 패턴으로 분리 ("R석 80,000원" 형태)
  const segments = raw.split(/(?<=원)[,\s/]+|[\n]+/).map((s) => s.trim()).filter(Boolean)
  return segments.map((seg) => {
    // "R석 80,000원" or "전석 무료" 형태 파싱
    const match = seg.match(/^(.+?)\s+([\d,]+원|무료|전석무료|초대)$/)
    if (match) return { grade: match[1].trim(), price: match[2].trim() }
    return { grade: "가격", price: seg }
  })
}

/** schedule_info 파싱: "화~금 19:30, 토 14:00/19:00" → [{day, times}] */
function parseSchedule(raw: string | null | undefined): Array<{ day: string; times: string[] }> {
  if (!raw) return []
  const segments = raw.split(",").map((s) => s.trim()).filter(Boolean)
  return segments.map((seg) => {
    // "화~금 19:30" or "토 14:00/19:00" 형태
    const match = seg.match(/^([가-힣~]+(?:요일)?)\s+(.+)$/)
    if (match) {
      const day = match[1].trim()
      const times = match[2].split(/[/\s]+/).map((t) => t.trim()).filter((t) => /\d+:\d+/.test(t))
      return { day, times: times.length ? times : [match[2].trim()] }
    }
    return { day: "공연", times: [seg] }
  })
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const performance = await getPerformanceBySlug(slug)

  if (!isPerformanceRecord(performance)) {
    return { title: "공연 정보", description: "알터즈 공연 상세 페이지", alternates: { canonical: `/shows/${slug}` } }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d = performance as any
  const description =
    d.hero_subtitle ?? d.description ?? d.synopsis ??
    `${performance.title} 공연 정보와 연결된 초대 이벤트를 확인해 보세요.`
  const ogImage = resolveOgImage(performance.title, description, performance.poster_url)

  return {
    title: performance.title,
    description,
    alternates: { canonical: `/shows/${slug}` },
    openGraph: {
      title: `${performance.title} | 알터즈`,
      description,
      url: `/shows/${slug}`,
      type: "article",
      images: [{ url: ogImage.url, width: ogImage.width, height: ogImage.height, alt: ogImage.alt }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${performance.title} | 알터즈`,
      description,
      images: [ogImage.url],
    },
  }
}

export default async function ShowDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const performance = await getPerformanceBySlug(slug)
  if (!isPerformanceRecord(performance)) notFound()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d = performance as any

  const [campaign, isBookmarked, reviewSummary, organization, relatedPosts, snsPick] = await Promise.all([
    getCampaignByPerformanceId(performance.id),
    checkIsBookmarked(performance.id).catch(() => false),
    getReviewSummary(performance.id),
    d.organization_id ? getOrganizationById(d.organization_id as string).catch(() => null) : null,
    getCommunityPostsByPerformance(performance.id).catch(() => []),
    getSnsPickForPerformance(performance.id).catch(() => null),
  ])

  // ─── Field extraction ───────────────────────────────────────────
  const status = d.status as string | null
  const openrunLabel = d.openrun === "Y" ? "오픈런" : null
  const category = d.category as string | null
  const tags = [category, ...(Array.isArray(d.tags) ? d.tags : []), status, openrunLabel].filter(Boolean) as string[]

  const posterUrl = performance.poster_url ?? getPosterFallback(0)
  const synopsis = d.description ?? d.synopsis ?? "공연 소개가 곧 업데이트될 예정입니다."
  const heroSubtitle = d.hero_subtitle as string | null

  // KOPIS enriched fields
  const castNames = parseNames(d.cast_info)
  const crewNames = parseNames(d.crew_info)
  const prices = parsePrices(d.price_info)
  const schedule = parseSchedule(d.schedule_info)
  const runtime = d.runtime_text as string | null
  const ageLimit = d.age_limit as string | null
  const ticketLink = d.ticket_link as string | null
  const orgName = d.organization as string | null

  // Detail images (KOPIS 상세 이미지)
  const detailImages: string[] = (() => {
    const raw = d.detail_images
    if (Array.isArray(raw)) return raw.filter((u: unknown): u is string => typeof u === "string")
    return []
  })()

  const kopisSections = isSectionMap(d.kopis_sections) ? d.kopis_sections as Record<string, unknown> : null
  const campaignHref = campaign?.slug ? `/invites/${campaign.slug}` : "/invites"
  const mobileCTAHref = campaign?.slug ? `/invites/${campaign.slug}` : ticketLink ?? "/invites"
  const mobileCTALabel = campaign ? "✨ 초대권 응모하기" : ticketLink ? "티켓 예매하기" : "초대권 전체보기"

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: performance.title,
    ...(d.period_start && { startDate: d.period_start }),
    ...(d.period_end && { endDate: d.period_end }),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    ...(d.venue && {
      location: {
        "@type": "Place",
        name: d.venue,
        address: { "@type": "PostalAddress", addressLocality: d.region ?? undefined, addressCountry: "KR" },
      },
    }),
    image: performance.poster_url ? [performance.poster_url] : [`${SITE_URL}/og-default.png`],
    description: synopsis,
    ...(orgName && { organizer: { "@type": "Organization", name: orgName } }),
    ...(castNames.length > 0 && {
      performer: castNames.slice(0, 5).map((name) => ({ "@type": "Person", name: name.replace(/\(.*?\)/, "").trim() })),
    }),
    ...(prices.length > 0 && {
      offers: {
        "@type": "Offer",
        name: prices[0].price,
        priceCurrency: "KRW",
        availability: status === "completed" ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
        ...(ticketLink && { url: ticketLink }),
      },
    }),
    url: `${SITE_URL}/shows/${slug}`,
    ...(reviewSummary.totalCount > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: String(reviewSummary.avgRating),
        bestRating: "5",
        worstRating: "1",
        ratingCount: String(reviewSummary.totalCount),
      },
    }),
  }

  return (
    <div className="pb-32 pt-6 text-foreground">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* 모바일 하단 고정 CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border/60 bg-background/95 px-4 py-3 backdrop-blur-xl lg:hidden">
        <a
          href={mobileCTAHref}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-base font-bold text-primary-foreground shadow-lg shadow-primary/25 transition hover:bg-primary/90"
        >
          {mobileCTALabel}
        </a>
      </div>

      <section className="mx-auto max-w-6xl space-y-6 px-4 sm:px-6 lg:px-8">
        {/* 브레드크럼 */}
        <nav aria-label="breadcrumb">
          <Link
            href="/shows"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-primary"
          >
            <ChevronLeft className="h-4 w-4" />
            공연 목록
          </Link>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[1.1fr,1fr] lg:items-start">
          {/* 포스터 */}
          <div className="spotlight-card relative overflow-hidden">
            <div className="relative h-[420px] w-full">
              <Image src={posterUrl} alt={performance.title} fill className="object-cover" priority />
              <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
            </div>
          </div>

          {/* 메타 */}
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                {/* 알터즈 픽 뱃지 */}
                {snsPick && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-br from-primary/90 to-primary px-3 py-1 text-xs font-bold text-primary-foreground shadow-sm">
                    ✦ 알터즈 픽
                  </span>
                )}
                {tags.slice(0, 6).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border/70 bg-background/70 px-3 py-1 text-foreground/80"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h1 className="text-3xl font-semibold sm:text-4xl">{performance.title}</h1>
              {(heroSubtitle ?? synopsis) && (
                <p className="text-base text-muted-foreground line-clamp-3">{heroSubtitle ?? synopsis}</p>
              )}
              {snsPick?.caption && (
                <div className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-foreground/80 leading-relaxed">
                  <span className="mr-1.5 font-bold text-primary text-xs">✦ 알터즈 픽</span>
                  {snsPick.caption}
                </div>
              )}
            </div>

            {/* 공연 기본 정보 */}
            <div className="grid gap-3 rounded-2xl border border-border bg-background/60 p-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary shrink-0" />
                <span className="highlight-token">{formatPeriod(d.period_start, d.period_end)}</span>
              </div>
              {d.venue && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                  <span className="highlight-token">{d.venue}{d.region ? ` · ${d.region}` : ""}</span>
                </div>
              )}
              {runtime && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary shrink-0" />
                  <span>러닝타임: {runtime}</span>
                </div>
              )}
              {ageLimit && (
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-primary shrink-0" />
                  <span>관람 연령: {ageLimit}</span>
                </div>
              )}
            </div>

            {/* 버튼 */}
            <div className="flex flex-wrap gap-3">
              <BookmarkButton performanceId={performance.id} initialBookmarked={isBookmarked} showLabel />
              {ticketLink ? (
                <a
                  href={ticketLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 justify-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
                >
                  예매/문의
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : (
                <span className="inline-flex items-center justify-center rounded-full border border-border px-5 py-2 text-sm font-semibold text-foreground/70">
                  예매 정보 준비 중
                </span>
              )}
              {campaign && (
                <Link
                  href={campaignHref}
                  className="inline-flex items-center justify-center rounded-full border border-primary/40 bg-primary/10 px-5 py-2 text-sm font-semibold text-primary transition hover:bg-primary/20"
                >
                  초대 이벤트 보기
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── 상세 콘텐츠 ─── */}
      <section className="mx-auto mt-14 max-w-6xl space-y-10 px-4 sm:px-6 lg:px-8">

        {/* 작품 소개 */}
        <div className="space-y-6 border-t border-border/60 pt-10">
          <h2 className="text-2xl font-semibold">작품 소개</h2>
          {synopsis && (
            <p className="whitespace-pre-line text-base text-muted-foreground leading-relaxed">{synopsis}</p>
          )}
          {detailImages.length > 0 && (
            <DetailImageGallery title={performance.title} images={detailImages} />
          )}
        </div>

        {/* 출연진 */}
        {castNames.length > 0 && (
          <div id="cast" className="space-y-4 border-t border-border/60 pt-10">
            <h2 className="flex items-center gap-2 text-2xl font-semibold">
              <Users className="h-5 w-5 text-primary" />
              출연진
            </h2>
            <div className="flex flex-wrap gap-2">
              {castNames.map((name, i) => (
                <CastChip key={i} name={name} />
              ))}
            </div>
          </div>
        )}

        {/* 제작진 */}
        {crewNames.length > 0 && (
          <div id="crew" className="space-y-4 border-t border-border/60 pt-10">
            <h2 className="flex items-center gap-2 text-2xl font-semibold">
              <Clapperboard className="h-5 w-5 text-primary" />
              제작진
            </h2>
            <div className="flex flex-wrap gap-2">
              {crewNames.map((name, i) => (
                <CrewChip key={i} name={name} />
              ))}
            </div>
          </div>
        )}

        {/* 제작사/단체 */}
        {(orgName || organization) && (
          <div className="space-y-4 border-t border-border/60 pt-10">
            <h2 className="flex items-center gap-2 text-2xl font-semibold">
              <Users className="h-5 w-5 text-primary" />
              제작 단체
            </h2>
            {organization ? (
              <OrgCard org={organization} />
            ) : (
              <div className="rounded-2xl border border-border bg-background/60 p-4 text-sm text-foreground">
                {orgName}
              </div>
            )}
          </div>
        )}

        {/* 티켓 가격 */}
        {prices.length > 0 && (
          <div id="price" className="space-y-4 border-t border-border/60 pt-10">
            <h2 className="flex items-center gap-2 text-2xl font-semibold">
              <Ticket className="h-5 w-5 text-primary" />
              티켓 가격
            </h2>
            <div className="overflow-hidden rounded-2xl border border-border">
              {prices.map((p, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b border-border/60 px-5 py-3 last:border-b-0 odd:bg-background/60 even:bg-background/30 text-sm"
                >
                  <span className="font-medium text-foreground">{p.grade}</span>
                  <span className="font-bold text-primary tabular-nums">{p.price}</span>
                </div>
              ))}
            </div>
            {ticketLink && (
              <a
                href={ticketLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
              >
                티켓 예매하러 가기 <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        )}

        {/* 공연 일정 */}
        {schedule.length > 0 && (
          <div id="schedule" className="space-y-4 border-t border-border/60 pt-10">
            <h2 className="flex items-center gap-2 text-2xl font-semibold">
              <CalendarDays className="h-5 w-5 text-primary" />
              공연 일정
            </h2>
            <div className="overflow-hidden rounded-2xl border border-border">
              {schedule.map((s, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 border-b border-border/60 px-5 py-3 last:border-b-0 odd:bg-background/60 even:bg-background/30 text-sm"
                >
                  <span className="w-20 shrink-0 font-semibold text-foreground">{s.day}</span>
                  <div className="flex flex-wrap gap-2">
                    {s.times.map((t, j) => (
                      <span
                        key={j}
                        className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 수상·이력 — KOPIS 섹션 */}
        {kopisSections && (() => {
          const usefulSections = [
            { key: "awardList",    icon: <Award className="h-4 w-4 text-amber-500" />,    title: "수상 이력" },
            { key: "festivalList", icon: <Award className="h-4 w-4 text-rose-400" />,     title: "참여 축제" },
            { key: "creatorList",  icon: <Clapperboard className="h-4 w-4 text-violet-400" />, title: "원작·창작" },
            { key: "producerList", icon: <Users className="h-4 w-4 text-sky-400" />,      title: "기획·제작사" },
          ]
          const populated = usefulSections.filter(
            (s) => getSectionBlocks(kopisSections[s.key] ?? null).length > 0
          )
          if (populated.length === 0) return null

          return (
            <div className="space-y-5 border-t border-border/60 pt-10">
              <h2 className="text-2xl font-semibold">공연 이력</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {populated.map((section) => {
                  const blocks = getSectionBlocks(kopisSections[section.key] ?? null)
                  return (
                    <article key={section.key} className="rounded-2xl border border-border bg-background/60 p-5 space-y-3">
                      <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
                        {section.icon}
                        {section.title}
                      </h3>
                      <div className="space-y-3">
                        {blocks.slice(0, 3).map((block, index) => (
                          <dl key={index} className="space-y-1 text-sm text-muted-foreground border-t border-border/40 pt-3 first:border-t-0 first:pt-0">
                            {block.slice(0, 4).map((entry) => (
                              <div key={entry.label} className="flex gap-2">
                                <dt className="shrink-0 w-16 font-medium text-foreground/70 text-xs">{entry.label}</dt>
                                <dd className="break-words">{entry.value}</dd>
                              </div>
                            ))}
                          </dl>
                        ))}
                      </div>
                    </article>
                  )
                })}
              </div>
            </div>
          )
        })()}

        {/* 초대 이벤트 */}
        <div className="space-y-4 border-t border-border/60 pt-10">
          <h2 className="text-2xl font-semibold">초대 이벤트 안내</h2>
          {campaign ? (
            <div className="space-y-4 rounded-2xl border border-primary/30 bg-primary/5 p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-widest text-primary">이 공연과 연결된 이벤트</p>
                  <h3 className="text-lg font-bold text-foreground">{campaign.title}</h3>
                  {campaign.description && <p className="text-sm text-muted-foreground">{campaign.description}</p>}
                </div>
                {campaign.reward && (
                  <span className="shrink-0 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-sm font-bold text-primary">
                    {campaign.reward}
                  </span>
                )}
              </div>
              {campaign.ends_at && (
                <p className="text-xs text-muted-foreground">
                  마감:{" "}
                  <span className="font-semibold text-foreground">
                    {new Date(campaign.ends_at).toLocaleDateString("ko-KR", { month: "long", day: "numeric" })}
                  </span>
                </p>
              )}
              <Link
                href={campaignHref}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:bg-primary/90"
              >
                <Ticket className="h-4 w-4" />
                이벤트 응모하기
              </Link>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-background/60 p-6 text-sm text-muted-foreground">
              현재 연결된 초대 이벤트가 없습니다.{" "}
              <Link href="/invites" className="font-semibold text-primary hover:underline">
                전체 이벤트 보기
              </Link>
            </div>
          )}
        </div>

        {/* 리뷰 */}
        <div className="space-y-4 border-t border-border/60 pt-10">
          <ReviewSummary performanceId={performance.id} performanceSlug={slug} />
        </div>

        {/* 관련 에세이 */}
        {relatedPosts.length > 0 && (
          <div className="space-y-4 border-t border-border/60 pt-10">
            <h2 className="text-xl font-semibold">이 공연의 에세이</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {relatedPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        )}

        {/* 유의사항 */}
        <div className="space-y-4 border-t border-border/60 pt-10">
          <h2 className="text-2xl font-semibold">유의사항</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>공연 및 예매 정보는 주최 측 사정에 따라 변경될 수 있습니다.</li>
            <li>공연 소개 이미지는 참고용이며 실제와 다를 수 있습니다.</li>
            <li>공연 관련 문의는 주최 측 공식 채널을 이용해 주세요.</li>
          </ul>
        </div>

        {/* 같은 장르/지역 탐색 링크 */}
        <div className="space-y-4 border-t border-border/60 pt-10">
          <h2 className="text-xl font-semibold">더 많은 공연 탐색</h2>
          <div className="flex flex-wrap gap-3">
            {category && (() => {
              const genreEntry = Object.entries(GENRE_MAP).find(([, g]) => g.categoryValue === category)
              if (!genreEntry) return null
              const [genreSlug, genreMeta] = genreEntry
              return (
                <Link
                  href={`/shows/genre/${genreSlug}`}
                  className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/10"
                >
                  <span>{genreMeta.emoji}</span>
                  {genreMeta.label} 공연 더보기
                </Link>
              )
            })()}
            {d.region && (() => {
              const regionEntry = Object.entries(REGION_MAP).find(([, r]) =>
                String(d.region).includes(r.categoryValue)
              )
              if (!regionEntry) return null
              const [regionSlug, regionMeta] = regionEntry
              return (
                <Link
                  href={`/shows/region/${regionSlug}`}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary/40 hover:text-primary"
                >
                  <span>{regionMeta.emoji}</span>
                  {regionMeta.label} 공연 전체보기
                </Link>
              )
            })()}
            <Link
              href="/shows"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
            >
              공연 전체 검색
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CastChip({ name }: { name: string }) {
  // "(역할명)" 분리
  const match = name.match(/^(.+?)\s*\((.+?)\)$/)
  if (match) {
    return (
      <div className="flex flex-col items-center gap-0.5 rounded-2xl border border-border bg-background/60 px-4 py-2.5 text-center text-sm">
        <span className="font-semibold text-foreground">{match[1].trim()}</span>
        <span className="text-xs text-muted-foreground">{match[2].trim()}</span>
      </div>
    )
  }
  return (
    <span className="rounded-full border border-border bg-background/60 px-4 py-2 text-sm font-medium text-foreground">
      {name}
    </span>
  )
}

function CrewChip({ name }: { name: string }) {
  // "역할 이름" 또는 "역할: 이름" 형태 파싱
  const colonMatch = name.match(/^(.+?)[:：]\s*(.+)$/)
  const spaceMatch = !colonMatch ? name.match(/^(연출|작가|작곡|음악감독|조명|무대|안무|의상|분장|제작|기획|협력)\s+(.+)$/) : null
  const role = colonMatch?.[1] ?? spaceMatch?.[1]
  const person = colonMatch?.[2] ?? spaceMatch?.[2]

  if (role && person) {
    return (
      <div className="flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-4 py-2 text-sm">
        <span className="text-xs font-semibold text-muted-foreground">{role}</span>
        <span className="font-medium text-foreground">{person}</span>
      </div>
    )
  }
  return (
    <span className="rounded-full border border-border bg-background/60 px-4 py-2 text-sm font-medium text-foreground">
      {name}
    </span>
  )
}

function OrgCard({
  org,
}: {
  org: { id: string; slug: string; name: string; tagline?: string | null; description?: string | null; logo_url?: string | null; genre_focus?: string[] | null; instagram?: string | null; website?: string | null }
}) {
  return (
    <div className="rounded-2xl border border-border bg-background/60 p-5 space-y-3">
      <div className="flex items-start gap-4">
        {org.logo_url && (
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-border">
            <Image src={org.logo_url} alt={org.name} fill className="object-contain p-1" sizes="56px" />
          </div>
        )}
        <div className="min-w-0 space-y-1">
          <Link
            href={`/partners/${org.slug}`}
            className="text-base font-bold text-foreground hover:text-primary transition"
          >
            {org.name}
          </Link>
          {org.tagline && <p className="text-sm text-muted-foreground">{org.tagline}</p>}
          {org.genre_focus && org.genre_focus.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {org.genre_focus.map((g) => (
                <span key={g} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {g}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-3">
        <Link
          href={`/partners/${org.slug}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          <Users className="h-3.5 w-3.5" />
          단체 프로필 보기
        </Link>
        {org.instagram && (
          <a
            href={`https://instagram.com/${org.instagram.replace("@", "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <Globe className="h-3.5 w-3.5" />
            Instagram
          </a>
        )}
        {org.website && (
          <a
            href={org.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <Globe className="h-3.5 w-3.5" />
            웹사이트
          </a>
        )}
      </div>
    </div>
  )
}

// ─── Utility functions ────────────────────────────────────────────────────────

function formatShortDate(value?: string | null) {
  if (!value) return "미정"
  return new Date(value).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })
}

function formatPeriod(start?: string | null, end?: string | null) {
  if (!start && !end) return "일정 미정"
  const s = formatShortDate(start)
  const e = formatShortDate(end)
  return s === e ? s : `${s} ~ ${e}`
}

function isSectionMap(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value))
}

function getSectionBlocks(value: unknown): Array<Array<{ label: string; value: string }>> {
  if (!value) return []
  if (Array.isArray(value)) {
    return value.map((item) => normalizeSectionEntries(item)).filter((e) => e.length > 0)
  }
  const single = normalizeSectionEntries(value)
  return single.length ? [single] : []
}

function normalizeSectionEntries(value: unknown): Array<{ label: string; value: string }> {
  if (!isSectionMap(value)) {
    const text = formatSectionValue(value)
    return text ? [{ label: "내용", value: text }] : []
  }
  return Object.entries(value)
    .map(([label, v]) => {
      const formatted = formatSectionValue(v)
      return formatted ? { label, value: formatted } : null
    })
    .filter((e): e is { label: string; value: string } => Boolean(e))
}

function formatSectionValue(value: unknown): string | null {
  if (typeof value === "string") return value.trim() || null
  if (typeof value === "number" || typeof value === "boolean") return String(value)
  if (Array.isArray(value)) {
    const parts = value.map((i) => formatSectionValue(i)).filter((i): i is string => Boolean(i))
    return parts.length ? parts.join("\n") : null
  }
  if (isSectionMap(value)) {
    const parts = Object.entries(value)
      .map(([k, v]) => { const f = formatSectionValue(v); return f ? `${k}: ${f}` : null })
      .filter((i): i is string => Boolean(i))
    return parts.length ? parts.join("\n") : null
  }
  return null
}
