const sections = [
  {
    id: "terms",
    title: "이용약관",
    items: [
      "Artause는 공연/이벤트 정보 중개와 티켓 추첨 운영을 지원하며, 실제 공연 주최는 각 파트너에게 있습니다.",
      "사용자는 정확한 정보를 입력해야 하며, 허위 정보 또는 중복 계정 사용 시 서비스 이용이 제한될 수 있습니다.",
      "멤버십 플랜 변경 및 해지는 갱신 24시간 전까지 가능합니다.",
    ],
  },
  {
    id: "privacy",
    title: "개인정보처리방침",
    items: [
      "수집 항목: 이름, 이메일, 전화번호, 추천 코드 사용 이력, 응모/체크인 로그",
      "보관 기간: 응모 기록 90일, 멤버십 결제 정보 5년 (전자상거래법 기준)",
      "제3자 제공: 이벤트 파트너와 최소한의 정보만 공유하며, 사전 고지 후 동의를 받습니다.",
    ],
  },
  {
    id: "promotion",
    title: "프로모션 고지 (Instagram DM)",
    items: [
      "Instagram DM 발송 시 Meta 정책을 준수하며, 수신 거부 시 즉시 목록에서 제거합니다.",
      "유료 광고 문구와 경품 가치는 DM 본문에 명시합니다.",
      "DM 발송 로그는 30일 이내 보관 후 파기합니다.",
    ],
  },
  {
    id: "prize",
    title: "경품 고시",
    items: [
      "경품 가액이 5만원을 초과하는 경우 제세공과금을 부담해야 하며, 신분증 확인 절차가 진행됩니다.",
      "경품 배송은 파트너사가 직접 수행하며, 배송 지연 시 파트너사 공지에 따릅니다.",
      "경품은 양도가 불가하며, 현금 또는 다른 상품으로 대체되지 않습니다.",
    ],
  },
];

export const metadata = {
  title: "정책 & 고지",
  description: "이용약관, 개인정보, 프로모션 고지 사항을 확인하세요.",
};

export default function LegalPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <header className="space-y-4">
        <h1 className="text-3xl font-semibold text-slate-900">Artause 정책</h1>
        <p className="text-sm text-slate-600">서비스 이용과 관련된 약관, 개인정보, 프로모션 고지 사항을 정리했습니다.</p>
      </header>

      <nav className="mt-8 flex flex-wrap gap-3 text-sm">
        {sections.map((section) => (
          <a key={section.id} href={`#${section.id}`} className="rounded-full border border-slate-200 px-4 py-2 text-slate-600 hover:border-indigo-500 hover:text-indigo-600">
            {section.title}
          </a>
        ))}
      </nav>

      <div className="mt-10 space-y-10">
        {sections.map((section) => (
          <section key={section.id} id={section.id} className="card space-y-4 p-8">
            <h2 className="text-xl font-semibold text-slate-900">{section.title}</h2>
            <ul className="space-y-2 text-sm text-slate-600">
              {section.items.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-2 inline-block h-2 w-2 rounded-full bg-indigo-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <section className="mt-14 card space-y-4 bg-indigo-50 p-8 text-sm text-indigo-900">
        <h2 className="text-lg font-semibold">문의처</h2>
        <p>법무/개인정보 문의: legal@artause.com</p>
        <p>프로모션/스폰서십 문의: partners@artause.com</p>
      </section>
    </div>
  );
}
