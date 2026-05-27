import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { AttendanceConsole, PartnerCampaignDashboard } from "@/components/event-center";
import type { CampaignItem, DrawRecord } from "@/components/event-center/PartnerCampaignDashboard";
import { getPartnerCampaigns, getCampaignEntries } from "@/lib/supabase/queries";
import { getPartnerSession } from "@/lib/auth/partner-session";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/config";
import { partnerLogout } from "../partner/login/actions";

export const metadata = {
  title: "이벤트 운영 허브",
  description: "초대권 이벤트 개설과 관람 체크를 한 화면에서 처리하세요.",
};

export default async function EventCenterPage() {
  const partnerEmail = await getPartnerSession();
  if (!partnerEmail) {
    redirect("/partner/login");
  }

  const campaigns = await getPartnerCampaigns(partnerEmail);

  // 추첨 이력 조회
  const drawsByCampaign: Record<string, DrawRecord[]> = {};
  if (isSupabaseConfigured && campaigns.length > 0) {
    try {
      const supabase = await createServerSupabaseClient();
      const campaignIds = campaigns.map((c) => c.id);
      const { data: draws } = await supabase
        .from('campaign_draws')
        .select('id, campaign_id, run_at, winners, config, algorithm_version, executed_by')
        .in('campaign_id', campaignIds)
        .order('run_at', { ascending: false });

      for (const draw of draws ?? []) {
        const list = drawsByCampaign[draw.campaign_id] ?? [];
        const winners = Array.isArray(draw.winners) ? draw.winners as { id: string; name?: string }[] : [];
        const config = draw.config as Record<string, number> | null;
        list.push({
          id: draw.id,
          runAt: draw.run_at,
          winnerCount: winners.length,
          totalEntries: config?.total_entries ?? 0,
          algorithmVersion: draw.algorithm_version,
          executedBy: draw.executed_by ?? null,
        });
        drawsByCampaign[draw.campaign_id] = list;
      }
    } catch (err) {
      console.error('추첨 이력 조회 실패:', err);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const guestsData: Record<string, any[]> = {};
  const campaignsWithStats: CampaignItem[] = [];

  for (const campaign of campaigns) {
    let entries: {
      id: string;
      selection_status: string | null;
      attendance_status: string | null;
      applicant_name: string;
      applicant_email: string;
      applicant_phone?: string | null;
    }[] = [];

    try {
      entries = await getCampaignEntries(campaign.id, partnerEmail);
    } catch (error) {
      console.error(`Error fetching entries for campaign ${campaign.id}:`, error);
    }

    const total = campaign.entry_count ?? entries.length;
    const selected = entries.filter((e) => e.selection_status === "selected").length;
    const checkedIn = entries.filter((e) => e.attendance_status === "checked_in").length;
    const noShow = entries.filter((e) => e.attendance_status === "no_show").length;

    campaignsWithStats.push({
      id: campaign.id,
      title: campaign.title,
      status: campaign.status ?? null,
      starts_at: campaign.starts_at ?? null,
      ends_at: campaign.ends_at ?? null,
      allocation: typeof campaign.allocation === "number" ? campaign.allocation : null,
      poster_image: campaign.poster_image ?? null,
      // rejection_reason column added via migration — null until migration applied
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rejection_reason: (campaign as any).rejection_reason ?? null,
      stats: { total, selected, checkedIn, noShow },
      draws: drawsByCampaign[campaign.id] ?? [],
    });

    guestsData[campaign.id] = entries
      .filter((e) => e.selection_status === "selected")
      .map((e) => ({
        id: e.id,
        name: e.applicant_name,
        email: e.applicant_email,
        phone: e.applicant_phone ?? null,
        attendance: (e.attendance_status as "pending" | "checked_in" | "no_show") || "pending",
      }));
  }

  const campaignsForAttendance = campaigns.map((c) => ({ id: c.id, title: c.title }));

  // 요약 통계
  const totalEntries = campaignsWithStats.reduce((s, c) => s + c.stats.total, 0);
  const totalSelected = campaignsWithStats.reduce((s, c) => s + c.stats.selected, 0);
  const activeCampaigns = campaignsWithStats.filter(
    (c) => c.status === "active" || c.status === "approved"
  ).length;

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 space-y-10">

      {/* ── 페이지 헤더 ── */}
      <header className="stage-panel p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <span className="cue">Partner Hub</span>
            <h1 className="mt-3 text-3xl font-bold text-foreground">이벤트 운영 허브</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              로그인: <span className="font-semibold text-foreground">{partnerEmail}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* 새 이벤트 등록 CTA */}
            <Link
              href="/event-center/new"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-lg"
            >
              <Plus className="h-4 w-4" />
              새 이벤트 등록
            </Link>

            <form action={partnerLogout}>
              <button
                type="submit"
                className="rounded-full border border-border/60 bg-background px-5 py-2.5 text-sm font-semibold text-muted-foreground transition-all hover:border-border hover:text-foreground"
              >
                로그아웃
              </button>
            </form>
          </div>
        </div>

        {/* 요약 통계 */}
        <div className="mt-6 grid grid-cols-3 divide-x divide-border border-t border-border pt-6">
          <div className="pr-6 text-center">
            <p className="text-2xl font-black text-foreground">{campaigns.length}</p>
            <p className="mt-0.5 text-xs text-muted-foreground uppercase tracking-wide">등록 이벤트</p>
          </div>
          <div className="px-6 text-center">
            <p className="text-2xl font-black text-primary">{activeCampaigns}</p>
            <p className="mt-0.5 text-xs text-muted-foreground uppercase tracking-wide">진행 중</p>
          </div>
          <div className="pl-6 text-center">
            <p className="text-2xl font-black text-foreground">{totalEntries}</p>
            <p className="mt-0.5 text-xs text-muted-foreground uppercase tracking-wide">총 응모</p>
            {totalSelected > 0 && (
              <p className="text-xs text-emerald-600 font-semibold mt-0.5">선정 {totalSelected}명</p>
            )}
          </div>
        </div>
      </header>

      {/* ── 캠페인 현황 + 추첨 ── */}
      <PartnerCampaignDashboard campaigns={campaignsWithStats} />

      {/* ── 관람 체크 ── */}
      <AttendanceConsole campaigns={campaignsForAttendance} guests={guestsData} />

    </div>
  );
}
