"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  ChevronDown,
  Building2,
  Users,
  Briefcase,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

interface MetricItem {
  label: string;
  value: string;
}

interface HandsModulePlaceholderProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  badge?: string;
  metrics?: MetricItem[];
}

export function HandsModulePlaceholder({
  title,
  description,
  actionLabel = "New Entry",
  actionHref,
  metrics,
}: HandsModulePlaceholderProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const defaultMetrics: MetricItem[] = [
    { label: "Active Deployments", value: "14" },
    { label: "Sites Covered", value: "8" },
    { label: "Deployed Crew", value: "128" },
    { label: "Shift Completion", value: "98.2%" },
  ];

  const displayMetrics = metrics && metrics.length >= 4 ? metrics : defaultMetrics;

  const iconBoxes = [
    { bg: "#eff6ff", color: "#2563eb", icon: Briefcase },
    { bg: "#ecfdf5", color: "#059669", icon: Building2 },
    { bg: "#f5f3ff", color: "#7c3aed", icon: Users },
    { bg: "#fff7ed", color: "#ea580c", icon: CheckCircle2 },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%", height: "100%", minHeight: 0, overflowY: "auto", overflowX: "hidden", paddingBottom: "32px", boxSizing: "border-box" }}>
      {/* 1. Header (Title, Subtitle & Primary CTA) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          flexWrap: "wrap",
          paddingBottom: "2px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h1
              style={{
                margin: 0,
                fontSize: "20px",
                fontWeight: 750,
                color: "#0f172a",
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
              }}
            >
              {title}
            </h1>
            <span style={{ fontSize: "13px", fontWeight: 500, color: "#64748b" }}>
              · Active Allocations & Demands
            </span>
          </div>
          <p style={{ margin: "3px 0 0", fontSize: "13px", color: "#64748b", lineHeight: 1.4 }}>
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
              height: "32px",
              padding: "0 14px",
              borderRadius: "8px",
              backgroundColor: "#0f172a",
              color: "#ffffff",
              fontSize: "12.5px",
              fontWeight: 650,
              textDecoration: "none",
              boxShadow: "0 1px 2px rgba(15, 23, 42, 0.12)",
              transition: "all 0.14s ease",
            }}
          >
            <Plus size={15} />
            <span>{actionLabel}</span>
          </Link>
        )}
      </div>

      {/* 2. Top Telemetry & Filters Bar */}
      <div
        role="search"
        aria-label="Module search and filters"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          width: "100%",
          boxSizing: "border-box",
          flexWrap: "wrap",
        }}
      >
        {/* Telemetry Capsule Strip */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            height: "32px",
            padding: "0 14px",
            backgroundColor: "#f1f5f9",
            borderRadius: "9999px",
            fontSize: "12px",
            color: "#64748b",
            boxSizing: "border-box",
            flex: "1 1 0%",
            minWidth: "280px",
          }}
        >
          <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", minWidth: 0, flexWrap: "nowrap" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
              <strong style={{ color: "#0f172a", fontWeight: 700 }}>{displayMetrics[0]?.value}</strong>
              <span>{displayMetrics[0]?.label}</span>
            </span>
            <span style={{ color: "#cbd5e1" }}>·</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
              <strong style={{ color: "#059669", fontWeight: 700 }}>{displayMetrics[1]?.value}</strong>
              <span>{displayMetrics[1]?.label}</span>
            </span>
            <span style={{ color: "#cbd5e1" }}>·</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
              <strong style={{ color: "#2563eb", fontWeight: 700 }}>{displayMetrics[3]?.value || displayMetrics[2]?.value}</strong>
              <span>{displayMetrics[3]?.label || displayMetrics[2]?.label}</span>
            </span>
          </div>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              fontSize: "11px",
              fontWeight: 600,
              color: "#059669",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "9999px",
                backgroundColor: "#10b981",
                boxShadow: "0 0 0 2px rgba(16, 185, 129, 0.25)",
                flexShrink: 0,
              }}
            />
            <span>Live</span>
          </div>
        </div>

        {/* Right Search & Filter Dropdown Group */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", height: "32px", flexShrink: 0 }}>
          <div style={{ position: "relative", width: "220px", height: "32px" }}>
            <Search
              size={13}
              style={{
                position: "absolute",
                left: "11px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#94a3b8",
                pointerEvents: "none",
              }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${title.toLowerCase()}...`}
              style={{
                width: "100%",
                height: "32px",
                lineHeight: "32px",
                padding: "0 12px 0 30px",
                borderRadius: "9999px",
                border: "none",
                fontSize: "12px",
                color: "#0f172a",
                outline: "none",
                backgroundColor: "#f1f5f9",
                boxSizing: "border-box",
              }}
            />
          </div>

          <button
            type="button"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              height: "32px",
              padding: "0 10px",
              borderRadius: "9999px",
              border: "none",
              backgroundColor: "#f1f5f9",
              color: "#475569",
              fontSize: "11.5px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            <span>Trade</span>
            <ChevronDown size={12} color="#64748b" />
          </button>

          <button
            type="button"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              height: "32px",
              padding: "0 10px",
              borderRadius: "9999px",
              border: "none",
              backgroundColor: "#f1f5f9",
              color: "#475569",
              fontSize: "11.5px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            <span>Status</span>
            <ChevronDown size={12} color="#64748b" />
          </button>

          <button
            type="button"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              height: "32px",
              padding: "0 10px",
              borderRadius: "9999px",
              border: "none",
              backgroundColor: "#f1f5f9",
              color: "#475569",
              fontSize: "11.5px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            <span>Sort</span>
            <ChevronDown size={12} color="#64748b" />
          </button>
        </div>
      </div>

      {/* 3. Operational 4-Card Summary Grid */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: "10px",
          width: "100%",
          boxSizing: "border-box",
        }}
        aria-label="Operational Summary"
      >
        {displayMetrics.slice(0, 4).map((m, idx) => {
          const cfg = iconBoxes[idx % iconBoxes.length];
          const IconComp = cfg.icon;
          return (
            <div
              key={m.label}
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "14px",
                padding: "9px 12px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 1px 2px rgba(15, 23, 42, 0.03)",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                minWidth: 0,
                transition: "all 140ms ease",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                  backgroundColor: cfg.bg,
                  color: cfg.color,
                }}
              >
                <IconComp size={18} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "1px", minWidth: 0 }}>
                <span
                  style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "#0f172a",
                    letterSpacing: "-0.02em",
                    lineHeight: 1.1,
                  }}
                >
                  {m.value}
                </span>
                <span
                  style={{
                    fontSize: "11.5px",
                    color: "#64748b",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    fontWeight: 500,
                  }}
                >
                  {m.label}
                </span>
              </div>
            </div>
          );
        })}
      </section>

      {/* 4. Main Module Workspace Canvas */}
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
