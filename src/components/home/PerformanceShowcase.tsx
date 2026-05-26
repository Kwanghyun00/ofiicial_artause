import Image from "next/image"
import Link from "next/link"
import { Calendar, MapPin, Ticket } from "lucide-react"
import { getPosterFallback } from "@/constants/posters"
import type { Show } from "./types"

type Props = {
  shows: Show[]
}

export function PerformanceShowcase({ shows }: Props) {
  if (!shows.length) return null

  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* 섹션 헤더 */}
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2.5">
            <span className="cue">공연 발견</span>
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">
              지금 둘러볼 만한 공연
            </h2>
            <p className="max-w-lg text-sm text-muted-foreground sm:text-base">
              작품을 먼저 살펴보고, 초대 이벤트가 연결되어 있다면 바로 응모하세요.
            </p>
          </div>
          <Link
            href="/shows"
            className="self-start rounded-full border border-border/80 px-5 py-2.5 text-sm font-semibold text-foreground/80 transition hover:border-primary/60 hover:text-primary"
          >
            전체 공연 보기 →
          </Link>
        </div>

        {/* 포스터 그리드 — Cinecube 스타일: 세로형(2:3 비율), 호버 시 정보 오버레이 */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-5 lg:grid-cols-4 xl:grid-cols-6">
          {/* 첫 번째 카드: 대형 (2열 × 2행) */}
          {shows.slice(0, 1).map((show) => {
            const posterUrl = show.poster_url ?? getPosterFallback(0)
            return (
              <article
                key={show.id}
                className="group col-span-2 row-span-2 overflow-hidden rounded-xl"
              >
                <PosterCard show={show} posterUrl={posterUrl} large />
              </article>
            )
          })}

          {/* 나머지 카드: 단일 */}
          {shows.slice(1).map((show, idx) => {
            const posterUrl = show.poster_url ?? getPosterFallback(idx + 1)
            return (
              <article
                key={show.id}
                className="group overflow-hidden rounded-xl"
              >
                <PosterCard show={show} posterUrl={posterUrl} />
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function PosterCard({
  show,
  posterUrl,
  large = false,
}: {
  show: Show
  posterUrl: string
  large?: boolean
}) {
  return (
    <Link
      href={show.slug ? `/shows/${show.slug}` : "/shows"}
      className="relative block overflow-hidden rounded-xl focus-visible:outline-2 focus-visible:outline-primary"
    >
      {/* 포스터 이미지 (2:3 세로형) */}
      <div
        className="relative w-full overflow-hidden bg-muted"
        style={{ paddingBottom: large ? "150%" : "150%" }}
      >
        <Image
          src={posterUrl}
          alt={show.title}
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          sizes={large ? "(max-width: 640px) 100vw, 33vw" : "(max-width: 640px) 50vw, 16vw"}
        />

        {/* 그라데이션 오버레이 — 항상 하단 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

        {/* 초대 이벤트 배지 */}
        {show.campaign_slug && (
          <span className="absolute left-2.5 top-2.5 rounded-md bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground shadow-sm">
            초대권
          </span>
        )}

        {/* 하단 텍스트 */}
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
          {/* 태그 (대형 카드에만 표시) */}
          {large && show.tags && show.tags.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1">
              {show.tags.slice(0, 2).map((tag) => (
                <span key={tag} className="rounded-sm bg-white/15 px-2 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur-sm">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <h3 className={`font-bold leading-snug text-white ${large ? "text-xl sm:text-2xl" : "text-sm sm:text-base"}`}>
            {show.title}
          </h3>

          {large && (
            <div className="mt-2 space-y-1 text-xs text-white/70">
              {show.region && (
                <p className="flex items-center gap-1.5">
                  <MapPin className="h-3 w-3 shrink-0" />
                  {show.region}
                </p>
              )}
              {(show.period_start || show.period_end) && (
                <p className="flex items-center gap-1.5">
                  <Calendar className="h-3 w-3 shrink-0" />
                  {formatPeriod(show.period_start, show.period_end)}
                </p>
              )}
            </div>
          )}

          {/* 소형: 지역만 표시 */}
          {!large && show.region && (
            <p className="mt-1 flex items-center gap-1 text-[11px] text-white/60">
              <MapPin className="h-3 w-3 shrink-0" />
              {show.region}
            </p>
          )}
        </div>

        {/* 호버 오버레이 — 초대 이벤트 응모 버튼 */}
        {show.campaign_slug && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <span
              onClick={(e) => e.preventDefault()}
              className="pointer-events-none"
            >
              <Link
                href={`/invites/${show.campaign_slug}`}
                className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/30 transition hover:bg-primary/90"
                onClick={(e) => e.stopPropagation()}
              >
                <Ticket className="h-4 w-4" />
                응모하기
              </Link>
            </span>
          </div>
        )}
      </div>
    </Link>
  )
}

function formatPeriod(start?: string | null, end?: string | null) {
  if (!start && !end) return "상시 진행"
  const s = start ? formatDate(start) : "미정"
  const e = end ? formatDate(end) : "미정"
  if (s === e) return s
  return `${s} ~ ${e}`
}

function formatDate(v?: string | null) {
  if (!v) return "미정"
  return new Date(v).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })
}
