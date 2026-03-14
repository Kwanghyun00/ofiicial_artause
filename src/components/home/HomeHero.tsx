"use client"

import Link from "next/link"
import { ArrowRight, Sparkles, Star, Ticket, Zap } from "lucide-react"
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

const timeline = [
  {
    title: "이벤트 선택",
    description: "원하는 공연 초대권 이벤트를 골라보세요.",
  },
  {
    title: "정보 입력",
    description: "이름·연락처·인스타그램 정보를 입력합니다.",
  },
  {
    title: "당첨 확인",
    description: "추첨 후 이메일로 당첨 결과를 알려드려요.",
  },
]

function getDDay(endsAt?: string | null): string | null {
  if (!endsAt) return null
  const diff = new Date(endsAt).getTime() - Date.now()
  if (diff <= 0) return null
  return `D-${Math.ceil(diff / (1000 * 60 * 60 * 24))}`
}

export function HomeHero({ totalCampaigns, activeCampaigns, liveApplicants, nextDeadline, featuredCampaign }: HomeHeroProps) {
  const stats = [
    { label: "진행 중 이벤트", value: `${activeCampaigns}건`, caption: `전체 ${totalCampaigns}건`, icon: "🎭" },
    { label: "누적 응모", value: `${liveApplicants.toLocaleString()}명`, caption: "함께하는 관객", icon: "👥" },
    { label: "다음 마감", value: nextDeadline ?? "이번 주", caption: "초대권 이벤트", icon: "⏰" },
  ]

  const dday = getDDay(featuredCampaign?.ends_at)

  return (
    <section className="relative overflow-hidden py-12 sm:py-16 md:py-20 lg:py-24">
      {/* 배경 그라데이션 - 공연장 조명 효과 */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 rounded-[100%] bg-gradient-radial from-primary/12 via-primary/5 to-transparent blur-3xl" />
        <div className="absolute right-0 top-1/4 h-[500px] w-[500px] rounded-full bg-gradient-radial from-accent/10 via-accent/3 to-transparent blur-3xl" />
        <div className="absolute left-0 bottom-0 h-[400px] w-[400px] rounded-full bg-gradient-radial from-primary/8 to-transparent blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          {/* 왼쪽: 메인 메시지 */}
          <div className="space-y-8 md:space-y-10">
            <div className="inline-block">
              <span className="cue group cursor-pointer">
                <Sparkles className="h-3.5 w-3.5 transition-transform group-hover:rotate-12" />
                Artause
              </span>
            </div>

            <div className="space-y-5 md:space-y-6">
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl">
                지금 무대,
                <br />
                <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent leading-tight">
                  초대권으로 만나세요
                </span>
              </h1>
              <p className="text-base leading-relaxed text-muted-foreground sm:text-lg md:text-xl">
                뮤지컬·연극 초대권 이벤트에 지금 바로 응모하세요.
                <br className="hidden sm:block" />
                당첨되면 무료로 공연을 즐길 수 있습니다.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5 text-xs font-medium text-muted-foreground">
              {[
                { label: "뮤지컬 팬", emoji: "🎵" },
                { label: "연극 관람", emoji: "🎭" },
              ].map((tag) => (
                <span
                  key={tag.label}
                  className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 transition-all hover:border-primary/50 hover:bg-primary/5"
                >
                  <span className="transition-transform group-hover:scale-110">{tag.emoji}</span>
                  {tag.label}
                </span>
              ))}
            </div>

            {/* 통합 검색창 */}
            <HeroSearchBar />

            {/* 핵심 액션 3버튼 */}
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-3">
              <Link
                href="/events"
                onClick={() => trackEvent("home_click_apply")}
                className="group inline-flex h-12 items-center justify-center rounded-full bg-primary px-7 text-base font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:-translate-y-1 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 sm:h-14 sm:px-8 sm:text-lg"
              >
                초대권 응모하기
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/shows"
                className="group inline-flex h-12 items-center justify-center rounded-full border-2 border-border bg-card px-7 text-base font-bold text-foreground transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:bg-primary/5 hover:text-primary sm:h-14 sm:px-8 sm:text-lg"
              >
                공연 검색
              </Link>
              <Link
                href="/reviews"
                className="group inline-flex h-12 items-center justify-center rounded-full border border-border/60 bg-background/60 px-7 text-base font-bold text-foreground/70 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary sm:h-14 sm:px-8 sm:text-lg"
              >
                후기 보기
                <Star className="ml-2 h-5 w-5" />
              </Link>
            </div>

            {/* 통계 카드 */}
            <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
              {stats.map((stat, index) => (
                <div
                  key={`${stat.label}-${index}`}
                  className="group spotlight-card p-4 sm:p-5"
                >
                  <div className="flex items-start justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground sm:text-xs">
                      {stat.label}
                    </p>
                    <span className="text-lg transition-transform group-hover:scale-110 sm:text-xl">
                      {stat.icon}
                    </span>
                  </div>
                  <p className="mt-2 text-xl font-bold text-foreground sm:text-2xl">{stat.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{stat.caption}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 오른쪽: 이벤트 카드 */}
          <div className="relative mx-auto flex w-full max-w-none flex-col gap-5 sm:max-w-md lg:max-w-lg">
            {/* 메인 이벤트 카드 */}
            <div className="group stage-panel p-5 sm:p-6">
              <div className="mb-4 flex items-center justify-between text-xs font-bold text-muted-foreground sm:mb-5">
                <span className="inline-flex items-center gap-2 rounded-full border-2 border-primary/40 bg-primary/5 px-3 py-1.5 text-primary">
                  <Zap className="h-4 w-4 animate-pulse" />
                  지금 모집 중
                </span>
                {dday && (
                  <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                    {dday}
                  </span>
                )}
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-primary/90">초대권 이벤트 🎭</p>
                <h3 className="text-2xl font-bold text-foreground transition-colors group-hover:text-primary sm:text-3xl">
                  {featuredCampaign?.title ?? "진행 중 이벤트"}
                </h3>
                <p className="line-clamp-2 text-sm text-muted-foreground sm:text-base">
                  {featuredCampaign?.one_line_intro ?? featuredCampaign?.description ?? "지금 바로 응모하고 공연을 무료로 즐기세요."}
                </p>
              </div>
              <div className="mt-5 flex items-center justify-between rounded-2xl border-2 border-border bg-muted/30 p-4 transition-colors hover:border-primary/30 hover:bg-primary/5">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground flex items-center gap-1">
                    <Ticket className="h-3 w-3" />
                    무료 초대권
                  </p>
                  <p className="mt-0.5 text-base font-bold text-primary sm:text-lg">
                    {featuredCampaign?.reward ?? "초대권 응모"}
                  </p>
                </div>
                <Link
                  href={featuredCampaign?.slug ? `/events/${featuredCampaign.slug}` : "/events"}
                  className="group/btn rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-1 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30"
                >
                  응모하기
                  <ArrowRight className="ml-1 inline h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                </Link>
              </div>
            </div>

            {/* 응모 가이드 카드 */}
            <div className="stage-panel p-5 sm:p-6">
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground sm:mb-5">
                이렇게 응모하세요 ✨
              </p>
              <div className="space-y-3 sm:space-y-4">
                {timeline.map((item, index) => (
                  <div
                    key={item.title}
                    className="group/item flex items-start gap-3 rounded-xl p-2 transition-colors hover:bg-primary/5"
                  >
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border-2 border-primary/40 bg-primary/10 text-sm font-bold text-primary transition-all group-hover/item:scale-110 group-hover/item:border-primary group-hover/item:bg-primary group-hover/item:text-primary-foreground sm:h-10 sm:w-10">
                      0{index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-foreground sm:text-base">{item.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
