"use client"

import Link from "next/link"
import { ArrowRight, BookOpen } from "lucide-react"
import { HeroSearchBar } from "./HeroSearchBar"

export function HomeHero() {
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
        <div className="max-w-3xl">

          {/* 레이블 */}
          <span className="cue">알터즈 | 공연 큐레이션</span>

          {/* 헤딩 */}
          <div className="mt-6 space-y-5">
            <h1 className="text-4xl font-bold leading-[1.15] text-foreground sm:text-5xl md:text-6xl lg:text-[4rem] xl:text-[4.5rem]">
              공연, 알터즈와 함께{" "}
              <br className="hidden sm:block" />
              <span className="gradient-text">발견하세요</span>
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              SNS에서 소개한 공연부터 지금 주목할 작품까지,
              <br className="hidden md:block" />
              알터즈 에디터가 큐레이션한 공연 에세이를 만나보세요.
            </p>
          </div>

          {/* 검색 */}
          <div className="mt-8 max-w-lg">
            <HeroSearchBar />
          </div>

          {/* CTA 버튼 */}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/blog"
              className="group inline-flex h-12 items-center justify-center gap-2 border-2 border-primary bg-primary px-7 text-[15px] font-bold text-primary-foreground transition-all hover:bg-primary/90 sm:h-13 sm:px-8"
              style={{ transitionDuration: "var(--duration-base)" }}
            >
              <BookOpen className="h-4 w-4" />
              큐레이션 에세이 읽기
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/shows"
              className="inline-flex h-12 items-center justify-center border-2 border-border px-7 text-[15px] font-bold text-foreground transition-all hover:border-foreground/50 hover:text-foreground sm:h-13 sm:px-8"
              style={{ transitionDuration: "var(--duration-base)" }}
            >
              공연 검색하기
            </Link>
          </div>

        </div>
      </div>
    </section>
  )
}
