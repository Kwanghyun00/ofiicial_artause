import { AlertCircle, ClipboardX, Database, BarChart2 } from "lucide-react"
import type { LucideIcon } from "lucide-react"

type Pain = {
  icon: LucideIcon
  num: string
  emoji: string
  title: string
  desc: string
  before: string
  after: string
  iconBg: string
  iconColor: string
}

const PAINS: Pain[] = [
  {
    icon: AlertCircle,
    num: "01",
    emoji: "😩",
    title: "노쇼·확정 번복",
    desc: "당일 결석, 뒤늦은 취소 통보. 공석이 생겨도 손쓸 시간이 없습니다.",
    before: "빈 좌석 그대로",
    after: "웨이트리스트 자동 승격",
    iconBg: "bg-red-50",
    iconColor: "text-red-500",
  },
  {
    icon: ClipboardX,
    num: "02",
    emoji: "📋",
    title: "운영 업무 과부하",
    desc: "명단 정리, 리마인드 발송, 현장 체크인까지. 초대권 하나에 하루가 사라집니다.",
    before: "담당자 수작업",
    after: "자동화 프로세스",
    iconBg: "bg-orange-50",
    iconColor: "text-orange-500",
  },
  {
    icon: Database,
    num: "03",
    emoji: "📂",
    title: "관객 데이터가 남지 않음",
    desc: "관람 후 관객 정보는 사라집니다. 다음 작품 때 그분들에게 먼저 알릴 방법이 없습니다.",
    before: "단발성 이벤트",
    after: "관객 자산으로 전환",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-500",
  },
  {
    icon: BarChart2,
    num: "04",
    emoji: "📊",
    title: "홍보 성과를 알 수 없음",
    desc: "어느 채널에서 신청이 왔는지, 어떤 콘텐츠가 효과적인지 데이터가 없습니다.",
    before: "감에 의존한 운영",
    after: "채널별 전환 분석",
    iconBg: "bg-purple-50",
    iconColor: "text-purple-500",
  },
]

export function PainPoints() {
  return (
    <section className="border-t border-border/40 py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-12 space-y-3 text-center">
          <span className="cue">Pain Points 🎭</span>
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            공연단체가 매번 겪는 4가지 문제
          </h2>
          <p className="mx-auto max-w-xl text-muted-foreground">
            초대권 하나를 운영하는 데 이렇게 많은 것이 소비됩니다.
          </p>
        </div>

        {/* 카드 그리드 */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PAINS.map((pain) => (
            <div
              key={pain.title}
              className="group stage-panel relative overflow-hidden p-5 transition-all hover:scale-[1.02] hover:shadow-lg"
            >
              {/* 번호 워터마크 */}
              <div className="pointer-events-none absolute right-3 top-2 select-none text-6xl font-black leading-none text-foreground/[0.04]">
                {pain.num}
              </div>

              {/* 아이콘 */}
              <div
                className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${pain.iconBg}`}
              >
                <pain.icon className={`h-6 w-6 ${pain.iconColor}`} />
              </div>

              {/* 제목 + 설명 */}
              <h3 className="mb-2 font-bold text-foreground">
                {pain.emoji} {pain.title}
              </h3>
              <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{pain.desc}</p>

              {/* Before / After 비교 */}
              <div className="space-y-1.5 border-t border-border/40 pt-4">
                <div className="flex items-center gap-2 text-xs">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-red-100 font-black text-red-500" style={{ fontSize: "9px" }}>
                    ✕
                  </span>
                  <span className="text-muted-foreground line-through">{pain.before}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-green-100 font-black text-green-600" style={{ fontSize: "9px" }}>
                    ✓
                  </span>
                  <span className="font-semibold text-foreground">{pain.after}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
