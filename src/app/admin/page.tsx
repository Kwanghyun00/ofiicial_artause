const tiles = [
  { label: "오늘 응모", value: "128", description: "apply_submit 이벤트 수" },
  { label: "추천 공유", value: "64", description: "referral_share" },
  { label: "멤버십 업그레이드", value: "12", description: "membership_upgrade" },
  { label: "광고 CTR", value: "2.8%", description: "home_hero" },
];

export const metadata = {
  title: "운영 대시보드",
  description: "이벤트, 공연, 추첨, 광고를 한 눈에 모니터링하는 미리보기입니다.",
};

export default function AdminDashboardPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold text-slate-900">운영 대시보드 (Mock)</h1>
        <p className="text-sm text-slate-600">Supabase Realtime과 Edge Functions를 연결하면 실시간 데이터가 여기에 나타납니다.</p>
      </header>

      <div className="mt-10 grid gap-4 md:grid-cols-4">
        {tiles.map((tile) => (
          <div key={tile.label} className="card space-y-1 p-5">
            <p className="text-xs uppercase tracking-wide text-slate-500">{tile.label}</p>
            <p className="text-2xl font-semibold text-slate-900">{tile.value}</p>
            <p className="text-xs text-slate-500">{tile.description}</p>
          </div>
        ))}
      </div>

      <section className="mt-12 grid gap-6 md:grid-cols-2">
        <div className="card space-y-4 p-6">
          <h2 className="text-lg font-semibold text-slate-900">이벤트</h2>
          <p className="text-sm text-slate-600">/admin/events에서 CRUD, 공개 여부, CSV 내보내기를 지원합니다.</p>
          <a href="/admin/events" className="btn-primary w-fit">
            이벤트 관리로 이동
          </a>
        </div>
        <div className="card space-y-4 p-6">
          <h2 className="text-lg font-semibold text-slate-900">공연</h2>
          <p className="text-sm text-slate-600">/admin/shows에서 공연 큐레이션, SEO 메타, JSON-LD를 관리합니다.</p>
          <a href="/admin/shows" className="btn-secondary w-fit">
            공연 관리로 이동
          </a>
        </div>
      </section>
    </div>
  );
}
