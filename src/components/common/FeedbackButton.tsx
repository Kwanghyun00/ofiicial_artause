"use client";

import { useState } from "react";
import { FeedbackModal } from "./FeedbackModal";

/**
 * 플로팅 피드백 버튼
 *
 * - 정적인 딥 네이비 배경
 * - hover 시에만 약간 밝아지고 그림자 추가
 * - 과도한 반짝임/애니메이션 없음
 */

const colors = {
  navy: "#293380",
  navyLight: "#3d4a9e",
};

export function FeedbackButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* Floating Button - 정적 스타일 */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full text-white shadow-md transition-all duration-200 hover:shadow-lg sm:h-14 sm:w-14"
        style={{
          backgroundColor: colors.navy,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = colors.navyLight;
          e.currentTarget.style.transform = "scale(1.05)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = colors.navy;
          e.currentTarget.style.transform = "scale(1)";
        }}
        aria-label="피드백 보내기"
        title="피드백 보내기"
      >
        {/* 정적 메시지 아이콘 */}
        <svg
          className="h-5 w-5 sm:h-6 sm:w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </button>

      {/* Modal */}
      <FeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
