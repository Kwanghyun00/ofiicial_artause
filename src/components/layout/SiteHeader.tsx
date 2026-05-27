"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bookmark, Menu, X } from "lucide-react"
import { useState, useEffect } from "react"

const navItems = [
  { href: "/blog", label: "큐레이션" },
  { href: "/shows", label: "공연검색" },
  { href: "/reviews", label: "후기" },
  { href: "/taste", label: "취향테스트" },
  { href: "https://smartstore.naver.com/artause", label: "알터즈숍", external: true },
]

export function SiteHeader() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 32)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = "hidden"
    else document.body.style.overflow = ""
    return () => { document.body.style.overflow = "" }
  }, [mobileOpen])

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all ${
          isScrolled
            ? "border-b-2 border-foreground bg-background/98 backdrop-blur-xl"
            : "border-b border-border/60 bg-background/90 backdrop-blur-md"
        }`}
        style={{ transition: "background 0.3s var(--ease-in-out), border-color 0.2s var(--ease-in-out)" }}
      >
        {/* ── 상단 마스트헤드 줄 — 브로드시트 스타일 ── */}
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

          {/* 데스크톱 네비게이션 */}
          <nav className="hidden items-center md:flex" aria-label="Primary navigation">
            <ul className="flex items-center" role="list">
              {navItems.map((item) => {
                const isActive = !item.external && pathname.startsWith(item.href)
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className={`relative inline-flex h-14 items-center border-b-2 px-5 text-[14px] font-semibold tracking-wide uppercase transition-colors duration-150 sm:h-16 ${
                        isActive
                          ? "border-primary text-primary"
                          : "border-transparent text-foreground/65 hover:border-border hover:text-foreground"
                      }`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* 우측 액션 */}
          <div className="flex items-center gap-2">
            {/* 파트너 문의 */}
            <Link
              href="/services"
              className="hidden items-center gap-1.5 border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-all duration-150 hover:border-foreground/40 hover:text-foreground md:inline-flex"
            >
              파트너 문의
            </Link>

            {/* 북마크 */}
            <Link
              href="/my"
              aria-label="내 북마크"
              className={`inline-flex h-9 w-9 items-center justify-center border transition-all duration-150 sm:h-10 sm:w-10 ${
                pathname.startsWith("/my")
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
              }`}
            >
              <Bookmark className="h-[16px] w-[16px]" />
            </Link>

            {/* 모바일 메뉴 토글 */}
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center border border-border text-foreground/70 transition-all duration-150 hover:border-foreground/40 hover:text-foreground md:hidden"
              aria-label={mobileOpen ? "메뉴 닫기" : "메뉴 열기"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
            </button>
          </div>
        </div>
      </header>

      {/* 모바일 메뉴 */}
      <div
        aria-hidden={!mobileOpen}
        className={`fixed inset-0 z-50 flex flex-col bg-background transition-all duration-300 md:hidden ${
          mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        style={{ transitionTimingFunction: "var(--ease-out-expo)" }}
      >
        {/* 헤더 */}
        <div className="flex h-14 items-center justify-between border-b-2 border-foreground px-4 sm:px-6">
          <Link href="/" onClick={() => setMobileOpen(false)}>
            <Image
              src="/images/brand/artause-symbol.png"
              alt="Artause"
              width={120}
              height={35}
              className="h-8 w-auto"
            />
          </Link>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center border border-border text-foreground/70"
            aria-label="메뉴 닫기"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 네비게이션 */}
        <nav className="flex flex-1 flex-col justify-center px-6" aria-label="Mobile navigation">
          <ul className="space-y-0" role="list">
            {navItems.map((item, i) => {
              const isActive = !item.external && pathname.startsWith(item.href)
              return (
                <li
                  key={item.href}
                  style={{
                    transitionDelay: mobileOpen ? `${i * 50}ms` : "0ms",
                    transform: mobileOpen ? "translateY(0)" : "translateY(8px)",
                    opacity: mobileOpen ? 1 : 0,
                    transition: "transform 0.35s var(--ease-out-expo), opacity 0.35s var(--ease-out-expo)",
                  }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className={`flex items-center justify-between border-b px-2 py-4 text-2xl font-bold tracking-tight transition-colors ${
                      isActive
                        ? "border-primary text-primary"
                        : "border-border text-foreground hover:text-primary"
                    }`}
                  >
                    {item.label}
                    {isActive && <span className="h-2 w-2 bg-primary" />}
                  </Link>
                </li>
              )
            })}
          </ul>

          <div className="my-8 h-[2px] w-full bg-foreground" />

          <div className="space-y-3">
            <Link
              href="/blog"
              onClick={() => setMobileOpen(false)}
              className="flex w-full items-center justify-center border-2 border-primary bg-primary py-4 text-lg font-bold text-primary-foreground"
            >
              큐레이션 에세이 ✦
            </Link>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/my"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-center gap-2 border py-3 text-sm font-semibold transition-colors ${
                  pathname.startsWith("/my")
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-foreground hover:border-foreground/50 hover:text-foreground"
                }`}
              >
                <Bookmark className="h-4 w-4" />
                내 북마크
              </Link>
              <Link
                href="/services"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center border border-border py-3 text-sm font-semibold text-muted-foreground transition-colors hover:border-foreground/50 hover:text-foreground"
              >
                파트너 문의
              </Link>
            </div>
          </div>
        </nav>
      </div>
    </>
  )
}
