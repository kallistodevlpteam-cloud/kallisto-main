"use client";

import React from "react";
import { OdinDuotoneIcon } from "@/components/layout/sidebar-icons";
import type { StudioMessageAction } from "@/types/domain/studio-message";
import styles from "../studio-chat-canvas.module.css";

export interface SuggestionChipsProps {
  actions: StudioMessageAction[];
  isAnimated?: boolean;
  onActionSelect: (action: StudioMessageAction) => void;
}

export function SuggestionChips({ actions, isAnimated = false, onActionSelect }: SuggestionChipsProps) {
  if (!actions || actions.length === 0) return null;

  return (
    <div className={styles.actionChipsRow}>
      {actions.map((act, index) => (
        <button
          key={act.id}
          type="button"
          className={styles.actionChipBtn}
          style={
            isAnimated
              ? {
                  animation: `progressiveChipIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) both`,
                  animationDelay: `${index * 80}ms`,
                }
              : undefined
          }
          onClick={() => onActionSelect(act)}
        >
          <OdinDuotoneIcon size={13} className={styles.actionChipSparkle} />
          <span>{act.label}</span>
        </button>
      ))}
    </div>
  );
}
