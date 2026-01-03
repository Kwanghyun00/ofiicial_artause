const tiers = [
  {
    name: "Community",
    price: "무료",
    description: "모든 초대 이벤트 열람과 주간 뉴스레터를 받아볼 수 있어요.",
    perks: ["주간 초대 캘린더", "모바일 신청 · 추첨", "마감 임박 알림"],
    badge: "신규 회원",
  },
  {
    name: "Curator",
    price: "월 19,000원",
    description: "취향 기반 추천, 좌석 업그레이드, 프리뷰 우선 초대를 제공합니다.",
    perks: ["1:1 큐레이션 리포트", "좌석/시간대 우선 배정", "프리뷰 & 리허설 초대", "멤버 전용 커뮤니티"],
    badge: "가장 인기",
    featured: true,
  },
  {
    name: "Partner",
    price: "맞춤 견적",
    description: "브랜드·기관 대상 맞춤 문화 프로그램 운영을 지원합니다.",
    perks: ["전용 제휴 매니저", "브랜디드 컬처 클래스", "임직원 문화 복지 플랜"],
    badge: "기업",
  },
]

export function MembershipSection() {
  return (
    <section className="space-y-10 rounded-[32px] bg-gradient-to-br from-[#F5EFE7] via-[#FBF9F6] to-[#FFFFFF] p-8 md:p-12 shadow-inner">
      <div className="text-center space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-primary">멤버십</p>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">필요한 만큼 초대를 누리는 멤버십</h2>
        <p className="text-base text-muted-foreground md:text-lg">무료로 시작하고, 더 정교한 큐레이션이 필요할 때 단계적으로 확장해 보세요.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {tiers.map((tier) => (
          <article
            key={tier.name}
            className={`flex flex-col rounded-3xl p-6 shadow ${tier.featured ? "bg-white/90 shadow-primary/30" : "bg-white/70"}`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-foreground">{tier.name}</h3>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tier.featured ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>
                {tier.badge}
              </span>
            </div>
            <div className="mt-4 space-y-1">
              <p className="text-3xl font-bold text-primary">{tier.price}</p>
              <p className="text-sm text-muted-foreground">{tier.description}</p>
            </div>
            <ul className="mt-6 flex-1 space-y-3 text-sm text-foreground/90">
              {tier.perks.map((perk) => (
                <li key={perk} className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-primary">•</span>
                  {perk}
                </li>
              ))}
            </ul>
            <button
              type="button"
              className={`mt-6 rounded-full px-5 py-2 text-sm font-semibold transition ${tier.featured ? "bg-primary text-primary-foreground hover:bg-primary/90" : "border border-primary/40 text-primary hover:bg-primary/5"}`}
            >
              {tier.featured ? "멤버십 가입하기" : "상세 보기"}
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}
