/**
 * 공연 상세 페이지 - V0 Design
 *
 * v0 디자인 시스템을 적용한 공연 상세 페이지
 */
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getPerformanceBySlug } from "@/lib/supabase/queries";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const performance = await getPerformanceBySlug(slug);

  if (!performance || !("title" in performance)) {
    return {
      title: "공연을 찾을 수 없습니다",
    };
  }

  return {
    title: `${performance.title} | Artause`,
    description: performance.synopsis || `${performance.title} 공연 정보`,
  };
}

export default async function PerformancePage({ params }: Props): Promise<React.JSX.Element> {
  const { slug } = await params;
  const performanceData = await getPerformanceBySlug(slug);

  if (!performanceData || !("title" in performanceData)) {
    notFound();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const performance = performanceData as any;

  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activeCampaigns = performance.ticket_campaigns?.filter((campaign: any) => {
    const starts = campaign.starts_at ? new Date(campaign.starts_at).getTime() : null;
    const ends = campaign.ends_at ? new Date(campaign.ends_at).getTime() : null;
    if (starts && starts > now) return false;
    if (ends && ends < now) return false;
    return true;
  }) || [];

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const period = performance.period_start || performance.period_end
    ? `${formatDate(performance.period_start) || "?"} ~ ${formatDate(performance.period_end) || "?"}`
    : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 md:px-8 md:py-16">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm">
        <Link
          href="/performances"
          className="text-[#6B6560] hover:text-[#2D2A26] transition-colors"
        >
          공연 목록
        </Link>
        <span className="text-[#E8E3DC]">/</span>
        <span className="text-[#2D2A26] font-medium">{performance.title}</span>
      </div>

      {/* Hero Section - v0 style */}
      <section className="rounded-3xl border border-[#E8E3DC] bg-white p-6 sm:p-8 md:p-10 shadow-lg">
        {performance.category && (
          <div className="mb-4">
            <span className="inline-flex items-center rounded-full bg-[#8B7BA8]/10 px-4 py-1.5 text-sm font-medium text-[#8B7BA8]">
              {performance.category}
            </span>
          </div>
        )}

        <h1 className="text-3xl font-bold leading-tight text-[#2D2A26] sm:text-4xl md:text-5xl">
          {performance.title}
        </h1>

        {performance.organization && (
          <p className="mt-4 text-lg text-[#6B6560]">
            기획·제작: <span className="font-semibold text-[#2D2A26]">{performance.organization}</span>
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          {performance.region && (
            <div className="flex items-center gap-2 rounded-xl border-2 border-[#E8E3DC] bg-[#F5EFE7] px-4 py-2 text-sm font-medium text-[#2D2A26]">
              <span>📍</span>
              <span>{performance.region}</span>
            </div>
          )}
          {period && (
            <div className="flex items-center gap-2 rounded-xl border-2 border-[#E8E3DC] bg-[#F5EFE7] px-4 py-2 text-sm font-medium text-[#2D2A26]">
              <span>📅</span>
              <span>{period}</span>
            </div>
          )}
          {performance.venue && (
            <div className="flex items-center gap-2 rounded-xl border-2 border-[#E8E3DC] bg-[#F5EFE7] px-4 py-2 text-sm font-medium text-[#2D2A26]">
              <span>🏛️</span>
              <span>{performance.venue}</span>
            </div>
          )}
        </div>
      </section>

      {/* Poster Section */}
      <section className="mt-8 sm:mt-10">
        <div className="relative aspect-[3/4] max-w-2xl mx-auto overflow-hidden rounded-3xl bg-gradient-to-br from-[#F5EFE7] to-[#E8D5D5] shadow-2xl">
          {performance.poster_url ? (
            <Image
              src={performance.poster_url}
              alt={`${performance.title} 포스터`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <span className="text-8xl">🎭</span>
                <p className="mt-4 text-lg font-medium text-[#6B6560]">포스터 이미지 준비 중</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Synopsis Section */}
      {performance.synopsis && (
        <section className="mt-8 sm:mt-10 rounded-3xl border border-[#E8E3DC] bg-white p-6 sm:p-8 md:p-10 shadow-lg">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#2D2A26] mb-6">작품 소개</h2>
          <div className="prose prose-slate max-w-none">
            <p className="whitespace-pre-wrap text-[#2D2A26] leading-relaxed text-base sm:text-lg">
              {performance.synopsis}
            </p>
          </div>
        </section>
      )}

      {/* Tags Section */}
      {"tags" in performance && performance.tags && Array.isArray(performance.tags) && performance.tags.length > 0 && (
        <section className="mt-8 sm:mt-10">
          <div className="flex flex-wrap gap-2">
            {performance.tags.map((tag: string) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full bg-[#8B7BA8]/10 px-4 py-2 text-sm font-medium text-[#8B7BA8] border border-[#8B7BA8]/20 hover:bg-[#8B7BA8]/20 transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Ticket Campaigns Section - v0 style */}
      {activeCampaigns.length > 0 && (
        <section className="mt-8 sm:mt-10 rounded-3xl border-2 border-[#8B7BA8]/30 bg-gradient-to-br from-[#8B7BA8]/5 to-[#E8D5D5]/30 p-6 sm:p-8 md:p-10 shadow-lg">
          <div className="mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-2 bg-[#8B7BA8] text-white px-4 py-2 rounded-full mb-4">
              <span className="text-xl">🎫</span>
              <span className="text-sm font-bold">진행중</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#2D2A26]">초대권 응모</h2>
            <p className="mt-2 text-[#6B6560]">
              지금 바로 응모 가능한 초대권 이벤트입니다
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {activeCampaigns.map((campaign: any) => {
              const closesAt = campaign.ends_at
                ? new Date(campaign.ends_at).toLocaleDateString("ko-KR", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : null;

              return (
                <article
                  key={campaign.id}
                  className="group relative overflow-hidden rounded-2xl border border-[#E8E3DC] bg-white p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-lg sm:text-xl font-bold text-[#2D2A26] group-hover:text-[#8B7BA8] transition-colors">
                        {campaign.title}
                      </h3>
                      <span className="shrink-0 rounded-full bg-[#8B7BA8]/10 px-3 py-1 text-xs font-bold text-[#8B7BA8]">
                        진행중
                      </span>
                    </div>
                    <p className="text-sm text-[#6B6560] line-clamp-2">
                      {campaign.description ?? "지금 바로 응모할 수 있는 초대권 이벤트입니다"}
                    </p>
                    <div className="space-y-2 text-sm">
                      {campaign.reward && (
                        <div className="flex items-center gap-2">
                          <span className="text-[#6B6560]">🎁</span>
                          <span className="font-semibold text-[#2D2A26]">{campaign.reward}</span>
                        </div>
                      )}
                      {closesAt && (
                        <div className="flex items-center gap-2">
                          <span className="text-[#6B6560]">⏰</span>
                          <span className="font-semibold text-[#2D2A26]">{closesAt} 마감</span>
                        </div>
                      )}
                    </div>
                    <Link
                      href={`/events/tickets/${campaign.slug ?? campaign.id}`}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#8B7BA8] px-6 py-3.5 font-bold text-white shadow-lg hover:bg-[#8B7BA8]/90 transition-all hover:shadow-xl active:scale-95"
                    >
                      <span>응모하기</span>
                      <span className="transition-transform group-hover:translate-x-1">→</span>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* No Campaigns Message */}
      {activeCampaigns.length === 0 && (
        <section className="mt-8 sm:mt-10 rounded-3xl border-2 border-dashed border-[#E8E3DC] bg-[#F5EFE7] p-8 sm:p-12 text-center">
          <div className="mx-auto max-w-md">
            <div className="text-6xl">🎟️</div>
            <h3 className="mt-4 text-xl sm:text-2xl font-bold text-[#2D2A26]">
              초대권 이벤트 준비 중
            </h3>
            <p className="mt-2 text-[#6B6560]">
              곧 초대권 이벤트가 열릴 예정입니다. 조금만 기다려주세요!
            </p>
            <Link
              href="/events"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#8B7BA8] px-6 py-3 font-bold text-white shadow-lg hover:bg-[#8B7BA8]/90 transition-all active:scale-95"
            >
              <span>다른 이벤트 보기</span>
              <span>→</span>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
