"use client";

import { useState, useTransition } from "react";
import { submitFeedback } from "./feedback-actions";

/**
 * 피드백 모달 컴포넌트
 *
 * 사용자가 언제든지 피드백이나 문의사항을 남길 수 있는 모달
 * - 버그 리포트
 * - 기능 제안
 * - 개선 요청
 * - 일반 문의
 */

type FeedbackType = "bug" | "feature" | "improvement" | "question" | "other";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function FeedbackModal({ isOpen, onClose }: Props) {
  const [type, setType] = useState<FeedbackType>("improvement");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !description.trim()) {
      setError("제목과 내용을 입력해주세요.");
      return;
    }

    startTransition(async () => {
      const result = await submitFeedback({
        type,
        title: title.trim(),
        description: description.trim(),
        authorName: name.trim() || null,
        authorEmail: email.trim() || null,
      });

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          // 폼 초기화
          setTitle("");
          setDescription("");
          setName("");
          setEmail("");
          setSuccess(false);
        }, 2000);
      } else {
        setError(result.error || "피드백 제출에 실패했습니다.");
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-3xl border border-slate-200 bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 px-6 py-5 text-white rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">피드백 보내기</h2>
              <p className="mt-1 text-sm text-white/90">
                여러분의 의견으로 Artause가 더 나아집니다
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 transition-colors hover:bg-white/20"
              aria-label="닫기"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {success ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
              <div className="text-4xl mb-3">✓</div>
              <p className="text-lg font-semibold text-emerald-900">피드백이 전송되었습니다!</p>
              <p className="mt-2 text-sm text-emerald-700">소중한 의견 감사합니다.</p>
            </div>
          ) : (
            <>
              {/* Feedback Type */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900">
                  피드백 유형
                </label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {[
                    { value: "bug", label: "버그 신고", icon: "🐛" },
                    { value: "feature", label: "기능 제안", icon: "💡" },
                    { value: "improvement", label: "개선 요청", icon: "⚡" },
                    { value: "question", label: "문의사항", icon: "❓" },
                    { value: "other", label: "기타", icon: "💬" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setType(option.value as FeedbackType)}
                      className={`rounded-2xl border-2 px-4 py-3 text-sm font-semibold transition-all ${
                        type === option.value
                          ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <span className="mr-2">{option.icon}</span>
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <label htmlFor="feedback-title" className="text-sm font-semibold text-slate-900">
                  제목 <span className="text-rose-500">*</span>
                </label>
                <input
                  id="feedback-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="간단히 요약해주세요"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                  disabled={isPending}
                  maxLength={100}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label htmlFor="feedback-description" className="text-sm font-semibold text-slate-900">
                  상세 내용 <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="feedback-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="자세히 설명해주세요"
                  rows={5}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                  disabled={isPending}
                  maxLength={2000}
                />
                <p className="text-xs text-slate-500">
                  {description.length} / 2000
                </p>
              </div>

              {/* Contact Info (Optional) */}
              <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-700">
                  연락처 (선택사항)
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="feedback-name" className="text-xs font-medium text-slate-600">
                      이름
                    </label>
                    <input
                      id="feedback-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="홍길동"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                      disabled={isPending}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="feedback-email" className="text-xs font-medium text-slate-600">
                      이메일
                    </label>
                    <input
                      id="feedback-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@email.com"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                      disabled={isPending}
                    />
                  </div>
                </div>
                <p className="text-xs text-slate-500">
                  답변이 필요한 경우 연락처를 남겨주세요
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-2xl border-2 border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 transition-all hover:bg-slate-50 active:scale-95"
                  disabled={isPending}
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isPending || !title.trim() || !description.trim()}
                  className="flex-1 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? "전송 중..." : "피드백 보내기"}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
