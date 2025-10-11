const sections = [
  {
    title: "응모 현황",
    description: "현재 참여 중인 이벤트와 추첨 상태를 확인하세요.",
    items: [
      "문라이트 앙상블 프리뷰 - 대기번호 12번",
      "호라이즌 페스티벌 얼리버드 - 추첨 예정",
    ],
  },
  {
    title: "추천 코드",
    description: "친구에게 공유한 코드별 실적입니다.",
    items: [
      "코드 artause-kyung - 응모 5건, 체크인 2건",
      "코드 nightloop - 응모 3건, 체크인 1건",
    ],
  },
  {
    title: "멤버십",
    description: "현재 플랜과 만료 일자를 확인하고 업그레이드할 수 있습니다.",
    items: [
      "현재 플랜: Plus (2025-11-01 갱신)",
      "조기 오픈 혜택 잔여 2회",
    ],
  },
];

export const metadata = {
  title: "마이 페이지",
  description: "응모, 추천 코드, 멤버십 정보를 한 곳에서 확인하세요.",
};

export default function MePage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold text-slate-900">마이 페이지 (Mock)</h1>
        <p className="text-sm text-slate-600">Supabase Auth와 연동되면 실제 응모/멤버십 데이터가 표시됩니다.</p>
      </header>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {sections.map((section) => (
          <section key={section.title} className="card space-y-4 p-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{section.title}</h2>
              <p className="text-sm text-slate-600">{section.description}</p>
            </div>
            <ul className="space-y-2 text-sm text-slate-600">
              {section.items.map((item) => (
                <li key={item} className="rounded-2xl bg-slate-100 px-4 py-2">{item}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <section className="mt-12 card space-y-4 p-6">
        <h2 className="text-lg font-semibold text-slate-900">멤버십 업그레이드</h2>
        <p className="text-sm text-slate-600">Plus/Pro 업그레이드를 통해 응모 횟수, 조기 오픈, 리포트를 확장할 수 있습니다.</p>
        <a href="/pricing" className="btn-primary w-fit">
          플랜 비교
        </a>
      </section>
    </div>
  );
}
