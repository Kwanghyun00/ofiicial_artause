/**
 * HomeLanding 컴포넌트
 *
 * 메인 페이지의 핵심 랜딩 섹션을 구성하는 컴포넌트입니다.
 *
 * 주요 기능:
 * - Hero 섹션: 플랫폼 소개 및 통계 표시
 * - PromoSection: 주목받는 공연 목록 (포스터 이미지 포함)
 * - CampaignSection: 진행 중인 초대권 이벤트
 * - FlowSection: 서비스 이용 절차 안내
 *
 * 인터랙션:
 * - 스크롤 애니메이션 (Intersection Observer)
 * - 호버 효과 및 이미지 확대
 * - 순차적 애니메이션 (staggered animation)
 *
 * 반응형:
 * - 모바일: 1열, 컴팩트한 레이아웃
 * - 태블릿: 2열 그리드
 * - 데스크톱: 3열 그리드 (공연 카드)
 */
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";

/**
 * 공연 데이터 타입
 * performances 테이블에서 가져온 공연 정보
 */
type Show = {
  id: string;
  slug: string;
  title: string;
  region?: string | null;
  tags?: string[] | null;
  period_start?: string | null;
  period_end?: string | null;
  poster_url?: string | null;
};

/**
 * 초대권 캠페인 데이터 타입
 * ticket_campaigns 테이블에서 가져온 이벤트 정보
 */
type Campaign = {
  id: string;
  slug?: string | null;
  title: string;
  description?: string | null;
  reward?: string | null;
  ends_at?: string | null;
};

/**
 * 공연 단체 데이터 타입
 * organizations 테이블에서 가져온 파트너 정보
 */
type Organization = {
  id: string;
  name: string;
  region?: string | null;
};

/**
 * HomeLanding Props
 * 서버에서 fetch한 데이터를 전달받음
 */
type Props = {
  featuredShows: Show[];      // 주목받는 공연 목록
  campaigns: Campaign[];       // 진행 중인 초대권 이벤트
  organizations: Organization[]; // 협업 파트너 목록 (통계용)
};

/**
 * HomeLanding 메인 컴포넌트
 * 데이터를 받아서 각 섹션에 전달
 */
export function HomeLanding({ featuredShows, campaigns, organizations }: Props) {
  const activeCampaigns = campaigns.slice(0, 8);
  const recommendedShows = featuredShows.slice(0, 6);

  return (
    <div className="space-y-8 md:space-y-10">
      <Hero />
      <CategoryNav />
      <CampaignSection campaigns={activeCampaigns} />
      <RecommendedShows shows={recommendedShows} />
    </div>
  );
}

/**
 * 스크롤 애니메이션 커스텀 훅
 *
 * Intersection Observer를 사용하여 요소가 뷰포트에 들어왔을 때
 * 애니메이션을 트리거합니다.
 *
 * 사용법:
 * ```tsx
 * const { ref, isVisible } = useScrollAnimation();
 * <div ref={ref} className={isVisible ? "animate-fade-in" : "opacity-0"}>
 * ```
 *
 * @returns ref - 관찰할 요소에 attach할 ref
 * @returns isVisible - 요소가 뷰포트에 보이는지 여부
 */
function useScrollAnimation() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Intersection Observer 설정
    // threshold: 0.1 = 요소의 10%가 보이면 트리거
    // rootMargin: 뷰포트 하단 100px 전에 미리 트리거
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true); // 한번 보이면 계속 표시 (다시 숨기지 않음)
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -100px 0px" }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    // 클린업: 컴포넌트 언마운트 시 관찰 중지
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return { ref, isVisible };
}

/**
 * Hero 섹션
 *
 * 메인 페이지 최상단의 히어로 섹션 (간결한 B2C 중심)
 * - 간결한 타이틀
 * - 이벤트 보기 CTA 하나만
 */
function Hero() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section
      ref={ref}
      className={`overflow-hidden rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-sm transition-all duration-700 sm:px-8 sm:py-10 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <div className="text-center">
        <h1 className="text-2xl font-bold leading-tight text-slate-900 sm:text-3xl md:text-4xl">
          공연 초대권 이벤트 한눈에
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
          지금 응모 가능한 초대권을 확인하고 무료로 공연을 관람하세요
        </p>
        <div className="mt-5 flex justify-center">
          <Link
            href="/events"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-6 py-3 font-semibold text-white transition-all hover:bg-slate-800 sm:px-8"
          >
            전체 이벤트 보기
          </Link>
        </div>
      </div>
    </section>
  );
}

/**
 * 카테고리 네비게이션
 *
 * 공연 장르별 빠른 필터링 (한국적 색상 적용)
 */
function CategoryNav() {
  const categories = [
    { id: "all", name: "전체", color: "bg-slate-100 text-slate-800 border-slate-200" },
    { id: "musical", name: "뮤지컬", color: "bg-purple-50 text-purple-700 border-purple-200" },
    { id: "play", name: "연극", color: "bg-blue-50 text-blue-700 border-blue-200" },
    { id: "classic", name: "클래식", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
    { id: "dance", name: "무용", color: "bg-pink-50 text-pink-700 border-pink-200" },
    { id: "exhibition", name: "전시", color: "bg-amber-50 text-amber-700 border-amber-200" },
  ];

  return (
    <nav className="overflow-x-auto">
      <div className="flex gap-2 pb-2">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/events?category=${category.id}`}
            className={`shrink-0 rounded-lg border px-4 py-2 text-sm font-semibold transition-all hover:shadow-sm ${category.color}`}
          >
            {category.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}

function PromoSection({ shows }: { shows: Show[] }) {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section
      ref={ref}
      className={`transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">주목받는 공연</h2>
        <Link
          href="/performances"
          className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
        >
          전체보기 →
        </Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {shows.length ? (
          shows.map((show, index) => <PromoCard key={show.id} show={show} index={index} />)
        ) : (
          <div className="col-span-full rounded-2xl border-2 border-dashed border-slate-200 bg-white p-8 text-center">
            <p className="text-base font-medium text-slate-400">등록된 공연이 없습니다</p>
          </div>
        )}
      </div>
    </section>
  );
}

function CampaignSection({ campaigns }: { campaigns: Campaign[] }) {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section
      ref={ref}
      className={`transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">진행 중인 초대권 이벤트</h2>
          <p className="mt-1 text-sm text-slate-600">
            지금 바로 응모 가능
          </p>
        </div>
        <Link
          href="/events"
          className="shrink-0 text-sm font-medium text-slate-700 hover:text-slate-900"
        >
          전체 →
        </Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {campaigns.length ? (
          campaigns.map((campaign, index) => <CampaignCard key={campaign.id} campaign={campaign} index={index} />)
        ) : (
          <div className="col-span-full rounded-xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-base font-medium text-slate-400">진행 중인 이벤트가 없습니다</p>
          </div>
        )}
      </div>
    </section>
  );
}


function PromoCard({ show, index }: { show: Show; index: number }) {
  const period = formatPeriod(show.period_start, show.period_end);

  return (
    <Link href={`/performances/${show.slug}`}>
      <article
        className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md"
        style={{ animationDelay: `${index * 50}ms` }}
      >
        {/* Poster Image: 컴팩트한 높이 */}
        <div className="relative h-40 w-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 sm:h-48">
          {show.poster_url ? (
            <Image
              src={show.poster_url}
              alt={`${show.title} 포스터`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-3xl">🎭</div>
          )}
        </div>

        {/* Content - 간결하게 */}
        <div className="p-3">
          <h3 className="line-clamp-2 text-sm font-bold text-slate-900">{show.title}</h3>
          <div className="mt-1.5 flex items-center justify-between text-xs text-slate-500">
            <span>{show.region ?? "미정"}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}

function CampaignCard({ campaign, index }: { campaign: Campaign; index: number }) {
  const closesAt = campaign.ends_at ? formatDate(campaign.ends_at) : null;

  return (
    <Link href={`/events/${campaign.slug ?? campaign.id}`}>
      <article
        className="group overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md"
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-bold text-slate-900 line-clamp-2">{campaign.title}</h3>
            <span className="shrink-0 rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">진행중</span>
          </div>
          <p className="text-sm text-slate-600 line-clamp-2">{campaign.description ?? "지금 바로 응모 가능한 초대권"}</p>
          <div className="flex items-center justify-between text-xs text-slate-500">
            {campaign.reward && <span className="truncate">{campaign.reward}</span>}
            {closesAt && <span className="shrink-0">{closesAt}</span>}
          </div>
          <div className="pt-2">
            <div className="inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-all group-hover:bg-slate-800">
              응모하기
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

/**
 * 파트너 CTA (간결한 B2B 섹션)
 *
 * 공연 기획사/단체를 위한 간단한 안내
 */
function PartnerCTA() {
  return (
    <section className="mt-12 rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
      <h3 className="text-lg font-bold text-slate-900">공연 홍보가 필요하신가요?</h3>
      <p className="mt-2 text-sm text-slate-600">
        초대권 이벤트로 관객을 모으고 SNS로 자연스럽게 홍보하세요
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        <Link
          href="/event-center"
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-indigo-700"
        >
          이벤트 개설하기 →
        </Link>
        <Link
          href="/about"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-100"
        >
          서비스 소개
        </Link>
      </div>
    </section>
  );
}

/**
 * 추천 공연 섹션
 */
function RecommendedShows({ shows }: { shows: Show[] }) {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section
      ref={ref}
      className={`transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">이번 주 추천 공연</h2>
          <p className="mt-1 text-sm text-slate-600">
            놓치면 안 될 인기 공연을 만나보세요
          </p>
        </div>
        <Link
          href="/performances"
          className="shrink-0 text-sm font-medium text-slate-700 hover:text-slate-900"
        >
          전체 →
        </Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {shows.length ? (
          shows.map((show, index) => <ShowCard key={show.id} show={show} index={index} />)
        ) : (
          <div className="col-span-full rounded-xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-base font-medium text-slate-400">등록된 공연이 없습니다</p>
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * 공연 카드 (정보 밀도 높게)
 */
function ShowCard({ show, index }: { show: Show; index: number }) {
  const period = formatPeriod(show.period_start, show.period_end);
  const genreColor = getGenreColor(show.tags?.[0]);

  return (
    <Link href={`/performances/${show.slug}`}>
      <article
        className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md"
        style={{ animationDelay: `${index * 50}ms` }}
      >
        {/* 장르 태그 */}
        {show.tags && show.tags[0] && (
          <div className="absolute left-3 top-3 z-10">
            <span className={`rounded px-2 py-1 text-xs font-bold ${genreColor}`}>
              {show.tags[0]}
            </span>
          </div>
        )}

        {/* 포스터 */}
        <div className="relative h-48 w-full overflow-hidden bg-slate-100">
          {show.poster_url ? (
            <Image
              src={show.poster_url}
              alt={`${show.title} 포스터`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-4xl">🎭</div>
          )}
        </div>

        {/* 정보 (밀도 높게) */}
        <div className="p-3">
          <h3 className="font-bold text-slate-900 line-clamp-2 text-base leading-tight">{show.title}</h3>
          <div className="mt-2 space-y-1 text-xs text-slate-600">
            {show.region && (
              <div className="flex items-center gap-1">
                <span className="font-medium">📍</span>
                <span>{show.region}</span>
              </div>
            )}
            {period && (
              <div className="flex items-center gap-1">
                <span className="font-medium">📅</span>
                <span>{period}</span>
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}

/**
 * 장르별 색상 매핑
 */
function getGenreColor(genre?: string | null): string {
  if (!genre) return "bg-slate-100 text-slate-700";

  const lowerGenre = genre.toLowerCase();
  if (lowerGenre.includes("뮤지컬")) return "bg-purple-100 text-purple-700";
  if (lowerGenre.includes("연극")) return "bg-blue-100 text-blue-700";
  if (lowerGenre.includes("클래식") || lowerGenre.includes("음악")) return "bg-indigo-100 text-indigo-700";
  if (lowerGenre.includes("무용") || lowerGenre.includes("댄스")) return "bg-pink-100 text-pink-700";
  if (lowerGenre.includes("전시") || lowerGenre.includes("미술")) return "bg-amber-100 text-amber-700";

  return "bg-slate-100 text-slate-700";
}

function formatPeriod(start?: string | null, end?: string | null) {
  if (!start && !end) return null;
  const startText = start ? formatDate(start) : "?";
  const endText = end ? formatDate(end) : "?";
  return `${startText} ~ ${endText}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("ko-KR", {
    month: "short",
    day: "numeric",
  });
}
