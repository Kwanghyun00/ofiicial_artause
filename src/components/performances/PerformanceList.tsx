/**
 * PerformanceList 컴포넌트
 *
 * 공연 목록을 그리드 형태로 표시합니다.
 *
 * 주요 기능:
 * - 공연 카드 그리드 레이아웃
 * - 포스터 이미지 표시
 * - 공연 상세 페이지로 이동
 *
 * 반응형:
 * - 모바일: 1-2열
 * - 태블릿: 3열
 * - 데스크톱: 4-5열
 */
"use client";

import Link from "next/link";
import Image from "next/image";

/**
 * 공연 데이터 타입
 */
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

type Props = {
  performances: Performance[];
};

export function PerformanceList({ performances }: Props) {
  return (
    <div className="grid grid-cols-1 gap-2.5 sm:gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
      {performances.length ? (
        performances.map((performance, index) => (
          <PerformanceCard key={performance.id} performance={performance} index={index} />
        ))
      ) : (
        <div className="col-span-full rounded-lg sm:rounded-2xl border-2 border-dashed border-slate-200 bg-white p-8 sm:p-12 text-center">
          <p className="text-sm sm:text-base font-medium text-slate-400">등록된 공연이 없습니다</p>
        </div>
      )}
    </div>
  );
}

function PerformanceCard({ performance, index }: { performance: Performance; index: number }) {
  const period = formatPeriod(performance.period_start, performance.period_end);
  const genreColor = getGenreColor(performance.tags?.[0]);

  return (
    <Link href={`/performances/${performance.slug}`}>
      <article
        className="group relative overflow-hidden rounded-lg sm:rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md"
        style={{ animationDelay: `${index * 50}ms` }}
      >
        {/* 장르 태그 */}
        {performance.tags && performance.tags[0] && (
          <div className="absolute left-2 top-2 z-10">
            <span className={`rounded px-1.5 sm:px-2 py-0.5 text-xs font-bold ${genreColor}`}>
              {performance.tags[0]}
            </span>
          </div>
        )}

        {/* Poster Image */}
        <div className="relative h-40 w-full overflow-hidden bg-slate-100 sm:h-48">
          {performance.poster_url ? (
            <Image
              src={performance.poster_url}
              alt={`${performance.title} 포스터`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-3xl sm:text-4xl">🎭</div>
          )}
        </div>

        {/* Content - 정보 밀도 높게 */}
        <div className="p-2.5 sm:p-3">
          <h3 className="line-clamp-2 text-sm font-bold text-slate-900 leading-tight">{performance.title}</h3>
          <div className="mt-1.5 sm:mt-2 space-y-0.5 text-xs text-slate-600">
            {performance.region && (
              <div className="flex items-center gap-1">
                <span className="text-xs">📍</span>
                <span className="truncate">{performance.region}</span>
              </div>
            )}
            {period && (
              <div className="flex items-center gap-1">
                <span className="text-xs">📅</span>
                <span className="truncate">{period}</span>
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}

/**
 * 장르별 색상 매핑
 */
function getGenreColor(genre?: string | null): string {
  if (!genre) return "bg-slate-100 text-slate-700";

  const lowerGenre = genre.toLowerCase();
  if (lowerGenre.includes("뮤지컬")) return "bg-purple-100 text-purple-700";
  if (lowerGenre.includes("연극")) return "bg-blue-100 text-blue-700";
  if (lowerGenre.includes("클래식") || lowerGenre.includes("음악")) return "bg-indigo-100 text-indigo-700";
  if (lowerGenre.includes("무용") || lowerGenre.includes("댄스")) return "bg-pink-100 text-pink-700";
  if (lowerGenre.includes("전시") || lowerGenre.includes("미술")) return "bg-amber-100 text-amber-700";

  return "bg-slate-100 text-slate-700";
}

function formatPeriod(start?: string | null, end?: string | null) {
  if (!start && !end) return null;
  const startText = start ? formatDate(start) : "?";
  const endText = end ? formatDate(end) : "?";
  return `${startText} ~ ${endText}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("ko-KR", {
    month: "short",
    day: "numeric",
  });
}
