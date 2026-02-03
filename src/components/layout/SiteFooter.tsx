import Link from "next/link"
import { companyMeta } from "@/constants/company"

const footerSections = [
  {
    title: "바로가기",
    items: [
      { href: "/", label: "홈" },
      { href: "/events", label: "초대권 응모" },
      { href: "/shows", label: "진행 중 공연/이벤트" },
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
    <footer className="border-t border-border/60 bg-white text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-sm space-y-3">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                A
              </span>
              <div>
                <p className="text-xl font-semibold">Artause</p>
                <p className="text-sm text-muted-foreground">공연 홍보 · 이벤트 운영 · 디지털 전환</p>
              </div>
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
                      <Link href={item.href} className="transition hover:text-foreground">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 border-t border-border/60 pt-4 text-xs text-muted-foreground">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <p>© {new Date().getFullYear()} Artause. All rights reserved.</p>
            <p>문의: {companyMeta.email}</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
