"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Calendar, SlidersHorizontal, Users } from "lucide-react"
import { trackEvent } from "@/lib/analytics"

type Campaign = {
  id: string
  slug?: string | null
  title: string
  description?: string | null
  one_line_intro?: string | null
  starts_at?: string | null
  ends_at?: string | null
  reward?: string | null
  entry_count?: number | null
  poster_image?: string | null
  performances?: { region?: string | null; title?: string | null } | null
}

type FilterKey = "all" | "active" | "closing"

const FILTER_TABS: Array<{ key: FilterKey; label: string }> = [
  { key: "all", label: "전체" },
  { key: "active", label: "진행 중" },
  { key: "closing", label: "마감 임박" },
]

type Props = { campaigns: Campaign[] }

export function EventsGrid({ campaigns }: Props) {
  const [filter, setFilter] = useState<FilterKey>("all")
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const now = useMemo(() => Date.now(), [])

  const filtered = useMemo(() => {
    const horizon = now + 72 * 60 * 60 * 1000
    if (filter === "active") return campaigns.filter((c) => !isClosed(c, now))
    if (filter === "closing")
      return campaigns.filter((c) => {
        if (!c.ends_at) return false
        const t = new Date(c.ends_at).getTime()
        return t > now && t <= horizon
      })
    return campaigns
  }, [campaigns, filter, now])

  return (
    <section className="space-y-6">
      {/* 헤더 + 필터 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">전체 초대 이벤트</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {filtered.length}개의 이벤트
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilter(tab.key)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-all ${
                filter === tab.key
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 카드 그리드 */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-border/60 py-16 text-center">
          <p className="text-sm text-muted-foreground">해당하는 이벤트가 없습니다.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} now={now} />
          ))}
        </div>
      )}
    </section>
  )
}

function CampaignCard({ campaign, now }: { campaign: Campaign; now: number }) {
  const closed = isClosed(campaign, now)
  const href = campaign.slug ? `/invites/${campaign.slug}` : `/invites/${campaign.id}`
  const isUrgent =
    !closed &&
    !!campaign.ends_at &&
    new Date(campaign.ends_at).getTime() - now < 72 * 60 * 60 * 1000

  return (
    <article
      className={`spotlight-card group flex flex-col overflow-hidden ${closed ? "opacity-55 grayscale" : ""}`}
    >
      {/* 포스터 */}
      <div className="relative h-44 w-full overflow-hidden bg-muted">
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
              background:
                "linear-gradient(135deg, oklch(0.64 0.18 55 / 0.2), oklch(0.58 0.22 38 / 0.12))",
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />

        {/* 배지 — 우상단 */}
        <div className="absolute right-3 top-3">
          {closed ? (
            <span className="badge badge-muted">마감</span>
          ) : isUrgent ? (
            <span className="badge badge-accent">마감임박</span>
          ) : (
            <span className="badge badge-primary">모집 중</span>
          )}
        </div>
      </div>

      {/* 내용 */}
      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        {/* 보상 태그 */}
        {campaign.reward && (
          <span className="self-start text-[11px] font-semibold text-primary">
            🎫 {campaign.reward}
          </span>
        )}

        <div>
          <h3 className="line-clamp-1 text-base font-bold text-foreground sm:text-lg">
            {campaign.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {campaign.one_line_intro ??
              campaign.description ??
              "공연 초대권 이벤트로 관객과의 접점을 확장합니다."}
          </p>
        </div>

        <div className="mt-auto space-y-1.5 border-t border-border/50 pt-3 text-xs text-muted-foreground">
          <p className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            {campaign.ends_at
              ? `마감 ${formatDate(campaign.ends_at)}`
              : "상시 진행"}
          </p>
          <p className="flex items-center gap-1.5 text-primary font-medium">
            <Users className="h-3.5 w-3.5 shrink-0" />
            {(campaign.entry_count ?? 0).toLocaleString()}명 신청 중
          </p>
        </div>

        <Link
          href={href}
          onClick={() =>
            trackEvent("event_card_click", { id: campaign.id, title: campaign.title })
          }
          className="mt-1 inline-flex w-full items-center justify-center rounded-full bg-primary py-2.5 text-sm font-bold text-primary-foreground shadow-sm shadow-primary/15 transition hover:-translate-y-px hover:bg-primary/90"
        >
          {closed ? "상세 보기" : "이벤트 참여하기"}
        </Link>
      </div>
    </article>
  )
}

function isClosed(campaign: Campaign, now: number) {
  return campaign.ends_at ? new Date(campaign.ends_at).getTime() < now : false
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })
}
