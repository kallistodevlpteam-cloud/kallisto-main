"use client";

import React from "react";
import { Sparkles, CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { OdinBriefViewModel } from "../services/enquiry-detail-view-model";
import styles from "./odin-project-brief.module.css";

export interface OdinProjectBriefProps {
  brief: OdinBriefViewModel;
  className?: string;
}

export function OdinProjectBrief({ brief, className }: OdinProjectBriefProps) {
  return (
    <div className={`${styles.glowWrapper}${className ? ` ${className}` : ""}`}>
      <div className={styles.card} aria-label="ODIN Project Brief">
        <div className={styles.headerRow}>
          <div className={styles.titleGroup}>
            <div className={styles.sparkleBox}>
              <Sparkles size={18} className={styles.sparkleIcon} aria-hidden="true" />
            </div>
            <div>
              <h3 className={styles.title}>ODIN PROJECT BRIEF</h3>
              <span className={styles.subtitle}>AI-synthesized requirement assessment</span>
            </div>
          </div>
        </div>

        <p className={styles.summaryText}>{brief.summary}</p>
      </div>
    </div>
  );
}
