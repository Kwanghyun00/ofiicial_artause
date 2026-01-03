import { getAllPerformances } from "@/lib/supabase/queries"
import { PerformanceExplorer } from "@/components/performances/PerformanceExplorer"
import { PerformanceShowcase } from "@/components/home/PerformanceShowcase"
import type { Show } from "@/components/home/types"

type PerformanceResult = Awaited<ReturnType<typeof getAllPerformances>>[number]

const isPerformance = (
  item: PerformanceResult,
): item is NonNullable<PerformanceResult> & { id: string; slug: string; title: string } =>
  Boolean(item && typeof item === "object" && "id" in item && "slug" in item && "title" in item)

export const metadata = {
  title: "공연 · 전시 초대",
  description: "V0 디자인 시스템으로 재구성된 공연 · 전시 초대 프로그램을 한 곳에서 탐색하고 신청하세요.",
}

export default async function PerformancesPage() {
  const performances = (await getAllPerformances()).filter(isPerformance)

  const shows: Show[] = performances.slice(0, 6).map((performance) => ({
    id: performance.id,
    slug: performance.slug,
    title: performance.title,
    region: performance.region ?? undefined,
    tags: performance.tags ?? [],
    period_start: performance.period_start ?? undefined,
    period_end: performance.period_end ?? undefined,
    poster_url: performance.poster_url ?? undefined,
  }))

  const statusCounts = getStatusCounts(performances)
  const uniqueRegionCount = new Set(performances.map((performance) => performance.region).filter(Boolean)).size
  const stats = [
    { label: "등록된 프로그램", value: `${performances.length}건` },
    { label: "진행 중 초대", value: `${statusCounts.ongoing}건` },
    { label: "모집 예정", value: `${statusCounts.upcoming}건` },
    { label: "운영 지역", value: `${uniqueRegionCount}개 권역` },
  ]

  return (
    <div className="space-y-12">
      <section className="bg-gradient-to-b from-[#F7F4EC] via-white to-white py-12">
        <div className="mx-auto max-w-6xl space-y-8 px-4 sm:px-6 md:px-8">
          <div className="space-y-4 text-center">
            <p className="text-sm font-semibold text-primary">프리미엄 초대 큐레이션</p>
            <h1 className="text-4xl font-bold text-foreground">공연·전시 실시간 추천</h1>
            <p className="text-base text-muted-foreground">
              현재 모집 중인 공연과 전시 초대권을 한 번에 비교하고, 관심 있는 프로그램을 바로 신청해 보세요.
            </p>
          </div>

          <PerformanceShowcase shows={shows} />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-border bg-card/80 p-4 text-center shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">{stat.label}</p>
                <p className="mt-2 text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white/80 py-12">
        <div className="mx-auto max-w-6xl space-y-6 px-4 sm:px-6 md:px-8">
          <div className="space-y-2 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-primary">실시간 탐색</p>
            <h2 className="text-3xl font-bold text-foreground">공연 · 전시 라이브 탐색</h2>
            <p className="text-base text-muted-foreground">
              Supabase와 KOPIS에서 불러온 데이터를 기반으로 지역, 기간, 장르별 공연을 세밀하게 골라보세요.
            </p>
          </div>
          <PerformanceExplorer performances={performances} />
        </div>
      </section>
    </div>
  )
}

type ListedPerformance = NonNullable<PerformanceResult> & {
  period_start?: string | null
  period_end?: string | null
}

function getStatusCounts(performances: ListedPerformance[]) {
  const now = Date.now()
  return performances.reduce(
    (acc, performance) => {
      const start = performance.period_start ? new Date(performance.period_start).getTime() : null
      const end = performance.period_end ? new Date(performance.period_end).getTime() : null
      if (start && start > now) {
        acc.upcoming += 1
      } else if (end && end < now) {
        acc.closed += 1
      } else {
        acc.ongoing += 1
      }
      return acc
    },
    { ongoing: 0, upcoming: 0, closed: 0 },
  )
}
