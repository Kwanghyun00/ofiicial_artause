import Link from "next/link"
import { Sparkles } from "lucide-react"

type EventsHeroProps = {
  campaignCount: number
  closingSoonCount: number
  activeCount: number
}

export function EventsHero({ campaignCount, closingSoonCount, activeCount }: EventsHeroProps) {
  return (
    <section className="stage-panel relative overflow-hidden p-8 md:p-12">
      <div className="pointer-events-none absolute -left-16 top-6 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-6 h-52 w-52 rounded-full bg-accent/20 blur-3xl" />

      <div className="relative z-10 space-y-6 text-center">
        <span className="cue">
          <Sparkles className="h-4 w-4" />
          이번 주 신규 초대권 공개
        </span>
        <h1 className="text-3xl font-semibold text-foreground sm:text-4xl md:text-5xl">
          지금 바로 신청 가능한 <span className="text-primary">초대권 이벤트</span>
        </h1>
        <p className="text-lg text-muted-foreground">
          뮤지컬·연극 원하는 공연을 고르고 바로 신청하세요. 당첨되면 무료로 관람하실 수 있습니다.
        </p>

        <div className="flex flex-wrap justify-center gap-2">
          <Link
            href="/events/guide"
            className="inline-flex h-11 items-center justify-center rounded-full border border-border/80 bg-background/70 px-5 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary"
          >
            응모 가이드
          </Link>
        </div>

        <div className="grid gap-4 pt-4 sm:grid-cols-3">
          <StatCard label="진행 중" value={`${activeCount}건`} caption="현재 모집 중 이벤트" />
          <StatCard label="마감 임박" value={`${closingSoonCount}건`} caption="3일 이내 마감" />
          <StatCard label="전체 프로그램" value={`${campaignCount}건`} caption="이번 주 공개" />
        </div>
      </div>
    </section>
  )
}

function StatCard({ label, value, caption }: { label: string; value: string; caption: string }) {
  return (
    <div className="spotlight-card p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold text-primary">{value}</p>
      <p className="text-xs text-muted-foreground">{caption}</p>
    </div>
  )
}
