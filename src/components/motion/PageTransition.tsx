"use client"

import { AnimatePresence, motion } from "framer-motion"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

type PageTransitionProps = {
  children: ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait" initial>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 16, scale: 0.985, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -12, scale: 0.985, filter: "blur(6px)" }}
        transition={{ duration: 0.32, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
