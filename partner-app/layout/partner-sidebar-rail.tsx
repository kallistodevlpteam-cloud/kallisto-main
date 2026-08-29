"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, Sparkles } from "lucide-react";
import { KallistoLogoMark } from "@/components/layout/kallisto-brand";
import { usePartnerAuth } from "../auth/context/partner-auth-context";
import { LockDuotoneIcon } from "@/components/layout/sidebar-icons";
import { getPartnerNavigation, isPartnerItemActive } from "../shared/config/partner-navigation";
import styles from "./partner-layout.module.css";

interface PartnerSidebarRailProps {
  onToggleSidebar: () => void;
  onOpenOdin: () => void;
}

export function PartnerSidebarRail({ onToggleSidebar, onOpenOdin }: PartnerSidebarRailProps) {
  const pathname = usePathname();
  const { partnerType } = usePartnerAuth();
  const navItems = getPartnerNavigation(partnerType);

  const mainItems = navItems.filter((i) => i.section === "main");
  const utilityItems = navItems.filter((i) => i.section === "utility");

  return (
    <aside className={styles.partnerSidebarRail} aria-label="Partner navigation rail">
      {/* Top Brand Mark & Expand toggle */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", width: "100%" }}>
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Expand sidebar"
          title="Expand sidebar"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <KallistoLogoMark size={28} />
        </button>

        <div style={{ width: "32px", height: "1px", backgroundColor: "#e2e8f0" }} />

        {/* Main Nav Items */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%", alignItems: "center" }}>
          {mainItems.map((item) => {
            const Icon = item.icon;
            const active = isPartnerItemActive(pathname, item.href);
            return (
              <Link
                key={item.id}
                href={item.href}
                title={item.isLocked ? `${item.label} (Locked for Beta Trials)` : item.label}
                aria-label={item.label}
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: active ? "#0f172a" : "#64748b",
                  backgroundColor: active ? "#f1f5f9" : "transparent",
                  textDecoration: "none",
                  position: "relative",
                  transition: "all 0.15s ease",
                  opacity: item.isLocked ? 0.65 : 1,
                }}
              >
                <Icon size={18} />
                {item.isLocked ? (
                  <span
                    style={{
                      position: "absolute",
                      bottom: "4px",
                      right: "4px",
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      backgroundColor: "#ffffff",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.12)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <LockDuotoneIcon size={8} style={{ color: "#64748b" }} />
                  </span>
                ) : item.badgeCount && item.badgeCount > 0 ? (
                  <span
                    style={{
                      position: "absolute",
                      top: "6px",
                      right: "6px",
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      backgroundColor: "#ef4444",
                    }}
                  />
                ) : null}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom Odin & Utility Items */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%", alignItems: "center" }}>
        {/* Odin button */}
        <button
          type="button"
          onClick={onOpenOdin}
          aria-label="Ask Odin"
          title="Ask Odin AI"
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#0284c7",
            backgroundColor: "#f0f9ff",
            border: "1px solid #bae6fd",
            cursor: "pointer",
          }}
        >
          <Sparkles size={16} />
        </button>

        {utilityItems.map((item) => {
          const Icon = item.icon;
          const active = isPartnerItemActive(pathname, item.href);
          return (
            <Link
              key={item.id}
              href={item.href}
              title={item.label}
              aria-label={item.label}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: active ? "#0f172a" : "#64748b",
                backgroundColor: active ? "#f1f5f9" : "transparent",
                textDecoration: "none",
                transition: "all 0.15s ease",
              }}
            >
              <Icon size={18} />
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
