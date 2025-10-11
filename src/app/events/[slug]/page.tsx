import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTicketCampaignBySlug } from "@/lib/supabase/queries";

interface EventDetailPageProps {
  params: { slug: string };
}

type CampaignResult = Awaited<ReturnType<typeof getTicketCampaignBySlug>>;
type ValidCampaign = Extract<CampaignResult, { id: string }>;

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
    description: campaign.description ?? "Artause 티켓 이벤트 상세",
  };
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const campaign = await getTicketCampaignBySlug(params.slug);
  if (!isCampaignRecord(campaign)) {
    notFound();
  }

  const performance = campaign.performances;
  const status = getCampaignStatus(campaign);
  const startsAt = campaign.starts_at ? formatDateTime(campaign.starts_at) : null;
  const endsAt = campaign.ends_at ? formatDateTime(campaign.ends_at) : null;

  return (
    <article className="mx-auto max-w-5xl px-6 py-16">
      <header className="card space-y-4 bg-indigo-950 p-10 text-white shadow-xl">
        <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-white/60">
          <span>티켓 이벤트</span>
          <span className="badge bg-white/15 text-white">{statusLabel(status)}</span>
        </div>
        <h1 className="text-3xl font-semibold md:text-4xl">{campaign.title}</h1>
        {campaign.description ? <p className="text-sm text-white/80 md:text-base">{campaign.description}</p> : null}
        <div className="flex flex-wrap gap-4 text-xs text-white/70">
          {startsAt ? <span>시작 {startsAt}</span> : null}
          {endsAt ? <span>마감 {endsAt}</span> : null}
        </div>
        <div className="flex flex-wrap gap-3">
          {campaign.form_link ? (
            <Link
              href={campaign.form_link}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary bg-white text-indigo-900 hover:bg-white/90"
            >
              응모 폼 열기
            </Link>
          ) : (
            <Link href="/submit" className="btn-primary bg-white text-indigo-900 hover:bg-white/90">
              운영팀 접수하기
            </Link>
          )}
          {performance ? (
            <Link href={`/shows/${performance.slug}`} className="btn-secondary border-white/40 text-white hover:border-white/60 hover:text-white">
              공연 상세 보기
            </Link>
          ) : null}
        </div>
      </header>

      <section className="mt-14 grid gap-6 md:grid-cols-[2fr,1fr]">
        <div className="space-y-8">
          <div className="card space-y-4 p-8">
            <h2 className="text-xl font-semibold text-slate-900">참여 방법</h2>
            <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-700">
              <li>멤버십 유형에 따라 응모 횟수를 확인합니다.</li>
              <li>IG 링크 또는 DM 배포 링크를 통해 친구에게 공유합니다.</li>
              <li>추첨 결과는 이메일 · SMS · DM으로 동시에 발송됩니다.</li>
            </ol>
          </div>

          <div className="card space-y-4 p-8">
            <h2 className="text-xl font-semibold text-slate-900">규칙 & 확인 사항</h2>
            <ul className="space-y-3 text-sm text-slate-700">
              <li>중복 계정과 블랙리스트에 등록된 사용자는 자동 제외됩니다.</li>
              <li>D+2일까지 체크인이 확인되지 않으면 자동 취소되며 대기자가 승급됩니다.</li>
              <li>멤버십 업그레이드 시 즉시 추가 응모권과 조기 오픈 혜택이 적용됩니다.</li>
            </ul>
          </div>

          {campaign.reward ? (
            <div className="card space-y-4 p-8">
              <h2 className="text-xl font-semibold text-slate-900">혜택</h2>
              <p className="text-sm text-slate-700">{campaign.reward}</p>
            </div>
          ) : null}
        </div>

        <aside className="space-y-6">
          <div className="card space-y-4 p-6">
            <h3 className="text-lg font-semibold text-slate-900">추천 코드</h3>
            <p className="text-sm text-slate-600">
              추천 코드를 공유하면 추첨 가중치와 Pro 멤버십 전용 리포트를 받을 수 있습니다. QR · SMS · IG DM 템플릿을 지원합니다.
            </p>
            <Link href="/me" className="btn-secondary w-full">
              내 추천 링크 확인
            </Link>
          </div>

          <div className="card space-y-4 p-6">
            <h3 className="text-lg font-semibold text-slate-900">운영 체크리스트</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>Edge Function 추첨 스케줄 예약</li>
              <li>Resend · Naver Cloud 발송 키 연결</li>
              <li>체크인 QR 코드 테스트</li>
            </ul>
          </div>
        </aside>
      </section>
    </article>
  );
}

function getCampaignStatus(campaign: ValidCampaign): "active" | "upcoming" | "closed" {
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

function statusLabel(status: "active" | "upcoming" | "closed") {
  switch (status) {
    case "active":
      return "진행 중";
    case "upcoming":
      return "예정";
    case "closed":
      return "종료";
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
