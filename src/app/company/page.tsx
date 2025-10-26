export const metadata = {
  title: "회사 소개",
  description: "Artause의 미션, 핵심 가치, 팀 구조와 주요 연혁을 소개합니다.",
};

const missionPoints = [
  {
    title: "팬 경험 확장",
    description: "Immersive · Experimental 장르에 집중하여 관객이 공연을 발견하고 참여하는 과정을 설계합니다.",
  },
  {
    title: "창작자와의 동맹",
    description: "스튜디오 · 프로덕션 레이블과의 공동 캠페인을 통해 안정적인 수요를 확보합니다.",
  },
  {
    title: "데이터 기반 성장",
    description: "Bloom & Slate 토큰 체계를 활용해 실시간 인사이트와 자동화된 운영을 제공합니다.",
  },
];

const servicePillars = [
  {
    name: "Audience Bloom",
    summary: "멤버 전용 추천, 체크인 미션, 커뮤니티 루프를 묶은 팬 경험 패키지",
    detail: "A/B 실험을 거친 UI 컴포넌트와 Bloom 지표로 관객 여정을 정교하게 다룹니다.",
  },
  {
    name: "Partner Slate",
    summary: "공연 종사자를 위한 KPI 대시보드, 슬롯 인벤토리, Edge Function 운영",
    detail: "캠페인 목표에 맞는 슬롯 추천과 자동화된 리포트 PDF를 제공합니다.",
  },
  {
    name: "Creator Network",
    summary: "협력 창작자와 콘텐츠 크루를 연결하는 파트너 네트워크",
    detail: "UGC 제작, 백스테이지 투어, 애프터 토크 등 팬 참여형 프로그램을 공동 기획합니다.",
  },
];

const timeline = [
  {
    period: "2023 Q1",
    title: "법인 설립 & 초기 프로덕트 착수",
    description: "서울 성수에 스튜디오를 마련하고 파트너 5개사와 베타 테스트를 진행했습니다.",
  },
  {
    period: "2023 Q4",
    title: "Audience Bloom 0.9 공개",
    description: "베타 멤버 3,200명이 참여한 추천/체크인 기능을 정식 릴리스했습니다.",
  },
  {
    period: "2024 Q2",
    title: "Slate Portal & Edge Function 도입",
    description: "캠페인 리포트 자동화, 슬롯 예약 시스템, 위젯 SDK를 출시했습니다.",
  },
  {
    period: "2024 Q4",
    title: "Creator Network 확장",
    description: "수도권 외 지역 12개 레이블과 협업을 체결하고, 월간 온오프라인 행사를 진행했습니다.",
  },
];

export default function CompanyPage() {
  return (
    <div className="space-y-16 bg-white py-12 text-slate-900 md:py-20">
      <section className="mx-auto max-w-5xl px-4 md:px-6">
        <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-emerald-50 p-[1px] shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
          <div className="rounded-[calc(24px-1px)] bg-white/95 p-8 md:p-12">
            <span className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-4 py-1 text-xs font-semibold text-indigo-600">
              About Artause
            </span>
            <h1 className="mt-4 text-3xl font-semibold leading-tight md:text-4xl">
              관객 경험과 공연 산업을 잇는 플랫폼, Artause
            </h1>
            <p className="mt-4 text-sm text-slate-600 md:text-base">
              Artause는 공연, 전시, 실험적 라이브 콘텐츠를 사랑하는 팬과 창작 조직을 연결합니다. 관객 측에는 Bloom UI로 발견과 참여를 돕고, 공연 종사자에게는 Slate 포털로 운영 효율을 제공합니다.
            </p>
            <dl className="mt-8 grid gap-4 text-sm md:grid-cols-3">
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4">
                <dt className="text-xs uppercase tracking-wide text-indigo-500">설립</dt>
                <dd className="mt-2 text-lg font-semibold text-slate-900">2023년 1월</dd>
                <p className="mt-1 text-xs text-slate-500">서울 성수 스튜디오</p>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
                <dt className="text-xs uppercase tracking-wide text-emerald-500">파트너</dt>
                <dd className="mt-2 text-lg font-semibold text-slate-900">24개 스튜디오</dd>
                <p className="mt-1 text-xs text-slate-500">서울 · 부산 · 대구 · 광주</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <dt className="text-xs uppercase tracking-wide text-slate-500">월간 멤버</dt>
                <dd className="mt-2 text-lg font-semibold text-slate-900">8,400명</dd>
                <p className="mt-1 text-xs text-slate-500">Bloom 지수 평균 82</p>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl space-y-8 px-4 md:px-6">
        <h2 className="text-2xl font-semibold text-slate-900">미션 & 가치</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {missionPoints.map((item) => (
            <div key={item.title} className="rounded-3xl border border-indigo-100 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-3 text-sm text-slate-600">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl space-y-8 px-4 md:px-6">
        <h2 className="text-2xl font-semibold text-slate-900">핵심 서비스</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {servicePillars.map((pillar) => (
            <div key={pillar.name} className="rounded-3xl border border-slate-200 bg-slate-50/80 p-6">
              <span className="inline-flex items-center rounded-full bg-slate-900/90 px-3 py-1 text-xs font-semibold text-white">
                {pillar.name}
              </span>
              <h3 className="mt-3 text-base font-semibold text-slate-900">{pillar.summary}</h3>
              <p className="mt-3 text-sm text-slate-600">{pillar.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl space-y-6 px-4 md:px-6">
        <h2 className="text-2xl font-semibold text-slate-900">연혁</h2>
        <div className="space-y-4">
          {timeline.map((item) => (
            <div key={item.period} className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">{item.period}</p>
              <h3 className="mt-2 text-lg font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl space-y-6 px-4 md:px-6">
        <h2 className="text-2xl font-semibold text-slate-900">문의 채널</h2>
        <div className="grid gap-6 rounded-3xl border border-indigo-100 bg-indigo-50/80 p-8 md:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">일반 문의</p>
            <p className="mt-2 text-sm text-slate-700">contact@artause.kr</p>
            <p className="text-xs text-slate-500">월-금 10:00~18:00</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">파트너십</p>
            <p className="mt-2 text-sm text-slate-700">partners@artause.com</p>
            <p className="text-xs text-slate-500">캠페인, 슬롯, API 문의</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">법무/정책</p>
            <p className="mt-2 text-sm text-slate-700">legal@artause.com</p>
            <p className="text-xs text-slate-500">약관, 개인정보 보호</p>
          </div>
        </div>
      </section>
    </div>
  );
}
