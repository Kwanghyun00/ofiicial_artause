"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

type Props = {
  intervalMs: number
}

export function ShowsAutoRefresh({ intervalMs }: Props) {
  const router = useRouter()
  const safeIntervalMs = Math.max(intervalMs, 15_000)

  useEffect(() => {
    const timer = window.setInterval(() => {
      router.refresh()
    }, safeIntervalMs)

    return () => window.clearInterval(timer)
  }, [router, safeIntervalMs])

  return <span>자동 갱신 {Math.round(safeIntervalMs / 1000)}초</span>
}

