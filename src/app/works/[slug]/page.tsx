import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ArrowRight, Calendar, ExternalLink, Lightbulb, MapPin, Target, Ticket, TrendingUp } from "lucide-react"
import { portfolioItems } from "@/constants/company"
import { ReviewSummary } from "@/components/reviews/ReviewSummary"
import { getCampaignByPerformanceId } from "@/lib/supabase/queries"

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return portfolioItems.map((item) => ({
    slug: item.slug,
  }))
}

export default async function WorkDetailPage({ params }: Props) {
  const { slug } = await params
  const project = portfolioItems.find((item) => item.slug === slug)

  if (!project) {
    notFound()
  }

  const currentIndex = portfolioItems.findIndex((item) => item.slug === slug)
  const prevProject = currentIndex > 0 ? portfolioItems[currentIndex - 1] : null
  const nextProject = currentIndex < portfolioItems.length - 1 ? portfolioItems[currentIndex + 1] : null

  const campaign = await getCampaignByPerformanceId(project.id)

  return (
    <div className="pb-24 pt-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden pb-12">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[600px] w-[1000px] -translate-x-1/2 rounded-[100%] bg-gradient-radial from-primary/10 via-primary/3 to-transparent blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <Link
            href="/works"
            className="group mb-8 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            포트폴리오로 돌아가기
          </Link>

          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left: Poster */}
            <div className="relative">
              <div className="spotlight-card overflow-hidden">
                <div className="relative aspect-[3/4] w-full">
                  <Image
                    src={project.poster}
                    alt={project.title}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            </div>

            {/* Right: Project Info */}
            <div className="space-y-8">
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-primary/10 px-4 py-1.5 text-sm font-bold text-primary">
                  {project.category}
                </span>
                <span className="rounded-full bg-muted px-4 py-1.5 text-sm font-bold text-foreground">
                  {project.genre}
                </span>
                <span className="rounded-full border-2 border-border px-4 py-1.5 text-sm font-bold text-foreground">
                  {project.role}
                </span>
              </div>

              {/* Title */}
              <div>
                <h1 className="text-4xl font-bold text-foreground sm:text-5xl md:text-6xl">
                  {project.title}
                </h1>
                <p className="mt-4 text-xl leading-relaxed text-muted-foreground">
                  {project.highlight}
                </p>
              </div>

              {/* Meta Info */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="stage-panel p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    기간
                  </div>
                  <p className="text-base font-semibold text-foreground">{project.period}</p>
                </div>
                <div className="stage-panel p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    장소
                  </div>
                  <p className="text-base font-semibold text-foreground">{project.venue}</p>
                </div>
              </div>

              {/* Format */}
              <div className="stage-panel p-6">
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  제작 콘텐츠
                </h3>
                <p className="text-lg font-semibold text-foreground">{project.format}</p>
              </div>

              {/* Keywords */}
              <div>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  키워드
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="rounded-full border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary"
                    >
                      #{keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Case Study Sections */}
      <div className="mx-auto max-w-7xl space-y-16 px-4 sm:px-6 lg:px-8">
        {/* Overview */}
        <section className="border-t border-border/40 pt-16">
          <div className="mx-auto max-w-4xl">
            <div className="mb-8 inline-block">
              <span className="cue">Overview 📝</span>
            </div>
            <h2 className="mb-6 text-3xl font-bold text-foreground sm:text-4xl">
              프로젝트 개요
            </h2>
            <p className="text-lg leading-relaxed text-foreground">
              {project.description}
            </p>
          </div>
        </section>

        {/* Challenge, Solution, Results */}
        <section className="grid gap-8 md:grid-cols-3">
          {/* Challenge */}
          <article className="spotlight-card group p-6 sm:p-8">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-accent/10 transition-all group-hover:scale-110">
              <Lightbulb className="h-7 w-7 text-primary" />
            </div>
            <h3 className="mb-4 text-xl font-bold text-foreground sm:text-2xl">
              과제 🎯
            </h3>
            <p className="leading-relaxed text-muted-foreground">
              {project.challenge}
            </p>
          </article>

          {/* Solution */}
          <article className="spotlight-card group p-6 sm:p-8">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-accent/10 transition-all group-hover:scale-110">
              <Target className="h-7 w-7 text-primary" />
            </div>
            <h3 className="mb-4 text-xl font-bold text-foreground sm:text-2xl">
              해결 방법 💡
            </h3>
            <p className="leading-relaxed text-muted-foreground">
              {project.solution}
            </p>
          </article>

          {/* Results */}
          <article className="spotlight-card group p-6 sm:p-8">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-accent/10 transition-all group-hover:scale-110">
              <TrendingUp className="h-7 w-7 text-primary" />
            </div>
            <h3 className="mb-4 text-xl font-bold text-foreground sm:text-2xl">
              성과 📈
            </h3>
            <ul className="space-y-3">
              {project.results.map((result, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                  <span className="leading-relaxed text-muted-foreground">{result}</span>
                </li>
              ))}
            </ul>
          </article>
        </section>

        {/* 초대권 이벤트 배너 */}
        {campaign && (
          <section className="rounded-3xl border border-primary/30 bg-primary/5 p-8 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-widest text-primary">초대권 이벤트 진행 중</p>
                <h3 className="text-xl font-bold text-foreground">{campaign.title}</h3>
                {campaign.description && (
                  <p className="text-sm text-muted-foreground">{campaign.description}</p>
                )}
              </div>
              {campaign.reward && (
                <span className="shrink-0 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-sm font-bold text-primary">
                  {campaign.reward}
                </span>
              )}
            </div>
            {campaign.ends_at && (
              <p className="text-xs text-muted-foreground">
                마감:{" "}
                <span className="font-semibold text-foreground">
                  {new Date(campaign.ends_at).toLocaleDateString("ko-KR", { month: "long", day: "numeric" })}
                </span>
              </p>
            )}
            <Link
              href={`/invites/${campaign.slug}`}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:bg-primary/90"
            >
              <Ticket className="h-4 w-4" />
              이벤트 응모하기
            </Link>
          </section>
        )}

        {/* 관람 후기 */}
        <section className="border-t border-border/40 pt-16">
          <ReviewSummary performanceId={project.id} performanceSlug={project.slug} />
        </section>

        {/* CTA */}
        <section className="border-y border-border/40 bg-gradient-to-r from-muted/20 to-transparent py-12">
          <div className="mx-auto max-w-4xl text-center">
            <h3 className="mb-4 text-2xl font-bold text-foreground sm:text-3xl">
              실제 콘텐츠 확인하기
            </h3>
            <p className="mb-6 text-lg text-muted-foreground">
              인스타그램에서 제작된 콘텐츠를 직접 확인해보세요.
            </p>
            <Link
              href={project.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-8 text-base font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:-translate-y-1 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30"
            >
              Instagram에서 보기
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* Navigation */}
        <section className="border-t border-border/40 pt-12">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Previous Project */}
            {prevProject && (
              <Link
                href={`/works/${prevProject.slug}`}
                className="spotlight-card group overflow-hidden p-0"
              >
                <div className="grid gap-4 p-6 md:grid-cols-[120px_1fr]">
                  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg md:w-[120px]">
                    <Image
                      src={prevProject.poster}
                      alt={prevProject.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                      <ArrowLeft className="h-4 w-4" />
                      이전 프로젝트
                    </div>
                    <h4 className="text-xl font-bold text-foreground transition-colors group-hover:text-primary">
                      {prevProject.title}
                    </h4>
                    <p className="mt-1 text-sm text-muted-foreground">{prevProject.genre}</p>
                  </div>
                </div>
              </Link>
            )}

            {/* Next Project */}
            {nextProject && (
              <Link
                href={`/works/${nextProject.slug}`}
                className="spotlight-card group overflow-hidden p-0 md:col-start-2"
              >
                <div className="grid gap-4 p-6 md:grid-cols-[1fr_120px]">
                  <div className="flex flex-col justify-center md:text-right">
                    <div className="mb-2 flex items-center justify-start gap-2 text-sm font-semibold text-muted-foreground md:justify-end">
                      다음 프로젝트
                      <ArrowRight className="h-4 w-4" />
                    </div>
                    <h4 className="text-xl font-bold text-foreground transition-colors group-hover:text-primary">
                      {nextProject.title}
                    </h4>
                    <p className="mt-1 text-sm text-muted-foreground">{nextProject.genre}</p>
                  </div>
                  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg md:w-[120px]">
                    <Image
                      src={nextProject.poster}
                      alt={nextProject.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                </div>
              </Link>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
