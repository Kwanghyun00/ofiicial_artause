import { notFound } from "next/navigation";
import { CommunityPostCard } from "@/components/community/CommunityPostCard";
import { FollowButton } from "@/components/organizations/FollowButton";
import { PerformanceCard } from "@/components/marketing/PerformanceCard";
import {
  getCommunityPostBySlug,
  getCommunityPosts,
  getOrganizationBySlug,
  getPerformancesByOrganization,
} from "@/lib/supabase/queries";

interface CommunityPostPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: CommunityPostPageProps) {
  const post = await getCommunityPostBySlug(params.slug);
  if (!post) {
    return {
      title: "커뮤니티 글을 찾을 수 없습니다",
    };
  }
  const organizationName = post.organizations?.name ?? "Artause";
  return {
    title: `${post.title} | ${organizationName}`,
    description: post.excerpt ?? `${organizationName} 커뮤니티 소식`,
  };
}

type OrganizationPerformance = Awaited<ReturnType<typeof getPerformancesByOrganization>>[number];
type ValidOrganizationPerformance = Extract<OrganizationPerformance, { id: string }>;

function isOrganizationPerformanceRecord(
  performance: OrganizationPerformance,
): performance is ValidOrganizationPerformance {
  return Boolean(performance && typeof performance === "object" && "id" in performance);
}

export default async function CommunityPostPage({ params }: CommunityPostPageProps) {
  const post = await getCommunityPostBySlug(params.slug);
  if (!post) {
    notFound();
  }

  const organizationSlug = post.organizations?.slug ?? null;
  const organization = organizationSlug ? await getOrganizationBySlug(organizationSlug) : null;
  const [allPosts, organizationPerformances] = await Promise.all([
    getCommunityPosts(),
    organization ? getPerformancesByOrganization(organization.id) : Promise.resolve([]),
  ]);

  const relatedPosts = allPosts
    .filter((item) => item.id !== post.id && item.organization_id === post.organization_id)
    .slice(0, 3);

  const relatedPerformances = organizationPerformances.filter(isOrganizationPerformanceRecord).slice(0, 4);

  const bodyBlocks = (post.body ?? post.excerpt ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const publishedAt = post.published_at
    ? new Date(post.published_at).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <article className="flex flex-col gap-8">
        <header className="space-y-4">
          <p className="text-xs uppercase tracking-wide text-indigo-600">커뮤니티 업데이트</p>
          <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">{post.title}</h1>
          {publishedAt ? <p className="text-sm text-slate-500">{publishedAt}</p> : null}
          {organization ? (
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium text-slate-700">{organization.name}</span>
              <FollowButton organizationId={organization.id} initialFollowerCount={organization.follower_count} size="sm" />
            </div>
          ) : null}
          {post.tags && post.tags.length ? (
            <div className="flex flex-wrap gap-2 text-xs text-slate-500">
              {post.tags.map((tag) => (
                <span key={tag} className="badge bg-surface-200 text-slate-700">
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}
          {post.cover_image_url ? (
            <div className="overflow-hidden rounded-3xl">
              <img
                src={post.cover_image_url}
                alt={post.title}
                className="h-full w-full object-cover"
              />
            </div>
          ) : null}
        </header>

        <section className="space-y-4 text-base text-slate-700">
          {bodyBlocks.length ? (
            bodyBlocks.map((line, index) => <p key={index}>{line}</p>)
          ) : (
            <p className="text-sm text-slate-600">
              커뮤니티 본문이 아직 등록되지 않았습니다. 운영팀에 문의해 주세요.
            </p>
          )}
        </section>
      </article>

      {relatedPerformances.length ? (
        <section className="mt-16">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="section-heading">함께 보면 좋은 공연</h2>
              <p className="section-subtitle">{organization?.name ?? "관련 단체"}가 준비 중인 공연을 확인하세요.</p>
            </div>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {relatedPerformances.map((performance) => (
              <PerformanceCard key={performance.id} performance={performance} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-16">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="section-heading">다른 이야기 더 보기</h2>
            <p className="section-subtitle">Artause 커뮤니티의 최신 콘텐츠와 대화를 이어가세요.</p>
          </div>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {relatedPosts.length ? (
            relatedPosts.map((related) => <CommunityPostCard key={related.id} post={related} />)
          ) : (
            <div className="card p-8 text-sm text-slate-500 md:col-span-3">
              아직 다른 글이 없습니다. 커뮤니티 허브에서 새로운 이야기를 확인해 보세요.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
