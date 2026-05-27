import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Tag } from "lucide-react"

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

type Props = { posts: BlogPost[] }

function formatDate(d: string | null) {
  if (!d) return ""
  return new Date(d).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })
}

export function LatestBlogSection({ posts }: Props) {
  if (!posts.length) return null

  const [featured, ...rest] = posts

  return (
    <section
      className="relative"
      style={{ background: "oklch(0.155 0.016 285)" }}
    >
      {/* 상단 경계 */}
      <div className="h-px w-full" style={{ background: "oklch(0.64 0.18 55 / 0.25)" }} />

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">

        {/* 섹션 헤더 */}
        <div className="mb-10 flex items-end justify-between gap-4">
          <div className="space-y-1.5">
            <p
              className="font-mono text-[11px] font-bold uppercase tracking-[0.2em]"
              style={{ color: "oklch(0.64 0.18 55 / 0.7)" }}
            >
              — 03 · 큐레이션 에세이
            </p>
            <h2 className="font-serif text-3xl font-bold text-white md:text-4xl">
              알터즈가 전하는 공연 이야기
            </h2>
          </div>
          <Link
            href="/blog"
            className="hidden shrink-0 items-center gap-1.5 text-sm font-semibold text-white/40 transition hover:text-white/80 sm:flex"
          >
            전체 에세이
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* 피처드 포스트 (대형) */}
        {featured && (
          <Link
            href={`/blog/${featured.slug}`}
            className="group mb-6 block overflow-hidden border border-white/10 transition hover:border-white/25"
          >
            <div className="grid md:grid-cols-[1fr_1fr] lg:grid-cols-[5fr_4fr]">
              {/* 이미지 */}
              <div className="relative overflow-hidden bg-white/5" style={{ minHeight: "260px" }}>
                {featured.cover_image_url ? (
                  <Image
                    src={featured.cover_image_url}
                    alt={featured.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 55vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-white/5 to-transparent">
                    <span className="font-serif text-6xl text-white/10">✦</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/30" />
              </div>

              {/* 텍스트 */}
              <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
                {/* 태그 */}
                {featured.tags && featured.tags.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {featured.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide"
                        style={{
                          color: "oklch(0.74 0.17 62)",
                          borderLeft: "2px solid oklch(0.74 0.17 62 / 0.5)",
                          paddingLeft: "6px",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <h3 className="font-serif text-xl font-bold leading-snug text-white transition group-hover:text-amber-300 sm:text-2xl lg:text-3xl">
                  {featured.title}
                </h3>

                {featured.excerpt && (
                  <p className="mt-3 text-sm leading-relaxed text-white/50 line-clamp-3 sm:text-base">
                    {featured.excerpt}
                  </p>
                )}

                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-white/30">
                    {featured.organizations?.name && (
                      <>
                        <span className="font-semibold text-white/50">{featured.organizations.name}</span>
                        <span>·</span>
                      </>
                    )}
                    <span>{formatDate(featured.published_at)}</span>
                  </div>
                  <span
                    className="inline-flex items-center gap-1 text-xs font-bold text-white/40 transition group-hover:text-amber-300"
                  >
                    읽기
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* 나머지 포스트 그리드 */}
        {rest.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {rest.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group flex gap-4 border border-white/10 p-4 transition hover:border-white/25 sm:p-5"
              >
                {/* 썸네일 */}
                <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-white/5 sm:h-28 sm:w-24">
                  {post.cover_image_url ? (
                    <Image
                      src={post.cover_image_url}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="96px"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl text-white/10">✦</span>
                    </div>
                  )}
                </div>

                {/* 텍스트 */}
                <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
                  {/* 태그 */}
                  {post.tags && post.tags.length > 0 && (
                    <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "oklch(0.64 0.18 55 / 0.7)" }}>
                      {post.tags[0]}
                    </span>
                  )}
                  <h3 className="font-serif text-[15px] font-bold leading-snug text-white transition group-hover:text-amber-300 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-[11px] text-white/30">
                    {formatDate(post.published_at)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* 모바일 전체보기 */}
        <div className="mt-6 sm:hidden">
          <Link
            href="/blog"
            className="flex w-full items-center justify-center gap-2 border border-white/15 py-3.5 text-sm font-semibold text-white/50 transition hover:border-white/30 hover:text-white/80"
          >
            전체 에세이 보기
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
