"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, PlusCircle } from "lucide-react";
import { PartnerTypeBadge } from "../../auth/components/partner-type-badge";

interface HandsModulePlaceholderProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  badge?: string;
  metrics?: { label: string; value: string }[];
}

export function HandsModulePlaceholder({
  title,
  description,
  actionLabel = "New Entry",
  actionHref,
  metrics,
}: HandsModulePlaceholderProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <PartnerTypeBadge partnerType="HANDS" size="sm" />
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
              borderRadius: "8px",
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
              <span style={{ fontSize: "20px", fontWeight: 700, color: "#0284c7" }}>{m.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Main Module Content Canvas / Architecture Slate */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          border: "1px solid rgba(226, 232, 240, 0.9)",
          padding: "48px 32px",
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
            width: "48px",
            height: "48px",
            borderRadius: "12px",
            backgroundColor: "#f0f9ff",
            border: "1px solid #bae6fd",
            color: "#0284c7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Sparkles size={22} />
        </div>

        <div style={{ maxWidth: "460px" }}>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>
            {title} Workspace Ready
          </h3>
          <p style={{ margin: "8px 0 0", fontSize: "13px", color: "#64748b", lineHeight: 1.5 }}>
            This Kallisto Hands operational submodule is wired to your active partner session. Comprehensive workflow tables, live assignments, and Odin actions will load here.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
          <Link
            href="/partner/hands"
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              backgroundColor: "#f8fafc",
              color: "#334155",
              fontSize: "13px",
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            Back to Hands Overview
          </Link>
        </div>
      </div>
    </div>
  );
}
