"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, Sparkles } from "lucide-react";
import { KallistoBrand } from "@/components/layout/kallisto-brand";
import { usePartnerAuth } from "../auth/context/partner-auth-context";
import { LockDuotoneIcon } from "@/components/layout/sidebar-icons";
import { getPartnerNavigation, isPartnerItemActive } from "../shared/config/partner-navigation";
import { getPartnerConfig } from "../shared/config/partner-config";
import { PartnerTypeBadge } from "../auth/components/partner-type-badge";
import styles from "./partner-layout.module.css";

interface PartnerSidebarExpandedProps {
  onToggleSidebar?: () => void;
  onOpenOdin: () => void;
}

export function PartnerSidebarExpanded({ onToggleSidebar, onOpenOdin }: PartnerSidebarExpandedProps) {
  const pathname = usePathname();
  const { partnerType, user } = usePartnerAuth();
  const config = getPartnerConfig(partnerType);
  const navItems = getPartnerNavigation(partnerType);

  const mainItems = navItems.filter((i) => i.section === "main");
  const utilityItems = navItems.filter((i) => i.section === "utility");

  return (
    <aside className={styles.partnerSidebarExpanded} aria-label="Partner expanded navigation">
      {/* Top Header with Brand & Collapse toggle */}
      <div style={{ display: "flex", flexDirection: "column", borderBottom: "1px solid rgba(226, 232, 240, 0.8)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 16px 12px 16px" }}>
          <Link href={config.defaultRoute} style={{ textDecoration: "none" }}>
            <KallistoBrand />
          </Link>
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "6px",
                borderRadius: "6px",
                color: "#64748b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s ease",
              }}
            >
              <PanelLeftClose size={16} />
            </button>
          )}
        </div>

        {/* Active Partner Type Identity Pill */}
        <div style={{ padding: "0 16px 14px 16px" }}>
          <PartnerTypeBadge partnerType={partnerType} size="sm" />
        </div>
      </div>

      {/* Main Navigation Scroll Area */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 0", display: "flex", flexDirection: "column", gap: "2px" }}>
        <div style={{ padding: "0 16px 6px 16px", fontSize: "11px", fontWeight: 700, letterSpacing: "0.05em", color: "#94a3b8", textTransform: "uppercase" }}>
          Operations
        </div>

        {mainItems.map((item) => {
          const Icon = item.icon;
          const active = isPartnerItemActive(pathname, item.href);
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`${styles.partnerNavItem} ${active ? styles.partnerNavItemActive : ""}`}
              style={item.isLocked ? { opacity: 0.72 } : undefined}
            >
              <Icon size={17} />
              <span>{item.label}</span>
              {item.isLocked ? (
                <span
                  style={{
                    marginLeft: "auto",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "3px",
                    fontSize: "10px",
                    fontWeight: 600,
                    color: "#94a3b8",
                  }}
                >
                  <LockDuotoneIcon size={12} style={{ color: "#94a3b8" }} />
                </span>
              ) : item.badgeCount && item.badgeCount > 0 ? (
                <span className={styles.partnerNavBadge}>{item.badgeCount}</span>
              ) : null}
            </Link>
          );
        })}

        {/* Divider before Odin */}
        <div style={{ margin: "12px 16px 10px 16px", height: "1px", backgroundColor: "#f1f5f9" }} />

        {/* Odin Action Button */}
        <div style={{ padding: "0 8px" }}>
          <button
            type="button"
            onClick={onOpenOdin}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "9px 12px",
              borderRadius: "10px",
              border: `1px solid ${config.borderColor}`,
              backgroundColor: config.lightBgColor,
              color: config.accentColor,
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <Sparkles size={16} />
            <span>Ask Odin</span>
            <span style={{ marginLeft: "auto", fontSize: "10px", opacity: 0.8, textTransform: "uppercase" }}>
              AI
            </span>
          </button>
        </div>
      </div>

      {/* Bottom Utility & Profile Strip */}
      <div style={{ borderTop: "1px solid rgba(226, 232, 240, 0.8)", padding: "12px 8px" }}>
        {utilityItems.map((item) => {
          const Icon = item.icon;
          const active = isPartnerItemActive(pathname, item.href);
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`${styles.partnerNavItem} ${active ? styles.partnerNavItemActive : ""}`}
            >
              <Icon size={17} />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* User Card info */}
        <div
          style={{
            margin: "8px 4px 0 4px",
            padding: "8px 10px",
            borderRadius: "8px",
            backgroundColor: "#f8fafc",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              backgroundColor: config.accentColor,
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: "12px",
            }}
          >
            {user?.name
              ? user.name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
              : "KP"}
          </div>
          <div style={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1 }}>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user?.name || "Partner Admin"}
            </span>
            <span style={{ fontSize: "11px", color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {config.shortName} Fleet Lead
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
