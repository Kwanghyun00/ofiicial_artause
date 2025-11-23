/**
 * SiteHeader 컴포넌트
 *
 * 한국적 미감의 상단 헤더 네비게이션
 * - 로고 아이콘만 표시 (텍스트 제거)
 * - 딥 네이비 (#293380) 기반 메뉴 스타일
 * - 활성 메뉴는 밑줄 + 볼드로 표시
 * - 균일한 메뉴 간격
 */
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

// 디자인 토큰
const colors = {
  navy: "#293380",
  navyLight: "#3d4a9e",
  text: "#1a1a2e",
  textMuted: "#6B6560",
  border: "#E8E3DC",
  background: "#FFFFFF",
};

const navItems = [
  { href: "/", label: "홈" },
  { href: "/events", label: "이벤트" },
  { href: "/performances", label: "공연" },
];

export function SiteHeader() {
  const pathname = usePathname() ?? "/";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-50 border-b shadow-sm"
      style={{ borderColor: colors.border, backgroundColor: colors.background }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        {/* 로고 - 아이콘만 */}
        <Link
          href="/"
          className="flex items-center transition-opacity hover:opacity-80"
          aria-label="Artause 홈"
        >
          <Image
            src="/images/brand/artause-symbol.png"
            alt="Artause"
            width={100}
            height={100}
            priority
            className="h-12 w-12 object-contain"
          />
        </Link>

        {/* Desktop Navigation - 균일한 간격 */}
        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative px-1 py-2 text-sm transition-all"
                style={{
                  color: isActive ? colors.navy : colors.textMuted,
                  fontWeight: isActive ? 700 : 500,
                }}
              >
                {item.label}
                {isActive && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                    style={{ backgroundColor: colors.navy }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex flex-col items-center justify-center gap-1 rounded-lg p-2 transition-colors md:hidden"
          style={{ backgroundColor: mobileMenuOpen ? "#f3f4f6" : "transparent" }}
          aria-label={mobileMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={mobileMenuOpen}
        >
          <span
            className="h-0.5 w-5 transition-all duration-200"
            style={{
              backgroundColor: colors.navy,
              transform: mobileMenuOpen ? "translateY(6px) rotate(45deg)" : "none",
            }}
          />
          <span
            className="h-0.5 w-5 transition-all duration-200"
            style={{
              backgroundColor: colors.navy,
              opacity: mobileMenuOpen ? 0 : 1,
            }}
          />
          <span
            className="h-0.5 w-5 transition-all duration-200"
            style={{
              backgroundColor: colors.navy,
              transform: mobileMenuOpen ? "translateY(-6px) rotate(-45deg)" : "none",
            }}
          />
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm md:hidden"
            style={{ top: "57px" }}
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Menu Panel */}
          <nav
            className="fixed right-0 z-50 h-[calc(100vh-57px)] w-56 border-l shadow-lg md:hidden"
            style={{
              top: "57px",
              borderColor: colors.border,
              backgroundColor: colors.background,
            }}
          >
            <div className="flex flex-col gap-1 p-4">
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
                    className="rounded-xl px-4 py-3 text-sm transition-all"
                    style={{
                      backgroundColor: isActive ? colors.navy : "transparent",
                      color: isActive ? "#fff" : colors.text,
                      fontWeight: isActive ? 700 : 500,
                    }}
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
