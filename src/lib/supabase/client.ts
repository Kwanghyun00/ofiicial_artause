import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types';

declare global {
  interface Window {
    __supabaseClient?: ReturnType<typeof createBrowserClient<Database>>;
  }
}

export function createSupabaseClient() {
  if (typeof window === 'undefined') {
    throw new Error('createSupabaseClient must be called on the client');
  }

  if (!window.__supabaseClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
      throw new Error('Supabase client requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
    }

    window.__supabaseClient = createBrowserClient<Database>(url, anonKey);
  }

  return window.__supabaseClient;
}
