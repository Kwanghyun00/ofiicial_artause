const steps = [
  "플랜 선택",
  "결제 수단 입력",
  "영수증 발행",
  "Edge Function 연결",
];

export const metadata = {
  title: "멤버십 결제",
  description: "Plus/Pro 플랜 결제를 위한 체크아웃 플로우 목업입니다.",
};

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold text-slate-900">멤버십 결제 (Mock)</h1>
        <p className="text-sm text-slate-600">실제 결제는 Toss Payments 또는 PortOne 연동 후 활성화됩니다.</p>
      </header>

      <section className="mt-10 card space-y-4 p-6">
        <h2 className="text-lg font-semibold text-slate-900">1. 플랜 선택</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex cursor-pointer flex-col gap-2 rounded-2xl border border-indigo-200 p-4">
            <span className="text-sm font-semibold text-indigo-700">Plus</span>
            <span className="text-xs text-slate-500">추가 응모 1회 · 조기 오픈 6시간</span>
          </label>
          <label className="flex cursor-pointer flex-col gap-2 rounded-2xl border border-slate-200 p-4">
            <span className="text-sm font-semibold text-slate-700">Pro</span>
            <span className="text-xs text-slate-500">추가 응모 2회 · 리포트 PDF 포함</span>
          </label>
        </div>
      </section>

      <section className="mt-8 card space-y-4 p-6">
        <h2 className="text-lg font-semibold text-slate-900">2. 결제 정보</h2>
        <p className="text-sm text-slate-600">PG 연동 준비가 완료되면 카드/간편결제 버튼이 표시됩니다.</p>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-center text-sm text-slate-400">
            카드 결제 UI
          </div>
          <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-center text-sm text-slate-400">
            간편결제 UI
          </div>
        </div>
      </section>

      <section className="mt-8 card space-y-4 p-6">
        <h2 className="text-lg font-semibold text-slate-900">3. 영수증 / 연동</h2>
        <p className="text-sm text-slate-600">결제 완료 시 영수증 이메일 발송, Edge Function 키 등록, 멤버십 테이블 업데이트가 자동으로 수행됩니다.</p>
        <ul className="flex flex-wrap gap-2 text-xs text-slate-500">
          {steps.map((step) => (
            <li key={step} className="rounded-full bg-slate-100 px-3 py-1">{step}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
