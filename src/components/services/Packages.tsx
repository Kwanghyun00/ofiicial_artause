import Link from "next/link"
import { Check, Minus } from "lucide-react"

const FORM_URL = process.env.NEXT_PUBLIC_PARTNER_FORM_URL ?? "/contact"

type Package = {
  name: string
  tag: string
  tagClass: string
  desc: string
  features: string[]
  excluded: string[]
  cta: string
  ctaKey: string
  highlight: boolean
}

const PACKAGES: Package[] = [
  {
    name: "Basic",
    tag: "기본",
    tagClass: "bg-slate-100 text-slate-600",
    desc: "초대권 이벤트를 처음 운영해보는 공연단체",
    features: [
      "알터즈 플랫폼 공연 정보 등록",
      "초대권 이벤트 페이지 개설",
      "응모 접수 및 추첨 운영",
      "당첨자 이메일 발송 대행",
      "이벤트 결과 리포트",
    ],
    excluded: [
      "SNS 홍보 콘텐츠 제작",
      "보상형 광고 AdGate (준비 중)",
    ],
    cta: "Basic 신청",
    ctaKey: "basic",
    highlight: false,
  },
  {
    name: "Partner",
    tag: "추천",
    tagClass: "bg-primary text-primary-foreground",
    desc: "SNS 홍보 콘텐츠까지 함께 운영하는 단체",
    features: [
      "Basic 전체 포함",
      "카드뉴스 · 숏폼 콘텐츠 제작",
      "인스타그램 · 유튜브 맞춤 포맷",
      "관람 포인트 큐레이션",
      "이벤트 인사이트 리포트",
      "보상형 광고 AdGate (베타 출시 시 우선 적용)",
    ],
    excluded: [],
    cta: "Partner 신청",
    ctaKey: "partner",
    highlight: true,
  },
]

export function Packages() {
  return (
    <section className="border-t border-border/40 py-16 md:py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-12 space-y-3 text-center">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            운영 규모에 맞는 플랜
          </h2>
          <p className="mx-auto max-w-xl text-muted-foreground">
            단건 이벤트부터 SNS 콘텐츠 제작까지. 모든 플랜은 상황에 맞게 조정 가능합니다.
          </p>
        </div>

        {/* 패키지 카드 */}
        <div className="grid gap-5 md:grid-cols-2">
          {PACKAGES.map((pkg) => (
            <div
              key={pkg.name}
              className={`relative flex flex-col stage-panel p-6 transition-all ${
                pkg.highlight
                  ? "border-primary/50 shadow-xl shadow-primary/10 ring-2 ring-primary/20 md:scale-[1.02]"
                  : "hover:border-border/60"
              }`}
            >
              {/* 추천 리본 */}
              {pkg.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="rounded-full bg-primary px-5 py-1.5 text-xs font-bold text-primary-foreground shadow-lg">
                    가장 많이 선택
                  </div>
                </div>
              )}

              {/* 플랜 헤더 */}
              <div className="mb-6 mt-1">
                <div className="mb-2 flex items-center gap-2">
                  <h3 className="text-2xl font-black text-foreground">{pkg.name}</h3>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${pkg.tagClass}`}>
                    {pkg.tag}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{pkg.desc}</p>

                {/* 가격 영역 */}
                <div className="mt-4 rounded-xl border border-border/40 bg-muted/40 px-4 py-3">
                  <span className="text-sm font-semibold text-foreground">가격 </span>
                  <span className="text-sm text-muted-foreground">상담 후 확정</span>
                </div>
              </div>

              {/* 기능 목록 */}
              <ul className="mb-6 flex-1 space-y-2.5">
                {pkg.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                    <span className="text-foreground">{f}</span>
                  </li>
                ))}
                {pkg.excluded.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm opacity-35">
                    <Minus className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={FORM_URL}
                target={FORM_URL.startsWith("http") ? "_blank" : undefined}
                rel={FORM_URL.startsWith("http") ? "noopener noreferrer" : undefined}
                data-cta={`partner-apply-${pkg.ctaKey}`}
                className={`block rounded-2xl px-5 py-3.5 text-center text-sm font-semibold transition-all hover:scale-[1.02] ${
                  pkg.highlight
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30"
                    : "border border-border bg-background text-foreground hover:border-primary/40 hover:bg-primary/5"
                }`}
              >
                {pkg.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          어떤 플랜이 맞는지 모르겠다면{" "}
          <Link
            href="/contact"
            className="font-semibold text-primary underline underline-offset-2 hover:opacity-80"
          >
            먼저 문의하기
          </Link>
          로 편하게 연락 주세요.
        </p>
      </div>
    </section>
  )
}
