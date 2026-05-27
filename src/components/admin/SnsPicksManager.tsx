"use client"

import { useState, useTransition, useRef } from "react"
import Image from "next/image"
import {
  Plus, Trash2, GripVertical, Instagram, Youtube, X,
  Search, Check, ChevronUp, ChevronDown, Save, Loader2
} from "lucide-react"
import { createSnsPick, updateSnsPick, deleteSnsPick, reorderSnsPick } from "@/app/admin/sns-picks/actions"
import type { SnsPickInput } from "@/app/admin/sns-picks/actions"

// ─── Types ────────────────────────────────────────────────────────────────────

type ChannelType = "instagram" | "youtube" | "tiktok" | "all"

type PickRow = {
  id: string
  performance_id: string
  caption: string | null
  channel: ChannelType
  display_order: number
  promo_start: string | null
  promo_end: string | null
  is_active: boolean
  performance: {
    title: string
    slug: string
    poster_url: string | null
    category: string | null
  } | null
}

type PerformanceResult = {
  id: string
  title: string
  slug: string
  category: string | null
  poster_url: string | null
}

interface SnsPicksManagerProps {
  initialPicks: PickRow[]
}

// ─── Channel info ─────────────────────────────────────────────────────────────

const CHANNEL_OPTIONS: { value: ChannelType; label: string; color: string }[] = [
  { value: "instagram", label: "인스타그램", color: "bg-pink-100 text-pink-700" },
  { value: "youtube",   label: "유튜브",     color: "bg-red-100 text-red-700" },
  { value: "tiktok",    label: "틱톡",       color: "bg-slate-100 text-slate-700" },
  { value: "all",       label: "전체",       color: "bg-purple-100 text-purple-700" },
]

function ChannelBadge({ channel }: { channel: ChannelType }) {
  const opt = CHANNEL_OPTIONS.find((c) => c.value === channel) ?? CHANNEL_OPTIONS[3]
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${opt.color}`}>
      {channel === "instagram" && <Instagram className="h-2.5 w-2.5" />}
      {channel === "youtube"   && <Youtube className="h-2.5 w-2.5" />}
      {channel === "tiktok"    && <span className="text-[9px] font-black">T</span>}
      {channel === "all"       && <span className="text-[9px] font-black">ALL</span>}
      {opt.label}
    </span>
  )
}

// ─── Add / Edit Form ──────────────────────────────────────────────────────────

function PickForm({
  initial,
  mode,
  onSuccess,
  onCancel,
}: {
  initial?: Partial<PickRow>
  mode: "create" | "edit"
  onSuccess: () => void
  onCancel: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  // Performance search state
  const [query, setQuery] = useState(initial?.performance?.title ?? "")
  const [results, setResults] = useState<PerformanceResult[]>([])
  const [selected, setSelected] = useState<PerformanceResult | null>(
    initial?.performance
      ? { id: initial.performance_id!, title: initial.performance.title, slug: initial.performance.slug, category: initial.performance.category ?? null, poster_url: initial.performance.poster_url ?? null }
      : null
  )
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Form fields
  const [channel, setChannel] = useState<ChannelType>(initial?.channel ?? "instagram")
  const [caption, setCaption] = useState(initial?.caption ?? "")
  const [promoStart, setPromoStart] = useState(initial?.promo_start ? initial.promo_start.slice(0, 10) : "")
  const [promoEnd, setPromoEnd] = useState(initial?.promo_end ? initial.promo_end.slice(0, 10) : "")
  const [isActive, setIsActive] = useState(initial?.is_active ?? true)

  async function handleSearch(q: string) {
    setQuery(q)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    if (q.trim().length < 1) { setResults([]); return }
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/performances/search?q=${encodeURIComponent(q)}`)
        const data = await res.json()
        setResults(data)
      } catch {
        setResults([])
      }
    }, 200)
  }

  function handleSelect(p: PerformanceResult) {
    setSelected(p)
    setQuery(p.title)
    setResults([])
  }

  function handleSubmit() {
    if (!selected) { setError("공연을 선택해주세요."); return }
    setError(null)

    const input: SnsPickInput = {
      performance_id: selected.id,
      channel,
      caption: caption.trim() || undefined,
      promo_start: promoStart || undefined,
      promo_end: promoEnd || undefined,
      is_active: isActive,
    }

    startTransition(async () => {
      const result = mode === "create"
        ? await createSnsPick(input)
        : await updateSnsPick(initial!.id!, input)
      if (result.success) {
        onSuccess()
      } else {
        setError(result.error ?? "저장 실패")
      }
    })
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <h3 className="text-sm font-bold text-foreground">
        {mode === "create" ? "새 SNS 픽 추가" : "SNS 픽 수정"}
      </h3>

      {/* Performance Search */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground">공연 선택 *</label>
        <div className="relative">
          <div className="relative flex items-center">
            <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="공연명 검색..."
              value={query}
              onChange={(e) => { setSelected(null); handleSearch(e.target.value) }}
              className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            {selected && <Check className="absolute right-3 h-4 w-4 text-emerald-500" />}
          </div>
          {results.length > 0 && (
            <div className="absolute z-20 mt-1 w-full rounded-lg border border-border bg-card shadow-lg max-h-56 overflow-y-auto">
              {results.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelect(p)}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-muted/60 transition-colors"
                >
                  {p.poster_url ? (
                    <Image src={p.poster_url} alt={p.title} width={32} height={44} className="h-11 w-8 shrink-0 rounded object-cover" />
                  ) : (
                    <div className="h-11 w-8 shrink-0 rounded bg-muted" />
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{p.title}</p>
                    {p.category && <p className="text-xs text-muted-foreground">{p.category}</p>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Channel */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground">SNS 채널</label>
        <div className="flex flex-wrap gap-2">
          {CHANNEL_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setChannel(opt.value)}
              className={`rounded-full px-3 py-1 text-xs font-bold border transition ${
                channel === opt.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/40"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Caption */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground">캡션 (SNS 한줄 소개)</label>
        <textarea
          rows={2}
          placeholder="예: 서울에서 꼭 봐야 할 뮤지컬 TOP1 🎭"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Promo period */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">노출 시작일</label>
          <input
            type="date"
            value={promoStart}
            onChange={(e) => setPromoStart(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">노출 종료일</label>
          <input
            type="date"
            value={promoEnd}
            onChange={(e) => setPromoEnd(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {/* Active toggle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={isActive}
          onClick={() => setIsActive(!isActive)}
          className={`relative h-5 w-9 rounded-full transition-colors ${isActive ? "bg-primary" : "bg-muted-foreground/30"}`}
        >
          <span
            className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${isActive ? "translate-x-4" : "translate-x-0.5"}`}
          />
        </button>
        <span className="text-sm text-muted-foreground">{isActive ? "활성" : "비활성"}</span>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-lg border-2 border-primary bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
        >
          {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          저장
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:border-foreground/40 hover:text-foreground"
        >
          취소
        </button>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SnsPicksManager({ initialPicks }: SnsPicksManagerProps) {
  const [picks, setPicks] = useState<PickRow[]>(initialPicks)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  function handleRefresh() {
    // Server action revalidatePath fires; user can reload, but we optimistically
    // close the form. The real list update comes from parent re-render on nav.
    window.location.reload()
  }

  function handleDelete(id: string) {
    if (!confirm("정말 삭제하시겠습니까?")) return
    setDeletingId(id)
    startTransition(async () => {
      const result = await deleteSnsPick(id)
      if (result.success) {
        setPicks((prev) => prev.filter((p) => p.id !== id))
      } else {
        alert("삭제 실패: " + result.error)
      }
      setDeletingId(null)
    })
  }

  function handleMoveUp(idx: number) {
    if (idx === 0) return
    const newPicks = [...picks]
    const tmp = newPicks[idx - 1]
    newPicks[idx - 1] = newPicks[idx]
    newPicks[idx] = tmp
    // Optimistic update
    const updated = newPicks.map((p, i) => ({ ...p, display_order: i }))
    setPicks(updated)
    startTransition(async () => {
      await reorderSnsPick(newPicks[idx - 1].id, idx - 1)
      await reorderSnsPick(newPicks[idx].id, idx)
    })
  }

  function handleMoveDown(idx: number) {
    if (idx === picks.length - 1) return
    handleMoveUp(idx + 1)
  }

  return (
    <div className="space-y-6">
      {/* Add button */}
      {!showAddForm && (
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center gap-2 rounded-lg border-2 border-primary bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          새 픽 추가
        </button>
      )}

      {/* Add form */}
      {showAddForm && (
        <PickForm
          mode="create"
          onSuccess={() => { setShowAddForm(false); handleRefresh() }}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* List */}
      {picks.length === 0 && !showAddForm ? (
        <div className="flex flex-col items-center py-16 text-center text-muted-foreground">
          <p className="text-4xl mb-3">📸</p>
          <p className="font-semibold">아직 등록된 SNS 픽이 없습니다.</p>
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="mt-4 text-sm text-primary hover:underline"
          >
            첫 번째 픽 추가하기 →
          </button>
        </div>
      ) : (
        <div className="divide-y divide-border rounded-xl border border-border">
          {picks.map((pick, idx) => (
            <div key={pick.id}>
              {editingId === pick.id ? (
                <div className="p-4">
                  <PickForm
                    mode="edit"
                    initial={pick}
                    onSuccess={() => { setEditingId(null); handleRefresh() }}
                    onCancel={() => setEditingId(null)}
                  />
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors">
                  {/* Reorder */}
                  <div className="flex shrink-0 flex-col gap-0.5">
                    <button
                      type="button"
                      onClick={() => handleMoveUp(idx)}
                      disabled={idx === 0 || isPending}
                      className="rounded p-0.5 text-muted-foreground/50 hover:text-foreground disabled:opacity-30 transition"
                      title="위로"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <GripVertical className="h-3.5 w-3.5 text-muted-foreground/30" />
                    <button
                      type="button"
                      onClick={() => handleMoveDown(idx)}
                      disabled={idx === picks.length - 1 || isPending}
                      className="rounded p-0.5 text-muted-foreground/50 hover:text-foreground disabled:opacity-30 transition"
                      title="아래로"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Order badge */}
                  <span className="shrink-0 w-6 text-center text-xs font-bold text-muted-foreground">
                    {idx + 1}
                  </span>

                  {/* Poster */}
                  {pick.performance?.poster_url ? (
                    <Image
                      src={pick.performance.poster_url}
                      alt={pick.performance.title}
                      width={40}
                      height={56}
                      className="shrink-0 rounded object-cover h-14 w-10"
                    />
                  ) : (
                    <div className="shrink-0 h-14 w-10 rounded bg-muted" />
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <ChannelBadge channel={pick.channel} />
                      {!pick.is_active && (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-bold text-muted-foreground">
                          비활성
                        </span>
                      )}
                      <span className="text-sm font-semibold text-foreground truncate">
                        {pick.performance?.title ?? "(삭제된 공연)"}
                      </span>
                    </div>
                    {pick.caption && (
                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{pick.caption}</p>
                    )}
                    {(pick.promo_start || pick.promo_end) && (
                      <p className="mt-0.5 text-xs text-muted-foreground/60">
                        {pick.promo_start && new Date(pick.promo_start).toLocaleDateString("ko-KR")}
                        {pick.promo_start && pick.promo_end && " ~ "}
                        {pick.promo_end && new Date(pick.promo_end).toLocaleDateString("ko-KR")}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="shrink-0 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingId(pick.id)}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition hover:border-primary/60 hover:text-primary"
                    >
                      수정
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(pick.id)}
                      disabled={deletingId === pick.id || isPending}
                      className="rounded-lg border border-destructive/30 px-3 py-1.5 text-xs font-semibold text-destructive transition hover:bg-destructive/10 disabled:opacity-50"
                    >
                      {deletingId === pick.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Trash2 className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
