"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { RoutePageContainer } from "@/components/ui/route-page-container";
import { PartnerAuthProvider, usePartnerAuth } from "../auth/context/partner-auth-context";
import { getPartnerConfig } from "../shared/config/partner-config";

interface PartnerAppShellProps {
  children: React.ReactNode;
}

function PartnerAppShellContent({ children }: PartnerAppShellProps) {
  const { isAuthenticated, isLoading, partnerType } = usePartnerAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Protect Partner App routes client-side: redirect to /partner/login if unauthenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      if (pathname.startsWith("/partner") && pathname !== "/partner/login" && pathname !== "/partner/sign-in") {
        router.replace("/partner/login");
      }
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  // Route authorization check: enforce access for /partner/hands, /partner/hub, /partner/basics
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const normalized = (partnerType || "").toUpperCase();
      if (pathname.startsWith("/partner/hands") && normalized !== "HANDS") {
        const targetCfg = getPartnerConfig(normalized);
        router.replace(targetCfg.defaultRoute);
      } else if (pathname.startsWith("/partner/hub") && normalized !== "HUB") {
        const targetCfg = getPartnerConfig(normalized);
        router.replace(targetCfg.defaultRoute);
      } else if (pathname.startsWith("/partner/basics") && normalized !== "BASICS") {
        const targetCfg = getPartnerConfig(normalized);
        router.replace(targetCfg.defaultRoute);
      }
    }
  }, [isAuthenticated, isLoading, partnerType, pathname, router]);

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          backgroundColor: "var(--kallisto-bg, #f8fafc)",
          color: "#64748b",
          fontSize: "14px",
          fontWeight: 500,
        }}
      >
        Initializing Kallisto Partner Workspace...
      </div>
    );
  }

  return (
    <AppShell>
      <RoutePageContainer
        title="Partner Workspace"
        variant="default"
        showHeading={false}
        containerClassName="partnerHubProductsBounded"
      >
        <div style={{ width: "100%", height: "100%", minWidth: 0, display: "flex", flexDirection: "column" }}>
          {children}
        </div>
      </RoutePageContainer>
    </AppShell>
  );
}

export function PartnerAppShell({ children }: PartnerAppShellProps) {
  return (
    <PartnerAuthProvider>
      <PartnerAppShellContent>{children}</PartnerAppShellContent>
    </PartnerAuthProvider>
  );
}
