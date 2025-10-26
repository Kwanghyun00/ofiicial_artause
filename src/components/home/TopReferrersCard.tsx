import Link from "next/link";

export type ReferrerHighlight = {
  channel: string;
  value: string;
  insight: string;
};

export function TopReferrersCard({ items }: { items: ReferrerHighlight[] }) {
  return (
    <div className="card h-full rounded-3xl border border-white/50 bg-white p-6 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Top Referrers</h3>
          <p className="text-xs text-slate-500">실시간 추천 순위</p>
        </div>
        <span className="rounded-full bg-emerald-400/20 px-2 py-1 text-xs font-semibold text-emerald-700">LIVE</span>
      </div>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item.channel} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">{item.channel}</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">{item.value}</p>
            <p className="text-xs text-slate-500">{item.insight}</p>
          </div>
        ))}
      </div>
      <Link href="/me#referrals" className="mt-4 inline-flex text-xs font-medium text-indigo-600 hover:text-indigo-500">
        추천 실적 더 보기 →
      </Link>
    </div>
  );
}
