import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
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
    <article className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 md:px-8 md:py-16">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm">
        <Link href="/events" className="text-[#6B6560] hover:text-[#2D2A26] transition-colors">
          이벤트 목록
        </Link>
        <span className="text-[#E8E3DC]">/</span>
        <span className="text-[#2D2A26] font-medium">{campaign.title}</span>
      </div>

      {/* Header Section - v0 style */}
      <section className="rounded-3xl border border-[#E8E3DC] bg-white p-6 sm:p-8 md:p-10 shadow-lg mb-8">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold ${statusBadge(status)}`}>
            {statusLabel(status)}
          </span>
          {closesAt && (
            <span className="text-sm text-[#6B6560]">
              <span className="mr-1">⏰</span>
              {closesAt} 마감
            </span>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#2D2A26] mb-4">
          {campaign.title}
        </h1>

        <p className="text-base sm:text-lg text-[#6B6560] leading-relaxed">
          {campaign.description ?? "SNS 홍보와 연동된 초대권 이벤트입니다."}
        </p>

        {campaign.reward && (
          <div className="mt-6 flex items-center gap-2 rounded-xl border-2 border-[#8B7BA8]/20 bg-[#8B7BA8]/5 px-5 py-3">
            <span className="text-xl">🎁</span>
            <div>
              <span className="text-sm font-medium text-[#6B6560]">제공 내용</span>
              <p className="text-base font-bold text-[#2D2A26]">{campaign.reward}</p>
            </div>
          </div>
        )}

        {performance && (
          <div className="mt-6 rounded-2xl border border-[#E8E3DC] bg-[#F5EFE7] p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🎭</span>
              <span className="text-sm font-medium text-[#6B6560]">연결된 공연</span>
            </div>
            <Link
              href={`/performances/${performance.slug}`}
              className="text-lg font-bold text-[#8B7BA8] hover:text-[#8B7BA8]/80 transition-colors"
            >
              {performance.title} →
            </Link>
          </div>
        )}
      </section>

      {/* Content Grid */}
      <div className="grid gap-8 lg:grid-cols-[1.2fr,0.8fr]">
        {/* Left Column: Guidelines */}
        <div className="space-y-6">
          {/* How it Works */}
          <section className="rounded-2xl border border-[#E8E3DC] bg-white p-6 sm:p-8 shadow-md">
            <h2 className="text-xl sm:text-2xl font-bold text-[#2D2A26] mb-4 flex items-center gap-2">
              <span className="text-2xl">📝</span>
              진행 안내
            </h2>
            <ol className="space-y-3 text-sm sm:text-base text-[#2D2A26]">
              <li className="flex gap-3">
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-[#8B7BA8] text-white text-xs font-bold">
                  1
                </span>
                <span>공연 단체가 등록한 정보에 따라 이벤트가 자동으로 열립니다.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-[#8B7BA8] text-white text-xs font-bold">
                  2
                </span>
                <span>관객은 오른쪽 폼에서 응모하며, 필요한 최소 정보만 입력합니다.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-[#8B7BA8] text-white text-xs font-bold">
                  3
                </span>
                <span>선정된 관객 명단은 Event Hub에서 단체가 직접 확인하고 관람 여부를 체크합니다.</span>
              </li>
            </ol>
          </section>

          {/* Important Notes */}
          <section className="rounded-2xl border-2 border-[#D97B7B]/30 bg-[#D97B7B]/5 p-6 sm:p-8">
            <h3 className="text-lg sm:text-xl font-bold text-[#2D2A26] mb-4 flex items-center gap-2">
              <span className="text-2xl">⚠️</span>
              유의 사항
            </h3>
            <ul className="space-y-2 text-sm sm:text-base text-[#2D2A26]">
              <li className="flex gap-2">
                <span className="text-[#D97B7B] flex-shrink-0">•</span>
                <span>중복 응모·허위 정보 입력 시 선정 대상에서 제외됩니다.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#D97B7B] flex-shrink-0">•</span>
                <span>선정자는 이메일로 개별 안내드리며, 공지 없이 양도할 수 없습니다.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#D97B7B] flex-shrink-0">•</span>
                <span>관람이 어려울 경우 최소 1일 전까지 회신해 주세요.</span>
              </li>
            </ul>
          </section>
        </div>

        {/* Right Column: Application Form */}
        <div className="lg:sticky lg:top-8 lg:self-start">
          <TicketEntryFormSteps
            campaignId={campaign.id}
            slug={campaign.slug ?? campaign.id}
            campaignTitle={campaign.title}
            performanceTitle={performance?.title}
          />
        </div>
      </div>
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
      return "bg-[#8B7BA8] text-white shadow-md";
    case "upcoming":
      return "bg-[#F5EFE7] text-[#6B6560] border border-[#E8E3DC]";
    case "closed":
      return "bg-[#E8E3DC] text-[#6B6560]";
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
