const funnelSteps = [
  {
    title: "Intro-first",
    summary: "첫 방문자의 맥락 확보",
    items: [
      "스크롤 60% 이상 또는 체류 5초 중 하나 충족",
      "조건 충족 후 24시간 동안 introSeen=true 캐시",
      "조건 미충족 시 /apply 요청에 412 (PRECONDITION) 응답",
    ],
  },
  {
    title: "AdGate",
    summary: "스폰서 캠페인 검증",
    items: [
      "utm_campaign 파라미터 필수",
      "허용 도메인(화이트리스트)만 랜딩 허용",
      "체류 5초 + 24시간 TTL, Edge Function 로그로 감사",
    ],
  },
  {
    title: "응모",
    summary: "응모 폼과 서류 체크",
    items: [
      "카카오 로그인 세션 필수, 이메일·비밀번호 미사용",
      "연락처·추천 코드·메모 필드만 수집 (PII 최소화)",
      "412 / 409 응답 코드를 통해 중복·조건 미충족 통제",
    ],
  },
  {
    title: "가중치 추첨",
    summary: "1.0~4.0 사이 가중치 산출",
    items: [
      "기본 1.0, 최대 4.0 (cap)",
      "신규 30일 +0.3, 추천 1회 +0.05 (cap 0.3)",
      "결손 복구 +0.1 (cap 0.3), 얼리버드 +0.1, 지역 +0.1",
      "14일 내 당첨자는 가중치 50%로 냉각",
    ],
  },
];

const policyHighlights = [
  {
    title: "카카오 로그인 전용",
    description: "화이트리스트에 등록된 Kakao ID만 Audience·Partner·Admin 전 영역 접근 가능",
  },
  {
    title: "관리자 단일 계정",
    description: "Admin 콘솔은 단일 Kakao ID + TOTP 2FA 필수, 모든 정책 변경은 감사 로그 저장",
  },
  {
    title: "조용한 시간대",
    description: "22:00~08:00 KST 구간에서 마케팅 알림·푸시 발송 금지, 긴급 발송 시 Runbook 승인 필요",
  },
  {
    title: "UTM 및 감사",
    description: "AdGate 진입 시 utm_campaign 필수, Edge Function에서 dwell, referer, UTM 조합을 기록",
  },
];

const adminChecklist = [
  "B2C: www.domain.com, B2B: partner.domain.com, Admin: admin.domain.com",
  "Intro-first · AdGate 토글은 PM 승인 없이 비활성화 불가",
  "가중치 추첨 로그는 lottery_draw_execute, waitlist_promoted 이벤트로 수집",
  "조작 의심 시 /audit 엔드포인트에서 즉시 무효화",
];

export const metadata = {
  title: "접근 정책",
  description: "Intro-first → AdGate → 응모 → 가중치 추첨으로 이어지는 퍼널 정책을 한눈에 확인하세요.",
};

export default function AccessPolicyPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <section className="rounded-3xl bg-indigo-950 p-10 text-white shadow-xl md:p-14">
        <p className="text-sm uppercase tracking-wide text-white/60">Access Policy</p>
        <h1 className="mt-3 text-3xl font-semibold md:text-4xl">Intro-first → AdGate → 응모 → 가중치 추첨</h1>
        <p className="mt-4 max-w-3xl text-base text-white/80 md:text-lg">
          관객은 카카오 로그인 이후 Intro-first와 AdGate 조건을 만족해야 응모 폼에 접근합니다. 응모 데이터는 최소한으로 수집하며, 가중치 추첨은 1.0~4.0 범위에서 정책적으로 산출됩니다.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="mailto:access@artause.kr?subject=Artause%20Access" className="btn-primary bg-white text-indigo-950 hover:bg-white/90">
            화이트리스트 문의
          </a>
          <a href="/partner" className="btn-secondary border-white/40 text-white hover:border-white/60 hover:text-white">
            파트너 콘솔 보기
          </a>
        </div>
      </section>

      <section className="mt-14 grid gap-6 md:grid-cols-2">
        {funnelSteps.map((step) => (
          <div key={step.title} className="card h-full space-y-4 p-8">
            <div>
              <p className="text-xs uppercase tracking-wide text-indigo-500">{step.summary}</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">{step.title}</h2>
            </div>
            <ul className="space-y-2 text-sm text-slate-600">
              {step.items.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-indigo-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="mt-14 grid gap-6 md:grid-cols-2">
        {policyHighlights.map((policy) => (
          <div key={policy.title} className="card h-full space-y-3 p-8">
            <h3 className="text-xl font-semibold text-slate-900">{policy.title}</h3>
            <p className="text-sm text-slate-600">{policy.description}</p>
          </div>
        ))}
      </section>

      <section className="mt-14 card space-y-4 bg-slate-50 p-8">
        <h2 className="text-xl font-semibold text-slate-900">운영 체크리스트</h2>
        <ul className="space-y-2 text-sm text-slate-600">
          {adminChecklist.map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span className="mt-1 inline-block h-2 w-2 rounded-full bg-slate-400" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
