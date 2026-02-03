"use client"

import { useState } from "react"
import { MessageCircle } from "lucide-react"
import { FeedbackModal } from "./FeedbackModal"

export function FeedbackButton() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-5 right-5 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition hover:-translate-y-0.5 hover:bg-primary/90 sm:h-14 sm:w-14"
        aria-label="피드백 보내기"
        title="피드백 보내기"
      >
        <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>

      <FeedbackModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
