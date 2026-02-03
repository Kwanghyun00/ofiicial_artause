"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"
import { useState } from "react"

const navItems = [
  { href: "/", label: "홈" },
  { href: "/works", label: "포트폴리오" },
  { href: "/shows", label: "진행 중 공연/이벤트" },
  { href: "/events", label: "초대권 응모" },
]

export function SiteHeader() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
            A
          </span>
          <div>
            <p className="text-base font-semibold text-foreground">Artause</p>
            <p className="text-xs text-muted-foreground">공연 홍보 · 이벤트 운영 · 디지털 전환</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex" aria-label="Primary">
          {navItems.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`transition hover:text-primary ${isActive ? "text-foreground" : ""}`}
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-3 md:hidden">
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground transition hover:bg-secondary"
            aria-label="모바일 메뉴 열기"
            onClick={() => setMobileOpen((open) => !open)}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-background/95 px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3 text-sm font-medium text-muted-foreground" aria-label="Mobile">
            {navItems.map((item) => {
              const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-xl px-3 py-2 transition ${isActive ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      )}
    </header>
  )
}
