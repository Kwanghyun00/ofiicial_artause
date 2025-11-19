/**
 * SiteHeader 컴포넌트
 *
 * 전체 사이트의 상단 헤더 (네비게이션 바)
 *
 * 주요 기능:
 * - 로고: 홈으로 이동, 호버 시 회전 효과
 * - 데스크톱 네비게이션: 활성 페이지 표시 (하단 인디케이터)
 * - 모바일 메뉴: 햄버거 아이콘, 슬라이드 패널
 * - Sticky 헤더: 스크롤 시에도 상단 고정
 *
 * 반응형:
 * - 모바일 (< 768px): 햄버거 메뉴
 * - 데스크톱 (>= 768px): 가로 네비게이션
 *
 * 접근성:
 * - ARIA 라벨 (메뉴 버튼, 로고)
 * - 키보드 포커스 스타일
 * - 활성 상태 명시적 표시
 */
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * 네비게이션 메뉴 아이템 설정
 * 새 페이지 추가 시 이 배열에 추가
 */
const navItems = [
  { href: "/", label: "홈" },
  { href: "/events", label: "이벤트" },
  { href: "/performances", label: "공연" },
];

export function SiteHeader() {
  const pathname = usePathname() ?? "/";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const headerClass = "sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm";

  return (
    <header className={headerClass}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 md:px-6">
        <Link
          href="/"
          className="flex items-center gap-3"
          aria-label="Artause 홈"
        >
          <Image
            src="/images/brand/artause-symbol.png"
            alt="Artause logo"
            width={120}
            height={120}
            priority
            className="h-16 w-16 object-contain"
          />
          <span className="hidden sm:block text-xl font-bold text-slate-900">
            Artause
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-3 py-2 transition-all ${
                  isActive ? "text-slate-900 font-semibold" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex flex-col items-center justify-center gap-1.5 rounded-lg p-2.5 transition-colors hover:bg-slate-100 md:hidden focus:outline-none focus:ring-2 focus:ring-slate-300"
          aria-label="메뉴 열기"
          aria-expanded={mobileMenuOpen}
        >
          <span
            className={`h-0.5 w-6 bg-slate-900 transition-all duration-300 ${
              mobileMenuOpen ? "translate-y-2 rotate-45" : ""
            }`}
          />
          <span
            className={`h-0.5 w-6 bg-slate-900 transition-all duration-300 ${
              mobileMenuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`h-0.5 w-6 bg-slate-900 transition-all duration-300 ${
              mobileMenuOpen ? "-translate-y-2 -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm md:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Mobile Menu Panel */}
          <nav className="fixed right-0 top-[65px] z-50 h-[calc(100vh-65px)] w-64 border-l border-slate-200 bg-white shadow-lg md:hidden">
            <div className="flex flex-col gap-2 p-6">
              {navItems.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`rounded-lg px-4 py-3 text-base font-medium transition-all ${
                      isActive
                        ? "bg-slate-900 text-white"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        </>
      )}
    </header>
  );
}
