"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Calendar, MapPin, Users } from "lucide-react"
import type { Campaign } from "./types"

type Props = {
  campaigns: Campaign[]
}

type TabKey = "popular" | "closing" | "new"

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: "popular", label: "인기순" },
  { key: "closing", label: "오늘마감" },
  { key: "new", label: "신규" },
]

const TAB_LIMIT = 4

export function FeaturedInvitations({ campaigns }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>("popular")
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const now = useMemo(() => Date.now(), [])

  const tabCampaigns = useMemo(() => {
    const horizon = now + 72 * 60 * 60 * 1000 // 72시간

    const popular = [...campaigns]
      .sort((a, b) => (b.entry_count ?? 0) - (a.entry_count ?? 0))
      .slice(0, TAB_LIMIT)

    const closing = campaigns
      .filter((c) => {
        if (!c.ends_at) return false
        const t = new Date(c.ends_at).getTime()
        return t > now && t <= horizon
      })
      .sort((a, b) => new Date(a.ends_at!).getTime() - new Date(b.ends_at!).getTime())
      .slice(0, TAB_LIMIT)

    const newest = [...campaigns]
      .sort((a, b) => {
        const aTime = a.starts_at ? new Date(a.starts_at).getTime() : 0
        const bTime = b.starts_at ? new Date(b.starts_at).getTime() : 0
        return bTime - aTime
      })
      .slice(0, TAB_LIMIT)

    return { popular, closing, newest }
  }, [campaigns])

  const displayed =
    activeTab === "popular"
      ? tabCampaigns.popular
      : activeTab === "closing"
        ? tabCampaigns.closing
        : tabCampaigns.newest

  if (!campaigns.length) return null

  return (
    <section className="space-y-8 border-t border-border/60 pt-16">
      <div className="space-y-3 text-center">
        <span className="cue">Scene 01</span>
        <h2 className="text-3xl font-semibold text-foreground md:text-4xl">지금 신청하면 무료로 볼 수 있는 공연</h2>
        <p className="text-base text-muted-foreground">당첨되면 무료로 공연을 즐길 수 있어요. 지금 응모해 보세요.</p>
      </div>

      {/* 탭 */}
      <div className="flex justify-center gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-full border px-5 py-2 text-sm font-semibold transition ${
              activeTab === tab.key
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background/60 text-foreground/80 hover:border-primary"
            }`}
          >
            {tab.label}
            {tab.key === "closing" && tabCampaigns.closing.length > 0 && (
              <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                {tabCampaigns.closing.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {displayed.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          {activeTab === "closing" ? "72시간 내 마감 예정 이벤트가 없습니다." : "이벤트가 없습니다."}
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {displayed.map((campaign) => (
            <article key={campaign.id} className="spotlight-card group overflow-hidden">
              {campaign.poster_image ? (
                <div className="relative h-48 w-full">
                  <Image
                    src={campaign.poster_image}
                    alt={campaign.title}
                    fill
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    unoptimized={campaign.poster_image.startsWith("http://www.kopis.or.kr")}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
                  <div className="absolute bottom-3 left-4 flex items-center gap-2 text-xs font-semibold text-white">
                    <span className="rounded-full border border-white/40 bg-black/40 px-3 py-1 backdrop-blur-sm">모집 중</span>
                    {campaign.reward && <span className="text-white/90">{campaign.reward}</span>}
                  </div>
                </div>
              ) : (
                <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-primary/25 via-transparent to-accent/20" />
              )}
              <div className="relative flex flex-col justify-between p-6">
                {!campaign.poster_image && (
                  <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-primary">
                    <span className="rounded-full border border-primary/30 bg-background/70 px-3 py-1">모집 중</span>
                    {campaign.reward && <span className="text-primary/80">{campaign.reward}</span>}
                  </div>
                )}
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-foreground">{campaign.title}</h3>
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {campaign.one_line_intro ?? campaign.description ?? "공연 초대권 이벤트로 관객과의 접점을 확장합니다."}
                  </p>
                </div>

                <div className="mt-6 space-y-2 text-sm">
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>인스타그램 · 온라인 참여</span>
                  </p>
                  {campaign.ends_at && (
                    <p className="flex items-center gap-2 text-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        마감 <span className="highlight-token">{formatDate(campaign.ends_at)}</span>
                      </span>
                    </p>
                  )}
                  <p className="flex items-center gap-2 text-primary">
                    <Users className="h-4 w-4" />
                    <span>{(campaign.entry_count ?? 0).toLocaleString()}명 응모</span>
                  </p>
                </div>

                <Link
                  href={campaign.slug ? `/events/${campaign.slug}` : "/contact"}
                  className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-base font-semibold text-primary-foreground transition group-hover:-translate-y-0.5 group-hover:bg-primary/90"
                >
                  이벤트 참여하기
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
  })
}
