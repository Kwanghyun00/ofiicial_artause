"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, XCircle, ExternalLink, Clock, User, Phone, Mail } from "lucide-react";
import { approveEventCampaign, rejectEventCampaign } from "@/app/event-center/actions";

export type PendingCampaign = {
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

type CampaignRowState = {
  status: "idle" | "approved" | "rejected" | "error";
  message?: string;
};

function CampaignCard({
  campaign,
}: {
  campaign: PendingCampaign;
}) {
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<CampaignRowState>({ status: "idle" });

  const handleApprove = () => {
    startTransition(async () => {
      const result = await approveEventCampaign(campaign.id);
      if (result.success) {
        setState({ status: "approved", message: "승인 완료됐습니다." });
      } else {
        setState({ status: "error", message: result.error || "승인 처리에 실패했습니다." });
      }
    });
  };

  const handleReject = () => {
    startTransition(async () => {
      const result = await rejectEventCampaign(campaign.id);
      if (result.success) {
        setState({ status: "rejected", message: "거부 처리됐습니다." });
      } else {
        setState({ status: "error", message: result.error || "거부 처리에 실패했습니다." });
      }
    });
  };

  if (state.status === "approved") {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        <span><strong>{campaign.title}</strong> — {state.message}</span>
      </div>
    );
  }

  if (state.status === "rejected") {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-500">
        <XCircle className="h-4 w-4 shrink-0" />
        <span><strong>{campaign.title}</strong> — {state.message}</span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm transition hover:border-slate-300">
      {/* 헤더 */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900">{campaign.title}</h3>
          <p className="mt-0.5 text-sm text-slate-500">공연: {campaign.performanceTitle}</p>
        </div>
        <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
          승인 대기
        </span>
      </div>

      {/* 세부 정보 */}
      <div className="grid gap-3 sm:grid-cols-2 text-sm text-slate-600">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <User className="h-3.5 w-3.5 text-slate-400" />
            <span>{campaign.partnerName}</span>
          </div>
          {campaign.partnerEmail && (
            <div className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-slate-400" />
              <span>{campaign.partnerEmail}</span>
            </div>
          )}
          {campaign.partnerPhone && (
            <div className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-slate-400" />
              <span>{campaign.partnerPhone}</span>
            </div>
          )}
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span>{campaign.period.start} ~ {campaign.period.end}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">🎫</span>
            <span>초대권 {campaign.ticketCount}매</span>
          </div>
          {campaign.ticketPurchaseUrl && (
            <a
              href={campaign.ticketPurchaseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-indigo-600 hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              예매 링크 확인
            </a>
          )}
        </div>
      </div>

      {/* 에러 */}
      {state.status === "error" && (
        <p className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
          ❌ {state.message}
        </p>
      )}

      {/* 액션 버튼 */}
      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={handleApprove}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
        >
          <CheckCircle2 className="h-4 w-4" />
          {isPending ? "처리 중..." : "승인"}
        </button>
        <button
          type="button"
          onClick={handleReject}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-5 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
        >
          <XCircle className="h-4 w-4" />
          거부
        </button>
      </div>
    </div>
  );
}

type Props = {
  campaigns: PendingCampaign[];
};

export function ApprovalQueue({ campaigns }: Props) {
  return (
    <section className="space-y-6 rounded-3xl border border-slate-200 bg-slate-50/60 p-8 shadow-sm">
      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-rose-500">이벤트 승인 관리</p>
        <h2 className="text-2xl font-semibold text-slate-900">
          승인 대기 중인 이벤트
          {campaigns.length > 0 && (
            <span className="ml-2 rounded-full bg-rose-100 px-2.5 py-0.5 text-base font-bold text-rose-600">
              {campaigns.length}
            </span>
          )}
        </h2>
        <p className="text-sm text-slate-600">
          공연 종사자가 등록한 이벤트를 검토하고 승인/거부하세요.
        </p>
      </header>

      {campaigns.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <p className="text-sm font-medium text-slate-400">승인 대기 중인 이벤트가 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      )}
    </section>
  );
}
