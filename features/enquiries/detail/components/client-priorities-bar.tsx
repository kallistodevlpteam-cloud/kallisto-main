"use client";

import React from "react";
import { ClientPriority } from "../../types/enquiry.types";
import styles from "./client-priorities-bar.module.css";

export interface ClientPrioritiesBarProps {
  priorities: ClientPriority[];
  className?: string;
}

function resolveClientContextMeta(prio: ClientPriority) {
  const lower = prio.label.toLowerCase();

  let memberName = prio.memberName;
  let memberRole = prio.memberRole;
  let memberInitials = prio.memberInitials;

  if (!memberName) {
    if (lower.includes("ventilation") || lower.includes("light") || lower.includes("daylight")) {
      memberName = "Ananya Sharma";
      memberRole = "Primary Decision Maker";
      memberInitials = "AS";
    } else if (lower.includes("teak") || lower.includes("finishes") || lower.includes("material")) {
      memberName = "Ananya Sharma + 2";
      memberRole = "Household Preference";
      memberInitials = "AS";
    } else if (lower.includes("office") || lower.includes("study") || lower.includes("work")) {
      memberName = "David Langston";
      memberRole = "Co-Owner & Design Lead";
      memberInitials = "DL";
    } else if (lower.includes("budget") || lower.includes("cost") || lower.includes("financial")) {
      memberName = "Radhika Kulkarni";
      memberRole = "Commercial Director";
      memberInitials = "RK";
    } else if (lower.includes("energy") || lower.includes("sustainability") || lower.includes("solar")) {
      memberName = "Ananya Sharma";
      memberRole = "Primary Decision Maker";
      memberInitials = "AS";
    } else {
      memberName = "Ananya Sharma";
      memberRole = "Primary Decision Maker";
      memberInitials = "AS";
    }
  }

  let desc = prio.description;
  let tags = prio.tags;

  if (!desc || !tags || tags.length === 0) {
    if (lower.includes("office") || lower.includes("study") || lower.includes("work")) {
      desc = "Regular work-from-home use requires a quiet, acoustic private workspace.";
      tags = ["Workspace", "Acoustics", "Work Pattern"];
    } else if (lower.includes("energy") || lower.includes("sustainability") || lower.includes("solar")) {
      desc = "ODIN identifies a strong preference for energy-efficient design and reduced long-term operating costs.";
      tags = ["Sustainability", "Operating Cost"];
    } else if (lower.includes("budget") || lower.includes("cost") || lower.includes("financial") || lower.includes("sensitivity")) {
      desc = "Client prioritizes staying within the target ₹40L–₹60L range without compromising structural quality.";
      tags = ["Budget", "Cost Control", "Decision Making"];
    } else if (lower.includes("comfort") || lower.includes("living") || lower.includes("ventilation") || lower.includes("light")) {
      desc = "High priority on natural light, cross ventilation and direct garden access.";
      tags = ["Daylight", "Ventilation", "Lifestyle"];
    } else if (lower.includes("material") || lower.includes("maintenance") || lower.includes("teak") || lower.includes("finishes")) {
      desc = "Low-maintenance finishes specifying local teak joinery and high-durability floor materials.";
      tags = ["Finishes", "Teak Joinery", "Material"];
    } else {
      desc = "Key client preference acknowledged and captured from client context brief.";
      tags = ["Lifestyle", prio.type === "confirmed" ? "Verified" : "ODIN Inferred"];
    }
  }

  return { memberName, memberRole, memberInitials, desc, tags };
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
          <span className={styles.countBadge}>{priorities.length} key client drivers</span>
        </div>
        <div className={styles.headerMeta}>
          <span className={styles.statusDot} />
          <span className={styles.statusText}>Confirmed in Client Brief</span>
        </div>
      </div>

      {/* ── Client Context Cards Grid (3 Columns Desktop) ────────────── */}
      <div className={styles.cardsGrid}>
        {priorities.map((prio) => {
          const isConfirmed = prio.type === "confirmed";
          const isInferred = prio.type === "inferred";
          const { memberName, memberRole, memberInitials, desc, tags } =
            resolveClientContextMeta(prio);

          return (
            <div key={prio.id} className={styles.clientCardShell}>
              {/* Layer 1: Client Identity Header */}
              <div className={styles.clientIdentityHeader}>
                <div className={styles.clientAvatarGroup}>
                  <div className={styles.clientAvatarCircle}>
                    {memberName.includes("+") ? `${memberInitials}+` : memberInitials}
                  </div>
                  <div className={styles.clientIdentityMeta}>
                    <h5 className={styles.clientMemberName}>{memberName}</h5>
                    <span className={styles.clientMemberRole}>{memberRole}</span>
                  </div>
                </div>

                <span
                  className={
                    isConfirmed
                      ? styles.confirmedBadge
                      : isInferred
                      ? styles.inferredBadge
                      : styles.clarificationBadge
                  }
                >
                  {isConfirmed ? "Confirmed" : isInferred ? "Inferred" : "Needs Clarification"}
                </span>
              </div>

              {/* Layer 2: Context Title & Human Description */}
              <div className={styles.clientContextContent}>
                <h4 className={styles.clientContextTitle}>{prio.label}</h4>
                <p className={styles.clientContextDesc}>{desc}</p>
              </div>

              {/* Layer 3: Contextual Tags */}
              <div className={styles.clientTagsRow}>
                {tags.map((t: string, i: number) => (
                  <span key={i} className={styles.clientTag}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
