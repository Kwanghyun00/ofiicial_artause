/**
 * 공연 상세 페이지
 *
 * 각 공연의 상세 정보를 표시하는 동적 라우트 페이지입니다.
 * URL 패턴: /performances/[slug]
 *
 * 주요 기능:
 * - 공연 기본 정보 표시 (제목, 기획사, 지역, 날짜, 장소)
 * - 공연 포스터 이미지 표시 (없을 경우 플레이스홀더)
 * - 작품 소개(시놉시스) 표시
 * - 태그 표시
 * - 진행 중인 초대권 응모 이벤트 목록 및 응모 링크
 *
 * 데이터 소스:
 * - Supabase: performances 테이블
 * - Supabase 미설정 시 목업 데이터 사용 (src/lib/mocks/performances.ts)
 *
 * SEO:
 * - 동적 메타데이터 생성 (제목, 설명)
 * - Open Graph 지원 가능 (추후 확장)
 */
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getPerformanceBySlug } from "@/lib/supabase/queries";

/**
 * 페이지 Props 타입 정의
 * Next.js 15에서는 params가 Promise로 전달됨
 */
type Props = {
  params: Promise<{ slug: string }>;
};

/**
 * 메타데이터 생성 함수
 * 공연 정보를 기반으로 페이지 제목과 설명을 동적으로 생성합니다
 */
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const performance = await getPerformanceBySlug(slug);

  if (!performance || !("title" in performance)) {
    return {
      title: "공연을 찾을 수 없습니다",
    };
  }

  return {
    title: `${performance.title} | Artause`,
    description: performance.synopsis || `${performance.title} 공연 정보`,
  };
}

/**
 * 공연 상세 페이지 메인 컴포넌트
 *
 * @param params - URL 파라미터 (slug: 공연 고유 식별자)
 * @returns 공연 상세 정보를 담은 페이지
 */
export default async function PerformancePage({ params }: Props): Promise<React.JSX.Element> {
  const { slug } = await params;
  const performanceData = await getPerformanceBySlug(slug);

  // 공연을 찾을 수 없거나 에러가 있으면 404 페이지 표시
  if (!performanceData || !("title" in performanceData)) {
    notFound();
  }

  // TypeScript를 위한 타입 단언 (빌드 오류 해결)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const performance = performanceData as any;

  /**
   * 현재 진행 중인 초대권 캠페인 필터링
   * - starts_at이 현재 시간 이후면 제외 (아직 시작 안함)
   * - ends_at이 현재 시간 이전이면 제외 (이미 종료)
   */
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activeCampaigns = performance.ticket_campaigns?.filter((campaign: any) => {
    const starts = campaign.starts_at ? new Date(campaign.starts_at).getTime() : null;
    const ends = campaign.ends_at ? new Date(campaign.ends_at).getTime() : null;
    if (starts && starts > now) return false;
    if (ends && ends < now) return false;
    return true;
  }) || [];

  /**
   * 날짜 포맷팅 유틸리티 함수
   * @param dateString - ISO 8601 날짜 문자열
   * @returns "YYYY년 MM월 DD일" 형식의 한국어 날짜 문자열
   */
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  /**
   * 공연 기간 문자열 생성
   * 시작일과 종료일을 "시작일 ~ 종료일" 형식으로 표시
   */
  const period = performance.period_start || performance.period_end
    ? `${formatDate(performance.period_start) || "?"} ~ ${formatDate(performance.period_end) || "?"}`
    : null;

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 sm:px-8 sm:py-12 md:px-6 md:py-16">
      {/* Hero Section: 공연 제목, 기획사, 장소/날짜 정보 */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <Link
            href="/performances"
            className="inline-flex items-center gap-2 text-sm text-slate-600 transition-colors hover:text-slate-900"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>목록으로</span>
          </Link>
          {performance.category && (
            <>
              <span className="text-slate-300">/</span>
              <span className="rounded bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                {performance.category}
              </span>
            </>
          )}
        </div>

        <h1 className="text-2xl font-bold leading-tight text-slate-900 sm:text-3xl md:text-4xl">
          {performance.title}
        </h1>

        {performance.organization && (
          <p className="mt-3 text-base text-slate-600 sm:text-lg">
            기획·제작: {performance.organization}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-3">
          {performance.region && (
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm">
              <span className="font-medium text-slate-700">{performance.region}</span>
            </div>
          )}
          {period && (
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm">
              <span className="font-medium text-slate-700">{period}</span>
            </div>
          )}
          {performance.venue && (
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm">
              <span className="font-medium text-slate-700">{performance.venue}</span>
            </div>
          )}
        </div>
      </section>

      {/* Poster Image Section: 공연 포스터 이미지 (16:9 비율) */}
      <section className="mt-10 sm:mt-12">
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[24px] bg-gradient-to-br from-slate-100 to-slate-200 shadow-xl md:rounded-[40px]">
          {/* 포스터 이미지가 있으면 표시, 없으면 플레이스홀더 */}
          {performance.poster_url ? (
            <Image
              src={performance.poster_url}
              alt={`${performance.title} 포스터`}
              fill
              className="object-contain"
              sizes="(max-width: 1200px) 100vw, 1200px"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <span className="text-8xl">🎭</span>
                <p className="mt-4 text-lg font-medium text-slate-400">포스터 이미지 준비 중</p>
                <p className="mt-2 text-sm text-slate-400">공연 단체에서 제공되는 대로 업데이트됩니다</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Synopsis Section: 작품 소개 (있을 경우에만 표시) */}
      {performance.synopsis && (
        <section className="mt-10 rounded-[24px] border border-slate-200 bg-white p-6 shadow-xl sm:mt-12 sm:p-8 md:rounded-[40px] md:p-10">
          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">작품 소개</h2>
          <div className="prose prose-slate mt-4 max-w-none sm:mt-6">
            {/* whitespace-pre-wrap으로 줄바꿈 유지 */}
            <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">
              {performance.synopsis}
            </p>
          </div>
        </section>
      )}

      {/* Tags Section: 공연 태그 (있을 경우에만 표시) */}
      {"tags" in performance && performance.tags && Array.isArray(performance.tags) && performance.tags.length > 0 && (
        <section className="mt-8 sm:mt-10">
          <div className="flex flex-wrap gap-2">
            {performance.tags.map((tag: string) => (
              <span
                key={tag}
                className="rounded-full bg-deepPurple/10 px-4 py-2 text-sm font-medium text-deepPurple transition-colors hover:bg-deepPurple/15"
              >
                #{tag}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Ticket Campaigns Section: 진행 중인 초대권 응모 이벤트 (있을 경우에만 표시) */}
      {activeCampaigns.length > 0 && (
        <section className="mt-10 rounded-[24px] border border-coral/20 bg-gradient-to-br from-coral/5 to-coral/10 p-6 shadow-xl sm:mt-12 sm:p-8 md:rounded-[40px] md:p-10">
          <div className="mb-6 flex items-center gap-3 sm:mb-8">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-coral text-2xl text-white shadow-lg">
              🎫
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">초대권 응모</h2>
              <p className="text-sm text-slate-600 sm:text-base">
                지금 바로 응모 가능한 초대권 이벤트입니다
              </p>
            </div>
          </div>

          {/* 캠페인 카드들을 그리드로 표시 (모바일 1열, 데스크톱 2열) */}
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {activeCampaigns.map((campaign: any) => {
              const closesAt = campaign.ends_at
                ? new Date(campaign.ends_at).toLocaleDateString("ko-KR", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : null;

              return (
                <article
                  key={campaign.id}
                  className="group relative overflow-hidden rounded-3xl border border-coral/20 bg-white p-5 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-xl sm:p-6"
                >
                  <div className="absolute right-0 top-0 h-32 w-32 bg-coral opacity-5 blur-2xl transition-opacity group-hover:opacity-10"></div>
                  <div className="relative space-y-3 sm:space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-lg font-bold text-slate-900 sm:text-xl">{campaign.title}</h3>
                      <span className="shrink-0 rounded-full bg-coral/10 px-2.5 py-1 text-xs font-bold text-coral-dark shadow-sm">
                        진행중
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 sm:text-base line-clamp-2">
                      {campaign.description ?? "지금 바로 응모할 수 있는 초대권 이벤트입니다"}
                    </p>
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
                      href={`/events/tickets/${campaign.slug ?? campaign.id}`}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-coral px-6 py-3.5 font-bold text-white shadow-md transition-all hover:bg-coral-dark hover:scale-105 hover:shadow-lg active:scale-95"
                    >
                      <span>응모하기</span>
                      <span className="transition-transform group-hover:translate-x-1">→</span>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* No Campaigns Message: 진행 중인 초대권 이벤트가 없을 때 표시 */}
      {activeCampaigns.length === 0 && (
        <section className="mt-10 rounded-[24px] border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center sm:mt-12 sm:p-12 md:rounded-[40px]">
          <div className="mx-auto max-w-md">
            <div className="text-6xl">🎟️</div>
            <h3 className="mt-4 text-xl font-bold text-slate-900 sm:text-2xl">
              초대권 이벤트 준비 중
            </h3>
            <p className="mt-2 text-slate-600">
              곧 초대권 이벤트가 열릴 예정입니다. 조금만 기다려주세요!
            </p>
            {/* 다른 진행 중인 이벤트 페이지로 이동하는 CTA 버튼 */}
            <Link
              href="/events"
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-coral px-6 py-3 font-bold text-white shadow-md transition-all hover:bg-coral-dark hover:shadow-lg active:scale-95"
            >
              <span>다른 이벤트 보기</span>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
