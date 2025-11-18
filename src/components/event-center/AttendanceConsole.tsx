"use client";

import { useMemo, useState, useTransition } from "react";
import { updateAttendance as updateAttendanceAction } from "@/app/event-center/actions";

export type AttendanceState = "pending" | "checked_in" | "no_show";

export type SelectedGuest = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  attendance: AttendanceState;
};

type Campaign = {
  id: string;
  title: string;
};

type AttendanceConsoleProps = {
  campaigns: Campaign[];
  guests: Record<string, SelectedGuest[]>; // campaignId -> guests
};

export function AttendanceConsole({ campaigns, guests }: AttendanceConsoleProps) {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(
    campaigns[0]?.id ?? null
  );
  const [guestStates, setGuestStates] = useState(guests);
  const [isPending, startTransition] = useTransition();

  const currentGuests = selectedCampaignId ? guestStates[selectedCampaignId] ?? [] : [];

  const stats = useMemo(() => {
    const total = currentGuests.length;
    const checkedIn = currentGuests.filter((guest) => guest.attendance === "checked_in").length;
    const pending = currentGuests.filter((guest) => guest.attendance === "pending").length;
    return { total, checkedIn, pending };
  }, [currentGuests]);

  const updateAttendance = (id: string, attendance: "checked_in" | "no_show") => {
    if (!selectedCampaignId) return;

    startTransition(async () => {
      const result = await updateAttendanceAction(id, attendance);
      if (result.success) {
        setGuestStates((prev) => ({
          ...prev,
          [selectedCampaignId]: prev[selectedCampaignId].map((guest) =>
            guest.id === id ? { ...guest, attendance } : guest
          ),
        }));
      } else {
        alert(result.error || "관람 체크 업데이트에 실패했습니다.");
      }
    });
  };

  return (
    <section id="attendance" className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">관람 체크</p>
        <h2 className="text-2xl font-semibold text-slate-900">당첨자 관람 확인</h2>
        <p className="text-sm text-slate-600">
          공연 후 당첨자의 관람 여부를 체크하세요. 당첨자 명단은 이메일로 전달됩니다.
        </p>
      </header>

      {campaigns.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center">
          <p className="text-sm text-slate-500">승인된 이벤트가 없습니다.</p>
        </div>
      ) : (
        <>
          {/* 캠페인 선택 */}
          <div className="space-y-2">
            <label htmlFor="campaign-select" className="text-sm font-semibold text-slate-900">
              이벤트 선택
            </label>
            <select
              id="campaign-select"
              value={selectedCampaignId || ""}
              onChange={(e) => setSelectedCampaignId(e.target.value || null)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
            >
              {campaigns.map((campaign) => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.title}
                </option>
              ))}
            </select>
          </div>

          {/* 통계 */}
          <div className="grid gap-4 rounded-3xl bg-slate-50 p-4 text-center text-sm text-slate-600 md:grid-cols-3">
            <Stat label="당첨 인원" value={stats.total} />
            <Stat label="체크인" value={stats.checkedIn} highlight="text-emerald-600" />
            <Stat label="대기" value={stats.pending} highlight="text-amber-600" />
          </div>

          {/* 당첨자 목록 */}
          {currentGuests.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center">
              <p className="text-sm text-slate-500">
                당첨자가 없습니다. 관리자가 당첨자를 선정하면 여기에 표시됩니다.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-3xl border border-slate-100">
              <table className="min-w-full divide-y divide-slate-100 text-sm text-slate-700">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3 text-left">이름</th>
                    <th className="px-4 py-3 text-left">이메일</th>
                    <th className="px-4 py-3 text-left">전화번호</th>
                    <th className="px-4 py-3 text-left">관람 여부</th>
                    <th className="px-4 py-3 text-left">조치</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {currentGuests.map((guest) => (
                    <tr key={guest.id} className="transition hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-slate-900">{guest.name}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{guest.email}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{guest.phone ?? "미입력"}</td>
                      <td className="px-4 py-3">
                        <AttendanceBadge state={guest.attendance} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2 text-xs">
                          <button
                            type="button"
                            className="rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-700 disabled:opacity-50"
                            onClick={() => updateAttendance(guest.id, "checked_in")}
                            disabled={isPending || guest.attendance === "checked_in"}
                          >
                            체크인
                          </button>
                          <button
                            type="button"
                            className="rounded-full bg-rose-50 px-3 py-1 font-semibold text-rose-700 disabled:opacity-50"
                            onClick={() => updateAttendance(guest.id, "no_show")}
                            disabled={isPending || guest.attendance === "no_show"}
                          >
                            미관람
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </section>
  );
}

function Stat({ label, value, highlight }: { label: string; value: number; highlight?: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${highlight ?? "text-slate-900"}`}>{value}</p>
    </div>
  );
}

function AttendanceBadge({ state }: { state: AttendanceState }) {
  const meta: Record<AttendanceState, { label: string; tone: string }> = {
    pending: { label: "대기", tone: "bg-slate-100 text-slate-600" },
    checked_in: { label: "체크인", tone: "bg-emerald-100 text-emerald-700" },
    no_show: { label: "미관람", tone: "bg-rose-100 text-rose-700" },
  };

  const badge = meta[state];
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badge.tone}`}>{badge.label}</span>;
}
