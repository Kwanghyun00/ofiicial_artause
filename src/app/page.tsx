/**
 * 메인 홈페이지
 *
 * Artause 플랫폼의 랜딩 페이지입니다.
 * URL: /
 *
 * 주요 기능:
 * - Hero 섹션: 플랫폼 소개 및 주요 CTA
 * - 주목받는 공연: 공연 목록 (포스터 이미지 포함)
 * - 진행 중인 이벤트: 초대권 응모 이벤트 목록
 * - 파트너 단체: 등록된 공연 기획사/단체 목록
 *
 * 데이터 소스:
 * - Supabase: performances, ticket_campaigns, organizations 테이블
 * - Supabase 미설정 시 목업 데이터 사용
 *
 * SEO:
 * - 정적 메타데이터 (제목, 설명)
 * - 메인 페이지이므로 Open Graph 최적화 권장
 */
import { HomeLanding } from "@/components/home/HomeLanding";
import { getFeaturedPerformances, getOrganizations, getTicketCampaigns } from "@/lib/supabase/queries";

/**
 * 타입 정의
 * Supabase 쿼리 결과의 배열 요소 타입을 추출합니다
 */
type FeaturedResult = Awaited<ReturnType<typeof getFeaturedPerformances>>[number];
type CampaignResult = Awaited<ReturnType<typeof getTicketCampaigns>>[number];
type OrganizationResult = Awaited<ReturnType<typeof getOrganizations>>[number];

/**
 * Type guard: 공연 데이터 유효성 검사
 * id, slug, title 필드가 있는지 확인합니다
 */
const isFeature = (
  item: FeaturedResult,
): item is NonNullable<FeaturedResult> & { id: string; slug: string; title: string } =>
  Boolean(item && typeof item === "object" && "id" in item && "slug" in item && "title" in item);

/**
 * Type guard: 캠페인 데이터 유효성 검사
 * id, title 필드가 있는지 확인합니다
 */
const isCampaign = (item: CampaignResult): item is NonNullable<CampaignResult> & { id: string; title: string } =>
  Boolean(item && typeof item === "object" && "id" in item && "title" in item);

/**
 * Type guard: 기획사 데이터 유효성 검사
 * id, name 필드가 있는지 확인합니다
 */
const isOrganization = (
  item: OrganizationResult,
): item is NonNullable<OrganizationResult> & { id: string; name: string } =>
  Boolean(item && typeof item === "object" && "id" in item && "name" in item);

/**
 * 페이지 메타데이터
 * SEO 최적화를 위한 제목과 설명
 */
export const metadata = {
  title: "Artause Invitation Hub",
  description: "SNS 홍보 공연을 모으고 초대권 이벤트를 개설·운영하는 가장 단순한 방법입니다.",
};

/**
 * 홈페이지 메인 컴포넌트
 *
 * 데이터 로딩:
 * - Promise.all을 사용하여 모든 데이터를 병렬로 가져옵니다
 * - 각 결과는 type guard로 필터링하여 타입 안정성을 확보합니다
 */
export default async function HomePage() {
  // 모든 데이터를 병렬로 가져오기 (성능 최적화)
  const [featured, campaigns, organizations] = await Promise.all([
    getFeaturedPerformances(),
    getTicketCampaigns(),
    getOrganizations(),
  ]);

  // 유효한 데이터만 필터링
  const featuredShows = featured.filter(isFeature);
  const ticketCampaigns = campaigns.filter(isCampaign);
  const trustedOrganizations = organizations.filter(isOrganization);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-12 lg:px-6 lg:py-16 xl:py-20">
      {/* HomeLanding 컴포넌트에 필터링된 데이터 전달 */}
      <HomeLanding featuredShows={featuredShows} campaigns={ticketCampaigns} organizations={trustedOrganizations} />
    </div>
  );
}
