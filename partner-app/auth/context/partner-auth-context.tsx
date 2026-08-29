"use client";

import React, { createContext, useContext, useEffect, useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { PartnerType, PartnerUser, PartnerSession } from "../../shared/types/partner-domain";
import { PartnerAuthCredentials, PartnerAuthResult, PartnerAuthContextState } from "../types";
import { PartnerAuthService } from "../services/partner-auth-service";
import { getPartnerConfig, DEFAULT_PARTNER_TYPE } from "../../shared/config/partner-config";

const PartnerAuthContext = createContext<PartnerAuthContextState | undefined>(undefined);

export function PartnerAuthProvider({ children }: { children: React.ReactNode }) {
  const [partnerType, setPartnerType] = useState<PartnerType>(DEFAULT_PARTNER_TYPE);
  const [user, setUser] = useState<PartnerUser | null>(null);
  const [session, setSession] = useState<PartnerSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  useEffect(() => {
    const existing = PartnerAuthService.restoreSession();
    if (existing) {
      setPartnerType(existing.partnerType);
      setUser(existing.user);
      setSession(existing);
    } else {
      const storedType = PartnerAuthService.getStoredPartnerType();
      setPartnerType(storedType);
    }
    setIsLoading(false);
  }, []);

  const signIn = async (credentials: PartnerAuthCredentials): Promise<PartnerAuthResult> => {
    setIsLoading(true);
    try {
      const result = await PartnerAuthService.authenticate(credentials);
      if (result.success && result.session) {
        setPartnerType(result.session.partnerType);
        setUser(result.session.user);
        setSession(result.session);
        const config = getPartnerConfig(result.session.partnerType);
        startTransition(() => {
          router.push(config.defaultRoute);
        });
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const signInDemo = async (type: PartnerType): Promise<PartnerAuthResult> => {
    return signIn({
      emailOrPhone: `${type.toLowerCase()}@kallisto.com`,
      partnerType: type,
    });
  };

  const signOut = async (): Promise<void> => {
    PartnerAuthService.clearSession();
    setSession(null);
    setUser(null);
    startTransition(() => {
      router.push("/partner/login");
    });
  };

  const switchPartnerType = async (newType: PartnerType): Promise<void> => {
    const targetType = newType.toUpperCase();
    const result = await signInDemo(targetType);
    if (result.success && result.session) {
      const config = getPartnerConfig(targetType);
      startTransition(() => {
        router.push(config.defaultRoute);
      });
    }
  };

  return (
    <PartnerAuthContext.Provider
      value={{
        isAuthenticated: Boolean(session),
        isLoading,
        partnerType,
        user,
        session,
        signIn,
        signInDemo,
        signOut,
        switchPartnerType,
      }}
    >
      {children}
    </PartnerAuthContext.Provider>
  );
}

export function usePartnerAuth(): PartnerAuthContextState {
  const context = useContext(PartnerAuthContext);
  if (!context) {
    throw new Error("usePartnerAuth must be used within a PartnerAuthProvider");
  }
  return context;
}
