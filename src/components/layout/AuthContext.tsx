"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { mockUsers, type MockUser } from "@/lib/mocks/users";

export type AuthUser = MockUser;
export type AuthRole = AuthUser["role"];

interface AuthResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  initialized: boolean;
  loginWithKakao: (kakaoId: string) => Promise<AuthResult>;
  logout: () => void;
  kakaoCandidates: AuthUser[];
}

const AUTH_USER_KEY = "artause-auth-user";

const AuthContext = createContext<AuthContextValue | null>(null);

function isKakaoUser(candidate: MockUser | null | undefined): candidate is AuthUser {
  return Boolean(candidate && candidate.provider === "kakao" && candidate.kakaoId);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const kakaoUsers = useMemo(() => mockUsers.filter(isKakaoUser), []);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = window.localStorage.getItem(AUTH_USER_KEY);
      if (!stored) return;

      const parsed = JSON.parse(stored) as Partial<AuthUser> | { kakaoId?: string };
      const kakaoId =
        typeof parsed === "object" && parsed
          ? (parsed as { kakaoId?: string }).kakaoId ?? (parsed as Partial<AuthUser>).kakaoId
          : undefined;
      if (!kakaoId) return;

      const match = kakaoUsers.find((candidate) => candidate.kakaoId === kakaoId);
      if (match) {
        setUser(match);
      }
    } catch (error) {
      console.error("AuthProvider hydration error", error);
    } finally {
      setInitialized(true);
    }
  }, [kakaoUsers]);

  useEffect(() => {
    if (!initialized || typeof window === "undefined") return;

    if (user && user.kakaoId) {
      window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify({ kakaoId: user.kakaoId }));
    } else {
      window.localStorage.removeItem(AUTH_USER_KEY);
    }
  }, [initialized, user]);

  const loginWithKakao = useCallback(
    async (kakaoId: string): Promise<AuthResult> => {
      const trimmed = kakaoId.trim();
      const match = kakaoUsers.find((candidate) => candidate.kakaoId === trimmed);

      if (!match) {
        return { success: false, error: "해당 카카오 계정을 찾을 수 없습니다." };
      }

      setUser(match);
      return { success: true, user: match };
    },
    [kakaoUsers],
  );

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const value: AuthContextValue = useMemo(
    () => ({
      user,
      initialized,
      loginWithKakao,
      logout,
      kakaoCandidates: kakaoUsers,
    }),
    [initialized, kakaoUsers, loginWithKakao, logout, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
