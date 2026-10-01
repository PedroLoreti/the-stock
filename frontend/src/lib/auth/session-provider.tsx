"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/features/auth/api";
import {
  refreshSession,
  setAccessToken,
  setOnSessionExpired,
} from "@/lib/api/client";
import type { AuthResponse, User } from "@/lib/api/types";

type SessionStatus = "loading" | "authenticated" | "unauthenticated";

interface SessionContextValue {
  status: SessionStatus;
  user: User | null;
  /** Stores the tokens/user returned by login, refresh or password change. */
  signIn: (response: AuthResponse) => void;
  /** Revokes the refresh token on the server and clears local state. */
  signOut: () => Promise<void>;
  updateUser: (user: User) => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<SessionStatus>("loading");
  const [user, setUser] = useState<User | null>(null);

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setUser(null);
    setStatus("unauthenticated");
    queryClient.clear();
  }, [queryClient]);

  const signIn = useCallback((response: AuthResponse) => {
    setAccessToken(response.accessToken);
    setUser(response.user);
    setStatus("authenticated");
  }, []);

  const signOut = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // The cookie may already be gone; local state is cleared regardless.
    }
    clearSession();
  }, [clearSession]);

  // On first load there is no access token in memory: try to restore the
  // session from the httpOnly refresh cookie.
  useEffect(() => {
    let cancelled = false;
    refreshSession()
      .then((response) => {
        if (!cancelled) signIn(response);
      })
      .catch(() => {
        if (!cancelled) clearSession();
      });
    return () => {
      cancelled = true;
    };
  }, [signIn, clearSession]);

  // When a request gets a 401 and the refresh also fails, drop the session.
  useEffect(() => {
    setOnSessionExpired(clearSession);
    return () => setOnSessionExpired(null);
  }, [clearSession]);

  const value = useMemo<SessionContextValue>(
    () => ({ status, user, signIn, signOut, updateUser: setUser }),
    [status, user, signIn, signOut],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
