import type { Show } from "./types"
import { Calendar, MapPin, Star } from "lucide-react"

type Props = {
  shows: Show[]
}

export function PerformanceShowcase({ shows }: Props) {
  if (!shows.length) return null

  return (
    <section className="space-y-6 rounded-[32px] border border-border bg-secondary/40 p-8 md:p-12">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">공연 · 전시 추천</h2>
          <p className="text-sm text-muted-foreground">큐레이터가 엄선한 프로그램을 미리 확인하세요.</p>
        </div>
        <button type="button" className="self-start rounded-full border border-primary/40 px-6 py-2 text-sm font-semibold text-primary transition hover:border-primary hover:bg-primary/10">
          더 많은 공연 보기
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {shows.map((show, index) => (
          <article key={show.id} className="flex h-full flex-col rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">{show.tags?.[0] ?? "공연"}</span>
              <span className="inline-flex items-center gap-1 text-amber-500">
                <Star className="h-3 w-3 fill-amber-400" />
                9.{(index % 3) + 5}
              </span>
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
            <button type="button" className="mt-4 inline-flex items-center justify-center rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary hover:bg-primary/10">
              상세 보기
            </button>
          </article>
        ))}
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
