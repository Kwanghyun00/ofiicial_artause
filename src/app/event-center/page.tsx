import { redirect } from "next/navigation";
import { EventCreationWizard, AttendanceConsole } from "@/components/event-center";
import { getPartnerCampaigns, getCampaignEntries } from "@/lib/supabase/queries";
import { getPartnerSession } from "@/lib/auth/partner-session";
import { partnerLogout } from "../partner/login/actions";

export const metadata = {
  title: "이벤트 운영 허브",
  description: "초대권 이벤트 개설과 관람 체크를 한 화면에서 처리하세요.",
};

export default async function EventCenterPage() {
  // 로그인 확인
  const partnerEmail = await getPartnerSession();
  if (!partnerEmail) {
    redirect("/partner/login");
  }

  // 본인의 캠페인만 조회
  const campaigns = await getPartnerCampaigns(partnerEmail);

  // 각 캠페인별 당첨자 조회 (selection_status = 'selected')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const guestsData: Record<string, any[]> = {};
  for (const campaign of campaigns) {
    try {
      const entries = await getCampaignEntries(campaign.id, partnerEmail);
      // 선정된(selected) 응모자만 필터링
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const selectedEntries = entries.filter((entry: any) => entry.selection_status === 'selected');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      guestsData[campaign.id] = selectedEntries.map((entry: any) => ({
        id: entry.id,
        name: entry.applicant_name,
        email: entry.applicant_email,
        phone: entry.applicant_phone,
        attendance: entry.attendance_status || 'pending',
      }));
    } catch (error) {
      console.error(`Error fetching entries for campaign ${campaign.id}:`, error);
      guestsData[campaign.id] = [];
    }
  }

  const campaignsForAttendance = campaigns.map((c) => ({
    id: c.id,
    title: c.title,
  }));

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 space-y-10">
      <section className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-12 text-white shadow-2xl md:p-16">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDEzNGgxMnYxMkgzNnptMjQgMGgxMnYxMkg2MHpNMTIgMTEwaDEydjEySDE2em0yNCAwaDEydjEySDM2em0yNCAwaDEydjEySDYwem0yNCAwaDEydjEySDg0em0wIDI0aDEydjEySDg0em0wIDI0aDEydjEySDg0eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        <div className="relative">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <p className="text-xs font-medium uppercase tracking-wider">Partner Hub</p>
            </div>
            <form action={partnerLogout}>
              <button
                type="submit"
                className="rounded-2xl border-2 border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 whitespace-nowrap"
              >
                로그아웃
              </button>
            </form>
          </div>
          <h1 className="text-4xl font-bold md:text-5xl lg:text-6xl">
            이벤트 운영 허브
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/90 md:text-xl">
            초대권 이벤트를 등록하고, 당첨자 관람 여부를 확인하세요.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
            <span className="text-sm text-white/70">로그인:</span>
            <span className="font-semibold">{partnerEmail}</span>
          </div>
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="#event-create"
              className="group inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 font-semibold text-indigo-600 shadow-lg transition-all hover:scale-105 hover:shadow-xl"
            >
              <span>이벤트 개설하기</span>
              <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </a>
            <a
              href="#attendance"
              className="inline-flex items-center gap-2 rounded-2xl border-2 border-white/40 bg-white/10 px-8 py-4 font-semibold backdrop-blur-sm transition-all hover:border-white/60 hover:bg-white/20"
            >
              <span>관람 체크 보드</span>
              <span>→</span>
            </a>
          </div>
        </div>
      </section>

      {/* 이벤트 생성 */}
      <EventCreationWizard />

      {/* 관람 체크 */}
      <AttendanceConsole campaigns={campaignsForAttendance} guests={guestsData} />
    </div>
  );
}
