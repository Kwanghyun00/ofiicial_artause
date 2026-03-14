import Link from "next/link"
import { Briefcase, Building2, Layers } from "lucide-react"

const cards = [
  {
    icon: Building2,
    title: "회사 소개",
    description: "공연과 관객을 연결하는 알터즈의 이야기를 만나보세요.",
    href: "/about",
    cta: "우리의 이야기 보기",
    emoji: "🏢",
    color: "from-primary/20 to-primary/5",
  },
  {
    icon: Briefcase,
    title: "포트폴리오",
    description: "다양한 공연과 함께한 성공 사례를 확인해보세요.",
    href: "/works",
    cta: "성공 사례 보기",
    emoji: "💼",
    color: "from-accent/20 to-accent/5",
  },
  {
    icon: Layers,
    title: "서비스 안내",
    description: "홍보부터 운영까지, 필요한 모든 것을 제공합니다.",
    href: "/services",
    cta: "서비스 둘러보기",
    emoji: "⚡",
    color: "from-primary/15 to-accent/10",
  },
]

export function CompanySnapshot() {
  return (
    <section className="relative border-t border-border/40 bg-gradient-to-b from-background to-muted/20 py-16 md:py-20 lg:py-24">
      {/* 배경 장식 */}
      <div className="absolute left-1/4 top-10 h-64 w-64 rounded-full bg-gradient-radial from-primary/10 to-transparent blur-3xl" />
      <div className="absolute right-1/4 bottom-10 h-72 w-72 rounded-full bg-gradient-radial from-accent/10 to-transparent blur-3xl" />

      <div className="relative mx-auto max-w-7xl space-y-10 px-4 sm:space-y-12 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="space-y-4 text-center">
          <div className="inline-block">
            <span className="cue">Backstage 🎬</span>
          </div>
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl md:text-5xl">
            더 알고 싶으신가요?
          </h2>
          <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg md:text-xl">
            알터즈가 어떻게 공연과 관객을 연결하는지,
            <br className="hidden sm:block" />
            성공 사례와 서비스를 자세히 확인해보세요.
          </p>
        </div>

        {/* 카드 그리드 */}
        <div className="grid gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card, index) => (
            <article
              key={card.title}
              className="spotlight-card group relative flex h-full flex-col gap-5 overflow-hidden p-6 sm:p-7"
              style={{
                animationDelay: `${index * 0.1}s`,
              }}
            >
              {/* 배경 그라데이션 */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
              />

              {/* 콘텐츠 */}
              <div className="relative flex items-start justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-accent/10 text-primary shadow-sm transition-all group-hover:scale-110 group-hover:shadow-lg">
                  <card.icon className="h-7 w-7" />
                </div>
                <span className="text-3xl transition-transform group-hover:scale-110 group-hover:rotate-12">
                  {card.emoji}
                </span>
              </div>

              <div className="relative space-y-2">
                <h3 className="text-xl font-bold text-foreground transition-colors group-hover:text-primary sm:text-2xl">
                  {card.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {card.description}
                </p>
              </div>

              <Link
                href={card.href}
                className="relative mt-auto inline-flex items-center justify-center gap-2 rounded-full border-2 border-border bg-card px-5 py-2.5 text-sm font-bold text-foreground transition-all group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-lg group-hover:shadow-primary/25"
              >
                {card.cta}
                <svg
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
