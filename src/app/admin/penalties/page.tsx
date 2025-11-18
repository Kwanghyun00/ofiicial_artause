/**
 * 관리자 페이지 - 패널티 관리
 *
 * URL: /admin/penalties
 *
 * 관리자가 노쇼 발생 시 패널티를 부여하고, 활성 패널티를 조회하는 페이지
 */

import { ApplyPenaltyForm } from "./ApplyPenaltyForm";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/config";

export const metadata = {
  title: "패널티 관리 | 관리자",
  description: "사용자 패널티 부여 및 관리",
};

export default async function AdminPenaltiesPage() {
  // 활성 패널티 조회
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let activePenalties: any[] = [];

  if (isSupabaseConfigured) {
    try {
      const supabase = await createServerSupabaseClient();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data }: any = await supabase
        .from("user_penalties")
        .select(`
          id,
          penalty_type,
          points,
          reason,
          expires_at,
          created_at,
          users!inner (
            id,
            email,
            trust_score,
            is_restricted
          )
        `)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(50);

      if (data) {
        activePenalties = data;
      }
    } catch (error) {
      console.error("활성 패널티 조회 오류:", error);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 sm:px-8 md:py-16">
      {/* Header */}
      <header className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-red-100 px-4 py-2 mb-4">
          <span className="text-2xl">⚙️</span>
          <span className="text-sm font-bold uppercase tracking-wide text-red-700">Admin</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
          패널티 관리
        </h1>
        <p className="mt-3 text-slate-600">
          노쇼 발생 시 패널티를 부여하고, 활성 패널티를 조회합니다.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* 왼쪽: 패널티 부여 폼 */}
        <section>
          <ApplyPenaltyForm />
        </section>

        {/* 오른쪽: 활성 패널티 목록 */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-xl">
              📋
            </span>
            <div>
              <h2 className="text-xl font-bold text-slate-900">활성 패널티 목록</h2>
              <p className="text-sm text-slate-600">최근 부과된 패널티 ({activePenalties.length}건)</p>
            </div>
          </div>

          {activePenalties.length > 0 ? (
            <div className="max-h-[600px] space-y-3 overflow-y-auto">
              {activePenalties.map((penalty) => (
                <PenaltyCard key={penalty.id} penalty={penalty} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center">
              <p className="text-lg font-medium text-slate-400">활성 패널티가 없습니다</p>
            </div>
          )}
        </section>
      </div>

      {/* 안내 섹션 */}
      <section className="mt-10 rounded-3xl border border-blue-200 bg-blue-50 p-8">
        <h2 className="text-xl font-bold text-slate-900 mb-4">📌 사용 방법</h2>
        <div className="space-y-3 text-sm text-slate-700">
          <div className="flex gap-3">
            <span className="font-bold text-blue-600">1.</span>
            <p>공연 후 파트너로부터 노쇼 명단을 이메일로 받습니다.</p>
          </div>
          <div className="flex gap-3">
            <span className="font-bold text-blue-600">2.</span>
            <p>왼쪽 폼에 노쇼자의 이메일을 입력하고 패널티 유형을 선택합니다.</p>
          </div>
          <div className="flex gap-3">
            <span className="font-bold text-blue-600">3.</span>
            <p>패널티가 부여되면 자동으로 신뢰도 점수가 차감됩니다.</p>
          </div>
          <div className="flex gap-3">
            <span className="font-bold text-blue-600">4.</span>
            <p>60점 미만 사용자는 자동으로 응모가 제한됩니다.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

// 패널티 카드 컴포넌트
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function PenaltyCard({ penalty }: { penalty: any }) {
  const penaltyTypeLabels: Record<string, string> = {
    no_show: "노쇼",
    late_cancel: "3일 이내 취소",
    rule_violation: "규칙 위반",
  };

  const user = penalty.users;
  const expiresAt = new Date(penalty.expires_at);
  const createdAt = new Date(penalty.created_at);

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-bold text-slate-900">{user.email}</span>
            {user.is_restricted && (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
                제한 중
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-red-700">
              {penaltyTypeLabels[penalty.penalty_type]}
            </span>
            <span className="rounded-full bg-red-200 px-2 py-0.5 text-xs font-bold text-red-800">
              -{penalty.points}점
            </span>
            <span className="text-xs text-slate-500">
              → 현재: {user.trust_score}점
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600">{penalty.reason}</p>
          <p className="mt-2 text-xs text-slate-500">
            부과: {createdAt.toLocaleDateString("ko-KR")} |
            만료: {expiresAt.toLocaleDateString("ko-KR")}
          </p>
        </div>
      </div>
    </div>
  );
}
