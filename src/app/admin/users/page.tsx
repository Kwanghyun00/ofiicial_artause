const users = [
  { name: "김아트", membership: "Pro", status: "정상", flags: "-" },
  { name: "이커뮤", membership: "Plus", status: "경고", flags: "중복 응모" },
];

export const metadata = {
  title: "관리자 · 사용자",
  description: "멤버십 상태, 블랙리스트, 중복 응모 등을 관리하는 화면 목업입니다.",
};

export default function AdminUsersPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <header className="space-y-3">
        <h1 className="text-2xl font-semibold text-slate-900">사용자 관리 (Mock)</h1>
        <p className="text-sm text-slate-600">Supabase Auth와 연동되면 멤버십, 응모 이력, 블랙리스트를 확인하고 조정할 수 있습니다.</p>
      </header>

      <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">사용자</th>
              <th className="px-4 py-3">멤버십</th>
              <th className="px-4 py-3">상태</th>
              <th className="px-4 py-3">플래그</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {users.map((user) => (
              <tr key={user.name} className="bg-white">
                <td className="px-4 py-3">{user.name}</td>
                <td className="px-4 py-3">{user.membership}</td>
                <td className="px-4 py-3">{user.status}</td>
                <td className="px-4 py-3">{user.flags}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
