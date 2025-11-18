"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { applyPenaltyByEmail, type ApplyPenaltyFormState } from "./actions";

const initialState: ApplyPenaltyFormState = {
  status: "idle",
};

export function ApplyPenaltyForm() {
  const [state, formAction] = useActionState(applyPenaltyByEmail, initialState);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-xl">
          ⚠️
        </span>
        <div>
          <h2 className="text-xl font-bold text-slate-900">패널티 부여</h2>
          <p className="text-sm text-slate-600">노쇼 발생 시 사용자에게 패널티를 부여합니다</p>
        </div>
      </div>

      <form action={formAction} className="space-y-4">
        {/* 이메일 입력 */}
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
            사용자 이메일 <span className="text-red-600">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            placeholder="user@example.com"
            className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-100"
          />
        </div>

        {/* 패널티 유형 선택 */}
        <div>
          <label htmlFor="penaltyType" className="block text-sm font-semibold text-slate-700 mb-2">
            패널티 유형 <span className="text-red-600">*</span>
          </label>
          <select
            id="penaltyType"
            name="penaltyType"
            required
            defaultValue=""
            className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-100"
          >
            <option value="" disabled>
              선택하세요
            </option>
            <option value="no_show">노쇼 (No-Show) - 기본 20점 차감</option>
            <option value="late_cancel">3일 이내 취소 - 기본 10점 차감</option>
            <option value="rule_violation">규칙 위반 - 기본 15점 차감</option>
          </select>
        </div>

        {/* 점수 (선택) */}
        <div>
          <label htmlFor="points" className="block text-sm font-semibold text-slate-700 mb-2">
            차감 점수 (선택)
          </label>
          <input
            type="number"
            id="points"
            name="points"
            min="1"
            max="100"
            placeholder="기본값 사용 (유형별 자동)"
            className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-100"
          />
          <p className="mt-1 text-xs text-slate-500">비워두면 패널티 유형별 기본값이 적용됩니다</p>
        </div>

        {/* 사유 (선택) */}
        <div>
          <label htmlFor="reason" className="block text-sm font-semibold text-slate-700 mb-2">
            사유 (선택)
          </label>
          <textarea
            id="reason"
            name="reason"
            rows={3}
            placeholder="예: 2025-01-15 공연 노쇼 확인"
            className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-100"
          />
        </div>

        {/* 상태 메시지 */}
        {state.status === "error" && state.message && (
          <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-900">❌ {state.message}</p>
          </div>
        )}

        {state.status === "success" && state.message && (
          <div className="rounded-2xl border-2 border-green-200 bg-green-50 p-4">
            <p className="text-sm font-semibold text-green-900">✅ {state.message}</p>
          </div>
        )}

        {/* 제출 버튼 */}
        <SubmitButton />
      </form>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-2xl bg-red-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-red-700 disabled:bg-slate-300 disabled:text-slate-500"
    >
      {pending ? "처리 중..." : "패널티 부여"}
    </button>
  );
}
