import { BellRing, ChartArea, Database } from "lucide-react"

const pillars = [
  {
    icon: Database,
    title: "관객 관리",
    description: "관객 리스트, 참여 이력, 태그 관리를 한 번에.",
    details: ["관객 히스토리", "맞춤 분류", "간편 내보내기"],
  },
  {
    icon: ChartArea,
    title: "이벤트 파이프라인",
    description: "신청부터 선정, 공지까지 운영 흐름을 정리합니다.",
    details: ["신청 폼 연동", "선정 프로세스", "자동 공지"],
  },
  {
    icon: BellRing,
    title: "성과 추적",
    description: "UTM 기반으로 홍보 성과를 추적할 수 있게 준비 중입니다.",
    details: ["UTM 템플릿", "채널별 전환", "리포트 정리"],
  },
]

export function ValuePropSection() {
  return (
    <section className="border-t border-border/60 bg-gradient-to-br from-[#FBF9F6] via-[#F0EFF7] to-[#FBF9F6] py-16">
      <div className="space-y-4 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-primary">Web Service (준비 중)</p>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">공연 운영을 위한 디지털 전환</h2>
        <p className="text-base text-muted-foreground md:text-lg">관객 관리와 전환 추적을 더 쉽게 만들기 위한 웹서비스를 준비하고 있습니다.</p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {pillars.map((pillar) => (
          <article key={pillar.title} className="flex h-full flex-col gap-4 rounded-3xl bg-white/80 p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <pillar.icon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">{pillar.title}</h3>
              <p className="text-sm text-muted-foreground">{pillar.description}</p>
            </div>
            <ul className="space-y-2 text-sm text-foreground/80">
              {pillar.details.map((detail) => (
                <li key={detail} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {detail}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  )
}
