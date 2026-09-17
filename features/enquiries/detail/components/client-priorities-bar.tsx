"use client";

import React from "react";
import { CheckCircle2, Sparkles, Tag } from "lucide-react";
import {
  WorkspaceDuotoneIcon,
  EnergyDuotoneIcon,
  RupeeDuotoneIcon,
  SunDuotoneIcon,
  ShieldDuotoneIcon,
  StudioDuotoneIcon,
} from "@/components/layout/sidebar-icons";
import { ClientPriority } from "../../types/enquiry.types";
import styles from "./client-priorities-bar.module.css";

export interface ClientPrioritiesBarProps {
  priorities: ClientPriority[];
  className?: string;
  editable?: boolean;
}

const COLOR_THEMES = ["blue", "green", "purple", "orange", "pink"] as const;
type ColorTheme = (typeof COLOR_THEMES)[number];

function getPriorityMeta(label: string, index: number, type: "confirmed" | "inferred") {
  const lower = label.toLowerCase();

  if (lower.includes("office") || lower.includes("study") || lower.includes("work")) {
    return {
      theme: "blue" as ColorTheme,
      Icon: WorkspaceDuotoneIcon,
      desc: "Regular work-from-home use requires a quiet, private workspace.",
      tags: ["Workspace", "Acoustics"],
    };
  }
  if (lower.includes("energy") || lower.includes("sustainability") || lower.includes("solar")) {
    return {
      theme: "orange" as ColorTheme,
      Icon: EnergyDuotoneIcon,
      desc: "Client shows a strong preference for energy-efficient design and reduced long-term operating costs.",
      tags: ["Sustainability", "Energy"],
    };
  }
  if (lower.includes("budget") || lower.includes("cost") || lower.includes("financial") || lower.includes("sensitivity")) {
    return {
      theme: "purple" as ColorTheme,
      Icon: RupeeDuotoneIcon,
      desc: "Client prioritizes staying within the target ₹40L–₹60L range.",
      tags: ["Budget", "Cost Control"],
    };
  }
  if (lower.includes("comfort") || lower.includes("employee") || lower.includes("living") || lower.includes("ventilation") || lower.includes("light")) {
    return {
      theme: "green" as ColorTheme,
      Icon: SunDuotoneIcon,
      desc: "High priority placed on natural light, cross ventilation, and direct garden view access.",
      tags: ["Ergonomics", "Daylight"],
    };
  }
  if (lower.includes("material") || lower.includes("maintenance") || lower.includes("teak") || lower.includes("finishes")) {
    return {
      theme: "pink" as ColorTheme,
      Icon: ShieldDuotoneIcon,
      desc: "Low-maintenance finishes specifying local teak joinery and high-durability floor materials.",
      tags: ["Finishes", "Teak Joinery"],
    };
  }

  const theme = type === "confirmed" ? COLOR_THEMES[index % 3] : COLOR_THEMES[(index + 2) % 5];
  return {
    theme,
    Icon: StudioDuotoneIcon,
    desc: "Key client requirement acknowledged and captured from initial client requirement brief.",
    tags: ["Requirement", type === "confirmed" ? "Verified" : "Inferred"],
  };
}

export function ClientPrioritiesBar({
  priorities,
  className,
  editable = false,
}: ClientPrioritiesBarProps) {
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

      {/* ── Cards Grid ──────────────────────────────────────────────── */}
      <div className={styles.cardsGrid}>
        {priorities.map((prio, idx) => (
          <PriorityCard
            key={prio.id}
            prio={prio}
            idx={idx}
            editable={editable}
          />
        ))}
      </div>
    </div>
  );
}

interface PriorityCardProps {
  prio: ClientPriority;
  idx: number;
  editable?: boolean;
}

function PriorityCard({ prio, idx, editable }: PriorityCardProps) {
  const { theme, Icon, desc, tags } = getPriorityMeta(prio.label, idx, prio.type);

  const [editing, setEditing] = React.useState(false);
  const [draftDesc, setDraftDesc] = React.useState(desc);
  const [draftType, setDraftType] = React.useState<"confirmed" | "inferred">(prio.type);
  const [displayDesc, setDisplayDesc] = React.useState(desc);
  const [displayType, setDisplayType] = React.useState<"confirmed" | "inferred">(prio.type);

  const isConfirmed = displayType === "confirmed";

  function handleEdit(e: React.MouseEvent) {
    e.stopPropagation();
    setDraftDesc(displayDesc);
    setDraftType(displayType);
    setEditing(true);
  }

  function handleUpdate() {
    setDisplayDesc(draftDesc.trim() || displayDesc);
    setDisplayType(draftType);
    setEditing(false);
  }

  function handleCancel() {
    setEditing(false);
  }

  return (
    <div className={`${styles.cardShell} ${styles[`theme_${theme}`]}`}>
      {/* Edit trigger icon – only on client portal when editable is true */}
      {editable && !editing && (
        <button
          type="button"
          className={styles.editIconBtn}
          aria-label={`Edit ${prio.label}`}
          onClick={handleEdit}
          title="Edit"
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
      )}

      {editing ? (
        /* Edit Mode */
        <div className={styles.editPanel}>
          <div className={styles.editField}>
            <label className={styles.editLabel} htmlFor={`status-${prio.id}`}>
              Status
            </label>
            <select
              id={`status-${prio.id}`}
              className={styles.editSelect}
              value={draftType}
              onChange={(e) =>
                setDraftType(e.target.value as "confirmed" | "inferred")
              }
            >
              <option value="confirmed">✓ Confirmed</option>
              <option value="inferred">✦ Inferred</option>
            </select>
          </div>

          <div className={styles.editField}>
            <label className={styles.editLabel} htmlFor={`desc-${prio.id}`}>
              Description
            </label>
            <textarea
              id={`desc-${prio.id}`}
              className={styles.editTextarea}
              value={draftDesc}
              onChange={(e) => setDraftDesc(e.target.value)}
              rows={3}
              placeholder="Describe this priority…"
            />
          </div>

          <div className={styles.editActions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              type="button"
              className={styles.updateBtn}
              onClick={handleUpdate}
            >
              Update
            </button>
          </div>
        </div>
      ) : (
        /* View Mode */
        <>
          <div className={styles.cardMain}>
            <div className={styles.iconBox}>
              <Icon size={18} className={styles.headerIcon} />
            </div>
            <div className={styles.contentCol}>
              <h4 className={styles.cardTitle}>{prio.label}</h4>
              <p className={styles.cardSnippet}>{displayDesc}</p>
            </div>
          </div>

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
        </>
      )}
    </div>
  );
}
