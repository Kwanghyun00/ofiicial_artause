'use server';

import { redirect } from 'next/navigation';
import { clearPartnerSession, setPartnerSession } from '@/lib/auth/partner-session';

export async function partnerLogout(): Promise<void> {
  await clearPartnerSession();
  redirect('/partner/login');
}

export async function partnerLogin(formData: FormData): Promise<void> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  if (!email || !email.includes('@')) {
    redirect('/partner/login?error=invalid');
  }

  await setPartnerSession(email);
  redirect('/event-center');
}
