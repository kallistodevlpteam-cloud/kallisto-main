"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

interface AuthState {
  token: string | null;
  spId: string | null;
  email: string | null;
  providerName: string | null;
  isLoggedIn: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "kallisto_auth_token";

function readStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { token: string };
      return parsed.token ?? null;
    }
  } catch {
    // ignore
  }
  return null;
}

function readStoredSpId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { sp_id: string };
      return parsed.sp_id ?? null;
    }
  } catch {
    // ignore
  }
  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(readStoredToken);
  const [spId, setSpId] = useState<string | null>(readStoredSpId);
  const [email, setEmail] = useState<string | null>(null);
  const [providerName, setProviderName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (emailValue: string, passwordValue: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailValue, password: passwordValue }),
      });
      const payload = (await response.json()) as {
        status: string;
        token?: string;
        sp_id?: string;
        message?: string;
      };
      if (!response.ok || payload.status !== "ok" || !payload.token) {
        throw new Error(payload.message ?? "Login failed");
      }
      setToken(payload.token);
      setSpId(payload.sp_id ?? null);
      setEmail(emailValue);
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ token: payload.token, sp_id: payload.sp_id })
      );
      // Fetch profile
      const meResponse = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${payload.token}` },
      });
      const me = (await meResponse.json()) as {
        status: string;
        provider_name?: string;
        email?: string;
      };
      if (me.status === "ok") {
        setProviderName(me.provider_name ?? null);
        setEmail(me.email ?? null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setSpId(null);
    setEmail(null);
    setProviderName(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value: AuthContextValue = {
    token,
    spId,
    email,
    providerName,
    isLoggedIn: !!token,
    login,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { token: string };
    return parsed.token ?? null;
  } catch {
    return null;
  }
}
