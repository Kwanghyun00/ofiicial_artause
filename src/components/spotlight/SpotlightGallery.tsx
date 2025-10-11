"use client";

import { useMemo, useState } from 'react';
import type { Database } from '@/lib/supabase/types';
import { PerformanceCard } from '@/components/marketing/PerformanceCard';

type Performance = Database['public']['Tables']['performances']['Row'];

interface SpotlightGalleryProps {
  performances: Performance[];
}

const statusFilters: { value: Performance['status'] | 'all'; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'ongoing', label: '진행 중' },
  { value: 'scheduled', label: '공연 예정' },
  { value: 'completed', label: '종료' },
];

export function SpotlightGallery({ performances }: SpotlightGalleryProps) {
  const [status, setStatus] = useState<(typeof statusFilters)[number]['value']>('all');
  const [region, setRegion] = useState<string>('all');
  const [query, setQuery] = useState('');

  const regions = useMemo(() => {
    const set = new Set<string>();
    performances.forEach((item) => {
      if (item.region) set.add(item.region);
    });
    return ['all', ...Array.from(set)];
  }, [performances]);

  const filtered = useMemo(() => {
    const lowerQuery = query.trim().toLowerCase();
    return performances.filter((item) => {
      const statusMatch = status === 'all' || item.status === status;
      const regionMatch = region === 'all' || item.region === region;
      const queryMatch =
        !lowerQuery ||
        [item.title, item.organization, item.venue, item.synopsis]
          .filter(Boolean)
          .some((field) => field!.toLowerCase().includes(lowerQuery));
      return statusMatch && regionMatch && queryMatch;
    });
  }, [status, region, query, performances]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 rounded-3xl border border-white/60 bg-white/70 p-6 shadow-lg md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setStatus(option.value)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                status === option.value
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-white text-slate-600 hover:bg-indigo-600/10'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <select
            value={region}
            onChange={(event) => setRegion(event.target.value)}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm"
          >
            {regions.map((item) => (
              <option key={item} value={item}>
                {item === 'all' ? '전체 지역' : item}
              </option>
            ))}
          </select>
          <input
            type="search"
            placeholder="공연명, 단체명, 공연장을 검색하세요"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm"
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {filtered.length ? (
          filtered.map((performance) => (
            <PerformanceCard key={performance.id} performance={performance} />
          ))
        ) : (
          <div className="card col-span-full p-10 text-center text-sm text-slate-600">
            조건에 맞는 프로젝트가 없습니다. 다른 필터를 선택해 보세요.
          </div>
        )}
      </div>
    </div>
  );
}
