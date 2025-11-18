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
  const promoShows = featuredShows.slice(0, 4);
  const activeCampaigns = campaigns.slice(0, 2);
  const partnerCount = organizations.length;

  return (
    <div className="space-y-16 md:space-y-24">
      <Hero stats={{ shows: featuredShows.length, campaigns: campaigns.length, partners: partnerCount }} />
      <PromoSection shows={promoShows} />
      <CampaignSection campaigns={activeCampaigns} />
      <FlowSection />
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
 * 메인 페이지 최상단의 히어로 섹션
 * - 플랫폼 소개 문구
 * - CTA 버튼 (이벤트 보기, 이벤트 개설)
 * - 통계 표시 (공연 수, 이벤트 수, 파트너 수)
 */
function Hero({ stats }: { stats: { shows: number; campaigns: number; partners: number } }) {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section
      ref={ref}
      className={`relative overflow-hidden rounded-[24px] bg-gradient-to-br from-gradient-violet via-gradient-electric to-gradient-magenta px-6 py-12 text-white shadow-2xl transition-all duration-700 sm:px-10 sm:py-16 md:rounded-[40px] md:px-16 md:py-20 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDEzNGgxMnYxMkgzNnptMjQgMGgxMnYxMkg2MHpNMTIgMTEwaDEydjEySDE2em0yNCAwaDEydjEySDM2em0yNCAwaDEydjEySDYwem0yNCAwaDEydjEySDg0em0wIDI0aDEydjEySDg0em0wIDI0aDEydjEySDg0eiIvPjwvZz48L2c+PC9zdmc+')] opacity-40"></div>
      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <p className="text-xs font-medium uppercase tracking-wider">Invitation Hub</p>
        </div>
        <h1 className="mt-4 max-w-4xl text-3xl font-bold leading-tight tracking-tight sm:mt-6 sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
          공연 초대권 이벤트,
          <br />
          <span className="bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent">
            한 곳에서 쉽게
          </span>
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/90 sm:mt-6 sm:text-lg md:text-xl">
          이벤트 등록부터 응모, 당첨자 선정, 관람 체크까지.
          <br className="hidden sm:block" />
          공연 초대권 운영의 모든 과정을 간편하게 관리하세요.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:gap-4">
          <Link
            href="/events"
            className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-coral px-6 py-3.5 font-bold shadow-lg transition-all hover:scale-105 hover:shadow-xl hover:bg-coral-dark active:scale-95 sm:px-8 sm:py-4"
          >
            진행 중인 이벤트 보기
            <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <Link
            href="/event-center"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-white/50 bg-white/15 px-6 py-3.5 font-semibold backdrop-blur-sm transition-all hover:border-white/70 hover:bg-white/25 active:scale-95 sm:px-8 sm:py-4"
          >
            이벤트 개설하기
          </Link>
        </div>
        <div className="mt-8 grid gap-4 sm:mt-10 sm:gap-6 md:grid-cols-3">
          <Stat label="등록된 공연" value={`${stats.shows}+`} icon="🎭" />
          <Stat label="진행 중 이벤트" value={`${stats.campaigns}+`} icon="🎫" />
          <Stat label="협업 파트너" value={`${stats.partners}+`} icon="🤝" />
        </div>
      </div>
    </section>
  );
}

function PromoSection({ shows }: { shows: Show[] }) {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section
      ref={ref}
      className={`rounded-[24px] border border-slate-200/80 bg-gradient-to-br from-neutral-offwhite to-white p-6 shadow-xl transition-all duration-700 sm:p-8 md:rounded-[40px] md:p-10 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <div className="flex flex-col gap-4 sm:gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-deepPurple/10 px-3 py-1">
            <span className="text-sm">🎭</span>
            <p className="text-xs font-bold uppercase tracking-wide text-deepPurple">Featured Shows</p>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">지금 주목받는 공연</h2>
          <p className="text-sm text-slate-600 sm:text-base">
            SNS에서 화제가 되고 있는 공연들을 한눈에 확인하세요
          </p>
        </div>
        <Link
          href="/event-center#event-create"
          className="group inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-deepPurple/30 bg-white px-5 py-3 font-semibold text-deepPurple transition-all hover:border-deepPurple hover:bg-deepPurple/5 hover:shadow-md active:scale-95 sm:px-6"
        >
          <span>공연 등록하기</span>
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </Link>
      </div>
      <div className="mt-6 grid gap-4 sm:mt-8 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {shows.length ? (
          shows.map((show, index) => <PromoCard key={show.id} show={show} index={index} />)
        ) : (
          <div className="col-span-full rounded-3xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
            <p className="text-lg font-medium text-slate-400">아직 등록된 공연이 없습니다</p>
            <p className="mt-2 text-sm text-slate-500">첫 번째 공연을 등록해주세요</p>
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
      className={`rounded-[24px] border border-coral/20 bg-gradient-to-br from-coral/5 to-coral/10 p-6 shadow-xl transition-all duration-700 sm:p-8 md:rounded-[40px] md:p-10 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <div className="flex flex-col gap-4 sm:gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-coral/15 px-3 py-1">
            <span className="text-sm">🎫</span>
            <p className="text-xs font-bold uppercase tracking-wide text-coral-dark">Live Events</p>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">진행 중인 초대권 이벤트</h2>
          <p className="text-sm text-slate-600 sm:text-base">
            지금 바로 응모할 수 있는 초대권 이벤트를 확인하세요
          </p>
        </div>
        <Link
          href="/events"
          className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-coral px-5 py-3 font-bold text-white shadow-lg transition-all hover:bg-coral-dark hover:scale-105 active:scale-95 sm:px-6"
        >
          <span>전체 이벤트</span>
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </Link>
      </div>
      <div className="mt-6 grid gap-4 sm:mt-8 sm:gap-6 md:grid-cols-2">
        {campaigns.length ? (
          campaigns.map((campaign, index) => <CampaignCard key={campaign.id} campaign={campaign} index={index} />)
        ) : (
          <div className="col-span-2 rounded-3xl border-2 border-dashed border-coral/30 bg-white p-12 text-center">
            <p className="text-lg font-medium text-slate-400">진행 중인 이벤트가 없습니다</p>
            <p className="mt-2 text-sm text-slate-500">새로운 이벤트를 기다려주세요</p>
          </div>
        )}
      </div>
    </section>
  );
}

function FlowSection() {
  const { ref, isVisible } = useScrollAnimation();

  const steps = [
    {
      icon: "📝",
      title: "이벤트 등록",
      detail: "공연 정보와 초대권 수량을 입력하면 이벤트 페이지가 자동으로 생성됩니다",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: "🎯",
      title: "응모 & 선정",
      detail: "관객이 응모하면 당첨자를 선정하고 이메일로 결과를 안내합니다",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: "✅",
      title: "관람 체크",
      detail: "공연 당일 당첨자의 참석 여부를 확인하고 기록으로 남깁니다",
      color: "from-emerald-500 to-teal-500"
    },
  ];

  return (
    <section
      ref={ref}
      className={`rounded-[24px] border border-slate-200/80 bg-gradient-to-br from-white to-neutral-offwhite p-6 shadow-xl transition-all duration-700 sm:p-8 md:rounded-[40px] md:p-10 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">간단한 3단계로 완료</h2>
        <p className="mt-3 text-base text-slate-600 sm:text-lg">복잡한 과정 없이 누구나 쉽게 초대권 이벤트를 운영할 수 있습니다</p>
      </div>
      <div className="mt-8 grid gap-4 sm:mt-10 sm:gap-6 md:grid-cols-3">
        {steps.map((step, index) => (
          <article
            key={step.title}
            className={`group relative overflow-hidden rounded-3xl bg-slate-50 p-5 transition-all duration-500 hover:scale-105 hover:shadow-lg sm:p-6 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            <div className={`absolute right-0 top-0 h-32 w-32 bg-gradient-to-br ${step.color} opacity-10 blur-2xl transition-opacity group-hover:opacity-20`}></div>
            <div className="relative">
              <span className="text-4xl sm:text-5xl">{step.icon}</span>
              <div className="mt-3 flex items-center gap-2 sm:mt-4">
                <span className={`flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br ${step.color} text-xs font-bold text-white shadow-md`}>
                  {index + 1}
                </span>
                <h3 className="text-lg font-bold text-slate-900 sm:text-xl">{step.title}</h3>
              </div>
              <p className="mt-2 text-sm text-slate-600 sm:mt-3 sm:text-base">{step.detail}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/**
 * 공연 프로모션 카드
 *
 * 공연 정보를 카드 형태로 표시하는 컴포넌트
 * - 포스터 이미지 (있으면 표시, 없으면 플레이스홀더)
 * - 공연 제목, 지역, 기간, 태그
 * - 호버 시 이미지 확대 효과
 * - 클릭 시 공연 상세 페이지로 이동
 *
 * @param show - 공연 데이터
 * @param index - 순차 애니메이션을 위한 인덱스
 */
function PromoCard({ show, index }: { show: Show; index: number }) {
  const period = formatPeriod(show.period_start, show.period_end);

  return (
    <article
      className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
      style={{ animationDelay: `${index * 100}ms` }} // 순차 애니메이션: 100ms씩 지연
    >
      {/* Poster Image: 고정 높이 (모바일 192px, 태블릿+ 224px) */}
      <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 sm:h-56">
        {show.poster_url ? (
          <Image
            src={show.poster_url}
            alt={`${show.title} 포스터`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <span className="text-4xl sm:text-5xl">🎭</span>
              <p className="mt-2 text-xs text-slate-400 sm:text-sm">포스터 준비 중</p>
            </div>
          </div>
        )}
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
      </div>

      {/* Content */}
      <div className="relative space-y-2 p-4 sm:space-y-3 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 transition-colors group-hover:bg-indigo-50 group-hover:text-indigo-700">
            📍 {show.region ?? "미정"}
          </span>
          <span className="text-xs text-slate-500">{period ?? "일정 협의 중"}</span>
        </div>
        <h3 className="line-clamp-2 text-base font-bold text-slate-900 sm:text-lg">{show.title}</h3>
        {show.tags && show.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {show.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="rounded-lg bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 transition-colors hover:bg-indigo-100">
                #{tag}
              </span>
            ))}
          </div>
        )}
        <Link
          href={`/performances/${show.slug}`}
          className="group/link inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 transition-all hover:gap-2 hover:text-indigo-700 active:scale-95"
        >
          <span>자세히 보기</span>
          <span className="transition-transform group-hover/link:translate-x-1">→</span>
        </Link>
      </div>
    </article>
  );
}

function CampaignCard({ campaign, index }: { campaign: Campaign; index: number }) {
  const closesAt = campaign.ends_at ? formatDate(campaign.ends_at) : null;

  return (
    <article
      className="group relative overflow-hidden rounded-3xl border border-purple-200 bg-white p-5 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-xl sm:p-6"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="absolute right-0 top-0 h-32 w-32 bg-gradient-to-br from-purple-500 to-pink-500 opacity-5 blur-2xl transition-opacity group-hover:opacity-10"></div>
      <div className="relative space-y-3 sm:space-y-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="min-h-[3rem] text-lg font-bold text-slate-900 line-clamp-2 sm:text-xl">{campaign.title}</h3>
          <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700 shadow-sm">진행중</span>
        </div>
        <p className="text-sm text-slate-600 line-clamp-2 sm:text-base">{campaign.description ?? "지금 바로 응모할 수 있는 초대권 이벤트입니다"}</p>
        <div className="space-y-2">
          {campaign.reward && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-500">🎁 제공:</span>
              <span className="font-semibold text-slate-900">{campaign.reward}</span>
            </div>
          )}
          {closesAt && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-500">⏰ 마감:</span>
              <span className="font-semibold text-slate-900">{closesAt}</span>
            </div>
          )}
        </div>
        <Link
          href={`/events/${campaign.slug ?? campaign.id}`}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3.5 font-semibold text-white shadow-md transition-all hover:scale-105 hover:shadow-lg active:scale-95"
        >
          <span>응모하기</span>
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </Link>
      </div>
    </article>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon?: string }) {
  return (
    <div className="group rounded-3xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm transition-all hover:scale-105 hover:border-white/40 hover:bg-white/20 sm:p-6">
      {icon && <span className="text-2xl sm:text-3xl">{icon}</span>}
      <p className="mt-2 text-xs font-medium uppercase tracking-wider text-white/70 sm:mt-3 sm:text-sm">{label}</p>
      <p className="mt-1 text-3xl font-bold text-white sm:mt-2 sm:text-4xl">{value}</p>
    </div>
  );
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
