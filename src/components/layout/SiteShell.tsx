"use client";

import { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { RoleGate } from "./RoleGate";
import { RoleProvider, useRole } from "./RoleContext";
import { AuthProvider } from "./AuthContext";
import { AuthGate } from "./AuthGate";

interface SiteShellProps {
  children: ReactNode;
}

function ShellFrame({ children }: { children: ReactNode }) {
  const { role } = useRole();
  const wrapperClass = role === "partner" ? "bg-slate-950 text-white" : "bg-[#f7f7fb] text-slate-900";
  const mainClass = role === "partner" ? "bg-slate-950 text-white" : "";

  return (
    <div className={`flex min-h-screen flex-col transition-colors ${wrapperClass}`}>
      <SiteHeader />
      <main className={`flex-1 ${mainClass}`}>{children}</main>
      <SiteFooter />
      <AuthGate />
      <RoleGate />
    </div>
  );
}

export function SiteShell({ children }: SiteShellProps) {
  return (
    <AuthProvider>
      <RoleProvider>
        <ShellFrame>{children}</ShellFrame>
      </RoleProvider>
    </AuthProvider>
  );
}
