import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, User, Handshake } from "lucide-react"
import { MobileNav } from "@/components/components/mobile-nav"

const navItems = [
  { href: "/events", label: "초대 캘린더" },
  { href: "/venues/1", label: "공연 아카이브" },
  { href: "/services", label: "서비스" },
  { href: "/membership", label: "멤버십" },
]

export function SiteHeader() {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        본문으로 건너뛰기
      </a>

      <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center">
              <Image
                src="/images/brand/artause-symbol.png"
                alt="Artause"
                width={140}
                height={40}
                className="h-10 w-auto"
                priority
              />
            </Link>
            <Badge variant="secondary" className="hidden md:inline-flex rounded-full bg-primary/10 text-primary">
              Beta 2025
            </Badge>
          </div>

          <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex" aria-label="주요 메뉴">
            <Link href="/" className="text-foreground transition-colors hover:text-primary">
              홈
            </Link>
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="transition-colors hover:text-primary">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex text-foreground hover:bg-secondary hover:text-primary"
              aria-label="검색"
            >
              <Search className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex text-foreground hover:bg-secondary hover:text-primary"
              aria-label="마이 페이지"
            >
              <User className="h-5 w-5" />
            </Button>
            <Button variant="outline" className="hidden rounded-full border-2 border-border px-5 text-sm font-semibold md:flex">
              로그인
            </Button>
            <Button className="hidden rounded-full px-5 text-sm font-semibold md:flex">
              <Handshake className="mr-1.5 h-4 w-4" />
              제휴 문의
            </Button>
            <MobileNav />
          </div>
        </div>
      </header>
    </>
  )
}
