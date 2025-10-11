import Link from "next/link";
import type { Database } from "@/lib/supabase/types";

type CampaignRow = Database["public"]["Tables"]["ticket_campaigns"]["Row"];

type Campaign = CampaignRow & {
  slug?: string | null;
  performances?: {
    slug: string;
    title: string;
    poster_url: string | null;
  } | null;
};

type CampaignStatus = "active" | "upcoming" | "closed";

type TicketCampaignCardProps = {
  campaign: Campaign;
  status?: CampaignStatus;
};

const STATUS_MAP: Record<CampaignStatus, { label: string; tone: string }> = {
  active: { label: "진행 중", tone: "bg-emerald-500/15 text-emerald-700" },
  upcoming: { label: "예정", tone: "bg-amber-500/15 text-amber-700" },
  closed: { label: "종료", tone: "bg-slate-500/15 text-slate-600" },
};

export function TicketCampaignCard({ campaign, status = "active" }: TicketCampaignCardProps) {
  const performance = campaign.performances;
  const closesAt = campaign.ends_at ? formatDate(campaign.ends_at) : null;
  const campaignUrl = `/events/${campaign.slug ?? campaign.id}`;
  const statusMeta = STATUS_MAP[status];

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-white/60 bg-white/70 p-6 shadow-lg">
      <div className="flex items-start gap-4">
        <div className="h-16 w-16 overflow-hidden rounded-2xl bg-slate-200">
          <img
            src={performance?.poster_url ?? "/images/mock/poster-default.svg"}
            alt={performance?.title ?? "Artause 이벤트"}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-indigo-600">
            <span>티켓 이벤트</span>
            <span className={`badge ${statusMeta.tone}`}>{statusMeta.label}</span>
          </div>
          <h3 className="mt-1 text-lg font-semibold text-slate-900">{campaign.title}</h3>
          {performance ? (
            <Link href={`/shows/${performance.slug}`} className="mt-1 inline-flex text-sm text-slate-500 hover:text-indigo-600">
              {performance.title}
            </Link>
          ) : null}
        </div>
      </div>
      {campaign.reward ? <p className="text-sm text-slate-600">혜택: {campaign.reward}</p> : null}
      <div className="text-xs text-slate-500">
        {campaign.starts_at ? <p>응모 시작 {formatDate(campaign.starts_at)}</p> : null}
        {closesAt ? <p>응모 마감 {closesAt}</p> : null}
      </div>
      <Link href={campaignUrl} className="btn-primary w-full">
        이벤트 자세히 보기
      </Link>
    </div>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}
