import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { CalendarDays, MapPin, Ticket } from "lucide-react"
import { getPerformanceBySlug } from "@/lib/supabase/queries"
import { getPosterFallback } from "@/constants/posters"
import { DetailImageGallery } from "@/components/performances/DetailImageGallery"

type RawPerformance = Awaited<ReturnType<typeof getPerformanceBySlug>>

const isPerformanceRecord = (record: RawPerformance): record is NonNullable<RawPerformance> =>
  Boolean(record && typeof record === "object" && "id" in record && "title" in record)

export default async function PerformanceDetailPage({ params }: { params: { slug: string } }) {
  const performance = await getPerformanceBySlug(params.slug)
  if (!isPerformanceRecord(performance)) {
    notFound()
  }

  const status =
    typeof performance === "object" && "status" in performance
      ? performance.status
      : performance.state
  const openrunLabel =
    typeof performance === "object" && "openrun" in performance && performance.openrun === "Y"
      ? "오픈런"
      : null
  const category =
    typeof performance === "object" && "category" in performance ? performance.category : null
  const tags = [
    category,
    ...(Array.isArray(performance.tags) ? performance.tags : []),
    status,
    openrunLabel,
  ].filter(Boolean)
  const posterUrl = performance.poster_url ?? getPosterFallback(0)
  const synopsis =
    performance.description ??
    performance.synopsis ??
    "공연 소개가 곧 업데이트될 예정입니다."
  const images = Array.isArray(performance.images) ? performance.images : []

  return (
    <div className="bg-[#f6f4ee] pb-24 pt-10 text-foreground">
      <section className="mx-auto max-w-6xl space-y-6 px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.1fr,1fr] lg:items-start">
          <div className="relative overflow-hidden rounded-2xl border border-black/10 bg-white shadow">
            <div className="relative h-[420px] w-full">
              <Image src={posterUrl} alt={performance.title} fill className="object-cover" />
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                {tags.slice(0, 6).map((tag) => (
                  <span key={tag} className="rounded-full bg-[#f2efe7] px-3 py-1 text-foreground/80">
                    {tag}
                  </span>
                ))}
              </div>
              <h1 className="text-3xl font-semibold sm:text-4xl">{performance.title}</h1>
              <p className="text-base text-muted-foreground">{performance.hero_subtitle ?? synopsis}</p>
            </div>

            <div className="grid gap-3 rounded-2xl border border-black/10 bg-white p-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                <span>{formatPeriod(performance.period_start, performance.period_end)}</span>
              </div>
              {performance.region && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{performance.region}</span>
                </div>
              )}
              {performance.venue && (
                <div className="flex items-center gap-2">
                  <Ticket className="h-4 w-4 text-primary" />
                  <span>{performance.venue}</span>
                </div>
              )}
              {performance.schedule && <div>공연 일정: {performance.schedule}</div>}
              {performance.runtime && <div>러닝타임: {performance.runtime}</div>}
              {performance.age_limit && <div>관람 연령: {performance.age_limit}</div>}
              {performance.price && <div>가격: {performance.price}</div>}
            </div>

            <div className="flex flex-wrap gap-3">
              {performance.ticket_link ? (
                <Link
                  href={performance.ticket_link}
                  className="inline-flex items-center justify-center rounded-full bg-black px-5 py-2 text-sm font-semibold text-[#f6f4ee]"
                >
                  예매/문의
                </Link>
              ) : (
                <span className="inline-flex items-center justify-center rounded-full border border-black/20 px-5 py-2 text-sm font-semibold text-foreground/70">
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
          <div className="grid gap-3 rounded-2xl border border-black/10 bg-white p-4 text-sm text-muted-foreground">
            <p>제작: {performance.organization ?? "정보 준비 중"}</p>
            <p>출연: {performance.cast ?? "정보 준비 중"}</p>
            <p>스태프: {performance.crew ?? "정보 준비 중"}</p>
          </div>
        </div>

        <div className="space-y-4 border-t border-border/60 pt-10">
          <h2 className="text-2xl font-semibold">이벤트 안내</h2>
          <div className="rounded-2xl border border-dashed border-black/20 bg-white p-6 text-sm text-muted-foreground">
            이벤트 관련 안내는 추후 업데이트됩니다. 자세한 내용은 초대권 이벤트 페이지를 확인해 주세요.
          </div>
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
