"use client"

import { useState, useEffect, useRef, useTransition } from "react"
import { Search, X, PenLine, Plus, AlertCircle } from "lucide-react"
import Image from "next/image"
import { ReviewWriteModal } from "./ReviewWriteModal"
import { findOrCreatePerformanceAction } from "@/app/reviews/performance-actions"
import type { PerformanceSearchResult } from "@/app/api/performances/search/route"
import type { FoundOrCreatedPerformance } from "@/app/reviews/performance-actions"

const CATEGORY_OPTIONS = [
  "뮤지컬",
  "연극",
  "클래식",
  "콘서트",
  "무용",
  "전시",
  "오페라",
  "기타",
]

type Mode = "search" | "register"

export function PerformanceSearchPicker() {
  const [mode, setMode] = useState<Mode>("search")
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<PerformanceSearchResult[]>([])
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  // 직접 등록 폼 상태
  const [regTitle, setRegTitle] = useState("")
  const [regCategory, setRegCategory] = useState("")
  const [regVenue, setRegVenue] = useState("")
  const [regError, setRegError] = useState("")
  const [isPending, startTransition] = useTransition()

  // 선택/생성된 공연
  const [selected, setSelected] = useState<FoundOrCreatedPerformance | null>(null)
  const [writeOpen, setWriteOpen] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // 검색어 debounce fetch
  useEffect(() => {
    if (mode !== "search") return
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!query.trim()) {
      setResults([])
      setIsDropdownOpen(false)
      setHasSearched(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      setIsFetching(true)
      try {
        const res = await fetch(
          `/api/performances/search?q=${encodeURIComponent(query.trim())}`
        )
        const data: PerformanceSearchResult[] = await res.json()
        setResults(data)
        setHasSearched(true)
        setIsDropdownOpen(true)
      } catch {
        setResults([])
        setHasSearched(true)
      } finally {
        setIsFetching(false)
      }
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, mode])

  const handleSelectFromSearch = (perf: PerformanceSearchResult) => {
    setSelected({ id: perf.id, slug: perf.slug, title: perf.title, category: perf.category })
    setQuery(perf.title)
    setIsDropdownOpen(false)
  }

  const handleSwitchToRegister = () => {
    setRegTitle(query)
    setRegCategory("")
    setRegVenue("")
    setRegError("")
    setMode("register")
    setIsDropdownOpen(false)
  }

  const handleRegisterSubmit = () => {
    if (!regTitle.trim()) {
      setRegError("공연 제목을 입력해 주세요.")
      return
    }
    setRegError("")
    startTransition(async () => {
      const result = await findOrCreatePerformanceAction({
        title: regTitle,
        category: regCategory || undefined,
        venue: regVenue || undefined,
      })
      if (!result.success) {
        setRegError(result.error)
        return
      }
      setSelected(result.performance)
      setMode("search")
      setQuery(result.performance.title)
    })
  }

  const handleClear = () => {
    setSelected(null)
    setQuery("")
    setResults([])
    setIsDropdownOpen(false)
    setHasSearched(false)
    setMode("search")
    inputRef.current?.focus()
  }

  return (
    <div className="stage-panel p-6 space-y-4">
      <div className="space-y-1">
        <p className="text-base font-semibold text-foreground">관람 후기 남기기</p>
        <p className="text-sm text-muted-foreground">
          보신 공연이 있으신가요? 공연을 검색하거나 직접 등록해서 후기를 남겨주세요.
        </p>
      </div>

      {/* ── 검색 모드 ── */}
      {mode === "search" && (
        <div ref={containerRef} className="relative">
          <div className="relative flex items-center">
            <Search className="absolute left-4 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                if (selected && e.target.value !== selected.title) setSelected(null)
              }}
              onFocus={() => {
                if (results.length > 0) setIsDropdownOpen(true)
              }}
              placeholder="공연 제목을 검색하세요"
              className="w-full rounded-2xl border border-border bg-background/60 pl-10 pr-10 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
            />
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 p-1 rounded-full text-muted-foreground hover:text-foreground transition"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* 검색 드롭다운 */}
          {isDropdownOpen && (
            <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
              {isFetching && (
                <p className="px-4 py-3 text-sm text-muted-foreground">검색 중...</p>
              )}

              {!isFetching && results.length > 0 && (
                <ul>
                  {results.map((perf) => (
                    <li key={perf.id}>
                      <button
                        type="button"
                        onClick={() => handleSelectFromSearch(perf)}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/60 transition"
                      >
                        <div className="h-12 w-9 flex-shrink-0 overflow-hidden rounded-lg border border-border/60 bg-muted">
                          {perf.poster_url ? (
                            <Image
                              src={perf.poster_url}
                              alt={perf.title}
                              width={36}
                              height={48}
                              className="h-full w-full object-cover"
                              unoptimized={perf.poster_url.startsWith("http://")}
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">
                              🎭
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {perf.title}
                          </p>
                          {perf.category && (
                            <p className="text-xs text-muted-foreground">{perf.category}</p>
                          )}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {/* 없으면 직접 등록 유도 */}
              <button
                type="button"
                onClick={handleSwitchToRegister}
                className="flex w-full items-center gap-2 border-t border-border/60 px-4 py-3 text-sm text-primary hover:bg-primary/5 transition"
              >
                <Plus className="h-4 w-4" />
                {!isFetching && hasSearched && results.length === 0
                  ? `"${query}" 공연이 없어요 — 직접 등록하기`
                  : "찾는 공연이 없나요? 직접 등록하기"}
              </button>
            </div>
          )}

          {/* 직접 등록 진입 버튼 (드롭다운 없을 때) */}
          {!isDropdownOpen && !selected && (
            <button
              type="button"
              onClick={handleSwitchToRegister}
              className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition"
            >
              <Plus className="h-3 w-3" />
              찾는 공연이 없으면 직접 등록할 수 있어요
            </button>
          )}
        </div>
      )}

      {/* ── 직접 등록 모드 ── */}
      {mode === "register" && (
        <div className="space-y-4 rounded-2xl border border-border bg-background/60 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">공연 직접 등록</p>
            <button
              type="button"
              onClick={() => setMode("search")}
              className="text-xs text-muted-foreground hover:text-foreground transition"
            >
              ← 검색으로 돌아가기
            </button>
          </div>

          {/* 공연 제목 */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              공연 제목 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={regTitle}
              onChange={(e) => setRegTitle(e.target.value)}
              placeholder="예: 햄릿 2025, 지킬 앤 하이드"
              className="w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* 장르 */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">장르 (선택)</label>
              <select
                value={regCategory}
                onChange={(e) => setRegCategory(e.target.value)}
                className="w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
              >
                <option value="">선택 안함</option>
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* 공연장 */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">공연장 (선택)</label>
              <input
                type="text"
                value={regVenue}
                onChange={(e) => setRegVenue(e.target.value)}
                placeholder="예: 샤롯데씨어터"
                className="w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
              />
            </div>
          </div>

          {regError && (
            <div className="flex items-center gap-2 rounded-2xl border border-rose-400/40 bg-rose-500/10 p-3 text-sm text-rose-600">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {regError}
            </div>
          )}

          <button
            type="button"
            onClick={handleRegisterSubmit}
            disabled={isPending || !regTitle.trim()}
            className="w-full rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50 transition hover:bg-primary/90"
          >
            {isPending ? "등록 중..." : "공연 등록 후 후기 작성하기"}
          </button>
        </div>
      )}

      {/* 선택된 공연 + 후기 작성 버튼 */}
      {selected && mode === "search" && (
        <div className="flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary/5 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">선택된 공연</p>
            <p className="truncate text-sm font-semibold text-foreground">{selected.title}</p>
            {selected.category && (
              <p className="text-xs text-primary">{selected.category}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setWriteOpen(true)}
            className="inline-flex flex-shrink-0 items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:-translate-y-0.5 hover:bg-primary/90"
          >
            <PenLine className="h-4 w-4" />
            후기 쓰기
          </button>
        </div>
      )}

      {/* 후기 작성 모달 */}
      {writeOpen && selected && (
        <ReviewWriteModal
          performanceId={selected.id}
          performanceSlug={selected.slug}
          performanceCategory={selected.category ?? undefined}
          onClose={() => {
            setWriteOpen(false)
            handleClear()
          }}
        />
      )}
    </div>
  )
}
