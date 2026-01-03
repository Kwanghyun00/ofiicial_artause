"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, Home, Calendar, MapPin, History, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const navItems = [
    { href: "/", label: "홈", icon: Home },
    { href: "/events", label: "공연 찾기", icon: Calendar },
    { href: "/venues", label: "공연장", icon: MapPin },
    { href: "/history", label: "응모 내역", icon: History },
    { href: "/profile", label: "마이페이지", icon: User },
  ]

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="메뉴 열기">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px]">
        <SheetHeader>
          <SheetTitle className="text-left font-bold text-xl">Artause</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-2 mt-8" aria-label="모바일 메인 네비게이션">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}

          <div className="border-t pt-4 mt-4">
            <Button className="w-full rounded-full" size="lg">
              로그인
            </Button>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
