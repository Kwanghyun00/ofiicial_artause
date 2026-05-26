// ============================================================
// 취향 분석 시스템 — 핵심 설정
// ============================================================

// ── 20개 취향 태그 ────────────────────────────────────────────

export type TasteTag =
  // 장르 취향
  | "musical_fan"       // 뮤지컬 마니아
  | "theater_purist"    // 연극 순수주의자
  | "classical_lover"   // 클래식 감상자
  | "dance_explorer"    // 무용·몸짓 탐구자
  | "variety_enjoyer"   // 버라이어티 향유자
  | "traditional_arts"  // 전통예술 애호가
  // 관람 스타일
  | "immersive_seeker"  // 몰입형 체험파
  | "healing_seeker"    // 감동·힐링 추구자
  | "humor_first"       // 유머·오락 우선자
  | "intellectual"      // 지적 자극 추구자
  | "visual_first"      // 비주얼 중심 감상자
  // 사회적 맥락
  | "date_watching"     // 데이트·커플 관람
  | "friend_group"      // 친구 모임형
  | "solo_deep"         // 혼자 깊이 감상
  | "family_friendly"   // 가족·아이와 함께
  // 아티스트 취향
  | "star_fan"          // 스타 배우 팬덤형
  | "creator_follower"  // 창작진 추종자
  | "international_hit" // 해외 유명작 추적자
  // 실용 취향
  | "value_hunter"      // 가성비·혜택 우선
  | "new_release"       // 신작·초연 선도자

export interface TasteTagMeta {
  id: TasteTag
  label: string
  emoji: string
  group: "genre" | "style" | "social" | "artist" | "practical"
}

export const TASTE_TAGS: TasteTagMeta[] = [
  { id: "musical_fan",       label: "뮤지컬 마니아",       emoji: "🎵", group: "genre" },
  { id: "theater_purist",    label: "연극 순수주의자",      emoji: "🎭", group: "genre" },
  { id: "classical_lover",   label: "클래식 감상자",        emoji: "🎻", group: "genre" },
  { id: "dance_explorer",    label: "무용·몸짓 탐구자",     emoji: "💃", group: "genre" },
  { id: "variety_enjoyer",   label: "버라이어티 향유자",    emoji: "🎪", group: "genre" },
  { id: "traditional_arts",  label: "전통예술 애호가",      emoji: "🥁", group: "genre" },
  { id: "immersive_seeker",  label: "몰입형 체험파",        emoji: "🌀", group: "style" },
  { id: "healing_seeker",    label: "감동·힐링 추구자",     emoji: "🥲", group: "style" },
  { id: "humor_first",       label: "유머·오락 우선자",     emoji: "😂", group: "style" },
  { id: "intellectual",      label: "지적 자극 추구자",     emoji: "🧠", group: "style" },
  { id: "visual_first",      label: "비주얼 중심 감상자",   emoji: "✨", group: "style" },
  { id: "date_watching",     label: "데이트·커플 관람",     emoji: "💑", group: "social" },
  { id: "friend_group",      label: "친구 모임형",          emoji: "👫", group: "social" },
  { id: "solo_deep",         label: "혼자 깊이 감상",       emoji: "🎧", group: "social" },
  { id: "family_friendly",   label: "가족·아이와 함께",     emoji: "👨‍👩‍👧", group: "social" },
  { id: "star_fan",          label: "스타 배우 팬덤형",     emoji: "⭐", group: "artist" },
  { id: "creator_follower",  label: "창작진 추종자",        emoji: "🎬", group: "artist" },
  { id: "international_hit", label: "해외 유명작 추적자",   emoji: "🌍", group: "artist" },
  { id: "value_hunter",      label: "가성비·혜택 우선",     emoji: "💸", group: "practical" },
  { id: "new_release",       label: "신작·초연 선도자",     emoji: "🚀", group: "practical" },
]

// ── 페르소나별 취향 태그 기본값 ──────────────────────────────

export type PersonaKey = "romantic" | "explorer" | "beginner" | "connoisseur"

export const PERSONA_TASTE_TAGS: Record<PersonaKey, TasteTag[]> = {
  romantic:    ["musical_fan", "healing_seeker", "date_watching", "star_fan", "international_hit"],
  explorer:    ["variety_enjoyer", "immersive_seeker", "intellectual", "visual_first", "new_release", "creator_follower"],
  beginner:    ["musical_fan", "humor_first", "friend_group", "value_hunter", "international_hit"],
  connoisseur: ["theater_purist", "classical_lover", "dance_explorer", "intellectual", "solo_deep", "creator_follower", "traditional_arts"],
}

// ── 관객 프로필 타입 (Phase 2 — 3문항 추가 수집) ─────────────

/**
 * Q6: 공연과 나의 관계
 * - arts_expert  : 예술계 종사자 또는 예술 전공자 (연극영화, 음악, 무용 등)
 * - culture_fan  : 비전공이지만 공연을 깊이 즐기는 문화 애호가
 * - general      : 공연을 가끔 즐기는 일반 관객
 * - newcomer     : 공연이 아직 낯선 입문자
 */
export type AudienceType = "arts_expert" | "culture_fan" | "general" | "newcomer"

/**
 * Q7: 관람 빈도
 * - frequent     : 월 1회 이상
 * - regular      : 분기 1~2회 (연 4~8회)
 * - occasional   : 연 1~3회
 * - first_time   : 거의 처음
 */
export type VisitFrequency = "frequent" | "regular" | "occasional" | "first_time"

/**
 * Q8: 공연 정보 탐색 경로
 * - sns          : SNS/인스타그램에서 발견
 * - artist_fan   : 좋아하는 배우·극단을 직접 팔로우
 * - search       : 예매 사이트·검색으로 직접 탐색
 * - word_of_mouth: 지인 추천
 */
export type DiscoveryChannel = "sns" | "artist_fan" | "search" | "word_of_mouth"

export interface AudienceProfile {
  audience_type: AudienceType
  visit_frequency: VisitFrequency
  discovery_channel: DiscoveryChannel
}

// ── 데모그래픽 → 태그 부스트 규칙 ───────────────────────────
//
// 페르소나 기본 태그에 곱하는 배율 (1.0 = 변화 없음, 1.5 = 50% 강화)
// 여러 규칙이 겹치면 누적 곱셈 적용 (최대 2.0 cap)

export type TagBoostMap = Partial<Record<TasteTag, number>>

export const AUDIENCE_TYPE_BOOSTS: Record<AudienceType, TagBoostMap> = {
  arts_expert: {
    theater_purist:   1.6,
    intellectual:     1.5,
    creator_follower: 1.5,
    dance_explorer:   1.3,
    classical_lover:  1.3,
    traditional_arts: 1.3,
    solo_deep:        1.2,
    new_release:      1.2,
  },
  culture_fan: {
    theater_purist:   1.3,
    intellectual:     1.3,
    creator_follower: 1.2,
    solo_deep:        1.2,
    new_release:      1.2,
    classical_lover:  1.1,
  },
  general: {
    healing_seeker:   1.2,
    humor_first:      1.2,
    value_hunter:     1.2,
    musical_fan:      1.1,
    friend_group:     1.1,
  },
  newcomer: {
    musical_fan:      1.4,
    international_hit:1.3,
    friend_group:     1.3,
    value_hunter:     1.4,
    humor_first:      1.2,
    healing_seeker:   1.1,
  },
}

export const VISIT_FREQUENCY_BOOSTS: Record<VisitFrequency, TagBoostMap> = {
  frequent: {
    intellectual:     1.3,
    new_release:      1.3,
    creator_follower: 1.2,
    solo_deep:        1.2,
    theater_purist:   1.2,
    dance_explorer:   1.1,
    traditional_arts: 1.1,
  },
  regular: {
    // 균형 유지 — 부스트 없음
  },
  occasional: {
    value_hunter:     1.2,
    healing_seeker:   1.1,
    international_hit:1.1,
    musical_fan:      1.1,
  },
  first_time: {
    musical_fan:      1.4,
    international_hit:1.3,
    value_hunter:     1.3,
    humor_first:      1.2,
    friend_group:     1.2,
  },
}

export const DISCOVERY_CHANNEL_BOOSTS: Record<DiscoveryChannel, TagBoostMap> = {
  sns: {
    visual_first:     1.3,
    new_release:      1.2,
    variety_enjoyer:  1.2,
    immersive_seeker: 1.1,
  },
  artist_fan: {
    star_fan:         1.5,
    creator_follower: 1.3,
    musical_fan:      1.2,
    healing_seeker:   1.1,
  },
  search: {
    intellectual:     1.2,
    solo_deep:        1.2,
    new_release:      1.1,
    creator_follower: 1.1,
  },
  word_of_mouth: {
    friend_group:     1.3,
    humor_first:      1.2,
    healing_seeker:   1.2,
    musical_fan:      1.1,
  },
}

// ── 키워드 기반 자동 태깅 (캠페인 텍스트 → 태그) ─────────────

interface AutoTagRule { tag: TasteTag; keywords: string[] }

export const AUTO_TAG_RULES: AutoTagRule[] = [
  { tag: "musical_fan",       keywords: ["뮤지컬", "musical", "오페라", "뮤직"] },
  { tag: "theater_purist",    keywords: ["연극", "소극장", "모노드라마", "희곡", "연기"] },
  { tag: "classical_lover",   keywords: ["클래식", "오케스트라", "실내악", "피아노", "바이올린", "첼로", "교향"] },
  { tag: "dance_explorer",    keywords: ["무용", "발레", "댄스", "현대무용", "안무"] },
  { tag: "traditional_arts",  keywords: ["국악", "판소리", "민요", "가야금", "전통", "사물놀이"] },
  { tag: "variety_enjoyer",   keywords: ["콘서트", "버라이어티", "쇼", "넌버벌", "서커스"] },
  { tag: "immersive_seeker",  keywords: ["이머시브", "체험", "참여형", "인터랙티브"] },
  { tag: "healing_seeker",    keywords: ["감동", "힐링", "위로", "따뜻", "눈물", "감성"] },
  { tag: "humor_first",       keywords: ["코미디", "개그", "웃음", "유머", "코믹"] },
  { tag: "intellectual",      keywords: ["철학", "메시지", "사회", "역사", "실험", "아방가르드"] },
  { tag: "visual_first",      keywords: ["마술", "스펙터클", "화려", "비주얼", "영상", "미디어아트"] },
  { tag: "family_friendly",   keywords: ["가족", "어린이", "키즈", "아동", "온가족"] },
  { tag: "date_watching",     keywords: ["로맨스", "로맨틱", "연인", "커플", "데이트"] },
  { tag: "international_hit", keywords: ["브로드웨이", "웨스트엔드", "라이선스", "원작", "해외"] },
  { tag: "new_release",       keywords: ["초연", "세계초연", "한국초연", "신작", "창작"] },
  { tag: "creator_follower",  keywords: ["연출", "작곡가", "극단", "프로덕션"] },
  { tag: "value_hunter",      keywords: ["무료", "초대권", "할인", "이벤트"] },
]

// ── 행동 신호 가중치 ──────────────────────────────────────────

export const SIGNAL_WEIGHTS = {
  review:   5.0,
  entry:    4.0,
  bookmark: 3.0,
  dwell:    2.0,
  click:    1.5,
  view:     1.0,
} as const satisfies Record<string, number>

// ── 탐색/활용 균형 비율 ───────────────────────────────────────

export const EXPLORATION_RATIO = 0.3
