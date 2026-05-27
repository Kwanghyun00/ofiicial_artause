import Image from "next/image"
import Link from "next/link"
import { companyMeta } from "@/constants/company"

const footerNav = [
  {
    title: "발견",
    items: [
      { href: "/blog", label: "큐레이션 에세이" },
      { href: "/shows", label: "공연 검색" },
      { href: "/reviews", label: "관람 후기" },
      { href: "/my", label: "내 북마크" },
    ],
  },
  {
    title: "파트너",
    items: [
      { href: "/services", label: "서비스 소개" },
      { href: "/works", label: "포트폴리오" },
      { href: "/contact", label: "문의하기" },
      { href: companyMeta.promoForm, label: "무료 홍보 신청" },
    ],
  },
  {
    title: "회사",
    items: [
      { href: "/about", label: "Artause 소개" },
      { href: "/rules", label: "이용 안내" },
    ],
  },
  {
    title: "소셜",
    items: [
      { href: companyMeta.instagramMain, label: "@artause_official" },
      { href: companyMeta.instagramSpotlight, label: "@spotlight_performance" },
      { href: `mailto:${companyMeta.email}`, label: companyMeta.email },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="bg-background">
      {/* 상단 두줄 규칙선 — Broadsheet masthead */}
      <div className="border-t-2 border-foreground" />
      <div className="border-t border-border" />

      {/* CTA 배너 */}
      <div className="border-b border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-7 sm:flex-row sm:px-6 lg:px-8">
          <div>
            <p className="font-display text-base font-bold text-foreground">공연단체이신가요?</p>
            <p className="mt-0.5 text-sm text-muted-foreground">초대권 이벤트·홍보 콘텐츠 제작을 함께 운영합니다.</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Link
              href="/services"
              className="inline-flex items-center border-2 border-primary bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
            >
              서비스 보기
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition hover:border-foreground/50 hover:text-foreground"
            >
              문의하기
            </Link>
          </div>
        </div>
      </div>

      {/* 메인 푸터 */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_2fr]">
          {/* 브랜드 블록 */}
          <div className="space-y-4">
            <Link href="/">
              <Image
                src="/images/brand/artause-symbol.png"
                alt="Artause"
                width={130}
                height={38}
                className="h-8 w-auto opacity-90"
              />
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              공연의 매력을 더 많은 관객에게 전달합니다.
              에디터 큐레이션으로 공연을 발견하는 가장 좋은 방법.
            </p>
            <div>
              <Link
                href="/blog"
                className="inline-flex items-center border border-primary/50 bg-primary/8 px-4 py-2 text-xs font-bold uppercase tracking-widest text-primary transition hover:bg-primary/15"
              >
                공연 큐레이션 →
              </Link>
            </div>
          </div>

          {/* 링크 그리드 */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {footerNav.map((section) => (
              <div key={section.title} className="space-y-3">
                <p className="border-b border-border pb-1.5 text-xs font-bold uppercase tracking-widest text-foreground/70">
                  {section.title}
                </p>
                <ul className="space-y-2.5">
                  {section.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="text-sm text-foreground/60 transition-colors hover:text-primary"
                        {...(item.href.startsWith("http") || item.href.startsWith("mailto")
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* 하단 법적 정보 */}
        <div className="mt-12 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Artause. All rights reserved.</p>
          <p>artause23@gmail.com</p>
        </div>
      </div>
    </footer>
  )
}
