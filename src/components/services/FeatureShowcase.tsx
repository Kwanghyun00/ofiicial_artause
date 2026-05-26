import Link from "next/link"
import { ArrowRight } from "lucide-react"

const FORM_URL = process.env.NEXT_PUBLIC_PARTNER_FORM_URL ?? "/contact"

/* ─── Feature 1: 이벤트 운영 현황 목업 ─── */
function EventMockup() {
  return (
    <div className="stage-panel overflow-hidden text-xs">
      <div className="flex items-center justify-between border-b border-border/40 bg-primary/5 px-4 py-2.5">
        <span className="font-semibold text-foreground">이벤트 운영 현황</span>
        <span className="rounded-full bg-green-100 px-2 py-0.5 text-green-700">진행 중</span>
      </div>

      <div className="space-y-2 px-4 py-3">
        {[
          { label: "응모 접수", value: "128명", color: "text-primary font-black" },
          { label: "추첨 완료", value: "24명 선정", color: "text-green-600 font-semibold" },
          { label: "당첨 안내 발송", value: "이메일 완료", color: "text-foreground font-medium" },
          { label: "미응답 재발송", value: "3명 대기", color: "text-amber-600 font-medium" },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between rounded-lg border border-border/20 px-3 py-2">
            <span className="text-muted-foreground">{item.label}</span>
            <span className={item.color}>{item.value}</span>
          </div>
        ))}
      </div>

      <div className="flex border-t border-border/40 bg-muted/30 text-center">
        <div className="flex-1 border-r border-border/20 px-3 py-2">
          <div className="font-black text-primary">128</div>
          <div className="text-muted-foreground">응모</div>
        </div>
        <div className="flex-1 border-r border-border/20 px-3 py-2">
          <div className="font-black text-green-600">24</div>
          <div className="text-muted-foreground">선정</div>
        </div>
        <div className="flex-1 px-3 py-2">
          <div className="font-black text-foreground">D-3</div>
          <div className="text-muted-foreground">마감</div>
        </div>
      </div>
    </div>
  )
}

/* ─── Feature 2: AdGate 보상형 광고 목업 (Coming Soon) ─── */
function AdGateMockup() {
  return (
    <div className="relative stage-panel overflow-hidden text-xs">
      {/* Coming Soon 오버레이 */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 backdrop-blur-[2px]">
        <span className="rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-bold text-blue-600">
          베타 준비 중
        </span>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          AdGate 보상형 광고 기능을 준비하고 있습니다
        </p>
      </div>

      <div className="flex items-center justify-between border-b border-border/40 bg-blue-50/60 px-4 py-2.5">
        <span className="font-semibold text-foreground">AdGate 응모 플로우</span>
        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-blue-700">예정</span>
      </div>

      <div className="space-y-2 px-4 py-3">
        <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white">1</span>
          <span className="flex-1 font-medium text-foreground">광고 시청 (15초)</span>
          <span className="font-semibold text-green-600">완료 ✓</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-[10px] font-bold text-white">2</span>
          <span className="flex-1 font-medium text-foreground">응모 자격 획득</span>
          <span className="font-semibold text-green-600">활성화</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">3</span>
          <span className="flex-1 font-medium text-foreground">초대권 응모 완료</span>
          <span className="font-semibold text-primary">접수됨</span>
        </div>
      </div>

      <div className="flex border-t border-border/40 bg-muted/30 text-center">
        <div className="flex-1 border-r border-border/20 px-3 py-2">
          <div className="font-black text-blue-600">324</div>
          <div className="text-muted-foreground">광고 시청</div>
        </div>
        <div className="flex-1 border-r border-border/20 px-3 py-2">
          <div className="font-black text-green-600">₩162K</div>
          <div className="text-muted-foreground">수익 발생</div>
        </div>
        <div className="flex-1 px-3 py-2">
          <div className="font-black text-primary">128</div>
          <div className="text-muted-foreground">응모 완료</div>
        </div>
      </div>
    </div>
  )
}

/* ─── Feature 3: SNS 콘텐츠 제작 목업 ─── */
function ContentMockup() {
  return (
    <div className="stage-panel overflow-hidden text-xs">
      <div className="flex items-center justify-between border-b border-border/40 bg-green-50/50 px-4 py-2.5">
        <span className="font-semibold text-foreground">콘텐츠 제작 현황</span>
        <span className="text-muted-foreground">이번 달</span>
      </div>

      <div className="space-y-2 px-4 py-3">
        {[
          { type: "카드뉴스", title: "은의 밤 관람 포인트 3선", status: "발행 완료", cls: "bg-green-100 text-green-700" },
          { type: "숏폼", title: "햄릿재판 하이라이트 30초", status: "제작중", cls: "bg-amber-100 text-amber-700" },
          { type: "카드뉴스", title: "이벤트 당첨자 발표", status: "발행 완료", cls: "bg-green-100 text-green-700" },
        ].map((item) => (
          <div key={item.title} className="flex items-center gap-3 rounded-lg border border-border/20 px-3 py-2.5">
            <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 font-semibold text-muted-foreground">
              {item.type}
            </span>
            <span className="flex-1 truncate font-medium text-foreground">{item.title}</span>
            <span className={`shrink-0 rounded-full px-2 py-0.5 font-semibold ${item.cls}`}>
              {item.status}
            </span>
          </div>
        ))}
      </div>

      <div className="flex border-t border-border/40 bg-muted/30 text-center">
        <div className="flex-1 border-r border-border/20 px-3 py-2">
          <div className="font-black text-green-600">12</div>
          <div className="text-muted-foreground">발행 완료</div>
        </div>
        <div className="flex-1 border-r border-border/20 px-3 py-2">
          <div className="font-black text-amber-600">3</div>
          <div className="text-muted-foreground">제작중</div>
        </div>
        <div className="flex-1 px-3 py-2">
          <div className="font-black text-primary">45K</div>
          <div className="text-muted-foreground">총 도달</div>
        </div>
      </div>
    </div>
  )
}

/* ─── 메인 Feature Showcase ─── */
type Feature = {
  tag: string
  tagColor: string
  title: string
  desc: string
  bullets: string[]
  mockup: React.ReactNode
  reverse?: boolean
}

const FEATURES: Feature[] = [
  {
    tag: "초대권 이벤트 운영",
    tagColor: "bg-primary/10 text-primary",
    title: "신청부터 당첨 안내까지\n알터즈가 대행합니다",
    desc: "이벤트 페이지 개설, 응모 접수, 추첨, 당첨자 이메일 발송까지. 공연단체의 수작업을 줄여드립니다.",
    bullets: [
      "알터즈 플랫폼에 이벤트 페이지 직접 개설",
      "공정한 추첨 및 선정 처리",
      "당첨·미당첨 이메일 안내 발송 대행",
    ],
    mockup: <EventMockup />,
  },
  {
    tag: "SNS 홍보 콘텐츠",
    tagColor: "bg-green-50 text-green-700",
    title: "공연의 매력을\n콘텐츠로 전달합니다",
    desc: "카드뉴스, 숏폼, 관람 포인트 큐레이션까지. 공연 홍보에 필요한 콘텐츠를 직접 제작합니다.",
    bullets: [
      "카드뉴스 · 숏폼 콘텐츠 직접 제작",
      "관람 포인트 큐레이션 & 메시지 구조화",
      "인스타그램 · 유튜브 · 블로그 맞춤 포맷",
    ],
    mockup: <ContentMockup />,
    reverse: true,
  },
  {
    tag: "보상형 광고 · 베타 준비 중",
    tagColor: "bg-amber-50 text-amber-700",
    title: "빈 좌석이\n광고 수익이 됩니다",
    desc: "관객은 광고를 시청하고 초대권에 응모합니다. 공연단체에는 광고 수익이 배분되는 새로운 모델을 준비 중입니다.",
    bullets: [
      "15초 광고 시청 → 응모 자격 부여",
      "응모 건당 수익 공연단체에 배분",
      "관객 참여 동기와 수익 모델을 동시에",
    ],
    mockup: <AdGateMockup />,
  },
]

export function FeatureShowcase() {
  return (
    <section id="features" className="border-t border-border/40 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-16 space-y-3 text-center">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            이렇게 작동합니다
          </h2>
          <p className="mx-auto max-w-lg text-muted-foreground">
            이벤트 운영부터 SNS 홍보까지, 공연단체가 관객과 만나는 모든 접점을 함께 만들어갑니다.
          </p>
        </div>

        {/* Feature 블록 3개 */}
        <div className="space-y-20 md:space-y-28">
          {FEATURES.map((feat) => (
            <div
              key={feat.title}
              className={`flex flex-col items-center gap-10 md:gap-14 ${
                feat.reverse ? "md:flex-row-reverse" : "md:flex-row"
              }`}
            >
              {/* 텍스트 */}
              <div className="flex-1 space-y-5">
                <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${feat.tagColor}`}>
                  {feat.tag}
                </span>
                <h3 className="whitespace-pre-line text-2xl font-extrabold leading-snug text-foreground sm:text-3xl">
                  {feat.title}
                </h3>
                <p className="text-base leading-relaxed text-muted-foreground">{feat.desc}</p>
                <ul className="space-y-2">
                  {feat.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm text-foreground">
                      <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600" style={{ fontSize: 8 }}>
                        ✓
                      </span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>

              {/* UI 목업 */}
              <div className="w-full max-w-sm flex-shrink-0 md:w-[380px]">
                {feat.mockup}
              </div>
            </div>
          ))}
        </div>

        {/* 중간 CTA */}
        <div className="mt-16 flex justify-center">
          <Link
            href={FORM_URL}
            target={FORM_URL.startsWith("http") ? "_blank" : undefined}
            rel={FORM_URL.startsWith("http") ? "noopener noreferrer" : undefined}
            data-cta="partner-apply-features"
            className="group inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105 hover:shadow-xl"
          >
            우리 공연에도 적용하기
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  )
}
