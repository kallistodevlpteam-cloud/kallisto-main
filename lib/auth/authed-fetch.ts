"use client";

/** Lightweight authenticated fetch wrapper for client-side API calls.
 *
 * Reads the auth token from document.cookie (set by the server after login)
 * and forwards it in an `Authorization: Bearer` header.
 *
 * IMPORTANT: Never store authentication tokens in localStorage.
 * This module uses cookies only.
 */
const AUTH_TOKEN_KEY = "kallisto_auth_token";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/[.*+?^${}()|[\]\\\\]/g, "\\$&") + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}

export function authedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getCookie(AUTH_TOKEN_KEY);
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return fetch(url, { ...options, headers });
}

/** Store the auth token via cookie (server-side should set httpOnly cookie;
 *  this client helper is for dev fallback only). */
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
  return getCookie(AUTH_TOKEN_KEY);
}
