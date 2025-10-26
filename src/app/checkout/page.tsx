export const metadata = {
  title: "접근 권한 안내",
  description: "카카오 로그인 화이트리스트 기반으로만 접근 권한을 부여합니다.",
};

const checklist = [
  "화이트리스트 신청: access@artause.kr",
  "카카오 ID 확인 및 TOTP 2FA 등록",
  "Intro-first · AdGate 토글 점검",
  "Quiet hours 예외 승인 (필요 시)"
];

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold text-slate-900">접근 권한 안내</h1>
        <p className="text-sm text-slate-600">유료 멤버십은 운영하지 않으며, 화이트리스트에 등록된 카카오 ID로만 서비스에 접근할 수 있습니다.</p>
      </header>

      <section className="mt-8 card space-y-4 p-6">
        <h2 className="text-lg font-semibold text-slate-900">화이트리스트 절차</h2>
        <ul className="space-y-2 text-sm text-slate-600">
          {checklist.map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span className="mt-1 inline-block h-2 w-2 rounded-full bg-indigo-500" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-slate-500">* Quiet hours(22:00~08:00 KST) 동안에는 신규 승인 작업을 진행하지 않습니다.</p>
      </section>

      <section className="mt-8 card space-y-4 bg-slate-50 p-6">
        <h2 className="text-lg font-semibold text-slate-900">도움이 필요하신가요?</h2>
        <p className="text-sm text-slate-600">access@artause.kr 또는 partners@artause.com으로 문의해 주세요. PM 승인을 거쳐 화이트리스트에 추가됩니다.</p>
      </section>
    </div>
  );
}
