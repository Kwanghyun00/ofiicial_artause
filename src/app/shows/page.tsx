import Link from "next/link";
import { getFeaturedPerformances, getRecentPerformances } from "@/lib/supabase/queries";
import { ShowsExplorer } from "./ShowsExplorer";

export const metadata = {
  title: "공연 · 전시 아카이브",
  description: "한국 지역 기반 공연·전시 정보를 한 화면에서 정리하고, 향후 초대권 이벤트와 연동할 수 있습니다.",
};

type PerformanceResult = Awaited<ReturnType<typeof getRecentPerformances>>[number];
export type ValidPerformance = Extract<PerformanceResult, { id: string }>;

function isPerformance(record: PerformanceResult): record is ValidPerformance {
  return Boolean(record && typeof record === "object" && "id" in record);
}

export default async function ShowsPage() {
  const [featured, recent] = await Promise.all([getFeaturedPerformances(), getRecentPerformances()]);

  const deduped = new Map<string, ValidPerformance>();
  [...featured, ...recent].filter(isPerformance).forEach((performance) => {
    deduped.set(performance.id, performance);
  });

  const shows = Array.from(deduped.values());
  const categories = Array.from(new Set(shows.map((show) => show.category).filter(Boolean) as string[])).sort();
  const regions = Array.from(new Set(shows.map((show) => show.region).filter(Boolean) as string[])).sort();

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <section className="rounded-3xl bg-indigo-950 p-10 text-white shadow-xl md:p-14">
        <p className="text-sm uppercase tracking-wide text-white/70">Shows & Exhibitions</p>
        <h1 className="mt-3 text-3xl font-semibold md:text-4xl">공연 · 전시를 가장 단순한 카드로 정리했습니다</h1>
        <p className="mt-4 max-w-3xl text-base text-white/80 md:text-lg">
          지역, 장르, 일정만으로 빠르게 훑어볼 수 있는 카드형 리스트입니다. KOPIS 기반 메타데이터와 자체 취재 노트를
          함께 표기해 한글 검색이 수월하도록 다듬었습니다.
        </p>
        <div className="mt-8 flex flex-wrap gap-4 text-sm text-white/80">
          <div className="rounded-2xl border border-white/30 bg-white/10 px-4 py-2">
            운영 장르: {categories.length ? categories.join(", ") : "불러오는 중"}
          </div>
          <div className="rounded-2xl border border-white/30 bg-white/10 px-4 py-2">
            지역 범위: {regions.length ? regions.join(", ") : "불러오는 중"}
          </div>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/events" className="btn-primary bg-white text-indigo-950 hover:bg-white/90">
            초대권 이벤트 보기
          </Link>
          <Link href="/pricing" className="btn-secondary border-white/40 text-white hover:border-white/60 hover:text-white">
            이용 정책 살펴보기
          </Link>
        </div>
      </section>

      <ShowsExplorer shows={shows} />
    </div>
  );
}
