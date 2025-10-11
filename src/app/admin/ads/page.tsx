export const metadata = {
  title: "관리자 · 광고",
  description: "스폰서십 슬롯과 CTR 리포트를 관리하는 화면 목업입니다.",
};

const slots = [
  { name: "home_hero", status: "예약", ctr: "3.1%", period: "2025-10-15 ~ 2025-10-21" },
  { name: "shows_top", status: "오픈", ctr: "-", period: "예약 가능" },
];

export default function AdminAdsPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <header className="space-y-3">
        <h1 className="text-2xl font-semibold text-slate-900">광고 & 스폰서십 (Mock)</h1>
        <p className="text-sm text-slate-600">슬롯 기반으로 예약 현황, CTR, 클릭 수를 확인하고 리포트를 다운로드합니다.</p>
      </header>

      <div className="mt-10 space-y-4">
        {slots.map((slot) => (
          <div key={slot.name} className="card space-y-2 p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Slot</p>
                <p className="text-lg font-semibold text-slate-900">{slot.name}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">{slot.status}</span>
            </div>
            <p className="text-sm text-slate-600">기간: {slot.period}</p>
            <p className="text-sm text-slate-600">CTR: {slot.ctr}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
