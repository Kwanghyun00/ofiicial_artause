import type { MetadataRoute } from "next"
import { getAllPerformances, getTicketCampaigns } from "@/lib/supabase/queries"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://artause.co.kr"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [performances, campaigns] = await Promise.all([
    getAllPerformances().catch(() => []),
    getTicketCampaigns().catch(() => []),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    // 핵심 랜딩
    { url: SITE_URL,                   lastModified: new Date(), changeFrequency: "daily",  priority: 1.0 },
    { url: `${SITE_URL}/shows`,        lastModified: new Date(), changeFrequency: "hourly", priority: 0.95 },
    { url: `${SITE_URL}/invites`,      lastModified: new Date(), changeFrequency: "hourly", priority: 0.95 },
    // 콘텐츠
    { url: `${SITE_URL}/reviews`,      lastModified: new Date(), changeFrequency: "daily",  priority: 0.7 },
    // 정보성 페이지 (AdSense 승인용으로도 필요)
    { url: `${SITE_URL}/about`,        lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/services`,     lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/rules`,        lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/contact`,      lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/invites/guide`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ]

  const showRoutes: MetadataRoute.Sitemap = performances
    .filter((p): p is typeof p & { slug: string } => Boolean(p && "slug" in p && p.slug))
    .map((p) => ({
      url: `${SITE_URL}/shows/${p.slug}`,
      lastModified: ("updated_at" in p && p.updated_at) ? new Date(p.updated_at as string) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }))

  const inviteRoutes: MetadataRoute.Sitemap = campaigns
    .filter((c): c is typeof c & { slug: string } => Boolean(c && "slug" in c && c.slug))
    .map((c) => ({
      url: `${SITE_URL}/invites/${c.slug}`,
      lastModified: ("updated_at" in c && c.updated_at) ? new Date(c.updated_at as string) : new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    }))

  return [...staticRoutes, ...showRoutes, ...inviteRoutes]
}
