const columns = ["이벤트", "상태", "응모 수", "CTR", "공개" ];

export const metadata = {
  title: "관리자 · 이벤트",
  description: "이벤트 CRUD, 공개 여부, CSV 내보내기 인터페이스 목업입니다.",
};

export default function AdminEventsPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <header className="space-y-3">
        <h1 className="text-2xl font-semibold text-slate-900">이벤트 관리 (Mock)</h1>
        <p className="text-sm text-slate-600">Supabase `ticket_campaigns` 테이블과 연결해 CRUD 및 CSV 다운로드를 지원합니다.</p>
      </header>

      <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              {columns.map((column) => (
                <th key={column} className="px-4 py-3">{column}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            <tr className="bg-white">
              <td className="px-4 py-3">문라이트 프리뷰</td>
              <td className="px-4 py-3">진행 중</td>
              <td className="px-4 py-3">245</td>
              <td className="px-4 py-3">3.2%</td>
              <td className="px-4 py-3">공개</td>
            </tr>
            <tr className="bg-slate-50">
              <td className="px-4 py-3">호라이즌 얼리버드</td>
              <td className="px-4 py-3">예정</td>
              <td className="px-4 py-3">-</td>
              <td className="px-4 py-3">-</td>
              <td className="px-4 py-3">비공개</td>
            </tr>
          </tbody>
        </table>
      </div>

      <section className="mt-8 card space-y-3 p-6">
        <h2 className="text-lg font-semibold text-slate-900">CSV 내보내기</h2>
        <p className="text-sm text-slate-600">응모 목록과 체크인 로그를 CSV로 다운로드하고, Edge Function에서 추첨 로그를 병합합니다.</p>
      </section>
    </div>
  );
}
