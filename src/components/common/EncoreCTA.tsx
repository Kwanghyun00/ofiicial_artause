"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { companyMeta } from "@/constants/company"

export function EncoreCTA() {
  return (
    <section className="px-4 pb-16 pt-8">
      <div className="mx-auto max-w-6xl">
        <div className="stage-panel relative overflow-hidden px-6 py-10 md:px-10">
          <div className="pointer-events-none absolute -left-10 top-6 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-14 bottom-4 h-40 w-40 rounded-full bg-accent/20 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-4">
              <span className="cue">Encore</span>
              <h2 className="text-3xl font-semibold text-foreground md:text-4xl">
                좋은 공연이, 제대로 보이도록.
              </h2>
              <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
                알터즈는 공연 홍보, 관객 커뮤니티, 디지털 전환을 하나의 무대 연출로 연결합니다.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Link
                href={companyMeta.promoForm}
                className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-[0_16px_40px_-24px_rgba(255,210,140,0.9)] transition hover:-translate-y-0.5 hover:bg-primary/90"
              >
                무료 홍보 신청
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link href="/contact" className="text-sm text-muted-foreground transition hover:text-primary">
                협업 문의 바로가기
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
