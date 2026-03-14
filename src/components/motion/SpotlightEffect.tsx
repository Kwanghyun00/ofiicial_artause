"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"

type SpotlightEffectProps = {
  enabled?: boolean
  size?: number
  color?: string
}

export function SpotlightEffect({
  enabled = true,
  size = 200,
  color = "rgba(255, 107, 53, 0.15)",
}: SpotlightEffectProps) {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null)
  const [isVisible, setIsVisible] = useState(true)
  const isVisibleRef = useRef(true)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (!enabled) return

    const handlePointerMove = (e: PointerEvent) => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }

      rafRef.current = requestAnimationFrame(() => {
        setPosition({ x: e.clientX, y: e.clientY })
        if (!isVisibleRef.current) {
          setIsVisible(true)
          isVisibleRef.current = true
        }
      })
    }

    const handlePointerLeave = () => {
      setIsVisible(false)
      isVisibleRef.current = false
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: true })
    window.addEventListener("pointerleave", handlePointerLeave)

    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerleave", handlePointerLeave)
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <motion.div
      className="pointer-events-none fixed z-[5] rounded-full mix-blend-multiply blur-3xl"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color}, transparent 70%)`,
        left: position ? position.x - size / 2 : `calc(50vw - ${size / 2}px)`,
        top: position ? position.y - size / 2 : `calc(50vh - ${size / 2}px)`,
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: isVisible ? 1 : 0,
        scale: isVisible ? 1 : 0.8,
      }}
      transition={{
        opacity: { duration: 0.3 },
        scale: { duration: 0.3 },
      }}
    />
  )
}
