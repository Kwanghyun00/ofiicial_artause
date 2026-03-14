import type { Metadata } from "next"
import { Star } from "lucide-react"
import { getOrganizations, getAllPerformances } from "@/lib/supabase/queries"
import { ReviewsListingClient } from "@/components/reviews/ReviewsListingClient"
import type { OrgOption } from "@/components/reviews/ReviewsListingClient"
import { portfolioItems } from "@/constants/company"

export const metadata: Metadata = {
  title: "공연 후기",
  description: "공연 단체별 관람 후기를 확인하세요.",
}

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ organization?: string }>
}) {
  const { organization: initialSlug } = await searchParams

  const [allOrganizations, allPerformances] = await Promise.all([
    getOrganizations(),
    getAllPerformances(),
  ])

  // 1. Supabase organizations → OrgOption (queryType: 'orgId')
  const supabaseOrgs: OrgOption[] = allOrganizations
    .filter(
      (o): o is typeof o & { id: string; slug: string; name: string } =>
        Boolean(o && o.id && o.slug && o.name)
    )
    .map((o) => ({
      id: o.id,
      slug: o.slug,
      name: o.name,
      queryType: "orgId" as const,
      queryValue: o.id,
    }))

  // 2. KOPIS performances에서 organization_id 없는 것의 entrpsnm(organization 텍스트) 추출
  const kopisOrgNames = new Set<string>()
  for (const p of allPerformances) {
    const perf = p as { organization_id?: string | null; organization?: string | null }
    if (!perf.organization_id && perf.organization) {
      // Supabase org과 중복되지 않는 KOPIS 제작사만 추가
      const isAlreadyCoveredBySupabase = supabaseOrgs.some(
        (o) => o.name === perf.organization
      )
      if (!isAlreadyCoveredBySupabase) {
        kopisOrgNames.add(perf.organization)
      }
    }
  }

  const kopisOrgs: OrgOption[] = Array.from(kopisOrgNames)
    .sort()
    .map((orgName) => ({
      id: `kopis-${orgName}`,
      slug: `kopis-${orgName}`,
      name: orgName,
      queryType: "orgName" as const,
      queryValue: orgName,
    }))

  // 3. 포트폴리오 공연 → OrgOption (queryType: 'performanceId')
  const portfolioOrgOptions: OrgOption[] = portfolioItems.map((item) => ({
    id: item.id,
    slug: item.slug,
    name: item.title,
    queryType: "performanceId" as const,
    queryValue: item.id,
  }))

  const organizations: OrgOption[] = [...portfolioOrgOptions, ...supabaseOrgs, ...kopisOrgs]

  return (
    <div className="pb-24 pt-12 text-foreground">
      <section className="mx-auto max-w-6xl space-y-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-3 text-center">
          <span className="cue">
            <Star className="h-3 w-3" />
            후기
          </span>
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">관람 후기</h1>
          <p className="text-base text-muted-foreground">
            단체를 선택해 해당 단체의 모든 공연 후기를 한눈에 확인하세요.
          </p>
        </div>

        <ReviewsListingClient
          organizations={organizations}
          initialOrganizationSlug={initialSlug ?? null}
        />
      </section>
    </div>
  )
}
