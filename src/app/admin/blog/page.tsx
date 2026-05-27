import Link from "next/link"
import { Plus, Pencil, Eye, EyeOff } from "lucide-react"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/config"
import { mockCommunityPosts } from "@/lib/mocks/performances"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "블로그 관리 — Admin",
}

export default async function AdminBlogPage() {
  let posts: { id: string; title: string; slug: string; is_published: boolean; published_at: string | null; excerpt: string | null }[] = []

  if (isSupabaseConfigured) {
    const supabase = await createServerSupabaseClient()
    const { data } = await supabase
      .from("community_posts")
      .select("id, title, slug, is_published, published_at, excerpt")
      .order("created_at", { ascending: false })

    posts = (data ?? []) as typeof posts
  } else {
    posts = mockCommunityPosts.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      is_published: p.is_published,
      published_at: p.published_at,
      excerpt: p.excerpt,
    }))
  }

  const publishedCount = posts.filter((p) => p.is_published).length

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">블로그 / 에세이 관리</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            전체 {posts.length}편 · 공개 {publishedCount}편
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="inline-flex items-center gap-2 rounded-lg border-2 border-primary bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          새 글 작성
        </Link>
      </div>

      {/* 목록 */}
      {posts.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center text-muted-foreground">
          <p className="text-4xl mb-3">✍️</p>
          <p className="font-semibold">아직 작성된 글이 없습니다.</p>
          <Link href="/admin/blog/new" className="mt-4 text-sm text-primary hover:underline">
            첫 번째 글 작성하기 →
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-border rounded-xl border border-border">
          {posts.map((post) => (
            <div key={post.id} className="flex items-start justify-between gap-4 p-4 hover:bg-muted/30 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {post.is_published ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                      <Eye className="h-2.5 w-2.5" />
                      공개
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-bold text-muted-foreground">
                      <EyeOff className="h-2.5 w-2.5" />
                      초안
                    </span>
                  )}
                  <h3 className="text-sm font-semibold text-foreground truncate">{post.title}</h3>
                </div>
                {post.excerpt && (
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{post.excerpt}</p>
                )}
                <p className="mt-1 text-xs text-muted-foreground/60">/blog/{post.slug}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {post.published_at && (
                  <span className="text-xs text-muted-foreground">
                    {new Date(post.published_at).toLocaleDateString("ko-KR")}
                  </span>
                )}
                <Link
                  href={`/admin/blog/${post.id}/edit`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition hover:border-primary/60 hover:text-primary"
                >
                  <Pencil className="h-3 w-3" />
                  수정
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
