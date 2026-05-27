"use client"

import { useState, useTransition, useEffect } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { Eye, EyeOff, Save, Loader2, Search, X } from "lucide-react"
import type { BlogPostInput } from "@/app/admin/blog/actions"

// react-markdown은 클라이언트에서만 사용
const ReactMarkdown = dynamic(() => import("react-markdown"), { ssr: false })

type PerformanceOption = { id: string; title: string; slug: string | null }

type Props = {
  mode: "create" | "edit"
  initialData?: Partial<BlogPostInput> & { id?: string }
  action: (input: BlogPostInput) => Promise<{ success: boolean; error?: string; id?: string }>
}

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9가-힣-]/g, "")
    .slice(0, 60)
}

export function BlogPostForm({ mode, initialData, action }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [title, setTitle] = useState(initialData?.title ?? "")
  const [slug, setSlug] = useState(initialData?.slug ?? "")
  const [excerpt, setExcerpt] = useState(initialData?.excerpt ?? "")
  const [body, setBody] = useState(initialData?.body ?? "")
  const [coverImageUrl, setCoverImageUrl] = useState(initialData?.cover_image_url ?? "")
  const [tagsRaw, setTagsRaw] = useState((initialData?.tags ?? []).join(", "))
  const [isPublished, setIsPublished] = useState(initialData?.is_published ?? false)
  const [performanceId, setPerformanceId] = useState(initialData?.performance_id ?? "")
  const [performanceSearch, setPerformanceSearch] = useState("")
  const [performanceResults, setPerformanceResults] = useState<PerformanceOption[]>([])
  const [selectedPerformance, setSelectedPerformance] = useState<PerformanceOption | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // 제목 → slug 자동 생성 (신규 작성 시)
  useEffect(() => {
    if (mode === "create" && title && !initialData?.slug) {
      setSlug(slugify(title))
    }
  }, [title, mode, initialData?.slug])

  // 공연 검색
  async function searchPerformances(query: string) {
    if (!query.trim()) { setPerformanceResults([]); return }
    try {
      const res = await fetch(`/api/performances/search?q=${encodeURIComponent(query)}`)
      if (res.ok) {
        const data = await res.json()
        setPerformanceResults(data.results ?? [])
      }
    } catch {
      setPerformanceResults([])
    }
  }

  function handleSubmit() {
    setError("")
    setSuccess("")

    if (!title.trim()) { setError("제목을 입력해주세요."); return }
    if (!slug.trim()) { setError("슬러그를 입력해주세요."); return }

    const input: BlogPostInput = {
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt.trim() || undefined,
      body: body.trim() || undefined,
      cover_image_url: coverImageUrl.trim() || undefined,
      tags: tagsRaw.split(",").map((t) => t.trim()).filter(Boolean),
      is_published: isPublished,
      performance_id: performanceId || null,
    }

    startTransition(async () => {
      const result = await action(input)
      if (result.success) {
        setSuccess(mode === "create" ? "글이 저장되었습니다." : "수정되었습니다.")
        setTimeout(() => router.push("/admin/blog"), 1200)
      } else {
        setError(result.error ?? "저장에 실패했습니다.")
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* 에러/성공 메시지 */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 왼쪽: 메인 에디터 */}
        <div className="space-y-4 lg:col-span-2">
          {/* 제목 */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">
              제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="공연 에세이 제목"
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* 슬러그 */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">
              슬러그 (URL) <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center rounded-lg border border-border bg-muted/30 px-3 py-2.5">
              <span className="mr-1 text-sm text-muted-foreground">/blog/</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="url-slug"
                className="flex-1 bg-transparent text-sm text-foreground focus:outline-none"
              />
            </div>
          </div>

          {/* 한 줄 요약 */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">한 줄 요약</label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
              placeholder="목록 카드에 표시될 짧은 설명 (150자 이내)"
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none resize-none"
            />
          </div>

          {/* 본문 (마크다운) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-foreground">본문 (마크다운)</label>
              <button
                type="button"
                onClick={() => setShowPreview((v) => !v)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80"
              >
                {showPreview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                {showPreview ? "에디터" : "미리보기"}
              </button>
            </div>

            {showPreview ? (
              <div className="min-h-64 rounded-lg border border-border bg-background p-4 prose prose-sm max-w-none">
                {body ? <ReactMarkdown>{body}</ReactMarkdown> : (
                  <p className="text-muted-foreground text-sm">미리보기할 내용이 없습니다.</p>
                )}
              </div>
            ) : (
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={20}
                placeholder="## 제목&#10;&#10;본문 내용을 마크다운으로 작성하세요..."
                className="w-full rounded-lg border border-border bg-background px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none resize-y"
              />
            )}
          </div>
        </div>

        {/* 오른쪽: 메타 정보 */}
        <div className="space-y-4">
          {/* 발행 설정 */}
          <div className="rounded-lg border border-border p-4 space-y-3">
            <p className="text-sm font-bold text-foreground">발행 설정</p>

            <label className="flex cursor-pointer items-center gap-3">
              <div
                onClick={() => setIsPublished((v) => !v)}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  isPublished ? "bg-primary" : "bg-muted"
                }`}
              >
                <span
                  className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                    isPublished ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </div>
              <span className="text-sm font-semibold text-foreground">
                {isPublished ? "공개" : "비공개 (초안)"}
              </span>
            </label>
          </div>

          {/* 커버 이미지 */}
          <div className="rounded-lg border border-border p-4 space-y-2">
            <p className="text-sm font-bold text-foreground">커버 이미지</p>
            <input
              type="url"
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
            {coverImageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverImageUrl}
                alt="커버 미리보기"
                className="mt-2 w-full rounded-lg object-cover"
                style={{ maxHeight: 160 }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            )}
          </div>

          {/* 태그 */}
          <div className="rounded-lg border border-border p-4 space-y-2">
            <p className="text-sm font-bold text-foreground">태그</p>
            <input
              type="text"
              value={tagsRaw}
              onChange={(e) => setTagsRaw(e.target.value)}
              placeholder="연극, 뮤지컬, 큐레이션"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
            <p className="text-xs text-muted-foreground">쉼표(,)로 구분</p>
          </div>

          {/* 연결 공연 */}
          <div className="rounded-lg border border-border p-4 space-y-2">
            <p className="text-sm font-bold text-foreground">연결 공연 (선택)</p>
            {selectedPerformance ? (
              <div className="flex items-center justify-between rounded-lg bg-primary/8 px-3 py-2">
                <span className="text-sm font-semibold text-primary truncate">{selectedPerformance.title}</span>
                <button
                  type="button"
                  onClick={() => { setSelectedPerformance(null); setPerformanceId("") }}
                  className="ml-2 flex-shrink-0 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <div className="flex items-center gap-2">
                  <Search className="h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={performanceSearch}
                    onChange={(e) => {
                      setPerformanceSearch(e.target.value)
                      searchPerformances(e.target.value)
                    }}
                    placeholder="공연 검색..."
                    className="flex-1 bg-transparent text-sm text-foreground focus:outline-none"
                  />
                </div>
                {performanceResults.length > 0 && (
                  <ul className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-background shadow-lg">
                    {performanceResults.slice(0, 5).map((p) => (
                      <li key={p.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPerformance(p)
                            setPerformanceId(p.id)
                            setPerformanceSearch("")
                            setPerformanceResults([])
                          }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-muted/50 truncate"
                        >
                          {p.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* 저장 버튼 */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-primary bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {mode === "create" ? "글 저장" : "수정 저장"}
          </button>
        </div>
      </div>
    </div>
  )
}
