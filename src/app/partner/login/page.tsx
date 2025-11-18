"use client";

import { useState, useTransition } from "react";
import { partnerLogin } from "./actions";

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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900">공연 종사자 로그인</h1>
          <p className="mt-2 text-sm text-slate-600">
            이벤트를 등록할 때 사용한 이메일을 입력하세요
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
          <div className="space-y-6">
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
