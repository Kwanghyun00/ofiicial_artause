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
        <div className="absolute left-4 top-4 inline-flex items-center gap-2 text-xs font-medium text-white">
          <span className="badge bg-white/15 backdrop-blur">{performance.category ?? "장르"}</span>
          <span className="badge bg-indigo-600 text-white">{statusLabel(performance.status)}</span>
        </div>
      </div>
      <div className={`flex flex-1 flex-col gap-4 p-6 ${asFeatured ? "md:p-10" : ""}`}>
        <div>
          <h3 className={`text-xl font-semibold text-slate-900 ${asFeatured ? "md:text-2xl" : ""}`}>
            {performance.title}
          </h3>
          {performance.hero_headline ? (
            <p className="mt-2 text-sm text-indigo-600">{performance.hero_headline}</p>
          ) : null}
          <p className="mt-3 text-sm text-slate-600">{performance.synopsis}</p>
        </div>
        <div className="mt-auto flex flex-wrap items-center gap-2 text-xs text-slate-500">
          {performance.region && <span className="badge bg-surface-200 text-slate-800">{performance.region}</span>}
          {period && <span className="badge bg-white/80 text-slate-700">{period}</span>}
          {performance.venue && <span className="badge bg-white/80 text-slate-700">{performance.venue}</span>}
        </div>
      </div>
    </Link>
  );
}

function statusLabel(status: Performance["status"]) {
  switch (status) {
    case "ongoing":
      return "진행 중";
    case "completed":
      return "종료";
    case "scheduled":
      return "예정";
    default:
      return "준비";
  }
}

function buildPeriod(start?: string | null, end?: string | null) {
  if (!start && !end) return null;
  if (start && end) {
    return `${formatDate(start)} ~ ${formatDate(end)}`;
  }
  return start ? formatDate(start) : formatDate(end!);
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
