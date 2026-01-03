import Link from "next/link"
import { ArrowRight, Bell, Sparkles, Zap } from "lucide-react"

type HomeHeroProps = {
  totalCampaigns: number
  activeCampaigns: number
  liveApplicants: number
  nextDeadline?: string
}

const timeline = [
  {
    title: "취향 등록",
    description: "관람을 원하는 장르·시간대·동반인을 저장하면 맞춤 알림을 준비해요.",
  },
  {
    title: "초대 신청",
    description: "주간 캘린더에서 원하는 프로그램을 골라 간편하게 신청합니다.",
  },
  {
    title: "디지털 티켓",
    description: "평균 3시간 이내에 모바일 초대권을 받아 당일 관람까지 이어집니다.",
  },
]

export function HomeHero({ totalCampaigns, activeCampaigns, liveApplicants, nextDeadline }: HomeHeroProps) {
  const stats = [
    { label: "이번 주 초대", value: `${totalCampaigns}개 프로그램`, caption: `모집 중 ${activeCampaigns}건` },
    { label: "실시간 신청자", value: `${liveApplicants.toLocaleString()}명`, caption: "누적 신청 인원" },
    { label: "다음 마감", value: nextDeadline ?? "오늘", caption: "마감 임박 초대" },
  ]

  return (
    <section className="relative overflow-hidden rounded-[32px] border border-white/20 bg-gradient-to-br from-background via-secondary/40 to-background p-8 shadow-2xl md:p-12">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(139,123,168,0.12),_transparent_60%)]" />
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <div className="space-y-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
            <Sparkles className="h-4 w-4" />
            멤버 전용 초대 프로그램
          </span>

          <div className="space-y-6">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              원하는 순간에 도착하는
              <br />
              <span className="text-primary">프리미엄 문화 초대</span>
            </h1>
            <p className="text-lg leading-relaxed text-muted-foreground">
              뮤지컬, 전시, 클래식 공연까지. 보고 싶었던 무대를 아트하우스 멤버 전용 초청으로 만나보세요. 설정한 취향에 맞는 알림만 선별해서 전해드립니다.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/events"
              className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition hover:-translate-y-0.5 hover:bg-primary/90"
            >
              이번 주 초대 확인하기
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="/me/alerts"
              className="inline-flex h-12 items-center justify-center rounded-full border-2 border-border px-8 text-base font-semibold text-foreground transition hover:border-primary hover:bg-primary/5"
            >
              맞춤 큐레이션 받기
              <Bell className="ml-2 h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-border/80 bg-white/80 p-4 shadow-sm backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{stat.label}</p>
                <p className="text-lg font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.caption}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mx-auto flex w-full max-w-md flex-col gap-6 rounded-[32px] border border-white/50 bg-white/90 p-6 shadow-xl backdrop-blur">
          <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 to-white p-6 shadow-inner">
            <div className="mb-5 flex items-center justify-between text-xs font-semibold text-muted-foreground">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 px-3 py-1 text-primary">
                <Zap className="h-3.5 w-3.5" />
                라이브 초대
              </span>
              <span className="text-primary">D-3</span>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-primary/70">뮤지컬</p>
              <p className="text-2xl font-bold text-foreground">데스노트 : 더 뮤지컬</p>
              <p className="text-sm text-muted-foreground">부산시민회관 대극장 · 3월 15일(토) 19:30</p>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-2xl bg-white/90 p-4">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">좌석</p>
                <p className="text-xl font-bold text-primary">R석 20매</p>
              </div>
              <Link href="/events" className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                즉시 신청
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-background/80 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">신청 여정</p>
            <div className="mt-4 space-y-4">
              {timeline.map((item, index) => (
                <div key={item.title} className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/30 text-sm font-semibold text-primary">
                    0{index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
