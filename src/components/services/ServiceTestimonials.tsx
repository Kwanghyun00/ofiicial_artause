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
      "이벤트 페이지 만들고 추첨까지 알아서 해줘서 저는 공연 준비에만 집중할 수 있었어요. 응모자 관리가 이렇게 편할 줄 몰랐습니다.",
    name: "소극장 연극 기획사 대표",
    role: "대학로 연극",
    kpi: "운영 부담",
    kpiDetail: "대폭 감소",
    emoji: "🎭",
    accentBg: "bg-red-50",
    accentText: "text-red-600",
  },
  {
    quote:
      "카드뉴스랑 릴스를 직접 만들어줘서 SNS 홍보가 훨씬 수월했어요. 팔로워 반응도 좋았고 공연 전부터 분위기가 달라졌습니다.",
    name: "창작 뮤지컬 단체 홍보 담당자",
    role: "소극장 뮤지컬",
    kpi: "SNS 반응",
    kpiDetail: "눈에 띄게 향상",
    emoji: "🎵",
    accentBg: "bg-blue-50",
    accentText: "text-blue-600",
  },
  {
    quote:
      "알터즈에 공연 정보 등록했더니 초대권 이벤트랑 자연스럽게 연결돼서 새 관객들이 찾아왔어요. 플랫폼 노출 효과를 체감했습니다.",
    name: "창작 무용 단체 대표",
    role: "창작 무용",
    kpi: "신규 관객",
    kpiDetail: "꾸준히 유입",
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
            알터즈와 함께한 공연단체들의 실제 경험입니다.
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
                  <div className={`text-sm font-bold ${t.accentText}`}>{t.kpiDetail}</div>
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
