/**
 * 공연 목록 페이지
 *
 * URL: /performances
 *
 * 주요 기능:
 * - 모든 공연 목록 표시 (포스터 이미지 포함)
 * - 장르별 필터링
 * - 지역별 필터링
 *
 * 데이터 소스:
 * - Supabase: performances 테이블
 * - Supabase 미설정 시 목업 데이터 사용
 */
import { getFeaturedPerformances } from "@/lib/supabase/queries";
import { PerformanceList } from "@/components/performances/PerformanceList";

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
    <div className="mx-auto max-w-6xl px-6 py-8 sm:px-8 sm:py-12 md:px-6 md:py-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">공연 목록</h1>
        <p className="mt-2 text-base text-slate-600">
          진행 중인 모든 공연을 확인하고 상세 정보를 살펴보세요
        </p>
      </div>
      <PerformanceList performances={validPerformances} />
    </div>
  );
}
