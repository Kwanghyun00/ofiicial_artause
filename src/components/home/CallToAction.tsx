import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"

export function CallToAction() {
  return (
    <section className="relative overflow-hidden border-t border-border/60 py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="stage-panel relative overflow-hidden px-6 py-10 text-center">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,210,140,0.18),_transparent_60%)]" />
          <div className="relative z-10 mx-auto max-w-3xl space-y-6">
            <span className="cue">
              <Sparkles className="h-3.5 w-3.5" />
              Encore
            </span>
            <h2 className="text-3xl font-semibold text-foreground md:text-5xl">
              공연 취향을 알면,
              <br />
              다음 공연이 찾아옵니다.
            </h2>
            <p className="text-lg text-muted-foreground">
              초대권 이벤트에 응모하고, 관람 후기를 남기면 취향에 맞는 공연을 먼저 알려드릴게요.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/events"
                className="inline-flex h-14 items-center justify-center rounded-full bg-primary px-8 text-lg font-semibold text-primary-foreground shadow-[0_18px_45px_-28px_rgba(255,210,140,0.9)] transition hover:-translate-y-1 hover:bg-primary/90"
              >
                초대권 이벤트 보기
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/shows"
                className="inline-flex h-14 items-center justify-center rounded-full border-2 border-border px-8 text-lg font-semibold text-foreground transition hover:border-primary hover:text-primary"
              >
                공연 검색하기
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              공연단체이신가요?{" "}
              <Link href="/services" className="font-semibold text-primary underline-offset-2 hover:underline">
                파트너 서비스 보기 →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
