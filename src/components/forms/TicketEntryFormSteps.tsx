"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

type Props = {
  campaignId: string
  slug: string
  campaignTitle: string
  performanceTitle?: string | null
  availableDates?: string[]
}

export function TicketEntryFormSteps({ campaignTitle, availableDates }: Props) {
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setSubmitting(false)
    alert("신청이 접수되었습니다. 결과는 문자/이메일로 안내드립니다.")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" aria-label={`${campaignTitle} 초대 신청`}>
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>아래 정보를 입력해 주시면 초대 추첨 후 결과를 안내드립니다.</p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground">이름</label>
        <Input required placeholder="홍길동" />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground">연락처</label>
        <Input required placeholder="010-0000-0000" />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground">이메일</label>
        <Input required type="email" placeholder="you@example.com" />
      </div>

      {availableDates && availableDates.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">희망 관람일</label>
          <select className="w-full rounded-lg border border-border px-3 py-2 text-sm">
            {availableDates.map((date) => (
              <option key={date} value={date}>
                {date}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground">신청 사유</label>
        <Textarea rows={4} placeholder="이 공연에 참석하고 싶은 이유를 간단히 적어 주세요." />
      </div>

      <div className="space-y-3 text-sm text-muted-foreground">
        <label className="flex items-center gap-2">
          <Checkbox required />
          개인정보 수집·이용에 동의합니다.
        </label>
        <label className="flex items-center gap-2">
          <Checkbox required />
          초대 이벤트 안내 및 규칙에 동의합니다.
        </label>
      </div>

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "신청 중..." : "초대 신청 완료"}
      </Button>
    </form>
  )
}
