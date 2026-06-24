"use client"

import { ExternalLink } from "lucide-react"
import { daysUntilKst } from "@/lib/date"

type Props = {
  endDate: string
  bookingUrl?: string
  platform?: string
}

export function PerformanceStatus({ endDate, bookingUrl, platform }: Props) {
  const daysLeft = daysUntilKst(endDate)
  const isEnded = daysLeft < 0
  const isUrgent = daysLeft >= 0 && daysLeft <= 7

  if (isEnded) {
    return (
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-foreground/8 px-3 py-1 text-xs font-medium text-foreground/40">
          <span className="h-1.5 w-1.5 rounded-full bg-foreground/30" />
          공연 종료
        </div>
        <button
          disabled
          className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-none border border-foreground/15 bg-foreground/5 px-6 py-3 text-sm font-semibold text-foreground/30"
        >
          공연이 종료되었습니다
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {isUrgent && (
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
          D-{daysLeft} 마감 임박
        </div>
      )}
      {bookingUrl ? (
        <a
          href={bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
        >
          <ExternalLink className="h-4 w-4 shrink-0" />
          {platform ? `${platform}에서 예매하기` : "지금 예매하기"}
        </a>
      ) : (
        <div className="flex w-full items-center justify-center gap-2 border border-primary/30 bg-primary/5 px-6 py-3 text-sm font-semibold text-primary/60">
          공연 진행 중
        </div>
      )}
    </div>
  )
}
