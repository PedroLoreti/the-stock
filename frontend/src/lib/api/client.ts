import axios, { type InternalAxiosRequestConfig } from "axios";
import { toApiError } from "./errors";
import type { AuthResponse } from "./types";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

/**
 * The access token lives only in memory: it is never persisted, so a page
 * reload starts with no token and relies on the httpOnly refresh cookie.
 */
let accessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export const api = axios.create({
  baseURL: API_URL,
  // Required so the browser sends/receives the refresh cookie on /auth routes.
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (accessToken && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

/** Shared promise so concurrent 401s trigger a single refresh request. */
let refreshPromise: Promise<AuthResponse> | null = null;

/** Calls POST /auth/refresh using the cookie. Throws if the session is gone. */
export async function refreshSession(): Promise<AuthResponse> {
  refreshPromise ??= axios
    .post<AuthResponse>(`${API_URL}/auth/refresh`, null, { withCredentials: true })
    .then((response) => {
      setAccessToken(response.data.accessToken);
      return response.data;
    })
    .catch((error) => {
      setAccessToken(null);
      throw error;
    })
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
}

/** Notified when a refresh fails after a 401, so the UI can drop the session. */
let onSessionExpired: (() => void) | null = null;

export function setOnSessionExpired(handler: (() => void) | null): void {
  onSessionExpired = handler;
}

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error) || error.response?.status !== 401) {
      throw toApiError(error);
    }

    const config = error.config as RetriableConfig | undefined;
    // A 401 from the login itself means wrong credentials, not an expired session.
    const isLogin = config?.url === "/auth/login";
    if (!config || config._retried || isLogin) {
      throw toApiError(error);
    }

    try {
      await refreshSession();
    } catch {
      onSessionExpired?.();
      throw toApiError(error);
    }

    config._retried = true;
    delete config.headers.Authorization;
    return api(config);
  },
);
