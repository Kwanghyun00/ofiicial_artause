import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { TicketCampaignCard } from "@/components/marketing/TicketCampaignCard";
import { getPerformanceBySlug } from "@/lib/supabase/queries";

type ShowPerformance = Awaited<ReturnType<typeof getPerformanceBySlug>>[number];
type ValidShowPerformance = Extract<ShowPerformance, { id: string }>;

type ShowDetailPageProps = {
  params: { slug: string };
};

function isPerformanceRecord(performance: ShowPerformance): performance is ValidShowPerformance {
  return Boolean(performance && typeof performance === "object" && "id" in performance);
}

export async function generateMetadata({ params }: ShowDetailPageProps): Promise<Metadata> {
  const performance = await getPerformanceBySlug(params.slug);
  if (!isPerformanceRecord(performance)) {
    return {
      title: "공연을 찾을 수 없습니다",
    };
  }

  return {
    title: `${performance.title} | Artause`,
    description: performance.synopsis ?? "Artause 공연 상세",
    openGraph: {
      title: performance.title,
      description: performance.synopsis ?? undefined,
      type: "event",
      locale: "ko_KR",
    },
  };
}

export default async function ShowDetailPage({ params }: ShowDetailPageProps) {
  const performance = await getPerformanceBySlug(params.slug);
  if (!isPerformanceRecord(performance)) {
    notFound();
  }

  const ticketCampaigns = performance.ticket_campaigns ?? [];
  const period = buildPeriod(performance.period_start, performance.period_end);
  const eventSchema = buildEventSchema(performance);

  return (
    <article className="relative">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }} />

      <div className="relative h-[360px] w-full overflow-hidden">
        <Image
          src={performance.poster_url ?? "/images/mock/poster-default.svg"}
          alt={performance.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/80 via-indigo-950/60 to-indigo-950/40" />
        <div className="relative mx-auto flex h-full max-w-6xl flex-col justify-end px-6 py-16 text-white">
          <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-white/70">
            {performance.category ? <span>{performance.category}</span> : null}
            <span>·</span>
            <span>{statusLabel(performance.status)}</span>
          </div>
          <h1 className="mt-2 text-4xl font-semibold md:text-5xl">{performance.title}</h1>
          {performance.hero_headline ? (
            <p className="mt-3 text-lg text-white/80">{performance.hero_headline}</p>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-4 text-sm text-white/80">
            {period ? <span>공연 기간 {period}</span> : null}
            {performance.venue ? <span>공연장 {performance.venue}</span> : null}
            {performance.organization ? <span>주최/주관 {performance.organization}</span> : null}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            {performance.ticket_link ? (
              <Link
                href={performance.ticket_link}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary bg-white text-indigo-900 hover:bg-white/90"
              >
                공식 예매처 바로가기
              </Link>
            ) : null}
            <Link href="/events" className="btn-secondary border-white/40 text-white hover:border-white/60 hover:text-white">
              이벤트 신청
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-[2fr,1fr]">
        <div className="space-y-10">
          <section className="card space-y-4 p-8">
            <h2 className="text-2xl font-semibold text-slate-900">프로젝트 개요</h2>
            <p className="text-sm leading-relaxed text-slate-700">{performance.synopsis}</p>
          </section>

          {performance.tasks?.length ? (
            <section className="card space-y-4 p-8">
              <h2 className="text-2xl font-semibold text-slate-900">주요 미션</h2>
              <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700">
                {performance.tasks.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="card grid gap-6 p-8 md:grid-cols-2">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">추천 코드 & 리퍼럴 루프</h3>
              <p className="mt-2 text-sm text-slate-600">
                신청 단계에서 친구에게 공유할 추천 코드를 발급해 리퍼럴 플로우를 설계합니다. 추천이 누적되면 티켓 추가 응모권과 우선 초청 혜택이 자동으로 부여됩니다.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">추첨 & 체크인 자동화</h3>
              <p className="mt-2 text-sm text-slate-600">
                Edge Function 기반으로 추첨 스케줄을 예약하고, D+2 미체크 시 자동 취소 및 대기자 승급을 처리합니다. 결과는 DM · SMS · 이메일로 동시 발송됩니다.
              </p>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <div className="card space-y-4 p-6">
            <h3 className="text-lg font-semibold text-slate-900">기본 정보</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              {performance.region ? (
                <li>
                  <strong className="text-slate-800">지역</strong>
                  <br />
                  {performance.region}
                </li>
              ) : null}
              {period ? (
                <li>
                  <strong className="text-slate-800">기간</strong>
                  <br />
                  {period}
                </li>
              ) : null}
              {performance.venue ? (
                <li>
                  <strong className="text-slate-800">공연장</strong>
                  <br />
                  {performance.venue}
                </li>
              ) : null}
              {performance.organization ? (
                <li>
                  <strong className="text-slate-800">주체</strong>
                  <br />
                  {performance.organization}
                </li>
              ) : null}
            </ul>
          </div>

          <div className="card space-y-4 p-6">
            <h3 className="text-lg font-semibold text-slate-900">Artause 협업</h3>
            <p className="text-sm text-slate-600">
              비슷한 플랜을 검토 중이라면 운영팀과 연결해 맞춤형 티켓 플로우와 캠페인 플래닝을 상담받아 보세요.
            </p>
            <Link href="/request/promotion" className="btn-primary w-full">
              협업 문의하기
            </Link>
          </div>

          {ticketCampaigns.length ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">관련 이벤트</h3>
              <div className="space-y-3">
                {ticketCampaigns.map((campaign) => (
                  <TicketCampaignCard key={campaign.id} campaign={campaign} />
                ))}
              </div>
            </div>
          ) : null}
        </aside>
      </div>
    </article>
  );
}

function statusLabel(status?: string | null) {
  switch (status) {
    case "ongoing":
      return "진행 중";
    case "scheduled":
      return "예정";
    case "completed":
      return "종료";
    default:
      return "준비";
  }
}

function buildPeriod(start?: string | null, end?: string | null) {
  if (!start && !end) return null;
  if (start && end) {
    return `${formatDate(start)} ~ ${formatDate(end)}`;
  }
  return start ? formatDate(start) : formatDate(end!);
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function buildEventSchema(performance: ValidShowPerformance) {
  const startDate = performance.period_start ?? performance.created_at;
  const endDate = performance.period_end ?? performance.updated_at ?? performance.period_start;
  return {
    "@context": "https://schema.org",
    "@type": "TheaterEvent",
    name: performance.title,
    startDate,
    endDate,
    eventStatus: performance.status,
    location: performance.venue
      ? {
          "@type": "Place",
          name: performance.venue,
        }
      : undefined,
    organizer: performance.organization
      ? {
          "@type": "Organization",
          name: performance.organization,
        }
      : undefined,
    description: performance.synopsis,
    url: `https://artause-web.vercel.app/shows/${performance.slug}`,
  };
}
