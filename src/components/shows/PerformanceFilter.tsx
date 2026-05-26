"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { CalendarDays, MapPin, Ticket } from "lucide-react"
import { getPosterFallback } from "@/constants/posters"
import { trackEvent } from "@/lib/analytics"

type Performance = {
  id: string
  slug?: string | null
  title: string
  synopsis?: string | null
  description?: string | null
  poster_url?: string | null
  category?: string | null
  status?: string | null
  state?: string | null
  openrun?: string | null
  tags?: string[] | null
  region?: string | null
  venue?: string | null
  schedule?: string | null
  ticket_link?: string | null
  period_start?: string | null
  period_end?: string | null
  is_featured?: boolean | null
}

type Props = {
  performances: Performance[]
  initialQuery?: string
  /** performanceId → campaign slug 맵. 매칭되면 이벤트 뱃지/버튼 표시 */
  campaignByPerfId?: Record<string, string>
}

type StatusFilter = "all" | "ongoing" | "upcoming" | "closed"
type SortOption = "start_asc" | "start_desc" | "title_asc"

type FilterState = {
  region: string
  genre: string
  query: string
  status: StatusFilter
  sort: SortOption
  onlyBookable: boolean
  onlyOpenrun: boolean
  onlyCampaign: boolean
  vibeId: string | null
}

const LABEL_ALL = "전체"
const PAGE_SIZE = 12

type VibeOption = {
  id: string
  emoji: string
  label: string
  genre: string | null
  onlyOpenrun: boolean
  onlyCampaign: boolean
}

const VIBE_OPTIONS: VibeOption[] = [
  { id: "musical",    emoji: "🎵", label: "뮤지컬",       genre: "뮤지컬",  onlyOpenrun: false, onlyCampaign: false },
  { id: "play",       emoji: "🎭", label: "연극",          genre: "연극",    onlyOpenrun: false, onlyCampaign: false },
  { id: "classic",    emoji: "🎻", label: "클래식",        genre: "클래식",  onlyOpenrun: false, onlyCampaign: false },
  { id: "concert",    emoji: "🎸", label: "콘서트",        genre: "콘서트",  onlyOpenrun: false, onlyCampaign: false },
  { id: "dance",      emoji: "💃", label: "무용",          genre: "무용",    onlyOpenrun: false, onlyCampaign: false },
  { id: "exhibition", emoji: "🖼️", label: "전시",          genre: "전시",    onlyOpenrun: false, onlyCampaign: false },
  { id: "openrun",    emoji: "⭐", label: "오픈런",        genre: null,      onlyOpenrun: true,  onlyCampaign: false },
  { id: "campaign",   emoji: "🎟️", label: "초대권 이벤트", genre: null,      onlyOpenrun: false, onlyCampaign: true  },
]

const unique = (values: (string | null | undefined)[]) =>
  Array.from(new Set(values.filter((value): value is string => Boolean(value && value.trim()))))

const STATUS_OPTIONS: Array<{ value: StatusFilter; label: string }> = [
  { value: "all", label: "상태 전체" },
  { value: "ongoing", label: "공연중" },
  { value: "upcoming", label: "공연예정" },
  { value: "closed", label: "공연완료" },
]

const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: "start_asc", label: "시작일 빠른순" },
  { value: "start_desc", label: "시작일 늦은순" },
  { value: "title_asc", label: "제목 가나다순" },
]

const INITIAL_FILTERS: FilterState = {
  region: LABEL_ALL,
  genre: LABEL_ALL,
  query: "",
  status: "all",
  sort: "start_asc",
  onlyBookable: false,
  onlyOpenrun: false,
  onlyCampaign: false,
  vibeId: null,
}

export function PerformanceFilter({ performances, initialQuery, campaignByPerfId = {} }: Props) {
  const [filters, setFilters] = useState<FilterState>({ ...INITIAL_FILTERS, query: initialQuery ?? "" })
  const [page, setPage] = useState(1)

  useEffect(() => {
    const trimmed = filters.query.trim()
    if (!trimmed) return
    const timer = setTimeout(() => {
      trackEvent("search_submit", { query: trimmed })
    }, 300)
    return () => clearTimeout(timer)
  }, [filters.query])

  const updateFilters = (updater: (prev: FilterState) => FilterState) => {
    setFilters((prev) => updater(prev))
    setPage(1)
  }

  const regions = useMemo(
    () => [LABEL_ALL, ...unique(performances.map((item) => item.region))],
    [performances],
  )

  const genres = useMemo(() => {
    const tagGenres = performances.flatMap((item) => (Array.isArray(item.tags) ? item.tags : []))
    return [LABEL_ALL, ...unique([...tagGenres, ...performances.map((item) => item.category)])]
  }, [performances])

  const filtered = useMemo(() => {
    const query = filters.query.trim().toLowerCase()

    const matched = performances.filter((item) => {
      if (filters.region !== LABEL_ALL && item.region !== filters.region) return false

      if (filters.genre !== LABEL_ALL) {
        const inTags = Array.isArray(item.tags) ? item.tags.includes(filters.genre) : false
        const inCategory = item.category === filters.genre
        if (!inTags && !inCategory) return false
      }

      if (filters.status !== "all" && getPerformanceStatus(item) !== filters.status) return false
      if (filters.onlyBookable && !item.ticket_link) return false
      if (filters.onlyOpenrun && item.openrun !== "Y") return false
      if (filters.onlyCampaign && !campaignByPerfId[item.id]) return false

      if (!query) return true

      const haystack = [
        item.title,
        item.synopsis,
        item.description,
        item.venue,
        item.region,
        item.category,
        ...(item.tags ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      return haystack.includes(query)
    })

    return [...matched].sort((a, b) => {
      // is_featured 항목 항상 상단 고정
      const aFeat = a.is_featured ? 1 : 0
      const bFeat = b.is_featured ? 1 : 0
      if (bFeat !== aFeat) return bFeat - aFeat
      return comparePerformance(a, b, filters.sort)
    })
  }, [filters, performances])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  return (
    <div className="space-y-6">
      {/* 바이브 픽커 — 취향 기반 빠른 필터 */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          취향으로 찾기
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {VIBE_OPTIONS.map((vibe) => {
            const active = filters.vibeId === vibe.id
            return (
              <button
                key={vibe.id}
                type="button"
                onClick={() => {
                  if (active) {
                    updateFilters(() => ({ ...INITIAL_FILTERS, query: filters.query }))
                  } else {
                    updateFilters((prev) => ({
                      ...prev,
                      vibeId: vibe.id,
                      genre: vibe.genre ?? LABEL_ALL,
                      onlyOpenrun: vibe.onlyOpenrun,
                      onlyCampaign: vibe.onlyCampaign,
                    }))
                  }
                }}
                className={`flex shrink-0 items-center gap-1.5 border px-4 py-2 text-xs font-bold uppercase tracking-wide transition-all ${
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground/70 hover:border-primary/60 hover:text-foreground"
                }`}
              >
                <span>{vibe.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
        <input
          value={filters.query}
          onChange={(event) => updateFilters((prev) => ({ ...prev, query: event.target.value }))}
          placeholder="공연명/지역/키워드 검색"
          className="h-11 border border-border bg-background px-4 text-base text-foreground outline-none transition focus:border-foreground"
        />

        <select
          value={filters.genre}
          onChange={(event) => updateFilters((prev) => ({ ...prev, genre: event.target.value }))}
          className="h-11 border border-border bg-background px-4 text-base text-foreground outline-none transition focus:border-foreground"
        >
          {genres.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          value={filters.region}
          onChange={(event) => updateFilters((prev) => ({ ...prev, region: event.target.value }))}
          className="h-11 border border-border bg-background px-4 text-base text-foreground outline-none transition focus:border-foreground"
        >
          {regions.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          value={filters.sort}
          onChange={(event) => updateFilters((prev) => ({ ...prev, sort: event.target.value as SortOption }))}
          className="h-11 border border-border bg-background px-4 text-base text-foreground outline-none transition focus:border-foreground"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {STATUS_OPTIONS.map((option) => {
          const active = filters.status === option.value
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => updateFilters((prev) => ({ ...prev, status: option.value }))}
              className={`border px-4 py-1.5 text-xs font-bold uppercase tracking-wide transition ${
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground/70 hover:border-primary/60 hover:text-foreground"
              }`}
            >
              {option.label}
            </button>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm">
        <label className="inline-flex items-center gap-2 text-foreground/80 hover:text-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={filters.onlyBookable}
            onChange={(event) => updateFilters((prev) => ({ ...prev, onlyBookable: event.target.checked }))}
            className="h-4 w-4 border-border accent-primary"
            style={{ borderRadius: 0 }}
          />
          예매 링크 있는 공연만
        </label>

        <label className="inline-flex items-center gap-2 text-foreground/80 hover:text-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={filters.onlyOpenrun}
            onChange={(event) => updateFilters((prev) => ({ ...prev, onlyOpenrun: event.target.checked }))}
            className="h-4 w-4 border-border accent-primary"
            style={{ borderRadius: 0 }}
          />
          오픈런만
        </label>

        <label className="inline-flex items-center gap-2 text-foreground/80 hover:text-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={filters.onlyCampaign}
            onChange={(event) => updateFilters((prev) => ({ ...prev, onlyCampaign: event.target.checked }))}
            className="h-4 w-4 border-border accent-primary"
            style={{ borderRadius: 0 }}
          />
          초대권 이벤트만
        </label>

        <button
          type="button"
          onClick={() => {
            setFilters(INITIAL_FILTERS)
            setPage(1)
          }}
          className="border border-border px-3 py-1.5 text-xs font-semibold text-foreground/70 transition hover:border-foreground/50 hover:text-foreground"
        >
          필터 초기화
        </button>
      </div>

      <p className="text-sm text-muted-foreground">총 {filtered.length}개 공연</p>

      {/* 알터즈 파트너 공연 — 1페이지에만 표시 */}
      {currentPage === 1 && paged.some((p) => p.is_featured) && (
        <div className="space-y-3 border-l-2 border-primary pl-4">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">알터즈 파트너 공연</p>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {paged.map((performance, index) => {
          const posterUrl = performance.poster_url ?? getPosterFallback(index)
          const status = performance.status ?? performance.state
          const openrunLabel = performance.openrun === "Y" ? "오픈런" : null
          const campaignSlug = campaignByPerfId[performance.id] ?? null
          const isFeatured = Boolean(performance.is_featured)
          const tags = [
            performance.category,
            ...(Array.isArray(performance.tags) ? performance.tags : []),
            status,
            openrunLabel,
          ].filter(Boolean)
          const summary = performance.synopsis ?? performance.description ?? null

          return (
            <article
              key={performance.id}
              className={`spotlight-card group flex h-full flex-col${isFeatured ? " ring-1 ring-primary/40" : ""}`}
            >
              <div className="relative h-64 w-full overflow-hidden">
                <Image
                  src={posterUrl}
                  alt={performance.title}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-102"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
                {isFeatured && (
                  <span className="absolute left-0 top-0 bg-primary px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary-foreground">
                    알터즈
                  </span>
                )}
                {campaignSlug && (
                  <span className="absolute right-0 top-0 border-b border-l border-primary/40 bg-primary px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary-foreground">
                    초대권
                  </span>
                )}
              </div>

              <div className="flex flex-1 flex-col p-4">
                <div className="flex min-h-[1.25rem] flex-wrap gap-1.5">
                  {tags.slice(0, 4).map((tag, tagIndex) => (
                    <span
                      key={`${String(tag)}-${tagIndex}`}
                      className="border border-border/60 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-foreground/60"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-3 space-y-1.5">
                  <h3 className="line-clamp-2 font-display text-lg font-bold leading-snug">{performance.title}</h3>
                  {summary && <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{summary}</p>}
                </div>

                <div className="mt-3 space-y-1.5 border-t border-border/50 pt-3 text-xs text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                    <span className="line-clamp-1">{performance.region ?? "지역 미정"}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Ticket className="h-3.5 w-3.5 shrink-0 text-primary" />
                    <span className="line-clamp-1">{performance.venue ?? "장소 미정"}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <CalendarDays className="h-3.5 w-3.5 shrink-0 text-primary" />
                    <span>{formatPeriod(performance.period_start, performance.period_end)}</span>
                  </p>
                </div>

                <div className="mt-auto flex gap-2 pt-4">
                  <Link
                    href={performance.slug ? `/shows/${performance.slug}` : "/shows"}
                    className="inline-flex items-center justify-center border-2 border-primary bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
                  >
                    상세 보기
                  </Link>

                  {campaignSlug ? (
                    <Link
                      href={`/invites/${campaignSlug}`}
                      className="inline-flex items-center gap-1 justify-center border border-primary/60 px-4 py-2 text-sm font-bold text-primary transition hover:bg-primary/8"
                    >
                      <Ticket className="h-3.5 w-3.5" />
                      이벤트
                    </Link>
                  ) : performance.ticket_link ? (
                    <Link
                      href={performance.ticket_link}
                      target="_blank"
                      rel="noreferrer noopener"
                      className={`inline-flex items-center gap-1 justify-center border px-4 py-2 text-sm font-bold transition ${
                        isFeatured
                          ? "border-primary bg-primary/10 text-primary hover:bg-primary/20"
                          : "border-border text-foreground/70 hover:border-foreground/50 hover:text-foreground"
                      }`}
                    >
                      <Ticket className="h-3.5 w-3.5" />
                      예매하기
                    </Link>
                  ) : null}
                </div>
              </div>
            </article>
          )
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-1.5 border-t border-border pt-6">
          <button
            type="button"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            className="border border-border px-4 py-2 text-sm font-semibold text-foreground/70 transition hover:border-foreground/50 hover:text-foreground disabled:opacity-30"
            disabled={currentPage === 1}
          >
            이전
          </button>

          {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              onClick={() => setPage(pageNumber)}
              className={`h-9 w-9 text-sm font-bold transition ${
                pageNumber === currentPage
                  ? "border-2 border-primary bg-primary text-primary-foreground"
                  : "border border-border text-foreground/70 hover:border-foreground/50 hover:text-foreground"
              }`}
            >
              {pageNumber}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            className="border border-border px-4 py-2 text-sm font-semibold text-foreground/70 transition hover:border-foreground/50 hover:text-foreground disabled:opacity-30"
            disabled={currentPage === totalPages}
          >
            다음
          </button>
        </div>
      )}
    </div>
  )
}

function getPerformanceStatus(item: Pick<Performance, "status" | "state" | "period_start" | "period_end">): StatusFilter {
  const raw = `${item.status ?? ""} ${item.state ?? ""}`.toLowerCase()

  if (raw.includes("03") || raw.includes("완료") || raw.includes("closed")) {
    return "closed"
  }
  if (raw.includes("01") || raw.includes("예정") || raw.includes("upcoming")) {
    return "upcoming"
  }

  const now = Date.now()
  const start = parseDate(item.period_start)
  const end = parseDate(item.period_end)

  if (start && start > now) return "upcoming"
  if (end && end < now) return "closed"
  return "ongoing"
}

function comparePerformance(a: Performance, b: Performance, sort: SortOption) {
  if (sort === "title_asc") {
    return a.title.localeCompare(b.title, "ko-KR")
  }

  const aDate = parseDate(a.period_start) ?? parseDate(a.period_end)
  const bDate = parseDate(b.period_start) ?? parseDate(b.period_end)

  if (sort === "start_asc") {
    if (aDate === null && bDate === null) return a.title.localeCompare(b.title, "ko-KR")
    if (aDate === null) return 1
    if (bDate === null) return -1
    if (aDate !== bDate) return aDate - bDate
    return a.title.localeCompare(b.title, "ko-KR")
  }

  if (aDate === null && bDate === null) return a.title.localeCompare(b.title, "ko-KR")
  if (aDate === null) return 1
  if (bDate === null) return -1
  if (aDate !== bDate) return bDate - aDate
  return a.title.localeCompare(b.title, "ko-KR")
}

function parseDate(value?: string | null): number | null {
  if (!value) return null
  const time = new Date(value).getTime()
  return Number.isNaN(time) ? null : time
}

function formatShortDate(value?: string | null) {
  if (!value) return "미정"
  return new Date(value).toLocaleDateString("ko-KR", {
    month: "short",
    day: "numeric",
  })
}

function formatPeriod(start?: string | null, end?: string | null) {
  if (!start && !end) return "기간 미정"
  const startText = formatShortDate(start)
  const endText = formatShortDate(end)
  if (startText === endText) return startText
  return `${startText} ~ ${endText}`
}
