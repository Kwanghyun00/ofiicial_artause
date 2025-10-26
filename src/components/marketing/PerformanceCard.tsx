import Link from "next/link";
import type { Database } from "@/lib/supabase/types";

type Performance = Database["public"]["Tables"]["performances"]["Row"];

type PerformanceCardProps = {
  performance: Performance;
  asFeatured?: boolean;
};

export function PerformanceCard({ performance, asFeatured = false }: PerformanceCardProps) {
  const period = buildPeriod(performance.period_start, performance.period_end);

  return (
    <Link
      href={`/shows/${performance.slug}`}
      className={`group relative flex flex-col overflow-hidden rounded-3xl border border-white/60 bg-white/60 shadow-lg transition hover:-translate-y-1 ${
        asFeatured ? "md:flex-row md:items-center" : ""
      }`}
    >
      <div
        className={`relative shrink-0 overflow-hidden bg-slate-200 ${
          asFeatured ? "h-[260px] w-full md:h-full md:max-w-sm" : "aspect-[3/4] w-full"
        }`}
      >
        <img
          src={performance.poster_url ?? "/images/mock/poster-default.svg"}
          alt={performance.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/35 via-transparent to-black/10 opacity-60" />
        <div className="absolute left-4 top-4 inline-flex items-center gap-2 text-xs font-medium text-white drop-shadow">
          <span className="badge bg-white/15 backdrop-blur">{performance.category ?? "Program"}</span>
          <span className="badge bg-indigo-600 text-white">{statusLabel(performance.status)}</span>
        </div>
      </div>
      <div className={`flex flex-1 flex-col gap-4 p-6 ${asFeatured ? "md:p-10" : ""}`}>
        <div>
          <h3 className={`text-xl font-semibold text-slate-900 ${asFeatured ? "md:text-2xl" : ""}`}>{performance.title}</h3>
          {performance.hero_headline ? (
            <p className="mt-2 text-sm text-slate-600">{performance.hero_headline}</p>
          ) : null}
        </div>
        <div className="grid gap-2 text-sm text-slate-600">
          {period ? <p>진행 기간 · {period}</p> : null}
          {performance.venue ? <p>공간 · {performance.venue}</p> : null}
          {performance.region ? <p>지역 · {performance.region}</p> : null}
        </div>
        {performance.hero_subtitle ? <p className="text-sm text-slate-500">{performance.hero_subtitle}</p> : null}
        <span className="text-sm font-semibold text-indigo-600 underline-offset-2 group-hover:underline">
          상세 보기
        </span>
      </div>
    </Link>
  );
}

function statusLabel(status?: string | null) {
  switch (status) {
    case "ongoing":
      return "진행 중";
    case "scheduled":
      return "오픈 예정";
    case "completed":
      return "종료";
    default:
      return "준비 중";
  }
}

function buildPeriod(start?: string | null, end?: string | null) {
  if (!start && !end) return null;
  const startDate = start ? new Date(start) : null;
  const endDate = end ? new Date(end) : null;

  if (startDate && endDate) {
    return `${formatDate(startDate)} -> ${formatDate(endDate)}`;
  }

  if (startDate) {
    return `From ${formatDate(startDate)}`;
  }

  if (endDate) {
    return `Until ${formatDate(endDate)}`;
  }

  return null;
}

function formatDate(date: Date) {
  return date.toLocaleDateString("ko-KR", {
    month: "short",
    day: "numeric",
  });
}
