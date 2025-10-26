"use client";

import { useAuth } from "./AuthContext";
import { useRole } from "./RoleContext";

export function RoleGate() {
  const { user, initialized: authInitialized } = useAuth();
  const { role, hasAnswered, setRole, lockedRoleAttempt, clearLockedRoleAttempt } = useRole();

  const showLockedMessage = Boolean(authInitialized && user && lockedRoleAttempt);
  const showChooser = Boolean(authInitialized && !user && !hasAnswered);

  if (!showLockedMessage && !showChooser) {
    return null;
  }

  if (showLockedMessage && user) {
    const attemptingPartner = lockedRoleAttempt === "partner";
    const title = attemptingPartner ? "관객 전용 계정입니다" : "종사자 전용 계정입니다";
    const description = attemptingPartner
      ? "현재 계정은 관객 전용으로 등록되어 있어요. 종사자 기능을 이용하려면 종사자 계정을 새로 만들어 주세요."
      : "현재 계정은 종사자 전용입니다. 관객 화면은 관객 전용 계정으로만 확인할 수 있어요.";

    return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/80 backdrop-blur">
        <div className="mx-4 max-w-lg space-y-5 rounded-3xl bg-white p-8 text-slate-900 shadow-2xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">역할 안내</p>
          <h2 className="text-2xl font-semibold">{title}</h2>
          <p className="text-sm text-slate-600">{description}</p>
          <button
            type="button"
            onClick={clearLockedRoleAttempt}
            className="btn-primary w-full md:w-auto"
          >
            확인했습니다
          </button>
        </div>
      </div>
    );
  }

  const selectRole = (nextRole: "audience" | "partner") => {
    setRole(nextRole);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/80 backdrop-blur">
      <div className="mx-4 max-w-lg space-y-6 rounded-3xl bg-white p-8 text-slate-900 shadow-2xl">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">Artause Onboarding</p>
          <h2 className="text-2xl font-semibold">어떤 화면을 보고 싶으신가요?</h2>
          <p className="text-sm text-slate-600">
            관객 화면은 공연 추천과 이벤트 참여를 위한 Bloom UI, 종사자 화면은 운영 효율을 위한 Slate UI입니다.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <button
            type="button"
            onClick={() => selectRole("audience")}
            className={`rounded-2xl border px-5 py-6 text-left transition focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              role === "audience"
                ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow"
                : "border-slate-200 bg-white hover:border-indigo-200 hover:shadow"
            }`}
          >
            <span className="text-sm font-semibold">관객용 Bloom UI</span>
            <p className="mt-2 text-xs text-slate-500">추천 공연, 이벤트 응모, 커뮤니티 소식을 빠르게 받아보세요.</p>
          </button>
          <button
            type="button"
            onClick={() => selectRole("partner")}
            className={`rounded-2xl border px-5 py-6 text-left transition focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
              role === "partner"
                ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow"
                : "border-slate-200 bg-white hover:border-emerald-200 hover:shadow"
            }`}
          >
            <span className="text-sm font-semibold">종사자용 Slate UI</span>
            <p className="mt-2 text-xs text-slate-500">초대권 운영, 홍보 캠페인, 위젯 관리 기능을 체험해 보세요.</p>
          </button>
        </div>
        <p className="text-xs text-slate-400">언제든 헤더의 ‘관객/종사자’ 버튼으로 다시 선택할 수 있습니다.</p>
      </div>
    </div>
  );
}
