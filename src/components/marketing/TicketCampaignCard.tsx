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
  active: { label: "모집 중", tone: "bg-emerald-100 text-emerald-700", dotColor: "bg-emerald-500" },
  upcoming: { label: "오픈 예정", tone: "bg-amber-100 text-amber-700", dotColor: "bg-amber-500" },
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
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
      {/* Thumbnail Image */}
      <div className="relative h-44 w-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={`${performanceTitle ?? campaign.title} 포스터`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <span className="text-5xl">🎫</span>
              <p className="mt-2 text-xs text-slate-400">이벤트 이미지</p>
            </div>
          </div>
        )}
        {/* Status Badge - Absolute positioned */}
        <div className="absolute left-3 top-3">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold shadow-lg backdrop-blur-sm ${statusMeta.tone}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${statusMeta.dotColor} animate-pulse`}></span>
            {statusMeta.label}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        {/* Title & Description */}
        <header className="space-y-2">
          <h3 className="text-lg font-bold text-slate-900 line-clamp-2 leading-tight">
            {campaign.title}
          </h3>
          <p className="text-sm text-slate-600 line-clamp-2">
            {campaign.description ?? "SNS 홍보와 연동된 초대권 이벤트입니다."}
          </p>
        </header>

        {/* Meta Information */}
        <dl className="space-y-2 text-sm">
          {performanceTitle && (
            <div className="flex items-center gap-2">
              <dt className="text-slate-500">🎭</dt>
              <dd className="font-medium text-slate-900 truncate">{performanceTitle}</dd>
            </div>
          )}
          {region && (
            <div className="flex items-center gap-2">
              <dt className="text-slate-500">📍</dt>
              <dd className="text-slate-700">{region}</dd>
            </div>
          )}
          {campaign.reward && (
            <div className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-2 border border-amber-200">
              <dt className="text-amber-600">🎁</dt>
              <dd className="font-semibold text-amber-900">{campaign.reward}</dd>
            </div>
          )}
        </dl>

        {/* Social Proof & Deadline */}
        <div className="mt-auto space-y-3 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs text-slate-600">
            {entryCount > 0 && (
              <div className="flex items-center gap-1">
                <span>👥</span>
                <span className="font-semibold text-slate-900">{entryCount.toLocaleString()}명</span>
                <span>참여 중</span>
              </div>
            )}
            {closesAt && (
              <div className="flex items-center gap-1 ml-auto">
                <span>⏰</span>
                <span className="font-medium text-slate-900">{closesAt}</span>
                <span>마감</span>
              </div>
            )}
          </div>

          {/* CTA Button */}
          <Link
            href={`/events/${campaign.slug ?? campaign.id}`}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 font-semibold text-white shadow-md transition-all hover:shadow-lg hover:scale-[1.02] active:scale-95"
          >
            <span>이벤트 상세보기</span>
            <span className="transition-transform group-hover:translate-x-1">→</span>
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
