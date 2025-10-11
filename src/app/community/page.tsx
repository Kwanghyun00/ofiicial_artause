import { CommunityPostCard } from "@/components/community/CommunityPostCard";
import { OrganizationCard } from "@/components/organizations/OrganizationCard";
import { TicketCampaignCard } from "@/components/marketing/TicketCampaignCard";
import {
  getActiveTicketCampaigns,
  getCommunityPosts,
  getOrganizations,
} from "@/lib/supabase/queries";

export const metadata = {
  title: "커뮤니티 & 팔로우 허브",
  description: "Artause 커뮤니티에서 공유하는 운영 노하우를 확인하고 추천 단체와 티켓 이벤트를 살펴보세요.",
};

export default async function CommunityPage() {
  const [posts, organizations, campaigns] = await Promise.all([
    getCommunityPosts(),
    getOrganizations(),
    getActiveTicketCampaigns(),
  ]);

  const featuredPosts = posts.slice(0, 6);
  const topOrganizations = organizations.slice(0, 6);
  const highlightedCampaigns = campaigns.slice(0, 4);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <section className="rounded-3xl bg-indigo-950 p-10 text-white shadow-xl md:p-14">
        <p className="text-sm uppercase tracking-wide text-white/70">Artause Community</p>
        <h1 className="mt-4 text-3xl font-semibold md:text-4xl">커뮤니티가 연결하는 새로운 공연 경험</h1>
        <p className="mt-4 max-w-3xl text-base text-white/80 md:text-lg">
          제작 노트, 캠페인 리포트, 팔로우 추천까지 커뮤니티에서 직접 공유합니다. 운영자가 서로 경험을 나누고 관객과 빠르게 소통할 수 있도록 돕습니다.
        </p>
      </section>

      <section className="mt-16">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="section-heading">최신 커뮤니티 글</h2>
            <p className="section-subtitle">최근 업데이트된 운영 인사이트와 백스테이지 이야기를 살펴보세요.</p>
          </div>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {featuredPosts.length ? (
            featuredPosts.map((post) => <CommunityPostCard key={post.id} post={post} />)
          ) : (
            <div className="card p-10 text-center text-sm text-slate-500">
              아직 등록된 커뮤니티 글이 없습니다. 곧 새로운 소식으로 찾아뵐게요!
            </div>
          )}
        </div>
      </section>

      <section className="mt-16">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="section-heading">추천 단체</h2>
            <p className="section-subtitle">팔로우하면 좋은 공연 단체와 페스티벌 팀을 큐레이션했습니다.</p>
          </div>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {topOrganizations.length ? (
            topOrganizations.map((organization) => <OrganizationCard key={organization.id} organization={organization} />)
          ) : (
            <div className="card p-8 text-sm text-slate-500 md:col-span-3">
              추천 단체를 준비 중입니다. 곧 업데이트될 예정이에요.
            </div>
          )}
        </div>
      </section>

      <section className="mt-16">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="section-heading">주요 티켓 이벤트</h2>
            <p className="section-subtitle">커뮤니티와 함께 참여할 수 있는 티켓 캠페인을 확인하세요.</p>
          </div>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {highlightedCampaigns.length ? (
            highlightedCampaigns.map((campaign) => <TicketCampaignCard key={campaign.id} campaign={campaign} />)
          ) : (
            <div className="card p-10 text-center text-sm text-slate-500">
              진행 중인 이벤트가 없습니다. 알림을 신청하고 소식을 받아보세요.
            </div>
          )}
        </div>
      </section>

      <section className="mt-16">
        <div className="card flex flex-col gap-4 bg-indigo-950 p-10 text-white shadow-lg md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Artause Night Out 가이드 구독</h2>
            <p className="mt-2 text-sm text-white/80">커뮤니티 픽, 팔로우 추천, 스포트라이트 공연을 엮어 2030 로컬 씬을 즐기는 3단계 루틴을 만나보세요.</p>
          </div>
          <a href="/audience/curation" className="btn-primary bg-white text-indigo-900 hover:bg-white/90">
            가이드 확인하기
          </a>
        </div>
      </section>
    </div>
  );
}
