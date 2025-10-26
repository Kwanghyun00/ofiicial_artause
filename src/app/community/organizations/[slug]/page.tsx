import Image from "next/image";
﻿import { notFound } from "next/navigation";
import { CommunityPostCard } from "@/components/community/CommunityPostCard";
import { FollowButton } from "@/components/organizations/FollowButton";
import { PerformanceCard } from "@/components/marketing/PerformanceCard";
import {
  getCommunityPosts,
  getOrganizationBySlug,
  getPerformancesByOrganization,
} from "@/lib/supabase/queries";

interface OrganizationPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: OrganizationPageProps) {
  const organization = await getOrganizationBySlug(params.slug);
  if (!organization) {
    return {
      title: "단체 정보를 찾을 수 없습니다",
    };
  }
  return {
    title: `${organization.name} | Artause 커뮤니티`,
    description: organization.description ?? organization.tagline ?? "Artause 파트너 단체 소개",
  };
}

type OrganizationPerformance = Awaited<ReturnType<typeof getPerformancesByOrganization>>[number];
type ValidOrganizationPerformance = Extract<OrganizationPerformance, { id: string }>;

function isOrganizationPerformanceRecord(
  performance: OrganizationPerformance,
): performance is ValidOrganizationPerformance {
  return Boolean(performance && typeof performance === "object" && "id" in performance);
}

export default async function OrganizationDetailPage({ params }: OrganizationPageProps) {
  const organization = await getOrganizationBySlug(params.slug);
  if (!organization) {
    notFound();
  }

  const [posts, performancesResponse] = await Promise.all([
    getCommunityPosts(),
    getPerformancesByOrganization(organization.id),
  ]);

  const relatedPosts = posts.filter((post) => post.organization_id === organization.id).slice(0, 4);
  const performances = performancesResponse.filter(isOrganizationPerformanceRecord).slice(0, 4);

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <section className="relative overflow-hidden rounded-3xl bg-indigo-950 text-white shadow-xl">
        {organization.cover_image_url ? (
          <Image
            src={organization.cover_image_url}
            alt={`${organization.name} 커버 이미지`}
            fill
            className="object-cover opacity-50"
            sizes="(min-width: 768px) 1024px, 100vw"
          />
        ) : null}
        <div className="relative flex flex-col gap-6 p-10 md:p-14">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-white/70">Performing Arts Group</p>
              <h1 className="mt-2 text-3xl font-semibold md:text-4xl">{organization.name}</h1>
              {organization.tagline ? (
                <p className="mt-3 text-base text-white/80">{organization.tagline}</p>
              ) : null}
            </div>
            <FollowButton organizationId={organization.id} initialFollowerCount={organization.follower_count} />
          </div>
          {organization.description ? (
            <p className="max-w-3xl text-sm text-white/80 md:text-base">{organization.description}</p>
          ) : null}
          <div className="flex flex-wrap gap-3 text-xs text-white/80">
            {organization.region ? (
              <span className="badge bg-white/15 text-white">{organization.region}</span>
            ) : null}
            {(organization.genre_focus ?? []).map((genre) => (
              <span key={genre} className="badge bg-white/10 text-white">
                {genre}
              </span>
            ))}
            {organization.website ? (
              <a
                href={organization.website}
                target="_blank"
                rel="noopener noreferrer"
                className="badge bg-white/15 text-white hover:bg-white/25"
              >
                공식 웹사이트
              </a>
            ) : null}
            {organization.instagram ? (
              <a
                href={organization.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="badge bg-white/15 text-white hover:bg-white/25"
              >
                인스타그램
              </a>
            ) : null}
            {organization.youtube ? (
              <a
                href={organization.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="badge bg-white/15 text-white hover:bg-white/25"
              >
                유튜브
              </a>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mt-16">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="section-heading">커뮤니티 소식</h2>
            <p className="section-subtitle">{organization.name}가 공유한 최신 이야기를 확인하세요.</p>
          </div>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {relatedPosts.length ? (
            relatedPosts.map((post) => <CommunityPostCard key={post.id} post={post} />)
          ) : (
            <div className="card p-8 text-sm text-slate-500">
              아직 등록된 커뮤니티 글이 없습니다. 새로운 소식을 기대해 주세요.
            </div>
          )}
        </div>
      </section>

      <section className="mt-16">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="section-heading">진행 중인 공연</h2>
            <p className="section-subtitle">Artause와 함께 소개하는 공연과 초대 이벤트를 살펴보세요.</p>
          </div>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {performances.length ? (
            performances.map((performance) => (
              <PerformanceCard key={performance.id} performance={performance} />
            ))
          ) : (
            <div className="card p-8 text-sm text-slate-500">
              준비 중인 공연이 없습니다. 새로운 프로젝트가 열리면 알림으로 안내해 드릴게요.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
