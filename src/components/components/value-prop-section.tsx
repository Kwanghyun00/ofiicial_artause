import { Card, CardContent } from "@/components/ui/card"
import { ChartArea, Gift, BellRing } from "lucide-react"

const pillars = [
  {
    icon: ChartArea,
    title: "데이터 기반 큐레이션",
    description: "관람 이력과 선호도를 분석해 1:1 추천초대를 구성하고, 당첨 확률까지 예측해 알려드립니다.",
    details: ["실시간 대기열/좌석 데이터", "멤버 취향 그래프", "예측 당첨률"],
  },
  {
    icon: Gift,
    title: "프리미엄 파트너십",
    description: "뮤지컬/전시/클래식 대표 파트너 60여 곳과 협업해 프리뷰, 리허설, 아티스트 토크를 엽니다.",
    details: ["리허설 & 백스테이지", "큐레이터 컬렉션", "브랜디드 컬처 클래스"],
  },
  {
    icon: BellRing,
    title: "원스톱 신청 경험",
    description: "앱/웹 어디서든 간편하게 신청하고 모바일 초대권으로 입장까지 연결되는 경험을 설계했습니다.",
    details: ["평균 3시간 이내 티켓 발송", "동반인 초대 관리", "이벤트 히스토리 보관"],
  },
]

export function ValuePropSection() {
  return (
    <section className="border-y border-border bg-card py-20">
      <div className="container mx-auto px-4 md:px-6 space-y-12">
        <div className="text-center space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Why Artause</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">문화 초청을 위한 새로운 표준</h2>
          <p className="text-muted-foreground text-base md:text-lg">
            단순한 이벤트 소개가 아니라, 원하는 순간에 원하는 초대를 연결해 주는 운영 시스템을 구축했습니다.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {pillars.map((pillar) => (
            <Card key={pillar.title} className="h-full border border-border/80 bg-background">
              <CardContent className="flex h-full flex-col gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <pillar.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">{pillar.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{pillar.description}</p>
                </div>
                <ul className="mt-auto space-y-2 text-sm text-foreground/80">
                  {pillar.details.map((detail) => (
                    <li key={detail} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                      {detail}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
