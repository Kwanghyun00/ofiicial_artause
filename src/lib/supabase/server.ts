import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

function getSupabaseCredentials() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Missing Supabase environment variables");
  }

  return { url, anonKey };
}

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = getSupabaseCredentials();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        cookieStore.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        cookieStore.set({ name, value: "", ...options });
      },
    },
  });
}

function createStatelessSupabaseClient(key: string) {
  const { url } = getSupabaseCredentials();

  return createClient<Database>(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

export function createPublicSupabaseClient() {
  const { anonKey } = getSupabaseCredentials();
  return createStatelessSupabaseClient(anonKey);
}

export function createAdminSupabaseClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error("Missing Supabase admin environment variables");
  }

  return createStatelessSupabaseClient(serviceRoleKey);
}

export function createReadOnlySupabaseClient() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createAdminSupabaseClient()
    : createPublicSupabaseClient();
}
