"use server"

import { revalidatePath } from "next/cache"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/config"

export type BookmarkResult = {
  bookmarked?: boolean
  error?: string
}

export type BookmarkRow = {
  id: string
  created_at: string
  performances: {
    id: string
    title: string
    slug: string | null
    poster_url: string | null
    category: string | null
    status: string | null
    period_start: string | null
    period_end: string | null
    venue: string | null
  } | null
}

// bookmarks 테이블은 로컬 마이그레이션(20260329000300_add_bookmarks.sql)에 정의되어 있습니다.
// Supabase 프로젝트에 마이그레이션을 적용한 후 아래 명령으로 타입을 재생성하면 any 캐스팅을 제거할 수 있습니다:
//   npx supabase gen types typescript --project-id <project-id> > src/lib/supabase/types.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
async function getDb() {
  const supabase = await createServerSupabaseClient()
  return supabase as any
}

/** 북마크 토글 — 있으면 삭제, 없으면 추가 */
export async function toggleBookmark(performanceId: string): Promise<BookmarkResult> {
  if (!isSupabaseConfigured) {
    return { error: "로그인이 필요합니다." }
  }

  const supabase = await getDb()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: "로그인이 필요합니다." }
  }

  const { data: existing } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("user_id", user.id)
    .eq("performance_id", performanceId)
    .maybeSingle()

  if (existing) {
    await supabase.from("bookmarks").delete().eq("id", existing.id)
    revalidatePath("/my")
    return { bookmarked: false }
  }

  await supabase.from("bookmarks").insert({ user_id: user.id, performance_id: performanceId })
  revalidatePath("/my")
  return { bookmarked: true }
}

/** 현재 로그인 사용자의 북마크 목록 조회 */
export async function getMyBookmarks(): Promise<BookmarkRow[]> {
  if (!isSupabaseConfigured) return []

  const supabase = await getDb()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data } = await supabase
    .from("bookmarks")
    .select("id, created_at, performances(id, title, slug, poster_url, category, status, period_start, period_end, venue)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (data as BookmarkRow[]) ?? []
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/** 특정 공연이 북마크되어 있는지 확인 */
export async function checkIsBookmarked(performanceId: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false

  // 타입 안전한 클라이언트를 사용하되, bookmarks 쿼리만 any로 처리
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return false

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { data } = await db
    .from("bookmarks")
    .select("id")
    .eq("user_id", user.id)
    .eq("performance_id", performanceId)
    .maybeSingle()

  return !!data
}
