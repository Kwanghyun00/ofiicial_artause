"use client"

import { useState, useEffect, useRef, useTransition } from "react"
import { PenLine, Search, X, Plus, AlertCircle, ArrowRight, Loader2 } from "lucide-react"
import Image from "next/image"
import { ReviewWriteModal } from "./ReviewWriteModal"
import { Portal } from "@/components/ui/Portal"
import { findOrCreatePerformanceAction } from "@/app/reviews/performance-actions"
import type { PerformanceSearchResult } from "@/app/api/performances/search/route"
import type { FoundOrCreatedPerformance } from "@/app/reviews/performance-actions"

const CATEGORY_OPTIONS = ["뮤지컬", "연극", "클래식", "콘서트", "무용", "전시", "오페라", "기타"]

type FlowStep = "idle" | "select" | "write"

interface WriteReviewFlowProps {
  /** 버튼 텍스트 (기본: "후기 작성하기") */
  label?: string
  /** 버튼 variant */
  variant?: "primary" | "outline"
  /** 공연이 이미 확정된 경우 (쇼 상세 페이지 등) */
  preselectedPerformance?: {
    id: string
    slug: string
    title: string
    category?: string
  }
  /** 작성 완료 후 콜백 */
  onSuccess?: () => void
}

export function WriteReviewFlow({
  label = "후기 작성하기",
  variant = "primary",
  preselectedPerformance,
  onSuccess,
}: WriteReviewFlowProps) {
  const [step, setStep] = useState<FlowStep>("idle")
  const [selectedPerf, setSelectedPerf] = useState<FoundOrCreatedPerformance | null>(
    preselectedPerformance
      ? { ...preselectedPerformance, category: preselectedPerformance.category ?? null }
      : null
  )

  const handleOpen = () => {
    if (preselectedPerformance) {
      setStep("write")
    } else {
      setStep("select")
    }
  }

  const handlePerfSelected = (perf: FoundOrCreatedPerformance) => {
    setSelectedPerf(perf)
    setStep("write")
  }

  const handleClose = () => {
    setStep("idle")
    if (!preselectedPerformance) setSelectedPerf(null)
  }

  const handleWriteClose = () => {
    handleClose()
    onSuccess?.()
  }

  return (
    <>
      {/* 트리거 버튼 */}
      <button
        type="button"
        onClick={handleOpen}
        className={
          variant === "primary"
            ? "inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-stage transition-all hover:-translate-y-0.5 hover:bg-primary/90"
            : "inline-flex items-center gap-2 rounded-full border border-primary px-6 py-3 text-sm font-bold text-primary transition-all hover:bg-primary/5"
        }
        style={{ transitionTimingFunction: "var(--ease-out-expo)" }}
      >
        <PenLine className="h-4 w-4" />
        {label}
      </button>

      {/* 공연 선택 모달 */}
      {step === "select" && (
        <PerformanceSelectModal
          onSelect={handlePerfSelected}
          onClose={() => setStep("idle")}
        />
      )}

      {/* 후기 작성 모달 */}
      {step === "write" && selectedPerf && (
        <ReviewWriteModal
          performanceId={selectedPerf.id}
          performanceSlug={selectedPerf.slug}
          performanceCategory={selectedPerf.category ?? undefined}
          onClose={handleWriteClose}
        />
      )}
    </>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
   공연 선택 모달
───────────────────────────────────────────────────────────────────────── */
function PerformanceSelectModal({
  onSelect,
  onClose,
}: {
  onSelect: (perf: FoundOrCreatedPerformance) => void
  onClose: () => void
}) {
  const [mode, setMode] = useState<"search" | "register">("search")
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<PerformanceSearchResult[]>([])
  const [isFetching, setIsFetching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  const [regTitle, setRegTitle] = useState("")
  const [regCategory, setRegCategory] = useState("")
  const [regVenue, setRegVenue] = useState("")
  const [regError, setRegError] = useState("")
  const [isPending, startTransition] = useTransition()

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 외부 클릭 → 드롭다운 닫기
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  // body 스크롤 잠금
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = "" }
  }, [])

  // 검색 debounce
  useEffect(() => {
    if (mode !== "search" || !query.trim()) {
      setResults([])
      setShowDropdown(false)
      setHasSearched(false)
      return
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setIsFetching(true)
      try {
        const res = await fetch(`/api/performances/search?q=${encodeURIComponent(query.trim())}`)
        const data: PerformanceSearchResult[] = await res.json()
        setResults(data)
        setHasSearched(true)
        setShowDropdown(true)
      } catch {
        setResults([])
        setHasSearched(true)
      } finally {
        setIsFetching(false)
      }
    }, 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, mode])

  const handleSelect = (perf: PerformanceSearchResult) => {
    onSelect({ id: perf.id, slug: perf.slug, title: perf.title, category: perf.category })
  }

  const handleRegisterSubmit = () => {
    if (!regTitle.trim()) { setRegError("공연 제목을 입력해 주세요."); return }
    setRegError("")
    startTransition(async () => {
      const result = await findOrCreatePerformanceAction({
        title: regTitle,
        category: regCategory || undefined,
        venue: regVenue || undefined,
      })
      if (!result.success) { setRegError(result.error); return }
      onSelect(result.performance)
    })
  }

  return (
    <Portal>
    <div
      role="dialog"
      aria-modal="true"
      aria-label="공연 선택"
      className="fixed inset-0 z-[200] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-6 lg:p-8"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative flex w-full flex-col overflow-hidden rounded-t-2xl border border-border/70 bg-card shadow-2xl
          h-[80svh]
          sm:h-auto sm:max-h-[70svh] sm:max-w-lg sm:rounded-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex shrink-0 items-center justify-between border-b border-border/50 px-5 py-4">
          <div>
            <p className="text-base font-bold text-foreground">어떤 공연을 보셨나요?</p>
            <p className="text-xs text-muted-foreground">공연을 검색하거나 직접 입력해 주세요</p>
          </div>
          <button
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:border-primary hover:text-primary"
            aria-label="닫기"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* 탭 */}
          <div className="flex gap-2">
            {(["search", "register"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setRegError("") }}
                className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
                  mode === m
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {m === "search" ? "🔍 공연 검색" : "✏️ 직접 입력"}
              </button>
            ))}
          </div>

          {/* 검색 모드 */}
          {mode === "search" && (
            <div ref={containerRef} className="relative">
              <div className="relative flex items-center">
                <Search className="absolute left-4 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  ref={inputRef}
                  autoFocus
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => { if (results.length > 0) setShowDropdown(true) }}
                  placeholder="공연 제목 검색 (예: 지킬 앤 하이드)"
                  className="w-full rounded-xl border border-border bg-background pl-10 pr-10 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                />
                {isFetching && (
                  <Loader2 className="absolute right-3 h-4 w-4 animate-spin text-muted-foreground" />
                )}
                {query && !isFetching && (
                  <button
                    type="button"
                    onClick={() => { setQuery(""); setResults([]); setShowDropdown(false) }}
                    className="absolute right-3 rounded-full p-0.5 text-muted-foreground hover:text-foreground transition"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {showDropdown && (
                <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
                  {results.map((perf) => (
                    <button
                      key={perf.id}
                      type="button"
                      onClick={() => handleSelect(perf)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/60 transition"
                    >
                      <div className="h-12 w-9 shrink-0 overflow-hidden rounded-lg border border-border/60 bg-muted">
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
                          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">🎭</div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">{perf.title}</p>
                        {perf.category && (
                          <p className="text-xs text-muted-foreground">{perf.category}</p>
                        )}
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/40" />
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => { setMode("register"); setRegTitle(query); setShowDropdown(false) }}
                    className="flex w-full items-center gap-2 border-t border-border/60 px-4 py-3 text-sm text-primary hover:bg-primary/5 transition"
                  >
                    <Plus className="h-4 w-4" />
                    {hasSearched && results.length === 0
                      ? `"${query}" 공연이 없어요 — 직접 입력하기`
                      : "찾는 공연이 없으면 직접 입력하기"}
                  </button>
                </div>
              )}

              {!showDropdown && !query && (
                <p className="text-xs text-muted-foreground">
                  공연 제목을 입력하면 자동으로 검색됩니다
                </p>
              )}
            </div>
          )}

          {/* 직접 입력 모드 */}
          {mode === "register" && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  공연 제목 <span className="text-destructive">*</span>
                </label>
                <input
                  autoFocus
                  type="text"
                  value={regTitle}
                  onChange={(e) => setRegTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleRegisterSubmit()}
                  placeholder="예: 햄릿 2025, 지킬 앤 하이드"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">장르 (선택)</label>
                  <select
                    value={regCategory}
                    onChange={(e) => setRegCategory(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                  >
                    <option value="">선택 안함</option>
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">공연장 (선택)</label>
                  <input
                    type="text"
                    value={regVenue}
                    onChange={(e) => setRegVenue(e.target.value)}
                    placeholder="예: 샤롯데씨어터"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                  />
                </div>
              </div>

              {regError && (
                <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {regError}
                </div>
              )}

              <button
                type="button"
                onClick={handleRegisterSubmit}
                disabled={isPending || !regTitle.trim()}
                className="w-full rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground shadow-stage transition-all hover:-translate-y-px hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> 확인 중...
                  </span>
                ) : (
                  "이 공연으로 후기 작성하기 →"
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
    </Portal>
  )
}
