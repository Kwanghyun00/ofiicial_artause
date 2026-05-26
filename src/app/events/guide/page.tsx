import Link from "next/link"

const steps = [
  {
    title: "이벤트 확인",
    description: "진행 중인 초대권 이벤트를 확인합니다.",
  },
  {
    title: "응모 정보 입력",
    description: "연락처/이메일을 입력하고 응모를 완료합니다.",
  },
  {
    title: "선정 및 발표",
    description: "추첨 후 당첨자는 이메일로 안내됩니다.",
  },
  {
    title: "관람 안내",
    description: "관람 일정 및 안내 사항을 확인합니다.",
  },
]

const notices = [
  "1인 1회 응모",
  "당첨자에게 이메일 안내",
  "당첨 후 양도 불가",
  "노쇼/취소 규정 준수",
]

export const metadata = {
  title: "초대권 응모 가이드",
  description: "초대권 이벤트 참여 과정을 한눈에 정리했습니다.",
}

export default function EventsGuidePage() {
  return (
    <div className="pb-24 pt-12 text-foreground">
      <section className="mx-auto max-w-5xl space-y-6 px-4 sm:px-6 lg:px-8">
        <div className="stage-panel p-8 text-center md:p-10">
          <span className="cue">Guide</span>
          <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">초대권 응모 가이드</h1>
          <p className="mt-3 text-base text-muted-foreground">
            초대권 이벤트 참여 과정을 한눈에 정리했습니다.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/invites"
              className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 text-base font-semibold text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary/90"
            >
              진행 중 이벤트 보기
            </Link>
            <Link
              href="/rules"
              className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-background/60 px-6 text-base font-semibold text-foreground transition hover:border-primary hover:text-primary"
            >
              자세한 규정 보기
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2">
          {steps.map((step, index) => (
            <article key={step.title} className="spotlight-card p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {index + 1}
                </span>
                <h2 className="text-lg font-semibold text-foreground">{step.title}</h2>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="spotlight-card p-6">
          <h2 className="text-xl font-semibold text-foreground">유의사항</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {notices.map((notice) => (
              <li
                key={notice}
                className="flex items-center gap-2 rounded-2xl border border-border/60 bg-background/60 px-4 py-3 text-sm text-muted-foreground"
              >
                <span className="h-2 w-2 rounded-full bg-primary" />
                {notice}
              </li>
            ))}
          </ul>
          <div className="mt-6 text-right">
            <Link href="/rules" className="text-sm font-semibold text-primary hover:text-primary/80">
              자세한 규정 보기
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
