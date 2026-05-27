"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Instagram, Youtube } from "lucide-react"

export function HomeHero() {
  return (
    <section
      className="relative min-h-[88vh] overflow-hidden flex flex-col justify-between"
      style={{
        background: "oklch(0.11 0.016 285)",
      }}
    >
      {/* 스포트라이트 배경 */}
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
        {/* 중앙 상단 골드 글로우 */}
        <div
          className="absolute left-1/2 top-0 h-[70vh] w-[120vw] -translate-x-1/2 -translate-y-1/4"
          style={{
            background: "radial-gradient(ellipse 70% 60% at 50% 10%, oklch(0.64 0.18 55 / 0.13) 0%, oklch(0.64 0.18 55 / 0.04) 50%, transparent 72%)",
          }}
        />
        {/* 좌하단 앰버 */}
        <div
          className="absolute -bottom-20 -left-20 h-[50vh] w-[50vh]"
          style={{
            background: "radial-gradient(ellipse, oklch(0.58 0.22 38 / 0.07) 0%, transparent 70%)",
          }}
        />
        {/* 그리드 선 */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: "linear-gradient(oklch(0.95 0.009 80) 1px, transparent 1px), linear-gradient(90deg, oklch(0.95 0.009 80) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
      </div>

      {/* 상단: 에디터 마스트헤드 라인 */}
      <div className="relative z-10 border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em] text-white/30">
            <span>알터즈</span>
            <span className="h-3 w-px bg-white/20" />
            <span>공연 큐레이션</span>
            <span className="h-3 w-px bg-white/20" />
            <span className="text-primary/80">2026</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://www.instagram.com/artause_official"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-white/30 transition hover:text-white/60"
            >
              <Instagram className="h-3 w-3" />
              @artause_official
            </a>
            <a
              href="https://www.youtube.com/@artause"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-1.5 text-[11px] font-semibold text-white/30 transition hover:text-white/60 sm:inline-flex"
            >
              <Youtube className="h-3 w-3" />
              유튜브
            </a>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="relative z-10 flex flex-1 items-center">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-20">

            {/* 텍스트 */}
            <div className="max-w-2xl">
              {/* 에디터 레이블 */}
              <div className="mb-6 inline-flex items-center gap-2">
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{ background: "oklch(0.64 0.18 55)" }}
                />
                <span
                  className="text-[11px] font-bold uppercase tracking-[0.25em]"
                  style={{ color: "oklch(0.64 0.18 55)" }}
                >
                  Editor's Pick
                </span>
              </div>

              {/* 헤드라인 */}
              <h1
                className="font-serif text-[2.8rem] font-bold leading-[1.1] text-white sm:text-[3.8rem] md:text-[4.5rem] lg:text-[5rem]"
              >
                공연의 매력을
                <br />
                <em className="not-italic" style={{ color: "oklch(0.74 0.17 62)" }}>가장 먼저</em>
                <br />
                전합니다
              </h1>

              <p className="mt-6 max-w-lg text-base leading-relaxed text-white/55 sm:text-lg">
                알터즈 에디터가 SNS에서 직접 소개한 공연들.
                <br className="hidden sm:block" />
                포스터 뒤에 담긴 이야기를 에세이로 만나보세요.
              </p>

              {/* CTA */}
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/blog"
                  className="group inline-flex h-12 items-center gap-2.5 px-7 text-[14px] font-bold text-black transition-all sm:h-13"
                  style={{
                    background: "oklch(0.74 0.17 62)",
                    transitionDuration: "var(--duration-base)",
                  }}
                >
                  큐레이션 에세이
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/services"
                  className="inline-flex h-12 items-center gap-2 border border-white/20 px-7 text-[14px] font-bold text-white/70 transition-all hover:border-white/40 hover:text-white sm:h-13"
                >
                  파트너 문의
                </Link>
              </div>
            </div>

            {/* 우측: 채널 카드 스택 (데스크톱) */}
            <div className="hidden lg:flex lg:flex-col lg:items-end lg:gap-2.5 lg:pb-2">
              <ChannelCard
                icon="instagram"
                label="인스타그램"
                handle="@artause_official"
                color="from-purple-600 to-pink-500"
              />
              <ChannelCard
                icon="youtube"
                label="유튜브"
                handle="@artause"
                color="from-red-600 to-red-500"
              />
              <ChannelCard
                icon="tiktok"
                label="틱톡"
                handle="@artause"
                color="from-slate-700 to-slate-600"
              />
              <p className="mt-1 text-right text-[11px] text-white/25">
                팔로우하고 공연 소식을 받아보세요
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 하단: 스크롤 힌트 + 스탯 */}
      <div className="relative z-10 border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-6 sm:gap-10">
              <StatItem value="SNS 픽" label="공연 소개" />
              <StatItem value="큐레이션" label="에세이" />
              <StatItem value="예매 정보" label="연결" />
            </div>
            <div className="hidden items-center gap-2 text-[11px] text-white/25 sm:flex">
              <span>스크롤</span>
              <span className="h-px w-8 bg-white/20" />
              <span>↓</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ChannelCard({
  icon,
  label,
  handle,
  color,
}: {
  icon: "instagram" | "youtube" | "tiktok"
  label: string
  handle: string
  color: string
}) {
  const hrefs: Record<string, string> = {
    instagram: "https://www.instagram.com/artause_official",
    youtube: "https://www.youtube.com/@artause",
    tiktok: "https://www.tiktok.com/@artause",
  }

  return (
    <a
      href={hrefs[icon]}
      target="_blank"
      rel="noopener noreferrer"
      className={`group flex w-[180px] items-center gap-3 bg-gradient-to-r ${color} p-3 transition-all hover:scale-[1.02] hover:brightness-110`}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-white/15">
        {icon === "instagram" && <Instagram className="h-4 w-4 text-white" />}
        {icon === "youtube" && <Youtube className="h-4 w-4 text-white" />}
        {icon === "tiktok" && <span className="text-[12px] font-black text-white">TK</span>}
      </div>
      <div>
        <p className="text-[11px] font-bold text-white">{label}</p>
        <p className="text-[10px] text-white/60">{handle}</p>
      </div>
      <ArrowRight className="ml-auto h-3 w-3 text-white/40 transition-transform group-hover:translate-x-0.5" />
    </a>
  )
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[13px] font-bold text-white/70">{value}</p>
      <p className="text-[10px] uppercase tracking-widest text-white/30">{label}</p>
    </div>
  )
}
