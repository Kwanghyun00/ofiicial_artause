export const metadata = {
  title: "관리자 · 공연",
  description: "공연 CRUD와 SEO 메타 데이터를 관리하는 화면 목업입니다.",
};

export default function AdminShowsPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <header className="space-y-3">
        <h1 className="text-2xl font-semibold text-slate-900">공연 관리 (Mock)</h1>
        <p className="text-sm text-slate-600">Supabase `performances` 테이블과 연동하여 슬러그, JSON-LD, 태그를 관리합니다.</p>
      </header>

      <section className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="card space-y-4 p-6">
          <h2 className="text-lg font-semibold text-slate-900">기본 정보</h2>
          <ul className="space-y-2 text-sm text-slate-600">
            <li>제목, 슬러그, 상태</li>
            <li>카테고리, 지역, 기간</li>
            <li>포스터 URL, 티켓 링크</li>
          </ul>
        </div>
        <div className="card space-y-4 p-6">
          <h2 className="text-lg font-semibold text-slate-900">SEO / JSON-LD</h2>
          <p className="text-sm text-slate-600">Hero 헤드라인, 서브타이틀, JSON-LD Event 스키마를 관리합니다.</p>
          <div className="rounded-2xl bg-slate-100 p-4 text-xs text-slate-500">JSON-LD Preview</div>
        </div>
      </section>
    </div>
  );
}
