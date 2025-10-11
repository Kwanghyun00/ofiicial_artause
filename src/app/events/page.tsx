import Link from "next/link";
import { TicketCampaignCard } from "@/components/marketing/TicketCampaignCard";
import { getTicketCampaigns } from "@/lib/supabase/queries";

type CampaignResult = Awaited<ReturnType<typeof getTicketCampaigns>>[number];
type ValidCampaign = Extract<CampaignResult, { id: string }>;

type CampaignStatus = "active" | "upcoming" | "closed";

export const metadata = {
  title: "이벤트 허브",
  description: "Artause에서 진행하는 티켓 이벤트와 추천/추첨 캠페인을 한 곳에서 확인하세요.",
};

export default async function EventsPage() {
  const campaigns = (await getTicketCampaigns()).filter(isCampaign);
  const now = Date.now();

  const byStatus = campaigns.reduce<Record<CampaignStatus, ValidCampaign[]>>(
    (acc, campaign) => {
      const status = getCampaignStatus(campaign, now);
      acc[status].push(campaign);
      return acc;
    },
    { active: [], upcoming: [], closed: [] }
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <section className="rounded-3xl bg-indigo-950 p-10 text-white shadow-xl md:p-14">
        <p className="text-sm uppercase tracking-wide text-white/70">Ticket Programs</p>
        <h1 className="mt-3 text-3xl font-semibold md:text-4xl">Artause 티켓 이벤트 허브</h1>
        <p className="mt-4 max-w-3xl text-base text-white/80 md:text-lg">
          Free · Plus · Pro 멤버십에 따라 응모 횟수, 조기 오픈, 추가 리포트를 제공하며 추천 코드 기반으로 친구 초대 루프를 열 수 있습니다. 제휴 파트너는 CTR · 유입 지표 리포트를, 운영팀은 추첨 자동화와 체크인 로그를 실시간으로 확인합니다.
        </p>
        <div className="mt-8 grid gap-4 text-sm text-white/80 md:grid-cols-3">
          <MetricCard label="진행 중" value={`${byStatus.active.length}건`} description="현재 응모 가능한 이벤트" />
          <MetricCard label="예정" value={`${byStatus.upcoming.length}건`} description="오픈 준비 중인 캠페인" />
          <MetricCard label="종료" value={`${byStatus.closed.length}건`} description="성과 리포트 정리 중" />
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/pricing" className="btn-secondary border-white/40 text-white hover:border-white/60 hover:text-white">
            멤버십 비교
          </Link>
          <Link href="/partners" className="btn-primary bg-white text-indigo-950 hover:bg-white/90">
            스폰서십 문의
          </Link>
        </div>
      </section>

      <EventsSection
        title="진행 중인 이벤트"
        subtitle="지금 바로 응모할 수 있는 캠페인입니다. Free 멤버는 1회, Plus/Pro는 추가 응모권이 제공됩니다."
        campaigns={byStatus.active}
        status="active"
        emptyMessage="현재 진행 중인 이벤트가 없습니다."
      />

      <EventsSection
        title="예정 이벤트"
        subtitle="오픈 예정인 캠페인을 미리 확인하고 알림을 신청하세요."
        campaigns={byStatus.upcoming}
        status="upcoming"
        emptyMessage="예정 이벤트가 곧 업데이트됩니다."
      />

      <EventsSection
        title="종료 이벤트"
        subtitle="완료된 이벤트의 운영 데이터를 기반으로 리포트를 제공하고 있습니다."
        campaigns={byStatus.closed.slice(0, 6)}
        status="closed"
        emptyMessage="종료된 이벤트가 아직 없습니다."
      />
    </div>
  );
}

function isCampaign(record: CampaignResult): record is ValidCampaign {
  return Boolean(record && typeof record === "object" && "id" in record);
}

type MetricCardProps = {
  label: string;
  value: string;
  description: string;
};

function MetricCard({ label, value, description }: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-white/20 bg-white/10 p-5">
      <p className="text-xs uppercase tracking-wide text-white/60">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-xs text-white/70">{description}</p>
    </div>
  );
}

type EventsSectionProps = {
  title: string;
  subtitle: string;
  campaigns: ValidCampaign[];
  status: CampaignStatus;
  emptyMessage: string;
};

function EventsSection({ title, subtitle, campaigns, status, emptyMessage }: EventsSectionProps) {
  return (
    <section className="mt-14">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="section-heading">{title}</h2>
          <p className="section-subtitle">{subtitle}</p>
        </div>
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {campaigns.length ? (
          campaigns.map((campaign) => <TicketCampaignCard key={campaign.id} campaign={campaign} status={status} />)
        ) : (
          <div className="card p-10 text-center text-sm text-slate-500 md:col-span-2">{emptyMessage}</div>
        )}
      </div>
    </section>
  );
}

function getCampaignStatus(campaign: ValidCampaign, now: number): CampaignStatus {
  const startsAt = campaign.starts_at ? new Date(campaign.starts_at).getTime() : undefined;
  const endsAt = campaign.ends_at ? new Date(campaign.ends_at).getTime() : undefined;

  if (startsAt && startsAt > now) {
    return "upcoming";
  }

  if (endsAt && endsAt < now) {
    return "closed";
  }

  return "active";
}
