"use client";

import React from "react";
import { StudioDuotoneIcon } from "@/components/layout/sidebar-icons";
import { OdinBriefViewModel } from "../services/enquiry-detail-view-model";
import styles from "./odin-project-brief.module.css";

export interface OdinProjectBriefProps {
  brief: OdinBriefViewModel;
  className?: string;
}

export function OdinProjectBrief({ brief, className }: OdinProjectBriefProps) {
  return (
    <div className={`${styles.briefCard}${className ? ` ${className}` : ""}`} aria-label="ODIN Project Brief">
      <div className={styles.headerRow}>
        <div className={styles.titleGroup}>
          <div className={styles.sidebarThemedIconBox}>
            <StudioDuotoneIcon size={20} />
          </div>
          <div className={styles.titleStack}>
            <h3 className={styles.title}>ODIN PROJECT BRIEF</h3>
            <span className={styles.subtitle}>AI-synthesized requirement assessment</span>
          </div>
        </div>
      </div>

      <p className={styles.summaryText}>{brief.summary}</p>
    </div>
  );
}
