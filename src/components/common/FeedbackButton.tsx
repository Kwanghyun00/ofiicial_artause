"use client";

import { useState } from "react";
import { FeedbackModal } from "./FeedbackModal";

/**
 * 플로팅 피드백 버튼
 *
 * 화면 우측 하단에 고정되어 있는 피드백 버튼
 * 클릭 시 FeedbackModal 열림
 */

export function FeedbackButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl active:scale-95 sm:h-16 sm:w-16"
        aria-label="피드백 보내기"
        title="피드백 보내기"
      >
        <svg className="h-6 w-6 sm:h-7 sm:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        {/* Pulse Animation */}
        <span className="absolute inset-0 rounded-full bg-indigo-600 opacity-75 animate-ping"></span>
      </button>

      {/* Modal */}
      <FeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
