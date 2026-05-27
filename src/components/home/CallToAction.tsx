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
            공연 이야기를
            <br />
            <span className="gradient-text">알터즈에서 만나보세요.</span>
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
            에디터가 직접 큐레이션한 공연 에세이와
            알터즈가 주목하는 공연들을 소개합니다.
          </p>

          {/* CTA 버튼 */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/blog"
              className="inline-flex h-13 items-center justify-center gap-2 rounded-full bg-primary px-8 text-base font-bold text-primary-foreground shadow-stage transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-xl sm:h-14"
              style={{ transitionTimingFunction: "var(--ease-out-expo)" }}
            >
              큐레이션 에세이 읽기
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="https://smartstore.naver.com/artause"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-13 items-center justify-center rounded-full border-2 border-border px-8 text-base font-bold text-foreground transition hover:border-primary/60 hover:text-primary sm:h-14"
            >
              알터즈숍 보기
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
