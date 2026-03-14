/**
 * ============================================================
 * 보상형 광고 게이트 (AdGate) — 현재 비활성화
 * ============================================================
 * 이 훅은 Google Ad Manager(GAM) 보상형 광고 연동 코드입니다.
 * 광고 계정 설정 완료 후 아래 절차로 재활성화하세요:
 *
 * 1. .env.local에 추가:
 *    NEXT_PUBLIC_GAM_REWARDED_AD_UNIT_PATH=/네트워크ID/광고유닛명
 *
 * 2. 이 파일을 src/lib/ads/_disabled/useRewardedAdGate.ts 에서 복원
 *
 * 3. TicketEntryForm.tsx 에서 AdGate 섹션 주석 해제
 *    (TODO: ADGATE_RESTORE 태그로 검색)
 * ============================================================
 */

export type RewardedAdStatus = "idle" | "loading" | "ready" | "showing" | "granted" | "closed" | "error";

/** AdGate 비활성화 중 — 항상 rewardGranted=true 반환 (직접 응모 허용) */
export function useRewardedAdGate(_options: {
  adUnitPath?: string;
  optInMessage?: string;
}) {
  return {
    status: "idle" as RewardedAdStatus,
    isWatching: false,
    rewardGranted: true,   // 광고 계정 준비 전까지 항상 허용
    adSessionId: "",
    error: null,
    watchAd: async () => true,
    resetReward: () => {},
  };
}
