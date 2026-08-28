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
      {actions.map((act, index) => {
        const isProceedCta = act.label.toLowerCase().trim() === "proceed";

        return (
          <button
            key={act.id}
            type="button"
            className={styles.actionChipBtn}
            style={{
              ...(isAnimated
                ? {
                    animation: `progressiveChipIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) both`,
                    animationDelay: `${index * 80}ms`,
                  }
                : {}),
              ...(isProceedCta
                ? {
                    background: "#0f172a",
                    color: "#ffffff",
                    borderColor: "#0f172a",
                    fontWeight: 700,
                    fontSize: "13.5px",
                    height: "40px",
                    padding: "0 26px",
                    borderRadius: "9999px",
                    boxShadow: "0 4px 16px rgba(15, 23, 42, 0.22)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                  }
                : {}),
            }}
            onClick={() => onActionSelect(act)}
          >
            {!isProceedCta && (
              <OdinDuotoneIcon
                size={13}
                className={styles.actionChipSparkle}
              />
            )}
            <span>{act.label}</span>
          </button>
        );
      })}
    </div>
  );
}
