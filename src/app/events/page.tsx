/**
 * 이벤트 목록 페이지
 *
 * 진행 중/예정/종료된 초대권 이벤트를 한눈에 볼 수 있는 페이지입니다.
 * URL: /events
 *
 * 주요 기능:
 * - Hero 섹션: 페이지 소개 및 이벤트 개설 CTA
 * - 모집 중인 이벤트: 현재 응모 가능한 초대권 목록
 * - 오픈 예정: 곧 시작될 이벤트 미리보기
 * - 최근 종료: 최근에 마감된 이벤트 (최대 3개)
 *
 * 데이터 소스:
 * - Supabase: ticket_campaigns 테이블
 * - Supabase 미설정 시 목업 데이터 사용
 *
 * 이벤트 상태 분류:
 * - active: starts_at <= 현재 <= ends_at (또는 날짜 미설정)
 * - upcoming: starts_at > 현재
 * - closed: ends_at < 현재
 */
import Link from "next/link";
import { EventsExplorer } from "@/components/events/EventsExplorer";
import { getTicketCampaigns } from "@/lib/supabase/queries";

/**
 * 타입 정의
 * Supabase 쿼리 결과의 배열 요소 타입을 추출합니다
 */
type CampaignResult = Awaited<ReturnType<typeof getTicketCampaigns>>[number];
type ValidCampaign = Extract<CampaignResult, { id: string }>;

/**
 * 페이지 메타데이터
 * SEO 최적화를 위한 제목과 설명
 */
export const metadata = {
  title: "초대권 이벤트 모아보기",
  description: "SNS 홍보와 연동된 초대권 이벤트를 한 곳에서 확인하고 응모하세요.",
};

/**
 * 이벤트 페이지 메인 컴포넌트
 *
 * 데이터 처리:
 * - 모든 캠페인을 가져와서 상태별로 분류합니다
 * - active: 지금 응모 가능
 * - upcoming: 곧 시작 예정
 * - closed: 최근 종료 (최대 3개만 표시)
 */
export default async function EventsPage() {
  // 모든 캠페인 가져오기 및 유효성 검사
  const campaigns = (await getTicketCampaigns()).filter(isCampaign);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-12 lg:px-6 lg:py-16 space-y-6 sm:space-y-8 md:space-y-10">
      {/* Hero Section: 페이지 소개 */}
      <section className="rounded-lg sm:rounded-xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl md:text-3xl lg:text-4xl">
          초대권 이벤트
        </h1>
        <p className="mt-2 sm:mt-3 max-w-2xl text-xs sm:text-sm md:text-base text-slate-600">
          공연 단체가 직접 등록한 초대권 이벤트에 지금 바로 응모하세요.
        </p>
      </section>

      {/* Events Explorer: 검색 및 필터링 기능이 있는 이벤트 목록 */}
      <EventsExplorer campaigns={campaigns} />
    </div>
  );
}

/**
 * Type guard: 캠페인 데이터 유효성 검사
 * @param record - 검사할 캠페인 레코드
 * @returns id 필드가 있는 유효한 캠페인 여부
 */
function isCampaign(record: CampaignResult): record is ValidCampaign {
  return Boolean(record && typeof record === "object" && "id" in record);
}

/**
 * 캠페인 상태 타입
 * - active: 현재 진행 중
 * - upcoming: 시작 예정
 * - closed: 종료됨
 */
type CampaignStatus = "active" | "upcoming" | "closed";

/**
 * 캠페인 상태 판별 함수
 * @param campaign - 캠페인 데이터
 * @returns 현재 시간 기준 캠페인 상태
 *
 * 로직:
 * - starts_at > 현재: upcoming (아직 시작 안함)
 * - ends_at < 현재: closed (이미 종료)
 * - 그 외: active (진행 중)
 */
function getStatus(campaign: ValidCampaign): CampaignStatus {
  const now = Date.now();
  const starts = campaign.starts_at ? new Date(campaign.starts_at).getTime() : null;
  const ends = campaign.ends_at ? new Date(campaign.ends_at).getTime() : null;
  if (starts && starts > now) return "upcoming";
  if (ends && ends < now) return "closed";
  return "active";
}

/**
 * 날짜/시간 포맷팅 함수
 * @param value - ISO 8601 날짜 문자열
 * @returns "MM월 DD일 HH:MM" 형식의 한국어 날짜/시간 문자열
 */
function formatDateTime(value: string) {
  return new Date(value).toLocaleString("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
