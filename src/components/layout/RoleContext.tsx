"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "./AuthContext";

type Role = "audience" | "partner";

type RoleContextValue = {
  role: Role;
  hasAnswered: boolean;
  initialized: boolean;
  setRole: (role: Role) => void;
  resetChoice: () => void;
  lockedRoleAttempt: Role | null;
  clearLockedRoleAttempt: () => void;
};

const ROLE_KEY = "artause-role";
const ANSWER_KEY = "artause-role-answered";
const PARTNER_PREFIXES = ["/partner", "/admin", "/request"];
const AUDIENCE_DEFAULT_ROUTE = "/";
const PARTNER_DEFAULT_ROUTE = "/partner";

const RoleContext = createContext<RoleContextValue | null>(null);

function deriveRoleFromPath(pathname: string) {
  return PARTNER_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ? ("partner" as Role) : null;
}

function isPartnerOnlyPath(pathname: string) {
  return PARTNER_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function normalizeParamRole(value: string | null): Role | null {
  if (!value) return null;
  const lowered = value.toLowerCase();
  if (["audience", "bloom", "watch"].includes(lowered)) return "audience";
  if (["partner", "promote", "slate"].includes(lowered)) return "partner";
  return null;
}

type ChoiceState = {
  role: Role;
  answered: boolean;
};

function getInitialChoice(): ChoiceState {
  if (typeof window === "undefined") {
    return { role: "audience", answered: false };
  }

  const params = new URLSearchParams(window.location.search);
  const queryRole = normalizeParamRole(
    params.get("role") ?? params.get("intent") ?? params.get("purpose"),
  );
  const pathRole = deriveRoleFromPath(window.location.pathname ?? "/");
  const storedRole = (window.localStorage.getItem(ROLE_KEY) as Role | null) ?? null;
  const storedAnswered = window.localStorage.getItem(ANSWER_KEY) === "true";

  const fallbackRole = storedRole ?? "audience";
  const role = queryRole ?? pathRole ?? fallbackRole;
  const answered = storedAnswered || Boolean(queryRole) || Boolean(pathRole);

  return { role, answered };
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/";
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, initialized: authInitialized } = useAuth();

  const [choiceState, setChoiceState] = useState<ChoiceState>(() => getInitialChoice());
  const [lockedRoleAttempt, setLockedRoleAttempt] = useState<Role | null>(null);

  const queryRole = normalizeParamRole(
    searchParams?.get("role") ?? searchParams?.get("intent") ?? searchParams?.get("purpose"),
  );
  const pathRole = deriveRoleFromPath(pathname);

  const resolvedRole: Role = useMemo(() => {
    if (user) return user.role;
    if (queryRole) return queryRole;
    if (pathRole) return pathRole;
    return choiceState.role;
  }, [choiceState.role, pathRole, queryRole, user]);

  const hasAnswered = useMemo(() => {
    if (user) return true;
    if (queryRole || pathRole) return true;
    return choiceState.answered;
  }, [choiceState.answered, pathRole, queryRole, user]);

  useEffect(() => {
    if (!authInitialized || !user) return;

    const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
    const inPartnerArea = isPartnerOnlyPath(normalizedPath);

    if (user.role === "audience" && inPartnerArea) {
      if (normalizedPath !== AUDIENCE_DEFAULT_ROUTE) {
        router.replace(AUDIENCE_DEFAULT_ROUTE);
      }
      return;
    }

    if (user.role === "partner" && !inPartnerArea) {
      if (!normalizedPath.startsWith(PARTNER_DEFAULT_ROUTE)) {
        router.replace(PARTNER_DEFAULT_ROUTE);
      }
    }
  }, [authInitialized, pathname, router, user]);

  useEffect(() => {
    if (user) {
      window.localStorage.removeItem(ROLE_KEY);
      window.localStorage.removeItem(ANSWER_KEY);
      return;
    }

    if (!hasAnswered) {
      window.localStorage.removeItem(ROLE_KEY);
      window.localStorage.removeItem(ANSWER_KEY);
      return;
    }

    window.localStorage.setItem(ROLE_KEY, resolvedRole);
    window.localStorage.setItem(ANSWER_KEY, "true");
  }, [hasAnswered, resolvedRole, user]);

  const setRole = useCallback(
    (nextRole: Role) => {
      if (user) {
        if (user.role !== nextRole) {
          setLockedRoleAttempt(nextRole);
        }
        return;
      }
      setChoiceState({ role: nextRole, answered: true });
    },
    [user],
  );

  const resetChoice = useCallback(() => {
    setChoiceState({ role: "audience", answered: false });
    setLockedRoleAttempt(null);
  }, []);

  const clearLockedRoleAttempt = useCallback(() => {
    setLockedRoleAttempt(null);
  }, []);

  const value = useMemo(
    () => ({
      role: resolvedRole,
      hasAnswered,
      initialized: true,
      setRole,
      resetChoice,
      lockedRoleAttempt,
      clearLockedRoleAttempt,
    }),
    [clearLockedRoleAttempt, hasAnswered, lockedRoleAttempt, resetChoice, resolvedRole, setRole],
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return ctx;
}
