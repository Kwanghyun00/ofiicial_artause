"use client";

﻿import Link from "next/link";
import type { Database } from "@/lib/supabase/types";
import { FollowButton } from "./FollowButton";

type Organization = Database["public"]["Tables"]["organizations"]["Row"];

type OrganizationCardProps = {
  organization: Organization;
};

export function OrganizationCard({ organization }: OrganizationCardProps) {
  const genres = organization.genre_focus ?? [];

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-white/60 bg-white/70 shadow-lg transition hover:-translate-y-1">
      <div className="relative h-32 w-full overflow-hidden bg-gradient-to-tr from-indigo-900/80 via-indigo-500/60 to-sky-500/60">
        {organization.cover_image_url ? (
          <img
            src={organization.cover_image_url}
            alt={`${organization.name} 대표 이미지`}
            className="absolute inset-0 h-full w-full object-cover opacity-75 transition duration-500 group-hover:scale-105"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/40" />
        <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between gap-4 text-white">
          <div>
            <Link href={`/community/organizations/${organization.slug}`} className="block text-lg font-semibold">
              {organization.name}
            </Link>
            {organization.tagline ? (
              <p className="mt-1 text-sm text-white/80">{organization.tagline}</p>
            ) : null}
          </div>
          <FollowButton organizationId={organization.id} initialFollowerCount={organization.follower_count} size="sm" />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-4 p-6">
        {organization.description ? (
          <p className="text-sm text-slate-600">{organization.description}</p>
        ) : null}
        <div className="mt-auto flex flex-wrap gap-2 text-xs text-slate-500">
          {organization.region ? (
            <span className="badge bg-surface-200 text-slate-800">{organization.region}</span>
          ) : null}
          {genres.map((genre) => (
            <span key={genre} className="badge bg-white/70 text-slate-700">
              {genre}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
