"use client";

import { useMemo, useState, useTransition } from "react";
import { AlertTriangle, CheckCircle2, Search, UserX } from "lucide-react";
import { updateAttendance as updateAttendanceAction, applyPenalty } from "@/app/event-center/actions";

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
  guests: Record<string, SelectedGuest[]>;
};

export function AttendanceConsole({ campaigns, guests }: AttendanceConsoleProps) {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(
    campaigns[0]?.id ?? null
  );
  const [guestStates, setGuestStates] = useState(guests);
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");
  const [penaltyMessage, setPenaltyMessage] = useState<Record<string, string>>({});

  const currentGuests = selectedCampaignId ? guestStates[selectedCampaignId] ?? [] : [];

  const filteredGuests = useMemo(() => {
    if (!searchQuery.trim()) return currentGuests;
    const q = searchQuery.trim().toLowerCase();
    return currentGuests.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.email.toLowerCase().includes(q) ||
        (g.phone ?? "").includes(q)
    );
  }, [currentGuests, searchQuery]);

  const stats = useMemo(() => {
    const total = currentGuests.length;
    const checkedIn = currentGuests.filter((g) => g.attendance === "checked_in").length;
    const pending = currentGuests.filter((g) => g.attendance === "pending").length;
    const noShow = currentGuests.filter((g) => g.attendance === "no_show").length;
    return { total, checkedIn, pending, noShow };
  }, [currentGuests]);

  const updateAttendance = (id: string, attendance: "checked_in" | "no_show") => {
    if (!selectedCampaignId) return;
    startTransition(async () => {
      const result = await updateAttendanceAction(id, attendance);
      if (result.success) {
        setGuestStates((prev) => ({
          ...prev,
          [selectedCampaignId]: prev[selectedCampaignId].map((g) =>
            g.id === id ? { ...g, attendance } : g
          ),
        }));
      } else {
        alert(result.error || "관람 체크 업데이트에 실패했습니다.");
      }
    });
  };

  const handleApplyPenalty = (guest: SelectedGuest) => {
    if (!confirm(`${guest.name}님에게 노쇼 패널티를 부여하시겠어요?\n신뢰 점수가 차감됩니다.`)) return;
    startTransition(async () => {
      const result = await applyPenalty({
        entryId: guest.id,
        penaltyType: "no_show",
        reason: "공연 당일 미관람",
      });
      if (result.success) {
        const score = result.data?.newTrustScore;
        const restricted = result.data?.isRestricted;
        setPenaltyMessage((prev) => ({
          ...prev,
          [guest.id]: restricted
            ? `패널티 부여 완료. 신뢰 점수 ${score}점 (응모 제한)`
            : `패널티 부여 완료. 신뢰 점수 ${score}점`,
        }));
      } else {
        setPenaltyMessage((prev) => ({ ...prev, [guest.id]: result.error }));
      }
    });
  };

  return (
    <section id="attendance" className="stage-panel p-8">
      <header className="mb-6 space-y-1">
        <span className="cue">Attendance</span>
        <h2 className="mt-2 text-xl font-bold text-foreground">당첨자 관람 확인</h2>
        <p className="text-sm text-muted-foreground">
          공연 후 당첨자의 관람 여부를 체크하세요. 노쇼 확정 시 패널티를 부여할 수 있습니다.
        </p>
      </header>

      {campaigns.length === 0 ? (
        <div className="border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">승인된 이벤트가 없습니다.</p>
        </div>
      ) : (
        <>
          {/* 캠페인 선택 */}
          <div className="mb-6 space-y-2">
            <label htmlFor="campaign-select" className="text-sm font-semibold text-foreground">
              이벤트 선택
            </label>
            <select
              id="campaign-select"
              value={selectedCampaignId || ""}
              onChange={(e) => {
                setSelectedCampaignId(e.target.value || null);
                setSearchQuery("");
              }}
              className="w-full border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
            >
              {campaigns.map((campaign) => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.title}
                </option>
              ))}
            </select>
          </div>

          {/* 통계 */}
          <div className="mb-6 grid grid-cols-2 divide-x divide-border border border-border sm:grid-cols-4">
            <StatBox label="당첨 인원" value={stats.total} />
            <StatBox label="체크인" value={stats.checkedIn} highlight="text-emerald-600" />
            <StatBox label="대기" value={stats.pending} highlight="text-amber-600" />
            <StatBox label="노쇼" value={stats.noShow} highlight="text-destructive" />
          </div>

          {/* 검색 */}
          {currentGuests.length > 0 && (
            <div className="relative mb-4">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
              <input
                type="search"
                placeholder="이름, 이메일, 전화번호 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
            </div>
          )}

          {/* 당첨자 목록 */}
          {currentGuests.length === 0 ? (
            <div className="border border-dashed border-border p-12 text-center">
              <p className="text-sm text-muted-foreground">
                당첨자가 없습니다. 추첨을 실행하면 여기에 표시됩니다.
              </p>
            </div>
          ) : filteredGuests.length === 0 ? (
            <div className="border border-dashed border-border p-8 text-center">
              <p className="text-sm text-muted-foreground">검색 결과가 없습니다.</p>
            </div>
          ) : (
            <>
              {/* 모바일: 카드 레이아웃 */}
              <div className="space-y-3 sm:hidden">
                {filteredGuests.map((guest) => (
                  <GuestCard
                    key={guest.id}
                    guest={guest}
                    isPending={isPending}
                    penaltyMessage={penaltyMessage[guest.id]}
                    onAttendance={updateAttendance}
                    onPenalty={handleApplyPenalty}
                  />
                ))}
              </div>

              {/* 데스크톱: 테이블 레이아웃 */}
              <div className="hidden overflow-hidden border border-border sm:block">
                <table className="min-w-full divide-y divide-border text-sm">
                  <thead className="bg-muted/40 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 text-left">이름</th>
                      <th className="px-4 py-3 text-left">이메일</th>
                      <th className="px-4 py-3 text-left">전화번호</th>
                      <th className="px-4 py-3 text-left">상태</th>
                      <th className="px-4 py-3 text-left">조치</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-card">
                    {filteredGuests.map((guest) => (
                      <tr key={guest.id} className="transition hover:bg-muted/20">
                        <td className="px-4 py-3 font-semibold text-foreground">{guest.name}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{guest.email}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{guest.phone ?? "미입력"}</td>
                        <td className="px-4 py-3">
                          <AttendanceBadge state={guest.attendance} />
                        </td>
                        <td className="px-4 py-3">
                          {penaltyMessage[guest.id] ? (
                            <p className="text-xs text-muted-foreground">{penaltyMessage[guest.id]}</p>
                          ) : (
                            <div className="flex flex-wrap gap-2 text-xs">
                              <button
                                type="button"
                                className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
                                onClick={() => updateAttendance(guest.id, "checked_in")}
                                disabled={isPending || guest.attendance === "checked_in"}
                              >
                                <CheckCircle2 className="h-3 w-3" /> 체크인
                              </button>
                              <button
                                type="button"
                                className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1 font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
                                onClick={() => updateAttendance(guest.id, "no_show")}
                                disabled={isPending || guest.attendance === "no_show"}
                              >
                                <UserX className="h-3 w-3" /> 미관람
                              </button>
                              {guest.attendance === "no_show" && (
                                <button
                                  type="button"
                                  className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 font-semibold text-amber-700 transition hover:bg-amber-100 disabled:opacity-50"
                                  onClick={() => handleApplyPenalty(guest)}
                                  disabled={isPending}
                                >
                                  <AlertTriangle className="h-3 w-3" /> 패널티
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </section>
  );
}

function GuestCard({
  guest,
  isPending,
  penaltyMessage,
  onAttendance,
  onPenalty,
}: {
  guest: SelectedGuest;
  isPending: boolean;
  penaltyMessage?: string;
  onAttendance: (id: string, state: "checked_in" | "no_show") => void;
  onPenalty: (guest: SelectedGuest) => void;
}) {
  return (
    <div className="spotlight-card space-y-3 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-foreground">{guest.name}</p>
          <p className="text-xs text-muted-foreground">{guest.email}</p>
          {guest.phone && <p className="text-xs text-muted-foreground/70">{guest.phone}</p>}
        </div>
        <AttendanceBadge state={guest.attendance} />
      </div>
      {penaltyMessage ? (
        <p className="text-xs text-muted-foreground">{penaltyMessage}</p>
      ) : (
        <div className="flex flex-wrap gap-2 border-t border-border/50 pt-3 text-xs">
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 font-semibold text-emerald-700 disabled:opacity-50"
            onClick={() => onAttendance(guest.id, "checked_in")}
            disabled={isPending || guest.attendance === "checked_in"}
          >
            <CheckCircle2 className="h-3 w-3" /> 체크인
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1.5 font-semibold text-rose-700 disabled:opacity-50"
            onClick={() => onAttendance(guest.id, "no_show")}
            disabled={isPending || guest.attendance === "no_show"}
          >
            <UserX className="h-3 w-3" /> 미관람
          </button>
          {guest.attendance === "no_show" && (
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1.5 font-semibold text-amber-700 disabled:opacity-50"
              onClick={() => onPenalty(guest)}
              disabled={isPending}
            >
              <AlertTriangle className="h-3 w-3" /> 패널티
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value, highlight }: { label: string; value: number; highlight?: string }) {
  return (
    <div className="p-4 text-center">
      <p className={`text-2xl font-black ${highlight ?? "text-foreground"}`}>{value}</p>
      <p className="mt-0.5 text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}

function AttendanceBadge({ state }: { state: AttendanceState }) {
  const meta: Record<AttendanceState, { label: string; tone: string }> = {
    pending: { label: "대기", tone: "bg-muted text-muted-foreground" },
    checked_in: { label: "체크인", tone: "bg-emerald-100 text-emerald-700" },
    no_show: { label: "미관람", tone: "bg-rose-100 text-rose-700" },
  };
  const badge = meta[state];
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badge.tone}`}>
      {badge.label}
    </span>
  );
}
