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
      title: "Show not found",
    };
  }

  return {
    title: `${performance.title} | Artause`,
    description: performance.synopsis ?? "Show detail",
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
            <span>?</span>
            <span>{statusLabel(performance.status)}</span>
          </div>
          <h1 className="mt-2 text-4xl font-semibold md:text-5xl">{performance.title}</h1>
          {performance.hero_headline ? (
            <p className="mt-3 text-lg text-white/80">{performance.hero_headline}</p>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-4 text-sm text-white/80">
            {period ? <span>Run period {period}</span> : null}
            {performance.venue ? <span>Venue {performance.venue}</span> : null}
            {performance.organization ? <span>Presented by {performance.organization}</span> : null}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            {performance.ticket_link ? (
              <Link
                href={performance.ticket_link}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary bg-white text-indigo-900 hover:bg-white/90"
              >
                Buy tickets
              </Link>
            ) : null}
            <Link href="/events" className="btn-secondary border-white/40 text-white hover:border-white/60 hover:text-white">
              View entry events
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-[2fr,1fr]">
        <div className="space-y-10">
          <section className="card space-y-4 p-8">
            <h2 className="text-2xl font-semibold text-slate-900">About the show</h2>
            <p className="text-sm leading-relaxed text-slate-700">{performance.synopsis ?? "Synopsis coming soon."}</p>
          </section>

          {performance.tasks?.length ? (
            <section className="card space-y-4 p-8">
              <h2 className="text-2xl font-semibold text-slate-900">Highlights</h2>
              <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700">
                {performance.tasks.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="card grid gap-6 p-8 md:grid-cols-2">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Entry checklist</h3>
              <p className="mt-2 text-sm text-slate-600">
                The audience journey follows PRD_AUDIENCE. Complete Intro-first and AdGate before using the entry form.
              </p>
              <ul className="mt-3 space-y-2 text-xs text-slate-600">
                <li>Intro-first: scroll &gt;= 60% OR dwell &gt;= 5 seconds (TTL 24h)</li>
                <li>AdGate: allowed referrer + utm_campaign + dwell &gt;= 5 seconds (TTL 24h)</li>
                <li>Entry: duplicate (campaignId, Kakao user) blocked with HTTP 409</li>
                <li>Precondition failure: HTTP 412 with guidance to revisit show detail</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Automation & audit</h3>
              <p className="mt-2 text-sm text-slate-600">
                Edge Functions log Intro-first and AdGate decisions, lottery draws use weighted sampling (cap 4.0), and quiet hours (22:00-08:00 KST) pause notifications.
              </p>
              <ul className="mt-3 space-y-2 text-xs text-slate-600">
                <li>Lottery bonuses: newbie +0.3, referral +0.05 (cap +0.3), loss +0.1 (cap +0.3)</li>
                <li>Cooling: winners within 14 days carry weight x0.5</li>
                <li>Attribution: Last AdGate touch for campaign reporting</li>
              </ul>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <div className="card space-y-4 p-6">
            <h3 className="text-lg font-semibold text-slate-900">Essentials</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              {performance.region ? (
                <li>
                  <strong className="text-slate-800">Region</strong>
                  <br />
                  {performance.region}
                </li>
              ) : null}
              {period ? (
                <li>
                  <strong className="text-slate-800">Schedule</strong>
                  <br />
                  {period}
                </li>
              ) : null}
              {performance.venue ? (
                <li>
                  <strong className="text-slate-800">Venue</strong>
                  <br />
                  {performance.venue}
                </li>
              ) : null}
              {performance.organization ? (
                <li>
                  <strong className="text-slate-800">Company</strong>
                  <br />
                  {performance.organization}
                </li>
              ) : null}
            </ul>
          </div>

          <div className="card space-y-4 p-6">
            <h3 className="text-lg font-semibold text-slate-900">Need partner access?</h3>
            <p className="text-sm text-slate-600">
              Promotion requests, AdGate approvals, and audit actions live in the Slate console. Only whitelisted Kakao IDs with TOTP can access admin screens.
            </p>
            <Link href="/request/promotion" className="btn-primary w-full">
              Submit promotion request
            </Link>
          </div>

          {ticketCampaigns.length ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">Ticket events</h3>
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
      return "Active";
    case "scheduled":
      return "Upcoming";
    case "completed":
      return "Closed";
    default:
      return "Planned";
  }
}

function buildPeriod(start?: string | null, end?: string | null) {
  if (!start && !end) return null;
  const startDate = start ? new Date(start) : null;
  const endDate = end ? new Date(end) : null;

  if (startDate && endDate) {
    return `${formatDate(startDate)} -&gt; ${formatDate(endDate)}`;
  }

  if (startDate) {
    return `From ${formatDate(startDate)}`;
  }

  if (endDate) {
    return `Until ${formatDate(endDate)}`;
  }

  return null;
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function buildEventSchema(performance: ValidShowPerformance) {
  const start = performance.period_start ? new Date(performance.period_start).toISOString() : undefined;
  const end = performance.period_end ? new Date(performance.period_end).toISOString() : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: performance.title,
    startDate: start,
    endDate: end,
    location: performance.venue
      ? {
          "@type": "Place",
          name: performance.venue,
          address: performance.region ?? undefined,
        }
      : undefined,
    image: performance.poster_url ?? undefined,
    description: performance.synopsis ?? undefined,
    organizer: performance.organization
      ? {
          "@type": "Organization",
          name: performance.organization,
        }
      : undefined,
    eventStatus: schemaStatus(performance.status),
  };
}

function schemaStatus(status?: string | null) {
  switch (status) {
    case "ongoing":
      return "https://schema.org/EventScheduled";
    case "scheduled":
      return "https://schema.org/EventScheduled";
    case "completed":
      return "https://schema.org/EventCompleted";
    default:
      return "https://schema.org/EventScheduled";
  }
}
