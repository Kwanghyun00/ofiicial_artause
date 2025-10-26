import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TicketEntryForm } from "@/components/forms/TicketEntryForm";
import { ReferralSharePanel } from "@/components/events/ReferralSharePanel";
import { getTicketCampaignBySlug } from "@/lib/supabase/queries";

interface EventDetailPageProps {
  params: { slug: string };
}

type CampaignResult = Awaited<ReturnType<typeof getTicketCampaignBySlug>>;
type ValidCampaign = Extract<CampaignResult, { id: string }>;

type ReferralLeader = {
  rank: number;
  code: string;
  entries: number;
};

const REFERRAL_LEADER_MOCK: ReferralLeader[] = [
  { rank: 1, code: "nightloop", entries: 12 },
  { rank: 2, code: "studio.flow", entries: 9 },
  { rank: 3, code: "kyung", entries: 5 },
];

function isCampaignRecord(record: CampaignResult): record is ValidCampaign {
  return Boolean(record && typeof record === "object" && "id" in record);
}

export async function generateMetadata({ params }: EventDetailPageProps): Promise<Metadata> {
  const campaign = await getTicketCampaignBySlug(params.slug);
  if (!isCampaignRecord(campaign)) {
    return { title: "이벤트를 찾을 수 없습니다" };
  }

  return {
    title: `${campaign.title} | Artause 이벤트`,
    description: campaign.description ?? "Artause 티켓 이벤트 안내",
  };
}

type CampaignStatus = "active" | "upcoming" | "closed";

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const campaign = await getTicketCampaignBySlug(params.slug);
  if (!isCampaignRecord(campaign)) {
    notFound();
  }

  const performance = campaign.performances;
  const status = getCampaignStatus(campaign);
  const startsAt = campaign.starts_at ? formatDateTime(campaign.starts_at) : null;
  const endsAt = campaign.ends_at ? formatDateTime(campaign.ends_at) : null;
  const slug = campaign.slug ?? campaign.id;

  return (
    <article className="mx-auto max-w-5xl px-6 py-16">
      <header className="card space-y-4 bg-indigo-950 p-10 text-white shadow-xl">
        <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-white/60">
          <span>티켓 이벤트</span>
          <span className={`badge ${statusBadgeTone(status)}`}>{statusLabel(status)}</span>
        </div>
        <h1 className="text-3xl font-semibold md:text-4xl">{campaign.title}</h1>
        {campaign.description ? <p className="text-sm text-white/80 md:text-base">{campaign.description}</p> : null}
        <div className="flex flex-wrap gap-4 text-xs text-white/70">
          {startsAt ? <span>응모 시작 {startsAt}</span> : null}
          {endsAt ? <span>응모 종료 {endsAt}</span> : null}
          <span>추첨 결과는 D+2에 안내</span>
        </div>
        <div className="flex flex-wrap gap-3">
          {performance ? (
            <Link href={`/shows/${performance.slug}`} className="btn-secondary border-white/40 text-white hover:border-white/60 hover:text-white">
              공연 상세 보기
            </Link>
          ) : null}
          <Link href="/pricing" className="btn-secondary border-white/40 text-white hover:border-white/60 hover:text-white">
            접근 정책 보기
          </Link>
        </div>
      </header>

      <section className="mt-14 grid gap-6 md:grid-cols-[2fr,1fr]">
        <div className="space-y-8">
          <div className="card space-y-4 p-8">
            <h2 className="text-xl font-semibold text-slate-900">진행 안내</h2>
            <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-700">
              <li>Intro-first(스크롤 60% 또는 체류 5초)를 충족하면 24시간 동안 안내 모달이 숨겨집니다.</li>
              <li>AdGate 조건(허용 도메인 + utm_campaign + dwell 5초)을 통과해야 응모 폼에 접근할 수 있습니다.</li>
              <li>추첨 결과는 이메일·SMS·카카오톡으로 전달되며, Quiet hours(22:00~08:00)에는 알림을 발송하지 않습니다.</li>
            </ol>
          </div>

          <div className="card space-y-4 p-8">
            <h2 className="text-xl font-semibold text-slate-900">유의 사항</h2>
            <ul className="space-y-3 text-sm text-slate-700">
              <li>카카오 로그인 세션이 없는 경우 응모할 수 없습니다. 이메일·비밀번호 회원제는 지원하지 않습니다.</li>
              <li>중복 응모는 409 상태 코드로 차단되며, 동일 Kakao ID는 1건만 유지됩니다.</li>
              <li>조작이 의심되는 경우 /audit 엔드포인트를 통해 즉시 무효화됩니다.</li>
            </ul>
          </div>

          {campaign.reward ? (
            <div className="card space-y-4 p-8">
              <h2 className="text-xl font-semibold text-slate-900">리워드</h2>
              <p className="text-sm text-slate-700">{campaign.reward}</p>
            </div>
          ) : null}
        </div>

        <aside className="space-y-6">
          <TicketEntryForm
            campaignId={campaign.id}
            slug={slug}
            campaignTitle={campaign.title}
            performanceTitle={performance?.title}
          />

          <div className="card space-y-4 p-6">
            <h3 className="text-lg font-semibold text-slate-900">가중치 규칙 요약</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>기본 가중치 1.0, 최대 4.0</li>
              <li>신규 30일 +0.3, 추천 1회 +0.05 (최대 +0.3)</li>
              <li>결손 복구 +0.1 (최대 +0.3), 얼리버드 +0.1, 지역 +0.1</li>
              <li>최근 14일 내 당첨자는 가중치 50%로 냉각</li>
            </ul>
          </div>

          <ReferralSharePanel campaignTitle={campaign.title} />

          <div className="card space-y-4 p-6">
            <h3 className="text-lg font-semibold text-slate-900">추천 상위 3명</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              {REFERRAL_LEADER_MOCK.map((leader) => (
                <li key={leader.code} className="flex items-center justify-between rounded-2xl bg-slate-100 px-4 py-2">
                  <span className="font-semibold text-slate-700">#{leader.rank} {leader.code}</span>
                  <span className="text-xs text-slate-500">{leader.entries}회 응모</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card space-y-4 p-6">
            <h3 className="text-lg font-semibold text-slate-900">운영 체크리스트</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>Edge Function으로 응모·AdGate 로그를 실시간 기록</li>
              <li>알림 발송은 Quiet hours 정책을 준수</li>
              <li>현장 QR 체크인은 2차 검증으로 처리</li>
            </ul>
          </div>
        </aside>
      </section>
    </article>
  );
}

function getCampaignStatus(campaign: ValidCampaign): CampaignStatus {
  const now = Date.now();
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

function statusLabel(status: CampaignStatus) {
  switch (status) {
    case "active":
      return "진행 중";
    case "upcoming":
      return "예정";
    case "closed":
      return "종료";
  }
}

function statusBadgeTone(status: CampaignStatus) {
  switch (status) {
    case "active":
      return "bg-emerald-500/15 text-emerald-200";
    case "upcoming":
      return "bg-amber-500/15 text-amber-200";
    case "closed":
      return "bg-slate-500/20 text-slate-200";
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
