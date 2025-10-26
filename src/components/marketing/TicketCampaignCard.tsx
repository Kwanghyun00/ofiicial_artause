import Image from "next/image";
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
  closed: { label: "마감", tone: "bg-slate-500/15 text-slate-600" },
};

export function TicketCampaignCard({ campaign, status = "active" }: TicketCampaignCardProps) {
  const performance = campaign.performances;
  const closesAt = campaign.ends_at ? formatDate(campaign.ends_at) : null;
  const campaignUrl = `/events/${campaign.slug ?? campaign.id}`;
  const statusMeta = STATUS_MAP[status];

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-white/60 bg-white/70 p-6 shadow-lg">
      <div className="flex items-start gap-4">
        <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-slate-200">
          <Image
            src={performance?.poster_url ?? "/images/mock/poster-default.svg"}
            alt={performance?.title ?? "Artause event"}
            fill
            className="object-cover"
            sizes="64px"
          />
        </div>
        <div className="flex-1">
          <p className="text-xs uppercase tracking-wide text-slate-500">초대권 이벤트</p>
          <h3 className="mt-1 text-lg font-semibold text-slate-900">{campaign.title}</h3>
          <p className="mt-1 text-sm text-slate-600 line-clamp-2">
            {campaign.description ?? "관객 풀을 검증한 뒤 필요한 수량만큼 초대권을 배포합니다."}
          </p>
        </div>
        <span className={`badge ${statusMeta.tone}`}>{statusMeta.label}</span>
      </div>
      <div className="grid gap-3 text-xs text-slate-600 md:grid-cols-2">
        {performance ? (
          <div>
            <p className="font-semibold text-slate-800">연동 공연</p>
            <p className="mt-1 text-slate-600">{performance.title}</p>
            <Link href={`/shows/${performance.slug}`} className="mt-2 inline-flex text-indigo-600 underline-offset-2 hover:underline">
              공연 살펴보기
            </Link>
          </div>
        ) : null}
        <div>
          <p className="font-semibold text-slate-800">운영 원칙</p>
          <ul className="mt-1 space-y-1">
            <li>신청자 정보 최소 항목만 수집</li>
            <li>중복 신청 및 추천 코드 검증</li>
            <li>조용한 시간대(22시~08시) 발송 제한</li>
          </ul>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
        {closesAt ? <span>마감 {closesAt}</span> : null}
        <Link href={campaignUrl} className="btn-secondary border-slate-200 text-slate-700 hover:border-slate-300">
          이벤트 상세
        </Link>
      </div>
    </div>
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
