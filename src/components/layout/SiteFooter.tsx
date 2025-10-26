"use client";

import Link from "next/link";
import { useRole } from "./RoleContext";

export function SiteFooter() {
  const { role } = useRole();
  const isPartnerView = role === "partner";

  const sectionClass = isPartnerView
    ? "mt-20 border-t border-slate-800 bg-slate-950 text-white/70"
    : "mt-20 border-t border-white/40 bg-white/70 text-slate-500 backdrop-blur";

  const innerClass = isPartnerView
    ? "mx-auto grid max-w-6xl gap-6 px-6 py-10 text-sm md:grid-cols-3"
    : "mx-auto grid max-w-6xl gap-6 px-6 py-10 text-sm text-slate-500 md:grid-cols-3";

  const bottomClass = isPartnerView
    ? "border-t border-slate-800 bg-slate-950/90"
    : "border-t border-white/60 bg-white/50";

  const linkClass = isPartnerView ? "block hover:text-emerald-200" : "block hover:text-indigo-600";

  return (
    <footer className={sectionClass}>
      <div className={innerClass}>
        <div>
          <p className={`font-semibold ${isPartnerView ? "text-white" : "text-slate-800"}`}>㈜ 아트하우스</p>
          <p>서울 성동구 성수이로 66 6F</p>
          <p>대표 김광현 · 사업자번호 707-24-01862</p>
        </div>
        <div className="space-y-1">
          <p>서비스 문의: contact@artause.kr</p>
          <p>초대권 운영: tickets@artause.kr</p>
          <p>제휴/프로모션: partners@artause.kr</p>
          <p>조용한 시간대: 22:00~08:00 KST</p>
        </div>
        <div className="space-y-2">
          <Link href="/shows" className={linkClass}>
            공연·전시
          </Link>
          <Link href="/events" className={linkClass}>
            초대권 이벤트
          </Link>
          <Link href="/partners" className={linkClass}>
            제휴 안내
          </Link>
          <Link href="/legal" className={linkClass}>
            개인정보 처리방침
          </Link>
        </div>
      </div>
      <div className={bottomClass}>
        <div
          className={`mx-auto flex max-w-6xl items-center justify-between px-6 py-4 text-xs ${
            isPartnerView ? "text-white/60" : "text-slate-500"
          }`}
        >
          <p>© {new Date().getFullYear()} Artause. All rights reserved.</p>
          <Link href="/legal" className={isPartnerView ? "hover:text-emerald-200" : "hover:text-indigo-600"}>
            이용약관 · 개인정보 처리방침
          </Link>
        </div>
      </div>
    </footer>
  );
}
