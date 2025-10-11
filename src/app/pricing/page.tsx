const membershipTiers = [
  {
    name: "Free",
    price: "₩0",
    headline: "기본 구독",
    description: "이벤트당 1회 응모와 광고가 포함된 기본 혜택입니다.",
    features: [
      "이벤트당 응모 1회",
      "디스플레이 스폰서 배너 노출",
      "이메일 알림",
    ],
  },
  {
    name: "Plus",
    price: "₩9,900 /월",
    headline: "추천 루프 확장",
    description: "추가 응모권과 조기 오픈 알림으로 친구 초대를 늘릴 수 있습니다.",
    features: [
      "이벤트당 추가 응모 1회",
      "광고 제거",
      "조기 오픈 6시간",
      "추천 코드 성과 리포트",
      "DM 2회 알림",
    ],
  },
  {
    name: "Pro",
    price: "₩19,900 /월",
    headline: "인플루언서 · 커뮤니티 운영자",
    description: "프리미엄 데이터 리포트와 Edge Function 기반 자동화 도구를 제공합니다.",
    features: [
      "이벤트당 추가 응모 2회",
      "조기 오픈 24시간",
      "캠페인 리포트 PDF",
      "CTR · 전환 지표 대시보드",
      "전용 운영 매니저",
    ],
  },
];

const automationHighlights = [
  "추첨 스케줄 자동 실행",
  "D+2 미체크 자동 취소",
  "유입 채널별 UTM 리포트",
  "추천 코드 가중치 설정",
];

const addOns = [
  {
    title: "리포트 번들",
    description: "월간 공연/이벤트 리포트를 PDF로 전달합니다.",
  },
  {
    title: "스폰서십 슬롯",
    description: "home_hero, home_mid 등 지정 슬롯에 브랜드 노출을 제공합니다.",
  },
  {
    title: "Edge Function 커스터마이징",
    description: "추첨/체크인 로직을 맞춤형으로 구성합니다.",
  },
];

export const metadata = {
  title: "멤버십 요금제",
  description: "Free/Plus/Pro 멤버십 혜택과 운영 자동화 옵션을 확인하세요.",
};

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <section className="rounded-3xl bg-indigo-950 p-10 text-white shadow-xl md:p-14">
        <p className="text-sm uppercase tracking-wide text-white/60">Membership</p>
        <h1 className="mt-3 text-3xl font-semibold md:text-4xl">Artause 멤버십 플랜</h1>
        <p className="mt-4 max-w-3xl text-base text-white/80 md:text-lg">
          Free/Plus/Pro 단계로 응모 횟수, 조기 오픈, 리포트 옵션이 확장됩니다. 팀 운영 규모에 맞춰 Edge Function 자동화를 더해 추첨·체크인·UTM 전환 분석까지 한 번에 연결하세요.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="mailto:membership@artause.com?subject=Artause%20Membership" className="btn-primary bg-white text-indigo-950 hover:bg-white/90">
            도입 상담 신청
          </a>
          <a href="/events" className="btn-secondary border-white/40 text-white hover:border-white/60 hover:text-white">
            이벤트 둘러보기
          </a>
        </div>
      </section>

      <section className="mt-14 grid gap-6 md:grid-cols-3">
        {membershipTiers.map((tier) => (
          <div key={tier.name} className="card flex h-full flex-col gap-4 p-8">
            <div>
              <p className="text-xs uppercase tracking-wide text-indigo-500">{tier.headline}</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">{tier.name}</h2>
              <p className="mt-2 text-3xl font-bold text-indigo-600">{tier.price}</p>
            </div>
            <p className="text-sm text-slate-600">{tier.description}</p>
            <ul className="space-y-2 text-sm text-slate-600">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <span className="mt-2 inline-block h-2 w-2 rounded-full bg-indigo-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <a href="mailto:membership@artause.com?subject=Artause%20Membership" className="btn-secondary mt-auto w-fit">
              플랜 문의
            </a>
          </div>
        ))}
      </section>

      <section className="mt-14 grid gap-6 md:grid-cols-2">
        <div className="card h-full space-y-4 p-8">
          <h2 className="text-xl font-semibold text-slate-900">자동화 포인트</h2>
          <p className="text-sm text-slate-600">추첨, 체크인, 추천 루프, 리포트 배포를 Edge Functions와 Supabase Realtime으로 자동화합니다.</p>
          <ul className="space-y-2 text-sm text-slate-600">
            {automationHighlights.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-2 inline-block h-2 w-2 rounded-full bg-indigo-500" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="card h-full space-y-4 p-8">
          <h2 className="text-xl font-semibold text-slate-900">Add-ons</h2>
          <p className="text-sm text-slate-600">필요에 따라 리포트, 스폰서십, 자동화 구성을 추가할 수 있습니다.</p>
          <ul className="space-y-3 text-sm text-slate-600">
            {addOns.map((addOn) => (
              <li key={addOn.title}>
                <p className="font-semibold text-slate-800">{addOn.title}</p>
                <p className="text-slate-600">{addOn.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-14">
        <div className="card space-y-4 bg-indigo-50 p-8">
          <h2 className="text-xl font-semibold text-indigo-900">결제 & 환불 정책</h2>
          <ul className="space-y-2 text-sm text-indigo-800">
            <li>PG 수수료는 카드/간편결제 기준 3~4%이며, 환불 발생 시 PG 정책을 따릅니다.</li>
            <li>멤버십은 매월 자동 갱신되며, 갱신일 24시간 전까지 취소하면 추가 수수료가 발생하지 않습니다.</li>
            <li>유료 플랜은 7일 온보딩 기간 동안 1회 환불을 지원합니다.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
