import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { getKstToday, isPerformanceEndedKst, daysUntilKst } from "./date"

// P0-A 이관 6편의 공연 종료일
const POSTS = [
  { slug: "maureen", end: "2026-06-28" },
  { slug: "secret-royal-inspector", end: "2026-06-14" },
  { slug: "waegwaegi-was-there", end: "2026-06-25" },
  { slug: "after-the-end", end: "2026-06-21" },
  { slug: "kkweman-village", end: "2026-06-07" },
  { slug: "one-one-three", end: "2026-07-12" },
]

describe("KST 날짜 헬퍼", () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it("getKstToday는 UTC가 아니라 KST 기준 날짜를 준다 (자정 경계)", () => {
    // 2026-06-23 15:30 UTC === 2026-06-24 00:30 KST → KST 기준 오늘은 06-24
    vi.setSystemTime(new Date("2026-06-23T15:30:00Z"))
    expect(getKstToday()).toBe("2026-06-24")
  })

  it("2026-06-24(KST) 기준 6편의 아카이브(폐막) 분류", () => {
    vi.setSystemTime(new Date("2026-06-24T03:00:00Z")) // KST 12:00
    const result = Object.fromEntries(
      POSTS.map((p) => [p.slug, isPerformanceEndedKst(p.end)])
    )
    // 종료일 < 오늘 → 폐막(아카이브)
    expect(result).toEqual({
      maureen: false, // 06-28 진행중
      "secret-royal-inspector": true, // 06-14 폐막
      "waegwaegi-was-there": false, // 06-25 진행중
      "after-the-end": true, // 06-21 폐막
      "kkweman-village": true, // 06-07 폐막
      "one-one-three": false, // 07-12 진행중
    })
  })

  it("종료일 당일은 아직 진행중으로 본다", () => {
    vi.setSystemTime(new Date("2026-06-14T10:00:00Z")) // KST 06-14 19:00
    expect(isPerformanceEndedKst("2026-06-14")).toBe(false)
    // 하루 뒤
    vi.setSystemTime(new Date("2026-06-15T10:00:00Z"))
    expect(isPerformanceEndedKst("2026-06-14")).toBe(true)
  })

  it("daysUntilKst: 오늘=0, 미래=양수, 과거=음수", () => {
    vi.setSystemTime(new Date("2026-06-24T03:00:00Z"))
    expect(daysUntilKst("2026-06-24")).toBe(0)
    expect(daysUntilKst("2026-06-28")).toBe(4)
    expect(daysUntilKst("2026-06-21")).toBe(-3)
  })

  it("빈 값은 안전하게 처리", () => {
    vi.setSystemTime(new Date("2026-06-24T03:00:00Z"))
    expect(isPerformanceEndedKst(null)).toBe(false)
    expect(isPerformanceEndedKst(undefined)).toBe(false)
    expect(Number.isNaN(daysUntilKst(null))).toBe(true)
  })
})
