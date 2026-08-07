"use client";

import React from "react";
import { Eye, FileText } from "lucide-react";

export interface OutputGlanceCardProps {
  title?: string;
  version?: string;
  statusBadge?: string;
  projectName?: string;
  clientName?: string;
  budget?: string;
  highlights?: string[];
  onPreviewClick: () => void;
  onRequestChanges?: () => void;
}

const DEFAULT_HIGHLIGHTS = [
  "Spatial layout optimization & 2D floorplans (Living Area, Master Suite, Terrace)",
  "Full 3D interior visualisations & material palette moodboards",
  "Itemised Bill of Quantities (BOQ) with rate analysis & specifications",
  "6-month phase schedule & 4-tier commercial payment milestones",
];

export function OutputGlanceCard({
  title = "Villa Design Proposal",
  version = "V01",
  statusBadge = "Ready for Review",
  projectName = "Villa Design Consultation",
  clientName = "Ananya Builders",
  budget = "₹18L – ₹25L",
  highlights = DEFAULT_HIGHLIGHTS,
  onPreviewClick,
  onRequestChanges,
}: OutputGlanceCardProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        maxWidth: "100%",
        background: "#ffffff",
        border: "none",
        borderRadius: "12px",
        padding: "14px 16px",
        marginTop: "4px",
        marginBottom: "8px",
        boxShadow: "0 1px 3px rgba(15, 23, 42, 0.03)",
        boxSizing: "border-box",
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: "10px",
          borderBottom: "1px solid #f1f5f9",
          gap: "8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              display: "grid",
              placeItems: "center",
              width: "28px",
              height: "28px",
              borderRadius: "7px",
              background: "#f0fdf4",
              color: "#16a34a",
              border: "none",
              flexShrink: 0,
            }}
          >
            <FileText size={15} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 650, color: "#0f172a" }}>
              {title}
            </h3>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                padding: "2px 7px",
                borderRadius: "9999px",
                background: "#f1f5f9",
                color: "#475569",
                border: "none",
              }}
            >
              {version}
            </span>
          </div>
        </div>

        <span
          style={{
            fontSize: "11px",
            fontWeight: 600,
            padding: "2px 8px",
            borderRadius: "9999px",
            background: "#dcfce7",
            color: "#15803d",
            border: "none",
            flexShrink: 0,
          }}
        >
          {statusBadge}
        </span>
      </div>

      {/* ── MetadataRow ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          padding: "10px 0",
          fontSize: "12px",
          color: "#64748b",
          borderBottom: "1px solid #f8fafc",
          flexWrap: "wrap",
        }}
      >
        <div>
          <span style={{ color: "#94a3b8", fontWeight: 500 }}>Project: </span>
          <span style={{ color: "#1e293b", fontWeight: 600 }}>{projectName}</span>
        </div>
        <div style={{ color: "#cbd5e1" }}>•</div>
        <div>
          <span style={{ color: "#94a3b8", fontWeight: 500 }}>Client: </span>
          <span style={{ color: "#1e293b", fontWeight: 600 }}>{clientName}</span>
        </div>
        <div style={{ color: "#cbd5e1" }}>•</div>
        <div>
          <span style={{ color: "#94a3b8", fontWeight: 500 }}>Budget: </span>
          <span style={{ color: "#1e293b", fontWeight: 600 }}>{budget}</span>
        </div>
      </div>

      {/* ── PreviewHighlights (3-5 key highlights, NO full body text) ── */}
      <div style={{ padding: "10px 0 12px" }}>
        <div
          style={{
            fontSize: "10.5px",
            fontWeight: 700,
            color: "#94a3b8",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            marginBottom: "6px",
          }}
        >
          Key Highlights
        </div>
        <ul
          style={{
            margin: 0,
            paddingLeft: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            fontSize: "12.5px",
            lineHeight: "1.45",
            color: "#475569",
          }}
        >
          {highlights.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </div>

      {/* ── PreviewCTA Footer ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: "10px",
          borderTop: "1px solid #f1f5f9",
        }}
      >
        <button
          type="button"
          onClick={onPreviewClick}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            height: "32px",
            padding: "0 16px",
            borderRadius: "8px",
            background: "#0f172a",
            color: "#ffffff",
            fontSize: "12.5px",
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
            transition: "background-color 0.15s ease",
          }}
        >
          <Eye size={14} />
          <span>Preview</span>
        </button>

        {onRequestChanges && (
          <button
            type="button"
            onClick={onRequestChanges}
            style={{
              background: "none",
              border: "none",
              color: "#64748b",
              fontSize: "12px",
              fontWeight: 550,
              cursor: "pointer",
              padding: 0,
              textDecoration: "underline",
            }}
          >
            Request changes
          </button>
        )}
      </div>
    </div>
  );
}
