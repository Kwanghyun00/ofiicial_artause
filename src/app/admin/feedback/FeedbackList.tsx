"use client";

import { useState, useTransition } from "react";
import { updateFeedbackStatus } from "@/components/common/feedback-actions";

type Feedback = {
  id: string;
  type: string;
  title: string;
  description: string;
  author_name: string | null;
  author_email: string | null;
  author_role: string | null;
  page_url: string | null;
  status: string;
  priority: string;
  admin_notes: string | null;
  created_at: string;
};

type Props = {
  initialFeedback: Feedback[];
};

export function FeedbackList({ initialFeedback }: Props) {
  const [feedback, setFeedback] = useState(initialFeedback);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [isPending, startTransition] = useTransition();

  const selected = feedback.find(f => f.id === selectedId);

  const filteredFeedback = feedback.filter(f => {
    if (filter === "all") return true;
    return f.status === filter;
  });

  const handleStatusUpdate = (feedbackId: string, newStatus: string) => {
    startTransition(async () => {
      const result = await updateFeedbackStatus(feedbackId, newStatus as any);
      if (result.success) {
        setFeedback(prev =>
          prev.map(f =>
            f.id === feedbackId ? { ...f, status: newStatus } : f
          )
        );
      }
    });
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      bug: "버그",
      feature: "기능 제안",
      improvement: "개선",
      question: "문의",
      other: "기타",
    };
    return labels[type] || type;
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      bug: "🐛",
      feature: "💡",
      improvement: "⚡",
      question: "❓",
      other: "💬",
    };
    return icons[type] || "💬";
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: "bg-blue-100 text-blue-700",
      in_review: "bg-yellow-100 text-yellow-700",
      planned: "bg-purple-100 text-purple-700",
      completed: "bg-emerald-100 text-emerald-700",
      rejected: "bg-slate-100 text-slate-700",
    };
    return colors[status] || "bg-slate-100 text-slate-700";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      new: "신규",
      in_review: "검토 중",
      planned: "계획됨",
      completed: "완료",
      rejected: "거부",
    };
    return labels[status] || status;
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {[
          { value: "all", label: "전체" },
          { value: "new", label: "신규" },
          { value: "in_review", label: "검토 중" },
          { value: "planned", label: "계획됨" },
          { value: "completed", label: "완료" },
          { value: "rejected", label: "거부" },
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value)}
            className={`rounded-2xl px-4 py-2 text-sm font-semibold transition-all ${
              filter === option.value
                ? "bg-indigo-600 text-white shadow-lg"
                : "bg-white text-slate-700 border border-slate-200 hover:border-slate-300"
            }`}
          >
            {option.label}
            {option.value !== "all" && (
              <span className="ml-2 text-xs opacity-75">
                ({feedback.filter(f => f.status === option.value).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Feedback Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* List */}
        <div className="space-y-4">
          {filteredFeedback.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
              <p className="text-lg font-medium text-slate-400">피드백이 없습니다</p>
            </div>
          ) : (
            filteredFeedback.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                className={`w-full rounded-3xl border bg-white p-6 text-left transition-all hover:shadow-lg ${
                  selectedId === item.id
                    ? "border-indigo-600 shadow-lg"
                    : "border-slate-200"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{getTypeIcon(item.type)}</span>
                      <span className="text-xs font-medium text-slate-600">
                        {getTypeLabel(item.type)}
                      </span>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(item.status)}`}>
                        {getStatusLabel(item.status)}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 line-clamp-1">{item.title}</h3>
                    <p className="mt-2 text-sm text-slate-600 line-clamp-2">{item.description}</p>
                    <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                      {item.author_name && <span>👤 {item.author_name}</span>}
                      <span>
                        {new Date(item.created_at).toLocaleDateString("ko-KR")}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Detail */}
        {selected ? (
          <div className="sticky top-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-xl h-fit">
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-3xl">{getTypeIcon(selected.type)}</span>
                  <div>
                    <p className="text-xs font-medium text-slate-600">
                      {getTypeLabel(selected.type)}
                    </p>
                    <span className={`inline-block mt-1 rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(selected.status)}`}>
                      {getStatusLabel(selected.status)}
                    </span>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-slate-900">{selected.title}</h2>
              </div>

              <div className="border-t border-slate-200 pt-6">
                <h3 className="font-semibold text-slate-700 mb-2">상세 내용</h3>
                <p className="text-slate-600 whitespace-pre-wrap">{selected.description}</p>
              </div>

              {(selected.author_name || selected.author_email) && (
                <div className="border-t border-slate-200 pt-6">
                  <h3 className="font-semibold text-slate-700 mb-2">제출자 정보</h3>
                  <div className="space-y-1 text-sm text-slate-600">
                    {selected.author_name && <p>이름: {selected.author_name}</p>}
                    {selected.author_email && <p>이메일: {selected.author_email}</p>}
                  </div>
                </div>
              )}

              {selected.page_url && (
                <div className="border-t border-slate-200 pt-6">
                  <h3 className="font-semibold text-slate-700 mb-2">페이지 정보</h3>
                  <p className="text-xs text-slate-500 break-all">{selected.page_url}</p>
                </div>
              )}

              <div className="border-t border-slate-200 pt-6">
                <h3 className="font-semibold text-slate-700 mb-3">상태 변경</h3>
                <div className="grid grid-cols-2 gap-2">
                  {["new", "in_review", "planned", "completed", "rejected"].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusUpdate(selected.id, status)}
                      disabled={isPending || selected.status === status}
                      className={`rounded-2xl px-4 py-2 text-sm font-semibold transition-all ${
                        selected.status === status
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      } disabled:opacity-50`}
                    >
                      {getStatusLabel(status)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="sticky top-6 rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
            <p className="text-slate-400">피드백을 선택하세요</p>
          </div>
        )}
      </div>
    </div>
  );
}
