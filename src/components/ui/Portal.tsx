"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

/**
 * 모달·드로어 등이 부모 stacking context에 갇히지 않도록
 * document.body 최상단에 children을 렌더링합니다.
 */
export function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    return () => setMounted(false)
  }, [])

  if (!mounted) return null
  return createPortal(children, document.body)
}
