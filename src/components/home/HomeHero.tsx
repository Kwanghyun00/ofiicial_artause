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
    title: "자료 수집",
    description: "공연 정보와 관람 포인트를 빠르게 정리합니다.",
  },
  {
    title: "이벤트 제작",
    description: "초대권 이벤트 페이지와 참여 흐름을 구성합니다.",
  },
  {
    title: "운영/확산",
    description: "채널 운영과 공지로 관객을 연결합니다.",
  },
]

export function HomeHero({ totalCampaigns, activeCampaigns, liveApplicants, nextDeadline }: HomeHeroProps) {
  const stats = [
    { label: "진행 중 이벤트", value: `${activeCampaigns}건`, caption: `전체 ${totalCampaigns}건` },
    { label: "누적 응모", value: `${liveApplicants.toLocaleString()}명`, caption: "커뮤니티 참여" },
    { label: "다음 마감", value: nextDeadline ?? "이번 주", caption: "초대권 이벤트" },
  ]

  return (
    <section className="relative overflow-hidden py-12 md:py-18">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(139,123,168,0.18),_transparent_55%)]" />
      <div className="absolute -left-24 top-8 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute -right-24 bottom-6 h-56 w-56 rounded-full bg-secondary/30 blur-3xl" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="space-y-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary shadow-sm shadow-primary/20">
              <Sparkles className="h-4 w-4" />
              초대권 이벤트 운영
            </span>

            <div className="space-y-6">
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                초대권 이벤트로
                <br />
                <span className="bg-gradient-to-r from-primary via-[#6b4eff] to-secondary bg-clip-text text-transparent">
                  관객을 모읍니다.
                </span>
              </h1>
              <p className="text-lg leading-relaxed text-muted-foreground">
                이 사이트에서 진행 중인 초대권 이벤트를 확인하고 바로 응모하세요. 알터즈는 공연 홍보와
                이벤트 운영을 연결해 관객 접점을 확장합니다.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/events"
                className="group inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition hover:-translate-y-0.5 hover:bg-primary/90"
              >
                초대권 응모하기
                <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex h-12 items-center justify-center rounded-full border-2 border-border bg-white/70 px-8 text-base font-semibold text-foreground transition hover:border-primary hover:bg-primary/5"
              >
                기업/단체 문의
                <Bell className="ml-2 h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {stats.map((stat, index) => (
                <div
                  key={`${stat.label}-${index}`}
                  className="rounded-2xl border border-border/80 bg-white/80 p-4 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{stat.label}</p>
                  <p className="text-lg font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.caption}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto flex w-full max-w-md flex-col gap-6 rounded-[28px] border border-white/60 bg-white/90 p-6 shadow-xl backdrop-blur transition hover:-translate-y-1 hover:shadow-2xl">
            <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-white to-white p-6">
              <div className="mb-5 flex items-center justify-between text-xs font-semibold text-muted-foreground">
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 px-3 py-1 text-primary">
                  <Zap className="h-3.5 w-3.5" />
                  이번 주 이벤트
                </span>
                <span className="text-primary">D-4</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-primary/70">연극</p>
                <p className="text-2xl font-bold text-foreground">햄릿재판</p>
                <p className="text-sm text-muted-foreground">홍대 라이브홀 · 3월 8일(토) 19:30</p>
              </div>
              <div className="mt-4 flex items-center justify-between rounded-2xl bg-white/90 p-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">응모</p>
                  <p className="text-xl font-bold text-primary">초대권 이벤트</p>
                </div>
                <Link
                  href="/events"
                  className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:-translate-y-0.5 hover:bg-primary/90"
                >
                  응모하기
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-border/60 bg-background/80 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">이벤트 운영 방식</p>
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
      </div>
    </section>
  )
}
