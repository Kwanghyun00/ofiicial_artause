"use client"

import { useState, useTransition } from "react"
import { Bug, Ellipsis, HelpCircle, Sparkles, Wand2, X } from "lucide-react"
import { submitFeedback } from "./feedback-actions"

type FeedbackType = "bug" | "feature" | "improvement" | "question" | "other"

type Props = {
  isOpen: boolean
  onClose: () => void
}

const feedbackOptions = [
  { value: "bug", label: "버그 신고", icon: Bug },
  { value: "feature", label: "기능 제안", icon: Sparkles },
  { value: "improvement", label: "개선 요청", icon: Wand2 },
  { value: "question", label: "문의/질문", icon: HelpCircle },
  { value: "other", label: "기타", icon: Ellipsis },
] as const

export function FeedbackModal({ isOpen, onClose }: Props) {
  const [type, setType] = useState<FeedbackType>("improvement")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim() || !description.trim()) {
      setError("제목과 내용을 입력해 주세요.")
      return
    }

    startTransition(async () => {
      const result = await submitFeedback({
        type,
        title: title.trim(),
        description: description.trim(),
        authorName: name.trim() || null,
        authorEmail: email.trim() || null,
      })

      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          onClose()
          setTitle("")
          setDescription("")
          setName("")
          setEmail("")
          setSuccess(false)
        }, 2000)
      } else {
        setError(result.error || "제출에 실패했습니다. 다시 시도해 주세요.")
      }
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-border/60 bg-white shadow-2xl">
        <div className="bg-gradient-to-r from-[#F7F4EC] via-white to-white px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">Feedback</p>
              <h2 className="text-2xl font-bold text-foreground">피드백 보내기</h2>
              <p className="text-sm text-muted-foreground">
                여러분의 의견을 바탕으로 서비스를 개선합니다.
              </p>
            </div>
            <button
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-muted-foreground transition hover:border-primary hover:text-primary"
              aria-label="닫기"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {success ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
              <p className="text-lg font-semibold text-emerald-900">피드백이 전송되었습니다</p>
              <p className="mt-2 text-sm text-emerald-700">소중한 의견 감사합니다.</p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">피드백 유형</label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {feedbackOptions.map((option) => {
                    const Icon = option.icon
                    const isActive = type === option.value
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setType(option.value)}
                        className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                          isActive
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-white text-muted-foreground hover:border-primary/40"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {option.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="feedback-title" className="text-sm font-semibold text-foreground">
                  제목 <span className="text-rose-500">*</span>
                </label>
                <input
                  id="feedback-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="간단히 요약해 주세요"
                  className="w-full rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/10"
                  disabled={isPending}
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="feedback-description" className="text-sm font-semibold text-foreground">
                  상세 내용 <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="feedback-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="자세한 내용을 알려 주세요"
                  rows={5}
                  className="w-full rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/10"
                  disabled={isPending}
                  maxLength={2000}
                />
                <p className="text-xs text-muted-foreground">{description.length} / 2000</p>
              </div>

              <div className="space-y-4 rounded-2xl border border-border bg-white/70 p-4">
                <p className="text-sm font-semibold text-foreground">연락처 (선택)</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="feedback-name" className="text-xs font-medium text-muted-foreground">
                      이름
                    </label>
                    <input
                      id="feedback-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="홍길동"
                      className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/10"
                      disabled={isPending}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="feedback-email" className="text-xs font-medium text-muted-foreground">
                      이메일
                    </label>
                    <input
                      id="feedback-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@email.com"
                      className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/10"
                      disabled={isPending}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  답변이 필요한 경우 연락처를 입력해 주세요.
                </p>
              </div>

              {error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-2xl border border-border bg-white px-6 py-3 font-semibold text-foreground transition hover:border-primary hover:text-primary"
                  disabled={isPending}
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isPending || !title.trim() || !description.trim()}
                  className="flex-1 rounded-2xl bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isPending ? "전송 중..." : "피드백 보내기"}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  )
}
