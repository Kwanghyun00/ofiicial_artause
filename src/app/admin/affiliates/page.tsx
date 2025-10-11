const campaigns = [
  { name: "Creator Loop", clicks: 520, conversions: 45, payout: "₩225,000" },
  { name: "Night Out Influencers", clicks: 180, conversions: 12, payout: "₩96,000" },
];

export const metadata = {
  title: "관리자 · 어필리에이트",
  description: "어필리에이트 캠페인 파라미터와 정산 현황을 확인하는 화면 목업입니다.",
};

export default function AdminAffiliatesPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <header className="space-y-3">
        <h1 className="text-2xl font-semibold text-slate-900">어필리에이트 관리 (Mock)</h1>
        <p className="text-sm text-slate-600">UTM 파라미터 세팅, 클릭/전환 리포트, 정산 내역을 확인합니다.</p>
      </header>

      <div className="mt-10 space-y-4">
        {campaigns.map((campaign) => (
          <div key={campaign.name} className="card space-y-2 p-6">
            <h2 className="text-lg font-semibold text-slate-900">{campaign.name}</h2>
            <p className="text-sm text-slate-600">클릭 {campaign.clicks} · 전환 {campaign.conversions}</p>
            <p className="text-sm text-slate-600">예상 정산액 {campaign.payout}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
