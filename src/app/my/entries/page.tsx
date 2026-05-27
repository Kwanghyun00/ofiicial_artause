import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { CalendarDays, CheckCircle2, Clock, MapPin, Search, XCircle } from "lucide-react"
import { createReadOnlySupabaseClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/config"
import { getPosterFallback } from "@/constants/posters"

export const metadata: Metadata = {
  title: "신청 현황 | 알터즈",
  description: "이메일 주소로 초대권 응모 신청 현황을 확인하세요.",
}

type EntryStatus = "pending" | "selected" | "rejected" | "declined"

interface EntryRow {
  id: string
  campaign_id: string
  submitted_at: string
  selection_status: EntryStatus | null
  attendance_status: string | null
  answers: Record<string, string> | null
  ticket_campaigns: {
    id: string
    slug: string
    title: string
    poster_image: string | null
    performance_period_start: string | null
    performance_period_end: string | null
    venue_name: string | null
    ends_at: string
  } | null
}

async function getEntriesByEmail(email: string): Promise<EntryRow[]> {
  if (!isSupabaseConfigured) return []

  const supabase = createReadOnlySupabaseClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const { data, error } = await db
    .from("ticket_entries")
    .select(`
      id,
      campaign_id,
      submitted_at,
      selection_status,
      attendance_status,
      answers,
      ticket_campaigns (
        id,
        slug,
        title,
        poster_image,
        performance_period_start,
        performance_period_end,
        venue_name,
        ends_at
      )
    `)
    .eq("applicant_email", email.trim().toLowerCase())
    .order("submitted_at", { ascending: false })
    .limit(50)

  if (error) {
    console.error("getEntriesByEmail error", error)
    return []
  }
  return (data as EntryRow[]) ?? []
}

export default async function MyEntriesPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>
}) {
  const { email } = await searchParams
  const trimmedEmail = email?.trim() ?? ""
  const entries = trimmedEmail ? await getEntriesByEmail(trimmedEmail) : null

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 space-y-10">
      {/* 헤더 */}
      <header className="space-y-2">
        <p className="text-xs font-semibold tracking-widest text-primary uppercase">My Applications</p>
        <h1 className="text-2xl font-bold text-foreground">신청 현황 확인</h1>
        <p className="text-sm text-muted-foreground">
          응모 시 입력한 이메일 주소를 입력하면 신청 내역을 확인할 수 있습니다.
        </p>
      </header>

      {/* 검색 폼 */}
      <form method="GET" action="/my/entries" className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
          <input
            type="email"
            name="email"
            defaultValue={trimmedEmail}
            placeholder="응모 시 입력한 이메일 주소"
            required
            autoComplete="email"
            className="w-full rounded-full border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <button
          type="submit"
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
        >
          조회
        </button>
      </form>

      {/* 결과 영역 */}
      {entries === null ? (
        <div className="rounded-2xl border border-dashed border-border bg-background/60 p-10 text-center">
          <p className="text-sm text-muted-foreground">이메일을 입력하고 조회 버튼을 눌러 주세요.</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-background/60 p-10 text-center space-y-2">
          <p className="text-sm font-semibold text-foreground">신청 내역이 없습니다</p>
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-primary">{trimmedEmail}</span>으로 접수된 응모 내역이 없습니다.
          </p>
          <Link href="/invites" className="inline-block mt-2 text-xs font-semibold text-primary hover:underline">
            진행 중인 이벤트 보기 →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{entries.length}건</span>의 신청 내역
          </p>
          {entries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── 신청 카드 컴포넌트 ───────────────────────────────────────────────────────

function EntryCard({ entry }: { entry: EntryRow }) {
  const campaign = entry.ticket_campaigns
  const posterUrl = campaign?.poster_image ?? getPosterFallback(0)

  const statusMeta = resolveStatus(entry.selection_status, entry.attendance_status, campaign?.ends_at)

  const preferredDate =
    entry.answers && typeof entry.answers === "object"
      ? (entry.answers as Record<string, string>).preferredDate
      : null

  return (
    <div className="flex gap-4 rounded-2xl border border-border bg-background/80 p-4 transition hover:border-primary/30 hover:bg-primary/5">
      {/* 포스터 */}
      <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded-lg">
        <Image src={posterUrl} alt={campaign?.title ?? "공연"} fill className="object-cover" sizes="56px" />
      </div>

      {/* 내용 */}
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold text-foreground line-clamp-2 text-sm">
            {campaign ? (
              <Link href={`/invites/${campaign.slug}`} className="hover:text-primary transition">
                {campaign.title}
              </Link>
            ) : (
              "삭제된 이벤트"
            )}
          </p>
          <StatusBadge {...statusMeta} />
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {campaign?.venue_name && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3 shrink-0" />
              {campaign.venue_name}
            </span>
          )}
          {(campaign?.performance_period_start || campaign?.performance_period_end) && (
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3 w-3 shrink-0" />
              {formatPeriod(campaign.performance_period_start, campaign.performance_period_end)}
            </span>
          )}
          {preferredDate && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3 shrink-0" />
              희망일: {formatDate(preferredDate)}
            </span>
          )}
        </div>

        <p className="text-[11px] text-muted-foreground/60">
          신청일:{" "}
          {new Date(entry.submitted_at).toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>
    </div>
  )
}

// ─── 상태 배지 ────────────────────────────────────────────────────────────────

type StatusInfo = { label: string; tone: string; icon?: React.ReactNode }

function StatusBadge({ label, tone }: StatusInfo) {
  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${tone}`}
    >
      {label}
    </span>
  )
}

function resolveStatus(
  selectionStatus: EntryStatus | null,
  attendanceStatus: string | null,
  endsAt?: string | null
): StatusInfo {
  // 출석 상태 우선
  if (attendanceStatus === "checked_in") {
    return { label: "관람 완료", tone: "bg-emerald-100 text-emerald-700" }
  }
  if (attendanceStatus === "no_show") {
    return { label: "미관람", tone: "bg-rose-100 text-rose-700" }
  }

  // 당첨 여부
  if (selectionStatus === "selected") {
    return { label: "✨ 당첨", tone: "bg-primary/15 text-primary font-bold" }
  }
  if (selectionStatus === "rejected" || selectionStatus === "declined") {
    return { label: "미당첨", tone: "bg-muted text-muted-foreground" }
  }

  // 마감 여부
  if (endsAt && new Date(endsAt) < new Date()) {
    return { label: "추첨 완료", tone: "bg-muted text-muted-foreground" }
  }

  return { label: "신청 완료", tone: "bg-sky-100 text-sky-700" }
}

// ─── 날짜 포맷 유틸 ───────────────────────────────────────────────────────────

function formatDate(value?: string | null) {
  if (!value) return ""
  const d = new Date(value)
  if (isNaN(d.getTime())) return value
  return d.toLocaleDateString("ko-KR", { month: "long", day: "numeric" })
}

function formatPeriod(start?: string | null, end?: string | null) {
  if (!start && !end) return ""
  if (start && end) return `${formatDate(start)} ~ ${formatDate(end)}`
  return formatDate(start ?? end)
}
