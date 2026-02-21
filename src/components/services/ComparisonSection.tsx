import { X, Check } from "lucide-react"

const ROWS = [
  {
    category: "초대권 접수",
    before: "구글 폼 / DM 수동 정리",
    after: "이벤트 페이지에서 자동 수집",
  },
  {
    category: "선정·확정",
    before: "엑셀로 추첨, 카톡으로 개별 연락",
    after: "가중치 추첨 → 2단계 자동 확정",
  },
  {
    category: "노쇼 대응",
    before: "빈 좌석 그대로 방치",
    after: "웨이트리스트 자동 승격",
  },
  {
    category: "수익 모델",
    before: "초대권 = 비용",
    after: "보상형 광고(AdGate)로 수익 전환",
  },
  {
    category: "홍보 콘텐츠",
    before: "자체 제작 or 외주 비용 부담",
    after: "카드뉴스·숏폼 제작 포함",
  },
  {
    category: "현장 체크인",
    before: "종이 명단 or 전화번호 대조",
    after: "이름 + 번호 4자리 체크인 콘솔",
  },
  {
    category: "관객 데이터",
    before: "공연 끝나면 사라짐",
    after: "세그먼트·재방문 리스트 자동 축적",
  },
  {
    category: "성과 측정",
    before: "감에 의존",
    after: "채널별 UTM 전환 분석 리포트",
  },
]

export function ComparisonSection() {
  return (
    <section className="border-t border-border/40 py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-12 space-y-3 text-center">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            기존 방식 vs 알터즈
          </h2>
          <p className="mx-auto max-w-lg text-muted-foreground">
            공연 운영의 모든 단계에서 수작업을 자동화하고, 비용을 수익으로 전환합니다.
          </p>
        </div>

        {/* 비교 테이블 */}
        <div className="stage-panel overflow-hidden">
          {/* 테이블 헤더 */}
          <div className="grid grid-cols-[1fr_1fr_1fr] border-b border-border/40 bg-muted/50 sm:grid-cols-[140px_1fr_1fr]">
            <div className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              항목
            </div>
            <div className="flex items-center gap-2 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-red-500">
              <X className="h-3.5 w-3.5" />
              기존 방식
            </div>
            <div className="flex items-center gap-2 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-green-600">
              <Check className="h-3.5 w-3.5" />
              알터즈
            </div>
          </div>

          {/* 행 */}
          {ROWS.map((row, i) => (
            <div
              key={row.category}
              className={`grid grid-cols-[1fr_1fr_1fr] sm:grid-cols-[140px_1fr_1fr] ${
                i < ROWS.length - 1 ? "border-b border-border/20" : ""
              } transition-colors hover:bg-primary/[0.02]`}
            >
              <div className="px-4 py-3.5 text-sm font-semibold text-foreground">
                {row.category}
              </div>
              <div className="flex items-start gap-2 px-4 py-3.5">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-500" style={{ fontSize: 8 }}>
                  ✕
                </span>
                <span className="text-sm text-muted-foreground">{row.before}</span>
              </div>
              <div className="flex items-start gap-2 bg-green-50/30 px-4 py-3.5">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600" style={{ fontSize: 8 }}>
                  ✓
                </span>
                <span className="text-sm font-medium text-foreground">{row.after}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
