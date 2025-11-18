"use client";

import { useState, useTransition } from "react";
import { partnerLogin } from "./actions";
import { PlatformFeaturesSection } from "@/components/common/PlatformFeaturesSection";

export default function PartnerLoginPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("이메일을 입력해 주세요.");
      return;
    }

    startTransition(async () => {
      const result = await partnerLogin(email.trim());
      if (!result.success) {
        setError(result.error);
      }
      // 성공 시 자동으로 리다이렉트됨
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 py-16 px-6 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDEzNGgxMnYxMkgzNnptMjQgMGgxMnYxMkg2MHpNMTIgMTEwaDEydjEySDE2em0yNCAwaDEydjEySDM2em0yNCAwaDEydjEySDYwem0yNCAwaDEydjEySDg0em0wIDI0aDEydjEySDg0em0wIDI0aDEydjEySDg0eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        <div className="relative mx-auto max-w-6xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm mb-6">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <p className="text-xs font-medium uppercase tracking-wider">Partner Portal</p>
          </div>
          <h1 className="text-4xl font-bold md:text-5xl lg:text-6xl">공연 종사자 로그인</h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-white/90 md:text-xl">
            초대권 이벤트로 더 많은 관객을 만나세요
          </p>
        </div>
      </section>

      {/* Platform Features */}
      <div className="mx-auto max-w-6xl px-6 py-16">
        <PlatformFeaturesSection />
      </div>

      {/* Login Form */}
      <div className="mx-auto max-w-md px-6 pb-16">
        <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">로그인</h2>
              <p className="mt-2 text-sm text-slate-600">
                이벤트를 등록할 때 사용한 이메일을 입력하세요
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold text-slate-900">
                이메일 주소
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="partner@example.com"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                disabled={isPending}
                autoFocus
              />
            </div>

            {error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isPending}
              className="btn-primary w-full disabled:opacity-50"
            >
              {isPending ? "로그인 중..." : "로그인"}
            </button>

            <div className="rounded-2xl bg-slate-50 p-4 text-xs text-slate-600">
              <p className="font-semibold mb-1">💡 안내</p>
              <p>
                이벤트를 등록할 때 입력한 담당자 이메일을 사용하세요.
                해당 이메일로 등록한 이벤트의 응모자/당첨자 명단만 확인할 수 있습니다.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
