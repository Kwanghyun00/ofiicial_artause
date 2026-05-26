"use client"

import { useActionState, useRef } from "react"
import { sendOtp, verifyOtp } from "./actions"
import type { AuthActionState } from "./actions"

const initialState: AuthActionState = {}

export function LoginForm() {
  const [sendState, sendAction, sendPending] = useActionState(sendOtp, initialState)
  const [verifyState, verifyAction, verifyPending] = useActionState(verifyOtp, initialState)

  // 현재 단계: sendState.step === "verify" 이면 코드 입력 단계
  const isVerifyStep = sendState.step === "verify" || verifyState.step === "verify"
  const currentEmail = sendState.email ?? verifyState.email ?? ""
  const errorMsg = verifyState.error ?? sendState.error

  return (
    <div className="rounded-2xl border bg-card p-8 shadow-sm space-y-6">
      {!isVerifyStep ? (
        /* ── Step 1: 이메일 입력 ── */
        <form action={sendAction} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium">
              이메일 주소
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              className="w-full rounded-lg border px-4 py-3 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
              disabled={sendPending}
            />
          </div>

          {sendState.error && (
            <p className="text-sm text-destructive">{sendState.error}</p>
          )}

          <button
            type="submit"
            disabled={sendPending}
            className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
          >
            {sendPending ? "보내는 중…" : "인증 코드 받기"}
          </button>
        </form>
      ) : (
        /* ── Step 2: 코드 입력 ── */
        <form action={verifyAction} className="space-y-4">
          <input type="hidden" name="email" value={currentEmail} />

          <div className="rounded-lg bg-muted px-4 py-3 text-sm">
            <span className="font-medium">{currentEmail}</span> 로 인증 코드를 보냈습니다.
            <br />
            <span className="text-muted-foreground text-xs">스팸 폴더도 확인해 주세요. 코드는 10분간 유효합니다.</span>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="token" className="text-sm font-medium">
              6자리 인증 코드
            </label>
            <input
              id="token"
              name="token"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              autoComplete="one-time-code"
              required
              placeholder="123456"
              className="w-full rounded-lg border px-4 py-3 text-center text-2xl font-bold tracking-[0.5em] outline-none ring-offset-background focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
              disabled={verifyPending}
            />
          </div>

          {errorMsg && (
            <p className="text-sm text-destructive">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={verifyPending}
            className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
          >
            {verifyPending ? "확인 중…" : "로그인"}
          </button>

          {/* 이메일 다시 입력 */}
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="w-full text-center text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            다른 이메일로 시도하기
          </button>
        </form>
      )}
    </div>
  )
}
