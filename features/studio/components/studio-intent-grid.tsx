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
}

const INTENT_ICONS: Record<StudioIntent, React.ElementType> = {
  create: ExploreDuotoneIcon,
  analyse: StudioDuotoneIcon,
  review: ReviewDuotoneIcon,
  resolve: ResolveDuotoneIcon,
};

const INTENT_ACCENTS: Record<StudioIntent, { color: string; bg: string }> = {
  create: { color: "#2563eb", bg: "#eff6ff" },
  analyse: { color: "#7c3aed", bg: "#f5f3ff" },
  review: { color: "#16a34a", bg: "#f0fdf4" },
  resolve: { color: "#ea580c", bg: "#fff7ed" },
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

export function StudioIntentGrid({
  selectedIntent,
  onSelectIntent,
}: StudioIntentGridProps) {
  const intents: StudioIntent[] = ["create", "analyse", "review", "resolve"];

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
              className={`${styles.intentCard} ${isSelected ? styles.intentCardActive : ""}`}
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
