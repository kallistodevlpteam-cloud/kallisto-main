"use client";

/**
 * Authenticated fetch helper for client-side API calls.
 *
 * Reads the auth token from document.cookie (never localStorage for tokens)
 * and forwards it in an `Authorization: Bearer` header. Also attaches
 * `X-Provider-Id` for backend compatibility.
 */

const AUTH_TOKEN_KEY = "kallisto_auth_token";
const PROVIDER_ID_KEY = "kallisto_provider_id";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}

export function getStoredAuthToken(): string | null {
  return getCookie(AUTH_TOKEN_KEY);
}

export function getStoredProviderId(): string | null {
  return getCookie(PROVIDER_ID_KEY) ?? "SP-001";
}

export function authedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  const token = getStoredAuthToken();
  if (token && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const spId = getStoredProviderId();
  if (spId && !headers["X-Provider-Id"]) {
    headers["X-Provider-Id"] = spId;
  }

  return fetch(url, { ...options, headers });
}

/** Store the auth token via cookie. */
export function setAuthToken(token: string): void {
  if (typeof document !== "undefined") {
    document.cookie = `${AUTH_TOKEN_KEY}=${encodeURIComponent(token)}; path=/; max-age=86400; SameSite=Lax`;
  }
}

/** Remove the auth token cookie. */
export function clearAuthToken(): void {
  if (typeof document !== "undefined") {
    document.cookie = `${AUTH_TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
  }
}

/** Retrieve the current auth token from cookie. */
export function getAuthToken(): string | null {
  return getStoredAuthToken();
}
