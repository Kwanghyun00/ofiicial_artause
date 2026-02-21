import { Ticket, Play, Pen, BarChart3 } from "lucide-react"
import type { LucideIcon } from "lucide-react"

type Service = {
  icon: LucideIcon
  title: string
  desc: string
  highlights: string[]
  accent: string
  iconBg: string
}

const SERVICES: Service[] = [
  {
    icon: Ticket,
    title: "초대권 운영 자동화",
    desc: "신청 접수부터 선정·확정·체크인·리포트까지. 수작업 없이 초대권 운영 전 과정을 자동화합니다.",
    highlights: ["2단계 확정 (선정→확정)", "웨이트리스트 자동 승격", "현장 체크인 콘솔"],
    accent: "border-t-primary/50",
    iconBg: "bg-primary/10 text-primary",
  },
  {
    icon: Play,
    title: "보상형 광고 · AdGate",
    desc: "관객이 광고를 시청한 뒤 초대권에 응모합니다. 빈 좌석이 광고 수익으로 바뀌는 새로운 모델입니다.",
    highlights: ["광고 시청 → 응모 자격 부여", "공연단체에 수익 배분", "관객 참여 동기 강화"],
    accent: "border-t-blue-400",
    iconBg: "bg-blue-50 text-blue-600",
  },
  {
    icon: Pen,
    title: "SNS 홍보 콘텐츠",
    desc: "카드뉴스, 숏폼, 관람 포인트 정리까지. 공연의 매력을 관객 언어로 전달하는 콘텐츠를 제작합니다.",
    highlights: ["카드뉴스 · 숏폼 제작", "관람 포인트 큐레이션", "채널별 맞춤 콘텐츠"],
    accent: "border-t-green-400",
    iconBg: "bg-green-50 text-green-600",
  },
  {
    icon: BarChart3,
    title: "관객 데이터 · CRM",
    desc: "공연이 끝나도 관객 데이터는 남습니다. 세그먼트 분석과 재방문 캠페인으로 관객을 자산화합니다.",
    highlights: ["신규/재방문/노쇼 자동 분류", "다음 작품 타겟 리스트", "공연별 인사이트 리포트"],
    accent: "border-t-purple-400",
    iconBg: "bg-purple-50 text-purple-600",
  },
]

export function ServiceOverview() {
  return (
    <section id="services" className="border-t border-border/40 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-14 space-y-3 text-center">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            알터즈가 제공하는 서비스
          </h2>
          <p className="mx-auto max-w-xl text-muted-foreground">
            초대권 운영을 중심으로, 공연단체의 관객 확보와 수익 창출을 돕는 4가지 서비스를 운영합니다.
          </p>
        </div>

        {/* 4개 카드 */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((svc) => (
            <div
              key={svc.title}
              className={`stage-panel flex flex-col border-t-2 p-6 transition-all hover:shadow-md hover:border-primary/20 ${svc.accent}`}
            >
              {/* 아이콘 */}
              <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${svc.iconBg}`}>
                <svc.icon className="h-5 w-5" />
              </div>

              {/* 제목 */}
              <h3 className="mb-2 text-lg font-extrabold text-foreground">{svc.title}</h3>

              {/* 설명 */}
              <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground">{svc.desc}</p>

              {/* 하이라이트 */}
              <ul className="space-y-1.5">
                {svc.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2 text-xs text-foreground">
                    <span className="mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600" style={{ fontSize: 7 }}>
                      ✓
                    </span>
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
