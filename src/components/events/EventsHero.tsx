import Link from "next/link"

type EventsHeroProps = {
  campaignCount: number
  closingSoonCount: number
  activeCount: number
}

export function EventsHero({ campaignCount, closingSoonCount, activeCount }: EventsHeroProps) {
  return (
    <div className="space-y-8">
      {/* 헤딩 블록 */}
      <div className="space-y-4">
        <span className="cue">이번 주 신규 초대권 공개</span>
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl md:text-5xl">
          지금 바로 신청 가능한{" "}
          <span className="gradient-text">초대권 이벤트</span>
        </h1>
        <p className="max-w-xl text-base text-muted-foreground sm:text-lg">
          뮤지컬·연극·클래식 — 원하는 공연을 고르고 바로 신청하세요.
          당첨되면 무료로 관람하실 수 있습니다.
        </p>
        <Link
          href="/invites/guide"
          className="inline-flex items-center rounded-full border border-border/70 px-5 py-2.5 text-sm font-semibold text-foreground/80 transition hover:border-primary/60 hover:text-primary"
        >
          응모 가이드 보기 →
        </Link>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <StatCard
          label="진행 중"
          value={`${activeCount}건`}
          caption="현재 모집 중"
          accent={activeCount > 0}
        />
        <StatCard
          label="마감 임박"
          value={`${closingSoonCount}건`}
          caption="3일 이내 마감"
          urgent={closingSoonCount > 0}
        />
        <StatCard
          label="전체 이벤트"
          value={`${campaignCount}건`}
          caption="이번 시즌 공개"
        />
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  caption,
  accent,
  urgent,
}: {
  label: string
  value: string
  caption: string
  accent?: boolean
  urgent?: boolean
}) {
  return (
    <div className={`spotlight-card p-4 text-center sm:p-5 ${urgent ? "ring-1 ring-destructive/30" : ""}`}>
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground sm:text-xs">
        {label}
      </p>
      <p className={`mt-1.5 text-xl font-bold sm:text-2xl ${urgent ? "text-destructive" : accent ? "text-primary" : "text-foreground"}`}>
        {value}
      </p>
      <p className="mt-0.5 text-[11px] text-muted-foreground sm:text-xs">{caption}</p>
    </div>
  )
}
