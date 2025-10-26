"use client";

import { useMemo, useState } from "react";
import type { Database } from "@/lib/supabase/types";
import { OrganizationCard } from "./OrganizationCard";

type Organization = Database["public"]["Tables"]["organizations"]["Row"];

type OrganizationsDirectoryProps = {
  organizations: Organization[];
};

const ALL_OPTION = "전체";

export function OrganizationsDirectory({ organizations }: OrganizationsDirectoryProps) {
  const [genreFilter, setGenreFilter] = useState<string>(ALL_OPTION);
  const [regionFilter, setRegionFilter] = useState<string>(ALL_OPTION);
  const [searchTerm, setSearchTerm] = useState("");

  const genreOptions = useMemo(() => {
    const values = new Set<string>();
    organizations.forEach((organization) => {
      (organization.genre_focus ?? []).forEach((genre) => values.add(genre));
    });
    return [ALL_OPTION, ...Array.from(values).sort((a, b) => a.localeCompare(b, "ko"))];
  }, [organizations]);

  const regionOptions = useMemo(() => {
    const values = new Set<string>();
    organizations.forEach((organization) => {
      if (organization.region) {
        values.add(organization.region);
      }
    });
    return [ALL_OPTION, ...Array.from(values).sort((a, b) => a.localeCompare(b, "ko"))];
  }, [organizations]);

  const filteredOrganizations = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return organizations.filter((organization) => {
      const matchesGenre =
        genreFilter === ALL_OPTION || (organization.genre_focus ?? []).includes(genreFilter);
      const matchesRegion = regionFilter === ALL_OPTION || organization.region === regionFilter;

      if (!matchesGenre || !matchesRegion) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const haystack = [
        organization.name,
        organization.tagline ?? "",
        organization.description ?? "",
        (organization.genre_focus ?? []).join(" "),
        organization.region ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedSearch);
    });
  }, [genreFilter, organizations, regionFilter, searchTerm]);

  return (
    <section className="mt-16">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="section-heading">공연 단체 데이터베이스</h2>
          <p className="section-subtitle">장르와 지역을 선택해 관심 있는 단체를 팔로우하고 활동 소식을 받아보세요.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="단체명·장르 검색"
            className="h-10 rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-700 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
          {(genreFilter !== ALL_OPTION || regionFilter !== ALL_OPTION || searchTerm.trim()) && (
            <button
              type="button"
              onClick={() => {
                setGenreFilter(ALL_OPTION);
                setRegionFilter(ALL_OPTION);
                setSearchTerm("");
              }}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-500"
            >
              초기화
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-wrap gap-2">
          {genreOptions.map((genre) => {
            const isActive = genreFilter === genre;
            return (
              <button
                key={genre}
                type="button"
                onClick={() => setGenreFilter(genre)}
                aria-pressed={isActive}
                className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                  isActive
                    ? "border-indigo-500 bg-indigo-500 text-white shadow"
                    : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-600"
                }`}
              >
                {genre}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-2">
          {regionOptions.map((region) => {
            const isActive = regionFilter === region;
            return (
              <button
                key={region}
                type="button"
                onClick={() => setRegionFilter(region)}
                aria-pressed={isActive}
                className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                  isActive
                    ? "border-slate-900 bg-slate-900 text-white shadow"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-900"
                }`}
              >
                {region}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredOrganizations.length ? (
          filteredOrganizations.map((organization) => (
            <OrganizationCard key={organization.id} organization={organization} />
          ))
        ) : (
          <div className="card col-span-full p-10 text-center text-sm text-slate-500">
            조건에 맞는 단체가 없습니다. 다른 장르 또는 지역을 선택해 보세요.
          </div>
        )}
      </div>
    </section>
  );
}
