/**
 * PerformanceExplorer 컴포넌트
 *
 * 공연 검색 및 필터링 기능을 제공하는 클라이언트 컴포넌트
 *
 * 주요 기능:
 * - 텍스트 검색 (제목, 지역)
 * - 장르 필터 (전체, 뮤지컬, 연극, 클래식, 무용, 전시)
 * - 결과 카운트 표시
 * - 실시간 필터링
 */
"use client";

import { useState, useMemo } from "react";
import { PerformanceList } from "./PerformanceList";

type Performance = {
  id: string;
  slug: string;
  title: string;
  region?: string | null;
  tags?: string[] | null;
  period_start?: string | null;
  period_end?: string | null;
  poster_url?: string | null;
};

type GenreFilter = "all" | "musical" | "play" | "classic" | "dance" | "exhibition";

type Props = {
  performances: Performance[];
};

/**
 * 장르 필터링 함수
 */
function matchesGenre(performance: Performance, genre: GenreFilter): boolean {
  if (genre === "all") return true;
  if (!performance.tags || performance.tags.length === 0) return false;

  const tag = performance.tags[0].toLowerCase();

  switch (genre) {
    case "musical":
      return tag.includes("뮤지컬");
    case "play":
      return tag.includes("연극");
    case "classic":
      return tag.includes("클래식") || tag.includes("음악");
    case "dance":
      return tag.includes("무용") || tag.includes("댄스");
    case "exhibition":
      return tag.includes("전시") || tag.includes("미술");
    default:
      return true;
  }
}

export function PerformanceExplorer({ performances }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [genreFilter, setGenreFilter] = useState<GenreFilter>("all");

  /**
   * 필터링된 공연 목록
   * 검색어와 장르 필터를 동시에 적용
   */
  const filteredPerformances = useMemo(() => {
    return performances.filter((performance) => {
      // 검색어 필터
      const matchesSearch = searchQuery === "" ||
        performance.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (performance.region?.toLowerCase() || "").includes(searchQuery.toLowerCase());

      // 장르 필터
      const matchesGenreFilter = matchesGenre(performance, genreFilter);

      return matchesSearch && matchesGenreFilter;
    });
  }, [performances, searchQuery, genreFilter]);

  // 장르별 카운트
  const counts = useMemo(() => ({
    all: performances.length,
    musical: performances.filter(p => matchesGenre(p, "musical")).length,
    play: performances.filter(p => matchesGenre(p, "play")).length,
    classic: performances.filter(p => matchesGenre(p, "classic")).length,
    dance: performances.filter(p => matchesGenre(p, "dance")).length,
    exhibition: performances.filter(p => matchesGenre(p, "exhibition")).length,
  }), [performances]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Search and Filter Bar */}
      <div className="rounded-lg sm:rounded-xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
        {/* Search Input */}
        <div className="mb-3 sm:mb-4">
          <label htmlFor="search" className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">
            공연 검색
          </label>
          <input
            id="search"
            type="text"
            placeholder="공연 제목이나 지역으로 검색하세요..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 sm:px-4 py-2.5 sm:py-3 text-sm outline-none transition-all focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        {/* Genre Filter Tabs - 모바일에서 스크롤 가능 */}
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex gap-2 min-w-max sm:min-w-0 sm:flex-wrap pb-2 sm:pb-0">
            <FilterTab
              active={genreFilter === "all"}
              onClick={() => setGenreFilter("all")}
              label="전체"
              count={counts.all}
              color="bg-slate-900"
            />
            <FilterTab
              active={genreFilter === "musical"}
              onClick={() => setGenreFilter("musical")}
              label="뮤지컬"
              count={counts.musical}
              color="bg-purple-600"
            />
            <FilterTab
              active={genreFilter === "play"}
              onClick={() => setGenreFilter("play")}
              label="연극"
              count={counts.play}
              color="bg-blue-600"
            />
            <FilterTab
              active={genreFilter === "classic"}
              onClick={() => setGenreFilter("classic")}
              label="클래식"
              count={counts.classic}
              color="bg-indigo-600"
            />
            <FilterTab
              active={genreFilter === "dance"}
              onClick={() => setGenreFilter("dance")}
              label="무용"
              count={counts.dance}
              color="bg-pink-600"
            />
            <FilterTab
              active={genreFilter === "exhibition"}
              onClick={() => setGenreFilter("exhibition")}
              label="전시"
              count={counts.exhibition}
              color="bg-amber-600"
            />
          </div>
        </div>
      </div>

      {/* Results */}
      <div>
        <div className="mb-3 sm:mb-4 flex items-center justify-between gap-2">
          <p className="text-xs sm:text-sm text-slate-600">
            <span className="font-bold text-slate-900">{filteredPerformances.length}개</span>의 공연
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

        {filteredPerformances.length > 0 ? (
          <PerformanceList performances={filteredPerformances} />
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
  color: string;
};

function FilterTab({ active, onClick, label, count, color }: FilterTabProps) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 sm:gap-2 rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-all shrink-0 ${
        active
          ? `${color} text-white`
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
