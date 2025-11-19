/**
 * HomeLanding 컴포넌트 - V0 Inspired Design
 *
 * v0 디자인 시스템을 적용한 세련된 한국형 초대권 플랫폼 UI
 * - 베이지 톤 배경 (#FBF9F6)
 * - 보라색 계열 Primary (#8B7BA8)
 * - 카드 중심의 깔끔한 레이아웃
 * - 그림자와 호버 효과로 입체감
 */
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";

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

type Campaign = {
  id: string;
  slug?: string | null;
  title: string;
  description?: string | null;
  reward?: string | null;
  ends_at?: string | null;
};

type Organization = {
  id: string;
  name: string;
  region?: string | null;
};

type Props = {
  featuredShows: Show[];
  campaigns: Campaign[];
  organizations: Organization[];
};

export function HomeLanding({ featuredShows, campaigns, organizations }: Props) {
  const activeCampaigns = campaigns.slice(0, 12);
  const recommendedShows = featuredShows.slice(0, 12);

  return (
    <div className="space-y-16 md:space-y-20 lg:space-y-24">
      <HeroSection totalCampaigns={campaigns.length} />
      <FeaturedEventsSection campaigns={activeCampaigns.slice(0, 2)} />
      <InvitationSection campaigns={activeCampaigns.slice(2, 6)} />
      <PerformanceSection shows={recommendedShows.slice(0, 6)} />
      <CTASection />
    </div>
  );
}

function useScrollAnimation() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -100px 0px" }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return { ref, isVisible };
}

/**
 * Hero Section - v0 스타일 그라데이션 배경
 */
function HeroSection({ totalCampaigns }: { totalCampaigns: number }) {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section
      ref={ref}
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#8B7BA8] via-[#A89BC4] to-[#8B7BA8] px-6 py-16 md:px-12 md:py-20 lg:px-16 lg:py-24 text-white shadow-2xl transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      {/* 배경 패턴 */}
      <div className="absolute inset-0 bg-[url('/abstract-geometric-flow.png')] opacity-10" />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        {/* 상단 배지 */}
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
          <span className="text-2xl">✨</span>
          <span className="text-sm font-medium">지금 {totalCampaigns}개의 초대권 이벤트 진행중!</span>
        </div>

        {/* 메인 타이틀 */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
          특별한 문화 경험,
          <br />
          무료 초대권으로 시작하세요
        </h1>

        <p className="text-lg md:text-xl mb-8 text-white/90 max-w-2xl mx-auto leading-relaxed">
          뮤지컬, 연극, 클래식, 전시까지. 지금 응모 가능한 초대권을 한눈에 확인하고 문화생활을 누려보세요.
        </p>

        {/* CTA 버튼 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/events/tickets"
            className="group inline-flex items-center justify-center gap-2 bg-white text-[#8B7BA8] hover:bg-white/90 h-14 px-8 text-lg font-bold rounded-full shadow-2xl hover:shadow-3xl hover:-translate-y-1 transition-all"
          >
            <span>무료로 응모하기</span>
            <span className="text-xl transition-transform group-hover:translate-x-1">→</span>
          </Link>
          <Link
            href="/performances"
            className="inline-flex items-center justify-center gap-2 border-2 border-white text-white hover:bg-white/10 h-14 px-8 text-lg font-bold rounded-full transition-all"
          >
            공연 둘러보기
          </Link>
        </div>

        <p className="text-sm text-white/70 mt-6">
          신용카드 등록 불필요 · 언제든 무료 이용
        </p>
      </div>
    </section>
  );
}

/**
 * Featured Events - 대형 카드 2개
 */
function FeaturedEventsSection({ campaigns }: { campaigns: Campaign[] }) {
  const { ref, isVisible } = useScrollAnimation();

  if (campaigns.length === 0) return null;

  return (
    <section
      ref={ref}
      className={`transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-[#8B7BA8]/10 text-[#8B7BA8] border border-[#8B7BA8]/20 hover:bg-[#8B7BA8]/20 px-4 py-2 rounded-full mb-4 text-sm font-medium transition-colors">
          이번 주 인기
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-[#2D2A26] mb-3">
          지금 가장 핫한 초대권
        </h2>
        <p className="text-[#6B6560] text-lg">
          많은 분들이 응모하고 있는 인기 이벤트를 놓치지 마세요
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {campaigns.slice(0, 2).map((campaign, index) => (
          <FeaturedEventCard key={campaign.id} campaign={campaign} index={index} />
        ))}
      </div>
    </section>
  );
}

function FeaturedEventCard({ campaign, index }: { campaign: Campaign; index: number }) {
  const closesAt = campaign.ends_at ? formatDate(campaign.ends_at) : null;

  return (
    <Link href={`/events/tickets/${campaign.slug ?? campaign.id}`}>
      <div className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-[#E8E3DC] hover:border-[#8B7BA8]/30">
        {/* 이미지 영역 (placeholder) */}
        <div className="relative h-80 overflow-hidden bg-gradient-to-br from-[#F0EFF7] to-[#E8D5D5]">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

          {/* 상단 배지 */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
            <span className="bg-white/90 text-[#2D2A26] backdrop-blur-sm border-0 px-3 py-1 rounded-full text-xs font-medium">
              초대권
            </span>
            <span className="bg-[#8B7BA8] text-white border-0 shadow-lg px-3 py-1 rounded-full text-xs font-bold">
              마감 임박
            </span>
          </div>

          {/* 하단 정보 */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h3 className="text-2xl font-bold mb-1">{campaign.title}</h3>
            <p className="text-white/90 mb-4 line-clamp-2">
              {campaign.description ?? "지금 바로 응모하고 무료로 공연을 관람하세요"}
            </p>

            {campaign.reward && (
              <div className="flex items-center gap-2 text-sm">
                <span>🎁</span>
                <span>{campaign.reward}</span>
              </div>
            )}
          </div>
        </div>

        {/* 하단 정보 */}
        <div className="p-6 bg-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sm text-[#6B6560]">
              <span className="text-[#8B7BA8] font-medium">응모 진행중</span>
            </div>
            {closesAt && (
              <div className="text-xs text-[#6B6560]">
                {closesAt} 마감
              </div>
            )}
          </div>

          <button className="w-full bg-[#8B7BA8] hover:bg-[#8B7BA8]/90 text-white h-12 text-base font-bold rounded-xl shadow-lg shadow-[#8B7BA8]/20 hover:shadow-xl hover:-translate-y-0.5 transition-all">
            지금 응모하기
          </button>
        </div>
      </div>
    </Link>
  );
}

/**
 * Invitation Section - 작은 카드 4개
 */
function InvitationSection({ campaigns }: { campaigns: Campaign[] }) {
  const { ref, isVisible } = useScrollAnimation();

  if (campaigns.length === 0) return null;

  return (
    <section
      ref={ref}
      className={`transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#2D2A26] mb-2">진행 중인 초대권 이벤트</h2>
          <p className="text-[#6B6560]">놓치면 후회할 인기 공연·전시 초대 기회를 잡아보세요.</p>
        </div>
        <Link
          href="/events/tickets"
          className="text-[#8B7BA8] font-semibold hover:opacity-80 transition-opacity"
        >
          전체보기 →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {campaigns.map((campaign, index) => (
          <InvitationCard key={campaign.id} campaign={campaign} index={index} />
        ))}
      </div>
    </section>
  );
}

function InvitationCard({ campaign, index }: { campaign: Campaign; index: number }) {
  const closesAt = campaign.ends_at ? formatDate(campaign.ends_at) : null;
  const daysLeft = campaign.ends_at ? getDaysLeft(campaign.ends_at) : null;

  return (
    <Link href={`/events/tickets/${campaign.slug ?? campaign.id}`}>
      <div className="group overflow-hidden border border-[#E8E3DC] shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white rounded-3xl">
        {/* 이미지 영역 */}
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-[#F5EFE7] to-[#E8D5D5]">
          <div
            className={`absolute top-3 left-3 z-10 ${
              daysLeft !== null && daysLeft <= 1 ? "bg-red-500" : "bg-[#293380]"
            } text-white text-xs font-bold px-2 py-1 rounded-md shadow-md`}
          >
            {daysLeft !== null ? (daysLeft === 0 ? "오늘 마감" : `D-${daysLeft}`) : "진행중"}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
          <div className="absolute bottom-3 left-3 right-3 text-white">
            <div className="text-xs font-medium opacity-90 mb-1 flex items-center gap-1">
              <span className="bg-white/20 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px]">초대권</span>
            </div>
          </div>
        </div>

        {/* 정보 영역 */}
        <div className="p-5">
          <h3 className="font-bold text-lg text-[#2D2A26] mb-2 line-clamp-1 group-hover:text-[#8B7BA8] transition-colors">
            {campaign.title}
          </h3>
          <p className="text-sm text-[#6B6560] line-clamp-2 mb-4 h-10">
            {campaign.description ?? "지금 바로 응모하고 무료로 공연을 관람하세요"}
          </p>

          {campaign.reward && (
            <div className="flex items-center gap-2 text-sm mb-4">
              <span className="text-[#8B7BA8]">🎁</span>
              <span className="text-xs text-[#8B7BA8] font-medium">{campaign.reward}</span>
            </div>
          )}

          <button className="w-full bg-[#8B7BA8] hover:bg-[#8B7BA8]/90 text-white transition-colors rounded-lg font-bold py-3">
            응모하기
          </button>
        </div>
      </div>
    </Link>
  );
}

/**
 * Performance Section - 가로 카드 레이아웃
 */
function PerformanceSection({ shows }: { shows: Show[] }) {
  const { ref, isVisible } = useScrollAnimation();

  if (shows.length === 0) return null;

  return (
    <section
      ref={ref}
      className={`py-16 bg-[#F5EFE7]/50 -mx-4 px-4 md:-mx-6 md:px-6 transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
          <h2 className="text-3xl font-bold text-[#2D2A26]">공연 · 전시 정보</h2>

          <div className="flex overflow-x-auto pb-2 md:pb-0 gap-2 w-full md:w-auto">
            {["이번 주", "이번 달", "서울", "수도권", "기타 지역"].map((filter, i) => (
              <button
                key={filter}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  i === 0
                    ? "bg-[#8B7BA8] text-white"
                    : "bg-white text-[#2D2A26] border border-[#E8E3DC] hover:bg-[#FBF9F6]"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shows.map((show, index) => (
            <PerformanceCard key={show.id} show={show} index={index} />
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/performances"
            className="inline-flex items-center justify-center border-2 border-[#8B7BA8] text-[#8B7BA8] hover:bg-[#8B7BA8]/5 px-8 py-3 rounded-full font-bold transition-all"
          >
            더 많은 공연 보기
          </Link>
        </div>
      </div>
    </section>
  );
}

function PerformanceCard({ show, index }: { show: Show; index: number }) {
  const period = formatPeriod(show.period_start, show.period_end);
  const genreInfo = getGenreInfo(show.tags?.[0]);

  return (
    <Link href={`/performances/${show.slug}`}>
      <div className="flex bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-[#E8E3DC] h-40">
        <div className="w-28 relative shrink-0 bg-gradient-to-br from-[#F0EFF7] to-[#E8D5D5]">
          {show.poster_url ? (
            <Image src={show.poster_url} alt={show.title} fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-3xl">{genreInfo.icon}</div>
          )}
        </div>
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-1">
              <span className="bg-[#8B7BA8]/10 text-[#8B7BA8] hover:bg-[#8B7BA8]/20 text-[10px] px-1.5 py-0 h-5 rounded inline-flex items-center font-medium">
                {show.tags?.[0] ?? "공연"}
              </span>
              <div className="flex items-center text-amber-500 text-xs font-bold">
                <span className="mr-0.5">⭐</span>
                9.5
              </div>
            </div>
            <h3 className="font-bold text-[#2D2A26] line-clamp-1 mb-1">{show.title}</h3>
            <div className="text-xs text-[#6B6560] space-y-1">
              {show.region && (
                <div className="flex items-center gap-1">
                  <span>📍</span>
                  <span className="line-clamp-1">{show.region}</span>
                </div>
              )}
              {period && (
                <div className="flex items-center gap-1">
                  <span>📅</span>
                  <span className="truncate">{period}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end mt-2">
            <button className="h-8 text-xs border border-[#E8E3DC] text-[#2D2A26] hover:bg-[#8B7BA8] hover:text-white hover:border-[#8B7BA8] transition-colors px-4 rounded-lg font-medium">
              자세히 보기
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

/**
 * CTA Section - 하단 배너
 */
function CTASection() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section
      ref={ref}
      className={`relative overflow-hidden rounded-3xl bg-[#8B7BA8] text-white px-8 py-16 md:p-12 shadow-2xl transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <div className="absolute inset-0 bg-[url('/abstract-geometric-flow.png')] opacity-10" />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
          <span>✨</span>
          <span className="text-sm font-medium">지금 가입하면 첫 응모 당첨 확률 2배!</span>
        </div>

        <h2 className="text-3xl md:text-5xl font-bold mb-6">
          특별한 문화 경험,
          <br />
          지금 바로 시작하세요
        </h2>

        <p className="text-lg md:text-xl mb-8 text-white/90">
          무료 회원가입하고 이번 주 12개의 초대권 이벤트에 응모해보세요
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/events/tickets"
            className="inline-flex items-center justify-center gap-2 bg-white text-[#8B7BA8] hover:bg-white/90 h-14 px-8 text-lg font-bold rounded-full shadow-2xl hover:shadow-3xl hover:-translate-y-1 transition-all"
          >
            <span>무료로 시작하기</span>
            <span className="text-xl">→</span>
          </Link>
          <Link
            href="/about"
            className="inline-flex items-center justify-center gap-2 border-2 border-white text-white hover:bg-white/10 h-14 px-8 text-lg font-bold rounded-full transition-all"
          >
            더 알아보기
          </Link>
        </div>

        <p className="text-sm text-white/70 mt-6">
          신용카드 등록 불필요 · 언제든 무료 이용
        </p>
      </div>
    </section>
  );
}

/**
 * 유틸리티 함수
 */
function getGenreInfo(genre?: string | null): { icon: string } {
  if (!genre) return { icon: "🎨" };

  const lowerGenre = genre.toLowerCase();
  if (lowerGenre.includes("뮤지컬")) return { icon: "🎭" };
  if (lowerGenre.includes("연극")) return { icon: "🎬" };
  if (lowerGenre.includes("클래식") || lowerGenre.includes("음악")) return { icon: "🎼" };
  if (lowerGenre.includes("무용") || lowerGenre.includes("댄스")) return { icon: "💃" };
  if (lowerGenre.includes("전시") || lowerGenre.includes("미술")) return { icon: "🖼️" };

  return { icon: "🎨" };
}

function formatPeriod(start?: string | null, end?: string | null) {
  if (!start && !end) return null;
  const startText = start ? formatDate(start) : "미정";
  const endText = end ? formatDate(end) : "미정";
  if (startText === endText) return startText;
  return `${startText} ~ ${endText}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("ko-KR", {
    month: "short",
    day: "numeric",
  });
}

function getDaysLeft(endDate: string): number | null {
  try {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  } catch {
    return null;
  }
}
