import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { BlogCard } from "@/components/blog/BlogCard"

type BlogPost = {
  id: string
  slug: string
  title: string
  excerpt: string | null
  cover_image_url: string | null
  tags: string[] | null
  published_at: string | null
  organizations?: { name: string; logo_url: string | null } | null
}

type Props = {
  posts: BlogPost[]
}

export function LatestBlogSection({ posts }: Props) {
  if (!posts.length) return null

  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* 섹션 헤더 */}
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2.5">
            <span className="cue">큐레이션 에세이</span>
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">
              알터즈가 전하는 공연 이야기
            </h2>
            <p className="max-w-lg text-sm text-muted-foreground sm:text-base">
              에디터가 직접 쓴 공연 에세이와 SNS 픽 공연의 깊은 이야기를 만나보세요.
            </p>
          </div>
          <Link
            href="/blog"
            className="self-start inline-flex items-center gap-1.5 rounded-full border border-border/80 px-5 py-2.5 text-sm font-semibold text-foreground/80 transition hover:border-primary/60 hover:text-primary"
          >
            전체 에세이 보기
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* 카드 그리드 */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </section>
  )
}
