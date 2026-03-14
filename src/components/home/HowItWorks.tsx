import { CheckCircle2, FileText, UploadCloud } from "lucide-react"

const steps = [
  {
    icon: FileText,
    title: "자료 수집",
    description: "공연 정보와 하이라이트를 빠르게 정리해요.",
    emoji: "📋",
    color: "from-primary/20 to-primary/5",
  },
  {
    icon: CheckCircle2,
    title: "콘텐츠 제작",
    description: "카드뉴스, 숏폼 영상으로 매력적으로 전달해요.",
    emoji: "✨",
    color: "from-accent/20 to-accent/5",
  },
  {
    icon: UploadCloud,
    title: "운영/확산",
    description: "SNS 업로드부터 이벤트 운영까지 책임져요.",
    emoji: "🚀",
    color: "from-primary/15 to-accent/10",
  },
]

export function HowItWorks() {
  return (
    <section className="relative border-t border-border/40 py-16 md:py-20 lg:py-24">
      {/* 배경 장식 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-0 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-gradient-radial from-primary/5 to-transparent blur-3xl" />
        <div className="absolute right-0 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-gradient-radial from-accent/5 to-transparent blur-3xl" />
      </div>

      <div className="relative space-y-10 sm:space-y-12">
        {/* 헤더 */}
        <div className="space-y-4 text-center">
          <div className="inline-block">
            <span className="cue">Direction 🎬</span>
          </div>
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl md:text-5xl">
            이렇게 진행돼요
          </h2>
          <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg md:text-xl">
            간단한 3단계로 공연 홍보부터 관객 모집까지 완성합니다.
          </p>
        </div>

        {/* 스텝 카드 */}
        <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:gap-8 sm:px-6 md:grid-cols-3 lg:px-8">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="group stage-panel relative overflow-hidden p-6 text-center transition-all hover:scale-105 sm:p-8"
              style={{
                animationDelay: `${index * 0.15}s`,
              }}
            >
              {/* 배경 그라데이션 */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
              />

              {/* 아이콘 */}
              <div className="relative mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/15 to-accent/10 shadow-lg transition-all group-hover:scale-110 group-hover:shadow-xl sm:h-24 sm:w-24">
                <step.icon className="h-10 w-10 text-primary sm:h-12 sm:w-12" />
              </div>

              {/* 단계 번호 + 이모지 */}
              <div className="relative mb-4 flex items-center justify-center gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-base font-bold text-primary-foreground shadow-md transition-all group-hover:scale-110">
                  0{index + 1}
                </span>
                <span className="text-3xl transition-transform group-hover:scale-125 group-hover:rotate-12">
                  {step.emoji}
                </span>
              </div>

              {/* 텍스트 */}
              <h3 className="relative mb-2 text-xl font-bold text-foreground transition-colors group-hover:text-primary sm:text-2xl">
                {step.title}
              </h3>
              <p className="relative text-sm leading-relaxed text-muted-foreground sm:text-base">
                {step.description}
              </p>

              {/* 연결선 (마지막 제외) */}
              {index < steps.length - 1 && (
                <div className="absolute right-0 top-1/2 hidden h-px w-8 -translate-y-1/2 translate-x-full bg-gradient-to-r from-primary/50 to-transparent md:block" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
