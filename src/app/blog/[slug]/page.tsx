import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Calendar, Tag } from "lucide-react"
import { BlogPostBody } from "@/components/blog/BlogPostBody"
import { getCommunityPostBySlug, getCommunityPosts } from "@/lib/supabase/queries"

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getCommunityPostBySlug(slug)
  if (!post) return { title: "포스트를 찾을 수 없습니다" }

  return {
    title: `${post.title} — 알터즈 큐레이션`,
    description: post.excerpt ?? undefined,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      url: `/blog/${post.slug}`,
      type: "article",
      ...(post.cover_image_url ? { images: [{ url: post.cover_image_url }] } : {}),
    },
  }
}

export async function generateStaticParams() {
  try {
    const posts = await getCommunityPosts()
    return posts.map((p) => ({ slug: p.slug }))
  } catch {
    return []
  }
}

export const revalidate = 60

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await getCommunityPostBySlug(slug)
  if (!post) notFound()

  const formattedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: post.cover_image_url,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: {
      "@type": "Organization",
      name: post.organizations?.name ?? "알터즈",
    },
    publisher: {
      "@type": "Organization",
      name: "알터즈",
      url: "https://artause.co.kr",
    },
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      {/* 뒤로 가기 */}
      <Link
        href="/blog"
        className="mb-8 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        큐레이션 에세이 목록
      </Link>

      {/* 커버 이미지 */}
      {post.cover_image_url && (
        <div className="relative mb-8 h-64 w-full overflow-hidden rounded-xl sm:h-80">
          <Image
            src={post.cover_image_url}
            alt={post.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>
      )}

      {/* 헤더 */}
      <header className="mb-8 space-y-4">
        {/* 태그 */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.tags.map((tag: string) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-sm bg-primary/8 px-2.5 py-1 text-xs font-semibold text-primary"
              >
                <Tag className="h-3 w-3" />
                {tag}
              </span>
            ))}
          </div>
        )}

        <h1 className="text-3xl font-bold leading-tight text-foreground sm:text-4xl">
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="text-lg leading-relaxed text-muted-foreground">
            {post.excerpt}
          </p>
        )}

        {/* 작성자 + 날짜 */}
        <div className="flex flex-wrap items-center gap-4 border-t border-border pt-4 text-sm text-muted-foreground">
          {post.organizations && (
            <span className="font-semibold text-foreground">
              {post.organizations.name}
            </span>
          )}
          {formattedDate && (
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {formattedDate}
            </span>
          )}
        </div>
      </header>

      {/* 본문 */}
      <div className="border-t border-border pt-8">
        {post.body ? (
          <BlogPostBody body={post.body} />
        ) : (
          <p className="text-muted-foreground">본문이 없습니다.</p>
        )}
      </div>

      {/* 하단 CTA */}
      <footer className="mt-12 border-t border-border pt-8">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="font-semibold text-foreground">더 많은 공연 이야기</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              알터즈 에디터가 큐레이션한 다른 에세이를 만나보세요.
            </p>
          </div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 rounded-full border-2 border-primary bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
          >
            전체 에세이 보기
          </Link>
        </div>
      </footer>
    </article>
  )
}
