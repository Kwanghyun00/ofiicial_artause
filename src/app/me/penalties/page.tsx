/**
 * 마이페이지 - 패널티 내역
 *
 * URL: /me/penalties
 *
 * 사용자가 본인의 신뢰도 점수, 패널티 내역, 제한 상태를 확인하는 페이지
 */

import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/config";

export const metadata = {
  title: "내 패널티 내역 | Artause",
  description: "신뢰도 점수 및 패널티 내역 확인",
};

// Mock 데이터
const mockUser = {
  email: "user@example.com",
  trust_score: 100,
  is_restricted: false,
  restriction_reason: null,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockPenalties: any[] = [
  // 패널티가 없는 상태
];

export default async function PenaltiesPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const params = await searchParams;
  const email = params.email;

  // 이메일이 없으면 안내 표시
  if (!email) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-12 sm:px-8 md:py-16">
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center">
          <span className="text-6xl">🔐</span>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">로그인이 필요합니다</h1>
          <p className="mt-3 text-slate-600">
            패널티 내역을 확인하려면 응모 시 사용한 이메일을 입력해주세요.
          </p>
          <form method="GET" className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <input
              type="email"
              name="email"
              placeholder="your@email.com"
              required
              className="rounded-2xl border border-slate-200 px-4 py-3 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
            <button
              type="submit"
              className="rounded-2xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700"
            >
              확인하기
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 사용자 정보 및 패널티 조회
  let user = mockUser;
  let penalties = mockPenalties;

  if (isSupabaseConfigured) {
    try {
      const supabase = await createServerSupabaseClient();

      // 사용자 조회
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: userData }: any = (await supabase
        .from("users")
        .select("email, trust_score, is_restricted, restriction_reason")
        .eq("email", email.trim().toLowerCase())
        .maybeSingle());

      if (userData) {
        user = userData;

        // 패널티 조회 (만료되지 않은 것 + 최근 만료된 것)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: penaltiesData }: any = (await supabase
          .from("user_penalties")
          .select(`
            id,
            penalty_type,
            points,
            reason,
            expires_at,
            created_at
          `)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .eq("user_id", (userData as any).id)
          .order("created_at", { ascending: false })
          .limit(20));

        if (penaltiesData) {
          penalties = penaltiesData;
        }
      } else {
        // 사용자가 없으면 신규 사용자
        user = {
          email,
          trust_score: 100,
          is_restricted: false,
          restriction_reason: null,
        };
      }
    } catch (error) {
      console.error("패널티 조회 오류:", error);
    }
  }

  const activePenalties = penalties.filter((p) => new Date(p.expires_at) > new Date());
  const expiredPenalties = penalties.filter((p) => new Date(p.expires_at) <= new Date());

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 sm:px-8 md:py-16">
      {/* Header */}
      <header className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-2 mb-4">
          <span className="text-2xl">👤</span>
          <span className="text-sm font-bold uppercase tracking-wide text-purple-700">My Page</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
          내 신뢰도 점수 & 패널티
        </h1>
        <p className="mt-3 text-slate-600">{user.email}</p>
      </header>

      <div className="space-y-6">
        {/* Trust Score Card */}
        <section className="rounded-3xl border-2 border-slate-200 bg-gradient-to-br from-white to-slate-50 p-8 shadow-lg">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="text-center sm:text-left">
              <h2 className="text-lg font-semibold text-slate-700">신뢰도 점수</h2>
              <p className="mt-1 text-6xl font-bold text-indigo-600">{user.trust_score}</p>
              <p className="mt-2 text-sm text-slate-600">만점: 100점</p>
            </div>

            <div className="flex flex-col gap-3">
              {user.is_restricted ? (
                <div className="rounded-2xl border-2 border-red-300 bg-red-50 px-6 py-4 text-center">
                  <p className="text-sm font-bold text-red-900">🚫 응모 제한 중</p>
                  <p className="mt-1 text-xs text-red-700">{user.restriction_reason}</p>
                </div>
              ) : user.trust_score < 60 ? (
                <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 px-6 py-4 text-center">
                  <p className="text-sm font-bold text-amber-900">⚠️ 주의</p>
                  <p className="mt-1 text-xs text-amber-700">60점 미만 시 응모 제한됩니다</p>
                </div>
              ) : (
                <div className="rounded-2xl border-2 border-green-300 bg-green-50 px-6 py-4 text-center">
                  <p className="text-sm font-bold text-green-900">✅ 정상</p>
                  <p className="mt-1 text-xs text-green-700">응모 가능합니다</p>
                </div>
              )}

              <Link
                href="/rules#penalty"
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300"
              >
                점수 시스템 안내
                <span>→</span>
              </Link>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="h-4 overflow-hidden rounded-full bg-slate-200">
              <div
                className={`h-full transition-all ${
                  user.trust_score >= 80
                    ? "bg-green-500"
                    : user.trust_score >= 60
                    ? "bg-amber-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${user.trust_score}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-slate-500">
              <span>0</span>
              <span className="font-semibold">60점 (제한 기준)</span>
              <span>100</span>
            </div>
          </div>
        </section>

        {/* Active Penalties */}
        <section className="rounded-3xl border border-red-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-xl">
              🚨
            </span>
            <div>
              <h2 className="text-xl font-bold text-slate-900">활성 패널티</h2>
              <p className="text-sm text-slate-600">현재 적용 중인 패널티 ({activePenalties.length}건)</p>
            </div>
          </div>

          {activePenalties.length > 0 ? (
            <div className="space-y-3">
              {activePenalties.map((penalty) => (
                <PenaltyCard key={penalty.id} penalty={penalty} isActive />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center">
              <p className="text-lg font-medium text-slate-400">활성 패널티가 없습니다</p>
              <p className="mt-2 text-sm text-slate-500">계속해서 모범적인 참여 부탁드립니다!</p>
            </div>
          )}
        </section>

        {/* Expired Penalties */}
        {expiredPenalties.length > 0 && (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-xl">
                📋
              </span>
              <div>
                <h2 className="text-xl font-bold text-slate-900">만료된 패널티</h2>
                <p className="text-sm text-slate-600">6개월이 지나 만료된 패널티</p>
              </div>
            </div>

            <div className="space-y-3">
              {expiredPenalties.slice(0, 5).map((penalty) => (
                <PenaltyCard key={penalty.id} penalty={penalty} isActive={false} />
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-8 text-center">
          <h2 className="text-xl font-bold text-slate-900">신뢰도 점수를 높이세요!</h2>
          <p className="mt-2 text-slate-600">
            정상적으로 공연에 참석하면 <strong className="text-green-600">+5점</strong> 보너스를 받습니다.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/events"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 font-semibold text-white shadow-md hover:scale-105"
            >
              진행 중인 이벤트 보기
              <span>→</span>
            </Link>
            <Link
              href="/rules"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-indigo-200 bg-white px-6 py-3 font-semibold text-indigo-700 hover:bg-indigo-50"
            >
              이용 규칙 확인
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

// 패널티 카드 컴포넌트
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function PenaltyCard({ penalty, isActive }: { penalty: any; isActive: boolean }) {
  const penaltyTypeLabels: Record<string, string> = {
    no_show: "노쇼 (No-Show)",
    late_cancel: "3일 이내 취소",
    rule_violation: "규칙 위반",
  };

  const expiresAt = new Date(penalty.expires_at);
  const createdAt = new Date(penalty.created_at);
  // eslint-disable-next-line react-hooks/purity
  const daysUntilExpiry = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <div
      className={`rounded-2xl border p-4 ${
        isActive ? "border-red-200 bg-red-50" : "border-slate-200 bg-slate-50"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={`font-bold ${isActive ? "text-red-900" : "text-slate-700"}`}>
              {penaltyTypeLabels[penalty.penalty_type] || penalty.penalty_type}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                isActive ? "bg-red-200 text-red-800" : "bg-slate-200 text-slate-600"
              }`}
            >
              -{penalty.points}점
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600">{penalty.reason}</p>
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
            <span>부과일: {createdAt.toLocaleDateString("ko-KR")}</span>
            <span>•</span>
            <span>만료일: {expiresAt.toLocaleDateString("ko-KR")}</span>
          </div>
        </div>

        {isActive && daysUntilExpiry > 0 && (
          <div className="shrink-0 text-right">
            <p className="text-xs text-slate-500">만료까지</p>
            <p className="text-lg font-bold text-red-600">{daysUntilExpiry}일</p>
          </div>
        )}
      </div>
    </div>
  );
}
