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
    <div className="mx-auto max-w-6xl px-6 py-8 sm:px-8 sm:py-12 md:px-6 md:py-16 space-y-10 sm:space-y-12">
      {/* Hero Section: 페이지 소개 및 이벤트 개설 CTA */}
      <section className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-gradient-violet via-gradient-electric to-gradient-magenta p-8 text-white shadow-2xl sm:p-10 md:rounded-[40px] md:p-12 lg:p-16">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDEzNGgxMnYxMkgzNnptMjQgMGgxMnYxMkg2MHpNMTIgMTEwaDEydjEySDE2em0yNCAwaDEydjEySDM2em0yNCAwaDEydjEySDYwem0yNCAwaDEydjEySDg0em0wIDI0aDEydjEySDg0em0wIDI0aDEydjEySDg0eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-yellow-300 animate-pulse"></span>
            <p className="text-xs font-medium uppercase tracking-wider">Live Events</p>
          </div>
          <h1 className="mt-4 text-3xl font-bold sm:mt-6 sm:text-4xl md:text-5xl lg:text-6xl">
            지금 응모 가능한 초대권
          </h1>
          <p className="mt-3 max-w-2xl text-base text-white/90 sm:mt-4 sm:text-lg md:text-xl">
            공연 단체가 직접 등록한 초대권 이벤트에 지금 바로 응모하세요.
            선정 결과는 이메일로 안내드립니다.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 sm:mt-8 sm:gap-4">
            <Link
              href="/event-center#event-create"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-white/50 bg-white/15 px-5 py-3 font-semibold backdrop-blur-sm transition-all hover:border-white/70 hover:bg-white/25 active:scale-95 sm:px-6"
            >
              <span>이벤트 개설하기</span>
              <span>+</span>
            </Link>
          </div>
        </div>
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
