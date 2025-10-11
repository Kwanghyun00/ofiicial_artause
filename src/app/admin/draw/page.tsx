const logs = [
  { time: "10:00", action: "추첨 실행", detail: "문라이트 프리뷰", result: "당첨 20명" },
  { time: "10:05", action: "대기자 승급", detail: "문라이트 프리뷰", result: "5명 승급" },
];

export const metadata = {
  title: "관리자 · 추첨",
  description: "Edge Function 기반 추첨/대기자 관리 화면 목업입니다.",
};

export default function AdminDrawPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <header className="space-y-3">
        <h1 className="text-2xl font-semibold text-slate-900">추첨 & 대기자 관리 (Mock)</h1>
        <p className="text-sm text-slate-600">Edge Functions에서 실행된 추첨 로그를 확인하고 가중치를 조정합니다.</p>
      </header>

      <section className="mt-10 card space-y-4 p-6">
        <h2 className="text-lg font-semibold text-slate-900">가중치 프리뷰</h2>
        <p className="text-sm text-slate-600">추천 코드, 멤버십 등급, 과거 노쇼 여부를 기반으로 가중치를 계산합니다.</p>
        <div className="rounded-2xl bg-slate-100 p-4 text-xs text-slate-500">Weighted Preview Chart</div>
      </section>

      <section className="mt-10 card space-y-4 p-6">
        <h2 className="text-lg font-semibold text-slate-900">로그</h2>
        <div className="space-y-3 text-sm text-slate-600">
          {logs.map((log) => (
            <div key={`${log.time}-${log.action}`} className="rounded-2xl border border-slate-200 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">{log.time}</p>
              <p className="font-semibold text-slate-800">{log.action}</p>
              <p className="text-slate-600">{log.detail}</p>
              <p className="text-xs text-slate-500">{log.result}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
