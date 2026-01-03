import { Users2, Crown, Clock9, Map } from "lucide-react"

const metrics = [
  { icon: Users2, label: "누적 초대 경험", value: "82,000+", detail: "최근 12개월 기준" },
  { icon: Crown, label: "프리미엄 파트너", value: "64곳", detail: "뮤지컬 · 전시 · 클래식" },
  { icon: Clock9, label: "평균 안내 소요", value: "3시간", detail: "모바일 티켓 발송" },
  { icon: Map, label: "초청 도시", value: "6개", detail: "서울 · 부산 · 대구 외" },
]

const highlights = [
  {
    title: "라이브 초대 캘린더",
    description: "마감 임박 순으로 구성된 캘린더에서 원하는 프로그램을 빠르게 신청할 수 있어요.",
  },
  {
    title: "멤버십 큐레이션",
    description: "관람 이력과 선호 장르를 분석해 월·목 오전에 꼭 맞는 초대를 추천해 드립니다.",
  },
  {
    title: "파트너 익스클루시브",
    description: "프리뷰, 리허설, 아티스트 토크 등 일반 예매로는 어려운 경험을 마련합니다.",
  },
]

export function ExperienceMetrics() {
  return (
    <section className="rounded-[32px] bg-gradient-to-b from-[#FDFCFA] via-[#F5EFE7]/70 to-[#FBF9F6] py-16 md:py-20 shadow-inner">
      <div className="mx-auto max-w-6xl space-y-12 px-4 md:px-6">
        <div className="space-y-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-primary">성과 지표</p>
          <h2 className="text-3xl font-bold text-foreground md:text-4xl">아트하우스가 만들어 낸 초대 경험</h2>
          <p className="text-base text-muted-foreground md:text-lg">
            실시간 수요 데이터와 큐레이터 네트워크를 기반으로 정교한 초대 여정을 설계했습니다.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-2xl border border-border/70 bg-background/80 p-6 backdrop-blur">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <metric.icon className="h-6 w-6" />
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">{metric.label}</p>
              <p className="text-3xl font-bold text-foreground">{metric.value}</p>
              <p className="text-sm text-muted-foreground">{metric.detail}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {highlights.map((item) => (
            <div key={item.title} className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">핵심 프로그램</p>
              <h3 className="mt-2 text-xl font-bold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
