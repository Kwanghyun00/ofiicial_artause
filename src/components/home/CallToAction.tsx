import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"

export function CallToAction() {
  return (
    <section className="relative overflow-hidden rounded-[32px] bg-primary px-8 py-16 text-primary-foreground shadow-2xl md:px-12">
      <div className="absolute inset-0 bg-[url('/abstract-geometric-flow.png')] opacity-10" />
      <div className="relative z-10 mx-auto max-w-3xl space-y-6 text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold">
          <Sparkles className="h-4 w-4" />
          지인 추천 시 당첨률 2배
        </span>
        <h2 className="text-3xl font-bold md:text-5xl">
          특별한 문화 경험,
          <br />
          지금 바로 시작하세요
        </h2>
        <p className="text-lg text-primary-foreground/80">
          무료 회원 가입만 해도 매주 12개의 초대 이벤트를 신청할 수 있어요. 카드 등록 없이 가볍게 시작해 보세요.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/events"
            className="inline-flex h-14 items-center justify-center rounded-full bg-white px-8 text-lg font-semibold text-primary shadow-2xl transition hover:-translate-y-1"
          >
            무료로 시작하기
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
          <Link
            href="/rules"
            className="inline-flex h-14 items-center justify-center rounded-full border-2 border-white px-8 text-lg font-semibold text-white transition hover:bg-white/10"
          >
            이용 안내 보기
          </Link>
        </div>
        <p className="text-sm text-primary-foreground/70">신용카드 등록 불필요 · 기본 이용 무료</p>
      </div>
    </section>
  )
}
