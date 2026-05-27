import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { BlogPostForm } from "@/components/admin/BlogPostForm"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/config"
import { mockCommunityPosts } from "@/lib/mocks/performances"
import { updateBlogPost } from "../../actions"

type Props = {
  params: Promise<{ id: string }>
}

export const metadata = {
  title: "글 수정 — Admin",
}

export default async function AdminBlogEditPage({ params }: Props) {
  const { id } = await params

  let post: {
    id: string; title: string; slug: string; excerpt: string | null; body: string | null;
    cover_image_url: string | null; tags: string[] | null; is_published: boolean;
    performance_id: string | null; published_at: string | null
  } | null = null

  if (isSupabaseConfigured) {
    const supabase = await createServerSupabaseClient()
    const { data } = await supabase
      .from("community_posts")
      .select("id, title, slug, excerpt, body, cover_image_url, tags, is_published, performance_id, published_at")
      .eq("id", id)
      .single()

    post = data as typeof post
  } else {
    const found = mockCommunityPosts.find((p) => p.id === id)
    if (found) {
      post = {
        id: found.id,
        title: found.title,
        slug: found.slug,
        excerpt: found.excerpt,
        body: found.body,
        cover_image_url: found.cover_image_url,
        tags: found.tags,
        is_published: found.is_published,
        performance_id: found.performance_id,
        published_at: found.published_at,
      }
    }
  }

  if (!post) notFound()

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/blog"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          블로그 목록
        </Link>
        <div className="h-4 w-px bg-border" />
        <h1 className="text-xl font-bold text-foreground">글 수정</h1>
      </div>

      <BlogPostForm
        mode="edit"
        initialData={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt ?? undefined,
          body: post.body ?? undefined,
          cover_image_url: post.cover_image_url ?? undefined,
          tags: post.tags ?? [],
          is_published: post.is_published,
          performance_id: post.performance_id,
        }}
        action={(input) => updateBlogPost(post!.id, input)}
      />
    </div>
  )
}
