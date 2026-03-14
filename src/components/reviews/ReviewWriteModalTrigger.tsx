"use client"

import { useState } from "react"
import { PenLine } from "lucide-react"
import { ReviewWriteModal } from "./ReviewWriteModal"

interface ReviewWriteModalTriggerProps {
  performanceId: string
  performanceSlug: string
}

export function ReviewWriteModalTrigger({
  performanceId,
  performanceSlug,
}: ReviewWriteModalTriggerProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:-translate-y-0.5 hover:bg-primary/90"
      >
        <PenLine className="h-4 w-4" />
        후기 작성하기
      </button>
      {open && (
        <ReviewWriteModal
          performanceId={performanceId}
          performanceSlug={performanceSlug}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
