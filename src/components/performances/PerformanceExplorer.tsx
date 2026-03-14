"use client"

import Image from "next/image"
import Link from "next/link"
import { Calendar, MapPin, Search, Ticket } from "lucide-react"
import { useMemo, useState } from "react"

type Performance = {
  id: string
  slug: string
  title: string
  organization?: string | null
  region?: string | null
  category?: string | null
  tags?: string[] | null
  period_start?: string | null
  period_end?: string | null
  poster_url?: string | null
}

type Props = {
  performances: Performance[]
}

type StatusFilter = "all" | "ongoing" | "upcoming" | "closed"

const STATUS_META: Record<Exclude<StatusFilter, "all">, { label: string; tone: string }> = {
  ongoing: { label: "진행 중", tone: "bg-emerald-500 text-white" },
  upcoming: { label: "모집 예정", tone: "bg-amber-500 text-white" },
  closed: { label: "마감", tone: "bg-muted text-foreground/80" },
}

export function PerformanceExplorer({ performances }: Props) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [regionFilter, setRegionFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")

  const regionOptions = useMemo(() => {
    const set = new Set<string>()
    performances.forEach((performance) => {
      if (performance.region) set.add(performance.region)
    })
    return Array.from(set)
  }, [performances])

  const categoryOptions = useMemo(() => {
    const set = new Set<string>()
    performances.forEach((performance) => {
      if (performance.category) set.add(performance.category)
      performance.tags?.forEach((tag) => set.add(tag))
    })
    return Array.from(set)
  }, [performances])

  const filteredPerformances = useMemo(() => {
    return performances.filter((performance) => {
      const matchesSearch =
        searchTerm.trim() === "" ||
        performance.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (performance.organization?.toLowerCase() ?? "").includes(searchTerm.toLowerCase())

      const status = getStatus(performance)
      const matchesStatus = statusFilter === "all" || status === statusFilter

      const matchesRegion = regionFilter === "all" || performance.region === regionFilter

      const matchesCategory =
        categoryFilter === "all" ||
        performance.category === categoryFilter ||
        performance.tags?.some((tag) => tag === categoryFilter)

      return matchesSearch && matchesStatus && matchesRegion && matchesCategory
    })
  }, [categoryFilter, performances, regionFilter, searchTerm, statusFilter])

  const statusCounts = useMemo(
    () => ({
      ongoing: performances.filter((performance) => getStatus(performance) === "ongoing").length,
      upcoming: performances.filter((performance) => getStatus(performance) === "upcoming").length,
      closed: performances.filter((performance) => getStatus(performance) === "closed").length,
    }),
    [performances],
  )

  const hasActiveFilter =
    searchTerm.trim() !== "" || statusFilter !== "all" || regionFilter !== "all" || categoryFilter !== "all"

  return (
    <div className="space-y-6">
      <section className="stage-panel p-6">
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="flex-1 space-y-3">
            <p className="text-sm font-semibold text-primary">라이브 공연 탐색기</p>
            <h3 className="text-2xl font-bold text-foreground">관심 있는 공연/전시를 조건별로 찾아보세요</h3>
            <p className="text-sm text-muted-foreground">
              기간 · 지역 · 장르 필터를 활용하면 지금 모집 중인 초대 프로그램을 빠르게 찾을 수 있습니다.
            </p>
          </div>

          <div className="flex flex-1 flex-col gap-4">
            <label className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">검색</label>
            <div className="flex items-center gap-2 rounded-2xl border border-border bg-background/60 px-4 py-2.5">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="제목, 단체명, 키워드 등을 입력하세요"
                className="flex-1 bg-transparent text-sm outline-none"
                aria-label="공연 검색어 입력"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">지역</label>
                <select
                  value={regionFilter}
                  onChange={(event) => setRegionFilter(event.target.value)}
                  className="h-11 w-full rounded-xl border border-border bg-background/60 px-3 text-sm"
                >
                  <option value="all">전체 지역</option>
                  {regionOptions.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">장르/태그</label>
                <select
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                  className="h-11 w-full rounded-xl border border-border bg-background/60 px-3 text-sm"
                >
                  <option value="all">전체 장르</option>
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="상태 필터">
          {(["all", "ongoing", "upcoming", "closed"] as StatusFilter[]).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setStatusFilter(filter)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                statusFilter === filter
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-background/60 text-muted-foreground hover:border-primary/40"
              }`}
              >
              <span>
                {filter === "all"
                  ? "전체"
                  : filter === "ongoing"
                    ? "진행 중"
                    : filter === "upcoming"
                      ? "모집 예정"
                      : "종료"}
              </span>
              {filter !== "all" && (
                <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary-foreground">
                  {statusCounts[filter as Exclude<StatusFilter, "all">]}
                </span>
              )}
            </button>
          ))}
        </div>
      </section>

      <div>
        <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
          <p>
            총 <span className="font-semibold text-primary">{filteredPerformances.length}</span>개의 공연을 찾았어요.
          </p>
          {hasActiveFilter && (
            <button
              type="button"
              className="text-xs font-semibold text-primary hover:underline"
              onClick={() => {
                setSearchTerm("")
                setStatusFilter("all")
                setRegionFilter("all")
                setCategoryFilter("all")
              }}
            >
              필터 초기화
            </button>
          )}
        </div>

        {filteredPerformances.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filteredPerformances.map((performance) => (
              <PerformanceCard key={performance.id} performance={performance} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border-2 border-dashed border-border bg-background/60 px-8 py-12 text-center text-sm text-muted-foreground">
            조건에 맞는 공연이 없습니다.
            <br />
            다른 검색어나 필터를 선택해 주세요.
          </div>
        )}
      </div>
    </div>
  )
}

function PerformanceCard({ performance }: { performance: Performance }) {
  const status = getStatus(performance)
  const badge = STATUS_META[status]

  return (
    <article className="spotlight-card flex h-full flex-col p-4">
      <div className="relative h-52 w-full overflow-hidden rounded-2xl bg-muted/60">
        {performance.poster_url ? (
          <Image
            src={performance.poster_url}
            alt={`${performance.title} 포스터`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">포스터 준비 중</div>
        )}
        {badge && (
          <span className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-semibold ${badge.tone}`}>
            {badge.label}
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-1 flex-col gap-4">
        <div className="space-y-2">
          <p className="line-clamp-1 text-xs font-semibold text-muted-foreground">{performance.organization ?? "주최 미정"}</p>
          <h3 className="line-clamp-2 text-lg font-bold text-foreground">{performance.title}</h3>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="line-clamp-1">{performance.region ?? "지역 미정"}</span>
            </p>
            <p className="flex items-center gap-2">
              <Calendar className="h-4 w-4 shrink-0" />
              <span>{formatPeriod(performance.period_start, performance.period_end)}</span>
            </p>
          </div>
          <div className="flex min-h-[1.5rem] flex-wrap gap-2">
            {performance.tags?.slice(0, 3).map((tag) => (
              <span key={tag} className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        <Link
          href={`/performances/${performance.slug}`}
          className="mt-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary"
        >
          <Ticket className="h-4 w-4" />
          상세 페이지
        </Link>
      </div>
    </article>
  )
}

function getStatus(performance: Performance): Exclude<StatusFilter, "all"> {
  const now = Date.now()
  const start = performance.period_start ? new Date(performance.period_start).getTime() : null
  const end = performance.period_end ? new Date(performance.period_end).getTime() : null

  if (start && start > now) return "upcoming"
  if (end && end < now) return "closed"
  return "ongoing"
}

function formatPeriod(start?: string | null, end?: string | null) {
  if (!start && !end) return "상시 진행"
  const startText = start ? formatDate(start) : "미정"
  const endText = end ? formatDate(end) : "미정"
  if (startText === endText) return startText
  return `${startText} ~ ${endText}`
}

function formatDate(value?: string | null) {
  if (!value) return "미정"
  return new Date(value).toLocaleDateString("ko-KR", {
    month: "short",
    day: "numeric",
  })
}
