import type { Metadata } from "next"
import { BlogCard } from "@/components/blog/BlogCard"
import { getCommunityPosts } from "@/lib/supabase/queries"

export const metadata: Metadata = {
  title: "큐레이션 에세이 — 알터즈",
  description:
    "알터즈 에디터가 직접 큐레이션한 공연 에세이. SNS에서 소개한 공연부터 지금 주목할 작품까지 깊이 있는 이야기를 만나보세요.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "큐레이션 에세이 — 알터즈",
    description: "알터즈 에디터가 직접 큐레이션한 공연 에세이",
    url: "/blog",
    type: "website",
  },
}

export const revalidate = 60

export default async function BlogPage() {
  const posts = await getCommunityPosts()

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">

      {/* 헤더 */}
      <header className="mb-10 space-y-3">
        <span className="cue">알터즈 큐레이션</span>
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
          공연 에세이
        </h1>
        <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
          SNS에서 소개한 공연부터 지금 주목할 작품까지,
          알터즈 에디터가 직접 쓴 공연 이야기입니다.
        </p>
      </header>

      {/* 글 목록 */}
      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-4xl mb-4">✍️</p>
          <p className="text-lg font-semibold text-foreground">준비 중입니다</p>
          <p className="mt-2 text-sm text-muted-foreground">
            곧 첫 번째 에세이를 만나보실 수 있습니다.
          </p>
        </div>
      ) : (
        <>
          {/* 첫 번째 글: 피처드 대형 */}
          {posts.length > 0 && (
            <div className="mb-8">
              <BlogCard post={posts[0]} featured />
            </div>
          )}

          {/* 나머지 그리드 */}
          {posts.length > 1 && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {posts.slice(1).map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
