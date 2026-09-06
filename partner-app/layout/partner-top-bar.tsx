"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, ChevronLeft, ChevronRight, Bell, Sparkles, Search, Maximize2, Minimize2 } from "lucide-react";
import { PartnerBreadcrumbs } from "./partner-breadcrumbs";
import { PartnerTypeBadge } from "../auth/components/partner-type-badge";
import { PartnerAccountPopover } from "./partner-account-popover";
import { usePartnerAuth } from "../auth/context/partner-auth-context";
import { getPartnerConfig } from "../shared/config/partner-config";
import styles from "./partner-layout.module.css";

interface PartnerTopBarProps {
  onToggleNavigation: () => void;
  onToggleOdin: () => void;
  isOdinOpen: boolean;
}

export function PartnerTopBar({ onToggleNavigation, onToggleOdin, isOdinOpen }: PartnerTopBarProps) {
  const router = useRouter();
  const { partnerType, user } = usePartnerAuth();
  const config = getPartnerConfig(partnerType);

  const [accountOpen, setAccountOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleToggleFullscreen = async () => {
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } catch {
        setIsFullscreen(false);
      }
    } else {
      try {
        if (typeof document.documentElement.requestFullscreen === "function") {
          await document.documentElement.requestFullscreen();
          setIsFullscreen(true);
        }
      } catch {
        // Safe fallback
      }
    }
  };

  return (
    <header className={styles.partnerTopBar}>
      {/* Left side: Mobile menu, History buttons, Breadcrumbs */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
        <button
          type="button"
          onClick={onToggleNavigation}
          aria-label="Open mobile navigation"
          style={{
            display: "none", // Visible on mobile via CSS
            background: "none",
            border: "none",
            padding: "4px",
            cursor: "pointer",
            color: "#475569",
          }}
          className="partner-mobile-menu-btn"
        >
          <Menu size={18} />
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Go back"
            style={{
              background: "none",
              border: "none",
              padding: "4px",
              cursor: "pointer",
              color: "#64748b",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <ChevronLeft size={17} />
          </button>
          <button
            type="button"
            onClick={() => router.forward()}
            aria-label="Go forward"
            style={{
              background: "none",
              border: "none",
              padding: "4px",
              cursor: "pointer",
              color: "#64748b",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <ChevronRight size={17} />
          </button>
        </div>

        <PartnerBreadcrumbs />
      </div>

      {/* Right Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", position: "relative" }}>
        {/* Partner Identity Badge */}
        <div style={{ display: "none" }} className="partner-desktop-badge">
          <PartnerTypeBadge partnerType={partnerType} size="sm" />
        </div>

        {/* Ask Odin Pill */}
        <button
          type="button"
          onClick={onToggleOdin}
          aria-label="Ask Odin AI"
          aria-expanded={isOdinOpen}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            height: "32px",
            padding: "0 12px",
            borderRadius: "9999px",
            border: isOdinOpen ? `1px solid ${config.borderColor}` : "1px solid #e2e8f0",
            backgroundColor: isOdinOpen ? config.lightBgColor : "#ffffff",
            color: isOdinOpen ? config.accentColor : "#0f172a",
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.15s ease",
            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
          }}
        >
          <Sparkles size={14} color={config.accentColor} />
          <span>Ask Odin</span>
        </button>

        {/* Notifications Button */}
        <button
          type="button"
          onClick={() => setNotificationsOpen((prev) => !prev)}
          aria-label="Partner Notifications"
          title="Notifications"
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
            backgroundColor: "#ffffff",
            color: "#475569",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            position: "relative",
          }}
        >
          <Bell size={15} />
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
        </button>

        {/* Fullscreen Toggle */}
        <button
          type="button"
          onClick={handleToggleFullscreen}
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
            backgroundColor: "#ffffff",
            color: "#475569",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </button>

        {/* Account Avatar Button */}
        <button
          type="button"
          onClick={() => setAccountOpen((prev) => !prev)}
          aria-label="Partner account menu"
          aria-expanded={accountOpen}
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            backgroundColor: config.accentColor,
            color: "#ffffff",
            border: "2px solid #ffffff",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            fontSize: "12px",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {user?.name
            ? user.name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
            : "KP"}
        </button>

        {/* Account Popover */}
        <PartnerAccountPopover
          isOpen={accountOpen}
          onClose={() => setAccountOpen(false)}
        />
      </div>
    </header>
  );
}
