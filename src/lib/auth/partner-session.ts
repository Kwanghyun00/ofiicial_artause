'use server';

import { cookies } from 'next/headers';

const PARTNER_SESSION_COOKIE = 'partner_email';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7일

/**
 * 공연 종사자 세션을 저장합니다 (이메일 기반)
 */
export async function setPartnerSession(email: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(PARTNER_SESSION_COOKIE, email, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
}

/**
 * 현재 로그인한 공연 종사자의 이메일을 가져옵니다
 */
export async function getPartnerSession(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(PARTNER_SESSION_COOKIE)?.value ?? null;
}

/**
 * 공연 종사자 세션을 삭제합니다
 */
export async function clearPartnerSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(PARTNER_SESSION_COOKIE);
}

/**
 * 로그인 여부를 확인합니다
 */
export async function isPartnerLoggedIn(): Promise<boolean> {
  const email = await getPartnerSession();
  return email !== null;
}
