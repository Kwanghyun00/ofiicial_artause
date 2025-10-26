import Link from "next/link";

type Show = {
  id: string;
  slug: string;
  title: string;
  hero_headline?: string | null;
  hero_subtitle?: string | null;
  category?: string | null;
  region?: string | null;
  period_start?: string | null;
  period_end?: string | null;
  venue?: string | null;
  poster_url?: string | null;
};

type Campaign = {
  id: string;
  slug?: string | null;
  title: string;
  description?: string | null;
  reward?: string | null;
  starts_at?: string | null;
  ends_at?: string | null;
  form_link?: string | null;
  performances?: {
    slug: string;
    title: string;
    poster_url: string | null;
  } | null;
};

type Organization = {
  id: string;
  name: string;
  region?: string | null;
  tagline?: string | null;
};

type Props = {
  featuredShows: Show[];
  campaigns: Campaign[];
  organizations: Organization[];
};

export function HomeLanding({ featuredShows, campaigns, organizations }: Props) {
  const highlightedShows = featuredShows.slice(0, 3);
  const activeCampaigns = campaigns.filter((campaign) => getCampaignStatus(campaign) === "active").slice(0, 3);
  const trustedPartners = organizations.slice(0, 3);

  const heroStats = [
    { label: "이번 주 업데이트", value: `${featuredShows.length}건` },
    { label: "진행 중인 초대권", value: `${activeCampaigns.length}건` },
    { label: "제휴 단체", value: `${organizations.length}곳` },
  ];

  return (
    <div className="space-y-16 md:space-y-20">
      <section className="rounded-[32px] bg-slate-950 px-6 py-12 text-white shadow-2xl md:px-10 md:py-16">
        <p className="text-sm uppercase tracking-[0.2em] text-white/70">Offline Arts Navigator</p>
        <h1 className="mt-4 text-3xl font-semibold leading-tight md:text-5xl">
          공연·전시 정보와 초대권 이벤트를 한 번에 정리한 아트하우스
        </h1>
        <p className="mt-6 max-w-3xl text-base text-white/80 md:text-lg">
          카피를 위한 화려한 모션 대신, 실제 오프라인 프로그램 정보를 한국어로 빠르게 전달합니다.
          공연·전시 데이터와 초대권 이벤트를 묶어 관객 흐름을 정리하고, 내부 관객 풀도 조용히 관리할 수 있습니다.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/shows" className="btn-primary bg-white text-slate-950 hover:bg-white/90">
            공연 · 전시 둘러보기
          </Link>
          <Link href="/events" className="btn-secondary border-white/40 text-white hover:border-white/60 hover:text-white">
            초대권 이벤트 보기
          </Link>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {heroStats.map((stat) => (
            <div key={stat.label} className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-white/80">
              <p className="text-xs uppercase tracking-widest text-white/60">{stat.label}</p>
              <p className="mt-3 text-3xl font-semibold text-white">{stat.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {servicePillars.map((pillar) => (
          <article key={pillar.title} className="card h-full space-y-3 p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">{pillar.category}</p>
            <h2 className="text-xl font-semibold text-slate-900">{pillar.title}</h2>
            <p className="text-sm leading-relaxed text-slate-600">{pillar.description}</p>
            <ul className="space-y-2 text-sm text-slate-500">
              {pillar.points.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-500" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section>
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="section-heading">이번 주 포커스</h2>
            <p className="section-subtitle">모바일에서 쉽게 읽히도록 재정리한 공연·전시 요약입니다.</p>
          </div>
          <Link href="/shows" className="btn-secondary">
            전체 보기
          </Link>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {highlightedShows.length ? (
            highlightedShows.map((show) => <HomeShowCard key={show.id} show={show} />)
          ) : (
            <div className="card p-8 text-sm text-slate-500">등록된 공연 정보가 없습니다.</div>
          )}
        </div>
      </section>

      <section>
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="section-heading">초대권 이벤트</h2>
            <p className="section-subtitle">
              리드 수집 폼과 내부 추첨 로직을 연결한 최소 단위의 초대권 운영 흐름입니다.
            </p>
          </div>
          <Link href="/events" className="btn-secondary">
            이벤트 전체 보기
          </Link>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {activeCampaigns.length ? (
            activeCampaigns.map((campaign) => <HomeCampaignCard key={campaign.id} campaign={campaign} />)
          ) : (
            <div className="card p-8 text-sm text-slate-500">현재 진행 중인 초대권 이벤트가 없습니다.</div>
          )}
        </div>
      </section>

      <section className="card space-y-6 p-8 md:p-10">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-indigo-500">Audience Ops</p>
            <h2 className="text-2xl font-semibold text-slate-900">관객 풀과 초대 대상 관리</h2>
            <p className="mt-2 text-sm text-slate-600">
              신청 폼부터 추첨 결과, 조용한 시간대 발송 규칙까지 필요한 최소 항목만 남겼습니다.
              내부 전용으로 정리된 명단은 외부에 노출되지 않습니다.
            </p>
          </div>
          <Link href="/request/promotion" className="btn-primary">
            제휴 문의 보내기
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {audienceOps.map((item) => (
            <div key={item.title} className="rounded-3xl border border-slate-100 bg-white p-6">
              <p className="text-sm font-semibold text-slate-900">{item.title}</p>
              <p className="mt-2 text-sm text-slate-600">{item.description}</p>
            </div>
          ))}
        </div>
        <div className="rounded-3xl border border-dashed border-slate-200 p-6 text-sm text-slate-600">
          <p className="font-semibold text-slate-900">함께하는 단체</p>
          <div className="mt-3 grid gap-4 md:grid-cols-3">
            {trustedPartners.length ? (
              trustedPartners.map((org) => (
                <div key={org.id}>
                  <p className="text-base font-semibold text-slate-900">{org.name}</p>
                  {org.tagline ? <p className="text-sm text-slate-500">{org.tagline}</p> : null}
                  {org.region ? <p className="text-xs text-slate-400">{org.region}</p> : null}
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">등록된 제휴 단체가 없습니다.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

const servicePillars = [
  {
    category: "Discovery",
    title: "공연 · 전시 한눈에",
    description: "KOPIS 기반 메타데이터와 자체 검수 노트로 공연·전시 정보를 통일된 카드로 보여줍니다.",
    points: ["모바일 최적화 카드", "지역/장르 필터", "소개 문장 자동 요약"],
  },
  {
    category: "Invitation",
    title: "초대권 이벤트 운영",
    description: "내부 전용 초대권 폼을 만들어 신청자를 받고, 조용한 시간대 규칙을 검증해 발송합니다.",
    points: ["카카오 간편 로그인", "추첨 로그 저장", "조용한 시간대 자동 적용"],
  },
  {
    category: "Ops",
    title: "관객 풀 관리",
    description: "캠페인별 중복 신청을 줄이고, 추천인 · 신규 관객 등의 상태를 바로 확인할 수 있습니다.",
    points: ["중복 체크 & 경고", "추천 코드 추적", "내부 메모 필드"],
  },
];

const audienceOps = [
  {
    title: "관객 세그먼트",
    description: "신규/재방문/추천 관객을 구분해 초대권을 배분합니다.",
  },
  {
    title: "조용한 시간대",
    description: "22시~08시에는 알림을 예약 발송해 피로도를 낮춥니다.",
  },
  {
    title: "명단 감사 로그",
    description: "누가 언제 초청 상태를 바꿨는지 기록을 남깁니다.",
  },
];

function getCampaignStatus(campaign: Campaign): "active" | "upcoming" | "closed" {
  const now = Date.now();
  const startsAt = campaign.starts_at ? new Date(campaign.starts_at).getTime() : null;
  const endsAt = campaign.ends_at ? new Date(campaign.ends_at).getTime() : null;

  if (startsAt && startsAt > now) return "upcoming";
  if (endsAt && endsAt < now) return "closed";
  return "active";
}

function formatDateRange(start?: string | null, end?: string | null) {
  if (!start && !end) return null;
  const startText = start ? formatDate(start) : null;
  const endText = end ? formatDate(end) : null;

  if (startText && endText) {
    return `${startText} ~ ${endText}`;
  }
  return startText ?? `~ ${endText}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("ko-KR", {
    month: "short",
    day: "numeric",
  });
}

function HomeShowCard({ show }: { show: Show }) {
  const dateRange = formatDateRange(show.period_start, show.period_end);

  return (
    <article className="group flex flex-col rounded-3xl border border-white/60 bg-white/70 p-6 shadow-lg transition hover:-translate-y-1">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">{show.category ?? "Program"}</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-900">{show.title}</h3>
          {show.hero_headline ? <p className="mt-1 text-sm text-slate-600">{show.hero_headline}</p> : null}
        </div>
        {show.region ? <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">{show.region}</span> : null}
      </div>
      <dl className="mt-4 space-y-2 text-sm text-slate-600">
        {dateRange ? (
          <div className="flex items-start gap-2">
            <dt className="text-xs uppercase tracking-wide text-slate-400">기간</dt>
            <dd>{dateRange}</dd>
          </div>
        ) : null}
        {show.venue ? (
          <div className="flex items-start gap-2">
            <dt className="text-xs uppercase tracking-wide text-slate-400">공간</dt>
            <dd>{show.venue}</dd>
          </div>
        ) : null}
      </dl>
      <Link href={`/shows/${show.slug}`} className="mt-6 inline-flex items-center text-sm font-semibold text-indigo-600 underline-offset-4 group-hover:underline">
        상세 보기
      </Link>
    </article>
  );
}

function HomeCampaignCard({ campaign }: { campaign: Campaign }) {
  const status = getCampaignStatus(campaign);
  const closesAt = campaign.ends_at ? new Date(campaign.ends_at).toLocaleDateString("ko-KR", { month: "short", day: "numeric" }) : null;

  return (
    <article className="flex flex-col rounded-3xl border border-white/60 bg-white/80 p-6 shadow-lg">
      <div className="flex items-start gap-4">
        <div className="h-16 w-16 overflow-hidden rounded-2xl bg-slate-200">
          <img
            src={campaign.performances?.poster_url ?? "/images/mock/poster-default.svg"}
            alt={campaign.performances?.title ?? campaign.title}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex-1">
          <p className="text-xs uppercase tracking-wide text-slate-500">초대권 이벤트</p>
          <h3 className="mt-1 text-lg font-semibold text-slate-900">{campaign.title}</h3>
          <p className="mt-1 text-sm text-slate-600 line-clamp-2">
            {campaign.description ?? "관객 풀 검증 후 초대권을 배포하는 이벤트입니다."}
          </p>
        </div>
        <span className={`badge ${statusBadge(status)}`}>{statusLabel(status)}</span>
      </div>
      <dl className="mt-4 space-y-2 text-sm text-slate-600">
        {campaign.reward ? (
          <div className="flex items-start gap-2">
            <dt className="text-xs uppercase tracking-wide text-slate-400">선물</dt>
            <dd>{campaign.reward}</dd>
          </div>
        ) : null}
        {closesAt ? (
          <div className="flex items-start gap-2">
            <dt className="text-xs uppercase tracking-wide text-slate-400">마감</dt>
            <dd>{closesAt}</dd>
          </div>
        ) : null}
      </dl>
      <div className="mt-6 flex flex-wrap gap-3 text-sm">
        <Link href={`/events/${campaign.slug ?? campaign.id}`} className="btn-secondary">
          이벤트 상세
        </Link>
        {campaign.form_link ? (
          <a href={campaign.form_link} className="btn-secondary border-slate-200 text-slate-700 hover:border-slate-300" target="_blank" rel="noreferrer">
            신청 폼 열기
          </a>
        ) : null}
      </div>
    </article>
  );
}

function statusLabel(status: "active" | "upcoming" | "closed") {
  switch (status) {
    case "active":
      return "진행 중";
    case "upcoming":
      return "예정";
    case "closed":
      return "마감";
  }
}

function statusBadge(status: "active" | "upcoming" | "closed") {
  switch (status) {
    case "active":
      return "bg-emerald-100 text-emerald-700";
    case "upcoming":
      return "bg-amber-100 text-amber-700";
    case "closed":
      return "bg-slate-200 text-slate-600";
  }
}
