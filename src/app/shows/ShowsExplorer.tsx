"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PerformanceCard } from "@/components/marketing/PerformanceCard";
import type { ValidPerformance } from "./page";

type PeriodFilter = "all" | "week" | "month" | "next-month";

type Props = {
  shows: ValidPerformance[];
};

const STATUS_PRIORITY: Record<string, number> = {
  ongoing: 0,
  scheduled: 1,
  completed: 2,
};

const PERIOD_OPTIONS: { value: PeriodFilter; label: string }[] = [
  { value: "all", label: "전체 기간" },
  { value: "week", label: "이번 주" },
  { value: "month", label: "이번 달" },
  { value: "next-month", label: "다음 달" },
];

export function ShowsExplorer({ shows }: Props) {
  const [period, setPeriod] = useState<PeriodFilter>("all");
  const [category, setCategory] = useState("all");
  const [region, setRegion] = useState("all");

  const categories = useMemo(() => extractUnique(shows.map((show) => show.category)), [shows]);
  const regions = useMemo(() => extractUnique(shows.map((show) => show.region)), [shows]);

  const filteredShows = useMemo(
    () =>
      shows
        .filter((show) => (category === "all" ? true : show.category === category))
        .filter((show) => (region === "all" ? true : show.region === region))
        .filter((show) => matchesPeriod(show, period))
        .sort(sortPerformances),
    [shows, category, region, period],
  );

  const { ongoing, scheduled, completed } = useMemo(() => groupByStatus(filteredShows), [filteredShows]);

  function handleReset() {
    setPeriod("all");
    setCategory("all");
    setRegion("all");
  }

  return (
    <>
      <section className="mt-14">
        <div className="card grid gap-6 p-6 md:grid-cols-4">
          <fieldset className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">일정</label>
            <select
              className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-600"
              value={period}
              onChange={(event) => setPeriod(event.target.value as PeriodFilter)}
            >
              {PERIOD_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </fieldset>

          <fieldset className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">장르</label>
            <select
              className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-600"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="all">전체 장르</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </fieldset>

          <fieldset className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">지역</label>
            <select
              className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-600"
              value={region}
              onChange={(event) => setRegion(event.target.value)}
            >
              <option value="all">전체 지역</option>
              {regions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </fieldset>

          <div className="flex flex-col justify-between rounded-2xl bg-indigo-50 p-5 text-sm text-indigo-700">
            <div>
              <p className="font-semibold">필터를 조합해보세요</p>
              <p className="mt-2 leading-relaxed">일정 · 장르 · 지역을 조합하면 원하는 공연을 빠르게 찾을 수 있어요.</p>
            </div>
            <button type="button" onClick={handleReset} className="btn-secondary mt-4 w-full">
              필터 초기화
            </button>
          </div>
        </div>
      </section>

      <SectionBlock
        title="진행 중"
        subtitle="지금 관람 가능한 프로그램입니다."
        shows={ongoing}
        emptyMessage="조건에 맞는 진행 중 공연이 없습니다."
        featured
      />

      <SectionBlock
        title="오픈 예정"
        subtitle="곧 시작되는 프로그램입니다. 일정과 지역을 확인해두세요."
        shows={scheduled}
        emptyMessage="조건에 맞는 예정 공연이 없습니다."
      />

      <SectionBlock
        title="아카이브"
        subtitle="최근 종료된 프로그램입니다. 운영 기록용으로 보관합니다."
        shows={completed}
        emptyMessage="표시할 아카이브가 없습니다."
      />
    </>
  );
}

function extractUnique(values: (string | null | undefined)[]) {
  return Array.from(new Set(values.filter(Boolean) as string[])).sort();
}

function matchesPeriod(show: ValidPerformance, period: PeriodFilter) {
  if (period === "all") return true;
  const now = new Date();
  const start = toDate(show.period_start) ?? toDate(show.created_at) ?? now;
  const end = toDate(show.period_end) ?? start;

  switch (period) {
    case "week":
      return overlaps(start, end, startOfWeek(now), endOfWeek(now));
    case "month":
      return start.getMonth() === now.getMonth() && start.getFullYear() === now.getFullYear();
    case "next-month": {
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      return start.getMonth() === nextMonth.getMonth() && start.getFullYear() === nextMonth.getFullYear();
    }
  }
}

function groupByStatus(shows: ValidPerformance[]) {
  const ongoing = shows.filter((show) => show.status === "ongoing");
  const scheduled = shows.filter((show) => show.status === "scheduled");
  const completed = shows.filter((show) => show.status === "completed");
  return { ongoing, scheduled, completed };
}

function sortPerformances(a: ValidPerformance, b: ValidPerformance) {
  const aPriority = STATUS_PRIORITY[a.status ?? "completed"] ?? 3;
  const bPriority = STATUS_PRIORITY[b.status ?? "completed"] ?? 3;

  if (aPriority !== bPriority) {
    return aPriority - bPriority;
  }

  const aDate = toDate(a.period_start) ?? toDate(a.created_at) ?? new Date(0);
  const bDate = toDate(b.period_start) ?? toDate(b.created_at) ?? new Date(0);

  return aDate.getTime() - bDate.getTime();
}

function SectionBlock({ title, subtitle, shows, emptyMessage, featured = false }: {
  title: string;
  subtitle: string;
  shows: ValidPerformance[];
  emptyMessage: string;
  featured?: boolean;
}) {
  return (
    <section className="mt-14">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="section-heading">{title}</h2>
          <p className="section-subtitle">{subtitle}</p>
        </div>
        {featured && (
          <Link href="/events" className="btn-secondary">
            초대권 이벤트
          </Link>
        )}
      </div>
      <div className={`mt-8 grid gap-6 ${featured ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
        {shows.length ? (
          shows.map((performance) => (
            <PerformanceCard key={performance.id} performance={performance} asFeatured={featured} />
          ))
        ) : (
          <div className="card p-8 text-sm text-slate-500 md:col-span-3">{emptyMessage}</div>
        )}
      </div>
    </section>
  );
}

function toDate(value?: string | null) {
  return value ? new Date(value) : undefined;
}

function startOfWeek(date: Date) {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = copy.getDate() - day + (day === 0 ? -6 : 1);
  copy.setDate(diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function endOfWeek(date: Date) {
  const copy = startOfWeek(date);
  copy.setDate(copy.getDate() + 6);
  copy.setHours(23, 59, 59, 999);
  return copy;
}

function overlaps(start: Date, end: Date, rangeStart: Date, rangeEnd: Date) {
  return start <= rangeEnd && end >= rangeStart;
}
