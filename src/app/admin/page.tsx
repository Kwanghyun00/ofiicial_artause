import { ApprovalQueue } from "@/components/admin/ApprovalQueue";
import { KopisSyncButton } from "@/components/admin/KopisSyncButton";
import { getPendingCampaigns } from "@/lib/supabase/queries";

export const metadata = {
  title: "관리자 대시보드",
  description: "이벤트 승인 관리",
};

export default async function AdminPage() {
  const rawCampaigns = await getPendingCampaigns();

  const pendingCampaigns = rawCampaigns.map((c) => {
    const perf = Array.isArray(c.performances) ? c.performances[0] : c.performances;
    return {
      id: c.id,
      title: c.title,
      performanceTitle: (perf as { title?: string } | null)?.title ?? c.title,
      partnerName: (c as { partner_name?: string }).partner_name ?? "미입력",
      partnerEmail: (c as { partner_email?: string }).partner_email ?? "",
      partnerPhone: (c as { partner_phone?: string }).partner_phone ?? "",
      ticketPurchaseUrl: (c as { ticket_purchase_url?: string }).ticket_purchase_url ?? undefined,
      ticketCount: String((c as { allocation?: number }).allocation ?? (c as { reward?: string }).reward ?? "미정"),
      period: {
        start: c.starts_at ? new Date(c.starts_at).toLocaleDateString("ko-KR") : "미정",
        end: c.ends_at ? new Date(c.ends_at).toLocaleDateString("ko-KR") : "미정",
      },
    };
  });

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 space-y-12">
      <header className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-rose-600 via-pink-600 to-purple-600 p-12 text-white shadow-2xl md:p-16">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDEzNGgxMnYxMkgzNnptMjQgMGgxMnYxMkg2MHpNMTIgMTEwaDEydjEySDE2em0yNCAwaDEydjEySDM2em0yNCAwaDEydjEySDYwem0yNCAwaDEydjEySDg0em0wIDI0aDEydjEySDg0em0wIDI0aDEydjEySDg0eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        <div className="relative">
          <div className="flex items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-yellow-300 animate-pulse"></span>
              <p className="text-xs font-medium uppercase tracking-wider">Admin Dashboard</p>
            </div>
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm font-semibold backdrop-blur-sm">
              대기 {pendingCampaigns.length}건
            </span>
          </div>
          <h1 className="mt-6 text-4xl font-bold md:text-5xl lg:text-6xl">
            이벤트 승인 관리
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/90 md:text-xl">
            공연 종사자가 등록한 이벤트를 검토하고 승인하세요.
            승인된 이벤트는 즉시 관객에게 공개됩니다.
          </p>
        </div>
      </header>

      <KopisSyncButton />
      <ApprovalQueue campaigns={pendingCampaigns} />
    </div>
  );
}
