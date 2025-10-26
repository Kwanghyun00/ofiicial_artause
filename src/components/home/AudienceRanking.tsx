"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

type RankingItem = {
  rank: number;
  title: string;
  href: string;
  poster?: string | null;
  location?: string | null;
  status?: string | null;
};

type RankingTab = {
  title: string;
  items: RankingItem[];
};

type AudienceRankingProps = {
  tabs: RankingTab[];
};

export function AudienceRanking({ tabs }: AudienceRankingProps) {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const activeTab = tabs[activeTabIndex] ?? { title: "", items: [] };

  return (
    <div className="card h-full rounded-3xl border border-white/50 bg-white p-6 shadow-lg">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">실시간 랭킹 & 장르</h2>
          <p className="text-sm text-slate-600">탐색 중인 공연과 추천 랭킹을 빠르게 확인하세요.</p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          {tabs.map((tab, index) => (
            <button
              key={tab.title}
              type="button"
              onClick={() => setActiveTabIndex(index)}
              className={`rounded-full px-3 py-1 font-medium transition ${
                index === activeTabIndex
                  ? "bg-indigo-600 text-white shadow"
                  : "border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600"
              }`}
            >
              {tab.title}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        {activeTab.items.length ? (
          activeTab.items.slice(0, 8).map((item) => (
            <Link key={`${activeTab.title}-${item.rank}-${item.title}`} href={item.href} className="group rounded-2xl border border-slate-200 bg-white/90 p-3 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div className="relative overflow-hidden rounded-xl bg-slate-100">
                {item.poster ? (
                  <Image
                    src={item.poster}
                    alt={item.title}
                    width={320}
                    height={200}
                    className="h-36 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-36 w-full items-center justify-center text-xs text-slate-400">이미지가 준비 중입니다</div>
                )}
                <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-slate-900 shadow">
                  #{item.rank}
                </span>
              </div>
              <div className="mt-3 space-y-1">
                <p className="text-sm font-semibold text-slate-900 line-clamp-2 group-hover:text-indigo-600">{item.title}</p>
                {item.location ? <p className="text-xs text-slate-500">{item.location}</p> : null}
                {item.status ? <p className="text-xs text-indigo-500">{item.status}</p> : null}
              </div>
            </Link>
          ))
        ) : (
          <div className="md:col-span-4 rounded-2xl border border-dashed border-slate-200 bg-white/70 p-6 text-center text-sm text-slate-500">
            랭킹 데이터를 준비 중입니다.
          </div>
        )}
      </div>
    </div>
  );
}
