import Image from "next/image"
import Link from "next/link"
import { MapPin } from "lucide-react"
import { getPosterFallback } from "@/constants/posters"
import type { Show } from "./types"

type Props = { shows: Show[] }

export function PerformanceShowcase({ shows }: Props) {
  if (!shows.length) return null

  const featured = shows[0]
  const rest = shows.slice(1, 7)

  return (
    <section className="bg-background py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* 섹션 헤더 */}
        <div className="mb-10 flex items-end justify-between gap-4">
          <div className="space-y-1.5">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
              — 02
            </p>
            <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
              지금 둘러볼 만한 공연
            </h2>
          </div>
          <Link
            href="/shows"
            className="shrink-0 text-sm font-semibold text-muted-foreground transition hover:text-primary"
          >
            전체 →
          </Link>
        </div>

        {/* 레이아웃 */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-12">

          {/* 피처드 — 대형 (lg:5col × 2row) */}
          {featured && (
            <article className="col-span-2 md:col-span-1 lg:col-span-5 lg:row-span-2">
              <PosterCard show={featured} posterUrl={featured.poster_url ?? getPosterFallback(0)} large />
            </article>
          )}

          {/* 나머지 — 소형 */}
          {rest.map((show, idx) => (
            <article key={show.id} className="col-span-1 lg:col-span-2">
              <PosterCard show={show} posterUrl={show.poster_url ?? getPosterFallback(idx + 1)} index={idx + 1} />
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function PosterCard({
  show,
  posterUrl,
  large = false,
  index,
}: {
  show: Show
  posterUrl: string
  large?: boolean
  index?: number
}) {
  return (
    <Link
      href={show.slug ? `/shows/${show.slug}` : "/shows"}
      className="group relative block overflow-hidden focus-visible:outline-2 focus-visible:outline-primary"
    >
      <div
        className="relative w-full overflow-hidden bg-muted"
        style={{ paddingBottom: large ? "140%" : "148%" }}
      >
        <Image
          src={posterUrl}
          alt={show.title}
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          sizes={large ? "(max-width: 640px) 100vw, 42vw" : "(max-width: 640px) 50vw, 17vw"}
        />

        {/* 그라데이션 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

        {/* 인덱스 넘버 */}
        {!large && index !== undefined && (
          <div className="absolute right-2.5 top-2.5 font-mono text-[10px] font-bold text-white/25">
            {String(index).padStart(2, "0")}
          </div>
        )}

        {/* 피처드 뱃지 */}
        {large && (
          <div className="absolute left-3 top-3">
            <span
              className="inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-black"
              style={{ background: "oklch(0.74 0.17 62)" }}
            >
              ✦ Pick
            </span>
          </div>
        )}

        {/* 하단 정보 */}
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
          {/* 태그 (대형만) */}
          {large && show.tags && show.tags.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1">
              {show.tags.slice(0, 2).map((tag) => (
                <span key={tag} className="bg-white/15 px-2 py-0.5 text-[10px] font-medium text-white/80 backdrop-blur-sm">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <h3 className={`font-serif font-bold leading-snug text-white ${large ? "text-xl sm:text-2xl" : "text-sm sm:text-[15px]"}`}>
            {show.title}
          </h3>

          {large && (show.region || show.period_end) && (
            <div className="mt-2 flex flex-col gap-1 text-xs text-white/55">
              {show.region && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 shrink-0" />
                  {show.region}
                </span>
              )}
              {show.period_end && (
                <span>
                  {new Date(show.period_end).toLocaleDateString("ko-KR", { month: "long", day: "numeric" })}까지
                </span>
              )}
            </div>
          )}

          {!large && show.region && (
            <p className="mt-1 text-[11px] text-white/40">{show.region}</p>
          )}
        </div>
      </div>
    </Link>
  )
}
