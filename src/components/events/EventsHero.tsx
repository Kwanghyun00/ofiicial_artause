import { Filter, Search, Sparkles } from "lucide-react"

type EventsHeroProps = {
  campaignCount: number
  closingSoonCount: number
  activeCount: number
}

const quickFilters = ["뮤지컬", "전시", "콘서트/클래식", "가족/어린이", "지역 한정"]

export function EventsHero({ campaignCount, closingSoonCount, activeCount }: EventsHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[32px] border border-white/70 bg-gradient-to-br from-primary/8 via-white/70 to-secondary/20 p-8 shadow-xl backdrop-blur md:p-12">
      <div className="pointer-events-none absolute -left-16 top-6 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-6 h-52 w-52 rounded-full bg-secondary/30 blur-3xl" />
      <div className="absolute inset-0 bg-[url('/abstract-geometric-flow.png')] opacity-10" />

      <div className="relative z-10 space-y-6 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary shadow-sm">
          <Sparkles className="h-4 w-4" />
          이번 주 신규 초대권 공개
        </span>
        <h1 className="text-4xl font-bold text-foreground md:text-5xl">
          지금 바로 신청 가능한{" "}
          <span className="bg-gradient-to-r from-primary via-[#6b4eff] to-secondary bg-clip-text text-transparent">
            초대권 이벤트
          </span>
        </h1>
        <p className="text-lg text-muted-foreground">
          뮤지컬·전시·콘서트 등 원하는 프로그램을 고르고 바로 신청하세요. 실시간 데이터로 마감
          임박 이벤트를 알려드립니다.
        </p>

        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="프로그램명, 장소, 키워드를 입력하세요"
              className="h-14 w-full rounded-full border-2 border-border bg-white/90 pl-12 pr-4 text-base text-foreground placeholder:text-muted-foreground shadow-sm transition focus:border-primary focus:outline-none"
            />
          </div>
          <button className="h-14 rounded-full bg-primary px-8 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:bg-primary/90">
            검색
          </button>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          <a
            href="/events/guide"
            className="inline-flex h-11 items-center justify-center rounded-full border border-border/80 bg-white/70 px-5 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary"
          >
            응모 가이드
          </a>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {quickFilters.map((filter) => (
            <button
              key={filter}
              className="rounded-full border border-border/80 bg-white/70 px-4 py-1.5 text-sm text-muted-foreground transition hover:border-primary hover:bg-primary/5 hover:text-primary"
            >
              {filter}
            </button>
          ))}
          <button className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-white/70 px-4 py-1.5 text-sm text-muted-foreground transition hover:border-primary hover:bg-primary/5 hover:text-primary">
            <Filter className="h-4 w-4" />
            필터 열기
          </button>
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
    <div className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-lg">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold text-primary">{value}</p>
      <p className="text-xs text-muted-foreground">{caption}</p>
    </div>
  )
}
