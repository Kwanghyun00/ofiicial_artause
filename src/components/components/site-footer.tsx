import Image from "next/image"
import Link from "next/link"
import { Instagram, Mail, Send } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const footerLinks = [
  {
    title: "서비스",
    items: [
      { label: "초대 캘린더", href: "/events" },
      { label: "멤버십 안내", href: "/membership" },
      { label: "파트너 프로그램", href: "/partners" },
    ],
  },
  {
    title: "지원",
    items: [
      { label: "고객센터", href: "/support" },
      { label: "자주 묻는 질문", href: "/faq" },
      { label: "이용 약관", href: "/terms" },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-16 md:px-6">
        <div className="grid gap-12 md:grid-cols-[1.2fr_1fr_1fr]">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white">
                <Image src="/images/brand/artause-symbol.png" alt="Artause" width={40} height={40} />
              </div>
              <div>
                <p className="text-xl font-semibold">Artause</p>
                <p className="text-sm text-primary-foreground/70">Culture Invitation Studio</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-primary-foreground/80">
              문화생활을 사랑하는 모든 분들을 위한 프리미엄 초청 큐레이션. 아트하우스와 함께 새로운 무대를 만나보세요.
            </p>
            <div className="flex gap-3 text-sm text-primary-foreground/70">
              <span>사업자 등록 123-45-67890</span>
              <span>통신판매업 2024-서울-0001</span>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-foreground/80">Newsletter</p>
            <p className="text-sm text-primary-foreground/80">
              이번 주 초대와 문화 인사이트를 매주 월요일 오전에 보내드려요.
            </p>
            <form className="flex gap-2">
              <Input placeholder="이메일 주소" className="border-none bg-primary-foreground/10 text-white placeholder:text-primary-foreground/60" />
              <Button type="submit" className="bg-white text-primary hover:bg-white/90">
                <Send className="h-4 w-4" />
              </Button>
            </form>
            <div className="flex gap-4">
              {[Instagram, Mail].map((Icon, idx) => (
                <Link
                  key={idx}
                  href="#"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 hover:bg-white/10"
                >
                  <Icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {footerLinks.map((section) => (
              <div key={section.title} className="space-y-3 text-sm">
                <p className="text-base font-semibold">{section.title}</p>
                <ul className="space-y-2 text-primary-foreground/80">
                  {section.items.map((item) => (
                    <li key={item.label}>
                      <Link href={item.href} className="hover:text-white">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 border-t border-white/20 pt-6 text-xs text-primary-foreground/70">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <p>© {new Date().getFullYear()} Artause Inc. All rights reserved.</p>
            <p>Contact · help@artause.com / biz@artause.com · 1544-0000 (평일 10:00-18:00)</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
