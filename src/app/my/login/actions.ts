"use server"

import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/config"

export type AuthActionState = {
  error?: string
  success?: string
  step?: "verify"
  email?: string
}

/** Step 1: 이메일로 OTP 발송 */
export async function sendOtp(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  if (!isSupabaseConfigured) {
    return { error: "로그인 기능을 사용하려면 Supabase 연결이 필요합니다." }
  }

  const email = (formData.get("email") as string | null)?.trim().toLowerCase()
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "올바른 이메일 주소를 입력해 주세요." }
  }

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  })

  if (error) {
    console.error("[sendOtp]", error.message)
    return { error: "인증 코드를 보내지 못했습니다. 잠시 후 다시 시도해 주세요." }
  }

  return { step: "verify", email, success: `${email} 로 6자리 인증 코드를 보냈습니다.` }
}

/** Step 2: OTP 코드 검증 → 세션 생성 후 /my 로 이동 */
export async function verifyOtp(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  if (!isSupabaseConfigured) {
    return { error: "로그인 기능을 사용하려면 Supabase 연결이 필요합니다." }
  }

  const email = (formData.get("email") as string | null)?.trim().toLowerCase()
  const token = (formData.get("token") as string | null)?.trim().replace(/\s/g, "")

  if (!email || !token || token.length < 6) {
    return { error: "이메일과 6자리 인증 코드를 모두 입력해 주세요.", step: "verify", email: email ?? "" }
  }

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.auth.verifyOtp({ email, token, type: "email" })

  if (error) {
    console.error("[verifyOtp]", error.message)
    return { error: "인증 코드가 올바르지 않거나 만료되었습니다. 다시 시도해 주세요.", step: "verify", email }
  }

  redirect("/my")
}

/** 로그아웃 */
export async function signOut(): Promise<void> {
  if (!isSupabaseConfigured) {
    redirect("/")
  }

  const supabase = await createServerSupabaseClient()
  await supabase.auth.signOut()
  redirect("/")
}
