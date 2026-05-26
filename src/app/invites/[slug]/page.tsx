import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  BadgeCheck,
  Calendar,
  Clock,
  MapPin,
  MessageSquarePlus,
  Mic2,
  Tag,
  Ticket,
  Users,
} from "lucide-react"
import { TicketEntryForm } from "@/components/forms/TicketEntryForm"
import { WinnerCheckSection } from "@/components/events/WinnerCheckSection"
import { Badge } from "@/components/ui/badge"
import { getTicketCampaignBySlug, getPerformanceByKopisId } from "@/lib/supabase/queries"

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const campaign = await getTicketCampaignBySlug(slug)

  if (!campaign || !("title" in campaign)) {
    return {
      title: "초대 이벤트",
      description: "알터즈 공연 초대 이벤트 응모 페이지",
      alternates: { canonical: `/invites/${slug}` },
    }
  }

  const c = campaign as typeof campaign & {
    title: string
    description?: string | null
    one_line_intro?: string | null
    poster_image?: string | null
  }

  const description = c.one_line_intro ?? c.description ?? `${c.title} 공연 초대 이벤트에 응모하세요.`
  const image = c.poster_image ?? undefined

  return {
    title: `${c.title} 초대 이벤트`,
    description,
    alternates: { canonical: `/invites/${slug}` },
    openGraph: {
      title: `${c.title} 초대권 응모 | 알터즈`,
      description,
      url: `/invites/${slug}`,
      type: "article",
      images: image ? [{ url: image, alt: c.title }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: `${c.title} 초대권 응모 | 알터즈`,
      description,
      images: image ? [image] : undefined,
    },
  }
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://artause.co.kr"

export default async function InviteDetailPage({ params }: Props) {
  const { slug } = await params
  const campaign = await getTicketCampaignBySlug(slug)

  if (!campaign) notFound()

  const c = campaign as typeof campaign & {
    title: string
    description?: string | null
    one_line_intro?: string | null
    venue_name?: string | null
    venue_address?: string | null
    performance_period_start?: string | null
    performance_period_end?: string | null
    ends_at?: string | null
    poster_image?: string | null
    reward?: string | null
    age_rating?: string | null
    running_time?: string | null
    allocation?: number | null
    hashtags?: string[] | null
    sessions_per_week?: string | null
    ticket_purchase_url?: string | null
    kopis_id?: string | null
  }

  const kopis = c.kopis_id ? await getPerformanceByKopisId(c.kopis_id) : null

  const deadline = c.ends_at ? calcDeadline(c.ends_at) : null
  // eslint-disable-next-line react-compiler/react-compiler
  const isClosed = c.ends_at ? new Date(c.ends_at).getTime() < Date.now() : false

  const period = kopis
    ? formatPeriod(kopis.period_start, kopis.period_end)
    : formatPeriod(c.performance_period_start, c.performance_period_end)

  const venueName = kopis?.venue ?? c.venue_name ?? null
  const location = [venueName, c.venue_address].filter(Boolean).join(" · ") || null

  const posterSrc = c.poster_image ?? kopis?.poster_url ?? null

  const benefits = c.reward ? c.reward.split(/[,，\n]/).map((s: string) => s.trim()).filter(Boolean) : []
  const tags = Array.isArray(c.hashtags) ? (c.hashtags as string[]).slice(0, 4) : []

  const runningTime = kopis?.runtime ?? c.running_time ?? null
  const ageRating = kopis?.age_limit ?? c.age_rating ?? null

  const ticketPurchaseUrl = c.ticket_purchase_url ?? kopis?.ticket_link ?? null

  const hasWinnersSelected = isClosed

  // JSON-LD Event 구조화 데이터
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: c.title,
    description: c.one_line_intro ?? c.description ?? undefined,
    ...(c.performance_period_start && { startDate: c.performance_period_start }),
    ...(c.performance_period_end && { endDate: c.performance_period_end }),
    eventStatus: isClosed
      ? "https://schema.org/EventScheduled"
      : "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    ...(location && {
      location: {
        "@type": "Place",
        name: venueName ?? location,
        address: { "@type": "PostalAddress", addressCountry: "KR" },
      },
    }),
    image: posterSrc ? [posterSrc] : [`${SITE_URL}/og-default.png`],
    url: `${SITE_URL}/invites/${slug}`,
    organizer: kopis?.organization
      ? { "@type": "Organization", name: kopis.organization }
      : undefined,
    offers: {
      "@type": "Offer",
      name: c.reward ?? "공연 초대권",
      price: "0",
      priceCurrency: "KRW",
      availability: isClosed
        ? "https://schema.org/SoldOut"
        : "https://schema.org/InStock",
      url: `${SITE_URL}/invites/${slug}`,
      ...(c.ends_at && { validThrough: c.ends_at }),
    },
  }

  // 공연 상세 페이지 slug (KOPIS ID 기반 — kopis 반환 타입에 slug가 있을 때만 사용)
  const showPageSlug: string | null =
    kopis && "slug" in kopis && typeof (kopis as { slug?: unknown }).slug === "string"
      ? (kopis as { slug: string }).slug
      : null

  return (
    <div className="pb-24 text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 모바일 하단 고정 응모 CTA */}
      {!isClosed && (
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border/60 bg-background/95 px-4 py-3 backdrop-blur-xl lg:hidden">
          <a
            href="#entry-form"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-base font-bold text-primary-foreground shadow-stage transition hover:bg-primary/90"
          >
            초대권 응모하기 ✦
          </a>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* 브레드크럼 */}
        <Link
          href="/invites"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          초대권 이벤트 목록
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_440px]">

          {/* ── 왼쪽: 공연 정보 ── */}
          <div className="space-y-6">

            {/* 헤딩 + 배지 */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {isClosed ? (
                  <span className="badge badge-muted">응모 마감</span>
                ) : (
                  <span className="badge badge-primary">모집 중</span>
                )}
                {deadline && !isClosed && (
                  <span className="badge badge-accent">{deadline}</span>
                )}
                {tags.map((tag: string) => (
                  <span key={tag} className="badge badge-muted">{tag}</span>
                ))}
                {kopis && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    KOPIS 인증
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-foreground sm:text-4xl">{c.title}</h1>
              {(c.one_line_intro || c.description) && (
                <p className="text-base text-muted-foreground">{c.one_line_intro ?? c.description}</p>
              )}
            </div>

            {/* 포스터 */}
            {posterSrc && (
              <div className="relative aspect-[3/4] max-h-[500px] overflow-hidden rounded-xl shadow-lg">
                <Image
                  src={posterSrc}
                  alt={c.title}
                  fill
                  className="object-cover object-top"
                  priority
                  unoptimized={posterSrc.startsWith("http://www.kopis.or.kr")}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>
            )}

            {/* 공연 기본 정보 */}
            <div className="rounded-xl border border-border/60 bg-card p-5 text-sm">
              <div className="grid gap-3 sm:grid-cols-2">
                {location && (
                  <InfoRow icon={<MapPin className="h-4 w-4" />} label={location} />
                )}
                {period && (
                  <InfoRow icon={<Calendar className="h-4 w-4" />} label={period} />
                )}
                {runningTime && (
                  <InfoRow icon={<Clock className="h-4 w-4" />} label={`러닝타임 ${runningTime}`} />
                )}
                {ageRating && (
                  <InfoRow icon={<Tag className="h-4 w-4" />} label={ageRating} />
                )}
                {c.allocation && (
                  <InfoRow icon={<Users className="h-4 w-4" />} label={`총 ${c.allocation.toLocaleString()}매 초대`} />
                )}
                {kopis?.schedule && (
                  <div className="col-span-full">
                    <InfoRow icon={<Clock className="h-4 w-4" />} label={kopis.schedule} />
                  </div>
                )}
              </div>
              {deadline && !isClosed && (
                <p className="mt-4 border-t border-border/50 pt-3 text-sm font-semibold text-primary">
                  응모 마감 {deadline}
                </p>
              )}
            </div>

            {/* 출연진/제작 정보 (KOPIS) */}
            {kopis && (kopis.cast || kopis.crew || kopis.organization) && (
              <div className="rounded-xl border border-border/60 bg-card p-5 space-y-3">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Mic2 className="h-4 w-4 text-primary" />
                  공연 정보
                </h3>
                <dl className="space-y-2 text-sm">
                  {kopis.cast && (
                    <div className="flex gap-3">
                      <dt className="w-10 shrink-0 font-medium text-muted-foreground">출연</dt>
                      <dd className="text-foreground">{kopis.cast}</dd>
                    </div>
                  )}
                  {kopis.crew && (
                    <div className="flex gap-3">
                      <dt className="w-10 shrink-0 font-medium text-muted-foreground">제작</dt>
                      <dd className="text-foreground">{kopis.crew}</dd>
                    </div>
                  )}
                  {kopis.organization && (
                    <div className="flex gap-3">
                      <dt className="w-10 shrink-0 font-medium text-muted-foreground">기획</dt>
                      <dd className="text-foreground">{kopis.organization}</dd>
                    </div>
                  )}
                  {kopis.price && (
                    <div className="flex gap-3">
                      <dt className="w-10 shrink-0 font-medium text-muted-foreground">티켓</dt>
                      <dd className="text-foreground">{kopis.price}</dd>
                    </div>
                  )}
                </dl>
              </div>
            )}

            {/* 초대 혜택 */}
            {benefits.length > 0 && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Ticket className="h-4 w-4 text-primary" />
                  초대 혜택
                </h3>
                <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                  {benefits.map((benefit: string) => (
                    <li key={benefit} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 부가 링크 */}
            {(showPageSlug || ticketPurchaseUrl || c.kopis_id) && (
              <div className="flex flex-wrap gap-2.5">
                {showPageSlug && (
                  <Link
                    href={`/shows/${showPageSlug}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground/80 transition hover:border-primary/60 hover:text-primary"
                  >
                    <Ticket className="h-3.5 w-3.5" />
                    공연 상세
                  </Link>
                )}
                {ticketPurchaseUrl && (
                  <Link
                    href={ticketPurchaseUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground/80 transition hover:border-primary/60 hover:text-primary"
                  >
                    티켓 예매
                  </Link>
                )}
                {c.kopis_id && (
                  <Link
                    href={`http://www.kopis.or.kr/por/db/pblprfr/pblprfrView.do?menuId=MNU_00010&mt20id=${c.kopis_id}`}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
                  >
                    <BadgeCheck className="h-3.5 w-3.5" />
                    KOPIS 확인
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* ── 오른쪽: 응모 폼 (sticky) ── */}
          <div className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            {!isClosed ? (
              <section id="entry-form" className="spotlight-card overflow-hidden">
                <TicketEntryForm
                  campaignId={c.id ?? ""}
                  slug={slug}
                  campaignTitle={c.title}
                  availableDates={Array.isArray(c.available_dates) ? (c.available_dates as string[]) : null}
                />
              </section>
            ) : (
              <section className="rounded-xl border border-border/60 bg-card p-8 text-center">
                <div className="space-y-2">
                  <span className="badge badge-muted mx-auto">응모 마감</span>
                  <p className="text-base font-semibold text-foreground">응모 기간이 종료되었습니다</p>
                  <p className="text-sm text-muted-foreground">당첨자 발표는 아래에서 확인하세요.</p>
                </div>
              </section>
            )}

            <WinnerCheckSection
              campaignId={c.id ?? ""}
              performanceId={c.performance_id ?? null}
              hasWinnersSelected={hasWinnersSelected}
            />

            {/* 관람 후기 CTA (마감 후) */}
            {isClosed && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
                <div className="flex items-start gap-3">
                  <MessageSquarePlus className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-foreground">공연을 관람하셨나요?</p>
                    <p className="text-sm text-muted-foreground">
                      솔직한 후기를 남겨주시면 다른 관객에게 큰 도움이 됩니다.
                    </p>
                    <Link
                      href={c.performance_id ? `/reviews?performance=${c.performance_id}` : "/reviews"}
                      className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                    >
                      후기 남기기 →
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <span className="shrink-0 text-primary/70">{icon}</span>
      <span>{label}</span>
    </div>
  )
}

function calcDeadline(endsAt: string): string {
  const now = Date.now()
  const end = new Date(endsAt).getTime()
  const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24))
  if (diff < 0) return "마감됨"
  if (diff === 0) return "오늘 마감"
  return `D-${diff}`
}

function formatPeriod(start?: string | null, end?: string | null): string | null {
  if (!start && !end) return null
  const fmt = (v: string) =>
    new Date(v).toLocaleDateString("ko-KR", { month: "long", day: "numeric" })
  if (start && end) return `${fmt(start)} ~ ${fmt(end)}`
  if (start) return `${fmt(start)} ~`
  if (end) return `~ ${fmt(end!)}`
  return null
}
