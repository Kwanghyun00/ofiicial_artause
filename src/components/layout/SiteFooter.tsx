import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Briefcase, Building2, Layers } from "lucide-react"
import { companyMeta } from "@/constants/company"

const companyLinks = [
  {
    href: "/about",
    icon: Building2,
    title: "회사 소개",
    description: "Artause 팀과 운영 철학을 소개합니다.",
  },
  {
    href: "/works",
    icon: Briefcase,
    title: "포트폴리오",
    description: "지금까지 함께한 공연 성공 사례 모음.",
  },
  {
    href: "/services",
    icon: Layers,
    title: "서비스 안내",
    description: "초대권 이벤트부터 콘텐츠 제작까지.",
  },
]

const footerSections = [
  {
    title: "바로가기",
    items: [
      { href: "/events", label: "초대권" },
      { href: "/shows", label: "공연검색" },
      { href: "/reviews", label: "후기" },
      { href: "/works", label: "포트폴리오" },
      { href: "/about", label: "회사 소개" },
    ],
  },
  {
    title: "서비스",
    items: [
      { href: "/services", label: "서비스 소개" },
      { href: "/contact", label: "문의하기" },
      { href: companyMeta.promoForm, label: "무료 홍보 신청" },
    ],
  },
  {
    title: "SNS",
    items: [
      { href: companyMeta.instagramMain, label: "@artause_official" },
      { href: companyMeta.instagramSpotlight, label: "@spotlight_performance" },
    ],
  },
  {
    title: "문의 신청",
    items: [
      { href: `mailto:${companyMeta.email}`, label: companyMeta.email },
      { href: companyMeta.promoForm, label: "프로모션 신청" },
      { href: "/contact", label: "문의 신청 바로가기" },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-background/90 text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        {/* 회사 소개 / 포트폴리오 / 서비스 */}
        <div className="mb-10 grid gap-4 sm:grid-cols-3">
          {companyLinks.map(({ href, icon: Icon, title, description }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-start gap-3 rounded-2xl border border-border/60 bg-card/60 p-4 transition-all hover:border-primary/40 hover:bg-primary/5"
            >
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground group-hover:text-primary">{title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{description}</p>
              </div>
              <ArrowRight className="h-4 w-4 flex-shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-primary/60" />
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-sm space-y-3">
            <div className="flex items-center gap-3">
              <span className="flex items-center">
                <Image
                  src="/images/brand/artause-symbol.png"
                  alt="Artause"
                  width={140}
                  height={40}
                  className="h-8 w-auto brightness-110 sm:h-9"
                />
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              공연의 매력을 더 많은 관객에게 전달하기 위해, 초대권 이벤트와 콘텐츠 제작을 함께
              운영합니다. 관객 참여 데이터를 기반으로 공연의 성장을 돕습니다.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/events"
                className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary/90"
              >
                초대권 이벤트 보기
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full border border-border px-4 py-2 text-xs font-semibold text-foreground transition hover:border-primary hover:text-primary"
              >
                문의하기
              </Link>
            </div>
          </div>

          <div className="flex flex-1 flex-wrap justify-start gap-6 text-sm lg:justify-end">
            {footerSections.map((section) => (
              <div key={section.title} className="min-w-[140px] space-y-2">
                <p className="text-base font-semibold">{section.title}</p>
                <ul className="flex flex-wrap gap-x-4 gap-y-2 text-muted-foreground">
                  {section.items.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className="transition hover:text-primary">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 border-t border-border/60 pt-4 text-xs text-muted-foreground">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <p>© {new Date().getFullYear()} Artause. All rights reserved.</p>
            <p>문의: {companyMeta.email}</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
