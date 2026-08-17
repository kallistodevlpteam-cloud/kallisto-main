"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import type { StudioMessageAction } from "@/types/domain/studio-message";
import styles from "../studio-chat-canvas.module.css";

export interface SuggestionChipsProps {
  actions: StudioMessageAction[];
  onActionSelect: (action: StudioMessageAction) => void;
}

export function SuggestionChips({ actions, onActionSelect }: SuggestionChipsProps) {
  if (!actions || actions.length === 0) return null;

  return (
    <div className={styles.actionChipsRow}>
      {actions.map((act) => (
        <button
          key={act.id}
          type="button"
          className={styles.actionChipBtn}
          onClick={() => onActionSelect(act)}
        >
          <Sparkles size={12.5} className={styles.actionChipSparkle} />
          <span>{act.label}</span>
        </button>
      ))}
    </div>
  );
}
