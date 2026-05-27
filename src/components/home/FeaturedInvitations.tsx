"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Calendar, Users } from "lucide-react"
import type { Campaign } from "./types"

type Props = { campaigns: Campaign[] }
type TabKey = "popular" | "closing" | "new"

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: "popular", label: "인기순" },
  { key: "closing", label: "마감임박" },
  { key: "new", label: "신규" },
]

export function FeaturedInvitations({ campaigns }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>("popular")
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const now = useMemo(() => Date.now(), [])

  const sorted = useMemo(() => {
    const horizon = now + 72 * 60 * 60 * 1000

    const popular = [...campaigns]
      .sort((a, b) => (b.entry_count ?? 0) - (a.entry_count ?? 0))
      .slice(0, 6)

    const closing = campaigns
      .filter((c) => {
        if (!c.ends_at) return false
        const t = new Date(c.ends_at).getTime()
        return t > now && t <= horizon
      })
      .sort((a, b) => new Date(a.ends_at!).getTime() - new Date(b.ends_at!).getTime())
      .slice(0, 6)

    const newest = [...campaigns]
      .sort((a, b) => {
        const at = a.starts_at ? new Date(a.starts_at).getTime() : 0
        const bt = b.starts_at ? new Date(b.starts_at).getTime() : 0
        return bt - at
      })
      .slice(0, 6)

    return { popular, closing, newest }
  }, [campaigns, now])

  const displayed =
    activeTab === "popular" ? sorted.popular :
    activeTab === "closing" ? sorted.closing :
    sorted.newest

  if (!campaigns.length) return null

  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* 섹션 헤더 */}
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2.5">
            <span className="cue">Scene 01</span>
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">
              지금 신청하면 무료로 볼 수 있는 공연
            </h2>
            <p className="text-sm text-muted-foreground sm:text-base">
              당첨되면 공연을 무료로 즐길 수 있어요. 지금 응모해 보세요.
            </p>
          </div>

          {/* 탭 필터 */}
          <div className="flex shrink-0 gap-1.5">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`relative rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                  activeTab === tab.key
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                    : "text-foreground/60 hover:text-foreground"
                }`}
              >
                {tab.label}
                {tab.key === "closing" && sorted.closing.length > 0 && (
                  <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-white">
                    {sorted.closing.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 카드 그리드 */}
        {displayed.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            {activeTab === "closing" ? "72시간 내 마감 예정 이벤트가 없습니다." : "이벤트가 없습니다."}
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {displayed.map((campaign, idx) => (
              <CampaignCard key={campaign.id} campaign={campaign} index={idx} />
            ))}
          </div>
        )}

        {/* 더 보기 */}
        {campaigns.length > 6 && (
          <div className="mt-10 text-center">
            <Link
              href="/invites"
              className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground/80 transition hover:border-primary/60 hover:text-primary"
            >
              전체 이벤트 보기
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}

function CampaignCard({ campaign, index }: { campaign: Campaign; index: number }) {
  // eslint-disable-next-line react-hooks/purity
  const nowMs = Date.now()
  const isUrgent = campaign.ends_at
    ? new Date(campaign.ends_at).getTime() - nowMs < 72 * 60 * 60 * 1000
    : false

  return (
    <article className="group spotlight-card overflow-hidden">
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
        </div>
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
              마감{" "}
              <span className="font-semibold text-foreground">{formatDate(campaign.ends_at)}</span>
            </p>
          )}
          <p className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 shrink-0" />
            {(campaign.entry_count ?? 0).toLocaleString()}명 응모
          </p>
          {campaign.reward && (
            <p className="text-primary font-semibold">🎫 {campaign.reward}</p>
          )}
        </div>

        <Link
          href={campaign.slug ? `/invites/${campaign.slug}` : "/invites"}
          className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary py-2.5 text-sm font-bold text-primary-foreground shadow-sm shadow-primary/15 transition hover:-translate-y-px hover:bg-primary/90"
        >
          이벤트 참여하기
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  )
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("ko-KR", { month: "long", day: "numeric" })
}
