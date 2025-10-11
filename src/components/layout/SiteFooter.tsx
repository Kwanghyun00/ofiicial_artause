import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-white/40 bg-white/70 backdrop-blur">
      <div className="mx-auto grid max-w-6xl gap-6 px-6 py-10 text-sm text-slate-500 md:grid-cols-3">
        <div>
          <p className="font-semibold text-slate-800">Artause</p>
          <p>서울특별시 성동구 성수이로 000</p>
          <p>사업자등록번호 707-24-01862 · 대표 김광현</p>
        </div>
        <div className="space-y-1">
          <p>contact@artause.kr · 010-0000-0000</p>
          <p>법무/개인정보: legal@artause.com</p>
          <p>파트너/스폰서십: partners@artause.com</p>
        </div>
        <div className="space-y-2">
          <Link href="/legal" className="block hover:text-indigo-600">
            이용약관 & 개인정보처리방침
          </Link>
          <Link href="/partners" className="block hover:text-indigo-600">
            파트너 프로그램
          </Link>
          <Link href="/pricing" className="block hover:text-indigo-600">
            멤버십 안내
          </Link>
        </div>
      </div>
      <div className="border-t border-white/60 bg-white/50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 text-xs text-slate-500">
          <p>Copyright © {new Date().getFullYear()} Artause. All rights reserved.</p>
          <Link href="/legal" className="hover:text-indigo-600">
            정책 보기
          </Link>
        </div>
      </div>
    </footer>
  );
}
