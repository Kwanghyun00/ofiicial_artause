import {
  CheckCircle2,
  Users,
  Bell,
  MapPin,
  PieChart,
  ShieldAlert,
  UserCheck,
  Repeat,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

type Feature = {
  icon: LucideIcon
  emoji: string
  title: string
  desc: string
  badge: string
  badgeClass: string
  featured?: boolean
}

const FEATURES: Feature[] = [
  {
    icon: CheckCircle2,
    emoji: "✅",
    title: "2단계 확정 시스템",
    desc: "선정(Shortlist) → 확정(Confirmed) 분리로 실제 참석 의사를 두 번 검증합니다. 무응답은 자동 취소 후 웨이트리스트 승격.",
    badge: "핵심 기능",
    badgeClass: "bg-primary text-primary-foreground",
    featured: true,
  },
  {
    icon: Users,
    emoji: "⬆️",
    title: "웨이트리스트 자동 승격",
    desc: "취소·노쇼 발생 시 대기자가 즉시 자동으로 승격됩니다. 빈 좌석을 사람이 직접 관리하지 않아도 채워집니다.",
    badge: "핵심 기능",
    badgeClass: "bg-primary text-primary-foreground",
    featured: true,
  },
  {
    icon: MapPin,
    emoji: "📍",
    title: "현장 체크인 콘솔",
    desc: "성함 + 휴대폰 뒤 4자리로 빠른 현장 인증. 미확인·노쇼를 실시간으로 처리하고 자동 기록합니다.",
    badge: "현장 운영",
    badgeClass: "bg-accent/80 text-accent-foreground",
  },
  {
    icon: UserCheck,
    emoji: "🪪",
    title: "관객 상태값 관리",
    desc: "Applied → Selected → Confirmed → Attended / No-show → Reviewed. 관객 여정 전체를 단계별 추적합니다.",
    badge: "데이터",
    badgeClass: "bg-blue-500/10 text-blue-600",
  },
  {
    icon: PieChart,
    emoji: "🎯",
    title: "관객 세그먼트",
    desc: "신규 / 재방문 / 리뷰 작성자 / 노쇼 위험군으로 자동 분류. 다음 작품 우선 알림 타겟 리스트를 제공합니다.",
    badge: "인사이트",
    badgeClass: "bg-purple-500/10 text-purple-600",
  },
  {
    icon: Bell,
    emoji: "🔔",
    title: "리마인드 메시지 템플릿",
    desc: "D-3·D-1·당일 리마인드 발송 템플릿 제공. 카카오 알림톡/문자 자동화 연동 Growth 이상 지원 예정.",
    badge: "커뮤니케이션",
    badgeClass: "bg-green-500/10 text-green-600",
  },
  {
    icon: Repeat,
    emoji: "🔁",
    title: "재방문 캠페인 (옵션)",
    desc: "이전 관람자 세그먼트에 다음 작품 이벤트를 우선 발송. 신규 관객 획득 비용을 줄이고 팬덤을 키웁니다.",
    badge: "Growth",
    badgeClass: "bg-orange-500/10 text-orange-600",
  },
  {
    icon: ShieldAlert,
    emoji: "🛡️",
    title: "보증금/페널티 정책 (옵션)",
    desc: "노쇼 방지 보증금, 누적 노쇼 신청 제한 정책을 공연 성격에 맞게 커스터마이즈할 수 있습니다.",
    badge: "운영 옵션",
    badgeClass: "bg-slate-500/10 text-slate-600",
  },
]

export function CoreFeatures() {
  const featuredFeatures = FEATURES.filter((f) => f.featured)
  const regularFeatures = FEATURES.filter((f) => !f.featured)

  return (
    <section className="border-t border-border/40 bg-primary/3 py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-12 space-y-3 text-center">
          <span className="cue">Features 🔧</span>
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            초대권 운영에 필요한 것,
            <br className="hidden sm:block" />
            전부 있습니다
          </h2>
          <p className="mx-auto max-w-xl text-muted-foreground">
            선정부터 체크인, 재방문 캠페인까지 하나의 워크플로우로 연결됩니다.
          </p>
        </div>

        {/* 핵심 기능 — 2단 강조 카드 */}
        <div className="mb-5 grid gap-5 sm:grid-cols-2">
          {featuredFeatures.map((feat) => (
            <div
              key={feat.title}
              className="group stage-panel relative overflow-hidden p-6 transition-all hover:scale-[1.01] hover:border-primary/40 hover:shadow-lg"
            >
              {/* 배경 그라데이션 강조 */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

              <div className="relative flex gap-4">
                {/* 아이콘 */}
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-3xl">
                  {feat.emoji}
                </div>

                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <h3 className="font-bold text-foreground">{feat.title}</h3>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${feat.badgeClass}`}
                    >
                      {feat.badge}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">{feat.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 일반 기능 — 4열 그리드 */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {regularFeatures.map((feat) => (
            <div
              key={feat.title}
              className="group stage-panel flex flex-col gap-3 p-5 transition-all hover:scale-[1.02] hover:border-primary/30"
            >
              {/* 아이콘 + 배지 */}
              <div className="flex items-start justify-between gap-2">
                <div className="rounded-xl bg-primary/10 p-2.5">
                  <feat.icon className="h-5 w-5 text-primary" />
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${feat.badgeClass}`}
                >
                  {feat.badge}
                </span>
              </div>

              {/* 텍스트 */}
              <div>
                <h3 className="mb-1 text-sm font-bold text-foreground">
                  {feat.emoji} {feat.title}
                </h3>
                <p className="text-xs leading-relaxed text-muted-foreground">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
