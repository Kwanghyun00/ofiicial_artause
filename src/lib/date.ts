/**
 * 날짜 유틸 — 모든 공연 시의성/D-day 계산은 Asia/Seoul(KST) 기준으로 통일한다.
 * UTC 기준 계산 금지. 서버(Vercel UTC)·클라이언트 시간대 차이로 인한
 * "폐막 임박/종료" 하루 오차를 막기 위해 이 헬퍼만 사용할 것.
 *
 * KST는 DST가 없어 항상 UTC+9 고정이므로 오프셋 가산으로 안전하게 계산한다.
 */

const KST_OFFSET_MS = 9 * 60 * 60 * 1000

/** KST 기준 오늘 날짜 (YYYY-MM-DD) */
export function getKstToday(): string {
  return new Date(Date.now() + KST_OFFSET_MS).toISOString().slice(0, 10)
}

/** 입력 날짜(YYYY-MM-DD 또는 ISO)를 날짜부분(YYYY-MM-DD)으로 정규화 */
function toDateOnly(value: string): string {
  return value.slice(0, 10)
}

/**
 * KST 기준, 오늘부터 대상 날짜까지 남은 일수.
 * 오늘 = 0, 미래 = 양수, 과거 = 음수. 값이 없으면 NaN.
 */
export function daysUntilKst(dateStr: string | null | undefined): number {
  if (!dateStr) return Number.NaN
  const today = new Date(getKstToday() + "T00:00:00Z").getTime()
  const target = new Date(toDateOnly(dateStr) + "T00:00:00Z").getTime()
  return Math.round((target - today) / 86_400_000)
}

/** KST 기준, 공연이 종료되었는지 (종료일 당일까지는 진행 중으로 본다) */
export function isPerformanceEndedKst(endDate: string | null | undefined): boolean {
  if (!endDate) return false
  return toDateOnly(endDate) < getKstToday()
}
