"use client"

import Link from "next/link"
import { ArrowRight, Ticket, TrendingUp } from "lucide-react"
import { HeroSearchBar } from "./HeroSearchBar"
import { trackEvent } from "@/lib/analytics"
import type { Campaign } from "./types"

type HomeHeroProps = {
  totalCampaigns: number
  activeCampaigns: number
  liveApplicants: number
  nextDeadline?: string
  featuredCampaign?: Campaign
}

function getDDay(endsAt?: string | null): string | null {
  if (!endsAt) return null
  const diff = new Date(endsAt).getTime() - Date.now()
  if (diff <= 0) return null
  return `D-${Math.ceil(diff / (1000 * 60 * 60 * 24))}`
}

export function HomeHero({
  totalCampaigns,
  activeCampaigns,
  liveApplicants,
  nextDeadline,
  featuredCampaign,
}: HomeHeroProps) {
  const dday = getDDay(featuredCampaign?.ends_at)
  const hasFeaturedCampaign = Boolean(featuredCampaign?.slug)

  return (
    <section className="relative overflow-hidden">
      {/* 배경 — 절제된 그라디언트 */}
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        <div
          className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/4 opacity-50"
          style={{
            background: "radial-gradient(ellipse, oklch(0.64 0.18 55 / 0.10) 0%, oklch(0.64 0.18 55 / 0.03) 50%, transparent 70%)",
          }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[1fr_420px] lg:items-start lg:gap-16 xl:grid-cols-[1fr_460px]">

          {/* 왼쪽: 헤드라인 + CTA */}
          <div className="space-y-10">

            {/* 레이블 */}
            <div>
              <span className="cue">공연/문화예술 체험단 모집 플랫폼</span>
            </div>

            {/* 헤딩 */}
            <div className="space-y-5">
              <h1 className="text-4xl font-bold leading-[1.15] text-foreground sm:text-5xl md:text-6xl lg:text-[4rem] xl:text-[4.5rem]">
                공연 체험단이 되어{" "}
                <br className="hidden sm:block" />
                <span className="gradient-text">무료로 관람하세요</span>
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                공연단체가 모집하는 체험단에 지원하고 무료 관람 후
                <br className="hidden md:block" />
                SNS 후기를 남기면 나만의 문화생활 포트폴리오가 쌓입니다.
              </p>
            </div>

            {/* 검색 */}
            <div className="max-w-lg">
              <HeroSearchBar />
            </div>

            {/* CTA 버튼 */}
            <div className="flex flex-wrap gap-3">
              <Link
                href="/recruit"
                onClick={() => trackEvent("home_click_apply")}
                className="group inline-flex h-12 items-center justify-center gap-2 border-2 border-primary bg-primary px-7 text-[15px] font-bold text-primary-foreground transition-all hover:bg-primary/90 sm:h-13 sm:px-8"
                style={{ transitionDuration: "var(--duration-base)" }}
              >
                체험단 모집 보기
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/shows"
                className="inline-flex h-12 items-center justify-center border-2 border-border px-7 text-[15px] font-bold text-foreground transition-all hover:border-foreground/50 hover:text-foreground sm:h-13 sm:px-8"
                style={{ transitionDuration: "var(--duration-base)" }}
              >
                공연 둘러보기
              </Link>
            </div>

            {/* 통계 카드 3종 */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              <StatCard
                icon={<Ticket className="h-4 w-4" />}
                label="모집 중"
                value={`${activeCampaigns}건`}
                sub={`전체 ${totalCampaigns}건`}
              />
              <StatCard
                icon={<TrendingUp className="h-4 w-4" />}
                label="누적 지원"
                value={`${liveApplicants.toLocaleString()}명`}
                sub="체험단 지원 현황"
              />
              <StatCard
                icon={<span className="text-sm">⏰</span>}
                label="다음 마감"
                value={nextDeadline ?? "이번 주"}
                sub="서둘러 지원하세요"
              />
            </div>
          </div>

          {/* 오른쪽: 피처드 이벤트 카드 + 이용 방법 */}
          <div className="flex flex-col gap-4 lg:pt-2">
            {/* 피처드 캠페인 */}
            <div className="stage-panel overflow-hidden">
              <div className="flex items-center justify-between border-b border-border/50 px-5 py-3.5">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-primary">
                  <span className="inline-block h-1.5 w-1.5 animate-pulse bg-primary" />
                  {hasFeaturedCampaign ? "지금 신청 가능" : "이벤트 업데이트 예정"}
                </span>
                {dday && (
                  <span className="border border-primary/40 bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                    {dday}
                  </span>
                )}
              </div>
              <div className="space-y-3 p-5">
                <p className="cue text-[11px]">추천 체험단 모집</p>
                <h2 className="text-2xl font-bold leading-snug text-foreground sm:text-3xl">
                  {featuredCampaign?.title ?? "새 체험단 모집 준비 중"}
                </h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {featuredCampaign?.one_line_intro ??
                    featuredCampaign?.description ??
                    "현재 공개된 체험단 모집이 없습니다. 공연을 먼저 둘러보고 다음 오픈을 기다려 주세요."}
                </p>
                <div className="flex items-center justify-between border border-border bg-muted/20 p-4">
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      {hasFeaturedCampaign ? "무료 관람 체험단" : "모집 소식"}
                    </p>
                    <p className="text-[15px] font-bold text-primary">
                      {featuredCampaign?.reward ?? "전체 모집 보기"}
                    </p>
                  </div>
                  <Link
                    href={featuredCampaign?.slug ? `/recruit/${featuredCampaign.slug}` : "/recruit"}
                    className="inline-flex h-9 items-center gap-1.5 border-2 border-primary bg-primary px-4 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
                  >
                    {hasFeaturedCampaign ? "지원하기" : "보기"}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* 이용 방법 */}
            <div className="stage-panel p-5">
              <p className="cue mb-4 text-[11px]">이용 방법</p>
              <ol className="space-y-3">
                {[
                  { title: "체험단 지원", desc: "모집 중인 공연을 살펴보고 SNS 정보와 지원 동기를 입력해 지원합니다." },
                  { title: "선정 & 무료 관람", desc: "파트너가 선정하면 이메일로 안내 — 체험단으로 공연을 무료 관람합니다." },
                  { title: "콘텐츠 제출 & 포트폴리오", desc: "SNS 후기를 제출하면 내 체험단 포트폴리오로 누적됩니다." },
                ].map((step, i) => (
                  <li key={step.title} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center border-2 border-primary/40 bg-primary/8 text-xs font-bold text-primary">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{step.title}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{step.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub: string
}) {
  return (
    <div className="spotlight-card p-3.5 sm:p-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground sm:text-[11px]">
          {label}
        </p>
        <span className="text-primary/60">{icon}</span>
      </div>
      <p className="mt-2 font-display text-lg font-bold text-foreground sm:text-xl">{value}</p>
      <p className="mt-0.5 text-[11px] text-muted-foreground sm:text-xs">{sub}</p>
    </div>
  )
}
