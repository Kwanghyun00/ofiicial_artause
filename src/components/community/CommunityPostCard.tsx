import Link from "next/link";
import type { Database } from "@/lib/supabase/types";

type OrganizationSummary = Pick<Database["public"]["Tables"]["organizations"]["Row"], "id" | "slug" | "name" | "tagline"> & {
  logo_url: string | null;
};

type CommunityPost = Database["public"]["Tables"]["community_posts"]["Row"] & {
  organizations?: OrganizationSummary | null;
};

type CommunityPostCardProps = {
  post: CommunityPost;
};

export function CommunityPostCard({ post }: CommunityPostCardProps) {
  const publishedAt = post.published_at
    ? new Date(post.published_at).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "업데이트 준비 중";
  const organization = post.organizations ?? null;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-white/60 bg-white/70 shadow-lg transition hover:-translate-y-1">
      {post.cover_image_url ? (
        <div className="relative h-48 w-full overflow-hidden bg-slate-200">
          <img
            src={post.cover_image_url}
            alt={post.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-black/30 via-transparent to-black/10" />
        </div>
      ) : null}
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{publishedAt}</span>
          {organization ? (
            <Link href={`/community/organizations/${organization.slug}`} className="font-medium text-indigo-600 hover:text-indigo-700">
              {organization.name}
            </Link>
          ) : null}
        </div>
        <div>
          <Link href={`/community/${post.slug}`} className="text-lg font-semibold text-slate-900">
            {post.title}
          </Link>
          {post.excerpt ? <p className="mt-2 text-sm text-slate-600">{post.excerpt}</p> : null}
        </div>
        {Array.isArray(post.tags) && post.tags.length ? (
          <div className="mt-auto flex flex-wrap gap-2 text-xs text-slate-500">
            {post.tags.map((tag) => (
              <span key={tag} className="badge bg-surface-200 text-slate-700">
                #{tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}
