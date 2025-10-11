import Link from "next/link";

const navItems = [
  { href: "/", label: "홈" },
  { href: "/shows", label: "공연" },
  { href: "/events", label: "이벤트" },
  { href: "/pricing", label: "멤버십" },
  { href: "/partners", label: "파트너" },
  { href: "/legal", label: "정책" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/30 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white font-semibold">
            A
          </div>
          <div>
            <span className="text-lg font-semibold text-slate-900">Artause</span>
            <p className="text-xs text-slate-500">공연·이벤트 성장 파트너</p>
          </div>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-indigo-600">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <Link href="/me" className="btn-secondary">
            마이 페이지
          </Link>
          <Link href="/request/promotion" className="btn-primary">
            협업 문의
          </Link>
        </div>
        <div className="flex items-center gap-2 md:hidden">
          <Link href="/events" className="btn-secondary">
            이벤트
          </Link>
        </div>
      </div>
    </header>
  );
}
