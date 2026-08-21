"use client";

import React from "react";
import {
  BuildDuotoneIcon,
  ExploreDuotoneIcon,
  ResolveDuotoneIcon,
  ReviewDuotoneIcon,
} from "@/components/layout/sidebar-icons";
import { StudioIntent } from "../types/studio-source";

export interface StudioIntentGridProps {
  selectedIntent: StudioIntent;
  onSelectIntent: (intent: StudioIntent) => void;
}

const INTENT_ICONS: Record<StudioIntent, React.ElementType> = {
  create: ExploreDuotoneIcon,
  analyse: BuildDuotoneIcon,
  review: ReviewDuotoneIcon,
  resolve: ResolveDuotoneIcon,
};

const INTENT_ACCENTS: Record<StudioIntent, { color: string }> = {
  create: { color: "#2563eb" },
  analyse: { color: "#7c3aed" },
  review: { color: "#16a34a" },
  resolve: { color: "#ea580c" },
};

const CONCISE_TITLES: Record<StudioIntent, string> = {
  create: "Explore project",
  analyse: "Create an output",
  review: "Review or improve",
  resolve: "Resolve project issue",
};

const INTENT_DESCRIPTIONS: Record<StudioIntent, string> = {
  create: "Understand drawings, files, scope and project context.",
  analyse: "Generate BOQs, estimates, proposals and reports.",
  review: "Check drawings and refine existing outputs.",
  resolve: "Get help with planning, coordination and site problems.",
};

export function StudioIntentGrid({
  selectedIntent,
  onSelectIntent,
}: StudioIntentGridProps) {
  const intents: StudioIntent[] = ["create", "analyse", "review", "resolve"];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "12px",
        width: "100%",
        marginBottom: "24px",
      }}
    >
      {intents.map((intentKey) => {
        const IconComp = INTENT_ICONS[intentKey];
        const isSelected = selectedIntent === intentKey;
        const accents = INTENT_ACCENTS[intentKey];
        const displayTitle = CONCISE_TITLES[intentKey];
        const displayDescription = INTENT_DESCRIPTIONS[intentKey];

        return (
          <div
            key={intentKey}
            onClick={() => onSelectIntent(intentKey)}
            tabIndex={0}
            role="button"
            aria-selected={isSelected}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelectIntent(intentKey);
              }
            }}
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: "16px",
              height: "120px",
              border: "1px solid #e5e7eb",
              borderRadius: "16px",
              background: "#ffffff",
              boxShadow: "0 1px 2px rgba(15, 23, 42, 0.02)",
              cursor: "pointer",
              transition: "all 0.15s ease",
              outline: "none",
            }}
          >
            <div style={{ color: accents.color }}>
              <IconComp size={16} />
            </div>

            <h3
              style={{
                margin: 0,
                fontSize: "12.5px",
                fontWeight: 600,
                color: "#1e293b",
                lineHeight: 1.35,
              }}
            >
              {displayTitle}
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: "11px",
                color: "#64748b",
                lineHeight: 1.4,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {displayDescription}
            </p>
          </div>
        );
      })}
    </div>
  );
}
