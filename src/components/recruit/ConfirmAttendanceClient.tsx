"use client"

import { useState } from "react"
import { CheckCircle, XCircle, Calendar, MapPin, AlertTriangle } from "lucide-react"
import { confirmAttendance, declineAttendance } from "@/app/recruit/[slug]/confirm/actions"

type ExperienceDate = {
  date: string
  time: string
  slots: number
}

type Props = {
  entryId: string
  token: string
  applicantName: string
  campaignTitle: string
  campaignSlug: string
  experienceDates: ExperienceDate[]
  requiredPlatforms: string[]
  reviewDeadlineDays: number
  venueName: string
  venueAddress: string
}

const PLATFORM_LABELS: Record<string, string> = {
  instagram: "인스타그램",
  blog_naver: "네이버 블로그",
  youtube: "유튜브",
  tiktok: "틱톡",
}

export function ConfirmAttendanceClient({
  entryId,
  token,
  applicantName,
  campaignTitle,
  campaignSlug,
  experienceDates,
  requiredPlatforms,
  reviewDeadlineDays,
  venueName,
  venueAddress,
}: Props) {
  const [selectedDate, setSelectedDate] = useState<string | null>(
    experienceDates.length === 1 ? `${experienceDates[0].date}|${experienceDates[0].time}` : null
  )
  const [step, setStep] = useState<"select" | "confirmed" | "declined">("select")
  const [qrToken, setQrToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleConfirm() {
    if (!selectedDate) return
    const [date, time] = selectedDate.split("|")
    setLoading(true)
    setError(null)

    const result = await confirmAttendance({ entryId, token, confirmedDate: date, confirmedTime: time })
    setLoading(false)

    if (result.ok) {
      setQrToken(result.qrToken ?? null)
      setStep("confirmed")
    } else {
      setError(result.error ?? "오류가 발생했습니다. 다시 시도해 주세요.")
    }
  }

  async function handleDecline() {
    if (!confirm("정말 불참 처리하시겠습니까?")) return
    setLoading(true)

    const result = await declineAttendance({ entryId, token })
    setLoading(false)

    if (result.ok) {
      setStep("declined")
    } else {
      setError(result.error ?? "오류가 발생했습니다.")
    }
  }

  if (step === "confirmed") {
    return (
      <div className="stage-panel overflow-hidden">
        <div className="border-b border-border/50 bg-primary/5 px-6 py-5 text-center">
          <CheckCircle className="mx-auto h-10 w-10 text-primary" />
          <h1 className="mt-3 text-xl font-bold text-foreground">참석이 확정되었습니다!</h1>
          <p className="mt-1 text-sm text-muted-foreground">{applicantName}님, {campaignTitle}</p>
        </div>

        <div className="p-6 space-y-6">
          {/* QR 코드 */}
          <div className="border border-border bg-muted/20 p-6 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
              입장 QR 코드
            </p>
            <p className="font-mono text-3xl font-bold tracking-[0.2em] text-primary">
              {qrToken?.slice(0, 8).toUpperCase() ?? "--------"}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">관람 당일 입구에서 이 코드를 제시하세요</p>
          </div>

          {/* 안내 사항 */}
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">체험단 활동 안내</p>
            <ul className="space-y-1 list-inside list-disc text-xs leading-relaxed">
              <li>
                관람 후 <strong>{reviewDeadlineDays}일 이내</strong>에&nbsp;
                {requiredPlatforms.map((p) => PLATFORM_LABELS[p] ?? p).join(", ")} 후기를 제출해 주세요.
              </li>
              <li>후기 미제출 시 향후 체험단 신청이 제한될 수 있습니다.</li>
              <li>QR 코드 이메일도 별도 발송됩니다.</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  if (step === "declined") {
    return (
      <div className="stage-panel p-8 text-center">
        <XCircle className="mx-auto h-10 w-10 text-muted-foreground" />
        <h1 className="mt-3 text-xl font-bold text-foreground">불참 처리되었습니다</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          다음 체험단 모집에서 다시 만나요.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="stage-panel overflow-hidden">
        <div className="border-b border-border/50 bg-primary/5 px-6 py-5">
          <span className="cue text-[11px]">체험단 선정 안내</span>
          <h1 className="mt-2 text-2xl font-bold text-foreground">
            🎉 체험단으로 선정되셨습니다!
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            <strong>{applicantName}</strong>님, <strong>{campaignTitle}</strong>
          </p>
        </div>
        <div className="p-6 text-sm text-muted-foreground space-y-2">
          {venueName && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-primary" />
              <span>{venueName}{venueAddress ? ` · ${venueAddress}` : ""}</span>
            </div>
          )}
        </div>
      </div>

      {/* 날짜 선택 */}
      <div className="stage-panel p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-4 w-4 text-primary" />
          <p className="font-semibold text-foreground">관람 날짜를 선택해주세요</p>
        </div>

        {experienceDates.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            파트너가 관람 날짜를 별도로 안내드릴 예정입니다.
          </p>
        ) : (
          <div className="space-y-2">
            {experienceDates.map((d) => {
              const key = `${d.date}|${d.time}`
              const isSelected = selectedDate === key
              const isFull = d.slots <= 0
              return (
                <button
                  key={key}
                  type="button"
                  disabled={isFull}
                  onClick={() => !isFull && setSelectedDate(key)}
                  className={`w-full flex items-center justify-between border px-4 py-3 text-left text-sm transition-colors ${
                    isFull
                      ? "border-border/40 bg-muted/30 text-muted-foreground cursor-not-allowed"
                      : isSelected
                      ? "border-primary bg-primary/8 text-foreground"
                      : "border-border hover:border-primary/40 hover:bg-muted/30"
                  }`}
                >
                  <span className="font-semibold">
                    {d.date} {d.time}
                  </span>
                  <span className={`text-xs font-bold ${isFull ? "text-muted-foreground" : "text-primary"}`}>
                    {isFull ? "마감" : `잔여 ${d.slots}석`}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* 체험단 안내 */}
      <div className="stage-panel p-6 bg-amber-50/30">
        <div className="flex gap-2 items-start">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground">체험단 활동 의무사항</p>
            <ul className="space-y-1 list-disc list-inside leading-relaxed">
              <li>관람 후 <strong>{reviewDeadlineDays}일 이내</strong> {requiredPlatforms.map((p) => PLATFORM_LABELS[p] ?? p).join(", ")} 후기 제출 필수</li>
              <li>미제출 시 향후 체험단 신청이 제한됩니다</li>
            </ul>
          </div>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 border border-red-200 bg-red-50 px-4 py-3">{error}</p>
      )}

      {/* 버튼 */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleConfirm}
          disabled={loading || (experienceDates.length > 0 && !selectedDate)}
          className="flex-1 h-12 border-2 border-primary bg-primary text-sm font-bold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? "처리 중..." : "참석 확정하기 ✦"}
        </button>
        <button
          type="button"
          onClick={handleDecline}
          disabled={loading}
          className="h-12 px-6 border border-border text-sm font-semibold text-muted-foreground transition hover:border-foreground/40 hover:text-foreground disabled:opacity-40"
        >
          불참
        </button>
      </div>
    </div>
  )
}
