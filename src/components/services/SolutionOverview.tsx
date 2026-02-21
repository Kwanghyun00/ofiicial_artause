const PIPELINE = [
  {
    step: "01",
    label: "신청",
    desc: "관객이 이벤트에 응모",
    emoji: "📝",
    color: "bg-slate-100 text-slate-700",
    dotColor: "bg-slate-400",
  },
  {
    step: "02",
    label: "선정",
    desc: "가중치 기반 추첨",
    emoji: "🎲",
    color: "bg-blue-50 text-blue-700",
    dotColor: "bg-blue-400",
  },
  {
    step: "03",
    label: "확정",
    desc: "2단계 참석 확인",
    emoji: "✅",
    color: "bg-green-50 text-green-700",
    dotColor: "bg-green-400",
  },
  {
    step: "04",
    label: "리마인드",
    desc: "D-3·D-1 자동 알림",
    emoji: "🔔",
    color: "bg-amber-50 text-amber-700",
    dotColor: "bg-amber-400",
  },
  {
    step: "05",
    label: "체크인",
    desc: "현장 인증 처리",
    emoji: "📍",
    color: "bg-primary/10 text-primary",
    dotColor: "bg-primary",
  },
  {
    step: "06",
    label: "리포트",
    desc: "관객 데이터 축적",
    emoji: "📊",
    color: "bg-purple-50 text-purple-700",
    dotColor: "bg-purple-400",
  },
]

const STATUS_TAGS = [
  { label: "Applied", bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400" },
  { label: "Selected", bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-400" },
  { label: "Confirmed", bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" },
  { label: "Attended", bg: "bg-primary/10", text: "text-primary", dot: "bg-primary" },
  { label: "No-show", bg: "bg-red-100", text: "text-red-600", dot: "bg-red-400" },
  { label: "Reviewed", bg: "bg-purple-100", text: "text-purple-700", dot: "bg-purple-400" },
]

export function SolutionOverview() {
  return (
    <section id="features" className="border-t border-border/40 py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-12 space-y-3 text-center">
          <span className="cue">Solution ✨</span>
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            신청부터 재방문까지,
            <br className="hidden sm:block" />
            하나의 파이프라인으로
          </h2>
          <p className="mx-auto max-w-xl text-muted-foreground">
            각 단계마다 관객 상태가 자동으로 기록되고,
            다음 작품 마케팅 데이터로 그대로 활용됩니다.
          </p>
        </div>

        {/* 파이프라인 2×3 그리드 */}
        <div className="relative mb-8">
          {/* 연결선 (desktop) */}
          <div className="absolute left-0 right-0 top-9 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent lg:block" />

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 lg:gap-3">
            {PIPELINE.map((item) => (
              <div key={item.step} className="group relative flex flex-col items-center text-center">
                {/* 스텝 원 */}
                <div
                  className={`relative z-10 mb-3 flex h-[72px] w-[72px] flex-col items-center justify-center rounded-2xl border-2 border-border/30 shadow-sm transition-all group-hover:scale-110 group-hover:shadow-md ${item.color}`}
                >
                  <span className="text-2xl leading-none">{item.emoji}</span>
                  <span className="mt-1 text-[10px] font-bold opacity-60">STEP {item.step}</span>
                </div>

                {/* 라벨 */}
                <span className="mb-1 text-sm font-bold text-foreground">{item.label}</span>
                <span className="text-xs leading-snug text-muted-foreground">{item.desc}</span>

                {/* 모바일용 화살표 (마지막 열 제외) */}
                {parseInt(item.step) % 3 !== 0 && (
                  <div className="absolute right-0 top-8 hidden h-px w-3 translate-x-full bg-border sm:block lg:hidden" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 관객 상태값 박스 */}
        <div className="stage-panel overflow-hidden">
          <div className="border-b border-border/40 bg-primary/3 px-6 py-4">
            <p className="text-sm font-semibold text-foreground">
              관객 상태값 — 모든 전환이 타임스탬프와 함께 기록됩니다
            </p>
          </div>
          <div className="flex flex-wrap gap-3 px-6 py-5">
            {STATUS_TAGS.map((tag) => (
              <span
                key={tag.label}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium ${tag.bg} ${tag.text}`}
              >
                <span className={`h-2 w-2 rounded-full ${tag.dot}`} />
                {tag.label}
              </span>
            ))}
          </div>
          <div className="border-t border-border/40 px-6 py-3 text-xs text-muted-foreground">
            상태 전환 시 자동으로 웨이트리스트 승격·알림 발송이 트리거됩니다
          </div>
        </div>
      </div>
    </section>
  )
}
