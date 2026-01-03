import { Bell, CheckCircle2, Gift, Ticket } from "lucide-react"

const steps = [
  { icon: Bell, title: "관심 초대 찾기", description: "관심 있는 공연·전시 초대권을 검색하고 필터링합니다." },
  { icon: Ticket, title: "간편하게 신청", description: "원하는 회차를 선택해 간단한 정보만 입력하면 신청이 완료돼요." },
  { icon: Gift, title: "추첨 안내", description: "당첨 시 문자·이메일로 안내드리고, 결과도 마이페이지에서 확인 가능합니다." },
  { icon: CheckCircle2, title: "공연 관람", description: "모바일 초대권으로 편하게 입장하고 특별한 경험을 공유하세요." },
]

export function HowItWorks() {
  return (
    <section className="rounded-[32px] bg-white/80 p-8 md:p-12 shadow-inner">
      <div className="space-y-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">초대권을 받는 방법</h2>
        <p className="text-base text-muted-foreground md:text-lg">복잡한 절차 없이 4단계면 원하는 공연을 무료로 경험할 수 있어요.</p>
      </div>

      <div className="mt-12 grid gap-8 md:grid-cols-4">
        {steps.map((step, index) => (
          <div key={step.title} className="text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <step.icon className="h-10 w-10" />
            </div>
            <div className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold text-primary">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">0{index + 1}</span>
            </div>
            <h3 className="mt-4 text-lg font-bold text-foreground">{step.title}</h3>
            <p className="text-sm text-muted-foreground">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
