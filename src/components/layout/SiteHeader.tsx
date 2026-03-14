"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"
import { useState, useEffect } from "react"

// 관객 전용 네비게이션
const navItems = [
  { href: "/events", label: "초대권" },
  { href: "/shows", label: "공연검색" },
  { href: "/reviews", label: "후기" },
]

export function SiteHeader() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  // 스크롤 감지
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-all duration-300 ${
        isScrolled
          ? "border-border/80 bg-background/95 shadow-lg shadow-primary/5 backdrop-blur-xl"
          : "border-border/40 bg-background/80 backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-18 sm:px-6 lg:px-8">
        {/* 로고 */}
        <Link href="/" className="group flex items-center transition-transform hover:scale-105">
          <Image
            src="/images/brand/artause-symbol.png"
            alt="Artause"
            width={140}
            height={40}
            className="h-9 w-auto transition-all sm:h-10"
            priority
          />
        </Link>

        {/* 데스크톱 네비게이션 */}
        <nav className="hidden items-center gap-1 md:flex lg:gap-2" aria-label="Primary">
          {navItems.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative rounded-lg px-4 py-2 text-sm font-bold transition-all hover:bg-primary/5 lg:text-base ${
                  isActive ? "text-primary" : "text-foreground/80 hover:text-primary"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-primary" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* 우측 버튼 */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* 파트너(공연단체) 진입 — 데스크톱에서만 노출 */}
          <Link
            href="/services"
            className="hidden items-center rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:border-primary/50 hover:text-primary md:inline-flex"
          >
            파트너 문의
          </Link>
          {/* 관객 주 CTA */}
          <Link
            href="/events"
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 sm:h-11 sm:px-6 sm:text-base"
          >
            초대권 신청
            <span className="text-base">✨</span>
          </Link>
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-border bg-card text-foreground transition-all hover:border-primary/50 hover:bg-primary/5 hover:text-primary md:hidden"
            aria-label="모바일 메뉴 열기"
            onClick={() => setMobileOpen((open) => !open)}
          >
            <Menu className={`h-5 w-5 transition-transform ${mobileOpen ? "rotate-90" : ""}`} />
          </button>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      {mobileOpen && (
        <div className="animate-in slide-in-from-top-2 border-t border-border/50 bg-background/98 px-4 py-5 backdrop-blur-xl md:hidden">
          <nav className="flex flex-col gap-2" aria-label="Mobile">
            {navItems.map((item) => {
              const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-xl px-4 py-3 text-base font-bold transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-card text-foreground hover:bg-primary/5 hover:text-primary"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.label}
                </Link>
              )
            })}
            <Link
              href="/events"
              onClick={() => setMobileOpen(false)}
              className="mt-2 rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-3 text-center text-base font-bold text-white shadow-lg"
            >
              초대권 신청 ✨
            </Link>
            <Link
              href="/services"
              onClick={() => setMobileOpen(false)}
              className="rounded-xl border border-border bg-card px-4 py-3 text-center text-sm font-medium text-muted-foreground transition-all hover:text-primary"
            >
              공연단체 파트너 문의
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
