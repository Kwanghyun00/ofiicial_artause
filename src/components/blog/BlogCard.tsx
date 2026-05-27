import Image from "next/image"
import Link from "next/link"
import { Calendar, Tag } from "lucide-react"

type BlogCardPost = {
  id: string
  slug: string
  title: string
  excerpt: string | null
  cover_image_url: string | null
  tags: string[] | null
  published_at: string | null
  organizations?: {
    name: string
    logo_url: string | null
  } | null
}

type Props = {
  post: BlogCardPost
  featured?: boolean
}

export function BlogCard({ post, featured = false }: Props) {
  const formattedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border/60 bg-background transition-all hover:border-primary/40 hover:shadow-md"
    >
      {/* 커버 이미지 */}
      <div
        className={`relative w-full overflow-hidden bg-muted ${featured ? "h-56 sm:h-64" : "h-44 sm:h-48"}`}
      >
        {post.cover_image_url ? (
          <Image
            src={post.cover_image_url}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            sizes={featured ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 640px) 100vw, 33vw"}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
            <span className="text-4xl opacity-30">✍️</span>
          </div>
        )}
      </div>

      {/* 콘텐츠 */}
      <div className="flex flex-1 flex-col p-5">
        {/* 태그 */}
        {post.tags && post.tags.length > 0 && (
          <div className="mb-2.5 flex flex-wrap gap-1.5">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-sm bg-primary/8 px-2 py-0.5 text-[11px] font-semibold text-primary"
              >
                <Tag className="h-2.5 w-2.5" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* 제목 */}
        <h3
          className={`font-bold leading-snug text-foreground transition-colors group-hover:text-primary ${
            featured ? "text-xl sm:text-2xl" : "text-base sm:text-lg"
          }`}
        >
          {post.title}
        </h3>

        {/* 요약 */}
        {post.excerpt && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {post.excerpt}
          </p>
        )}

        {/* 하단 메타 */}
        <div className="mt-auto flex items-center justify-between pt-4">
          {post.organizations && (
            <span className="text-xs font-semibold text-muted-foreground">
              {post.organizations.name}
            </span>
          )}
          {formattedDate && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground/70">
              <Calendar className="h-3 w-3" />
              {formattedDate}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
