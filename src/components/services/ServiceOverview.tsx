import { Ticket, Play, Pen } from "lucide-react"
import type { LucideIcon } from "lucide-react"

type Service = {
  icon: LucideIcon
  title: string
  desc: string
  highlights: string[]
  accent: string
  iconBg: string
  badge?: string
  badgeClass?: string
}

const SERVICES: Service[] = [
  {
    icon: Ticket,
    title: "초대권 이벤트 운영",
    desc: "이벤트 페이지 개설부터 추첨·선정·당첨 안내까지. 공연단체가 직접 처리하던 수작업을 알터즈가 대행합니다.",
    highlights: ["이벤트 페이지 생성 및 운영", "무작위 추첨 및 선정 처리", "당첨자 이메일 안내 발송"],
    accent: "border-t-primary/50",
    iconBg: "bg-primary/10 text-primary",
  },
  {
    icon: Pen,
    title: "SNS 홍보 콘텐츠",
    desc: "카드뉴스, 숏폼, 관람 포인트 큐레이션까지. 공연의 매력을 관객 언어로 전달하는 콘텐츠를 직접 제작합니다.",
    highlights: ["카드뉴스 · 숏폼 콘텐츠 제작", "관람 포인트 큐레이션", "인스타그램·유튜브 맞춤 포맷"],
    accent: "border-t-green-400",
    iconBg: "bg-green-50 text-green-600",
  },
  {
    icon: Play,
    title: "보상형 광고 · AdGate",
    desc: "관객이 광고를 시청한 뒤 초대권에 응모합니다. 빈 좌석이 광고 수익으로 바뀌는 새로운 모델입니다.",
    highlights: ["광고 시청 → 응모 자격 부여", "공연단체에 수익 배분", "관객 참여 동기 강화"],
    accent: "border-t-blue-400",
    iconBg: "bg-blue-50 text-blue-600",
    badge: "베타 준비 중",
    badgeClass: "bg-amber-100 text-amber-700",
  },
]

export function ServiceOverview() {
  return (
    <section id="services" className="border-t border-border/40 py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-14 space-y-3 text-center">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            알터즈가 제공하는 서비스
          </h2>
          <p className="mx-auto max-w-xl text-muted-foreground">
            초대권 이벤트 운영과 SNS 홍보를 중심으로, 공연단체의 관객 확보를 직접 돕습니다.
          </p>
        </div>

        {/* 3개 카드 */}
        <div className="grid gap-5 sm:grid-cols-3">
          {SERVICES.map((svc) => (
            <div
              key={svc.title}
              className={`stage-panel flex flex-col border-t-2 p-6 transition-all hover:shadow-md hover:border-primary/20 ${svc.accent}`}
            >
              {/* 아이콘 + 배지 */}
              <div className="mb-4 flex items-start justify-between">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${svc.iconBg}`}>
                  <svc.icon className="h-5 w-5" />
                </div>
                {svc.badge && (
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${svc.badgeClass}`}>
                    {svc.badge}
                  </span>
                )}
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
