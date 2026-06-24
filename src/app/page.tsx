import type { Metadata } from "next"
import { HomeHero, HomeDidPopup } from "@/components/home/sections"
import { SnsPicksSection } from "@/components/home/SnsPicksSection"
import { BlogCard } from "@/components/blog/BlogCard"
import { Reveal } from "@/components/motion/Reveal"
import { isPerformanceEndedKst } from "@/lib/date"
import {
  getCommunityPosts,
  getActiveSnsPicksWithPerformances,
  getCommunityPostStatsBySlugs,
} from "@/lib/supabase/queries"

export const metadata: Metadata = {
  title: "공연 큐레이션 · 알터즈",
  description:
    "알터즈가 관객 언어로 풀어 소개하는 공연들을 만나보세요.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "알터즈 | 공연 큐레이션",
    description:
      "SNS에서 소개한 공연부터 지금 주목할 작품까지, 알터즈 에디터가 큐레이션한 공연을 발견하세요.",
    url: "/",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "알터즈 | 공연 큐레이션",
    description:
      "SNS에서 소개한 공연부터 지금 주목할 작품까지, 알터즈 에디터가 큐레이션한 공연을 발견하세요.",
  },
}

export const dynamic = "force-dynamic"

const EXAMPLE_POSTS = [
  {
    id: "example-one-one-three",
    slug: "one-one-three",
    title: "수학과 연극, 두 언어로 바라보는 하나의 세계",
    excerpt:
      "리멘워커의 연극 '113'. 수학자 서혁과 제빵사 정태가 구름카페에서 순원의 시 「113」을 찾아 나서는 포스트드라마. 2026.07.03~07.12 · 대학로극장 쿼드",
    cover_image_url: "/images/blog/one-one-three/poster.jpeg",
    tags: ["연극", "수학", "포스트드라마"],
    published_at: "2026-06-20",
    performance_start_date: "2026-07-03",
    performance_end_date: "2026-07-12",
    organizations: { name: "알터즈 에디터", logo_url: null },
  },
  {
    id: "example-maureen",
    slug: "maureen",
    title: "사라진 뒤에야 선명해지는 사랑",
    excerpt:
      "이효석문학상 수상 작가 안윤의 『모린』을 영화와 연극의 경계를 허문 영극으로 다시 쓰는 이향 프로젝트의 신작. 2026.06.19~06.28 · 서울연극창작센터 서울씨어터101",
    cover_image_url: "/images/blog/maureen/poster.png",
    tags: ["영극", "드라마", "알터즈 픽"],
    published_at: "2026-06-18",
    performance_start_date: "2026-06-19",
    performance_end_date: "2026-06-28",
    organizations: { name: "알터즈 에디터", logo_url: null },
  },
  {
    id: "example-secret-royal-inspector",
    slug: "secret-royal-inspector",
    title: "가짜 암행어사의 거짓말이 판을 뒤집는다",
    excerpt:
      "극단 백의의 코미디 사극 '암행어사'. 도박으로 여비를 탕진한 조명식이 진짜 암행어사로 오해받으며 벌어지는 포복절도 코미디. 2026.06.06~06.14 · 삼일로창고극장",
    cover_image_url: "/images/blog/secret-royal-inspector/poster.png",
    tags: ["연극", "코미디", "사극"],
    published_at: "2026-05-25",
    performance_start_date: "2026-06-06",
    performance_end_date: "2026-06-14",
    organizations: { name: "아터즈 에디터", logo_url: null },
  },
  {
    id: "example-0",
    slug: "waegwaegi-was-there",
    title: "잊는다는 것이 정말 가능한 걸까",
    excerpt:
      "문학동네청소년문학상 대상 수상작 원작 연극 '왝왝이가 그곳에 있었다'. 재난과 참사 앞에서 기억을 붙드는 청소년들의 이야기. 2026.06.19~06.25 · 아르코예술극장 소극장",
    cover_image_url: "/images/blog/waegwaegi-was-there/poster.jpg",
    tags: ["연극", "청소년극", "알터즈 픽"],
    published_at: "2026-05-26",
    performance_start_date: "2026-06-19",
    performance_end_date: "2026-06-25",
    organizations: { name: "알터즈 에디터", logo_url: null },
  },
  {
    id: "example-1",
    slug: "after-the-end",
    title: "벙커는 정말 가장 안전한 장소일까",
    excerpt:
      "연극 '애프터 디 엔드'. 핵폭발 이후 지하 벙커에 단 둘이 남은 사람들 — 구원인가, 통제인가. 프로젝트 디본의 밀도 높은 심리극. 2026.05.29~06.21 · 대학로 업스테이지",
    cover_image_url: "/images/blog/covers/after-the-end.jpg",
    tags: ["연극", "심리극", "알터즈 픽"],
    published_at: "2026-05-29",
    performance_start_date: "2026-05-29",
    performance_end_date: "2026-06-21",
    organizations: { name: "알터즈 에디터", logo_url: null },
  },
  {
    id: "example-2",
    slug: "kkweman-village",
    title: "살아남기 위해 우리는 어디까지 배제할 수 있을까",
    excerpt:
      "조예은 작가 원작 디스토피아 연극 '꿰맨 눈의 마을'. 2066년 감염과 추방, 배제의 논리를 무대 위에서 마주합니다. 2026.05.28~06.07 · 연희예술극장",
    cover_image_url: "/images/blog/covers/kkweman-village.png",
    tags: ["연극", "디스토피아", "알터즈 픽"],
    published_at: "2026-05-28",
    performance_start_date: "2026-05-28",
    performance_end_date: "2026-06-07",
    organizations: { name: "알터즈 에디터", logo_url: null },
  },
]

type DisplayPost = {
  id: string
  slug: string
  title: string
  excerpt: string | null
  cover_image_url: string | null
  tags: string[] | null
  published_at: string | null
  performance_end_date?: string | null
  organizations?: { name: string; logo_url: string | null } | null
  view_count?: number
  outbound_click_count?: number
  click_rate?: number
  last_viewed_at?: string | null
  last_clicked_at?: string | null
}

function sortPostsByPopularity(posts: DisplayPost[]) {
  return [...posts].sort((a, b) => {
    const viewDiff = (b.view_count ?? 0) - (a.view_count ?? 0)
    if (viewDiff !== 0) return viewDiff
    return new Date(b.published_at ?? 0).getTime() - new Date(a.published_at ?? 0).getTime()
  })
}

function isPerformanceEnded(endDate: string | null | undefined) {
  return isPerformanceEndedKst(endDate)
}

export default async function HomePage() {
  const [allPosts, snsPicks, manualStats] = await Promise.all([
    getCommunityPosts(),
    getActiveSnsPicksWithPerformances(),
    getCommunityPostStatsBySlugs(EXAMPLE_POSTS.map((post) => post.slug)),
  ])

  const manualPosts = EXAMPLE_POSTS.map((post) => {
    const stats = manualStats.get(post.slug)
    const viewCount = stats?.view_count ?? 0
    const outboundClickCount = stats?.outbound_click_count ?? 0
    return {
      ...post,
      view_count: viewCount,
      outbound_click_count: outboundClickCount,
      click_rate: viewCount > 0 ? outboundClickCount / viewCount : 0,
      last_viewed_at: stats?.last_viewed_at ?? null,
      last_clicked_at: stats?.last_clicked_at ?? null,
    }
  })

  const displayPosts = sortPostsByPopularity(
    allPosts.length > 0
      ? [
          ...manualPosts.filter(
            (manualPost) => !allPosts.some((post) => post.slug === manualPost.slug),
          ),
          ...allPosts,
        ]
      : manualPosts,
  )

  const ongoingPosts = displayPosts.filter((p) => !isPerformanceEnded(p.performance_end_date))
  const archivedPosts = displayPosts.filter((p) => isPerformanceEnded(p.performance_end_date))
  const activePosts = ongoingPosts.length > 0 ? ongoingPosts : displayPosts
  const [featured, ...ongoingRest] = activePosts

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "알터즈",
    url: "https://artause.co.kr",
    logo: "https://artause.co.kr/images/brand/artause-symbol.png",
    description: "에디터 큐레이션으로 공연을 발견하는 가장 좋은 방법",
    sameAs: ["https://www.instagram.com/artause_official"],
  }

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <HomeDidPopup />

      {/* 01 — 브랜드 히어로 */}
      <HomeHero />

      {/* 02 — SNS 에디터 픽 캐러셀 (픽 데이터 있을 때만) */}
      {snsPicks.length > 0 && (
        <Reveal>
          <SnsPicksSection picks={snsPicks} />
        </Reveal>
      )}

      {/* 03 — 큐레이션 에세이 전체 목록 */}
      <Reveal>
        <section className="border-t border-border bg-background">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-24">

            {/* 섹션 헤더 */}
            <div className="mb-12 flex items-end justify-between gap-4 border-b border-border pb-8">
              <div className="space-y-2">
                <span className="cue">— 공연 소개</span>
                <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
                  알터즈가 전하는 공연 이야기
                </h2>
              </div>
              <p className="hidden shrink-0 text-sm text-muted-foreground lg:block">
                {displayPosts.length}편의 공연 소개
              </p>
            </div>

            {/* 피처드 포스트 */}
            {featured && (
              <div className="mb-8 lg:mb-10">
                <BlogCard post={featured} featured index={0} />
              </div>
            )}

            {/* 공연 중 그리드 */}
            {ongoingRest.length > 0 && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
                {ongoingRest.map((post, i) => (
                  <BlogCard key={post.id} post={post} index={i + 1} />
                ))}
              </div>
            )}

            {/* 지난 공연 아카이브 */}
            {archivedPosts.length > 0 && (
              <div className="mt-16">
                <div className="mb-6 flex items-center gap-4">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-foreground/35">지난 공연</span>
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-[11px] text-foreground/30">{archivedPosts.length}편</span>
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
                  {archivedPosts.map((post, i) => (
                    <BlogCard key={post.id} post={post} index={activePosts.length + i} archived />
                  ))}
                </div>
              </div>
            )}

          </div>
        </section>
      </Reveal>
    </div>
  )
}
