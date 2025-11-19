import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TicketEntryFormSteps } from "@/components/forms/TicketEntryFormSteps";
import { getTicketCampaignBySlug } from "@/lib/supabase/queries";

interface EventDetailPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: EventDetailPageProps): Promise<Metadata> {
  const campaign = await getTicketCampaignBySlug(params.slug);
  if (!isCampaign(campaign)) {
    return { title: "이벤트를 찾을 수 없어요" };
  }
  return {
    title: `${campaign.title} · 초대권 이벤트`,
    description: campaign.description ?? "공연 단체가 직접 운영하는 초대권 이벤트입니다.",
  };
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const campaign = await getTicketCampaignBySlug(params.slug);
  if (!isCampaign(campaign)) {
    notFound();
  }

  const performance = campaign.performances;
  const status = getStatus(campaign);
  const closesAt = campaign.ends_at ? formatDateTime(campaign.ends_at) : null;

  return (
    <article className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-12 md:px-6 md:py-16">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className={`rounded px-3 py-1 text-xs font-semibold ${statusBadge(status)}`}>{statusLabel(status)}</span>
          {closesAt && <span className="text-sm text-slate-600">{closesAt} 마감</span>}
        </div>
        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">{campaign.title}</h1>
        <p className="mt-3 text-sm text-slate-600 md:text-base">{campaign.description ?? "SNS 홍보와 연동된 초대권 이벤트입니다."}</p>
        {campaign.reward && (
          <div className="mt-4 text-sm text-slate-700">
            <span className="font-semibold">제공:</span> {campaign.reward}
          </div>
        )}
        {performance && (
          <div className="mt-4 rounded-lg bg-slate-50 p-4 text-sm">
            <p className="font-semibold text-slate-900">{performance.title}</p>
          </div>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-slate-900">진행 안내</h2>
            <ol className="mt-3 space-y-2 text-sm text-slate-600">
              <li>1. 공연 단체가 등록한 정보에 따라 이벤트가 자동으로 열립니다.</li>
              <li>2. 관객은 아래 폼에서 응모하며, 필요한 최소 정보만 입력합니다.</li>
              <li>3. 선정된 관객 명단은 Event Hub에서 단체가 직접 확인하고 관람 여부를 체크합니다.</li>
            </ol>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
            <h3 className="text-base font-bold text-slate-900">유의 사항</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>중복 응모·허위 정보 입력 시 선정 대상에서 제외됩니다.</li>
              <li>선정자는 이메일로 개별 안내드리며, 공지 없이 양도할 수 없습니다.</li>
              <li>관람이 어려울 경우 최소 1일 전까지 회신해 주세요.</li>
            </ul>
          </div>
        </div>

        <TicketEntryFormSteps
          campaignId={campaign.id}
          slug={campaign.slug ?? campaign.id}
          campaignTitle={campaign.title}
          performanceTitle={performance?.title}
        />
      </section>
    </article>
  );
}

type CampaignRecord = Awaited<ReturnType<typeof getTicketCampaignBySlug>>;

function isCampaign(record: CampaignRecord): record is Exclude<CampaignRecord, null> & { id: string } {
  return Boolean(record && typeof record === "object" && "id" in record);
}

type CampaignStatus = "active" | "closed" | "upcoming";

function getStatus(campaign: Exclude<CampaignRecord, null> & { id: string }): CampaignStatus {
  const now = Date.now();
  const starts = campaign.starts_at ? new Date(campaign.starts_at).getTime() : null;
  const ends = campaign.ends_at ? new Date(campaign.ends_at).getTime() : null;
  if (starts && starts > now) return "upcoming";
  if (ends && ends < now) return "closed";
  return "active";
}

function statusBadge(status: CampaignStatus) {
  switch (status) {
    case "active":
      return "bg-slate-900 text-white";
    case "upcoming":
      return "bg-slate-100 text-slate-700";
    case "closed":
      return "bg-slate-200 text-slate-600";
  }
}

function statusLabel(status: CampaignStatus) {
  switch (status) {
    case "active":
      return "진행 중";
    case "upcoming":
      return "오픈 예정";
    case "closed":
      return "마감";
  }
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
