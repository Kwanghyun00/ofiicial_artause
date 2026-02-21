import Link from "next/link"
import { ArrowRight } from "lucide-react"

const FORM_URL = process.env.NEXT_PUBLIC_PARTNER_FORM_URL ?? "/contact"

/* ─── Feature 1: 체크인 콘솔 목업 ─── */
function CheckinMockup() {
  const guests = [
    { name: "김*연", phone: "5678", status: "checked-in" as const },
    { name: "이*호", phone: "1234", status: "checked-in" as const },
    { name: "박*수", phone: "9012", status: "pending" as const },
    { name: "정*아", phone: "3456", status: "no-show" as const },
  ]

  return (
    <div className="stage-panel overflow-hidden text-xs">
      <div className="flex items-center justify-between border-b border-border/40 bg-primary/5 px-4 py-2.5">
        <span className="font-semibold text-foreground">체크인 콘솔</span>
        <span className="rounded-full bg-green-100 px-2 py-0.5 text-green-700">LIVE</span>
      </div>
      <div className="border-b border-border/20 px-4 py-2">
        <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-1.5 text-muted-foreground">
          <span>🔍</span>
          <span>성함 또는 전화번호 뒤 4자리</span>
        </div>
      </div>
      <div className="divide-y divide-border/20">
        {guests.map((g) => (
          <div key={g.name} className="flex items-center justify-between px-4 py-2">
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">{g.name}</span>
              <span className="text-muted-foreground">···{g.phone}</span>
            </div>
            <span
              className={`rounded-full px-2 py-0.5 font-semibold ${
                g.status === "checked-in"
                  ? "bg-green-100 text-green-700"
                  : g.status === "no-show"
                    ? "bg-red-100 text-red-600"
                    : "bg-slate-100 text-slate-500"
              }`}
            >
              {g.status === "checked-in" ? "관람 확인" : g.status === "no-show" ? "노쇼" : "대기"}
            </span>
          </div>
        ))}
      </div>
      <div className="flex border-t border-border/40 bg-muted/30">
        <div className="flex-1 border-r border-border/20 px-4 py-2 text-center">
          <div className="font-black text-green-600">2</div>
          <div className="text-muted-foreground">체크인</div>
        </div>
        <div className="flex-1 border-r border-border/20 px-4 py-2 text-center">
          <div className="font-black text-slate-500">1</div>
          <div className="text-muted-foreground">대기</div>
        </div>
        <div className="flex-1 px-4 py-2 text-center">
          <div className="font-black text-red-500">1</div>
          <div className="text-muted-foreground">노쇼</div>
        </div>
      </div>
    </div>
  )
}

/* ─── Feature 2: AdGate 보상형 광고 목업 ─── */
function AdGateMockup() {
  return (
    <div className="stage-panel overflow-hidden text-xs">
      <div className="flex items-center justify-between border-b border-border/40 bg-blue-50/60 px-4 py-2.5">
        <span className="font-semibold text-foreground">AdGate 응모 플로우</span>
        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-blue-700">NEW</span>
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

/* ─── Feature 4: 관객 세그먼트 목업 ─── */
function SegmentMockup() {
  const segments = [
    { label: "신규 관객", count: 45, pct: 56, color: "bg-blue-500" },
    { label: "재방문", count: 22, pct: 28, color: "bg-green-500" },
    { label: "리뷰 작성자", count: 8, pct: 10, color: "bg-purple-500" },
    { label: "노쇼 위험", count: 5, pct: 6, color: "bg-red-400" },
  ]

  return (
    <div className="stage-panel overflow-hidden text-xs">
      <div className="flex items-center justify-between border-b border-border/40 bg-purple-50/50 px-4 py-2.5">
        <span className="font-semibold text-foreground">관객 세그먼트</span>
        <span className="text-muted-foreground">총 80명</span>
      </div>

      <div className="space-y-3 px-4 py-3">
        {segments.map((seg) => (
          <div key={seg.label}>
            <div className="mb-1 flex items-center justify-between">
              <span className="font-medium text-foreground">{seg.label}</span>
              <span className="text-muted-foreground">
                {seg.count}명 ({seg.pct}%)
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div className={`h-full rounded-full ${seg.color}`} style={{ width: `${seg.pct}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-border/40 bg-muted/30 px-4 py-2.5 text-center text-muted-foreground">
        다음 작품 우선 알림 대상: <span className="font-semibold text-primary">30명</span>
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
    tag: "초대권 자동화",
    tagColor: "bg-primary/10 text-primary",
    title: "초대권 운영,\n5초 체크인까지",
    desc: "신청 접수 → 선정·확정 → 웨이트리스트 승격 → 현장 체크인. 수작업이 사라집니다.",
    bullets: [
      "이름/번호 검색으로 빠른 현장 인증",
      "미응답 시 웨이트리스트 자동 승격",
      "D-3·D-1 리마인드 자동 발송",
    ],
    mockup: <CheckinMockup />,
  },
  {
    tag: "보상형 광고",
    tagColor: "bg-blue-50 text-blue-700",
    title: "빈 좌석이\n광고 수익이 됩니다",
    desc: "관객은 광고를 시청하고 초대권에 응모합니다. 공연단체에는 광고 수익이 배분됩니다.",
    bullets: [
      "15초 광고 시청 → 응모 자격 부여",
      "응모 건당 수익 배분",
      "관객 참여 동기와 수익 모델을 동시에",
    ],
    mockup: <AdGateMockup />,
    reverse: true,
  },
  {
    tag: "SNS 콘텐츠",
    tagColor: "bg-green-50 text-green-700",
    title: "공연의 매력을\n콘텐츠로 전달합니다",
    desc: "카드뉴스, 숏폼, 관람 포인트 큐레이션까지. 공연 홍보에 필요한 콘텐츠를 제작합니다.",
    bullets: [
      "카드뉴스 · 숏폼 콘텐츠 제작",
      "관람 포인트 큐레이션 & 메시지 구조화",
      "채널별(인스타·유튜브·블로그) 맞춤 포맷",
    ],
    mockup: <ContentMockup />,
  },
  {
    tag: "관객 CRM",
    tagColor: "bg-purple-50 text-purple-700",
    title: "관객이 데이터로\n남습니다",
    desc: "관람 이후에도 관객 데이터가 축적되어 다음 작품 마케팅에 바로 활용됩니다.",
    bullets: [
      "신규 / 재방문 / 리뷰어 / 노쇼위험 자동 분류",
      "다음 작품 우선 알림 타겟 리스트 제공",
      "공연별 인사이트 리포트 (확정률·체크인율·노쇼율)",
    ],
    mockup: <SegmentMockup />,
    reverse: true,
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
            각 서비스가 하나의 워크플로우로 연결되어 공연 운영 전체를 커버합니다.
          </p>
        </div>

        {/* Feature 블록 4개 */}
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
