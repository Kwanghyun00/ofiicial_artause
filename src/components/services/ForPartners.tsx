import { Clock, TrendingDown, LayoutGrid, RefreshCw } from "lucide-react"
import type { LucideIcon } from "lucide-react"

type Benefit = {
  icon: LucideIcon
  title: string
  desc: string
  kpiLabel: string
  kpiValue: string
  bgClass: string
}

const BENEFITS: Benefit[] = [
  {
    icon: Clock,
    title: "운영시간 절감",
    desc: "명단 관리·리마인드·체크인 자동화로 담당자 부담이 크게 줄어듭니다",
    kpiLabel: "운영 시간",
    kpiValue: "–XX%",
    bgClass: "from-primary/10 to-primary/5",
  },
  {
    icon: TrendingDown,
    title: "노쇼 감소",
    desc: "2단계 확정 + D-3·D-1 리마인드로 실제 참석 의사를 사전에 검증합니다",
    kpiLabel: "노쇼율",
    kpiValue: "–XX%p",
    bgClass: "from-green-500/10 to-green-500/5",
  },
  {
    icon: LayoutGrid,
    title: "좌석 공백 최소화",
    desc: "웨이트리스트 자동 승격으로 취소가 생겨도 좌석이 채워집니다",
    kpiLabel: "좌석 충족률",
    kpiValue: "XX%",
    bgClass: "from-blue-500/10 to-blue-500/5",
  },
  {
    icon: RefreshCw,
    title: "재방문 관객 확보",
    desc: "관람 데이터가 쌓여 다음 작품 우선 알림 타겟 리스트를 바로 활용합니다",
    kpiLabel: "재방문 전환율",
    kpiValue: "XX%",
    bgClass: "from-purple-500/10 to-purple-500/5",
  },
]

const KPIS = [
  { label: "확정률", value: "XX%", desc: "선정 후 최종 확정 비율" },
  { label: "체크인율", value: "XX%", desc: "확정자 중 실제 관람 비율" },
  { label: "노쇼율", value: "X%", desc: "확정자 중 불참 비율" },
  { label: "후기 전환율", value: "XX%", desc: "관람 후 후기 작성 비율" },
]

export function ForPartners() {
  return (
    <section className="border-t border-border/40 py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-12 space-y-3 text-center">
          <span className="cue">For Partners 🎪</span>
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            공연단체가 실제로 얻는 것
          </h2>
          <p className="mx-auto max-w-xl text-muted-foreground">
            수치는 파트너 실제 운영 데이터 기반이며 업데이트 예정입니다.
          </p>
        </div>

        {/* 이점 카드 */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((b) => (
            <div
              key={b.title}
              className="group stage-panel relative overflow-hidden p-6 transition-all hover:scale-[1.02]"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${b.bgClass} opacity-70 transition-opacity group-hover:opacity-100`}
              />
              <div className="relative space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background/80 shadow-sm">
                  <b.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-3xl font-black text-primary">{b.kpiValue}</div>
                  <div className="text-xs text-muted-foreground">{b.kpiLabel}</div>
                </div>
                <div>
                  <h3 className="font-bold text-foreground">{b.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{b.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* KPI 기준표 */}
        <div className="mt-10 stage-panel overflow-hidden">
          <div className="border-b border-border/40 px-6 py-4">
            <h3 className="font-semibold text-foreground">핵심 KPI 기준표</h3>
            <p className="text-sm text-muted-foreground">
              실제 수치는 공연·이벤트마다 다르며, 운영 후 리포트로 제공됩니다
            </p>
          </div>
          <div className="grid divide-border/40 sm:grid-cols-4 sm:divide-x">
            {KPIS.map((kpi, i) => (
              <div
                key={kpi.label}
                className={`p-5 text-center ${i > 0 ? "border-t border-border/40 sm:border-t-0" : ""}`}
              >
                <div className="text-2xl font-black text-primary">{kpi.value}</div>
                <div className="mt-1 text-sm font-medium text-foreground">{kpi.label}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{kpi.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
