"use client";

import React from "react";
import {
  ExploreDuotoneIcon,
  ResolveDuotoneIcon,
  ReviewDuotoneIcon,
  StudioDuotoneIcon,
} from "@/components/layout/sidebar-icons";
import { StudioIntent } from "../types/studio-source";
import styles from "./studio-chat-canvas.module.css";

export interface StudioIntentGridProps {
  selectedIntent: StudioIntent;
  onSelectIntent: (intent: StudioIntent) => void;
  onSelectPrompt?: (promptText: string) => void;
  projectName?: string;
}

const INTENT_ICONS: Record<StudioIntent, React.ElementType> = {
  create: ExploreDuotoneIcon,
  analyse: StudioDuotoneIcon,
  review: ReviewDuotoneIcon,
  resolve: ResolveDuotoneIcon,
};

const INTENT_ACCENTS: Record<StudioIntent, { color: string; bg: string; activeBorder: string; activeBg: string }> = {
  create: { color: "#2563eb", bg: "#eff6ff", activeBorder: "rgba(37, 99, 235, 0.45)", activeBg: "rgba(239, 246, 255, 0.85)" },
  analyse: { color: "#7c3aed", bg: "#f5f3ff", activeBorder: "rgba(124, 58, 237, 0.45)", activeBg: "rgba(245, 243, 255, 0.85)" },
  review: { color: "#16a34a", bg: "#f0fdf4", activeBorder: "rgba(22, 163, 74, 0.45)", activeBg: "rgba(240, 253, 244, 0.85)" },
  resolve: { color: "#ea580c", bg: "#fff7ed", activeBorder: "rgba(234, 88, 12, 0.45)", activeBg: "rgba(255, 247, 237, 0.85)" },
};

const CONCISE_TITLES: Record<StudioIntent, string> = {
  create: "Explore",
  analyse: "Create",
  review: "Review",
  resolve: "Solve",
};

const INTENT_DESCRIPTIONS: Record<StudioIntent, string> = {
  create: "Understand this project",
  analyse: "Generate project outputs",
  review: "Check and improve work",
  resolve: "Resolve project problems",
};

const INTENT_PROMPTS: Record<StudioIntent, (project: string) => string> = {
  create: (p) => `Help me explore and understand the design requirements, drawings, and scope for ${p}.`,
  analyse: (p) => `Prepare a preliminary estimate and BOQ for ${p} based on current drawings and specifications.`,
  review: (p) => `Review the BOQ, drawings, and scope for ${p} to check for missing items or inconsistencies.`,
  resolve: (p) => `Identify likely project coordination risks and suggest next recovery actions for ${p}.`,
};

export function StudioIntentGrid({
  selectedIntent,
  onSelectIntent,
  onSelectPrompt,
  projectName = "Luxury Villa Horizon",
}: StudioIntentGridProps) {
  const intents: StudioIntent[] = ["create", "analyse", "review", "resolve"];

  const handleCardClick = (intentKey: StudioIntent) => {
    onSelectIntent(intentKey);
    if (onSelectPrompt) {
      const promptGen = INTENT_PROMPTS[intentKey];
      if (promptGen) {
        onSelectPrompt(promptGen(projectName));
      }
    }
  };

  return (
    <div className={styles.intentGridSection} aria-label="What do you want to accomplish?">
      <div className={styles.intentSectionHeader}>
        <span className={styles.intentSectionLabel}>What do you want to accomplish?</span>
      </div>

      <div className={styles.intentGrid}>
        {intents.map((intentKey) => {
          const IconComp = INTENT_ICONS[intentKey];
          const isSelected = selectedIntent === intentKey;
          const accents = INTENT_ACCENTS[intentKey];
          const displayTitle = CONCISE_TITLES[intentKey];
          const displayDescription = INTENT_DESCRIPTIONS[intentKey];

          return (
            <div
              key={intentKey}
              onClick={() => handleCardClick(intentKey)}
              tabIndex={0}
              role="button"
              aria-selected={isSelected}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleCardClick(intentKey);
                }
              }}
              className={`${styles.intentCard} ${isSelected ? styles.intentCardActive : ""}`}
              style={
                isSelected
                  ? {
                      borderColor: accents.activeBorder,
                      background: accents.activeBg,
                    }
                  : undefined
              }
            >
              <div
                className={styles.intentIconWrap}
                style={{ color: accents.color, background: accents.bg }}
              >
                <IconComp size={18} aria-hidden="true" />
              </div>

              <div className={styles.intentMeta}>
                <h3 className={styles.intentTitle}>{displayTitle}</h3>
                <p className={styles.intentDescription}>{displayDescription}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
