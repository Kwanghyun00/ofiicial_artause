"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"

const STORAGE_KEY = "artause-curtain-seen-session-v2"
const CURTAIN_FADE_DELAY = 3.4
const CURTAIN_FADE_DURATION = 0.6
const SPOTLIGHT_DURATION = 2.4

export function CurtainIntro() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (pathname !== "/") return
    let hasSeen = false
    try {
      hasSeen = window.sessionStorage.getItem(STORAGE_KEY) === "1"
    } catch {
      hasSeen = false
    }
    if (hasSeen) return

    const frameId = requestAnimationFrame(() => {
      setVisible(true)
    })
    return () => cancelAnimationFrame(frameId)
  }, [pathname])

  if (!visible || pathname !== "/") return null

  function handleDone() {
    setVisible(false)
    try {
      window.sessionStorage.setItem(STORAGE_KEY, "1")
    } catch {
      // ignore
    }
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-[#0a0a12]"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: CURTAIN_FADE_DURATION, delay: CURTAIN_FADE_DELAY, ease: "easeInOut" }}
        onAnimationComplete={handleDone}
      />

      <motion.div
        className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(255,140,66,0.22) 0%, rgba(255,107,53,0.12) 35%, transparent 70%)",
        }}
        initial={{ scale: 0.1, opacity: 0 }}
        animate={{ scale: 6, opacity: [0, 0.9, 0.9, 0] }}
        transition={{
          duration: SPOTLIGHT_DURATION,
          delay: 0.1,
          ease: [0.1, 0, 0.3, 1],
          opacity: { times: [0, 0.1, 0.7, 1], duration: SPOTLIGHT_DURATION, delay: 0.1 },
        }}
      />

      <div className="relative flex h-full w-full items-center justify-center text-center">
        <button
          type="button"
          onClick={handleDone}
          className="pointer-events-auto rounded-2xl px-4 py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          aria-label="인트로 건너뛰기"
        >
          <div className="space-y-4 px-4">
            <motion.span
              className="cue inline-flex items-center gap-2 border-white/30 bg-white/10 text-white/80"
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, delay: 0.15, ease: "easeOut" }}
            >
              Artause
            </motion.span>
            <motion.h2
              className="font-display whitespace-pre-line text-2xl font-bold text-white/90 sm:text-3xl md:text-4xl"
              style={{ letterSpacing: "-0.02em" }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.35, ease: "easeOut" }}
            >
              {"지금 무대,\n초대권으로 만나보세요"}
            </motion.h2>
            <motion.p
              className="text-xs text-white/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.9, ease: "easeOut" }}
            >
              중앙 영역을 클릭하면 바로 닫힙니다
            </motion.p>
          </div>
        </button>
      </div>
    </div>
  )
}
