import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Calendar, Lightbulb, MapPin, Sparkles, Target } from "lucide-react"
import { Reveal } from "@/components/motion/Reveal"
import { portfolioItems } from "@/constants/company"

const categories = ["공연 홍보 제작", "초대권 이벤트 운영", "사회적 프로젝트"]

const process = [
  {
    icon: Lightbulb,
    title: "분석 & 전략",
    description: "공연의 핵심 메시지와 타겟 관객을 파악하고, 효과적인 전달 전략을 수립합니다.",
    emoji: "💡",
  },
  {
    icon: Sparkles,
    title: "콘텐츠 제작",
    description: "카드뉴스, 숏폼 영상 등 관객의 시선을 사로잡는 비주얼 콘텐츠를 제작합니다.",
    emoji: "✨",
  },
  {
    icon: Target,
    title: "실행 & 최적화",
    description: "SNS 채널에 배포하고, 반응을 분석하여 지속적으로 개선합니다.",
    emoji: "🎯",
  },
]

export default function WorksPage() {
  return (
    <div className="space-y-16 pb-24 pt-12 md:space-y-20 lg:space-y-24">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 rounded-[100%] bg-gradient-radial from-primary/12 via-primary/5 to-transparent blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl space-y-6 text-center">
            <div className="inline-block">
              <span className="cue">Portfolio 💼</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              함께한
              <br />
              <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                공연 이야기
              </span>
            </h1>
            <p className="text-lg leading-relaxed text-muted-foreground sm:text-xl">
              알터즈가 제작하고 운영한 프로젝트들을 소개합니다.
              <br className="hidden sm:block" />
              각 프로젝트의 전략과 성과를 케이스 스터디로 확인하세요.
            </p>
          </div>
        </div>
      </section>

      {/* Process Section - 공연 홍보 제작 프로세스 */}
      <section className="relative border-y border-border/40 bg-gradient-to-b from-muted/10 to-background py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 space-y-4 text-center">
            <div className="inline-block">
              <span className="cue">Our Process 🎬</span>
            </div>
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl md:text-5xl">
              이렇게 만들어요
            </h2>
            <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">
              공연의 본질을 이해하고, 관객에게 전달하는 알터즈만의 방식입니다.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 md:gap-8">
            {process.map((step, index) => (
              <article
                key={step.title}
                className="stage-panel group relative p-6 text-center transition-all hover:scale-105 sm:p-8"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* 배경 효과 */}
                <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                {/* 아이콘 */}
                <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-accent/10 transition-all group-hover:scale-110 sm:h-20 sm:w-20">
                  <step.icon className="h-8 w-8 text-primary sm:h-10 sm:w-10" />
                </div>

                {/* 번호 + 이모지 */}
                <div className="relative mb-4 flex items-center justify-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {index + 1}
                  </span>
                  <span className="text-3xl transition-transform group-hover:scale-110 group-hover:rotate-12">
                    {step.emoji}
                  </span>
                </div>

                {/* 텍스트 */}
                <h3 className="relative mb-3 text-xl font-bold text-foreground sm:text-2xl">
                  {step.title}
                </h3>
                <p className="relative text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {step.description}
                </p>

                {/* 연결선 */}
                {index < process.length - 1 && (
                  <div className="absolute right-0 top-1/2 hidden h-px w-8 -translate-y-1/2 translate-x-full bg-gradient-to-r from-primary/50 to-transparent md:block" />
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Grid */}
      <section className="mx-auto max-w-7xl space-y-16 px-4 sm:px-6 lg:px-8">
        {categories.map((category, categoryIndex) => {
          const items = portfolioItems.filter((item) => item.category === category)
          if (!items.length) return null

          return (
            <div key={category} className="space-y-8">
              {/* Category Header */}
              <div className="space-y-2">
                <div className="inline-block">
                  <span className="rounded-full bg-primary/10 px-4 py-1.5 text-sm font-bold text-primary">
                    {category}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                  {items.length}개의 프로젝트
                </h2>
              </div>

              {/* Project Grid */}
              <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
                {items.map((item, index) => (
                  <Reveal key={item.slug} delay={index * 0.1}>
                    <Link href={`/works/${item.slug}`}>
                      <article className="spotlight-card group h-full overflow-hidden">
                        {/* Poster Image */}
                        <div className="relative aspect-[3/4] w-full overflow-hidden">
                          <Image
                            src={item.poster}
                            alt={item.title}
                            fill
                            className="object-cover transition-all duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                          {/* Hover Overlay */}
                          <div className="absolute inset-0 flex items-end p-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                            <div className="flex items-center gap-2 text-white">
                              <span className="text-sm font-bold">케이스 스터디 보기</span>
                              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </div>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="space-y-4 p-6">
                          {/* Genre Badge */}
                          <div className="flex flex-wrap gap-2">
                            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                              {item.genre}
                            </span>
                            <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-foreground">
                              {item.role}
                            </span>
                          </div>

                          {/* Title */}
                          <div>
                            <h3 className="text-xl font-bold text-foreground transition-colors group-hover:text-primary sm:text-2xl">
                              {item.title}
                            </h3>
                            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                              {item.highlight}
                            </p>
                          </div>

                          {/* Meta Info */}
                          <div className="space-y-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                              <span>{item.period}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                              <span>{item.venue}</span>
                            </div>
                          </div>

                          {/* Keywords */}
                          <div className="flex flex-wrap gap-2">
                            {item.keywords.slice(0, 3).map((keyword) => (
                              <span
                                key={keyword}
                                className="rounded-full border border-border bg-background px-2.5 py-1 text-xs text-foreground/80"
                              >
                                #{keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                      </article>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </div>
          )
        })}
      </section>

      {/* CTA Section */}
      <section className="relative border-t border-border/40 bg-gradient-to-b from-muted/20 to-background py-16">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-radial from-primary/8 to-transparent blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mb-6 inline-block">
            <span className="cue">Contact Us 📨</span>
          </div>
          <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
            함께 만들어갈 프로젝트를 기다립니다
          </h2>
          <p className="mb-8 text-lg text-muted-foreground">
            공연 홍보부터 관객 모집까지, 알터즈와 함께하세요.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/contact"
              className="group inline-flex h-14 items-center justify-center gap-2 rounded-full bg-primary px-8 text-lg font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:-translate-y-1 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30"
            >
              프로젝트 문의하기
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/about"
              className="inline-flex h-14 items-center justify-center gap-2 rounded-full border-2 border-border bg-card px-8 text-lg font-bold text-foreground transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
            >
              알터즈 소개 보기
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
