"use client";

import { useState, useTransition } from "react";
import { BarChart3, Calendar, CheckCircle2, Ticket, Trophy, Users } from "lucide-react";
import { runLotteryDraw } from "@/app/event-center/actions";

export type CampaignStats = {
  total: number;
  selected: number;
  checkedIn: number;
  noShow: number;
};

export type CampaignItem = {
  id: string;
  title: string;
  status: string | null;
  starts_at: string | null;
  ends_at: string | null;
  allocation: number | null;
  stats: CampaignStats;
};

type Props = {
  campaigns: CampaignItem[];
};

const STATUS_META: Record<string, { label: string; tone: string }> = {
  pending_approval: { label: "승인 대기", tone: "bg-amber-100 text-amber-700" },
  approved: { label: "승인됨", tone: "bg-emerald-100 text-emerald-700" },
  active: { label: "진행 중", tone: "bg-blue-100 text-blue-700" },
  closed: { label: "마감", tone: "bg-slate-100 text-slate-600" },
  rejected: { label: "거부됨", tone: "bg-rose-100 text-rose-700" },
};

function getStatusMeta(status: string | null) {
  return STATUS_META[status ?? ""] ?? { label: status ?? "미정", tone: "bg-slate-100 text-slate-600" };
}

function isLotteryReady(campaign: CampaignItem): boolean {
  if (!campaign.ends_at) return false;
  const ended = new Date(campaign.ends_at).getTime() < Date.now();
  const noWinners = campaign.stats.selected === 0;
  const hasEntries = campaign.stats.total > 0;
  const approved = campaign.status === "approved" || campaign.status === "active" || campaign.status === "closed";
  return ended && noWinners && hasEntries && approved;
}

function LotteryButton({ campaign }: { campaign: CampaignItem }) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<string | null>(null);
  const [winnerCount, setWinnerCount] = useState(
    typeof campaign.allocation === "number" ? String(campaign.allocation) : "1",
  );

  const handleDraw = () => {
    const count = parseInt(winnerCount, 10);
    if (!count || count < 1) {
      setResult("당첨 인원을 올바르게 입력해 주세요.");
      return;
    }
    if (!confirm(`${campaign.title}\n\n응모자 ${campaign.stats.total}명 중 ${count}명을 무작위로 선정합니다.\n계속하시겠어요?`)) return;

    startTransition(async () => {
      const res = await runLotteryDraw(campaign.id, count);
      if (res.success) {
        setResult(`✅ 추첨 완료! ${res.data?.winnerCount ?? count}명 선정되었습니다.`);
      } else {
        setResult(`❌ ${res.error}`);
      }
    });
  };

  if (result) {
    return <p className={`mt-3 rounded-xl px-3 py-2 text-xs font-semibold ${result.startsWith("✅") ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>{result}</p>;
  }

  return (
    <div className="mt-3 flex items-center gap-2">
      <input
        type="number"
        min={1}
        max={campaign.stats.total}
        value={winnerCount}
        onChange={(e) => setWinnerCount(e.target.value)}
        className="w-16 rounded-xl border border-slate-200 px-3 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/30"
        aria-label="당첨 인원"
      />
      <span className="text-xs text-slate-500">명 선정</span>
      <button
        type="button"
        onClick={handleDraw}
        disabled={isPending}
        className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground shadow transition hover:bg-primary/90 disabled:opacity-60"
      >
        <Trophy className="h-3 w-3" />
        {isPending ? "추첨 중..." : "추첨 실행"}
      </button>
    </div>
  );
}

export function PartnerCampaignDashboard({ campaigns }: Props) {
  if (campaigns.length === 0) {
    return (
      <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <header>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">캠페인 현황</p>
          <h2 className="text-2xl font-semibold text-slate-900">등록된 이벤트</h2>
        </header>
        <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center">
          <p className="text-sm text-slate-500">아직 등록된 이벤트가 없습니다. 이벤트를 개설해 보세요.</p>
        </div>
      </section>
    );
  }

  return (
    <section id="campaigns" className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">캠페인 현황</p>
          <h2 className="text-2xl font-semibold text-slate-900">내 이벤트 ({campaigns.length}건)</h2>
        </div>
        <BarChart3 className="h-6 w-6 text-slate-300" />
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {campaigns.map((campaign) => {
          const status = getStatusMeta(campaign.status);
          const lotteryReady = isLotteryReady(campaign);

          return (
            <article
              key={campaign.id}
              className="flex flex-col rounded-2xl border border-slate-100 bg-slate-50/60 p-5 transition hover:border-primary/20"
            >
              {/* 헤더 */}
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-base font-bold text-slate-900 leading-snug">{campaign.title}</h3>
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.tone}`}>
                  {status.label}
                </span>
              </div>

              {/* 기간 */}
              {(campaign.starts_at || campaign.ends_at) && (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDateRange(campaign.starts_at, campaign.ends_at)}
                </p>
              )}

              {/* 통계 */}
              <div className="mt-4 grid grid-cols-4 divide-x divide-slate-200 rounded-2xl border border-slate-200 bg-white text-center text-xs">
                <Stat icon={<Users className="h-3.5 w-3.5" />} label="응모" value={campaign.stats.total} />
                <Stat icon={<Ticket className="h-3.5 w-3.5" />} label="선정" value={campaign.stats.selected} accent="text-primary" />
                <Stat icon={<CheckCircle2 className="h-3.5 w-3.5" />} label="체크인" value={campaign.stats.checkedIn} accent="text-emerald-600" />
                <Stat label="노쇼" value={campaign.stats.noShow} accent="text-rose-500" />
              </div>

              {/* 추첨 버튼 — 조건 충족 시만 노출 */}
              {lotteryReady && <LotteryButton campaign={campaign} />}

              {/* 이미 추첨됨 */}
              {campaign.stats.selected > 0 && (
                <p className="mt-3 text-xs text-emerald-600 font-semibold">
                  ✅ {campaign.stats.selected}명 선정 완료 — 체크인 {campaign.stats.checkedIn}명
                </p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function Stat({
  icon,
  label,
  value,
  accent,
}: {
  icon?: React.ReactNode;
  label: string;
  value: number;
  accent?: string;
}) {
  return (
    <div className="py-3">
      {icon && <div className="flex justify-center text-slate-400 mb-0.5">{icon}</div>}
      <p className={`text-lg font-bold ${accent ?? "text-slate-900"}`}>{value}</p>
      <p className="text-[10px] text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}

function formatDateRange(start: string | null, end: string | null): string {
  const fmt = (v: string) =>
    new Date(v).toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
  if (start && end) return `${fmt(start)} ~ ${fmt(end)}`;
  if (start) return `${fmt(start)} ~`;
  if (end) return `~ ${fmt(end)}`;
  return "";
}
