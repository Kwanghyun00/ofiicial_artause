import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function CallToAction() {
  return (
    <section className="relative overflow-hidden py-16 lg:py-24">
      {/* 배경 그라데이션 */}
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 80% 60% at 50% 0%, oklch(0.64 0.18 55 / 0.1) 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* 가로 구분선 with 레이블 */}
        <div className="mb-12 flex items-center gap-4">
          <div className="h-px flex-1 bg-border/60" />
          <span className="cue">Encore</span>
          <div className="h-px flex-1 bg-border/60" />
        </div>

        {/* 메인 콘텐츠 */}
        <div className="text-center">
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl md:text-5xl">
            공연 취향을 알면,
            <br />
            <span className="gradient-text">다음 공연이 찾아옵니다.</span>
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
            초대권 이벤트에 응모하고, 관람 후기를 남기면
            취향에 맞는 공연을 먼저 알려드릴게요.
          </p>

          {/* CTA 버튼 */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/invites"
              className="inline-flex h-13 items-center justify-center gap-2 rounded-full bg-primary px-8 text-base font-bold text-primary-foreground shadow-stage transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-xl sm:h-14"
              style={{ transitionTimingFunction: "var(--ease-out-expo)" }}
            >
              초대권 이벤트 보기
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/shows"
              className="inline-flex h-13 items-center justify-center rounded-full border-2 border-border px-8 text-base font-bold text-foreground transition hover:border-primary/60 hover:text-primary sm:h-14"
            >
              공연 검색하기
            </Link>
          </div>

          {/* 파트너 링크 */}
          <p className="mt-6 text-sm text-muted-foreground">
            공연단체이신가요?{" "}
            <Link
              href="/services"
              className="font-semibold text-primary underline-offset-2 hover:underline"
            >
              파트너 서비스 보기 →
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}
