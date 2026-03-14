declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    dataLayer?: unknown[]
  }
}

export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return
  window.gtag("event", name, params)
}

// 표준 이벤트 이름 — PRD DATA_DICTIONARY entry_events 기준
export const AnalyticsEvent = {
  ENTRY_SUBMIT_ATTEMPT: "entry_submit_attempt",
  ENTRY_SUBMIT_SUCCESS: "entry_submit_success",
  ENTRY_SUBMIT_ERROR: "entry_submit_error",
} as const

export type EntrySubmitParams = {
  campaign_id: string
  slug: string
  error_message?: string
}

export function trackEntrySubmit(
  stage: "attempt" | "success" | "error",
  params: EntrySubmitParams,
) {
  const eventName =
    stage === "attempt"
      ? AnalyticsEvent.ENTRY_SUBMIT_ATTEMPT
      : stage === "success"
        ? AnalyticsEvent.ENTRY_SUBMIT_SUCCESS
        : AnalyticsEvent.ENTRY_SUBMIT_ERROR
  trackEvent(eventName, params)
}
