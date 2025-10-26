const whitelist = [
  { name: "하린", kakaoId: "kakao_991", twoFactor: "TOTP 등록", status: "화이트리스트" },
  { name: "윤성우", kakaoId: "kakao_552", twoFactor: "SMS 백업", status: "파트너" },
  { name: "Admin Concierge", kakaoId: "kakao_admin_001", twoFactor: "TOTP 필수", status: "관리자" },
];

export const metadata = {
  title: "화이트리스트 관리",
  description: "카카오 ID 화이트리스트, 2FA 상태, Quiet hours 예외를 관리하는 화면입니다.",
};

export default function AdminUsersPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <header className="space-y-3">
        <h1 className="text-2xl font-semibold text-slate-900">화이트리스트 (Mock)</h1>
        <p className="text-sm text-slate-600">Supabase Auth의 화이트리스트 테이블을 기준으로 Kakao ID와 2FA 상태를 관리합니다.</p>
      </header>

      <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">이름</th>
              <th className="px-4 py-3">Kakao ID</th>
              <th className="px-4 py-3">2FA</th>
              <th className="px-4 py-3">상태</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {whitelist.map((user) => (
              <tr key={user.kakaoId} className="bg-white">
                <td className="px-4 py-3">{user.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-600">{user.kakaoId}</td>
                <td className="px-4 py-3">{user.twoFactor}</td>
                <td className="px-4 py-3">{user.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
