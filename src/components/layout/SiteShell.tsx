"use client";

import { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { FeedbackButton } from "@/components/common/FeedbackButton";

interface SiteShellProps {
  children: ReactNode;
}

export function SiteShell({ children }: SiteShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f7f7fb] text-slate-900">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <FeedbackButton />
    </div>
  );
}
