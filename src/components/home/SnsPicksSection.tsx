"use client"

import { useRef, useCallback, useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeft, ChevronRight, Instagram, Youtube } from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

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

type Props = {
  picks: SnsPick[]
}

// ─── Channel badge ────────────────────────────────────────────────────────────

function ChannelBadge({ channel }: { channel: string }) {
  if (channel === "instagram") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 px-2.5 py-1 text-xs font-bold text-white">
        <Instagram className="h-3 w-3" />
        인스타그램
      </span>
    )
  }
  if (channel === "youtube") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white">
        <Youtube className="h-3 w-3" />
        유튜브
      </span>
    )
  }
  if (channel === "tiktok") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-black px-2.5 py-1 text-xs font-bold text-white">
        <span className="text-[10px] font-black tracking-tighter">TikTok</span>
        틱톡
      </span>
    )
  }
  // all
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary/90 px-2.5 py-1 text-xs font-bold text-primary-foreground">
      알터즈 픽
    </span>
  )
}

// ─── Pick Card ────────────────────────────────────────────────────────────────

function PickCard({ pick }: { pick: SnsPick }) {
  const perf = pick.performance
  if (!perf) return null

  return (
    <Link
      href={perf.slug ? `/shows/${perf.slug}` : "/shows"}
      className="group relative flex h-full min-w-[220px] w-[220px] flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition hover:shadow-lg hover:-translate-y-1 sm:min-w-[240px] sm:w-[240px]"
    >
      {/* Poster */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
        {perf.poster_url ? (
          <Image
            src={perf.poster_url}
            alt={perf.title}
            fill
            sizes="240px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/10">
            <span className="text-4xl">🎭</span>
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        {/* Channel badge */}
        <div className="absolute left-3 top-3">
          <ChannelBadge channel={pick.channel} />
        </div>
        {/* Title overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-sm font-bold text-white leading-snug line-clamp-2">{perf.title}</p>
        </div>
      </div>

      {/* Caption */}
      {pick.caption && (
        <div className="px-3 py-3">
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {pick.caption}
          </p>
        </div>
      )}

      {/* Category + period */}
      <div className="mt-auto flex items-center justify-between px-3 pb-3 pt-1">
        {perf.category && (
          <span className="text-[11px] font-semibold text-muted-foreground/70">
            {perf.category}
          </span>
        )}
        {perf.period_end && (
          <span className="text-[11px] text-muted-foreground/60">
            {new Date(perf.period_end).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}까지
          </span>
        )}
      </div>
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
    slidesToScroll: 1,
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
    <section className="py-14 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-end justify-between gap-4">
          <div className="space-y-2">
            <span className="cue">에디터 픽</span>
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              알터즈가 주목한 공연
            </h2>
            <p className="text-sm text-muted-foreground">
              SNS에서 소개한 공연들을 웹사이트에서 더 깊이 알아보세요.
            </p>
          </div>

          {/* Nav arrows (desktop) */}
          <div className="hidden items-center gap-2 sm:flex">
            <button
              type="button"
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-sm transition hover:border-primary/60 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="이전"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={scrollNext}
              disabled={!canScrollNext}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-sm transition hover:border-primary/60 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="다음"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4 pb-2">
            {picks.map((pick) => (
              <PickCard key={pick.id} pick={pick} />
            ))}
          </div>
        </div>

        {/* Mobile nav arrows */}
        <div className="mt-5 flex items-center justify-center gap-3 sm:hidden">
          <button
            type="button"
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-sm transition hover:border-primary/60 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="이전"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={scrollNext}
            disabled={!canScrollNext}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-sm transition hover:border-primary/60 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="다음"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  )
}
