type Testimonial = {
  quote: string
  name: string
  role: string
  kpi: string
  kpiDetail: string
  emoji: string
  accentBg: string
  accentText: string
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "노쇼가 눈에 띄게 줄었어요. 리마인드 메시지 덕분에 확정자 중 실제로 오는 비율이 훨씬 높아졌고, 현장 체크인도 훨씬 빨라졌습니다.",
    name: "[공연단체명] 홍보 담당자",
    role: "대학로 연극 기획사",
    kpi: "노쇼율",
    kpiDetail: "–XX%p",
    emoji: "🎭",
    accentBg: "bg-red-50",
    accentText: "text-red-600",
  },
  {
    quote:
      "명단 관리가 진짜 편해졌어요. 예전엔 엑셀로 직접 했는데 이제는 담당자가 정리해서 보내줘서 저는 현장에만 집중할 수 있었어요.",
    name: "[공연단체명] 대표",
    role: "소극장 뮤지컬",
    kpi: "운영 시간",
    kpiDetail: "–X시간",
    emoji: "🎵",
    accentBg: "bg-blue-50",
    accentText: "text-blue-600",
  },
  {
    quote:
      "다음 작품 홍보 때 이전 관람객 리스트가 있으니까 출발점이 달랐어요. 재방문 관객 비율이 이전보다 확실히 높아졌습니다.",
    name: "[공연단체명] 마케터",
    role: "창작 무용 단체",
    kpi: "재방문",
    kpiDetail: "+XX%",
    emoji: "💃",
    accentBg: "bg-purple-50",
    accentText: "text-purple-600",
  },
]

export function ServiceTestimonials() {
  return (
    <section className="border-t border-border/40 bg-primary/3 py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-12 space-y-3 text-center">
          <span className="cue">Testimonials 🌟</span>
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">파트너 후기</h2>
          <p className="text-sm text-muted-foreground">
            실제 운영 단체의 경험입니다. 명칭과 수치는 운영 후 업데이트됩니다.
          </p>
        </div>

        {/* 카드 */}
        <div className="grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={i}
              className="stage-panel flex flex-col gap-0 overflow-hidden transition-all hover:border-primary/30 hover:shadow-md"
            >
              {/* KPI 상단 띠 */}
              <div className={`flex items-center justify-between px-5 py-3 ${t.accentBg}`}>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{t.emoji}</span>
                  <span className={`text-xs font-semibold ${t.accentText}`}>{t.role}</span>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-black ${t.accentText}`}>{t.kpiDetail}</div>
                  <div className="text-xs text-muted-foreground">{t.kpi}</div>
                </div>
              </div>

              {/* 인용 + 작성자 */}
              <div className="flex flex-1 flex-col justify-between gap-4 p-5">
                <blockquote className="text-sm leading-relaxed text-muted-foreground">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <div className="border-t border-border/40 pt-3">
                  <span className="text-sm font-semibold text-foreground">{t.name}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
