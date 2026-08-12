"use client";

import React from "react";
import {
  Users,
  Heart,
  Wallet,
  Zap,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Tag,
} from "lucide-react";
import { ClientPriority } from "../../types/enquiry.types";
import styles from "./client-priorities-bar.module.css";

export interface ClientPrioritiesBarProps {
  priorities: ClientPriority[];
  className?: string;
}

const COLOR_THEMES = ["blue", "green", "purple", "orange", "pink"] as const;
type ColorTheme = (typeof COLOR_THEMES)[number];

function getPriorityMeta(label: string, index: number, type: "confirmed" | "inferred") {
  const lower = label.toLowerCase();

  if (lower.includes("office") || lower.includes("study") || lower.includes("work")) {
    return {
      theme: "blue" as ColorTheme,
      Icon: Users,
      desc: "Regular work-from-home use requires a quiet, private workspace.",
      tags: ["Workspace", "Acoustics"],
    };
  }
  if (lower.includes("energy") || lower.includes("sustainability") || lower.includes("solar")) {
    return {
      theme: "orange" as ColorTheme,
      Icon: Sparkles,
      desc: "Client shows a strong preference for energy-efficient design and reduced long-term operating costs.",
      tags: ["Sustainability", "Energy"],
    };
  }
  if (lower.includes("budget") || lower.includes("cost") || lower.includes("financial") || lower.includes("sensitivity")) {
    return {
      theme: "purple" as ColorTheme,
      Icon: Wallet,
      desc: "Client prioritizes staying within the target ₹40L–₹60L range.",
      tags: ["Budget", "Cost Control"],
    };
  }
  if (lower.includes("comfort") || lower.includes("employee") || lower.includes("living") || lower.includes("ventilation") || lower.includes("light")) {
    return {
      theme: "green" as ColorTheme,
      Icon: Heart,
      desc: "High priority placed on natural light, cross ventilation, and direct garden view access.",
      tags: ["Ergonomics", "Daylight"],
    };
  }
  if (lower.includes("material") || lower.includes("maintenance") || lower.includes("teak") || lower.includes("finishes")) {
    return {
      theme: "pink" as ColorTheme,
      Icon: ShieldCheck,
      desc: "Low-maintenance finishes specifying local teak joinery and high-durability floor materials.",
      tags: ["Finishes", "Teak Joinery"],
    };
  }

  const theme = type === "confirmed" ? COLOR_THEMES[index % 3] : COLOR_THEMES[(index + 2) % 5];
  return {
    theme,
    Icon: Sparkles,
    desc: "Key client requirement acknowledged and captured from initial client requirement brief.",
    tags: ["Requirement", type === "confirmed" ? "Verified" : "Inferred"],
  };
}

export function ClientPrioritiesBar({ priorities, className }: ClientPrioritiesBarProps) {
  if (!priorities || priorities.length === 0) return null;

  return (
    <div
      className={`${styles.container}${className ? ` ${className}` : ""}`}
      aria-label="Client context and priorities"
    >
      {/* ── Section Header ───────────────────────────────────────────── */}
      <div className={styles.sectionHeader}>
        <div className={styles.titleGroup}>
          <h3 className={styles.sectionTitle}>CLIENT CONTEXT & PRIORITIES</h3>
          <span className={styles.countBadge}>{priorities.length} key drivers</span>
        </div>
        <div className={styles.headerMeta}>
          <span className={styles.statusDot} />
          <span className={styles.statusText}>Confirmed in Client Brief</span>
        </div>
      </div>

      {/* ── Cards Grid (Matching ODIN Insight Cards Architecture) ───── */}
      <div className={styles.cardsGrid}>
        {priorities.map((prio, idx) => {
          const isConfirmed = prio.type === "confirmed";
          const { theme, Icon, desc, tags } = getPriorityMeta(prio.label, idx, prio.type);

          return (
            <div
              key={prio.id}
              className={`${styles.cardShell} ${styles[`theme_${theme}`]} ${
                isConfirmed ? styles.shellConfirmed : styles.shellInferred
              }`}
            >
              {/* Layer 1: Header Row inside Accent Outer Shell */}
              <div className={styles.headerRow}>
                <div className={styles.headerTitleGroup}>
                  <div className={styles.iconBox}>
                    <Icon size={13} className={styles.headerIcon} />
                  </div>
                  <h4 className={styles.cardTitle}>{prio.label}</h4>
                </div>
              </div>

              {/* Layer 2: Secondary Inner Content Card (#ffffff) */}
              <div className={styles.innerCard}>
                <p className={styles.cardSnippet}>{desc}</p>
                <div className={styles.tagsRow}>
                  <span
                    className={
                      isConfirmed ? styles.confirmedBadge : styles.inferredBadge
                    }
                  >
                    {isConfirmed ? (
                      <CheckCircle2 size={11} className={styles.badgeIcon} />
                    ) : (
                      <Sparkles size={11} className={styles.badgeIcon} />
                    )}
                    <span>{isConfirmed ? "Confirmed" : "Inferred"}</span>
                  </span>
                  {tags.map((t, i) => (
                    <span key={i} className={styles.softTag}>
                      <Tag size={10} className={styles.tagIcon} />
                      <span>{t}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
