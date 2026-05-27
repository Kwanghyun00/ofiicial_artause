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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://artause.co.kr"

/** OG 이미지 URL 결정: 포스터가 있으면 직접 사용, 없으면 동적 생성 라우트 */
function resolveOgImage(
  title: string,
  description: string,
  posterUrl?: string | null
): { url: string; width: number; height: number; alt: string } {
  if (posterUrl) {
    return {
      url: posterUrl,
      width: 800,
      height: 600,
      alt: title,
    }
  }
  const params = new URLSearchParams({
    title,
    description: description.slice(0, 120),
    type: "invite",
  })
  return {
    url: `${SITE_URL}/api/og?${params.toString()}`,
    width: 1200,
    height: 630,
    alt: `${title} 초대 이벤트 | 알터즈`,
  }
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
  const ogImage = resolveOgImage(c.title, description, c.poster_image)

  return {
    title: `${c.title} 초대 이벤트`,
    description,
    alternates: { canonical: `/invites/${slug}` },
    openGraph: {
      title: `${c.title} 초대권 응모 | 알터즈`,
      description,
      url: `/invites/${slug}`,
      type: "article",
      images: [
        {
          url: ogImage.url,
          width: ogImage.width,
          height: ogImage.height,
          alt: ogImage.alt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${c.title} 초대권 응모 | 알터즈`,
      description,
      images: [ogImage.url],
    },
  }
}

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
    available_dates?: string[] | null
    performance_period_start?: string | null
    performance_period_end?: string | null
    poster_image?: string | null
    still_images?: string[] | null
    hashtags?: string[] | null
    production_team?: string | null
    ticket_allocations?: Record<string, unknown> | null
    ticket_purchase_url?: string | null
    sns_instagram?: string | null
    sns_youtube?: string | null
    sns_tiktok?: string | null
    running_time?: string | null
    age_rating?: string | null
    sessions_per_week?: number | null
    kopis_id?: string | null
    entry_count?: number | null
    reward?: string | null
    ends_at?: string | null
    starts_at?: string | null
    allocation?: Record<string, unknown> | null
  }

  // KOPIS ID가 있으면 DB에서 공연 상세 조회
  const kopis = c.kopis_id ? await getPerformanceByKopisId(c.kopis_id) : null

  const posterUrl = c.poster_image ?? kopis?.poster_url ?? null
  const stillImages: string[] = Array.isArray(c.still_images) ? c.still_images : []
  const hashtags: string[] = Array.isArray(c.hashtags) ? c.hashtags : []

  const perfPeriodStart = c.performance_period_start ?? kopis?.period_start ?? null
  const perfPeriodEnd = c.performance_period_end ?? kopis?.period_end ?? null
  const venueName = c.venue_name ?? kopis?.venue ?? null
  const venueAddress = c.venue_address ?? kopis?.venue ?? null
  const synopsis = c.description ?? kopis?.description ?? null
  const runningTime = c.running_time ?? kopis?.runtime ?? null
  const ageRating = c.age_rating ?? kopis?.age_limit ?? null
  const cast = kopis?.cast ?? null
  const crew = kopis?.crew ?? null
  const ticketLink = c.ticket_purchase_url ?? kopis?.ticket_link ?? null

  const now = new Date()
  const endsAt = c.ends_at ? new Date(c.ends_at) : null
  const startsAt = c.starts_at ? new Date(c.starts_at) : null
  const isActive = startsAt && endsAt ? startsAt <= now && now <= endsAt : false
  const isEnded = endsAt ? now > endsAt : false

  const alloc = c.allocation as Record<string, number> | null
  const totalAlloc = alloc
    ? Object.values(alloc).reduce((s: number, v) => s + (typeof v === "number" ? v : 0), 0)
    : null

  function formatDate(value: string | null | undefined) {
    if (!value) return "미정"
    return new Date(value).toLocaleDateString("ko-KR", { month: "long", day: "numeric" })
  }

  function formatPeriod(start: string | null | undefined, end: string | null | undefined) {
    if (!start && !end) return "일정 미정"
    const s = formatDate(start)
    const e = formatDate(end)
    return s === e ? s : `${s} ~ ${e}`
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      {/* 뒤로 가기 */}
      <Link
        href="/invites"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        초대 이벤트 목록
      </Link>

      {/* 포스터 */}
      {posterUrl && (
        <div className="relative mb-8 h-64 w-full overflow-hidden rounded-2xl sm:h-80">
          <Image src={posterUrl} alt={c.title} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
        </div>
      )}

      {/* 헤더 */}
      <div className="mb-8 space-y-3">
        {isEnded && (
          <Badge variant="secondary" className="text-xs">
            이벤트 종료
          </Badge>
        )}
        {isActive && (
          <Badge className="bg-primary/10 text-primary text-xs border border-primary/30">
            모집 중
          </Badge>
        )}
        {hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {hashtags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Tag className="h-3 w-3" />
                {tag}
              </span>
            ))}
          </div>
        )}
        <h1 className="text-2xl font-bold sm:text-3xl">{c.title}</h1>
        {c.one_line_intro && (
          <p className="text-base text-muted-foreground">{c.one_line_intro}</p>
        )}
        {c.reward && (
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-bold text-primary">
            <Ticket className="h-4 w-4" />
            {c.reward}
          </div>
        )}
      </div>

      {/* 공연 정보 카드 */}
      <div className="mb-8 grid gap-3 rounded-2xl border border-border bg-background/60 p-5 text-sm text-muted-foreground">
        {(perfPeriodStart || perfPeriodEnd) && (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary shrink-0" />
            <span>공연 기간: {formatPeriod(perfPeriodStart, perfPeriodEnd)}</span>
          </div>
        )}
        {venueName && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary shrink-0" />
            <span>{venueName}{venueAddress && venueAddress !== venueName ? ` · ${venueAddress}` : ""}</span>
          </div>
        )}
        {runningTime && (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary shrink-0" />
            <span>러닝타임: {runningTime}</span>
          </div>
        )}
        {ageRating && (
          <div className="flex items-center gap-2">
            <BadgeCheck className="h-4 w-4 text-primary shrink-0" />
            <span>관람 연령: {ageRating}</span>
          </div>
        )}
        {c.sessions_per_week && (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary shrink-0" />
            <span>주 {c.sessions_per_week}회 공연</span>
          </div>
        )}
        {totalAlloc !== null && (
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary shrink-0" />
            <span>총 {totalAlloc}석 배정</span>
          </div>
        )}
        {endsAt && (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary shrink-0" />
            <span>
              응모 마감:{" "}
              <span className="font-semibold text-foreground">{formatDate(c.ends_at)}</span>
            </span>
          </div>
        )}
      </div>

      {/* 공연 소개 */}
      {synopsis && (
        <div className="mb-8 space-y-3">
          <h2 className="text-lg font-semibold">공연 소개</h2>
          <p className="whitespace-pre-line text-sm text-muted-foreground">{synopsis}</p>
        </div>
      )}

      {/* 출연/스태프 */}
      {(cast || crew) && (
        <div className="mb-8 grid gap-3 sm:grid-cols-2">
          {cast && (
            <div className="rounded-xl border border-border bg-background/60 p-4 space-y-1">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Mic2 className="h-3.5 w-3.5" /> 출연
              </p>
              <p className="text-sm text-foreground">{cast}</p>
            </div>
          )}
          {crew && (
            <div className="rounded-xl border border-border bg-background/60 p-4 space-y-1">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Mic2 className="h-3.5 w-3.5" /> 스태프
              </p>
              <p className="text-sm text-foreground">{crew}</p>
            </div>
          )}
        </div>
      )}

      {/* 스틸 이미지 갤러리 */}
      {stillImages.length > 0 && (
        <div className="mb-8 space-y-3">
          <h2 className="text-lg font-semibold">공연 스틸</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {stillImages.map((src, i) => (
              <div key={i} className="relative aspect-[4/3] overflow-hidden rounded-xl">
                <Image src={src} alt={`${c.title} 스틸 ${i + 1}`} fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 예매 링크 */}
      {ticketLink && (
        <div className="mb-8">
          <Link
            href={ticketLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2 text-sm font-semibold text-foreground hover:bg-accent"
          >
            <Ticket className="h-4 w-4" />
            티켓 예매하기
          </Link>
        </div>
      )}

      {/* SNS 링크 */}
      {(c.sns_instagram || c.sns_youtube || c.sns_tiktok) && (
        <div className="mb-8 flex flex-wrap gap-3">
          {c.sns_instagram && (
            <Link
              href={c.sns_instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-primary"
            >
              Instagram
            </Link>
          )}
          {c.sns_youtube && (
            <Link
              href={c.sns_youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-primary"
            >
              YouTube
            </Link>
          )}
          {c.sns_tiktok && (
            <Link
              href={c.sns_tiktok}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-primary"
            >
              TikTok
            </Link>
          )}
        </div>
      )}

      {/* 구분선 */}
      <div className="mb-8 border-t border-border/60" />

      {/* 당첨자 확인 */}
      <div className="mb-8">
        <WinnerCheckSection campaignId={campaign.id ?? ""} />
      </div>

      {/* 응모 폼 */}
      <div className="space-y-4">
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <MessageSquarePlus className="h-5 w-5 text-primary" />
          초대권 응모하기
        </h2>
        {isEnded ? (
          <div className="rounded-2xl border border-dashed border-border bg-background/60 p-6 text-center text-sm text-muted-foreground">
            이 이벤트는 종료되었습니다.
          </div>
        ) : (
          <TicketEntryForm campaignId={campaign.id ?? ""} slug={slug} campaignTitle={c.title} />
        )}
      </div>
    </main>
  )
}
