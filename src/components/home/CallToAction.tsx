import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function CallToAction() {
  return (
    <section className="bg-background">

      {/* 파트너 배너 — 어두운 밴드 */}
      <div
        className="relative overflow-hidden"
        style={{ background: "oklch(0.11 0.016 285)" }}
      >
        {/* 배경 글로우 */}
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            background: "radial-gradient(ellipse 60% 80% at 20% 50%, oklch(0.64 0.18 55 / 0.07) 0%, transparent 70%)",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="space-y-3">
              <p
                className="font-mono text-[11px] font-bold uppercase tracking-[0.2em]"
                style={{ color: "oklch(0.64 0.18 55 / 0.7)" }}
              >
                ✦ 파트너
              </p>
              <h2 className="font-serif text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
                공연단체이신가요?
              </h2>
              <p className="max-w-lg text-sm leading-relaxed text-white/50 sm:text-base">
                알터즈와 함께 공연을 SNS에 소개하고,
                더 많은 관객에게 닿을 수 있는 방법을 이야기해드립니다.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 lg:flex-col lg:items-end">
              <Link
                href="/services"
                className="group inline-flex h-12 items-center gap-2.5 px-7 text-[14px] font-bold text-black transition-all sm:h-13"
                style={{ background: "oklch(0.74 0.17 62)" }}
              >
                서비스 알아보기
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex h-12 items-center border border-white/20 px-7 text-[14px] font-bold text-white/60 transition hover:border-white/40 hover:text-white sm:h-13"
              >
                문의하기
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 에세이 CTA — 밝은 섹션 */}
      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
            <div>
              <p className="text-sm font-semibold text-foreground">
                알터즈 큐레이션 에세이 →
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                에디터가 직접 쓴 공연 이야기를 만나보세요.
              </p>
            </div>
            <Link
              href="/blog"
              className="inline-flex shrink-0 items-center gap-2 border-2 border-primary px-6 py-2.5 text-sm font-bold text-primary transition hover:bg-primary/5"
            >
              에세이 읽기
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

    </section>
  )
}
