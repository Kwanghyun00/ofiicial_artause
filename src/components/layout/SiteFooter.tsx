import Link from "next/link"

const footerLinks = [
  {
    title: "서비스",
    items: [
      { href: "/events", label: "초대 캘린더" },
      { href: "/performances", label: "공연·전시 아카이브" },
      { href: "/event-center", label: "이벤트 허브" },
    ],
  },
  {
    title: "고객 지원",
    items: [
      { href: "/rules", label: "이용 안내" },
      { href: "/faq", label: "자주 묻는 질문" },
      { href: "/support", label: "고객센터" },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <div className="grid gap-10 md:grid-cols-[1.2fr,1fr,1fr]">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground text-lg font-bold text-primary">
                A
              </span>
              <div>
                <p className="text-xl font-semibold">Artause</p>
                <p className="text-sm text-primary-foreground/70">프리미엄 문화 초청 플랫폼</p>
              </div>
            </div>
            <p className="text-sm text-primary-foreground/80">
              문화생활을 사랑하는 모든 분들을 위한 초청 큐레이션. 아트하우스와 함께 새로운 공연과 전시를 경험하세요.
            </p>
            <p className="text-xs text-primary-foreground/50">사업자등록 123-45-67890 · 통신판매업 2024-서울-0001</p>
          </div>

          {footerLinks.map((section) => (
            <div key={section.title} className="space-y-3 text-sm">
              <p className="text-base font-semibold">{section.title}</p>
              <ul className="space-y-2 text-primary-foreground/80">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="transition hover:text-white">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-white/20 pt-6 text-xs text-primary-foreground/70">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <p>© {new Date().getFullYear()} Artause Inc. 모든 권리 보유.</p>
            <p>문의 · help@artause.com / biz@artause.com · 1544-0000 (평일 10:00-18:00)</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
