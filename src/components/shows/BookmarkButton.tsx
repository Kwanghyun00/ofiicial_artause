"use client"

import { useOptimistic, useTransition } from "react"
import { Bookmark } from "lucide-react"
import { toggleBookmark } from "@/app/my/actions"

interface BookmarkButtonProps {
  performanceId: string
  initialBookmarked: boolean
  /** true면 아이콘+텍스트, false면 아이콘만 */
  showLabel?: boolean
}

export function BookmarkButton({ performanceId, initialBookmarked, showLabel = false }: BookmarkButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [bookmarked, setOptimistic] = useOptimistic(initialBookmarked)

  function handleClick() {
    startTransition(async () => {
      setOptimistic(!bookmarked)
      const result = await toggleBookmark(performanceId)

      // 로그인 필요 알림
      if (result.error) {
        const confirmed = window.confirm(`${result.error}\n\n로그인 페이지로 이동하시겠습니까?`)
        if (confirmed) window.location.href = "/my/login"
      }
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      aria-label={bookmarked ? "북마크 해제" : "북마크 추가"}
      aria-pressed={bookmarked}
      className={[
        "inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        bookmarked
          ? "border-primary bg-primary/10 text-primary hover:bg-primary/20"
          : "border-border bg-background text-muted-foreground hover:bg-muted",
      ].join(" ")}
    >
      <Bookmark
        className={["h-4 w-4 transition-all", bookmarked ? "fill-primary" : ""].join(" ")}
      />
      {showLabel && (
        <span className="hidden sm:inline">{bookmarked ? "북마크됨" : "북마크"}</span>
      )}
    </button>
  )
}
