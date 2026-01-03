import { CheckCircle2, Gift, Bell, Ticket } from 'lucide-react'

const steps = [
  {
    icon: Bell,
    title: "관심 이벤트 찾기",
    description: "원하는 공연이나 전시의 초대권 이벤트를 찾아보세요",
    color: "bg-primary/10 text-primary"
  },
  {
    icon: Ticket,
    title: "간편하게 응모",
    description: "클릭 한 번으로 초대권 응모 완료! 복잡한 절차는 없어요",
    color: "bg-accent/40 text-foreground"
  },
  {
    icon: Gift,
    title: "당첨 확인",
    description: "당첨되면 알림과 이메일로 즉시 안내해드려요",
    color: "bg-primary/10 text-primary"
  },
  {
    icon: CheckCircle2,
    title: "공연 관람",
    description: "초대권으로 특별한 문화 경험을 즐기세요",
    color: "bg-accent/40 text-foreground"
  }
]

export function HowItWorks() {
  return (
    <section className="py-20 bg-card">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            이렇게 쉽게 초대권을 받을 수 있어요
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-pretty">
            복잡한 절차 없이 4단계로 무료 초대권을 받아보세요
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="flex flex-col items-center text-center">
                <div className={`w-20 h-20 rounded-2xl ${step.color} flex items-center justify-center mb-6 shadow-lg`}>
                  <step.icon className="w-10 h-10" />
                </div>
                
                <div className="absolute top-10 -right-4 hidden md:block">
                  {index < steps.length - 1 && (
                    <svg width="40" height="20" viewBox="0 0 40 20" fill="none" className="text-border">
                      <path d="M0 10 L35 10 M30 5 L35 10 L30 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>

                <div className="mb-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                
                <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
