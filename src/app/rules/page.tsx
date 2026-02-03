import Link from "next/link"

export const metadata = {
  title: "이용 규정 | Artause",
  description: "초대권 이벤트 응모 규정, 취소 정책, 출석 규정, 페널티 안내",
}

const rules = [
  {
    id: "apply",
    title: "응모 및 선정 규정",
    subtitle: "공정한 추첨을 위한 기본 원칙",
    items: [
      "1인 1회 응모: 이벤트 당 1회만 응모 가능합니다.",
      "무작위 추첨: 모든 선정은 공정한 무작위 추첨으로 진행됩니다.",
      "이메일 안내: 당첨자는 등록한 이메일로 안내됩니다.",
      "본인 확인: 공연 당일 본인 확인이 필요합니다.",
      "양도 불가: 당첨된 초대권은 양도할 수 없습니다.",
    ],
    tip: "정확한 연락처를 입력해 주세요. 당첨 안내를 받지 못하면 자동 취소될 수 있습니다.",
  },
  {
    id: "cancel",
    title: "취소 정책",
    subtitle: "응모 취소 및 변경 규정",
    items: [
      "공연일 3일 전까지 취소 가능",
      "3일 이내 취소 시 향후 응모 제한",
      "공연 날짜 및 좌석 변경 불가",
    ],
    tip: "예: 공연일이 11월 20일이면 11월 17일 23:59까지 취소 가능합니다.",
  },
  {
    id: "attendance",
    title: "출석 규정",
    subtitle: "공연 당일 필수 준수 사항",
    items: [
      "공연 시작 30분 전까지 도착",
      "신분증 지참 필수",
      "정상 출석 시 포인트 +5점",
      "노쇼 발생 시 포인트 -20점",
    ],
    tip: "노쇼 이력은 일정 기간 응모 제한으로 이어질 수 있습니다.",
  },
  {
    id: "penalty",
    title: "페널티 정책",
    subtitle: "포인트 및 제한 기준",
    items: [
      "포인트 60점 미만: 응모 제한",
      "연속 노쇼 3회 이상: 응모 제한",
      "페널티는 부과일부터 6개월 후 자동 해제",
    ],
    tip: "정상 참여가 포인트 복구에 가장 효과적입니다.",
  },
]

export default function RulesPage() {
  return (
    <div className="bg-gradient-to-b from-[#F7F4EC] via-white to-white pb-20 pt-10 text-foreground">
      <header className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-white/70 bg-white/80 p-8 text-center shadow-sm backdrop-blur md:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-primary">Rules</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">초대권 이벤트 이용 규정</h1>
          <p className="mt-3 text-base text-muted-foreground">
            공정하고 투명한 초대권 이벤트 운영을 위한 기본 규정입니다.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2 text-sm font-semibold text-muted-foreground">
            {rules.map((rule) => (
              <a
                key={rule.id}
                href={`#${rule.id}`}
                className="rounded-full border border-border/70 bg-white/70 px-4 py-2 transition hover:border-primary hover:text-primary"
              >
                {rule.title}
              </a>
            ))}
          </div>
        </div>
      </header>

      <section className="mx-auto mt-12 max-w-5xl space-y-6 px-4 sm:px-6 lg:px-8">
        {rules.map((rule) => (
          <article
            key={rule.id}
            id={rule.id}
            className="scroll-mt-24 rounded-3xl border border-border/60 bg-white p-6 shadow-sm md:p-8"
          >
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">규정</p>
              <h2 className="text-2xl font-bold text-foreground">{rule.title}</h2>
              <p className="text-sm text-muted-foreground">{rule.subtitle}</p>
            </div>

            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {rule.items.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1.5 h-2 w-2 rounded-full bg-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground">
              {rule.tip}
            </div>
          </article>
        ))}
      </section>

      <section className="mx-auto mt-12 max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-border/60 bg-white p-6 text-center shadow-sm">
          <h2 className="text-xl font-bold text-foreground">규정 확인은 필수입니다</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            이용 규정을 확인하셨다면 바로 초대권 이벤트에 응모해 보세요.
          </p>
          <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/events"
              className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 text-base font-semibold text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary/90"
            >
              진행 중 이벤트 보기
            </Link>
            <Link
              href="/events/guide"
              className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-white px-6 text-base font-semibold text-foreground transition hover:border-primary hover:text-primary"
            >
              응모 가이드 보기
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
