'use server';

import { redirect } from 'next/navigation';
import { clearPartnerSession, setPartnerSession } from '@/lib/auth/partner-session';

export async function partnerLogout(): Promise<void> {
  await clearPartnerSession();
  redirect('/partner/login');
}

export async function partnerLogin(formData: FormData): Promise<void> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const inviteCode = String(formData.get('inviteCode') ?? '').trim();

  if (!email || !email.includes('@')) {
    redirect('/partner/login?error=invalid_email');
  }

  // 초대 코드 검증 — 환경변수로 관리 (미설정 시 개발 편의를 위해 통과)
  const validCode = process.env.PARTNER_INVITE_CODE;
  if (validCode && inviteCode !== validCode) {
    redirect('/partner/login?error=invalid_code');
  }

  await setPartnerSession(email);
  redirect('/event-center');
}
