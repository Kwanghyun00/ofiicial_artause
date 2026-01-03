import { Card, CardContent } from "@/components/ui/card"
import { Users2, Crown, Clock9, Map } from "lucide-react"

const metrics = [
  {
    icon: Users2,
    label: "누적 초대 경험",
    value: "82,000+",
    detail: "지난 12개월 기준",
  },
  {
    icon: Crown,
    label: "프리미엄 파트너",
    value: "64곳",
    detail: "뮤지컬 · 전시 · 클래식",
  },
  {
    icon: Clock9,
    label: "평균 당일 안내",
    value: "3시간",
    detail: "모바일 티켓 발송",
  },
  {
    icon: Map,
    label: "초청 도시",
    value: "6개",
    detail: "서울 · 부산 · 대구 외",
  },
]

const highlights = [
  {
    title: "라이브 초대 캘린더",
    description: "실시간으로 열리는 공연을 한 눈에 확인하고, 마감 임박 순으로 구성된 캘린더로 빠르게 신청할 수 있어요.",
  },
  {
    title: "멤버십 큐레이션",
    description: "관람 이력과 선호 장르를 바탕으로 매주 월요일 오전, 꼭 맞는 초대만 골라서 알림으로 전해드려요.",
  },
  {
    title: "파트너 익스클루시브",
    description: "새로운 전시 프리뷰, 무대 뒤 리허설, 아티스트 토크 등 일반 예매로는 경험하기 어려운 순간을 엽니다.",
  },
]

export function ExperienceMetrics() {
  return (
    <section className="bg-card py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6 space-y-12">
        <div className="text-center space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Impact</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Artause가 만들어낸 문화 초청 경험의 스케일
          </h2>
          <p className="text-muted-foreground text-base md:text-lg">
            실시간 수요 데이터와 큐레이터 네트워크를 기반으로 더 정교한 초대 여정을 설계했어요.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => (
            <Card key={metric.label} className="border-border/70 bg-background/80 backdrop-blur">
              <CardContent className="space-y-3 p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <metric.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{metric.label}</p>
                  <p className="text-3xl font-bold text-foreground">{metric.value}</p>
                  <p className="text-sm text-muted-foreground">{metric.detail}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {highlights.map((item) => (
            <Card key={item.title} className="border-primary/20 bg-primary/5">
              <CardContent className="space-y-3 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Program</p>
                <h3 className="text-xl font-bold text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
