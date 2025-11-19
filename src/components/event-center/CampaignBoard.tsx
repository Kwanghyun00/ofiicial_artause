import { TicketCampaignCard } from "@/components/marketing/TicketCampaignCard";
import type { Database } from "@/lib/supabase/types";

type CampaignRow = Database["public"]["Tables"]["ticket_campaigns"]["Row"];

type Campaign = CampaignRow & {
  slug?: string | null;
  performances?: {
    title: string;
    region?: string | null;
  } | null;
};

type CampaignBoardProps = {
  campaigns: Campaign[];
};

export function CampaignBoard({ campaigns }: CampaignBoardProps) {
  if (campaigns.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
        <div className="mx-auto max-w-sm space-y-3">
          <p className="text-base font-medium text-slate-400">진행 중인 이벤트가 없습니다</p>
          <p className="text-sm text-slate-500">새로운 이벤트가 곧 열릴 예정입니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {campaigns.map((campaign) => (
        <TicketCampaignCard key={campaign.id} campaign={campaign} status="active" />
      ))}
    </div>
  );
}
