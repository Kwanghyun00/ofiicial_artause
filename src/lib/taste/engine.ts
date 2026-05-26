// ============================================================
// 취향 매칭 엔진
// ============================================================

import {
  AUDIENCE_TYPE_BOOSTS,
  AUTO_TAG_RULES,
  DISCOVERY_CHANNEL_BOOSTS,
  EXPLORATION_RATIO,
  PERSONA_TASTE_TAGS,
  VISIT_FREQUENCY_BOOSTS,
  type AudienceProfile,
  type PersonaKey,
  type TagBoostMap,
  type TasteTag,
} from "./config"

// ── Phase 1: 텍스트 기반 자동 태깅 ──────────────────────────

export function autoTagFromText(text: string): TasteTag[] {
  const lower = text.toLowerCase()
  const matched: TasteTag[] = []
  for (const rule of AUTO_TAG_RULES) {
    if (rule.keywords.some((kw) => lower.includes(kw))) matched.push(rule.tag)
  }
  if (!matched.includes("value_hunter")) matched.push("value_hunter")
  return matched
}

// ── 데모그래픽 부스트 적용 ────────────────────────────────────
//
// 페르소나 기본 태그의 가중치에 AudienceProfile 3개 필드의 배율을 순서대로 곱함.
// 최종 가중치 > 2.0 은 2.0으로 cap 처리.
//
// 반환값: TasteTag → weight (0 이상, 1.0이 기본값)

export function buildTagWeights(
  persona: PersonaKey,
  profile?: Partial<AudienceProfile>
): Map<TasteTag, number> {
  const baseTags = PERSONA_TASTE_TAGS[persona]
  const weights = new Map<TasteTag, number>()

  // 기본값: 페르소나 태그는 1.0, 나머지는 0
  for (const tag of baseTags) weights.set(tag, 1.0)

  if (!profile) return weights

  // 3개 부스트 맵을 순서대로 적용
  const boostSources: TagBoostMap[] = [
    profile.audience_type     ? AUDIENCE_TYPE_BOOSTS[profile.audience_type]         : {},
    profile.visit_frequency   ? VISIT_FREQUENCY_BOOSTS[profile.visit_frequency]     : {},
    profile.discovery_channel ? DISCOVERY_CHANNEL_BOOSTS[profile.discovery_channel] : {},
  ]

  for (const boostMap of boostSources) {
    for (const [tag, multiplier] of Object.entries(boostMap) as [TasteTag, number][]) {
      const current = weights.get(tag) ?? 0
      // 부스트 대상 태그가 기본값에 없던 것도 추가 (낮은 기본값 0.3 부여 후 배율 적용)
      const base = current > 0 ? current : 0.3
      weights.set(tag, Math.min(base * multiplier, 2.0))
    }
  }

  return weights
}

/** buildTagWeights 결과를 내림차순 정렬된 TasteTag 배열로 변환 */
export function weightsToSortedTags(weights: Map<TasteTag, number>): TasteTag[] {
  return [...weights.entries()]
    .filter(([, w]) => w > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([tag]) => tag)
}

// ── 태그 오버랩 스코어링 (Phase 1, 가중치 미적용) ────────────

export function scoreTagOverlap(userTags: TasteTag[], campaignTags: TasteTag[]): number {
  if (!userTags.length || !campaignTags.length) return 0
  const userSet = new Set(userTags)
  const overlap = campaignTags.filter((t) => userSet.has(t)).length
  return Math.round((overlap / Math.min(userTags.length, campaignTags.length)) * 100)
}

// ── 가중치 기반 스코어링 (Phase 2, 데모그래픽 부스트 적용) ───

export function scoreByWeights(weights: Map<TasteTag, number>, campaignTags: TasteTag[]): number {
  if (!campaignTags.length) return 0
  const total = campaignTags.reduce((sum, tag) => sum + (weights.get(tag) ?? 0), 0)
  return Math.round((total / campaignTags.length) * 100)
}

// ── 행동 신호 블렌딩 (Phase 2, implicit feedback) ────────────

export interface SignalWeight { tag: TasteTag; weight: number }

export function blendWeights(
  explicitWeights: Map<TasteTag, number>,
  signals: SignalWeight[]
): Map<TasteTag, number> {
  const map = new Map(explicitWeights)
  for (const { tag, weight } of signals) {
    map.set(tag, (map.get(tag) ?? 0) + weight * 0.5) // 행동 신호는 절반 가중
  }
  const max = Math.max(...map.values(), 1)
  for (const [tag, val] of map) map.set(tag, val / max)
  return map
}

// ── 캠페인 랭킹 (탐색/활용 균형 포함) ────────────────────────

export interface ScoredCampaign<T> {
  campaign: T
  score: number
  campaignTags: TasteTag[]
  isExploration: boolean
}

export function rankCampaigns<T extends {
  id: string
  title: string
  description?: string | null
  one_line_intro?: string | null
}>(
  campaigns: T[],
  userTags: TasteTag[],
  options?: {
    limit?: number
    weightMap?: Map<TasteTag, number>
    preTaggedMap?: Map<string, TasteTag[]>
  }
): ScoredCampaign<T>[] {
  const { limit = 6, weightMap, preTaggedMap } = options ?? {}

  const scored = campaigns.map((c) => {
    const campaignTags =
      preTaggedMap?.get(c.id) ??
      autoTagFromText([c.title, c.one_line_intro ?? "", c.description ?? ""].join(" "))

    const score = weightMap
      ? scoreByWeights(weightMap, campaignTags)
      : scoreTagOverlap(userTags, campaignTags)

    return { campaign: c, score, campaignTags, isExploration: false }
  })

  scored.sort((a, b) => b.score - a.score)

  const explorationCount = Math.floor(limit * EXPLORATION_RATIO)
  const exploitCount = limit - explorationCount
  const exploitSlots = scored.slice(0, exploitCount)

  const userTagSet = new Set(userTags)
  const explorationSlots = scored
    .slice(exploitCount)
    .filter(({ campaignTags }) => campaignTags.every((t) => !userTagSet.has(t)))
    .slice(0, explorationCount)
    .map((item) => ({ ...item, isExploration: true }))

  return [...exploitSlots, ...explorationSlots].slice(0, limit)
}

// ── 유틸 ─────────────────────────────────────────────────────

export function tagsFromPersona(persona: PersonaKey): TasteTag[] {
  return PERSONA_TASTE_TAGS[persona]
}

export function formatMatchScore(score: number): string {
  return score > 0 ? `${score}% 일치` : ""
}

export function matchScoreColorClass(score: number): string {
  if (score >= 80) return "text-emerald-600 bg-emerald-50"
  if (score >= 50) return "text-amber-600 bg-amber-50"
  return "text-muted-foreground bg-muted"
}
