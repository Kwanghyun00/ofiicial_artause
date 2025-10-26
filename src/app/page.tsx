import { HomeLanding } from "@/components/home/HomeLanding";
import { getFeaturedPerformances, getOrganizations, getTicketCampaigns } from "@/lib/supabase/queries";

type FeaturedResult = Awaited<ReturnType<typeof getFeaturedPerformances>>[number];
type CampaignResult = Awaited<ReturnType<typeof getTicketCampaigns>>[number];
type OrganizationResult = Awaited<ReturnType<typeof getOrganizations>>[number];

const isFeature = (item: FeaturedResult): item is NonNullable<FeaturedResult> & { id: string; slug: string; title: string } =>
  Boolean(item && typeof item === "object" && "id" in item && "slug" in item && "title" in item);

const isCampaign = (item: CampaignResult): item is NonNullable<CampaignResult> & { id: string; title: string } =>
  Boolean(item && typeof item === "object" && "id" in item && "title" in item);

const isOrganization = (item: OrganizationResult): item is NonNullable<OrganizationResult> & { id: string; name: string } =>
  Boolean(item && typeof item === "object" && "id" in item && "name" in item);

export const metadata = {
  title: "오프라인 공연·전시 큐레이션과 초대권 운영",
  description:
    "Artause는 한국 관객을 위한 공연·전시 정보와 초대권 이벤트 운영 흐름을 한 화면에서 제공합니다. 최소 기능 위주의 UX로 빠른 업데이트를 목표로 합니다.",
};

export default async function HomePage() {
  const [featured, campaigns, organizations] = await Promise.all([
    getFeaturedPerformances(),
    getTicketCampaigns(),
    getOrganizations(),
  ]);

  const featuredShows = featured.filter(isFeature);
  const ticketCampaigns = campaigns.filter(isCampaign);
  const trustedOrganizations = organizations.filter(isOrganization);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
      <HomeLanding featuredShows={featuredShows} campaigns={ticketCampaigns} organizations={trustedOrganizations} />
    </div>
  );
}
