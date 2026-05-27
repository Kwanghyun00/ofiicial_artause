import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getPerformanceBySlug } from "@/lib/supabase/queries"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const performance = await getPerformanceBySlug(slug)

  if (!performance || typeof performance !== "object" || !("title" in performance)) {
    return {
      title: "공연 정보",
      description: "알터즈 공연 상세 페이지",
      alternates: {
        canonical: `/shows/${slug}`,
      },
    }
  }

  const description =
    (performance as { hero_subtitle?: string | null }).hero_subtitle ??
    (performance as { description?: string | null }).description ??
    (performance as { synopsis?: string | null }).synopsis ??
    `${performance.title} 공연 정보와 연결된 초대 이벤트를 확인해 보세요.`

  const image = performance.poster_url ?? undefined

  return {
    title: performance.title,
    description,
    alternates: {
      canonical: `/shows/${slug}`,
    },
    openGraph: {
      title: `${performance.title} | 알터즈`,
      description,
      url: `/shows/${slug}`,
      type: "article",
      images: image
        ? [
            {
              url: image,
              alt: performance.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: `${performance.title} | 알터즈`,
      description,
      images: image ? [image] : undefined,
    },
  }
}

export default async function PerformanceDetailRedirect({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  redirect(`/shows/${slug}`)
}
