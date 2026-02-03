import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"
import { companyMeta } from "@/constants/company"

export function CallToAction() {
  return (
    <section className="relative overflow-hidden border-t border-white/10 bg-primary py-16 text-primary-foreground">
      <div className="absolute inset-0 bg-[url('/abstract-geometric-flow.png')] opacity-10" />
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-6 text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold">
          <Sparkles className="h-4 w-4" />
          무료 홍보 신청 가능
        </span>
        <h2 className="text-3xl font-bold md:text-5xl">
          좋은 공연이,
          <br />
          관객에게 닿을 수 있도록.
        </h2>
        <p className="text-lg text-primary-foreground/80">
          알터즈와 함께 공연을 더 잘 보이게, 관객과 더 가깝게 만들어 보세요.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href={companyMeta.promoForm}
            className="inline-flex h-14 items-center justify-center rounded-full bg-white px-8 text-lg font-semibold text-primary shadow-2xl transition hover:-translate-y-1"
          >
            무료 홍보 신청
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
          <Link
            href="/contact"
            className="inline-flex h-14 items-center justify-center rounded-full border-2 border-white px-8 text-lg font-semibold text-white transition hover:bg-white/10"
          >
            협업 문의
          </Link>
        </div>
        <p className="text-sm text-primary-foreground/70">콘텐츠 제작 · 이벤트 운영 · 디지털 전환</p>
        </div>
      </div>
    </section>
  )
}
