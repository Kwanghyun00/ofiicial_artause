"use server"

import { isSupabaseConfigured } from "@/lib/config"
import { createAdminSupabaseClient, createReadOnlySupabaseClient } from "@/lib/supabase/server"

export interface FoundOrCreatedPerformance {
  id: string
  slug: string
  title: string
  category: string | null
}

function buildSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^\w\s\uac00-\ud7a3]/g, "")
    .replace(/\s+/g, "-")
    .substring(0, 50)
  // 유저 제출 공연임을 식별할 수 있도록 접미사 추가
  const suffix = Date.now().toString(36)
  return `${base}-usr-${suffix}`
}

/**
 * 공연을 제목으로 정확히 찾거나, 없으면 새로 생성합니다.
 * 유저가 직접 등록하는 공연에 사용됩니다.
 */
export async function findOrCreatePerformanceAction(data: {
  title: string
  category?: string
  venue?: string
}): Promise<{ success: true; performance: FoundOrCreatedPerformance } | { success: false; error: string }> {
  const title = data.title.trim()
  if (!title) {
    return { success: false, error: "공연 제목을 입력해 주세요." }
  }

  if (!isSupabaseConfigured) {
    // mock 모드: 임시 ID 반환
    return {
      success: true,
      performance: {
        id: `mock-user-${Date.now()}`,
        slug: buildSlug(title),
        title,
        category: data.category ?? null,
      },
    }
  }

  try {
    // SELECT: service role key가 없어도 동작하는 read-only 클라이언트 사용
    const readClient = createReadOnlySupabaseClient()

    // 1. 동일 제목 공연이 이미 있는지 확인 (대소문자 무시)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing } = await (readClient as any)
      .from("performances")
      .select("id, slug, title, category")
      .ilike("title", title)
      .limit(1)
      .maybeSingle()

    if (existing) {
      return {
        success: true,
        performance: {
          id: existing.id,
          slug: existing.slug,
          title: existing.title,
          category: existing.category ?? null,
        },
      }
    }

    // 2. 없으면 새로 생성 (admin 권한 필요)
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      // service role key 없이는 INSERT 불가 → 사용자에게 안내
      return {
        success: false,
        error: "검색 결과에 없는 공연은 현재 직접 등록이 어렵습니다. 제목을 다시 확인하거나 검색으로 찾아주세요.",
      }
    }

    const adminClient = createAdminSupabaseClient()
    const slug = buildSlug(title)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: created, error } = await (adminClient as any)
      .from("performances")
      .insert({
        title,
        slug,
        category: data.category ?? null,
        venue: data.venue?.trim() || null,
        // status 허용값: 'draft'|'scheduled'|'ongoing'|'completed'
        status: "draft",
        // source 허용값: 'manual'|'kopis'
        source: "manual",
      })
      .select("id, slug, title, category")
      .single()

    if (error) {
      console.error("findOrCreatePerformanceAction insert error", error)
      return { success: false, error: "공연 등록에 실패했습니다. 잠시 후 다시 시도해 주세요." }
    }

    return {
      success: true,
      performance: {
        id: created.id,
        slug: created.slug,
        title: created.title,
        category: created.category ?? null,
      },
    }
  } catch (err) {
    console.error("findOrCreatePerformanceAction exception", err)
    return { success: false, error: "일시적인 문제가 발생했습니다. 잠시 후 다시 시도해 주세요." }
  }
}
