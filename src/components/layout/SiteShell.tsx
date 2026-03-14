"use client"

import { ReactNode } from "react"
import { usePathname } from "next/navigation"
import { SiteHeader } from "./SiteHeader"
import { SiteFooter } from "./SiteFooter"
import { PageTransition } from "@/components/motion/PageTransition"
import { FeedbackButton } from "@/components/common/FeedbackButton"
import { CurtainIntro } from "@/components/motion/CurtainIntro"
import { SpotlightEffect } from "@/components/motion/SpotlightEffect"
import { EncoreCTA } from "@/components/common/EncoreCTA"

interface SiteShellProps {
  children: ReactNode
}

export function SiteShell({ children }: SiteShellProps) {
  const pathname = usePathname()
  const hideEncore =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/partner") ||
    pathname.startsWith("/me") ||
    pathname.startsWith("/event-center")

  return (
    <div className="stage-shell flex min-h-screen flex-col text-foreground">
      <SpotlightEffect />
      <CurtainIntro />
      <SiteHeader />
      <main className="flex-1">
        <PageTransition>{children}</PageTransition>
      </main>
      {!hideEncore && <EncoreCTA />}
      <SiteFooter />
      <FeedbackButton />
    </div>
  )
}
