"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft, Share2, Check, Calendar,
  ChevronRight, Sparkles, Users, BadgeCheck,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { savePersonaToDb, saveAudienceProfile } from "@/lib/taste/actions"
import { rankCampaigns, formatMatchScore, matchScoreColorClass, buildTagWeights, weightsToSortedTags } from "@/lib/taste/engine"
import type { Campaign } from "@/components/home/types"
import type { AudienceProfile, AudienceType, DiscoveryChannel, TasteTag, VisitFrequency } from "@/lib/taste/config"

// ═══════════════════════════════════════════════════════════
// Phase 1 — 공연 취향 5문항
// ═══════════════════════════════════════════════════════════

const TASTE_QUESTIONS = [
  {
    id: "q1",
    step: 1,
    question: "공연이 끝나고 극장을 나설 때,\n주로 어떤 감정인가요?",
    a: { label: "눈물이 날 것 같았어요", emoji: "🥲" },
    b: { label: "심장이 두근거려요", emoji: "⚡" },
  },
  {
    id: "q2",
    step: 2,
    question: "아래 두 공연 중\n더 끌리는 쪽은?",
    a: { label: "유명 원작 기반 대형 뮤지컬", emoji: "🎵" },
    b: { label: "독특한 연출의 실험적 연극", emoji: "🎭" },
  },
  {
    id: "q3",
    step: 3,
    question: "공연, 누구와 함께\n보고 싶으세요?",
    a: { label: "연인과 단둘이", emoji: "💑" },
    b: { label: "친구 또는 가족과", emoji: "👫" },
  },
  {
    id: "q4",
    step: 4,
    question: "공연을 선택할 때\n가장 중요하게 보는 것은?",
    a: { label: "유명 배우·검증된 제작사", emoji: "⭐" },
    b: { label: "신선한 스토리·화제의 연출", emoji: "✨" },
  },
  {
    id: "q5",
    step: 5,
    question: "공연 관람 경험이\n얼마나 되시나요?",
    a: { label: "많지 않아요 (연 1~3회)", emoji: "🌱" },
    b: { label: "자주 봐요 (연 4회 이상)", emoji: "🌟" },
  },
] as const

type QId = "q1" | "q2" | "q3" | "q4" | "q5"
type Answer = "a" | "b"
type Answers = Partial<Record<QId, Answer>>
export type PersonaKey = "romantic" | "explorer" | "beginner" | "connoisseur"

// ═══════════════════════════════════════════════════════════
// Phase 2 — 관객 프로필 3문항 (선택)
// ═══════════════════════════════════════════════════════════

const PROFILE_QUESTIONS = [
  {
    id: "audience_type" as const,
    step: 6,
    question: "공연과 나의 관계를\n한 마디로 표현하면?",
    hint: "추천 정밀도를 높이는 데 사용됩니다",
    options: [
      {
        value: "arts_expert" as AudienceType,
        label: "예술 전공 / 현업 종사자",
        sub: "연극영화, 음악, 무용 전공 또는 배우·스태프·기획자",
        emoji: "🎓",
      },
      {
        value: "culture_fan" as AudienceType,
        label: "문화 애호가",
        sub: "전공은 아니지만 공연을 깊이 즐기고 즐겨 찾아봐요",
        emoji: "🎭",
      },
      {
        value: "general" as AudienceType,
        label: "일반 관객",
        sub: "좋은 공연이 있으면 가끔 즐기는 편이에요",
        emoji: "🎫",
      },
      {
        value: "newcomer" as AudienceType,
        label: "공연 입문자",
        sub: "아직 많이 낯설지만 관심이 생기기 시작했어요",
        emoji: "🌱",
      },
    ],
  },
  {
    id: "visit_frequency" as const,
    step: 7,
    question: "보통 1년에 공연을\n몇 번이나 보시나요?",
    hint: "관람 패턴에 맞는 공연을 추천해 드릴게요",
    options: [
      {
        value: "frequent" as VisitFrequency,
        label: "월 1회 이상",
        sub: "공연이 생활의 일부예요",
        emoji: "🌟",
      },
      {
        value: "regular" as VisitFrequency,
        label: "분기에 1~2회",
        sub: "연 4~8회 정도 찾아가요",
        emoji: "📅",
      },
      {
        value: "occasional" as VisitFrequency,
        label: "연 1~3회",
        sub: "특별한 날이나 화제작 위주로 봐요",
        emoji: "🎉",
      },
      {
        value: "first_time" as VisitFrequency,
        label: "거의 처음이에요",
        sub: "아직 공연 경험이 많지 않아요",
        emoji: "👶",
      },
    ],
  },
  {
    id: "discovery_channel" as const,
    step: 8,
    question: "공연 정보를 주로\n어디서 얻으시나요?",
    hint: "발견 방식에 따라 맞는 공연을 먼저 보여드릴게요",
    options: [
      {
        value: "sns" as DiscoveryChannel,
        label: "SNS · 인스타그램",
        sub: "피드나 릴스에서 우연히 발견해요",
        emoji: "📱",
      },
      {
        value: "artist_fan" as DiscoveryChannel,
        label: "좋아하는 배우 · 극단 팔로우",
        sub: "출연진이나 제작사를 직접 찾아봐요",
        emoji: "⭐",
      },
      {
        value: "search" as DiscoveryChannel,
        label: "예매 사이트 직접 탐색",
        sub: "인터파크·멜론티켓 등에서 직접 찾아봐요",
        emoji: "🔍",
      },
      {
        value: "word_of_mouth" as DiscoveryChannel,
        label: "지인 추천",
        sub: "친구나 가족이 알려줘서 가는 편이에요",
        emoji: "💬",
      },
    ],
  },
] as const

// ═══════════════════════════════════════════════════════════
// 페르소나 정의
// ═══════════════════════════════════════════════════════════

export const PERSONAS: Record<PersonaKey, {
  emoji: string; name: string; tagline: string; desc: string
  traits: string[]; genres: string[]; eventsFilter: string
  gradient: string; accentClass: string
}> = {
  romantic: {
    emoji: "🌹", name: "감성 낭만파",
    tagline: "눈물 한 방울도 소중히 여기는 당신",
    desc: "스토리의 감동과 아름다운 음악이 있는 공연을 사랑합니다. 공연이 끝난 후에도 여운이 오래 남는 작품을 선호하고, 특별한 사람과의 추억을 소중히 여깁니다.",
    traits: ["감동적인 스토리", "아름다운 OST", "섬세한 감정 연기"],
    genres: ["뮤지컬", "로맨틱 드라마", "로맨스"],
    eventsFilter: "뮤지컬",
    gradient: "from-rose-400 via-pink-400 to-orange-300",
    accentClass: "text-rose-500",
  },
  explorer: {
    emoji: "⚡", name: "에너지 탐험가",
    tagline: "새로운 무대에서 에너지를 충전하는 당신",
    desc: "기존 틀을 깨는 실험적인 연출과 강렬한 에너지가 넘치는 무대를 즐깁니다. 예상치 못한 전개와 독창적인 무대 구성에서 공연의 진가를 발견합니다.",
    traits: ["강렬한 무대 연출", "실험적인 구성", "압도적인 에너지"],
    genres: ["콘서트", "창작 연극", "현대 무용"],
    eventsFilter: "콘서트",
    gradient: "from-amber-400 via-orange-400 to-yellow-300",
    accentClass: "text-amber-500",
  },
  beginner: {
    emoji: "🎓", name: "공연 입문자",
    tagline: "무대 예술의 세계에 첫발을 내딛은 당신",
    desc: "아직 공연이 낯설지만 그 매력에 조금씩 빠져들고 있습니다. 잘 알려진 작품이나 화제의 공연부터 시작해 점차 다양한 장르를 탐색해 가는 단계입니다.",
    traits: ["접근하기 쉬운 작품", "유명 IP 뮤지컬", "화제의 공연"],
    genres: ["대형 뮤지컬", "콘서트", "유명 원작"],
    eventsFilter: "뮤지컬",
    gradient: "from-emerald-400 via-teal-400 to-cyan-300",
    accentClass: "text-emerald-500",
  },
  connoisseur: {
    emoji: "🎭", name: "클래식 애호가",
    tagline: "진짜 예술을 알아보는 안목을 가진 당신",
    desc: "무대 예술의 깊이와 배우의 연기력을 진정으로 감상할 줄 압니다. 오랫동안 사랑받아온 고전 작품부터 수준 높은 현대 공연까지 폭넓게 즐기는 진정한 공연 애호가입니다.",
    traits: ["연극적 깊이", "탁월한 연기력", "고전과 현대의 조화"],
    genres: ["연극", "클래식", "오페라"],
    eventsFilter: "연극",
    gradient: "from-violet-400 via-purple-400 to-indigo-300",
    accentClass: "text-violet-500",
  },
}

// ═══════════════════════════════════════════════════════════
// 페르소나 판정
// ═══════════════════════════════════════════════════════════

function calcPersona(answers: Answers): PersonaKey {
  const { q1, q2, q4, q5 } = answers
  if (q5 === "a" && (q2 === "a" || q1 === "a")) return "beginner"
  if (q2 === "b" && q5 === "b" && q4 === "b") return "connoisseur"
  if (q1 === "b" && q4 === "b") return "explorer"
  if (q1 === "a" && q2 === "a") return "romantic"
  const aCount = Object.values(answers).filter((v) => v === "a").length
  if (aCount >= 3) return q5 === "a" ? "beginner" : "romantic"
  return q2 === "b" ? "connoisseur" : "explorer"
}

// ═══════════════════════════════════════════════════════════
// 메인 컴포넌트
// ═══════════════════════════════════════════════════════════

interface TasteQuizProps {
  initialResult?: PersonaKey
  campaigns?: Campaign[]
}

type Phase = "intro" | "quiz" | "result" | "profile" | "complete"

export function TasteQuiz({ initialResult, campaigns = [] }: TasteQuizProps) {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>(initialResult ? "result" : "intro")
  const [currentQ, setCurrentQ] = useState(0)          // 취향 퀴즈 인덱스
  const [profileQ, setProfileQ] = useState(0)          // 프로필 질문 인덱스
  const [answers, setAnswers] = useState<Answers>({})
  const [profile, setProfile] = useState<Partial<AudienceProfile>>({})
  const [result, setResult] = useState<PersonaKey | null>(initialResult ?? null)
  const [boostedTags, setBoostedTags] = useState<TasteTag[]>([])
  const [animating, setAnimating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)

  // 결과 URL 동기화
  useEffect(() => {
    if (result && (phase === "result" || phase === "profile" || phase === "complete")) {
      router.replace(`/taste?result=${result}`, { scroll: false })
    }
  }, [result, phase, router])

  // 취향 태그 기반 매칭 캠페인 (상위 3개)
  const tagWeights = useMemo(() => {
    if (!result) return new Map<TasteTag, number>()
    return buildTagWeights(result, Object.keys(profile).length === 3 ? profile as AudienceProfile : undefined)
  }, [result, profile])

  const activeTags = useMemo(() => weightsToSortedTags(tagWeights), [tagWeights])

  const matchedCampaigns = useMemo(() => {
    if (!result || !campaigns.length) return []
    return rankCampaigns(campaigns, activeTags, { limit: 3, weightMap: tagWeights.size > 0 ? tagWeights : undefined })
  }, [result, campaigns, activeTags, tagWeights])

  // ── 취향 퀴즈 답변 처리 ────────────────────────────────────
  const handleAnswer = (choice: Answer) => {
    if (animating) return
    const q = TASTE_QUESTIONS[currentQ]
    const newAnswers = { ...answers, [q.id]: choice }
    setAnswers(newAnswers)
    setAnimating(true)

    setTimeout(() => {
      if (currentQ < TASTE_QUESTIONS.length - 1) {
        setCurrentQ((p) => p + 1)
        setAnimating(false)
      } else {
        const persona = calcPersona(newAnswers)
        setResult(persona)
        setPhase("result")
        setAnimating(false)
        try { localStorage.setItem("artause_persona", persona) } catch { /* ignore */ }
        savePersonaToDb(persona).catch(() => {})
      }
    }, 300)
  }

  // ── 프로필 답변 처리 ───────────────────────────────────────
  const handleProfileAnswer = async (
    key: keyof AudienceProfile,
    value: AudienceType | VisitFrequency | DiscoveryChannel
  ) => {
    const newProfile = { ...profile, [key]: value }
    setProfile(newProfile)
    setAnimating(true)

    setTimeout(async () => {
      if (profileQ < PROFILE_QUESTIONS.length - 1) {
        setProfileQ((p) => p + 1)
        setAnimating(false)
      } else {
        // 마지막 프로필 질문 완료
        const fullProfile = newProfile as AudienceProfile
        setSavingProfile(true)
        const { boostedTags: tags } = await saveAudienceProfile(result!, fullProfile).catch(
          () => ({ success: false, boostedTags: activeTags })
        )
        setBoostedTags(tags)
        try {
          localStorage.setItem("artause_persona", result!)
          localStorage.setItem("artause_profile", JSON.stringify(fullProfile))
        } catch { /* ignore */ }
        setSavingProfile(false)
        setPhase("complete")
        setAnimating(false)
      }
    }, 300)
  }

  const handleRestart = () => {
    setPhase("intro")
    setCurrentQ(0)
    setProfileQ(0)
    setAnswers({})
    setProfile({})
    setResult(null)
    setBoostedTags([])
    router.replace("/taste", { scroll: false })
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/taste?result=${result}`
    const text = `나의 공연 취향은 '${PERSONAS[result!].name}'! 알터즈에서 내 공연 DNA를 확인해봐요 🎭`
    if (navigator.share) {
      await navigator.share({ title: "나의 공연 취향", text, url }).catch(() => {})
    } else {
      await navigator.clipboard.writeText(`${text}\n${url}`).catch(() => {})
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // ═══════════════════════════════════════════════════════════
  // 렌더링
  // ═══════════════════════════════════════════════════════════

  /* ─── 인트로 ─── */
  if (phase === "intro") {
    return (
      <div className="flex flex-col items-center gap-8 py-12 text-center">
        <div className="space-y-4">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-4xl">🎭</div>
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">나의 공연 DNA는?</h1>
          <p className="max-w-md text-base text-muted-foreground">
            5가지 질문으로 당신만의 공연 취향 유형을 알아보세요.<br />
            결과에 맞는 공연도 추천해 드립니다.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(Object.entries(PERSONAS) as [PersonaKey, typeof PERSONAS[PersonaKey]][]).map(([, p]) => (
            <div key={p.name} className="rounded-2xl border border-border bg-card px-4 py-3 text-center">
              <p className="text-2xl">{p.emoji}</p>
              <p className="mt-1 text-xs font-bold text-foreground">{p.name}</p>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setPhase("quiz")}
          className="rounded-full bg-primary px-10 py-4 text-base font-bold text-primary-foreground shadow-stage transition-all hover:-translate-y-0.5 hover:bg-primary/90"
        >
          취향 테스트 시작하기 →
        </button>
        <p className="text-xs text-muted-foreground">약 1~2분 소요 · 5문항 + 선택 3문항</p>
      </div>
    )
  }

  /* ─── 취향 퀴즈 (Phase 1) ─── */
  if (phase === "quiz") {
    const q = TASTE_QUESTIONS[currentQ]
    const totalSteps = TASTE_QUESTIONS.length + PROFILE_QUESTIONS.length
    const progress = ((currentQ) / totalSteps) * 100

    return (
      <div className="flex flex-col gap-8 py-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            {currentQ > 0 && (
              <button
                type="button"
                onClick={() => {
                  setCurrentQ((p) => p - 1)
                  setAnswers((a) => { const n = { ...a }; delete n[TASTE_QUESTIONS[currentQ].id]; return n })
                }}
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition"
              >
                <ArrowLeft className="h-4 w-4" /> 이전
              </button>
            )}
            <span className="ml-auto text-xs text-muted-foreground">
              {currentQ + 1} / {TASTE_QUESTIONS.length}
              <span className="ml-1 text-muted-foreground/50">· 취향 분석</span>
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${progress + (100 / totalSteps)}%` }} />
          </div>
        </div>

        <div className={`space-y-6 transition-opacity duration-200 ${animating ? "opacity-0" : "opacity-100"}`}>
          <h2 className="whitespace-pre-line text-2xl font-bold leading-snug text-foreground sm:text-3xl">{q.question}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {(["a", "b"] as const).map((choice) => {
              const opt = q[choice]
              return (
                <button
                  key={choice}
                  type="button"
                  onClick={() => handleAnswer(choice)}
                  className="group flex flex-col items-center gap-3 rounded-2xl border-2 border-border bg-card p-6 text-center transition-all hover:border-primary hover:bg-primary/5 hover:-translate-y-1 hover:shadow-stage"
                >
                  <span className="text-4xl transition-transform duration-200 group-hover:scale-110">{opt.emoji}</span>
                  <span className="text-sm font-semibold text-foreground leading-snug">{opt.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  /* ─── 결과 화면 (Phase 1 완료) ─── */
  if ((phase === "result" || phase === "profile" || phase === "complete") && result) {
    const persona = PERSONAS[result]
    const profileDone = phase === "complete"
    const finalTags = profileDone && boostedTags.length > 0 ? boostedTags : activeTags

    // 프로필 진행 중: 질문 화면
    if (phase === "profile") {
      const pq = PROFILE_QUESTIONS[profileQ]
      const totalSteps = TASTE_QUESTIONS.length + PROFILE_QUESTIONS.length
      const progress = ((TASTE_QUESTIONS.length + profileQ) / totalSteps) * 100

      return (
        <div className="flex flex-col gap-8 py-6">
          {/* 진행률 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  if (profileQ > 0) setProfileQ((p) => p - 1)
                  else setPhase("result")
                }}
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition"
              >
                <ArrowLeft className="h-4 w-4" /> 이전
              </button>
              <span className="text-xs text-muted-foreground">
                {profileQ + 1} / {PROFILE_QUESTIONS.length}
                <span className="ml-1 text-muted-foreground/50">· 관객 프로필</span>
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-violet-500 transition-all duration-500" style={{ width: `${progress + (100 / totalSteps)}%` }} />
            </div>
          </div>

          {/* 질문 */}
          <div className={`space-y-5 transition-opacity duration-200 ${animating ? "opacity-0" : "opacity-100"}`}>
            <div className="space-y-1">
              <p className="text-xs font-bold text-violet-500 uppercase tracking-widest">{pq.hint}</p>
              <h2 className="whitespace-pre-line text-2xl font-bold leading-snug text-foreground sm:text-3xl">{pq.question}</h2>
            </div>

            <div className="grid gap-3">
              {pq.options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleProfileAnswer(pq.id, opt.value)}
                  className="group flex items-center gap-4 rounded-2xl border-2 border-border bg-card px-5 py-4 text-left transition-all hover:border-violet-400 hover:bg-violet-50/50 hover:-translate-y-0.5 hover:shadow-sm"
                >
                  <span className="text-3xl shrink-0 transition-transform duration-200 group-hover:scale-110">{opt.emoji}</span>
                  <div>
                    <p className="text-sm font-bold text-foreground">{opt.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{opt.sub}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )
    }

    // 결과 / 완성 화면
    return (
      <div className="space-y-8 py-6">

        {/* ① 결과 카드 */}
        <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${persona.gradient} p-8 text-white shadow-2xl`}>
          <div className="pointer-events-none absolute inset-0 opacity-10">
            <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white" />
            <div className="absolute -bottom-12 -left-8 h-56 w-56 rounded-full bg-white" />
          </div>
          <div className="relative space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold uppercase tracking-widest text-white/70">나의 공연 DNA</p>
              {profileDone && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-bold">
                  <BadgeCheck className="h-3.5 w-3.5" /> 정밀 분석 완료
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <span className="text-6xl">{persona.emoji}</span>
              <div>
                <h2 className="text-3xl font-bold">{persona.name}</h2>
                <p className="mt-1 text-sm text-white/80">{persona.tagline}</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-white/90">{persona.desc}</p>
            <div className="flex flex-wrap gap-2 pt-1">
              {persona.traits.map((t) => (
                <span key={t} className="rounded-full border border-white/30 bg-white/20 px-3 py-1 text-xs font-semibold">{t}</span>
              ))}
            </div>
          </div>
        </div>

        {/* ② 취향 태그 (프로필 완료 후 부스트 태그 표시) */}
        {finalTags.length > 0 && (
          <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <p className="text-sm font-bold text-foreground">
                {profileDone ? "정밀 분석된 취향 태그" : "기본 취향 태그"}
              </p>
              {!profileDone && (
                <span className="ml-auto text-xs text-muted-foreground">프로필 완성 시 더 정확해져요</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {finalTags.slice(0, 8).map((tag) => (
                <TasteTagBadge key={tag} tag={tag} boosted={profileDone} />
              ))}
            </div>
          </div>
        )}

        {/* ③ 프로필 유도 (result 단계) or 완료 메시지 (complete 단계) */}
        {phase === "result" ? (
          <div className="rounded-2xl border-2 border-violet-200 bg-violet-50/50 p-5 space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-bold text-violet-700">추천 정밀도를 높이고 싶다면?</p>
              <p className="text-xs text-violet-600/80">
                3가지만 더 알려주시면 취향 태그가 더 정확하게 조정되고,<br />
                직업·관람 빈도·탐색 패턴에 맞는 공연을 우선 추천해 드려요.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setProfileQ(0); setPhase("profile") }}
                className="flex-1 rounded-full bg-violet-600 py-3 text-sm font-bold text-white transition hover:bg-violet-700"
              >
                3문항 더 답하기 →
              </button>
              <button
                type="button"
                onClick={() => setPhase("complete")}
                className="rounded-full border border-border px-4 py-3 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
              >
                건너뛰기
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5">
            <div className="flex items-start gap-3">
              <BadgeCheck className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-emerald-700">취향 프로필 완성!</p>
                <p className="text-xs text-emerald-600/80">
                  {savingProfile ? "프로필을 저장하는 중..." : "관객 프로필 정보가 반영돼 더 정확한 공연을 추천해 드릴게요."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ④ 맞춤 공연 추천 */}
        {matchedCampaigns.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <p className="text-sm font-bold text-foreground">지금 응모 가능한 맞춤 공연</p>
              </div>
              <Link href="/" className="flex items-center gap-1 text-xs text-muted-foreground transition hover:text-primary">
                더 보기 <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="space-y-3">
              {matchedCampaigns.map(({ campaign, score }) => {
                const matchLabel = formatMatchScore(score)
                const colorClass = matchScoreColorClass(score)
                return (
                  <Link
                    key={campaign.id}
                    href={campaign.slug ? `/invites/${campaign.slug}` : "/invites"}
                    className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition hover:border-primary hover:shadow-sm"
                  >
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted">
                      {campaign.poster_image ? (
                        <Image
                          src={campaign.poster_image}
                          alt={campaign.title}
                          fill
                          className="object-cover"
                          unoptimized={campaign.poster_image.startsWith("http://www.kopis.or.kr")}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-2xl">🎫</div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-bold text-foreground group-hover:text-primary transition">{campaign.title}</p>
                      <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{campaign.one_line_intro ?? campaign.description ?? ""}</p>
                      <div className="mt-1.5 flex items-center gap-2">
                        {matchLabel && (
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${colorClass}`}>
                            <Sparkles className="h-2.5 w-2.5" />{matchLabel}
                          </span>
                        )}
                        {campaign.ends_at && (
                          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Calendar className="h-2.5 w-2.5" />
                            {new Date(campaign.ends_at).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })} 마감
                          </span>
                        )}
                        {(campaign.entry_count ?? 0) > 0 && (
                          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Users className="h-2.5 w-2.5" />{(campaign.entry_count ?? 0).toLocaleString()}명
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary transition" />
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* ⑤ 추천 장르 */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <p className="text-sm font-bold text-foreground">이런 장르가 잘 맞아요</p>
          <div className="flex flex-wrap gap-2">
            {persona.genres.map((g) => (
              <span key={g} className="rounded-full bg-primary/10 px-3.5 py-1.5 text-sm font-semibold text-primary">{g}</span>
            ))}
          </div>
        </div>

        {/* ⑥ CTA */}
        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 rounded-full bg-primary py-4 text-sm font-bold text-primary-foreground shadow-stage transition-all hover:-translate-y-0.5 hover:bg-primary/90"
          >
            홈에서 맞춤 추천 보기 →
          </Link>
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center justify-center gap-2 rounded-full border-2 border-border py-4 text-sm font-bold text-foreground transition-all hover:border-primary hover:text-primary"
          >
            {copied ? <><Check className="h-4 w-4 text-emerald-500" /> 복사됐어요!</> : <><Share2 className="h-4 w-4" /> 결과 공유하기</>}
          </button>
        </div>

        <div className="text-center">
          <button type="button" onClick={handleRestart} className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground transition">
            다시 테스트하기
          </button>
        </div>

        {/* ⑦ 다른 유형 */}
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">다른 공연 취향 유형</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(Object.entries(PERSONAS) as [PersonaKey, typeof PERSONAS[PersonaKey]][])
              .filter(([key]) => key !== result)
              .map(([key, p]) => (
                <Link
                  key={key}
                  href={`/taste?result=${key}`}
                  className="rounded-2xl border border-border bg-card px-4 py-3 text-center transition hover:border-primary"
                  onClick={() => { setResult(key as PersonaKey); setPhase("result"); setProfile({}); setBoostedTags([]) }}
                >
                  <p className="text-2xl">{p.emoji}</p>
                  <p className="mt-1 text-xs font-bold text-foreground">{p.name}</p>
                </Link>
              ))}
          </div>
        </div>
      </div>
    )
  }

  return null
}

// ═══════════════════════════════════════════════════════════
// 취향 태그 배지
// ═══════════════════════════════════════════════════════════

const TAG_META: Record<TasteTag, { label: string; emoji: string }> = {
  musical_fan:       { label: "뮤지컬",       emoji: "🎵" },
  theater_purist:    { label: "연극",          emoji: "🎭" },
  classical_lover:   { label: "클래식",        emoji: "🎻" },
  dance_explorer:    { label: "무용",          emoji: "💃" },
  variety_enjoyer:   { label: "버라이어티",    emoji: "🎪" },
  traditional_arts:  { label: "전통예술",      emoji: "🥁" },
  immersive_seeker:  { label: "몰입 체험",     emoji: "🌀" },
  healing_seeker:    { label: "감동·힐링",     emoji: "🥲" },
  humor_first:       { label: "유머·오락",     emoji: "😂" },
  intellectual:      { label: "지적 자극",     emoji: "🧠" },
  visual_first:      { label: "비주얼",        emoji: "✨" },
  date_watching:     { label: "데이트",        emoji: "💑" },
  friend_group:      { label: "친구 모임",     emoji: "👫" },
  solo_deep:         { label: "혼자 감상",     emoji: "🎧" },
  family_friendly:   { label: "가족",          emoji: "👨‍👩‍👧" },
  star_fan:          { label: "스타 팬",       emoji: "⭐" },
  creator_follower:  { label: "창작진 추종",   emoji: "🎬" },
  international_hit: { label: "해외 유명작",   emoji: "🌍" },
  value_hunter:      { label: "가성비",        emoji: "💸" },
  new_release:       { label: "신작·초연",     emoji: "🚀" },
}

function TasteTagBadge({ tag, boosted }: { tag: TasteTag; boosted: boolean }) {
  const meta = TAG_META[tag]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
      boosted
        ? "bg-violet-100 text-violet-700 border border-violet-200"
        : "bg-primary/10 text-primary"
    }`}>
      {meta.emoji} {meta.label}
    </span>
  )
}
