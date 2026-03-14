import { BellRing, ChartArea, Database } from "lucide-react"

const pillars = [
  {
    icon: Database,
    title: "관객 관리",
    description: "참여자 정보를 체계적으로 관리하고 분석해요.",
    details: ["📊 참여 히스토리", "🏷️ 맞춤 태그 분류", "📤 손쉬운 내보내기"],
    emoji: "📁",
    color: "from-primary/20 to-primary/5",
  },
  {
    icon: ChartArea,
    title: "이벤트 파이프라인",
    description: "응모부터 당첨까지, 전 과정을 자동화합니다.",
    details: ["📝 신청 폼 연동", "🎯 선정 프로세스", "📢 자동 알림"],
    emoji: "⚙️",
    color: "from-accent/20 to-accent/5",
  },
  {
    icon: BellRing,
    title: "성과 추적",
    description: "홍보 효과를 한눈에 확인하고 개선하세요.",
    details: ["📈 UTM 분석", "🎨 채널별 전환", "📑 리포트 생성"],
    emoji: "📊",
    color: "from-primary/15 to-accent/10",
    badge: "Coming Soon",
  },
]

export function ValuePropSection() {
  return (
    <section className="relative border-t border-border/40 bg-gradient-to-b from-muted/20 to-background py-16 md:py-20 lg:py-24">
      {/* 배경 장식 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/3 top-0 h-96 w-96 rounded-full bg-gradient-radial from-primary/8 to-transparent blur-3xl" />
        <div className="absolute right-1/3 bottom-0 h-96 w-96 rounded-full bg-gradient-radial from-accent/8 to-transparent blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-10 space-y-4 text-center sm:mb-12">
          <div className="inline-block">
            <span className="cue">Web Service 💻</span>
          </div>
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl md:text-5xl">
            공연 운영의 디지털 전환
          </h2>
          <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg md:text-xl">
            관객 관리부터 성과 분석까지,
            <br className="hidden sm:block" />
            공연 운영을 더 스마트하게 만드는 웹서비스를 준비 중입니다.
          </p>
        </div>

        {/* 카드 그리드 */}
        <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {pillars.map((pillar, index) => (
            <article
              key={pillar.title}
              className="spotlight-card group relative flex h-full flex-col gap-5 overflow-hidden p-6 sm:p-7"
              style={{
                animationDelay: `${index * 0.1}s`,
              }}
            >
              {/* 배경 그라데이션 */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${pillar.color} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
              />

              {/* Coming Soon 뱃지 */}
              {pillar.badge && (
                <div className="absolute right-4 top-4">
                  <span className="rounded-full bg-gradient-to-r from-primary to-accent px-3 py-1 text-xs font-bold text-white shadow-lg">
                    {pillar.badge}
                  </span>
                </div>
              )}

              {/* 아이콘 + 이모지 */}
              <div className="relative flex items-start justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-accent/10 shadow-sm transition-all group-hover:scale-110 group-hover:shadow-lg">
                  <pillar.icon className="h-7 w-7 text-primary" />
                </div>
                <span className="text-3xl transition-transform group-hover:scale-110 group-hover:rotate-12">
                  {pillar.emoji}
                </span>
              </div>

              {/* 제목 + 설명 */}
              <div className="relative">
                <h3 className="mb-2 text-xl font-bold text-foreground transition-colors group-hover:text-primary sm:text-2xl">
                  {pillar.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {pillar.description}
                </p>
              </div>

              {/* 기능 목록 */}
              <ul className="relative mt-auto space-y-2.5 text-sm text-foreground/90 sm:text-base">
                {pillar.details.map((detail) => (
                  <li key={detail} className="flex items-center gap-2.5">
                    <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary transition-all group-hover:scale-150" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
