import { CheckCircle2, FileText, UploadCloud } from "lucide-react"

const steps = [
  { icon: FileText, title: "자료 수집", description: "공연 정보, 이미지, 관람 포인트를 빠르게 수집합니다." },
  { icon: CheckCircle2, title: "제작", description: "카드뉴스/쇼츠/홍보 문구로 정리해 전달합니다." },
  { icon: UploadCloud, title: "업로드/확산", description: "SNS 업로드와 이벤트 운영으로 관객 참여를 유도합니다." },
]

export function HowItWorks() {
  return (
    <section className="border-t border-border/60 py-16">
      <div className="space-y-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">우리가 하는 방식</h2>
        <p className="text-base text-muted-foreground md:text-lg">자료 수집부터 확산까지 3단계로 운영합니다.</p>
      </div>

      <div className="mt-12 grid gap-8 md:grid-cols-3">
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
