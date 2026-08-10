"use client";

import React from "react";
import {
  Users,
  Heart,
  Wallet,
  Zap,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { ClientPriority } from "../../types/enquiry.types";
import styles from "./client-priorities-bar.module.css";

export interface ClientPrioritiesBarProps {
  priorities: ClientPriority[];
  className?: string;
}

const COLOR_THEMES = ["blue", "green", "orange", "purple", "pink"] as const;
type ColorTheme = (typeof COLOR_THEMES)[number];

function getPriorityConfig(label: string, index: number, type: "confirmed" | "inferred") {
  const lower = label.toLowerCase();

  if (lower.includes("collaborative") || lower.includes("workspace")) {
    return { theme: "blue" as ColorTheme, Icon: Users };
  }
  if (lower.includes("comfort") || lower.includes("employee")) {
    return { theme: "green" as ColorTheme, Icon: Heart };
  }
  if (lower.includes("budget") || lower.includes("cost") || lower.includes("financial")) {
    return { theme: "purple" as ColorTheme, Icon: Wallet };
  }
  if (lower.includes("delivery") || lower.includes("fast") || lower.includes("timeline")) {
    return { theme: "orange" as ColorTheme, Icon: Zap };
  }
  if (lower.includes("material") || lower.includes("maintenance")) {
    return { theme: "pink" as ColorTheme, Icon: ShieldCheck };
  }

  const theme = type === "confirmed" ? COLOR_THEMES[index % 3] : COLOR_THEMES[(index + 3) % 5];
  return { theme, Icon: Sparkles };
}

export function ClientPrioritiesBar({ priorities, className }: ClientPrioritiesBarProps) {
  if (!priorities || priorities.length === 0) return null;

  return (
    <div
      className={`${styles.container}${className ? ` ${className}` : ""}`}
      aria-label="Client priorities"
    >
      <div className={styles.header}>
        <h3 className={styles.title}>CLIENT PRIORITIES</h3>
      </div>

      <div className={styles.chipsRow}>
        {priorities.map((prio, idx) => {
          const isConfirmed = prio.type === "confirmed";
          const { theme, Icon } = getPriorityConfig(prio.label, idx, prio.type);

          return (
            <div
              key={prio.id}
              className={`${styles.priorityChip} ${styles[`theme_${theme}`]}`}
            >
              <Icon className={styles.chipIcon} size={15} />
              <span className={styles.label}>{prio.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
