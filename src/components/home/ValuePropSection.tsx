import { BellRing, ChartArea, Gift } from "lucide-react"

const pillars = [
  {
    icon: ChartArea,
    title: "데이터 기반 큐레이션",
    description: "관람 이력과 선호도를 분석해 추천 초대를 구성하고 당첨 확률까지 안내합니다.",
    details: ["실시간 좌석/대기 데이터", "멤버 취향 그래프", "예측 당첨률"]
  },
  {
    icon: Gift,
    title: "프리미엄 파트너십",
    description: "대표 공연·전시 파트너와 협업해 프리뷰, 리허설, 아티스트 토크를 엽니다.",
    details: ["리허설 & 백스테이지", "큐레이터 동행 투어", "브랜디드 컬처 클래스"]
  },
  {
    icon: BellRing,
    title: "원스톱 신청 경험",
    description: "앱·웹 어디서나 간편하게 신청하고 모바일 초대권으로 입장까지 연결됩니다.",
    details: ["평균 3시간 이내 티켓 발송", "동반인 초대 관리", "신청 이력 보관"]
  },
]

export function ValuePropSection() {
  return (
    <section className="rounded-[32px] bg-gradient-to-br from-[#FBF9F6] via-[#F0EFF7] to-[#FBF9F6] p-8 md:p-12">
      <div className="space-y-4 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-primary">왜 아트하우스인가</p>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">문화 초대를 위한 새로운 표준</h2>
        <p className="text-base text-muted-foreground md:text-lg">원하는 순간에 원하는 초대를 연결해 주는 운영 시스템으로 아트하우스만의 경험을 완성했습니다.</p>
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
