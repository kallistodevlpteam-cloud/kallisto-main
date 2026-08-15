/**
 * Authenticated fetch helper for client-side and server-side components.
 * Attaches the current session token or simulated authentication headers.
 */

export function getStoredAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  // Check localStorage first
  const localToken = window.localStorage.getItem("kallisto_auth_token");
  if (localToken) return localToken;

  // Check cookies
  const cookies = document.cookie.split("; ");
  for (const c of cookies) {
    const [name, val] = c.split("=");
    if (name === "kallisto_auth_token" && val) return decodeURIComponent(val);
  }
  return null;
}

export function getStoredProviderId(): string | null {
  if (typeof window === "undefined") return null;
  const localSpId = window.localStorage.getItem("kallisto_provider_id");
  if (localSpId) return localSpId;

  const cookies = document.cookie.split("; ");
  for (const c of cookies) {
    const [name, val] = c.split("=");
    if (name === "kallisto_provider_id" && val) return decodeURIComponent(val);
  }
  return "SP-001";
}

export async function authedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers || {});

  const token = getStoredAuthToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const spId = getStoredProviderId();
  if (spId && !headers.has("X-Provider-Id")) {
    headers.set("X-Provider-Id", spId);
  }

  return fetch(url, {
    ...options,
    headers,
  });
}
