"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, PlusCircle, ArrowRight } from "lucide-react";
import { LockDuotoneIcon, StudioDuotoneIcon } from "@/components/layout/sidebar-icons";
import { PartnerTypeBadge } from "../../auth/components/partner-type-badge";

interface HubModulePlaceholderProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  isLocked?: boolean;
  lockedReason?: string;
  metrics?: { label: string; value: string }[];
}

export function HubModulePlaceholder({
  title,
  description,
  actionLabel = "New Entry",
  actionHref,
  isLocked = false,
  lockedReason,
  metrics,
}: HubModulePlaceholderProps) {
  if (isLocked) {
    return (
      <div
        style={{
          minHeight: "65vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 16px",
        }}
      >
        <div
          style={{
            maxWidth: "520px",
            width: "100%",
            backgroundColor: "#ffffff",
            borderRadius: "20px",
            border: "1px solid #e2e8f0",
            padding: "48px 32px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: "16px",
            boxShadow: "0 4px 20px -2px rgba(15, 23, 42, 0.05)",
          }}
        >
          {/* Top Identity Pill: Partner Badge + Locked for Beta Trials */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
            <PartnerTypeBadge partnerType="HUB" size="sm" />
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                padding: "2px 9px",
                borderRadius: "9999px",
                backgroundColor: "#fffbeb",
                border: "1px solid #fef3c7",
                color: "#b45309",
                fontSize: "11px",
                fontWeight: 650,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              <LockDuotoneIcon size={11} style={{ color: "#b45309" }} />
              <span>Locked for Beta Trials</span>
            </span>
          </div>

          {/* Duotone Lock Icon Container */}
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "18px",
              backgroundColor: "#f8fafc",
              border: "1px solid #e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: "4px",
            }}
          >
            <LockDuotoneIcon size={26} style={{ color: "#475569" }} />
          </div>

          <div>
            <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#0f172a", letterSpacing: "-0.01em" }}>
              {title} is Locked for Beta Trials
            </h2>
            <p style={{ margin: "10px 0 0", fontSize: "13px", color: "#64748b", lineHeight: 1.6 }}>
              {lockedReason ||
                "During the Beta trials phase, this module is locked to maintain a focused operational loop: Manage Products → Track Inventory → Receive Orders → Fulfil Orders → Track Payments."}
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "12px", flexWrap: "wrap", justifyContent: "center" }}>
            <Link
              href="/partner/hub/products"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "9px 20px",
                borderRadius: "9999px",
                backgroundColor: "#0f172a",
                color: "#ffffff",
                fontSize: "13px",
                fontWeight: 600,
                textDecoration: "none",
                boxShadow: "0 1px 3px rgba(15, 23, 42, 0.1)",
              }}
            >
              <span>Go to Products Workspace</span>
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/partner/hub"
              style={{
                padding: "9px 18px",
                borderRadius: "9999px",
                border: "1px solid #e2e8f0",
                backgroundColor: "#ffffff",
                color: "#334155",
                fontSize: "13px",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Back to Overview
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <PartnerTypeBadge partnerType="HUB" size="sm" />
          </div>
          <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 700, color: "#0f172a", letterSpacing: "-0.02em" }}>
            {title}
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b" }}>
            {description}
          </p>
        </div>

        {actionHref && (
          <Link
            href={actionHref}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 16px",
              borderRadius: "9999px",
              backgroundColor: "#0f172a",
              color: "#ffffff",
              fontSize: "13px",
              fontWeight: 600,
              textDecoration: "none",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <PlusCircle size={15} />
            <span>{actionLabel}</span>
          </Link>
        )}
      </div>

      {/* Optional Top Metrics Row */}
      {metrics && metrics.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${metrics.length}, minmax(180px, 1fr))`, gap: "14px" }}>
          {metrics.map((m) => (
            <div
              key={m.label}
              style={{
                backgroundColor: "#ffffff",
                padding: "14px 18px",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                display: "flex",
                flexDirection: "column",
                gap: "2px",
              }}
            >
              <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 500 }}>{m.label}</span>
              <span style={{ fontSize: "20px", fontWeight: 700, color: "#7c3aed" }}>{m.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Main Module Content Canvas */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          border: "1px solid rgba(226, 232, 240, 0.9)",
          padding: "56px 32px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: "16px",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
        }}
      >
        <div
          style={{
            width: "52px",
            height: "52px",
            borderRadius: "16px",
            backgroundColor: "#f5f3ff",
            border: "1px solid #ddd6fe",
            color: "#7c3aed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <StudioDuotoneIcon size={24} />
        </div>

        <div style={{ maxWidth: "500px" }}>
          <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "#0f172a" }}>
            {title} Logistics Hub Ready
          </h3>
          <p style={{ margin: "10px 0 0", fontSize: "13px", color: "#64748b", lineHeight: 1.6 }}>
            This Kallisto Hub material logistics submodule is linked to central depot inventories, dispatch tracking, and supplier catalogs.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
          <Link
            href="/partner/hub/products"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "9px 18px",
              borderRadius: "9999px",
              backgroundColor: "#0f172a",
              color: "#ffffff",
              fontSize: "13px",
              fontWeight: 600,
              textDecoration: "none",
              boxShadow: "0 1px 3px rgba(15, 23, 42, 0.1)",
            }}
          >
            <span>Go to Products Workspace</span>
            <ArrowRight size={14} />
          </Link>
          <Link
            href="/partner/hub"
            style={{
              padding: "9px 16px",
              borderRadius: "9999px",
              border: "1px solid #e2e8f0",
              backgroundColor: "#ffffff",
              color: "#334155",
              fontSize: "13px",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Back to Hub Overview
          </Link>
        </div>
      </div>
    </div>
  );
}
