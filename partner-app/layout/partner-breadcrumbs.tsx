"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";
import { usePartnerAuth } from "../auth/context/partner-auth-context";
import { getPartnerConfig } from "../shared/config/partner-config";

export function PartnerBreadcrumbs() {
  const pathname = usePathname();
  const { partnerType } = usePartnerAuth();
  const config = getPartnerConfig(partnerType);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  useEffect(() => {
    const syncQuery = () => {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        setActiveOrderId(params.get("orderId"));
      }
    };

    syncQuery();
    window.addEventListener("popstate", syncQuery);
    return () => window.removeEventListener("popstate", syncQuery);
  }, []);

  const parts = pathname.split("/").filter(Boolean); // e.g. ["partner", "hub", "orders"]

  const crumbs: { label: string; href?: string }[] = [
    { label: "Partner Workspace" },
    { label: config.displayName, href: config.defaultRoute },
  ];

  if (parts.length > 2) {
    const sub = parts[2];
    const formatted = sub
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    const sectionHref = `/${parts.slice(0, 3).join("/")}`;

    if (sub === "orders" && activeOrderId) {
      crumbs.push({ label: "Orders", href: sectionHref });
      crumbs.push({ label: activeOrderId });
    } else {
      crumbs.push({ label: formatted });
    }
  } else if (parts.length === 2 && (parts[1] === "settings" || parts[1] === "help")) {
    crumbs.push({ label: parts[1].charAt(0).toUpperCase() + parts[1].slice(1) });
  }

  return (
    <nav aria-label="Partner breadcrumb" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}>
      {crumbs.map((crumb, idx) => {
        const isLast = idx === crumbs.length - 1;
        return (
          <React.Fragment key={`${crumb.label}-${idx}`}>
            {idx > 0 && <ChevronRight size={13} color="#94a3b8" />}
            {crumb.href && !isLast ? (
              <Link
                href={crumb.href}
                onClick={(e) => {
                  if (typeof window !== "undefined" && window.location.pathname === crumb.href) {
                    e.preventDefault();
                    window.history.pushState({}, "", crumb.href);
                    window.dispatchEvent(new Event("popstate"));
                  }
                }}
                style={{
                  color: "#64748b",
                  textDecoration: "none",
                  fontWeight: 500,
                  transition: "color 0.15s ease",
                }}
              >
                {crumb.label}
              </Link>
            ) : (
              <span
                style={{
                  color: isLast ? "#0f172a" : "#64748b",
                  fontWeight: isLast ? 600 : 500,
                }}
              >
                {crumb.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
