/**
 * SiteFooter 컴포넌트
 *
 * 전체 사이트의 하단 푸터
 */
"use client";

import Link from "next/link";

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-amber-200 bg-gradient-to-b from-amber-50 to-white text-slate-700 sm:mt-20">
      {/* 메인 푸터 콘텐츠 */}
      <div className="mx-auto max-w-6xl px-6 py-10 sm:py-12">
        <div className="grid gap-8 md:grid-cols-3">
          {/* 회사 정보 섹션 */}
          <div className="space-y-3">
            <p className="text-xl font-bold text-amber-900">Artause</p>
            <p className="text-sm text-amber-800">
              공연과 전시를 사랑하는 모든 이들을 위한<br />
              초대권 플랫폼
            </p>
            <div className="space-y-1 text-sm text-slate-600">
              <p>대표 김광현</p>
              <p>사업자 707-24-01862</p>
            </div>
          </div>

          {/* 문의 섹션 */}
          <div className="space-y-3">
            <p className="text-base font-bold text-amber-900">📧 Contact</p>
            <div className="space-y-2 text-sm">
              <div>
                <p className="font-semibold text-slate-700">일반 문의</p>
                <a
                  href="mailto:artause23@gmail.com"
                  className="text-amber-700 hover:text-amber-900 hover:underline transition-colors"
                >
                  artause23@gmail.com
                </a>
              </div>
              <div>
                <p className="font-semibold text-slate-700">협업 · 광고 문의</p>
                <a
                  href="mailto:artause23@gmail.com?subject=협업 문의"
                  className="text-amber-700 hover:text-amber-900 hover:underline transition-colors"
                >
                  artause23@gmail.com
                </a>
                <p className="mt-1 text-xs text-slate-500">
                  공연장, 전시관, 공연 기획사 등<br />
                  파트너십 및 광고 제안 환영합니다
                </p>
              </div>
            </div>
          </div>

          {/* 푸터 네비게이션 */}
          <div className="space-y-3">
            <p className="text-base font-bold text-amber-900">🎭 Quick Links</p>
            <nav className="space-y-2 text-sm" aria-label="푸터 네비게이션">
              <Link
                href="/events"
                className="block text-slate-700 hover:text-amber-900 transition-colors hover:translate-x-1 duration-200"
              >
                → 진행 중인 초대권 이벤트
              </Link>
              <Link
                href="/rules"
                className="block text-slate-700 hover:text-amber-900 transition-colors hover:translate-x-1 duration-200"
              >
                → 이용 규칙
              </Link>
              <Link
                href="/partner/login"
                className="block text-slate-700 hover:text-amber-900 transition-colors hover:translate-x-1 duration-200"
              >
                → 파트너 센터
              </Link>
            </nav>
          </div>
        </div>

        {/* SNS 섹션 */}
        <div className="mt-8 pt-6 border-t border-amber-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-amber-900">Follow Us</p>
              <a
                href="https://instagram.com/artause_official"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-amber-700 hover:text-amber-900 font-medium transition-colors"
              >
                <span className="text-lg">📸</span>
                @artause_official
              </a>
            </div>
            <p className="text-xs text-slate-500">
              운영 시간 평일 10:00-18:00 (주말/공휴일 휴무)
            </p>
          </div>
        </div>
      </div>

      {/* 하단 저작권 */}
      <div className="border-t border-amber-100 bg-amber-50">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <p className="text-center text-xs text-slate-500">
            © {currentYear} Artause. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
