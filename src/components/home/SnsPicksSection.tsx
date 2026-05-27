"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeft, ChevronRight, Instagram, Youtube, ArrowRight } from "lucide-react"

// ─── Types ───────────────────────────────────────────────────────────────────

type PickPerformance = {
  id: string
  slug: string | null
  title: string
  poster_url: string | null
  category?: string | null
  period_start: string | null
  period_end: string | null
  tags: string[] | null
}

type SnsPick = {
  id: string
  performance_id: string
  caption: string | null
  channel: string
  display_order: number
  promo_end?: string | null
  performance: PickPerformance | null
}

type Props = { picks: SnsPick[] }

// ─── Channel config ───────────────────────────────────────────────────────────

const CHANNEL_CONFIG: Record<string, { label: string; bg: string; icon: React.ReactNode }> = {
  instagram: {
    label: "Instagram",
    bg: "from-purple-600 via-pink-500 to-orange-400",
    icon: <Instagram className="h-3 w-3 text-white" />,
  },
  youtube: {
    label: "YouTube",
    bg: "from-red-600 to-red-500",
    icon: <Youtube className="h-3 w-3 text-white" />,
  },
  tiktok: {
    label: "TikTok",
    bg: "from-slate-800 to-slate-700",
    icon: <span className="text-[9px] font-black text-white">TK</span>,
  },
  all: {
    label: "알터즈 픽",
    bg: "from-amber-600 to-amber-500",
    icon: <span className="text-[9px] font-bold text-white">✦</span>,
  },
}

// ─── Pick Card ────────────────────────────────────────────────────────────────

function PickCard({ pick, index }: { pick: SnsPick; index: number }) {
  const perf = pick.performance
  if (!perf) return null

  const ch = CHANNEL_CONFIG[pick.channel] ?? CHANNEL_CONFIG.all

  return (
    <Link
      href={perf.slug ? `/shows/${perf.slug}` : "/shows"}
      className="group relative flex shrink-0 flex-col overflow-hidden transition-transform duration-300 hover:-translate-y-1.5"
      style={{ width: "clamp(200px, 25vw, 260px)" }}
    >
      {/* 포스터 */}
      <div className="relative overflow-hidden bg-white/5" style={{ aspectRatio: "2/3" }}>
        {perf.poster_url ? (
          <Image
            src={perf.poster_url}
            alt={perf.title}
            fill
            sizes="(max-width: 640px) 200px, 260px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-white/5 to-white/0">
            <span className="text-4xl opacity-30">🎭</span>
          </div>
        )}

        {/* 오버레이 그라데이션 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

        {/* 채널 뱃지 */}
        <div className={`absolute left-3 top-3 flex items-center gap-1.5 bg-gradient-to-r ${ch.bg} px-2.5 py-1.5`}>
          {ch.icon}
          <span className="text-[10px] font-bold uppercase tracking-wide text-white">{ch.label}</span>
        </div>

        {/* 인덱스 넘버 */}
        <div className="absolute right-3 top-3 font-mono text-[11px] font-bold text-white/30">
          {String(index + 1).padStart(2, "0")}
        </div>

        {/* 하단 제목 */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-serif text-[15px] font-bold leading-snug text-white line-clamp-2">
            {perf.title}
          </h3>
          {perf.period_end && (
            <p className="mt-1 text-[11px] text-white/50">
              {new Date(perf.period_end).toLocaleDateString("ko-KR", {
                month: "short",
                day: "numeric",
              })}까지
            </p>
          )}
        </div>
      </div>

      {/* 캡션 영역 */}
      {pick.caption && (
        <div className="border-t border-white/10 bg-white/5 px-3 py-3">
          <p className="text-[12px] leading-relaxed text-white/50 line-clamp-2">
            {pick.caption}
          </p>
        </div>
      )}
    </Link>
  )
}

// ─── Main Section ─────────────────────────────────────────────────────────────

export function SnsPicksSection({ picks }: Props) {
  const validPicks = picks.filter((p) => p.performance !== null)
  if (validPicks.length === 0) return null
  return <SnsPicksSectionInner picks={validPicks} />
}

function SnsPicksSectionInner({ picks }: { picks: SnsPick[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    dragFree: true,
    loop: false,
  })

  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(true)

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on("select", onSelect)
    emblaApi.on("reInit", onSelect)
    onSelect()
    return () => {
      emblaApi.off("select", onSelect)
      emblaApi.off("reInit", onSelect)
    }
  }, [emblaApi, onSelect])

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  return (
    <section
      style={{ background: "oklch(0.135 0.016 285)" }}
      className="relative overflow-hidden"
    >
      {/* 배경 글로우 */}
      <div
        className="pointer-events-none absolute right-0 top-0 h-[400px] w-[600px] opacity-40"
        style={{
          background: "radial-gradient(ellipse at 80% 30%, oklch(0.64 0.18 55 / 0.10) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">

        {/* 헤더 */}
        <div className="mb-8 flex items-end justify-between gap-6">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span
                className="text-[11px] font-bold uppercase tracking-[0.2em]"
                style={{ color: "oklch(0.74 0.17 62)" }}
              >
                ✦ 에디터 픽
              </span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-white sm:text-3xl">
              알터즈가 SNS에서 소개한 공연
            </h2>
            <p className="mt-2 text-sm text-white/40">
              인스타그램·유튜브·틱톡에서 먼저 만난 공연들을 더 깊이 알아보세요.
            </p>
          </div>

          {/* 스크롤 컨트롤 */}
          <div className="hidden shrink-0 items-center gap-2 sm:flex">
            <button
              type="button"
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              className="flex h-9 w-9 items-center justify-center border border-white/15 text-white/40 transition hover:border-white/30 hover:text-white/70 disabled:opacity-20"
              aria-label="이전"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={scrollNext}
              disabled={!canScrollNext}
              className="flex h-9 w-9 items-center justify-center border border-white/15 text-white/40 transition hover:border-white/30 hover:text-white/70 disabled:opacity-20"
              aria-label="다음"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* 캐러셀 */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-3 sm:gap-4">
            {picks.map((pick, i) => (
              <PickCard key={pick.id} pick={pick} index={i} />
            ))}

            {/* 끝에 더보기 버튼 */}
            <Link
              href="/shows"
              className="group flex shrink-0 flex-col items-center justify-center gap-3 border border-white/10 bg-white/5 px-8 transition hover:border-white/20 hover:bg-white/8"
              style={{ width: "clamp(140px, 15vw, 180px)", aspectRatio: "2/3", minHeight: "200px" }}
            >
              <ArrowRight className="h-5 w-5 text-white/30 transition group-hover:text-white/60" />
              <span className="text-center text-[12px] font-semibold text-white/30 transition group-hover:text-white/60">
                공연 전체
                <br />
                보기
              </span>
            </Link>
          </div>
        </div>

        {/* 모바일 스크롤 컨트롤 */}
        <div className="mt-5 flex items-center justify-center gap-2 sm:hidden">
          <button
            type="button"
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className="flex h-8 w-8 items-center justify-center border border-white/15 text-white/40 disabled:opacity-20"
            aria-label="이전"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={scrollNext}
            disabled={!canScrollNext}
            className="flex h-8 w-8 items-center justify-center border border-white/15 text-white/40 disabled:opacity-20"
            aria-label="다음"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </section>
  )
}
