import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Check } from "lucide-react"

const tiers = [
  {
    name: "Community",
    price: "무료",
    description: "모든 초청 이벤트를 열람하고 주간 뉴스레터를 받아볼 수 있어요.",
    perks: ["주간 초청 캘린더", "모바일 신청 · 추첨", "마감 임박 알림"],
    badge: "신규회원",
  },
  {
    name: "Curator",
    price: "월 19,000원",
    description: "개인 취향 기반 추천, 좌석 업그레이드, 프리뷰 우선 초청을 제공합니다.",
    perks: ["1:1 큐레이션 리포트", "좌석/시간대 우선 배정", "프리뷰 & 리허설 접근", "멤버 전용 커뮤니티"],
    badge: "가장 인기 많음",
    featured: true,
  },
  {
    name: "Partner",
    price: "맞춤 견적",
    description: "브랜드 · 기관 대상 맞춤형 문화 프로그램 운영을 도와드립니다.",
    perks: ["전용 제휴 매니저", "브랜디드 컬처 클래스", "임직원 문화 복지 플랜"],
    badge: "B2B",
  },
]

export function MembershipSection() {
  return (
    <section className="bg-secondary/30 py-20">
      <div className="container mx-auto px-4 md:px-6 space-y-10">
        <div className="text-center space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Membership</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">필요한 만큼 초청을 누릴 수 있는 멤버십</h2>
          <p className="text-muted-foreground text-base md:text-lg">
            무료로 시작하고, 더 많은 맞춤 큐레이션이 필요할 때 단계적으로 확장하세요.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {tiers.map((tier) => (
            <Card
              key={tier.name}
              className={`flex flex-col border-2 ${
                tier.featured ? "border-primary shadow-xl shadow-primary/10" : "border-border"
              }`}
            >
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-foreground">{tier.name}</h3>
                  <Badge variant="secondary" className={tier.featured ? "bg-primary text-primary-foreground" : ""}>
                    {tier.badge}
                  </Badge>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">{tier.price}</p>
                  <p className="text-sm text-muted-foreground">{tier.description}</p>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-6 pb-6">
                <ul className="space-y-3 text-sm text-foreground/90">
                  {tier.perks.map((perk) => (
                    <li key={perk} className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-primary">
                        <Check className="h-3 w-3" />
                      </span>
                      {perk}
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${tier.featured ? "" : "border-primary/40 text-primary hover:bg-primary/5"}`}
                  variant={tier.featured ? "default" : "outline"}
                >
                  {tier.featured ? "멤버십 가입하기" : "상세 보기"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
