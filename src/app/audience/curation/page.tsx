import { CommunityPostCard } from "@/components/community/CommunityPostCard";
import { OrganizationCard } from "@/components/organizations/OrganizationCard";
import { PerformanceCard } from "@/components/marketing/PerformanceCard";
import {
  getCommunityPosts,
  getFeaturedPerformances,
  getOrganizations,
} from "@/lib/supabase/queries";

export const metadata = {
  title: "Artause Night Out | 2030 관객 가이드",
  description:
    "도심 야간을 즐기는 2030 관객을 위한 Artause 추천 코스. 커뮤니티 이야기, 팔로우 추천, 스포트라이트 공연을 한 번에 확인하세요.",
};

const discoverySteps = [
  {
    title: "1. 커뮤니티 글 탐색",
    description: "운영자가 공유한 제작 노트와 캠페인 리포트를 살펴보고 이번 시즌 분위기를 파악하세요.",
  },
  {
    title: "2. 팔로우 & 알림",
    description: "마음에 드는 팀을 팔로우하면 티켓 오픈과 추천 코드가 DM과 이메일로 도착합니다.",
  },
  {
    title: "3. Night Out 계획",
    description: "스포트라이트 공연과 티켓 이벤트를 조합해 나만의 Artause Night Out 루틴을 완성하세요.",
  },
];

type FeaturedPerformance = Awaited<ReturnType<typeof getFeaturedPerformances>>[number];
type ValidPerformance = Extract<FeaturedPerformance, { id: string }>;

function isPerformanceRecord(performance: FeaturedPerformance): performance is ValidPerformance {
  return Boolean(performance && typeof performance === "object" && "id" in performance);
}

export default async function AudienceCurationPage() {
  const [posts, organizations, performances] = await Promise.all([
    getCommunityPosts(),
    getOrganizations(),
    getFeaturedPerformances(),
  ]);

  const curatedPosts = posts.slice(0, 3);
  const recommendedOrganizations = organizations.slice(0, 3);
  const spotlightPerformances = performances.filter(isPerformanceRecord).slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <section className="rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-700 to-sky-500 p-12 text-white shadow-xl">
        <p className="text-sm uppercase tracking-wide text-white/70">Artause Night Out</p>
        <h1 className="mt-4 text-4xl font-semibold md:text-5xl">오늘 밤, 도시 공연을 즐기는 가장 쉬운 방법</h1>
        <p className="mt-6 max-w-3xl text-base text-white/80 md:text-lg">
          로컬 공연을 사랑하는 2030 관객을 위한 Artause 추천 가이드입니다. 커뮤니티 인사이트, 팔로우 리스트, 스포트라이트 공연을 한 번에 확인하고 나만의 일정을 만들어 보세요.
        </p>
      </section>

      <section className="mt-16">
        <h2 className="section-heading">Step by Step 루틴</h2>
        <p className="section-subtitle">Artause가 제안하는 3단계 Night Out 플로우로 공연 탐색, 팔로우, 예매를 마쳐보세요.</p>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {discoverySteps.map((step) => (
            <div key={step.title} className="card flex h-full flex-col gap-3 p-8">
              <h3 className="text-xl font-semibold text-slate-900">{step.title}</h3>
              <p className="text-sm text-slate-600">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="section-heading">커뮤니티 하이라이트</h2>
            <p className="section-subtitle">운영자의 시선으로 기록된 현장 리포트와 제작 노트를 만나보세요.</p>
          </div>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {curatedPosts.map((post) => (
            <CommunityPostCard key={post.id} post={post} />
          ))}
        </div>
      </section>

      <section className="mt-16">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="section-heading">팔로우 추천 단체</h2>
            <p className="section-subtitle">야간 공연과 커뮤니티 이벤트를 함께 만드는 주요 파트너를 소개합니다.</p>
          </div>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {recommendedOrganizations.map((organization) => (
            <OrganizationCard key={organization.id} organization={organization} />
          ))}
        </div>
      </section>

      <section className="mt-16">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="section-heading">스포트라이트 공연</h2>
            <p className="section-subtitle">Artause가 집중 조명하는 공연을 살펴보고 티켓 플로우로 이동하세요.</p>
          </div>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {spotlightPerformances.map((performance) => (
            <PerformanceCard key={performance.id} performance={performance} asFeatured />
          ))}
        </div>
      </section>

      <section className="mt-16 rounded-3xl border border-indigo-100 bg-white/80 p-10 shadow-soft">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Artause 커뮤니티와 함께 더 많은 Night Out을 만들어요</h2>
            <p className="mt-3 text-sm text-slate-600">
              추천 코드, 티켓 이벤트, 운영 자동화를 활용해 공연과 관객을 연결하고 싶다면 운영팀에게 연락해 주세요.
            </p>
          </div>
          <a href="mailto:contact@artause.com" className="btn-primary">
            운영팀에 문의하기
          </a>
        </div>
      </section>
    </div>
  );
}
