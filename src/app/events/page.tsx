import Link from "next/link";
import { TicketCampaignCard } from "@/components/marketing/TicketCampaignCard";
import { getTicketCampaigns } from "@/lib/supabase/queries";

type CampaignResult = Awaited<ReturnType<typeof getTicketCampaigns>>[number];
type ValidCampaign = Extract<CampaignResult, { id: string }>;

type CampaignStatus = "active" | "upcoming" | "closed";

export const metadata = {
  title: "초대권 이벤트",
  description: "관객 풀을 관리하며 조용한 시간대 규칙을 지키는 최소 단위의 초대권 운영 흐름입니다.",
};

export default async function EventsPage() {
  const campaigns = (await getTicketCampaigns()).filter(isCampaign);
  const now = new Date();

  const byStatus = campaigns.reduce<Record<CampaignStatus, ValidCampaign[]>>(
    (acc, campaign) => {
      const status = getCampaignStatus(campaign, now);
      acc[status].push(campaign);
      return acc;
    },
    { active: [], upcoming: [], closed: [] },
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <section className="rounded-3xl bg-indigo-950 p-10 text-white shadow-xl md:p-14">
        <p className="text-sm uppercase tracking-wide text-white/70">Invitation</p>
        <h1 className="mt-3 text-3xl font-semibold md:text-4xl">초대권 이벤트와 관객 풀 관리</h1>
        <p className="mt-4 max-w-3xl text-base text-white/80 md:text-lg">
          신청 폼, 중복 검증, 추첨 로그, 조용한 시간대 규칙을 하나의 흐름으로 연결했습니다. 지금은 최소 기능만
          제공하고, 향후에는 파트너 콘솔과 연동해 자동화 범위를 넓혀갈 예정입니다.
        </p>
        <div className="mt-8 grid gap-4 text-sm text-white/80 md:grid-cols-3">
          <MetricCard label="진행 중" value={`${byStatus.active.length}`} description="지금 신청 가능한 이벤트" />
          <MetricCard label="예정" value={`${byStatus.upcoming.length}`} description="곧 열리는 이벤트" />
          <MetricCard label="마감" value={`${byStatus.closed.length}`} description="기록용 보관" />
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/pricing" className="btn-secondary border-white/40 text-white hover:border-white/60 hover:text-white">
            이용 정책
          </Link>
          <Link href="/partners" className="btn-primary bg-white text-indigo-950 hover:bg-white/90">
            제휴 안내
          </Link>
        </div>
      </section>

      <EventsSection
        title="진행 중인 이벤트"
        subtitle="관객 풀 검증을 통과한 신청자만 조용한 시간대 이전에 참여할 수 있습니다."
        campaigns={byStatus.active}
        status="active"
        emptyMessage="현재 진행 중인 초대권 이벤트가 없습니다."
      />

      <EventsSection
        title="예정 이벤트"
        subtitle="오픈 예정일과 제공 리워드를 미리 안내합니다."
        campaigns={byStatus.upcoming}
        status="upcoming"
        emptyMessage="예정된 초대권 이벤트가 없습니다."
      />

      <EventsSection
        title="아카이브"
        subtitle="마감된 이벤트는 운영 기록과 추첨 로그 검토용으로 남겨둡니다."
        campaigns={byStatus.closed.slice(0, 6)}
        status="closed"
        emptyMessage="아카이브할 이벤트가 없습니다."
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

function getCampaignStatus(campaign: ValidCampaign, now: Date): CampaignStatus {
  const currentTime = now.getTime();
  const startsAt = campaign.starts_at ? new Date(campaign.starts_at).getTime() : undefined;
  const endsAt = campaign.ends_at ? new Date(campaign.ends_at).getTime() : undefined;

  if (startsAt && startsAt > currentTime) {
    return "upcoming";
  }

  if (endsAt && endsAt < currentTime) {
    return "closed";
  }

  return "active";
}
