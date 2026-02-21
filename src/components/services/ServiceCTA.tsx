import Link from "next/link"
import { ArrowRight, Mail, MessageCircle, Clock } from "lucide-react"
import { companyMeta } from "@/constants/company"

const FORM_URL = process.env.NEXT_PUBLIC_PARTNER_FORM_URL ?? "/contact"

export function ServiceCTA() {
  return (
    <section className="relative overflow-hidden border-t border-border/40 py-20 md:py-28">
      {/* 배경 */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[700px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-radial from-primary/10 to-transparent blur-3xl" />
        <div className="absolute bottom-0 left-0 h-32 w-full bg-gradient-to-t from-primary/5 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* 중앙 정렬 헤딩 */}
        <div className="mb-10 text-center">
          <span className="cue mb-4 block">Ready? 🎟️</span>
          <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            이번 작품부터
            <br className="hidden sm:block" />
            공연을 수익으로 만들어보세요
          </h2>
          <p className="mx-auto max-w-xl text-lg leading-relaxed text-muted-foreground">
            초대권 자동화 · 보상형 광고 · SNS 콘텐츠 · 관객 CRM.
            <br className="hidden sm:block" />
            알터즈가 공연 운영의 새로운 기준을 만들어갑니다.
          </p>
        </div>

        {/* CTA 카드 */}
        <div className="stage-panel mx-auto max-w-2xl overflow-hidden">
          {/* 메인 CTA */}
          <div className="bg-primary/5 p-6 sm:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href={FORM_URL}
                target={FORM_URL.startsWith("http") ? "_blank" : undefined}
                rel={FORM_URL.startsWith("http") ? "noopener noreferrer" : undefined}
                data-cta="partner-apply-bottom"
                className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:scale-105 hover:shadow-xl hover:shadow-primary/30"
              >
                지금 신청하기
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/contact"
                data-cta="partner-contact-bottom"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-background px-8 py-4 text-base font-semibold text-foreground transition-all hover:border-primary/40 hover:bg-primary/5"
              >
                먼저 문의하기
              </Link>
            </div>

            {/* 퀵 팩트 */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3 w-3 text-primary" />
                신청 후 1~2 영업일 내 연락
              </span>
              <span className="hidden h-3 w-px bg-border sm:block" />
              <span>자료가 없어도 시작 가능</span>
              <span className="hidden h-3 w-px bg-border sm:block" />
              <span>단건 시범 운영부터 가능</span>
            </div>
          </div>

          {/* 연락 채널 */}
          <div className="flex flex-col divide-y divide-border/40 sm:flex-row sm:divide-x sm:divide-y-0">
            <a
              href={`mailto:${companyMeta.email}`}
              className="flex flex-1 items-center justify-center gap-2.5 px-6 py-4 text-sm text-muted-foreground transition-colors hover:bg-primary/5 hover:text-primary"
            >
              <Mail className="h-4 w-4" />
              {companyMeta.email}
            </a>
            <a
              href={companyMeta.instagramMain}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-2.5 px-6 py-4 text-sm text-muted-foreground transition-colors hover:bg-primary/5 hover:text-primary"
            >
              <MessageCircle className="h-4 w-4" />
              @artause_official DM
            </a>
            <div className="flex flex-1 items-center justify-center gap-2.5 px-6 py-4 text-sm text-muted-foreground">
              카카오채널: 준비 중
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
