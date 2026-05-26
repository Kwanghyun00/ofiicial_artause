import type { Metadata } from "next"
import type React from "react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Award, CalendarDays, ChevronLeft, Clapperboard, MapPin, Share2, Ticket, Users } from "lucide-react"
import { DetailImageGallery } from "@/components/performances/DetailImageGallery"
import { ReviewSummary } from "@/components/reviews/ReviewSummary"
import { BookmarkButton } from "@/components/shows/BookmarkButton"
import { getPosterFallback } from "@/constants/posters"
import { getCampaignByPerformanceId, getPerformanceBySlug } from "@/lib/supabase/queries"
import { checkIsBookmarked } from "@/app/my/actions"

type RawPerformance = Awaited<ReturnType<typeof getPerformanceBySlug>>

type PerformanceDetailFields = {
  tags?: string[] | null
  openrun?: string | null
  synopsis?: string | null
  description?: string | null
  images?: string[] | null
  hero_subtitle?: string | null
  schedule?: string | null
  runtime?: string | null
  age_limit?: string | null
  price?: string | null
  ticket_link?: string | null
  cast?: string | null
  crew?: string | null
  kopis_sections_map?: Record<string, unknown> | null
  poster_url?: string | null
  venue?: string | null
  region?: string | null
  period_start?: string | null
  period_end?: string | null
  status?: string | null
  category?: string | null
  organization?: string | null
  title: string
  id: string
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://artause.co.kr"

const KOPIS_SECTION_ORDER = [
  { key: "performanceList", title: "공연목록" },
  { key: "performanceDetail", title: "공연상세" },
  { key: "facilityList", title: "공연시설목록" },
  { key: "facilityDetail", title: "공연시설상세" },
  { key: "producerList", title: "기획/제작사 목록" },
  { key: "awardList", title: "수상작 목록" },
  { key: "festivalList", title: "축제 목록" },
  { key: "creatorList", title: "원·창작자 목록" },
] as const

const isPerformanceRecord = (record: RawPerformance): record is NonNullable<RawPerformance> =>
  Boolean(record && typeof record === "object" && "id" in record && "title" in record)

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const performance = await getPerformanceBySlug(slug)

  if (!isPerformanceRecord(performance)) {
    return {
      title: "공연 정보",
      description: "알터즈 공연 상세 페이지",
      alternates: {
        canonical: `/shows/${slug}`,
      },
    }
  }

  const detailFields = performance as NonNullable<RawPerformance> & PerformanceDetailFields
  const description =
    detailFields.hero_subtitle ??
    detailFields.description ??
    detailFields.synopsis ??
    `${performance.title} 공연 정보와 연결된 초대 이벤트를 확인해 보세요.`

  const image = performance.poster_url ?? undefined

  return {
    title: performance.title,
    description,
    alternates: {
      canonical: `/shows/${slug}`,
    },
    openGraph: {
      title: `${performance.title} | 알터즈`,
      description,
      url: `/shows/${slug}`,
      type: "article",
      images: image
        ? [
            {
              url: image,
              alt: performance.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: `${performance.title} | 알터즈`,
      description,
      images: image ? [image] : undefined,
    },
  }
}

export default async function ShowDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const performance = await getPerformanceBySlug(slug)
  if (!isPerformanceRecord(performance)) {
    notFound()
  }

  const [campaign, isBookmarked] = await Promise.all([
    getCampaignByPerformanceId(performance.id),
    // checkIsBookmarked는 RSC에서 cookies() set이 실패할 수 있으므로 방어적 처리
    checkIsBookmarked(performance.id).catch(() => false),
  ])

  const detailFields = performance as NonNullable<RawPerformance> & PerformanceDetailFields
  const status = performance.status
  const openrunLabel = detailFields.openrun === "Y" ? "오픈런" : null
  const category =
    typeof performance === "object" && "category" in performance ? performance.category : null
  const tags = [
    category,
    ...(Array.isArray(detailFields.tags) ? detailFields.tags : []),
    status,
    openrunLabel,
  ].filter(Boolean)
  const posterUrl = performance.poster_url ?? getPosterFallback(0)
  const synopsis =
    detailFields.description ??
    detailFields.synopsis ??
    "공연 소개가 곧 업데이트될 예정입니다."
  const heroSubtitle = detailFields.hero_subtitle
  const images = Array.isArray(detailFields.images) ? detailFields.images : []
  const kopisSections = isSectionMap(detailFields.kopis_sections_map) ? detailFields.kopis_sections_map : null
  const campaignHref = campaign?.slug ? `/invites/${campaign.slug}` : "/invites"

  const schemaEventStatus =
    status === "completed"
      ? "https://schema.org/EventScheduled" // 종료됐어도 Scheduled 유지 (Google 권장)
      : "https://schema.org/EventScheduled"

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: performance.title,
    ...(performance.period_start && { startDate: performance.period_start }),
    ...(performance.period_end && { endDate: performance.period_end }),
    eventStatus: schemaEventStatus,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: performance.venue
      ? {
          "@type": "Place",
          name: performance.venue,
          address: {
            "@type": "PostalAddress",
            addressLocality: performance.region ?? undefined,
            addressCountry: "KR",
          },
        }
      : undefined,
    image: performance.poster_url
      ? [performance.poster_url]
      : [`${SITE_URL}/og-default.png`],
    description: synopsis,
    ...(performance.organization && {
      organizer: { "@type": "Organization", name: performance.organization },
    }),
    ...(detailFields.cast && {
      performer: detailFields.cast
        .split(/[,，]/)
        .slice(0, 5)
        .map((name: string) => ({ "@type": "Person", name: name.trim() })),
    }),
    ...(detailFields.price && {
      offers: {
        "@type": "Offer",
        name: detailFields.price,
        priceCurrency: "KRW",
        availability: status === "completed"
          ? "https://schema.org/SoldOut"
          : "https://schema.org/InStock",
        ...(detailFields.ticket_link && { url: detailFields.ticket_link }),
      },
    }),
    url: `${SITE_URL}/shows/${slug}`,
  }

  const mobileCTAHref = campaign?.slug
    ? `/invites/${campaign.slug}`
    : detailFields.ticket_link ?? "/invites"
  const mobileCTALabel = campaign ? "✨ 초대권 응모하기" : detailFields.ticket_link ? "티켓 예매하기" : "초대권 전체보기"

  return (
    <div className="pb-32 pt-6 text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

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
          <div className="spotlight-card relative overflow-hidden">
            <div className="relative h-[420px] w-full">
              <Image src={posterUrl} alt={performance.title} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
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
              <p className="text-base text-muted-foreground">{heroSubtitle ?? synopsis}</p>
            </div>

            <div className="grid gap-3 rounded-2xl border border-border bg-background/60 p-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                <span className="highlight-token">{formatPeriod(performance.period_start, performance.period_end)}</span>
              </div>
              {performance.region && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="highlight-token">{performance.region}</span>
                </div>
              )}
              {performance.venue && (
                <div className="flex items-center gap-2">
                  <Ticket className="h-4 w-4 text-primary" />
                  <span className="highlight-token">{performance.venue}</span>
                </div>
              )}
              {detailFields.schedule && <div>공연 일정: {detailFields.schedule}</div>}
              {detailFields.runtime && <div>러닝타임: {detailFields.runtime}</div>}
              {detailFields.age_limit && <div>관람 연령: {detailFields.age_limit}</div>}
              {detailFields.price && <div>가격: {detailFields.price}</div>}
            </div>

            <div className="flex flex-wrap gap-3">
              <BookmarkButton
                performanceId={performance.id}
                initialBookmarked={isBookmarked}
                showLabel
              />
              {detailFields.ticket_link ? (
                <Link
                  href={detailFields.ticket_link}
                  className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
                >
                  예매/문의
                </Link>
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

      <section className="mx-auto mt-14 max-w-6xl space-y-10 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6 border-t border-border/60 pt-10">
          <h2 className="text-2xl font-semibold">작품 소개</h2>
          {synopsis && (
            <p className="whitespace-pre-line text-base text-muted-foreground">{synopsis}</p>
          )}
          {images.length > 0 && (
            <DetailImageGallery title={performance.title} images={images} />
          )}
        </div>

        {/* 제작 · 출연 */}
        <div id="people" className="space-y-5 border-t border-border/60 pt-10">
          <h2 className="text-2xl font-semibold">제작 · 출연</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <CreditCard
              icon={<Users className="h-4 w-4 text-primary" />}
              label="제작"
              value={performance.organization}
            />
            <CreditCard
              icon={<Clapperboard className="h-4 w-4 text-primary" />}
              label="출연"
              value={detailFields.cast}
            />
            <CreditCard
              icon={<Clapperboard className="h-4 w-4 text-primary" />}
              label="스태프"
              value={detailFields.crew}
            />
          </div>
        </div>

        {/* 수상 · 이력 — KOPIS의 수상/축제/원창작 정보만 표시 */}
        {kopisSections && (() => {
          const usefulSections = [
            { key: "awardList",   icon: <Award className="h-4 w-4 text-amber-500" />, title: "수상 이력" },
            { key: "festivalList", icon: <Award className="h-4 w-4 text-rose-400" />, title: "참여 축제" },
            { key: "creatorList",  icon: <Clapperboard className="h-4 w-4 text-violet-400" />, title: "원작·창작" },
            { key: "producerList", icon: <Users className="h-4 w-4 text-sky-400" />, title: "기획·제작사" },
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

        <div className="space-y-4 border-t border-border/60 pt-10">
          <ReviewSummary performanceId={performance.id} performanceSlug={slug} />
        </div>

        <div className="space-y-4 border-t border-border/60 pt-10">
          <h2 className="text-2xl font-semibold">유의사항</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>공연 및 예매 정보는 주최 측 사정에 따라 변경될 수 있습니다.</li>
            <li>공연 소개 이미지는 참고용이며 실제와 다를 수 있습니다.</li>
            <li>공연 관련 문의는 주최 측 공식 채널을 이용해 주세요.</li>
          </ul>
        </div>
      </section>
    </div>
  )
}

function formatShortDate(value?: string | null) {
  if (!value) return "미정"
  return new Date(value).toLocaleDateString("ko-KR", {
    month: "short",
    day: "numeric",
  })
}

function formatPeriod(start?: string | null, end?: string | null) {
  if (!start && !end) return "일정 미정"
  const startText = formatShortDate(start)
  const endText = formatShortDate(end)
  if (startText === endText) return startText
  return `${startText} ~ ${endText}`
}

function isSectionMap(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value))
}

function getSectionBlocks(value: unknown): Array<Array<{ label: string; value: string }>> {
  if (!value) return []

  if (Array.isArray(value)) {
    return value.map((item) => normalizeSectionEntries(item)).filter((entries) => entries.length > 0)
  }

  const singleBlock = normalizeSectionEntries(value)
  return singleBlock.length ? [singleBlock] : []
}

function normalizeSectionEntries(value: unknown): Array<{ label: string; value: string }> {
  if (!isSectionMap(value)) {
    const text = formatSectionValue(value)
    return text ? [{ label: "내용", value: text }] : []
  }

  return Object.entries(value)
    .map(([label, entryValue]) => {
      const formatted = formatSectionValue(entryValue)
      return formatted ? { label, value: formatted } : null
    })
    .filter((entry): entry is { label: string; value: string } => Boolean(entry))
}

function CreditCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value?: string | null
}) {
  return (
    <div className="rounded-2xl border border-border bg-background/60 p-4 space-y-2">
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className="text-sm text-foreground leading-relaxed">
        {value ?? <span className="text-muted-foreground/60">정보 준비 중</span>}
      </p>
    </div>
  )
}

function formatSectionValue(value: unknown): string | null {
  if (typeof value === "string") {
    const normalized = value.trim()
    return normalized.length ? normalized : null
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value)
  }

  if (Array.isArray(value)) {
    const normalized = value
      .map((item) => formatSectionValue(item))
      .filter((item): item is string => Boolean(item))

    return normalized.length ? normalized.join("\n") : null
  }

  if (isSectionMap(value)) {
    const normalized = Object.entries(value)
      .map(([label, entryValue]) => {
        const formatted = formatSectionValue(entryValue)
        return formatted ? `${label}: ${formatted}` : null
      })
      .filter((item): item is string => Boolean(item))

    return normalized.length ? normalized.join("\n") : null
  }

  return null
}
