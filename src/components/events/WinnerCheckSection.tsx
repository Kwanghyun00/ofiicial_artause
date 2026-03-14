"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { checkWinnerStatusAction, type WinnerStatus } from "@/app/events/[slug]/actions"
import { CheckCircle2, Clock, XCircle, Search } from "lucide-react"
import Link from "next/link"

type Props = {
  campaignId: string
  performanceId?: string | null
  hasWinnersSelected: boolean
}

const initialState: WinnerStatus = { found: false, message: "" }

function checkAction(campaignId: string) {
  return async (_prev: WinnerStatus, formData: FormData): Promise<WinnerStatus> => {
    const email = formData.get("email")
    if (typeof email !== "string") return { found: false, message: "이메일을 입력해 주세요." }
    return checkWinnerStatusAction(campaignId, email)
  }
}

export function WinnerCheckSection({ campaignId, performanceId, hasWinnersSelected }: Props) {
  const [state, formAction] = useActionState(checkAction(campaignId), initialState)

  return (
    <section className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-6">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">당첨 확인</p>
        <h3 className="text-lg font-semibold text-slate-900">응모 결과 조회</h3>
        {!hasWinnersSelected && (
          <p className="flex items-center gap-1.5 text-xs text-amber-700">
            <Clock className="h-3.5 w-3.5" />
            아직 추첨 전입니다. 응모 기간 마감 후 결과를 이메일로 안내드립니다.
          </p>
        )}
      </div>

      <form action={formAction} className="flex gap-2">
        <input
          type="email"
          name="email"
          required
          placeholder="응모 시 입력한 이메일"
          className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        />
        <CheckButton />
      </form>

      {state.message && (
        <ResultBadge state={state} performanceId={performanceId} />
      )}
    </section>
  )
}

function CheckButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-1.5 rounded-2xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
    >
      <Search className="h-4 w-4" />
      {pending ? "조회 중..." : "확인"}
    </button>
  )
}

function ResultBadge({ state, performanceId }: { state: WinnerStatus; performanceId?: string | null }) {
  if (!state.found) {
    return (
      <div className="flex items-start gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
        <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
        <p>{state.message}</p>
      </div>
    )
  }

  const isWinner = state.status === "selected"
  const isPending = state.status === "pending"

  if (isPending) {
    return (
      <div className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
        <p>{state.message}</p>
      </div>
    )
  }

  if (isWinner) {
    const isCheckedIn = state.attendanceStatus === "checked_in"
    return (
      <div className="space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
        <div className="flex items-start gap-2 text-sm text-emerald-800">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <p className="font-semibold">{state.message}</p>
        </div>
        {isCheckedIn && performanceId && (
          <Link
            href={`/reviews?performance=${performanceId}`}
            className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
          >
            공연 후기 남기기 →
          </Link>
        )}
      </div>
    )
  }

  // not_selected
  return (
    <div className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
      <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
      <p>{state.message}</p>
    </div>
  )
}
