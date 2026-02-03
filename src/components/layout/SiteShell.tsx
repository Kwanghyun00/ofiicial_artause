"use client";

import { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader"
import { SiteFooter } from "./SiteFooter"
import { PageTransition } from "@/components/motion/PageTransition"
import { FeedbackButton } from "@/components/common/FeedbackButton"
import { AnnouncementBar } from "./AnnouncementBar"

interface SiteShellProps {
  children: ReactNode;
}

export function SiteShell({ children }: SiteShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)] text-slate-900">
      <AnnouncementBar />
      <SiteHeader />
      <main className="flex-1">
        <PageTransition>{children}</PageTransition>
      </main>
      <SiteFooter />
      <FeedbackButton />
    </div>
  )
}
