"use client";

import { useState } from "react";
import { useAuth } from "./AuthContext";
import { useRole } from "./RoleContext";

const accessHighlights = [
  "카카오 로그인만 지원 (email, 비밀번호 미사용)",
  "Intro-first: 스크롤 60% 또는 체류 5초 충족 시 24시간 통과",
  "AdGate: utm_campaign 필수 + 파트너 도메인 화이트리스트",
  "가중치 추첨: 기본 1.0~최대 4.0, 신규 30일 +0.3 보정",
];

const domainSummary = [
  { label: "관객", value: "www.domain.com", note: "B2C Bloom" },
  { label: "파트너", value: "partner.domain.com", note: "Slate 콘솔" },
  { label: "관리자", value: "admin.domain.com", note: "단일 계정 + 2FA" },
];

export function AuthGate() {
  const { user, initialized, loginWithKakao, kakaoCandidates } = useAuth();
  const { setRole, resetChoice } = useRole();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!initialized || user) {
    return null;
  }

  const handleKakaoLogin = async (kakaoId: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await loginWithKakao(kakaoId);
      if (!result.success || !result.user) {
        setError(result.error ?? "카카오 로그인에 실패했습니다.");
        return;
      }
      resetChoice();
      setRole(result.user.role);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/90 backdrop-blur">
      <div className="mx-4 w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl">
        <div className="grid gap-0 md:grid-cols-[1.1fr,0.9fr]">
          <section className="space-y-6 bg-white p-8 md:p-10">
            <div className="space-y-3">
              <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                Artause Access Policy
              </span>
              <h2 className="text-2xl font-semibold text-slate-900">카카오 전용 로그인</h2>
              <p className="text-sm text-slate-600">
                관객·파트너·관리자 전 구간은 카카오 ID 화이트리스트 기반으로 운영됩니다. 이메일/비밀번호 회원제는 비활성화되었으며, Intro-first → AdGate → 응모 → 가중치 추첨 순으로 퍼널이 이어집니다.
              </p>
            </div>

            <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              {domainSummary.map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.label}</p>
                    <p className="text-sm font-semibold text-slate-800">{item.value}</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-500">{item.note}</span>
                </div>
              ))}
            </div>

            <ul className="space-y-2 text-sm text-slate-600">
              {accessHighlights.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-indigo-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            {error ? <p className="text-xs text-rose-500">{error}</p> : null}
          </section>

          <section className="space-y-5 bg-slate-950/80 p-8 text-white md:p-10">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-white/60">Choose Kakao ID</p>
              <h3 className="text-lg font-semibold">화이트리스트 계정</h3>
              <p className="text-xs text-white/70">테스트 환경용으로 미리 등록된 카카오 프로필을 선택해 로그인하세요.</p>
            </div>

            <div className="space-y-3">
              {kakaoCandidates.map((candidate) => (
                <button
                  key={candidate.id}
                  type="button"
                  disabled={loading}
                  onClick={() => handleKakaoLogin(candidate.kakaoId ?? "")}
                  className="flex w-full items-center justify-between rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-left transition hover:border-emerald-300/40 hover:bg-white/20"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">{candidate.name}</p>
                    <p className="text-xs text-white/70">
                      {candidate.role === "audience" ? "관객 Bloom" : candidate.organization ?? "Slate"}
                    </p>
                  </div>
                  <span className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/80">카카오 ID</span>
                </button>
              ))}
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 text-xs text-white/70">
              <p className="font-semibold text-white/80">운영 체크리스트</p>
              <ul className="mt-2 space-y-1">
                <li>관리자 계정은 Kakao ID 화이트리스트 + TOTP 2FA 필수</li>
                <li>조용한 시간대(22:00~08:00 KST)에는 마케팅 알림 발송 제한</li>
                <li>Intro-first·AdGate 조건을 충족하지 못하면 /apply 에서 412 응답</li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => setError("카카오 계정이 보이지 않는다면 PM에게 화이트리스트 등록을 요청하세요.")}
              className="text-xs font-medium text-emerald-200 hover:text-emerald-100"
            >
              화이트리스트 문의 안내 보기
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
