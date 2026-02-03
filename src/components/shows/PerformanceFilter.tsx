"use client"

import { useMemo, useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { CalendarDays, MapPin, Ticket } from "lucide-react"
import { getPosterFallback } from "@/constants/posters"

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
}

type Props = {
  performances: Performance[]
}

type FilterState = {
  region: string
  genre: string
  query: string
}

const LABEL_ALL = "전체"
const PAGE_SIZE = 12

const unique = (values: (string | null | undefined)[]) =>
  Array.from(new Set(values.filter((value): value is string => Boolean(value && value.trim()))))

export function PerformanceFilter({ performances }: Props) {
  const [filters, setFilters] = useState<FilterState>({
    region: LABEL_ALL,
    genre: LABEL_ALL,
    query: "",
  })
  const [page, setPage] = useState(1)

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
    return performances.filter((item) => {
      if (filters.region !== LABEL_ALL && item.region !== filters.region) return false
      if (filters.genre !== LABEL_ALL) {
        const inTags = Array.isArray(item.tags) ? item.tags.includes(filters.genre) : false
        const inCategory = item.category === filters.genre
        if (!inTags && !inCategory) return false
      }
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
  }, [filters, performances])

  useEffect(() => {
    setPage(1)
  }, [filters.region, filters.genre, filters.query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-3">
        <input
          value={filters.query}
          onChange={(event) => setFilters((prev) => ({ ...prev, query: event.target.value }))}
          placeholder="공연명/지역/키워드 검색"
          className="h-11 rounded-full border border-border bg-white px-4 text-sm text-foreground shadow-sm outline-none transition focus:border-primary"
        />
        <select
          value={filters.genre}
          onChange={(event) => setFilters((prev) => ({ ...prev, genre: event.target.value }))}
          className="h-11 rounded-full border border-border bg-white px-4 text-sm text-foreground shadow-sm outline-none transition focus:border-primary"
        >
          {genres.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select
          value={filters.region}
          onChange={(event) => setFilters((prev) => ({ ...prev, region: event.target.value }))}
          className="h-11 rounded-full border border-border bg-white px-4 text-sm text-foreground shadow-sm outline-none transition focus:border-primary"
        >
          {regions.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <p className="text-sm text-muted-foreground">총 {filtered.length}개 공연</p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {paged.map((performance, index) => {
          const posterUrl = performance.poster_url ?? getPosterFallback(index)
          const status = performance.status ?? performance.state
          const openrunLabel = performance.openrun === "Y" ? "오픈런" : null
          const tags = [
            performance.category,
            ...(Array.isArray(performance.tags) ? performance.tags : []),
            status,
            openrunLabel,
          ].filter(Boolean)
          const summary = performance.synopsis ?? performance.description ?? "공연 소개가 곧 업데이트됩니다."

          return (
            <article
              key={performance.id}
              className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border/60 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative h-52 w-full overflow-hidden">
                <Image
                  src={posterUrl}
                  alt={performance.title}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {tags.slice(0, 5).map((tag) => (
                    <span key={tag} className="rounded-full bg-[#f2efe7] px-3 py-1 text-foreground/80">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-3 space-y-2">
                  <h3 className="text-lg font-semibold">{performance.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{summary}</p>
                </div>
                <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                  {performance.region && (
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      {performance.region}
                    </p>
                  )}
                  {performance.venue && (
                    <p className="flex items-center gap-2">
                      <Ticket className="h-4 w-4 text-primary" />
                      {performance.venue}
                    </p>
                  )}
                  {(performance.period_start || performance.period_end) && (
                    <p className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-primary" />
                      {formatPeriod(performance.period_start, performance.period_end)}
                    </p>
                  )}
                </div>
                <div className="mt-4 flex gap-2">
                  <Link
                    href={performance.slug ? `/performances/${performance.slug}` : "/contact"}
                    className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary/90"
                  >
                    상세 보기
                  </Link>
                  {performance.ticket_link ? (
                    <Link
                      href={performance.ticket_link}
                      className="inline-flex items-center justify-center rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary"
                    >
                      예매 링크
                    </Link>
                  ) : (
                    <span className="inline-flex items-center justify-center rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground/70">
                      예매 링크 준비 중
                    </span>
                  )}
                </div>
              </div>
            </article>
          )
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            className="rounded-full border border-border px-3 py-1 text-sm text-foreground/80 transition hover:border-primary disabled:opacity-40"
            disabled={currentPage === 1}
          >
            이전
          </button>
          {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              onClick={() => setPage(pageNumber)}
              className={`h-8 w-8 rounded-full text-sm font-semibold transition ${
                pageNumber === currentPage
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-foreground/80 hover:border-primary"
              }`}
            >
              {pageNumber}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            className="rounded-full border border-border px-3 py-1 text-sm text-foreground/80 transition hover:border-primary disabled:opacity-40"
            disabled={currentPage === totalPages}
          >
            다음
          </button>
        </div>
      )}
    </div>
  )
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
