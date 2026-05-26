"use server"

// NOTE: user_preferences / user_taste_signals 테이블은 마이그레이션
// 20260404100000_create_taste_system.sql 로 생성됩니다.
// `npx supabase db push` 후 `npx supabase gen types typescript` 를 실행하면
// types.ts 가 갱신되어 아래 any 캐스팅이 불필요해집니다.

import { createServerSupabaseClient } from "@/lib/supabase/server"
import {
  PERSONA_TASTE_TAGS,
  SIGNAL_WEIGHTS,
  type AudienceProfile,
  type PersonaKey,
  type TasteTag,
} from "./config"
import { buildTagWeights, weightsToSortedTags } from "./engine"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = { from: (table: string) => any }

// ── Phase 1: 퀴즈 결과 저장 ──────────────────────────────────

/**
 * 퀴즈 완료 후 페르소나를 DB에 저장.
 * 비로그인 사용자는 에러 없이 { success: false } 반환 → localStorage만 사용.
 */
export async function savePersonaToDb(persona: PersonaKey): Promise<{ success: boolean }> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false }

    const taste_tags = PERSONA_TASTE_TAGS[persona]
    const db = supabase as unknown as AnyClient

    const { error } = await db
      .from("user_preferences")
      .upsert(
        {
          user_id: user.id,
          persona,
          taste_tags,
          onboarding_done: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      )

    return { success: !error }
  } catch {
    return { success: false }
  }
}

// ── Phase 2: 관객 프로필 저장 + 부스트 태그 재계산 ──────────

/**
 * 3문항 프로필 답변을 저장하고, 데모그래픽 부스트가 반영된
 * 최종 taste_tags 배열을 재계산해 함께 업데이트.
 */
export async function saveAudienceProfile(
  persona: PersonaKey,
  profile: AudienceProfile
): Promise<{ success: boolean; boostedTags: TasteTag[] }> {
  const boostedWeights = buildTagWeights(persona, profile)
  const boostedTags = weightsToSortedTags(boostedWeights)

  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, boostedTags }

    const db = supabase as unknown as AnyClient

    const { error } = await db
      .from("user_preferences")
      .upsert(
        {
          user_id: user.id,
          persona,
          taste_tags: boostedTags,
          audience_type: profile.audience_type,
          visit_frequency: profile.visit_frequency,
          discovery_channel: profile.discovery_channel,
          profile_done: true,
          onboarding_done: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      )

    return { success: !error, boostedTags }
  } catch {
    return { success: false, boostedTags }
  }
}

export async function getDbPersona(): Promise<PersonaKey | null> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const db = supabase as unknown as AnyClient
    const { data } = await db
      .from("user_preferences")
      .select("persona")
      .eq("user_id", user.id)
      .maybeSingle()

    return (data?.persona as PersonaKey) ?? null
  } catch {
    return null
  }
}

// ── Phase 2: 행동 신호 기록 ───────────────────────────────────

export interface TrackSignalPayload {
  campaignId: string
  signalType: keyof typeof SIGNAL_WEIGHTS
  tasteTags: TasteTag[]
}

export async function trackTasteSignal(payload: TrackSignalPayload): Promise<void> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const db = supabase as unknown as AnyClient
    const weight = SIGNAL_WEIGHTS[payload.signalType]

    await db.from("user_taste_signals").insert({
      user_id: user.id,
      campaign_id: payload.campaignId,
      signal_type: payload.signalType,
      weight,
      taste_tags: payload.tasteTags,
    })
  } catch {
    // 신호 기록 실패는 UX에 영향 없음
  }
}

export async function getAggregatedSignals(
  limit = 100
): Promise<Array<{ tag: TasteTag; weight: number }>> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const db = supabase as unknown as AnyClient
    const { data } = await db
      .from("user_taste_signals")
      .select("taste_tags, weight")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (!data?.length) return []

    const map = new Map<TasteTag, number>()
    for (const row of data) {
      for (const tag of (row.taste_tags as TasteTag[])) {
        map.set(tag, (map.get(tag) ?? 0) + (row.weight as number))
      }
    }

    return Array.from(map.entries()).map(([tag, weight]) => ({ tag, weight }))
  } catch {
    return []
  }
}
