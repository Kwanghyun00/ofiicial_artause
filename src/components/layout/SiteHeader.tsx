"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"

// MVP: 네비게이션 없음 — 로고 + 파트너 문의만 노출
// 큐레이션/공연검색/후기/취향테스트/로그인은 이후 단계에서 순차 추가 예정

export function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 32)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-40 transition-all ${
        isScrolled
          ? "border-b-2 border-foreground bg-background/98 backdrop-blur-xl"
          : "border-b border-border/60 bg-background/90 backdrop-blur-md"
      }`}
      style={{ transition: "background 0.3s var(--ease-in-out), border-color 0.2s var(--ease-in-out)" }}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:h-16 sm:px-6 lg:px-8">

        {/* 로고 */}
        <Link
          href="/"
          className="group relative flex items-center gap-2.5 outline-none"
          aria-label="Artause 홈"
        >
          <Image
            src="/images/brand/artause-symbol.png"
            alt="Artause"
            width={140}
            height={40}
            className="h-8 w-auto transition-opacity duration-150 group-hover:opacity-70 sm:h-9"
            priority
          />
        </Link>

        {/* 파트너 문의 */}
        <Link
          href="/services"
          className="inline-flex items-center border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-all duration-150 hover:border-foreground/40 hover:text-foreground"
        >
          파트너 문의
        </Link>

      </div>
    </header>
  )
}
