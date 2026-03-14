import { BarChart3, Users2, Ticket, Sparkles } from "lucide-react"
import { CountUp } from "@/components/motion/CountUp"

const metrics = [
  { icon: Ticket, label: "누적 홍보 공연", value: 52, suffix: "+", detail: "2023~2026" },
  { icon: Users2, label: "이벤트 운영", value: 38, suffix: "건", detail: "초대권 · 참여형" },
  { icon: BarChart3, label: "콘텐츠 조회", value: 120, suffix: "K+", detail: "SNS 기준" },
  { icon: Sparkles, label: "협업 단체", value: 25, suffix: "곳", detail: "극단 · 제작사" },
]

const process = [
  {
    title: "자료 수집",
    description: "공연 소개, 관람 포인트, 이미지 자료를 빠르게 정리합니다.",
  },
  {
    title: "제작",
    description: "카드뉴스·쇼츠·관객 참여 콘텐츠로 변환합니다.",
  },
  {
    title: "업로드/확산",
    description: "SNS/이벤트 운영으로 관객과 연결합니다.",
  },
]

export function ExperienceMetrics() {
  return (
    <section className="border-t border-border/60 py-20">
      <div className="mx-auto max-w-6xl space-y-12 px-4 md:px-6">
        <div className="space-y-4 text-center">
          <span className="cue">Curtain Call</span>
          <h2 className="text-3xl font-semibold text-foreground md:text-4xl">알터즈가 만들어 낸 공연 홍보 성과</h2>
          <p className="text-base text-muted-foreground md:text-lg">
            공연의 매력을 더 잘 보이게 하기 위한 홍보·이벤트 운영 경험을 축적해 왔습니다.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric, index) => (
            <div key={`${metric.label}-${index}`} className="spotlight-card p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <metric.icon className="h-6 w-6" />
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                {metric.label}
              </p>
              <p className="text-3xl font-semibold text-foreground">
                <CountUp value={metric.value} suffix={metric.suffix} />
              </p>
              <p className="text-sm text-muted-foreground">{metric.detail}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {process.map((item, index) => (
            <div key={item.title} className="stage-panel p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                Act 0{index + 1}
              </p>
              <h3 className="mt-2 text-xl font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
