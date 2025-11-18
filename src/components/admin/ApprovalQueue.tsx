"use client";

import { useState, useTransition } from "react";
import { approveEventCampaign, rejectEventCampaign } from "@/app/event-center/actions";

// TODO: 실제로는 서버에서 데이터를 가져와야 합니다
type PendingCampaign = {
  id: string;
  title: string;
  performanceTitle: string;
  partnerName: string;
  partnerEmail: string;
  partnerPhone: string;
  ticketPurchaseUrl?: string;
  ticketCount: string;
  period: { start: string; end: string };
};

// Mock 데이터 (실제로는 props로 받아와야 함)
const mockPendingCampaigns: PendingCampaign[] = [];

export function ApprovalQueue() {
  const [campaigns, setCampaigns] = useState<PendingCampaign[]>(mockPendingCampaigns);
  const [isPending, startTransition] = useTransition();

  const handleApprove = (campaignId: string) => {
    startTransition(async () => {
      const result = await approveEventCampaign(campaignId);
      if (result.success) {
        setCampaigns((prev) => prev.filter((c) => c.id !== campaignId));
        alert("이벤트가 승인되었습니다.");
      } else {
        alert(result.error || "승인 처리에 실패했습니다.");
      }
    });
  };

  const handleReject = (campaignId: string) => {
    if (!confirm("이벤트를 거부하시겠습니까?")) return;

    startTransition(async () => {
      const result = await rejectEventCampaign(campaignId);
      if (result.success) {
        setCampaigns((prev) => prev.filter((c) => c.id !== campaignId));
        alert("이벤트가 거부되었습니다.");
      } else {
        alert(result.error || "거부 처리에 실패했습니다.");
      }
    });
  };

  return (
    <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-rose-500">이벤트 승인 관리</p>
        <h2 className="text-2xl font-semibold text-slate-900">승인 대기 중인 이벤트</h2>
        <p className="text-sm text-slate-600">
          공연 종사자가 등록한 이벤트를 검토하고 승인/거부하세요.
        </p>
      </header>

      {campaigns.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center">
          <p className="text-sm text-slate-500">승인 대기 중인 이벤트가 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-6 space-y-4"
            >
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{campaign.title}</h3>
                  <p className="text-sm text-slate-600">{campaign.performanceTitle}</p>
                </div>
                <div className="text-sm text-slate-600">
                  <p><strong>담당자:</strong> {campaign.partnerName}</p>
                  <p><strong>이메일:</strong> {campaign.partnerEmail}</p>
                  <p><strong>연락처:</strong> {campaign.partnerPhone}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 text-sm text-slate-600">
                <div>
                  <p><strong>제공 매수:</strong> {campaign.ticketCount}매</p>
                </div>
                <div>
                  <p><strong>이벤트 기간:</strong></p>
                  <p>{campaign.period.start} ~ {campaign.period.end}</p>
                </div>
                {campaign.ticketPurchaseUrl ? (
                  <div>
                    <p><strong>티켓 URL:</strong></p>
                    <a
                      href={campaign.ticketPurchaseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline break-all"
                    >
                      {campaign.ticketPurchaseUrl}
                    </a>
                  </div>
                ) : null}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handleApprove(campaign.id)}
                  disabled={isPending}
                  className="btn-primary disabled:opacity-50"
                >
                  승인
                </button>
                <button
                  type="button"
                  onClick={() => handleReject(campaign.id)}
                  disabled={isPending}
                  className="rounded-2xl border border-rose-300 bg-rose-50 px-6 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-50"
                >
                  거부
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
