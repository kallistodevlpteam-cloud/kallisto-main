"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Eye, FileText } from "lucide-react";
import { OutputCardSkeleton } from "./output-card-skeleton";

export interface OutputGlanceCardProps {
  title?: string;
  version?: string;
  statusBadge?: string;
  projectName?: string;
  clientName?: string;
  budget?: string;
  highlights?: string[];
  isAnimated?: boolean;
  onPreviewClick: () => void;
  onRequestChanges?: () => void;
  onAssemblyComplete?: () => void;
}

const DEFAULT_HIGHLIGHTS = [
  "Spatial layout optimization & 2D floorplans (Living Area, Master Suite, Terrace)",
  "Full 3D interior visualisations & material palette moodboards",
  "Itemised Bill of Quantities (BOQ) with rate analysis & specifications",
  "6-month phase schedule & 4-tier commercial payment milestones",
];

type AssemblyStep =
  | "skeleton"
  | "header"
  | "status"
  | "meta"
  | "highlights-start"
  | "highlights-1"
  | "highlights-2"
  | "highlights-3"
  | "highlights-4"
  | "complete";

export function OutputGlanceCard({
  title = "Villa Design Proposal",
  version = "V01",
  statusBadge = "Ready for Review",
  projectName = "Villa Design Consultation",
  clientName = "Ananya Builders",
  budget = "₹18L – ₹25L",
  highlights = DEFAULT_HIGHLIGHTS,
  isAnimated = false,
  onPreviewClick,
  onRequestChanges,
  onAssemblyComplete,
}: OutputGlanceCardProps) {
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const shouldAnimate = isAnimated && !prefersReducedMotion;
  const [step, setStep] = useState<AssemblyStep>(shouldAnimate ? "skeleton" : "complete");
  const onAssemblyCompleteRef = useRef(onAssemblyComplete);
  onAssemblyCompleteRef.current = onAssemblyComplete;

  useEffect(() => {
    if (!shouldAnimate) {
      setStep("complete");
      onAssemblyCompleteRef.current?.();
      return;
    }

    setStep("skeleton");

    const timers: NodeJS.Timeout[] = [];

    // Progressive assembly schedule (80-120ms steps)
    timers.push(setTimeout(() => setStep("header"), 120));
    timers.push(setTimeout(() => setStep("status"), 240));
    timers.push(setTimeout(() => setStep("meta"), 380));
    timers.push(setTimeout(() => setStep("highlights-start"), 500));
    timers.push(setTimeout(() => setStep("highlights-1"), 600));
    timers.push(setTimeout(() => setStep("highlights-2"), 700));
    timers.push(setTimeout(() => setStep("highlights-3"), 800));
    timers.push(setTimeout(() => setStep("highlights-4"), 900));
    timers.push(
      setTimeout(() => {
        setStep("complete");
        onAssemblyCompleteRef.current?.();
      }, 1040)
    );

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [shouldAnimate]);

  if (step === "skeleton") {
    return <OutputCardSkeleton />;
  }

  const isHeaderVisible = true;
  const isStatusVisible = step !== "header";
  const isMetaVisible = isStatusVisible && step !== "status";
  const isHighlightsHeaderVisible = isMetaVisible && step !== "meta";

  const getBulletVisible = (index: number) => {
    if (step === "complete") return true;
    if (index === 0) return step === "highlights-1" || step === "highlights-2" || step === "highlights-3" || step === "highlights-4";
    if (index === 1) return step === "highlights-2" || step === "highlights-3" || step === "highlights-4";
    if (index === 2) return step === "highlights-3" || step === "highlights-4";
    if (index === 3) return step === "highlights-4";
    return false;
  };

  const isButtonVisible = step === "complete";

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
        animation: shouldAnimate ? "progressiveCardIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards" : undefined,
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
          opacity: isHeaderVisible ? 1 : 0,
          transform: isHeaderVisible ? "translateY(0)" : "translateY(4px)",
          transition: "opacity 0.18s ease-out, transform 0.18s ease-out",
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
            opacity: isStatusVisible ? 1 : 0,
            transform: isStatusVisible ? "scale(1)" : "scale(0.92)",
            transition: "opacity 0.18s ease-out, transform 0.18s ease-out",
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
          borderBottom: "1px solid #f7f7f5",
          flexWrap: "wrap",
          opacity: isMetaVisible ? 1 : 0,
          transform: isMetaVisible ? "translateY(0)" : "translateY(4px)",
          transition: "opacity 0.18s ease-out, transform 0.18s ease-out",
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

      {/* ── PreviewHighlights (3-5 key highlights) ── */}
      <div
        style={{
          padding: "10px 0 12px",
          opacity: isHighlightsHeaderVisible ? 1 : 0,
          transition: "opacity 0.18s ease-out",
        }}
      >
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
          {highlights.map((item, idx) => {
            const isVisible = getBulletVisible(idx);
            return (
              <li
                key={idx}
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? "translateX(0)" : "translateX(-4px)",
                  transition: "opacity 0.15s ease-out, transform 0.15s ease-out",
                }}
              >
                {item}
              </li>
            );
          })}
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
          opacity: isButtonVisible ? 1 : 0,
          transform: isButtonVisible ? "translateY(0)" : "translateY(4px)",
          transition: "opacity 0.18s ease-out, transform 0.18s ease-out",
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
