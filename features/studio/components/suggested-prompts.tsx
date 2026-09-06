"use client";

import React from "react";
import { OdinDuotoneIcon } from "@/components/layout/sidebar-icons";
import { StudioIntent } from "../types/studio-source";
import { STUDIO_INTENTS } from "../lib/studio-intents";

export interface SuggestedPromptsProps {
  intent: StudioIntent;
  onSelectPrompt: (promptText: string) => void;
}

export function SuggestedPrompts({
  intent,
  onSelectPrompt,
}: SuggestedPromptsProps) {
  const config = STUDIO_INTENTS[intent];
  if (!config || !config.suggestedPrompts) return null;

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1080px",
        margin: "14px auto 0",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          marginBottom: "10px",
          color: "#475569",
          fontSize: "12.5px",
          fontWeight: 600,
        }}
      >
        <OdinDuotoneIcon size={15} style={{ color: "#0f172a" }} />
        <span>Suggested prompts</span>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        {config.suggestedPrompts.map((promptText, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectPrompt(promptText)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              height: "34px",
              padding: "0 14px",
              border: "1px solid rgba(226, 232, 240, 0.85)",
              borderRadius: "9999px",
              background: "rgba(255, 255, 255, 0.78)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              color: "#334155",
              fontSize: "12.5px",
              fontWeight: 550,
              cursor: "pointer",
              transition: "all 0.15s ease",
              boxShadow: "0 2px 6px rgba(15, 23, 42, 0.02), inset 0 1px 0 rgba(255, 255, 255, 0.9)",
            }}
          >
            <span>{promptText}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
