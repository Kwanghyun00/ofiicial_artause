import { getAllFeedback } from "@/components/common/feedback-actions";
import { FeedbackList } from "./FeedbackList";

export const metadata = {
  title: "피드백 관리",
  description: "사용자 피드백 및 문의사항을 확인하고 관리합니다.",
};

export default async function AdminFeedbackPage() {
  const feedbackList = await getAllFeedback();

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 space-y-8">
      {/* Header */}
      <section className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-12 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDEzNGgxMnYxMkgzNnptMjQgMGgxMnYxMkg2MHpNMTIgMTEwaDEydjEySDE2em0yNCAwaDEydjEySDM2em0yNCAwaDEydjEySDYwem0yNCAwaDEydjEySDg0em0wIDI0aDEydjEySDg0em0wIDI0aDEydjEySDg0eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm mb-4">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <p className="text-xs font-medium uppercase tracking-wider">Admin</p>
          </div>
          <h1 className="text-4xl font-bold md:text-5xl">피드백 관리</h1>
          <p className="mt-4 max-w-2xl text-lg text-white/90">
            사용자가 제출한 피드백과 문의사항을 확인하고 관리하세요
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <div className="rounded-2xl border border-white/20 bg-white/10 px-6 py-3 backdrop-blur-sm">
              <p className="text-sm text-white/70">전체 피드백</p>
              <p className="text-2xl font-bold">{feedbackList.length}</p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 px-6 py-3 backdrop-blur-sm">
              <p className="text-sm text-white/70">미처리</p>
              <p className="text-2xl font-bold">
                {feedbackList.filter(f => f.status === 'new').length}
              </p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 px-6 py-3 backdrop-blur-sm">
              <p className="text-sm text-white/70">검토 중</p>
              <p className="text-2xl font-bold">
                {feedbackList.filter(f => f.status === 'in_review').length}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feedback List */}
      <FeedbackList initialFeedback={feedbackList as any} />
    </div>
  );
}
