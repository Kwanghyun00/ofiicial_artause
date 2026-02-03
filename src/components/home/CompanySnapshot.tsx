import Link from "next/link"
import { Briefcase, Building2, Layers } from "lucide-react"

const cards = [
  {
    icon: Building2,
    title: "회사 소개",
    description: "알터즈는 공연 홍보와 초대권 이벤트 운영을 연결합니다.",
    href: "/about",
    cta: "알터즈 소개 보기",
  },
  {
    icon: Briefcase,
    title: "포트폴리오",
    description: "공연 홍보/이벤트 운영 사례를 카테고리별로 확인하세요.",
    href: "/works",
    cta: "포트폴리오 보기",
  },
  {
    icon: Layers,
    title: "서비스 안내",
    description: "홍보 제작, 이벤트 운영, 디지털 전환까지 한 번에 제공합니다.",
    href: "/services",
    cta: "서비스 소개",
  },
]

export function CompanySnapshot() {
  return (
    <section className="relative border-t border-border/60 bg-white/90 py-16">
      <div className="absolute -left-24 top-10 h-40 w-40 rounded-full bg-primary/15 blur-3xl" />
      <div className="absolute -right-24 bottom-8 h-48 w-48 rounded-full bg-secondary/20 blur-3xl" />

      <div className="relative mx-auto max-w-6xl space-y-10 px-4 sm:px-6 lg:px-8">
        <div className="space-y-3 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-primary">회사 소개</p>
          <h2 className="text-3xl font-bold text-foreground">기업 소개와 포트폴리오를 확인하세요</h2>
          <p className="text-base text-muted-foreground">
            초대권 이벤트로 관객을 모으는 동시에, 공연 홍보와 운영 노하우를 검증할 수 있도록 준비했습니다.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {cards.map((card) => (
            <article
              key={card.title}
              className="group flex h-full flex-col gap-4 rounded-3xl border border-border/70 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <card.icon className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-foreground">{card.title}</h3>
                <p className="text-sm text-muted-foreground">{card.description}</p>
              </div>
              <Link
                href={card.href}
                className="mt-auto inline-flex items-center justify-center rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition group-hover:border-primary group-hover:text-primary"
              >
                {card.cta}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
