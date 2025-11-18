'use server';

import { redirect } from 'next/navigation';
import { setPartnerSession, clearPartnerSession } from '@/lib/auth/partner-session';

type ActionResult =
  | { success: true }
  | { success: false; error: string };

/**
 * 공연 종사자 로그인 (이메일만으로 간단하게)
 */
export async function partnerLogin(email: string): Promise<ActionResult> {
  // 간단한 이메일 형식 검증
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, error: '올바른 이메일 형식이 아닙니다.' };
  }

  // 세션 저장
  await setPartnerSession(email);

  // 성공 시 event-center로 리다이렉트
  redirect('/event-center');
}

/**
 * 공연 종사자 로그아웃
 */
export async function partnerLogout(): Promise<void> {
  await clearPartnerSession();
  redirect('/partner/login');
}
