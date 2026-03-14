import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { CalendarDays, MapPin, Ticket } from "lucide-react"
import { getPerformanceBySlug, getCampaignByPerformanceId } from "@/lib/supabase/queries"
import { getPosterFallback } from "@/constants/posters"
import { DetailImageGallery } from "@/components/performances/DetailImageGallery"
import { ReviewSummary } from "@/components/reviews/ReviewSummary"

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
}

const isPerformanceRecord = (record: RawPerformance): record is NonNullable<RawPerformance> =>
  Boolean(record && typeof record === "object" && "id" in record && "title" in record)

export default async function PerformanceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const performance = await getPerformanceBySlug(slug)
  if (!isPerformanceRecord(performance)) {
    notFound()
  }

  const campaign = await getCampaignByPerformanceId(performance.id)

  const detailFields = performance as NonNullable<RawPerformance> & PerformanceDetailFields

  const status = performance.status
  const openrunLabel =
    detailFields.openrun === "Y"
      ? "오픈런"
      : null
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

  return (
    <div className="pb-24 pt-12 text-foreground">
      <section className="mx-auto max-w-6xl space-y-6 px-4 sm:px-6 lg:px-8">
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
                  <span key={tag} className="rounded-full border border-border/70 bg-background/70 px-3 py-1 text-foreground/80">
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
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-6xl space-y-10 px-4 sm:px-6 lg:px-8">
        <div className="space-y-4 border-t border-border/60 pt-10">
          <h2 className="text-2xl font-semibold">작품 소개</h2>
          <p className="text-base text-muted-foreground whitespace-pre-line">{synopsis}</p>
        </div>

        {images.length > 0 && (
          <div className="space-y-4 border-t border-border/60 pt-10">
            <h2 className="text-2xl font-semibold">상세 이미지</h2>
            <DetailImageGallery title={performance.title} images={images} />
          </div>
        )}

        <div id="people" className="space-y-4 border-t border-border/60 pt-10">
          <h2 className="text-2xl font-semibold">제작/출연</h2>
          <div className="grid gap-3 rounded-2xl border border-border bg-background/60 p-4 text-sm text-muted-foreground">
            <p>제작: {performance.organization ?? "정보 준비 중"}</p>
            <p>출연: {detailFields.cast ?? "정보 준비 중"}</p>
            <p>스태프: {detailFields.crew ?? "정보 준비 중"}</p>
          </div>
        </div>

        <div className="space-y-4 border-t border-border/60 pt-10">
          <h2 className="text-2xl font-semibold">이벤트 안내</h2>
          {campaign ? (
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-widest text-primary">초대권 이벤트 진행 중</p>
                  <h3 className="text-lg font-bold text-foreground">{campaign.title}</h3>
                  {campaign.description && (
                    <p className="text-sm text-muted-foreground">{campaign.description}</p>
                  )}
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
                href={`/events/${campaign.slug}`}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:bg-primary/90"
              >
                <Ticket className="h-4 w-4" />
                이벤트 응모하기
              </Link>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-background/60 p-6 text-sm text-muted-foreground">
              현재 진행 중인 이벤트가 없습니다.{" "}
              <Link href="/events" className="font-semibold text-primary hover:underline">
                전체 이벤트 보기
              </Link>
            </div>
          )}
        </div>

        <div className="space-y-4 border-t border-border/60 pt-10">
          <ReviewSummary
            performanceId={performance.id}
            performanceSlug={slug}
          />
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

