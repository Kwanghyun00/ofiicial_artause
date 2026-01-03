"use client"

import { useMemo, useState } from "react"
import { CampaignBoard } from "@/components/event-center"
import { Search } from "lucide-react"

type Campaign = {
  id: string
  slug?: string | null
  title: string
  description?: string | null
  starts_at?: string | null
  ends_at?: string | null
}

type Props = {
  campaigns: Campaign[]
}

type CampaignStatus = "all" | "active" | "upcoming" | "closed"

function getStatus(campaign: Campaign): CampaignStatus {
  const now = Date.now()
  const starts = campaign.starts_at ? new Date(campaign.starts_at).getTime() : null
  const ends = campaign.ends_at ? new Date(campaign.ends_at).getTime() : null
  if (starts && starts > now) return "upcoming"
  if (ends && ends < now) return "closed"
  return "active"
}

export function EventsExplorer({ campaigns }: Props) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<CampaignStatus>("all")

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((campaign) => {
      const normalizedQuery = searchQuery.trim().toLowerCase()
      const matchesSearch =
        normalizedQuery === "" ||
        campaign.title.toLowerCase().includes(normalizedQuery) ||
        (campaign.description?.toLowerCase() ?? "").includes(normalizedQuery)
      const matchesStatus = statusFilter === "all" || getStatus(campaign) === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [campaigns, searchQuery, statusFilter])

  const counts = useMemo(
    () => ({
      all: campaigns.length,
      active: campaigns.filter((c) => getStatus(c) === "active").length,
      upcoming: campaigns.filter((c) => getStatus(c) === "upcoming").length,
      closed: campaigns.filter((c) => getStatus(c) === "closed").length,
    }),
    [campaigns],
  )

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-primary">실시간 초대 탐색기</p>
            <h3 className="text-xl font-bold text-foreground">관심 있는 초대 이벤트를 조건별로 찾아보세요</h3>
            <p className="text-sm text-muted-foreground">마감 일정이나 프로그램 키워드로 검색하면 원하는 초대를 빠르게 찾을 수 있습니다.</p>
          </div>

          <div className="rounded-2xl border border-border/70 bg-background px-4 py-3">
            <label htmlFor="campaign-search" className="text-xs font-semibold text-muted-foreground">
              검색어 입력
            </label>
            <div className="mt-1 flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                id="campaign-search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="공연, 전시, 공간 이름 또는 키워드를 입력하세요"
                className="h-10 flex-1 bg-transparent text-sm outline-none"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2" role="group" aria-label="상태 필터">
            {[
              { value: "all", label: "전체", count: counts.all },
              { value: "active", label: "모집 중", count: counts.active },
              { value: "upcoming", label: "오픈 예정", count: counts.upcoming },
              { value: "closed", label: "마감", count: counts.closed },
            ].map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setStatusFilter(filter.value as CampaignStatus)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  statusFilter === filter.value
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-white text-muted-foreground hover:border-primary/40"
                }`}
              >
                <span>{filter.label}</span>
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs text-primary-foreground">{filter.count}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <div>
        <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
          <p>
            총 <span className="font-semibold text-primary">{filteredCampaigns.length}</span>개의 초대를 찾았습니다.
          </p>
          {searchQuery && (
            <button className="text-xs font-semibold text-primary hover:underline" onClick={() => setSearchQuery("")}>
              검색 초기화
            </button>
          )}
        </div>

        {filteredCampaigns.length > 0 ? (
          <CampaignBoard campaigns={filteredCampaigns as any} />
        ) : (
          <div className="rounded-3xl border-2 border-dashed border-border bg-background px-8 py-12 text-center text-sm text-muted-foreground">
            조건에 맞는 초대가 없습니다.
            <br />
            다른 검색어나 필터를 선택해 주세요.
          </div>
        )}
      </div>
    </div>
  )
}
