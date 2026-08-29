"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Settings, HelpCircle, ArrowRight, Check, Sparkles, Building2 } from "lucide-react";
import { usePartnerAuth } from "../auth/context/partner-auth-context";
import { getPartnerConfig, ALL_PARTNER_TYPES, PARTNER_CONFIGS } from "../shared/config/partner-config";

interface PartnerAccountPopoverProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PartnerAccountPopover({ isOpen, onClose }: PartnerAccountPopoverProps) {
  const { partnerType, user, signOut, switchPartnerType } = usePartnerAuth();
  const activeConfig = getPartnerConfig(partnerType);
  const router = useRouter();
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={popoverRef}
      style={{
        position: "absolute",
        top: "50px",
        right: "0",
        width: "300px",
        backgroundColor: "#ffffff",
        borderRadius: "16px",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
        border: "1px solid rgba(226, 232, 240, 0.9)",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        zIndex: 100,
      }}
    >
      {/* User Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            backgroundColor: activeConfig.accentColor,
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: "14px",
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
        <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
          <span style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {user?.name || "Partner Admin"}
          </span>
          <span style={{ fontSize: "12px", color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {user?.email || "partner@kallisto.com"}
          </span>
        </div>
      </div>

      <div style={{ height: "1px", backgroundColor: "#f1f5f9" }} />

      {/* Partner Switcher Section */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Switch Partner Workspace
          </span>
          <span style={{ fontSize: "10px", color: "#94a3b8" }}>Demo Switch</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {ALL_PARTNER_TYPES.map((type) => {
            const isCurrent = partnerType === type;
            const cfg = PARTNER_CONFIGS[type];
            return (
              <button
                key={`popover-switch-${type}`}
                type="button"
                onClick={async () => {
                  onClose();
                  await switchPartnerType(type);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 10px",
                  borderRadius: "8px",
                  border: isCurrent ? `1px solid ${cfg.borderColor}` : "1px solid transparent",
                  backgroundColor: isCurrent ? cfg.lightBgColor : "transparent",
                  color: isCurrent ? cfg.accentColor : "#334155",
                  fontWeight: isCurrent ? 600 : 500,
                  fontSize: "12px",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.15s ease",
                }}
              >
                <span>{cfg.displayName}</span>
                {isCurrent && <Check size={14} color={cfg.accentColor} />}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ height: "1px", backgroundColor: "#f1f5f9" }} />

      {/* Links & Signout */}
      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        <button
          type="button"
          onClick={() => {
            onClose();
            router.push("/partner/settings");
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "8px 10px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "transparent",
            color: "#334155",
            fontSize: "13px",
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <Settings size={15} color="#64748b" />
          <span>Partner Settings</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onClose();
            router.push("/partner/help");
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "8px 10px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "transparent",
            color: "#334155",
            fontSize: "13px",
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <HelpCircle size={15} color="#64748b" />
          <span>Help & Documentation</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onClose();
            signOut();
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "8px 10px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "transparent",
            color: "#ef4444",
            fontSize: "13px",
            fontWeight: 500,
            cursor: "pointer",
            textAlign: "left",
            marginTop: "4px",
          }}
        >
          <LogOut size={15} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
