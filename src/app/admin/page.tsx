const tiles = [
  { label: "응모 접수", value: "128", description: "entry_submit_success" },
  { label: "AdGate 통과", value: "94", description: "adgate_verify_success" },
  { label: "화이트리스트", value: "37", description: "kakao_whitelist" },
  { label: "평균 CTR", value: "2.8%", description: "home_hero" },
];

export const metadata = {
  title: "운영 대시보드",
  description: "Intro-first, AdGate, 추첨 정책을 감독하는 관리자 콘솔입니다.",
};

export default function AdminDashboardPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold text-slate-900">운영 대시보드 (Mock)</h1>
        <p className="text-sm text-slate-600">Supabase Realtime과 Edge Functions로 기록된 운영 지표를 확인하세요.</p>
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
          <h2 className="text-lg font-semibold text-slate-900">이벤트 관리</h2>
          <p className="text-sm text-slate-600">/admin/events에서 Intro-first·AdGate 토글과 공연 일정을 관리합니다.</p>
          <a href="/admin/events" className="btn-primary w-fit">
            이벤트 콘솔 이동
          </a>
        </div>
        <div className="card space-y-4 p-6">
          <h2 className="text-lg font-semibold text-slate-900">화이트리스트</h2>
          <p className="text-sm text-slate-600">/admin/users에서 Kakao ID 화이트리스트, 2FA 상태, Quiet hours 예외를 관리합니다.</p>
          <a href="/admin/users" className="btn-secondary w-fit">
            화이트리스트 관리
          </a>
        </div>
      </section>
    </div>
  );
}
