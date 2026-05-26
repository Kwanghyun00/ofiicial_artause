import { FileText, Zap, BarChart2 } from "lucide-react"
import type { LucideIcon } from "lucide-react"

type Step = {
  icon: LucideIcon
  num: string
  title: string
  desc: string
  accent: string
  iconBg: string
}

const STEPS: Step[] = [
  {
    icon: FileText,
    num: "1",
    title: "공연 정보 제출",
    desc: "포스터와 공연 개요를 보내주세요. 담당 매니저가 이벤트 페이지를 구성하고 SNS 홍보 콘텐츠까지 제작합니다.",
    accent: "border-blue-200",
    iconBg: "bg-blue-50 text-blue-600",
  },
  {
    icon: Zap,
    num: "2",
    title: "이벤트 운영 대행",
    desc: "응모 접수 → 추첨 및 선정 → 당첨자 이메일 발송까지. 반복되는 수작업을 알터즈가 대신 처리합니다.",
    accent: "border-primary/30",
    iconBg: "bg-primary/10 text-primary",
  },
  {
    icon: BarChart2,
    num: "3",
    title: "결과 리포트 공유",
    desc: "공연 종료 후 응모 현황, 선정률, 이벤트 결과를 정리한 리포트를 전달합니다. 다음 작품 기획에 참고하세요.",
    accent: "border-purple-200",
    iconBg: "bg-purple-50 text-purple-600",
  },
]

export function ServiceProcess() {
  return (
    <section className="border-t border-border/40 py-16 md:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-14 space-y-3 text-center">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            이렇게 진행됩니다
          </h2>
          <p className="mx-auto max-w-lg text-muted-foreground">
            신청부터 리포트까지, 3단계면 충분합니다.
          </p>
        </div>

        {/* 3-step 카드 */}
        <div className="grid gap-6 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <div key={step.num} className="relative">
              {/* 연결선 (마지막 제외, md 이상에서만) */}
              {i < STEPS.length - 1 && (
                <div className="pointer-events-none absolute right-0 top-10 hidden h-px w-6 translate-x-full bg-border/60 md:block" />
              )}

              <div className={`stage-panel h-full p-6 border-t-2 ${step.accent}`}>
                {/* 아이콘 + 번호 */}
                <div className="mb-4 flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${step.iconBg}`}>
                    <step.icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-bold text-muted-foreground">
                    Step {step.num}
                  </span>
                </div>

                <h3 className="mb-2 text-lg font-extrabold text-foreground">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
