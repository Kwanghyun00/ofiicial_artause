import Link from "next/link";
import {
  getFeaturedPerformances,
  getRecentPerformances,
} from "@/lib/supabase/queries";
import { PerformanceCard } from "@/components/marketing/PerformanceCard";

type PerformanceResult = Awaited<ReturnType<typeof getRecentPerformances>>[number];
type ValidPerformance = Extract<PerformanceResult, { id: string }>;

export const metadata = {
  title: "공연 아카이브",
  description: "Artause가 다루는 공연과 컬렉션을 한 번에 확인하고 원하는 티켓 흐름으로 이동하세요.",
};

function isPerformance(record: PerformanceResult): record is ValidPerformance {
  return Boolean(record && typeof record === "object" && "id" in record);
}

const STATUS_PRIORITY: Record<string, number> = {
  ongoing: 0,
  scheduled: 1,
  completed: 2,
};

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

function toDate(value?: string | null) {
  return value ? new Date(value) : undefined;
}

export default async function ShowsPage() {
  const [featured, recent] = await Promise.all([
    getFeaturedPerformances(),
    getRecentPerformances(),
  ]);

  const deduped = new Map<string, ValidPerformance>();
  [...featured, ...recent].filter(isPerformance).forEach((performance) => {
    deduped.set(performance.id, performance);
  });

  const shows = Array.from(deduped.values()).sort(sortPerformances);
  const ongoing = shows.filter((show) => show.status === "ongoing");
  const scheduled = shows.filter((show) => show.status === "scheduled");
  const completed = shows.filter((show) => show.status === "completed");

  const categories = Array.from(new Set(shows.map((show) => show.category).filter(Boolean) as string[]));
  const regions = Array.from(new Set(shows.map((show) => show.region).filter(Boolean) as string[]));

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <section className="rounded-3xl bg-indigo-950 p-10 text-white shadow-xl md:p-14">
        <p className="text-sm uppercase tracking-wide text-white/60">Shows & Collections</p>
        <h1 className="mt-3 text-3xl font-semibold md:text-4xl">공연 큐레이션을 한 눈에 확인하세요</h1>
        <p className="mt-4 max-w-3xl text-base text-white/80 md:text-lg">
          R1 단계에서는 진행 중 · 예정 · 종료 공연을 모두 모아 JSON-LD 기반 SEO 메타와 함께 제공합니다. 원하는 공연을 선택해
          티켓 신청, 추천 코드, Artause 사례 리포트까지 바로 연결할 수 있습니다.
        </p>
        <div className="mt-8 flex flex-wrap gap-4 text-sm text-white/80">
          <div className="rounded-2xl border border-white/30 bg-white/10 px-4 py-2">
            운영 필드: {categories.length ? categories.join(" / ") : "큐레이션 준비 중"}
          </div>
          <div className="rounded-2xl border border-white/30 bg-white/10 px-4 py-2">
            커버 지역: {regions.length ? regions.join(" / ") : "업데이트 예정"}
          </div>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/events" className="btn-primary bg-white text-indigo-950 hover:bg-white/90">
            이벤트 보기
          </Link>
          <Link href="/pricing" className="btn-secondary border-white/40 text-white hover:border-white/60 hover:text-white">
            멤버십 혜택 확인
          </Link>
        </div>
      </section>

      <section className="mt-14">
        <div className="card grid gap-6 p-6 md:grid-cols-4">
          <fieldset className="space-y-2" disabled>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">기간</label>
            <select className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-600">
              <option>이번 달</option>
            </select>
            <p className="text-xs text-slate-400">필터는 Supabase 연동 후 활성화됩니다.</p>
          </fieldset>
          <fieldset className="space-y-2" disabled>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">장르</label>
            <select className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-600">
              {categories.length ? categories.map((category) => <option key={category}>{category}</option>) : <option>데이터 수집 중</option>}
            </select>
          </fieldset>
          <fieldset className="space-y-2" disabled>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">지역</label>
            <select className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-600">
              {regions.length ? regions.map((region) => <option key={region}>{region}</option>) : <option>데이터 수집 중</option>}
            </select>
          </fieldset>
          <div className="flex flex-col justify-between rounded-2xl bg-indigo-50 p-5 text-sm text-indigo-700">
            <p className="font-semibold">필터는 언제 켜지나요?</p>
            <p className="mt-2 leading-relaxed">
              Supabase와 연결되면 기간 · 장르 · 지역 · 태그 필터를 활성화하고, 선택한 조건에 맞는 신청 플로우를 `/events`에서 안내할 예정입니다.
            </p>
          </div>
        </div>
      </section>

      <SectionBlock title="진행 중인 공연" subtitle="현재 모집 중이거나 상연 중인 프로젝트입니다." shows={ongoing} emptyMessage="진행 중인 공연이 없습니다." featured />

      <SectionBlock title="예정 공연" subtitle="곧 오픈할 공연을 미리 확인하고 대기 리스트를 열어보세요." shows={scheduled} emptyMessage="예정된 공연이 곧 업데이트됩니다." />

      <SectionBlock title="종료 공연" subtitle="Artause가 함께 만든 공연 레퍼런스를 검토해 보세요." shows={completed} emptyMessage="지난 공연 레퍼런스는 정리 중입니다." />
    </div>
  );
}

type SectionBlockProps = {
  title: string;
  subtitle: string;
  shows: ValidPerformance[];
  emptyMessage: string;
  featured?: boolean;
};

function SectionBlock({ title, subtitle, shows, emptyMessage, featured = false }: SectionBlockProps) {
  return (
    <section className="mt-14">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="section-heading">{title}</h2>
          <p className="section-subtitle">{subtitle}</p>
        </div>
      </div>
      <div className={`mt-8 grid gap-6 ${featured ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
        {shows.length ? (
          shows.map((performance) => <PerformanceCard key={performance.id} performance={performance} asFeatured={featured} />)
        ) : (
          <div className="card p-8 text-sm text-slate-500 md:col-span-3">{emptyMessage}</div>
        )}
      </div>
    </section>
  );
}
