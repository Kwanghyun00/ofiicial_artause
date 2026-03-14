"use client"

import { useEffect, useRef, useState } from "react"
import { useInView } from "framer-motion"

type CountUpProps = {
  value: number
  duration?: number
  prefix?: string
  suffix?: string
  className?: string
  format?: (value: number) => string
}

export function CountUp({ value, duration = 1.1, prefix = "", suffix = "", className, format }: CountUpProps) {
  const ref = useRef<HTMLSpanElement | null>(null)
  const isInView = useInView(ref, { once: true, amount: 0.6 })
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    if (!isInView) return

    let start: number | null = null
    let frameId: number

    const tick = (timestamp: number) => {
      if (start === null) start = timestamp
      const progress = Math.min((timestamp - start) / (duration * 1000), 1)
      setDisplayValue(Math.round(progress * value))
      if (progress < 1) {
        frameId = requestAnimationFrame(tick)
      }
    }

    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [duration, isInView, value])

  const content = format ? format(displayValue) : displayValue.toLocaleString("ko-KR")

  return (
    <span ref={ref} className={className}>
      {prefix}
      {content}
      {suffix}
    </span>
  )
}
