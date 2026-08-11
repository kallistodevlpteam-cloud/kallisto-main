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
  Bookmark,
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

  if (lower.includes("collaborative") || lower.includes("workspace") || lower.includes("open")) {
    return {
      theme: "blue" as ColorTheme,
      Icon: Users,
      desc: "Client emphasizes flexible collaborative zones and double-height open workspace planning.",
      tags: ["Space Planning", "Fit-out"],
    };
  }
  if (lower.includes("comfort") || lower.includes("employee") || lower.includes("living")) {
    return {
      theme: "green" as ColorTheme,
      Icon: Heart,
      desc: "High priority placed on natural light, ergonomic joinery, and direct outdoor courtyard views.",
      tags: ["Ergonomics", "HVAC"],
    };
  }
  if (lower.includes("budget") || lower.includes("cost") || lower.includes("financial")) {
    return {
      theme: "purple" as ColorTheme,
      Icon: Wallet,
      desc: "Target commercial budget range ₹40L–₹60L requiring early stage BOQ cost estimation.",
      tags: ["BOQ Cost", "Commercial"],
    };
  }
  if (lower.includes("delivery") || lower.includes("fast") || lower.includes("timeline")) {
    return {
      theme: "orange" as ColorTheme,
      Icon: Zap,
      desc: "Target 6-month delivery timeline; structured phase execution required for site handover.",
      tags: ["Schedule", "6 Months"],
    };
  }
  if (lower.includes("material") || lower.includes("maintenance") || lower.includes("teak")) {
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
      className={`${styles.outerContainer}${className ? ` ${className}` : ""}`}
      aria-label="Client context and priorities"
    >
      {/* ── Group Header Row ───────────────────────────────────────────── */}
      <div className={styles.headerRow}>
        <div className={styles.titleGroup}>
          <h3 className={styles.title}>CLIENT CONTEXT & PRIORITIES</h3>
          <span className={styles.countBadge}>{priorities.length} key drivers</span>
        </div>
        <div className={styles.headerMeta}>
          <span className={styles.statusDot} />
          <span className={styles.statusText}>Confirmed in Client Brief</span>
        </div>
      </div>

      {/* ── Cards Grid (Matching Reference Screenshot) ───────────────────── */}
      <div className={styles.cardsGrid}>
        {priorities.map((prio, idx) => {
          const isConfirmed = prio.type === "confirmed";
          const { theme, Icon, desc, tags } = getPriorityMeta(prio.label, idx, prio.type);

          return (
            <div key={prio.id} className={styles.innerCard}>
              {/* Card Header Row: Icon Badge + Priority Index + Type Tag */}
              <div className={styles.cardHeaderRow}>
                <div className={styles.badgeGroup}>
                  <div className={`${styles.iconBadge} ${styles[`theme_${theme}`]}`}>
                    <Icon size={13} />
                  </div>
                  <span className={styles.priorityIndex}>P0{idx + 1}</span>
                </div>
                <span
                  className={
                    isConfirmed ? styles.confirmedBadge : styles.inferredBadge
                  }
                >
                  {isConfirmed ? "Confirmed" : "Inferred"}
                </span>
              </div>

              {/* Card Title */}
              <h4 className={styles.cardTitle}>{prio.label}</h4>

              {/* Context Description Snippet */}
              <p className={styles.cardSnippet}>{desc}</p>

              {/* Card Footer: Soft Tags + Evidence Icon */}
              <div className={styles.cardFooter}>
                <div className={styles.tagGroup}>
                  {tags.map((t, i) => (
                    <span key={i} className={styles.softTag}>
                      {t}
                    </span>
                  ))}
                </div>
                <div className={styles.footerIconWrap} title="Verified requirement">
                  {isConfirmed ? (
                    <CheckCircle2 size={13} className={styles.checkIcon} />
                  ) : (
                    <Bookmark size={13} className={styles.bookmarkIcon} />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
