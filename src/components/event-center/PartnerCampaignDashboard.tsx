"use client";

import { useState, useTransition } from "react";
import { BarChart3, Calendar, CheckCircle2, Clock, Ticket, Trophy, Users } from "lucide-react";
import { runLotteryDraw } from "@/app/event-center/actions";

export type CampaignStats = {
  total: number;
  selected: number;
  checkedIn: number;
  noShow: number;
};

export type DrawRecord = {
  id: string;
  runAt: string;
  winnerCount: number;
  totalEntries: number;
  algorithmVersion: string;
  executedBy: string | null;
};

export type CampaignItem = {
  id: string;
  title: string;
  status: string | null;
  starts_at: string | null;
  ends_at: string | null;
  allocation: number | null;
  stats: CampaignStats;
  draws?: DrawRecord[];
};

type Props = {
  campaigns: CampaignItem[];
};

const STATUS_META: Record<string, { label: string; tone: string }> = {
  pending_approval: { label: "승인 대기", tone: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  approved: { label: "승인됨", tone: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  active: { label: "진행 중", tone: "bg-primary/10 text-primary" },
  closed: { label: "마감", tone: "bg-muted text-muted-foreground" },
  rejected: { label: "거부됨", tone: "bg-destructive/10 text-destructive" },
};

function getStatusMeta(status: string | null) {
  return STATUS_META[status ?? ""] ?? { label: status ?? "미정", tone: "bg-muted text-muted-foreground" };
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
    return (
      <p className={`mt-3 border px-3 py-2 text-xs font-semibold ${
        result.startsWith("✅")
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-destructive/20 bg-destructive/5 text-destructive"
      }`}>
        {result}
      </p>
    );
  }

  return (
    <div className="mt-4 flex items-center gap-2 border-t border-border/50 pt-4">
      <input
        type="number"
        min={1}
        max={campaign.stats.total}
        value={winnerCount}
        onChange={(e) => setWinnerCount(e.target.value)}
        className="w-16 border border-border bg-background px-3 py-1.5 text-center text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
        aria-label="당첨 인원"
      />
      <span className="text-xs text-muted-foreground">명 선정</span>
      <button
        type="button"
        onClick={handleDraw}
        disabled={isPending}
        className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:opacity-60"
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
      <section className="stage-panel p-8">
        <header className="mb-6">
          <span className="cue">Campaigns</span>
          <h2 className="mt-2 text-xl font-bold text-foreground">등록된 이벤트</h2>
        </header>
        <div className="border border-dashed border-border p-12 text-center">
          <BarChart3 className="mx-auto mb-3 h-8 w-8 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">아직 등록된 이벤트가 없습니다.</p>
          <p className="mt-1 text-xs text-muted-foreground">우측 상단의 <strong>새 이벤트 등록</strong> 버튼을 눌러 시작하세요.</p>
        </div>
      </section>
    );
  }

  return (
    <section id="campaigns" className="stage-panel p-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <span className="cue">Campaigns</span>
          <h2 className="mt-2 text-xl font-bold text-foreground">내 이벤트 ({campaigns.length}건)</h2>
        </div>
        <BarChart3 className="h-5 w-5 text-muted-foreground/40" />
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {campaigns.map((campaign) => {
          const status = getStatusMeta(campaign.status);
          const lotteryReady = isLotteryReady(campaign);

          return (
            <article
              key={campaign.id}
              className="spotlight-card flex flex-col p-5"
            >
              {/* 헤더 */}
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-bold leading-snug text-foreground">{campaign.title}</h3>
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.tone}`}>
                  {status.label}
                </span>
              </div>

              {/* 기간 */}
              {(campaign.starts_at || campaign.ends_at) && (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDateRange(campaign.starts_at, campaign.ends_at)}
                </p>
              )}

              {/* 통계 */}
              <div className="mt-4 grid grid-cols-4 divide-x divide-border border border-border bg-muted/20 text-center text-xs">
                <Stat icon={<Users className="h-3.5 w-3.5" />} label="응모" value={campaign.stats.total} />
                <Stat icon={<Ticket className="h-3.5 w-3.5" />} label="선정" value={campaign.stats.selected} accent="text-primary" />
                <Stat icon={<CheckCircle2 className="h-3.5 w-3.5" />} label="체크인" value={campaign.stats.checkedIn} accent="text-emerald-600" />
                <Stat label="노쇼" value={campaign.stats.noShow} accent="text-destructive" />
              </div>

              {/* 추첨 버튼 */}
              {lotteryReady && <LotteryButton campaign={campaign} />}

              {/* 추첨 이력 */}
              {(campaign.draws?.length ?? 0) > 0 && (
                <DrawHistory draws={campaign.draws!} />
              )}

              {/* 추첨 완료 (이력 없을 때 fallback) */}
              {campaign.stats.selected > 0 && !campaign.draws?.length && (
                <p className="mt-3 text-xs font-semibold text-emerald-600">
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
      {icon && <div className="mb-0.5 flex justify-center text-muted-foreground/60">{icon}</div>}
      <p className={`text-lg font-black ${accent ?? "text-foreground"}`}>{value}</p>
      <p className="mt-0.5 text-[10px] text-muted-foreground">{label}</p>
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

function DrawHistory({ draws }: { draws: DrawRecord[] }) {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? draws : draws.slice(0, 1);

  return (
    <div className="mt-3 border-t border-border/50 pt-3">
      <button
        type="button"
        className="mb-2 flex w-full items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
        onClick={() => setExpanded((v) => !v)}
      >
        <Clock className="h-3 w-3" />
        추첨 이력 ({draws.length}회){expanded ? " ▲" : " ▼"}
      </button>
      <ul className="space-y-1.5">
        {shown.map((draw) => (
          <li key={draw.id} className="rounded bg-muted/40 px-3 py-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-emerald-600">
                🏆 {draw.winnerCount}명 선정
              </span>
              <span className="text-muted-foreground">
                {new Date(draw.runAt).toLocaleString("ko-KR", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <p className="mt-0.5 text-muted-foreground">
              응모 {draw.totalEntries}명 중 · {draw.algorithmVersion}
            </p>
          </li>
        ))}
      </ul>
      {draws.length > 1 && !expanded && (
        <button
          type="button"
          className="mt-1 text-xs text-primary hover:underline"
          onClick={() => setExpanded(true)}
        >
          이전 {draws.length - 1}건 더 보기
        </button>
      )}
    </div>
  );
}
