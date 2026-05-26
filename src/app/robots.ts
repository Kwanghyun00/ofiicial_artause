import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://artause.co.kr"

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/event-center/",
          "/partner/",
          "/api/",
          "/me/",
          "/my/",        // 개인화 페이지 크롤 방지
          "/test-kopis/", // 개발용 디버그 라우트
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
