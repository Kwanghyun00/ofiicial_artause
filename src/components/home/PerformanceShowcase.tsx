import Image from "next/image"
import Link from "next/link"
import type { Show } from "./types"
import { Calendar, MapPin } from "lucide-react"
import { getPosterFallback } from "@/constants/posters"

type Props = {
  shows: Show[]
}

export function PerformanceShowcase({ shows }: Props) {
  if (!shows.length) return null

  return (
    <section className="space-y-6 border-t border-border/60 bg-secondary/30 py-12 md:py-16">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">현재 진행 중 공연/이벤트</h2>
          <p className="text-sm text-muted-foreground">알터즈가 함께 운영하거나 홍보한 공연을 확인하세요.</p>
        </div>
        <Link
          href="/works"
          className="self-start rounded-full border border-primary/40 px-6 py-2 text-sm font-semibold text-primary transition hover:border-primary hover:bg-primary/10"
        >
          전체 아카이브
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {shows.map((show, index) => {
          const posterUrl = show.poster_url ?? getPosterFallback(index)
          return (
            <article key={show.id} className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="relative h-48 w-full">
                <Image src={posterUrl} alt={show.title} fill className="object-cover" />
              </div>
              <div className="flex flex-1 flex-col p-4">
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {(show.tags ?? []).slice(0, 3).map((tag) => (
                    <span key={tag} className="rounded-full bg-primary/10 px-3 py-1 text-primary">
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="mt-3 line-clamp-2 text-lg font-bold text-foreground">{show.title}</h3>
                <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                  {show.region && (
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {show.region}
                    </p>
                  )}
                  {(show.period_start || show.period_end) && (
                    <p className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {formatPeriod(show.period_start, show.period_end)}
                    </p>
                  )}
                </div>
                <Link
                  href="/contact"
                  className="mt-4 inline-flex items-center justify-center rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary hover:bg-primary/10"
                >
                  협업 문의
                </Link>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function formatPeriod(start?: string | null, end?: string | null) {
  if (!start && !end) return "상시 진행"
  const startText = start ? formatDate(start) : "미정"
  const endText = end ? formatDate(end) : "미정"
  if (startText === endText) return startText
  return `${startText} ~ ${endText}`
}

function formatDate(value?: string | null) {
  if (!value) return "미정"
  return new Date(value).toLocaleDateString("ko-KR", {
    month: "short",
    day: "numeric",
  })
}
