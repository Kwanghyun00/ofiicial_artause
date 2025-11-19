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
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
      {performances.length ? (
        performances.map((performance, index) => (
          <PerformanceCard key={performance.id} performance={performance} index={index} />
        ))
      ) : (
        <div className="col-span-full rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
          <p className="text-base font-medium text-slate-400">등록된 공연이 없습니다</p>
        </div>
      )}
    </div>
  );
}

function PerformanceCard({ performance, index }: { performance: Performance; index: number }) {
  const period = formatPeriod(performance.period_start, performance.period_end);

  return (
    <Link href={`/performances/${performance.slug}`}>
      <article
        className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md"
        style={{ animationDelay: `${index * 50}ms` }}
      >
        {/* Poster Image */}
        <div className="relative h-40 w-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 sm:h-48">
          {performance.poster_url ? (
            <Image
              src={performance.poster_url}
              alt={`${performance.title} 포스터`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-3xl">🎭</div>
          )}
        </div>

        {/* Content */}
        <div className="p-3">
          <h3 className="line-clamp-2 text-sm font-bold text-slate-900">{performance.title}</h3>
          <div className="mt-1.5 flex items-center justify-between text-xs text-slate-500">
            <span>{performance.region ?? "미정"}</span>
          </div>
        </div>
      </article>
    </Link>
  );
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
