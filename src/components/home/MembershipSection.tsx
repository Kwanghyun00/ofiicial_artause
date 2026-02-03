import Link from "next/link"

const services = [
  {
    name: "무료 홍보",
    description: "검토/선별 기반으로 공연의 핵심 메시지를 도출합니다.",
    items: ["대상: 초기 공연/독립 작품", "제공물: 카드뉴스/요약 콘텐츠", "흐름: 접수 → 검토 → 제작"],
    badge: "무료 신청",
  },
  {
    name: "콘텐츠 제작",
    description: "카드뉴스·쇼츠 기반으로 관람 포인트를 전달합니다.",
    items: ["대상: 홍보 강화가 필요한 공연", "제공물: 카드뉴스/쇼츠/관람 포인트", "흐름: 자료 수집 → 제작 → 확산"],
    badge: "가장 인기",
    featured: true,
  },
  {
    name: "초대권 이벤트 운영",
    description: "참여·선정·공지 프로세스를 운영합니다.",
    items: ["대상: 관객 참여 확대 필요 공연", "제공물: 이벤트 페이지/운영/공지", "흐름: 기획 → 모집 → 선정"],
    badge: "이벤트",
  },
]

export function MembershipSection() {
  return (
    <section className="space-y-10 border-t border-border/60 bg-gradient-to-br from-[#F5EFE7] via-[#FBF9F6] to-[#FFFFFF] py-16">
      <div className="text-center space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-primary">서비스</p>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">공연을 위한 홍보·이벤트 운영</h2>
        <p className="text-base text-muted-foreground md:text-lg">문제를 어떻게 해결하는지 중심으로 서비스 방식을 정리했습니다.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {services.map((service) => (
          <article
            key={service.name}
            className={`flex flex-col rounded-3xl p-6 shadow ${service.featured ? "bg-white/90 shadow-primary/30" : "bg-white/70"}`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-foreground">{service.name}</h3>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${service.featured ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>
                {service.badge}
              </span>
            </div>
            <div className="mt-4 space-y-1">
              <p className="text-sm text-muted-foreground">{service.description}</p>
            </div>
            <ul className="mt-6 flex-1 space-y-3 text-sm text-foreground/90">
              {service.items.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/contact"
              className={`mt-6 inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold transition ${service.featured ? "bg-primary text-primary-foreground hover:bg-primary/90" : "border border-primary/40 text-primary hover:bg-primary/5"}`}
            >
              {service.featured ? "제작 문의하기" : "상세 문의"}
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}
