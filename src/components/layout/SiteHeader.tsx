"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthContext";
import { useRole } from "./RoleContext";

const audienceNav = [
  { href: "/", label: "홈" },
  { href: "/shows", label: "공연·전시" },
  { href: "/events", label: "초대권 이벤트" },
  { href: "/community", label: "커뮤니티" },
  { href: "/company", label: "회사 소개" },
];

const partnerNav = [
  { href: "/partners", label: "제휴 안내" },
  { href: "/request/promotion", label: "프로모션 문의" },
];

export function SiteHeader() {
  const pathname = usePathname() ?? "/";
  const { user, logout } = useAuth();
  const { role, setRole, resetChoice } = useRole();

  const isPartnerView = role === "partner";
  const navItems = isPartnerView ? partnerNav : audienceNav;
  const canSwitchRole = !user;

  const headerClass = isPartnerView
    ? "sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 text-white backdrop-blur"
    : "sticky top-0 z-50 border-b border-white/30 bg-white/80 text-slate-900 backdrop-blur-xl";

  const handleRoleChange = (nextRole: "audience" | "partner") => {
    if (!canSwitchRole || nextRole === role) return;
    setRole(nextRole);
  };

  const handleLogout = () => {
    logout();
    resetChoice();
  };

  const brandTitle = "Artause";
  const brandSubtitle = isPartnerView ? "제휴 운영 콘솔" : "오프라인 문화예술 인사이트";
  const roleBadge = user?.role === "partner" ? "파트너 계정" : "관객 전용";

  return (
    <header className={headerClass}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-6">
        <Link href="/" className="flex items-center gap-3">
          <div
            className={`relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border ${
              isPartnerView ? "border-emerald-300/70 bg-emerald-400/20" : "border-indigo-200 bg-white"
            }`}
            aria-label="Artause symbol"
          >
            <Image
              src="/images/brand/artause-symbol.png"
              alt="Artause symbol"
              width={40}
              height={40}
              priority
              className="h-10 w-10 object-contain"
              sizes="40px"
            />
          </div>
          <div className="leading-tight">
            <span className="text-lg font-semibold">{brandTitle}</span>
            <p className="text-xs opacity-70">{brandSubtitle}</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          {navItems.map((item) => {
            const isAnchor = item.href.includes("#");
            const isActive = isAnchor
              ? pathname.startsWith("/partner")
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            const baseClass = isPartnerView ? "hover:text-emerald-300" : "hover:text-indigo-600";
            const activeClass = isPartnerView ? "text-emerald-300" : "text-indigo-600";
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${baseClass} ${isActive ? activeClass : "opacity-80"}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
              <div
                className={`flex items-center gap-3 rounded-2xl border px-3 py-2 text-xs backdrop-blur md:text-sm ${
                  isPartnerView ? "border-white/10 bg-white/5 text-white/80" : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                <div className={`flex h-9 w-9 items-center justify-center rounded-full text-white ${user.avatarColor}`}>
                  {user.name.charAt(0)}
                </div>
                <div className="leading-tight">
                  <p className={`text-sm font-semibold ${isPartnerView ? "text-white" : "text-slate-900"}`}>{user.name}</p>
                  <p className="text-[11px] opacity-70">
                    {user.tier} · {user.role === "partner" ? user.organization ?? "파트너" : "관객"}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs ${
                    isPartnerView ? "border-white/20 text-white/70" : "border-slate-200 text-slate-500"
                  }`}
                >
                  {roleBadge}
                </span>
                {user.role === "audience" ? (
                  <Link
                    href="/me"
                    className={`rounded-full px-3 py-1 text-xs transition ${
                      isPartnerView
                        ? "border-white/20 text-white/80 hover:border-white/40 hover:text-white"
                        : "border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-900"
                    }`}
                  >
                    내 신청 내역
                  </Link>
                ) : (
                  <Link
                    href="/partner"
                    className={`rounded-full px-3 py-1 text-xs transition ${
                      isPartnerView
                        ? "border-white/20 text-white/80 hover:border-white/40 hover:text-white"
                        : "border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-900"
                    }`}
                  >
                    파트너 콘솔
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className={`rounded-full px-3 py-1 text-xs transition ${
                    isPartnerView
                      ? "border-white/20 text-white/80 hover:border-white/40 hover:text-white"
                      : "border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-900"
                  }`}
                >
                  로그아웃
                </button>
              </div>
          ) : (
            <div className="flex items-center gap-2 text-xs font-medium">
              <span className="opacity-60">화면 선택</span>
              <button
                type="button"
                onClick={() => handleRoleChange("audience")}
                className={`rounded-full px-3 py-1 ${
                  !isPartnerView
                    ? "bg-indigo-600 text-white"
                    : "border border-white/30 text-white/80"
                }`}
              >
                관객
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange("partner")}
                className={`rounded-full px-3 py-1 ${
                  isPartnerView ? "bg-emerald-400 text-slate-950" : "border border-slate-200 text-slate-600"
                }`}
              >
                파트너
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          {canSwitchRole ? (
            <button
              type="button"
              onClick={() => handleRoleChange(isPartnerView ? "audience" : "partner")}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                isPartnerView ? "bg-emerald-400 text-slate-950" : "bg-indigo-600 text-white"
              }`}
            >
              {isPartnerView ? "Audience" : "Partner"}
            </button>
          ) : (
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">{roleBadge}</span>
          )}
          {user ? (
            <>
              {user.role === "audience" ? (
                <Link
                  href="/me"
                  className={`rounded-full px-3 py-1 text-xs transition ${
                    isPartnerView
                      ? "border-white/40 text-white/80 hover:border-white/70"
                      : "border-slate-200 text-slate-600 hover:border-slate-400"
                  }`}
                >
                  내 신청 내역
                </Link>
              ) : (
                <Link
                  href="/partner"
                  className={`rounded-full px-3 py-1 text-xs transition ${
                    isPartnerView
                      ? "border-white/40 text-white/80 hover:border-white/70"
                      : "border-slate-200 text-slate-600 hover:border-slate-400"
                  }`}
                >
                  파트너 콘솔
                </Link>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className={`rounded-full px-3 py-1 text-xs transition ${
                  isPartnerView
                    ? "border-white/40 text-white/80 hover:border-white/70"
                    : "border-slate-200 text-slate-600 hover:border-slate-400"
                }`}
              >
                로그아웃
              </button>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
