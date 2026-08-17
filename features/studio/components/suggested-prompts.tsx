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
              border: "1px solid #e2e8f0",
              borderRadius: "9999px",
              background: "#ffffff",
              color: "#334155",
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.15s ease",
              boxShadow: "0 1px 2px rgba(15, 23, 42, 0.02)",
            }}
          >
            <span>{promptText}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
