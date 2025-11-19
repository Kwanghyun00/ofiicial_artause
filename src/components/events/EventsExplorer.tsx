/**
 * EventsExplorer 컴포넌트
 *
 * 이벤트 검색 및 필터링 기능을 제공하는 클라이언트 컴포넌트
 *
 * 주요 기능:
 * - 텍스트 검색 (제목, 설명)
 * - 상태 필터 (전체, 모집 중, 오픈 예정, 종료)
 * - 결과 카운트 표시
 * - 실시간 필터링
 */
"use client";

import { useState, useMemo } from "react";
import { CampaignBoard } from "@/components/event-center";

type Campaign = {
  id: string;
  slug?: string | null;
  title: string;
  description?: string | null;
  starts_at?: string | null;
  ends_at?: string | null;
  reward?: string | null;
  [key: string]: unknown;
};

type CampaignStatus = "all" | "active" | "upcoming" | "closed";

type Props = {
  campaigns: Campaign[];
};

/**
 * 캠페인 상태 판별 함수
 */
function getStatus(campaign: Campaign): "active" | "upcoming" | "closed" {
  const now = Date.now();
  const starts = campaign.starts_at ? new Date(campaign.starts_at).getTime() : null;
  const ends = campaign.ends_at ? new Date(campaign.ends_at).getTime() : null;

  if (starts && starts > now) return "upcoming";
  if (ends && ends < now) return "closed";
  return "active";
}

export function EventsExplorer({ campaigns }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<CampaignStatus>("all");

  /**
   * 필터링된 캠페인 목록
   * 검색어와 상태 필터를 동시에 적용
   */
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((campaign) => {
      // 검색어 필터
      const matchesSearch = searchQuery === "" ||
        campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (campaign.description?.toLowerCase() || "").includes(searchQuery.toLowerCase());

      // 상태 필터
      const campaignStatus = getStatus(campaign);
      const matchesStatus = statusFilter === "all" || campaignStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [campaigns, searchQuery, statusFilter]);

  // 상태별 카운트
  const counts = useMemo(() => ({
    all: campaigns.length,
    active: campaigns.filter(c => getStatus(c) === "active").length,
    upcoming: campaigns.filter(c => getStatus(c) === "upcoming").length,
    closed: campaigns.filter(c => getStatus(c) === "closed").length,
  }), [campaigns]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Search and Filter Bar */}
      <div className="rounded-lg sm:rounded-xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
        {/* Search Input */}
        <div className="mb-3 sm:mb-4">
          <label htmlFor="search" className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">
            이벤트 검색
          </label>
          <input
            id="search"
            type="text"
            placeholder="이벤트 제목이나 설명으로 검색하세요..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 sm:px-4 py-2.5 sm:py-3 text-sm outline-none transition-all focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        {/* Status Filter Tabs - 모바일에서 스크롤 가능 */}
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex gap-2 min-w-max sm:min-w-0 sm:flex-wrap pb-2 sm:pb-0">
            <FilterTab
              active={statusFilter === "all"}
              onClick={() => setStatusFilter("all")}
              label="전체"
              count={counts.all}
            />
            <FilterTab
              active={statusFilter === "active"}
              onClick={() => setStatusFilter("active")}
              label="모집 중"
              count={counts.active}
            />
            <FilterTab
              active={statusFilter === "upcoming"}
              onClick={() => setStatusFilter("upcoming")}
              label="오픈 예정"
              count={counts.upcoming}
            />
            <FilterTab
              active={statusFilter === "closed"}
              onClick={() => setStatusFilter("closed")}
              label="종료"
              count={counts.closed}
            />
          </div>
        </div>
      </div>

      {/* Results */}
      <div>
        <div className="mb-3 sm:mb-4 flex items-center justify-between gap-2">
          <p className="text-xs sm:text-sm text-slate-600">
            <span className="font-bold text-slate-900">{filteredCampaigns.length}개</span>의 이벤트
            {searchQuery && <span className="hidden sm:inline"> (검색: "{searchQuery}")</span>}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs sm:text-sm text-slate-700 hover:text-slate-900 transition-colors font-medium shrink-0"
            >
              초기화 ×
            </button>
          )}
        </div>

        {filteredCampaigns.length > 0 ? (
          <CampaignBoard campaigns={filteredCampaigns as any} />
        ) : (
          <div className="rounded-lg sm:rounded-xl border border-slate-200 bg-white p-8 sm:p-12 text-center">
            <p className="text-sm sm:text-base font-medium text-slate-400">검색 결과가 없습니다</p>
            <p className="mt-2 text-xs sm:text-sm text-slate-500">
              다른 검색어나 필터를 사용해보세요
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * 필터 탭 컴포넌트
 */
type FilterTabProps = {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
};

function FilterTab({ active, onClick, label, count }: FilterTabProps) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 sm:gap-2 rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-all shrink-0 ${
        active
          ? "bg-slate-900 text-white"
          : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
      }`}
    >
      <span>{label}</span>
      <span className={`rounded px-1.5 sm:px-2 py-0.5 text-xs font-semibold ${
        active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
      }`}>
        {count}
      </span>
    </button>
  );
}
