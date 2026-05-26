import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"

const FORM_URL = process.env.NEXT_PUBLIC_PARTNER_FORM_URL ?? "/contact"

/* ── 미니 대시보드 프리뷰 ── */
function DashboardPreview() {
  return (
    <div className="stage-panel overflow-hidden text-xs shadow-xl">
      {/* 탑 바 */}
      <div className="flex items-center justify-between border-b border-border/40 bg-foreground/[0.02] px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-primary" />
          <span className="font-semibold text-foreground">이벤트 운영 현황</span>
        </div>
        <span className="rounded-full bg-green-100 px-2 py-0.5 text-green-700">진행 중</span>
      </div>

      {/* 지표 행 */}
      <div className="grid grid-cols-3 divide-x divide-border/20 border-b border-border/30">
        {[
          { label: "응모", value: "128", color: "text-foreground" },
          { label: "선정", value: "24", color: "text-green-600" },
          { label: "D-day", value: "D-3", color: "text-primary" },
        ].map((m) => (
          <div key={m.label} className="px-3 py-2.5 text-center">
            <div className={`text-lg font-black ${m.color}`}>{m.value}</div>
            <div className="text-muted-foreground">{m.label}</div>
          </div>
        ))}
      </div>

      {/* 최근 활동 로그 */}
      <div className="space-y-0 divide-y divide-border/10 px-4 py-2">
        {[
          { time: "방금", text: "신규 응모자 접수", badge: "응모", cls: "bg-primary/10 text-primary" },
          { time: "1시간 전", text: "당첨 이메일 24명 발송 완료", badge: "발송", cls: "bg-green-100 text-green-700" },
          { time: "어제", text: "이벤트 페이지 오픈됨", badge: "오픈", cls: "bg-slate-100 text-slate-600" },
        ].map((log) => (
          <div key={log.text} className="flex items-center gap-2 py-1.5">
            <span className="w-12 shrink-0 text-muted-foreground">{log.time}</span>
            <span className="flex-1 truncate text-foreground">{log.text}</span>
            <span className={`shrink-0 rounded px-1.5 py-0.5 font-semibold ${log.cls}`}>
              {log.badge}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ServiceHero() {
  return (
    <section className="relative overflow-hidden pb-8 pt-16 sm:pt-20 md:pb-12 md:pt-24">
      {/* 배경 */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-0 h-[500px] w-[500px] -translate-x-1/4 -translate-y-1/4 rounded-full bg-gradient-radial from-primary/12 to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 translate-x-1/4 rounded-full bg-gradient-radial from-accent/8 to-transparent blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-10 lg:flex-row lg:gap-14">
          {/* 왼쪽: 카피 */}
          <div className="flex-1 text-center lg:text-left">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-4 py-1.5 text-sm font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              공연단체를 위한 올인원 플랫폼
            </div>

            <h1 className="mb-5 text-[2.2rem] font-extrabold leading-[1.15] tracking-tight text-foreground sm:text-5xl lg:text-[3.5rem]">
              공연의 빈 좌석을
              <br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                수익과 관객
              </span>
              으로
              <br />
              채웁니다
            </h1>

            <p className="mx-auto mb-8 max-w-lg text-lg leading-relaxed text-muted-foreground lg:mx-0">
              초대권 이벤트 운영 · SNS 홍보 콘텐츠 · 공연 정보 노출.
              <br className="hidden sm:block" />
              <strong className="font-semibold text-foreground">
                빈 좌석을 채우는 가장 현실적인 방법
              </strong>
              을 제공합니다.
            </p>

            {/* CTA */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Link
                href={FORM_URL}
                target={FORM_URL.startsWith("http") ? "_blank" : undefined}
                rel={FORM_URL.startsWith("http") ? "noopener noreferrer" : undefined}
                data-cta="partner-apply"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:scale-105 hover:shadow-xl"
              >
                무료로 시작하기
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="#services"
                data-cta="partner-demo"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border/60 bg-background/80 px-7 py-4 text-base font-semibold text-foreground backdrop-blur-sm transition-all hover:border-primary/40 hover:bg-primary/5"
              >
                서비스 살펴보기
              </a>
            </div>

            <p className="mt-5 text-sm text-muted-foreground">
              설치 없음 · 무료 기본 플랜 · 신청 후 1~2일 내 시작
            </p>
          </div>

          {/* 오른쪽: 대시보드 프리뷰 */}
          <div className="w-full max-w-sm flex-shrink-0 lg:w-[400px]">
            <DashboardPreview />
          </div>
        </div>
      </div>
    </section>
  )
}
