import Link from "next/link";
import Image from "next/image";
import type { Database } from "@/lib/supabase/types";

type CampaignRow = Database["public"]["Tables"]["ticket_campaigns"]["Row"];

type Campaign = CampaignRow & {
  slug?: string | null;
  performances?: {
    title: string;
    region?: string | null;
    poster_url?: string | null;
  } | null;
  entry_count?: number;
};

type CampaignStatus = "active" | "upcoming" | "closed";

type TicketCampaignCardProps = {
  campaign: Campaign;
  status?: CampaignStatus;
};

const STATUS_MAP: Record<CampaignStatus, { label: string; tone: string; dotColor: string }> = {
  active: { label: "모집 중", tone: "bg-slate-900 text-white", dotColor: "bg-white" },
  upcoming: { label: "오픈 예정", tone: "bg-slate-100 text-slate-700", dotColor: "bg-slate-700" },
  closed: { label: "마감", tone: "bg-slate-200 text-slate-600", dotColor: "bg-slate-500" },
};

export function TicketCampaignCard({ campaign, status = "active" }: TicketCampaignCardProps) {
  const statusMeta = STATUS_MAP[status];
  const closesAt = campaign.ends_at ? formatDate(campaign.ends_at) : null;
  const performanceTitle = campaign.performances?.title;
  const region = campaign.performances?.region;
  const posterUrl = campaign.performances?.poster_url;
  const entryCount = campaign.entry_count ?? 0;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
      {/* Thumbnail Image */}
      <div className="relative h-40 w-full overflow-hidden bg-slate-100 sm:h-48">
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={`${performanceTitle ?? campaign.title} 포스터`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-3xl">
            🎫
          </div>
        )}
        {/* Status Badge - Absolute positioned */}
        <div className="absolute left-3 top-3">
          <span className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-semibold ${statusMeta.tone}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${statusMeta.dotColor}`}></span>
            {statusMeta.label}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        {/* Title & Description */}
        <header className="space-y-1">
          <h3 className="text-base font-bold text-slate-900 line-clamp-2 leading-tight">
            {campaign.title}
          </h3>
          <p className="text-sm text-slate-600 line-clamp-2">
            {campaign.description ?? "SNS 홍보와 연동된 초대권 이벤트입니다."}
          </p>
        </header>

        {/* Meta Information */}
        <dl className="space-y-1.5 text-xs text-slate-600">
          {performanceTitle && (
            <div className="flex items-center gap-2 truncate">
              <dd className="font-medium text-slate-900">{performanceTitle}</dd>
            </div>
          )}
          {campaign.reward && (
            <div className="flex items-center gap-1">
              <dd className="font-medium text-slate-700">{campaign.reward}</dd>
            </div>
          )}
          {closesAt && (
            <div className="flex items-center gap-1">
              <dd className="text-slate-600">{closesAt} 마감</dd>
            </div>
          )}
        </dl>

        {/* CTA Button */}
        <div className="mt-auto pt-2">
          <Link
            href={`/invites/${campaign.slug ?? campaign.id}`}
            className="inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-slate-800"
          >
            상세보기
          </Link>
        </div>
      </div>
    </article>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
