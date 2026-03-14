import { ApprovalQueue } from "@/components/admin/ApprovalQueue";
import { KopisSyncButton } from "@/components/admin/KopisSyncButton";

export const metadata = {
  title: "관리자 대시보드",
  description: "이벤트 승인 관리",
};

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16 space-y-12">
      <header className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-rose-600 via-pink-600 to-purple-600 p-12 text-white shadow-2xl md:p-16">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDEzNGgxMnYxMkgzNnptMjQgMGgxMnYxMkg2MHpNMTIgMTEwaDEydjEySDE2em0yNCAwaDEydjEySDM2em0yNCAwaDEydjEySDYwem0yNCAwaDEydjEySDg0em0wIDI0aDEydjEySDg0em0wIDI0aDEydjEySDg0eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-yellow-300 animate-pulse"></span>
            <p className="text-xs font-medium uppercase tracking-wider">Admin Dashboard</p>
          </div>
          <h1 className="mt-6 text-4xl font-bold md:text-5xl lg:text-6xl">
            이벤트 승인 관리
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/90 md:text-xl">
            공연 종사자가 등록한 이벤트를 검토하고 승인하세요.
            승인된 이벤트는 즉시 관객에게 공개됩니다.
          </p>
          <div className="mt-8 rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <p className="font-bold text-lg mb-2">당첨자 선정 안내</p>
                <p className="text-white/90 leading-relaxed">
                  당첨자는 별도의 관리 도구(구글 시트 등)에서 선정하고,
                  공연 종사자에게 이메일로 전달됩니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <KopisSyncButton />
      <ApprovalQueue />
    </div>
  );
}
