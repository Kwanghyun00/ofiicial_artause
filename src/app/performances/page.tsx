/**
 * 공연 목록 페이지
 *
 * URL: /performances
 *
 * 주요 기능:
 * - 모든 공연 목록 표시 (포스터 이미지 포함)
 * - 장르별 필터링 (뮤지컬, 연극, 클래식, 무용, 전시)
 * - 검색 기능 (제목, 지역)
 *
 * 데이터 소스:
 * - Supabase: performances 테이블
 * - Supabase 미설정 시 목업 데이터 사용
 */
import { getFeaturedPerformances } from "@/lib/supabase/queries";
import { PerformanceExplorer } from "@/components/performances/PerformanceExplorer";

/**
 * 타입 정의
 */
type PerformanceResult = Awaited<ReturnType<typeof getFeaturedPerformances>>[number];

/**
 * Type guard: 공연 데이터 유효성 검사
 */
const isPerformance = (
  item: PerformanceResult,
): item is NonNullable<PerformanceResult> & { id: string; slug: string; title: string } =>
  Boolean(item && typeof item === "object" && "id" in item && "slug" in item && "title" in item);

/**
 * 페이지 메타데이터
 */
export const metadata = {
  title: "공연 목록",
  description: "진행 중인 모든 공연을 한눈에 확인하세요",
};

/**
 * 공연 목록 페이지 컴포넌트
 */
export default async function PerformancesPage() {
  const performances = await getFeaturedPerformances();
  const validPerformances = performances.filter(isPerformance);

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 sm:px-8 sm:py-12 md:px-6 md:py-16 space-y-8 sm:space-y-10">
      {/* Hero Section: 페이지 소개 */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl md:text-4xl">
          공연 목록
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
          진행 중인 모든 공연을 확인하고 상세 정보를 살펴보세요
        </p>
      </section>

      {/* Performance Explorer: 검색 및 필터링 기능이 있는 공연 목록 */}
      <PerformanceExplorer performances={validPerformances} />
    </div>
  );
}
