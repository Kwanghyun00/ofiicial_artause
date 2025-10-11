const partnerFormats = [
  {
    title: "홈 히어로",
    description: "home_hero 슬롯에 주간 고정 노출이 제공됩니다.",
  },
  {
    title: "홈 미드",
    description: "home_mid 슬롯에서 공연 큐레이션과 함께 노출됩니다.",
  },
  {
    title: "쇼케이스 상단",
    description: "shows_top 배너로 공연 큐레이션 상단에 노출됩니다.",
  },
  {
    title: "이벤트 사이드바",
    description: "event_sidebar 슬롯에서 응모 CTA와 나란히 노출됩니다.",
  },
];

const affiliateSteps = [
  "캠페인 파라미터 세팅 (UTM)",
  "추천 코드 및 랜딩 배포",
  "클릭·전환 리포트 다운로드",
  "정산 요청 및 지급",
];

export const metadata = {
  title: "파트너 & 스폰서십",
  description: "브랜드 스폰서십과 어필리에이트 프로그램 운영 구조를 확인하세요.",
};

export default function PartnersPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <section className="rounded-3xl bg-indigo-950 p-10 text-white shadow-xl md:p-14">
        <p className="text-sm uppercase tracking-wide text-white/60">Partners</p>
        <h1 className="mt-3 text-3xl font-semibold md:text-4xl">Artause 파트너 프로그램</h1>
        <p className="mt-4 max-w-3xl text-base text-white/80 md:text-lg">
          스폰서십(브랜드/패션/음료)과 어필리에이트(티켓 판매/굿즈) 프로그램을 운영합니다. CTR·전환 리포트, IG DM 자동 발송, Edge Function 기반 체크인 로그를 제공해 브랜드와 커뮤니티 모두 데이터 기반으로 의사결정할 수 있습니다.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="mailto:partners@artause.com?subject=Artause%20Partnership" className="btn-primary bg-white text-indigo-950 hover:bg-white/90">
            파트너 상담 신청
          </a>
          <a href="/legal" className="btn-secondary border-white/40 text-white hover:border-white/60 hover:text-white">
            고지사항 확인
          </a>
        </div>
      </section>

      <section className="mt-14">
        <h2 className="section-heading">스폰서십 슬롯</h2>
        <p className="section-subtitle">주간 고정, 공연별 코호트, 이벤트 사이드바 등 원하는 위치를 선택할 수 있습니다.</p>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {partnerFormats.map((format) => (
            <div key={format.title} className="card space-y-2 p-8">
              <h3 className="text-lg font-semibold text-slate-900">{format.title}</h3>
              <p className="text-sm text-slate-600">{format.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14 grid gap-6 md:grid-cols-2">
        <div className="card h-full space-y-4 p-8">
          <h2 className="text-xl font-semibold text-slate-900">어필리에이트 프로세스</h2>
          <ol className="list-decimal space-y-3 pl-5 text-sm text-slate-600">
            {affiliateSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
        <div className="card h-full space-y-4 p-8">
          <h2 className="text-xl font-semibold text-slate-900">제공 리포트</h2>
          <ul className="space-y-2 text-sm text-slate-600">
            <li>CTR / CPC / 전환율</li>
            <li>UTM 파라미터별 유입 추적</li>
            <li>추천 코드별 응모 및 체크인 수</li>
            <li>CSV 다운로드 및 API 연동</li>
          </ul>
        </div>
      </section>

      <section className="mt-14">
        <div className="card space-y-4 bg-indigo-50 p-8 text-indigo-900">
          <h2 className="text-xl font-semibold">협업 가이드</h2>
          <ul className="space-y-2 text-sm">
            <li>브랜드 가이드는 최소 7일 전에 공유해 주세요.</li>
            <li>전용 CTA 버튼/카피는 사전 승인 후 적용됩니다.</li>
            <li>스폰서십 노출 기간은 기본 7일이며 확장 가능합니다.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
