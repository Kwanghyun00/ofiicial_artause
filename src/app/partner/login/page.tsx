import { partnerLogin } from './actions';

export const metadata = {
  title: '파트너 로그인 | 알터즈',
  description: '알터즈 이벤트 운영 허브에 접속하세요.',
};

export default async function PartnerLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const errorType = params.error;

  const errorMessages: Record<string, string> = {
    invalid_email: '올바른 이메일 주소를 입력해 주세요.',
    invalid_code: '초대 코드가 올바르지 않습니다. 알터즈 팀에 문의해 주세요.',
    invalid: '입력 정보를 확인해 주세요.',
  };
  const errorMessage = errorType ? (errorMessages[errorType] ?? errorMessages.invalid) : null;

  return (
    <div className="mx-auto flex min-h-[75vh] max-w-md items-center px-6 py-12">
      <div className="w-full">
        {/* 헤더 */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-2xl shadow-lg">
            🎭
          </div>
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.25em] text-indigo-500">Partner Access</p>
          <h1 className="text-2xl font-bold text-slate-900">이벤트 운영 허브</h1>
          <p className="mt-2 text-sm text-slate-500">
            파트너 이메일과 초대 코드를 입력해 주세요
          </p>
        </div>

        {/* 카드 */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
          {errorMessage && (
            <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
              {errorMessage}
            </div>
          )}

          <form action={partnerLogin} className="space-y-4">
            <div>
              <label htmlFor="partner-email" className="mb-1.5 block text-sm font-semibold text-slate-700">
                파트너 이메일 <span className="text-rose-500">*</span>
              </label>
              <input
                id="partner-email"
                name="email"
                type="email"
                required
                placeholder="partner@example.com"
                autoComplete="email"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 transition focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            <div>
              <label htmlFor="invite-code" className="mb-1.5 block text-sm font-semibold text-slate-700">
                초대 코드 <span className="text-rose-500">*</span>
              </label>
              <input
                id="invite-code"
                name="inviteCode"
                type="password"
                required
                placeholder="알터즈 팀에서 제공한 코드"
                autoComplete="off"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 transition focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-2xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow transition hover:bg-indigo-700 active:scale-[0.98]"
            >
              이벤트 운영 허브 입장 →
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-slate-400">
            파트너 신청은{" "}
            <a href="/services" className="font-medium text-indigo-500 hover:underline">
              서비스 소개 페이지
            </a>
            에서 문의해 주세요
          </p>
        </div>
      </div>
    </div>
  );
}
