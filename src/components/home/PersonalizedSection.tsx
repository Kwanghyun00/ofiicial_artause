"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Calendar, Sparkles, Users } from "lucide-react"
import { rankCampaigns, formatMatchScore, matchScoreColorClass, tagsFromPersona } from "@/lib/taste/engine"
import { PERSONAS } from "@/components/taste/TasteQuiz"
import type { Campaign } from "./types"
import type { PersonaKey } from "@/lib/taste/config"

// ── Phase 2 준비: 신호 트래킹 ────────────────────────────────
import { trackTasteSignal } from "@/lib/taste/actions"
import type { TasteTag } from "@/lib/taste/config"

async function recordClick(campaignId: string, campaignTags: TasteTag[]) {
  try {
    await trackTasteSignal({ campaignId, signalType: "click", tasteTags: campaignTags })
  } catch {
    // 트래킹 실패는 UX에 영향 없음
  }
}

// ── 컴포넌트 ─────────────────────────────────────────────────

interface Props {
  campaigns: Campaign[]
}

export function PersonalizedSection({ campaigns }: Props) {
  const [persona, setPersona] = useState<PersonaKey | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
    try {
      const saved = localStorage.getItem("artause_persona") as PersonaKey | null
      if (saved && ["romantic", "explorer", "beginner", "connoisseur"].includes(saved)) {
        setPersona(saved)
      }
    } catch {
      // localStorage 접근 불가 환경 무시
    }
  }, [])

  // 취향 매칭 스코어 계산 (클라이언트 사이드, 추가 API 호출 없음)
  const ranked = useMemo(() => {
    if (!persona || !campaigns.length) return []
    const userTags = tagsFromPersona(persona)
    return rankCampaigns(campaigns, userTags, { limit: 6 })
  }, [persona, campaigns])

  // SSR hydration 전에는 렌더링하지 않음 (localStorage 접근 불가)
  if (!mounted) return null

  // ── 페르소나 없음: 취향 테스트 유도 배너 ──────────────────
  if (!persona) {
    return (
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/8 via-primary/4 to-transparent border border-primary/15 px-8 py-10 sm:px-12 sm:py-14">
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary/5" />
            <div className="pointer-events-none absolute -bottom-20 -left-10 h-72 w-72 rounded-full bg-primary/4" />

            <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-widest text-primary">
                    맞춤 추천
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                  내 취향에 딱 맞는 공연을 찾아드릴게요
                </h2>
                <p className="text-sm text-muted-foreground sm:text-base">
                  5가지 질문으로 공연 DNA를 분석하면 취향에 맞는 초대권 이벤트를 추천해 드립니다.
                </p>

                {/* 4가지 유형 미리보기 */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {(["romantic", "explorer", "beginner", "connoisseur"] as PersonaKey[]).map((key) => {
                    const p = PERSONAS[key]
                    return (
                      <span
                        key={key}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-foreground"
                      >
                        {p.emoji} {p.name}
                      </span>
                    )
                  })}
                </div>
              </div>

              <Link
                href="/taste"
                className="shrink-0 rounded-full bg-primary px-8 py-4 text-sm font-bold text-primary-foreground shadow-stage transition-all hover:-translate-y-0.5 hover:bg-primary/90 whitespace-nowrap"
              >
                취향 테스트 하기 →
              </Link>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (!ranked.length) return null

  const personaMeta = PERSONAS[persona]

  // ── 페르소나 있음: 개인화 추천 ────────────────────────────
  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* 섹션 헤더 */}
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="cue">맞춤 추천</span>
            </div>
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">
              <span className={personaMeta.accentClass}>{personaMeta.emoji} {personaMeta.name}</span>을 위한 공연
            </h2>
            <p className="text-sm text-muted-foreground sm:text-base">
              취향 분석 결과를 바탕으로 고른 초대권 이벤트예요.
            </p>
          </div>

          <Link
            href="/taste"
            className="shrink-0 self-start md:self-auto inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-semibold text-muted-foreground transition hover:border-primary/60 hover:text-primary"
          >
            취향 다시 테스트하기
          </Link>
        </div>

        {/* 카드 그리드 */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ranked.map(({ campaign, score, campaignTags, isExploration }, idx) => (
            <PersonalizedCard
              key={campaign.id}
              campaign={campaign}
              score={score}
              campaignTags={campaignTags}
              isExploration={isExploration}
              index={idx}
              onCardClick={() => recordClick(campaign.id, campaignTags)}
            />
          ))}
        </div>

        {/* 더 보기 */}
        <div className="mt-10 text-center">
          <Link
            href="/invites"
            className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground/80 transition hover:border-primary/60 hover:text-primary"
          >
            전체 이벤트 보기
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

// ── 개인화 캠페인 카드 ────────────────────────────────────────

interface CardProps {
  campaign: Campaign
  score: number
  campaignTags: string[]
  isExploration: boolean
  index: number
  onCardClick: () => void
}

function PersonalizedCard({ campaign, score, campaignTags, isExploration, index, onCardClick }: CardProps) {
  const matchLabel = formatMatchScore(score)
  const colorClass = matchScoreColorClass(score)
  // eslint-disable-next-line react-hooks/purity
  const nowMs = Date.now()
  const isUrgent = campaign.ends_at
    ? new Date(campaign.ends_at).getTime() - nowMs < 72 * 60 * 60 * 1000
    : false

  return (
    <article className="group spotlight-card overflow-hidden">
      <Link
        href={campaign.slug ? `/invites/${campaign.slug}` : "/invites"}
        onClick={onCardClick}
        className="block"
      >
        {/* 포스터 */}
        <div className="relative h-44 w-full overflow-hidden">
          {campaign.poster_image ? (
            <Image
              src={campaign.poster_image}
              alt={campaign.title}
              fill
              className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
              unoptimized={campaign.poster_image.startsWith("http://www.kopis.or.kr")}
            />
          ) : (
            <div
              className="h-full w-full"
              style={{
                background: `linear-gradient(135deg, oklch(0.64 0.18 ${55 + index * 12} / 0.25), oklch(0.58 0.22 ${38 + index * 8} / 0.15))`,
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />

          {/* 배지 */}
          <div className="absolute left-3 top-3 flex items-center gap-2">
            <span className="badge badge-primary">모집 중</span>
            {isUrgent && <span className="badge badge-accent">마감임박</span>}
            {isExploration && (
              <span className="inline-flex items-center gap-1 rounded-full bg-violet-600/90 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                새 장르
              </span>
            )}
          </div>

          {/* 취향 매칭 점수 배지 */}
          {matchLabel && (
            <div className="absolute right-3 top-3">
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${colorClass}`}>
                <Sparkles className="h-3 w-3" />
                {matchLabel}
              </span>
            </div>
          )}
        </div>

        {/* 내용 */}
        <div className="flex flex-col gap-3 p-4 sm:p-5">
          <div>
            <h3 className="line-clamp-1 text-base font-bold text-foreground sm:text-lg">
              {campaign.title}
            </h3>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {campaign.one_line_intro ?? campaign.description ?? "공연 초대권 이벤트로 관객과의 접점을 확장합니다."}
            </p>
          </div>

          <div className="space-y-1.5 text-xs text-muted-foreground">
            {campaign.ends_at && (
              <p className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                {new Date(campaign.ends_at).toLocaleDateString("ko-KR", { month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })} 마감
              </p>
            )}
            {campaign.entry_count != null && campaign.entry_count > 0 && (
              <p className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 shrink-0" />
                {campaign.entry_count.toLocaleString()}명 응모 중
              </p>
            )}
          </div>
        </div>
      </Link>
    </article>
  )
}
