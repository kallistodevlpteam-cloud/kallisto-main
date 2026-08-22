"use client";

import React from "react";
import {
  AlertTriangle,
  ArrowRight,
  Calculator,
  CheckCircle2,
  Clock,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  Lightbulb,
  Sparkles,
  Zap,
} from "lucide-react";
import { StudioTask } from "@/types/domain/studio";
import styles from "./studio-chat-canvas.module.css";

export interface StudioIntelligenceHubProps {
  projectName?: string;
  onSelectPrompt: (promptText: string) => void;
  recentTasks?: StudioTask[];
  onReopenTask?: (taskId: string) => void;
}

export function StudioIntelligenceHub({
  projectName = "Luxury Villa Horizon",
  onSelectPrompt,
  recentTasks = [],
  onReopenTask,
}: StudioIntelligenceHubProps) {
  return (
    <div className={styles.intelligenceHub} aria-label="Project active intelligence">
      {/* 1. Next Best Action Highlight Banner */}
      <div className={styles.nextActionCard}>
        <div className={styles.nextActionLeft}>
          <div className={styles.nextActionIconWrap}>
            <Zap size={16} aria-hidden="true" />
          </div>
          <div className={styles.nextActionMeta}>
            <span className={styles.nextActionBadge}>Recommended Next Action</span>
            <h3 className={styles.nextActionTitle}>
              Complete the preliminary estimate for {projectName}
            </h3>
            <p className={styles.nextActionDescription}>
              Odin can synthesize the structural BOQ, living room material specs, and Kerala civil labour rates into an authoritative estimate.
            </p>
          </div>
        </div>

        <button
          type="button"
          className={styles.nextActionBtn}
          onClick={() =>
            onSelectPrompt(
              `Complete the preliminary estimate for ${projectName} synthesizing the BOQ, material specs and current civil labour rates.`
            )
          }
          aria-label={`Complete the preliminary estimate for ${projectName}`}
        >
          <span>Complete estimate</span>
          <ArrowRight size={14} aria-hidden="true" />
        </button>
      </div>

      {/* 2. Side-by-Side Intelligence Grid: Recent Work & Odin Noticed */}
      <div className={styles.intelligenceGrid}>
        {/* Left Column: Recent Work */}
        <section className={styles.intelligenceSection} aria-label="Recent project work">
          <div className={styles.intelligenceSectionHeader}>
            <div className={styles.intelligenceHeaderTitle}>
              <Clock size={15} className={styles.sectionIcon} aria-hidden="true" />
              <h4>Recent work</h4>
            </div>
            <span className={styles.intelligenceHeaderCount}>3 active items</span>
          </div>

          <div className={styles.recentWorkList}>
            {/* Item 1 */}
            <div
              className={styles.recentWorkItem}
              onClick={() =>
                onSelectPrompt(
                  `Review and update the Preliminary BOQ for Ground Floor in ${projectName}`
                )
              }
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectPrompt(
                    `Review and update the Preliminary BOQ for Ground Floor in ${projectName}`
                  );
                }
              }}
            >
              <div className={styles.recentWorkIconWrap} style={{ background: "#f0fdf4", color: "#16a34a" }}>
                <FileSpreadsheet size={15} aria-hidden="true" />
              </div>
              <div className={styles.recentWorkMeta}>
                <div className={styles.recentWorkTitleRow}>
                  <span className={styles.recentWorkTitle}>Preliminary BOQ — Ground Floor</span>
                  <span className={styles.recentWorkBadgeDraft}>Draft V02</span>
                </div>
                <span className={styles.recentWorkSubtitle}>Updated 2h ago · 34 line items</span>
              </div>
              <ArrowRight size={13} className={styles.recentWorkArrow} aria-hidden="true" />
            </div>

            {/* Item 2 */}
            <div
              className={styles.recentWorkItem}
              onClick={() =>
                onSelectPrompt(
                  `Check material specifications for the Living Room in ${projectName}`
                )
              }
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectPrompt(
                    `Check material specifications for the Living Room in ${projectName}`
                  );
                }
              }}
            >
              <div className={styles.recentWorkIconWrap} style={{ background: "#faf5ff", color: "#9333ea" }}>
                <FileText size={15} aria-hidden="true" />
              </div>
              <div className={styles.recentWorkMeta}>
                <div className={styles.recentWorkTitleRow}>
                  <span className={styles.recentWorkTitle}>Material specification — Living Room</span>
                  <span className={styles.recentWorkBadgeReady}>Ready</span>
                </div>
                <span className={styles.recentWorkSubtitle}>Updated yesterday · 18 finish items</span>
              </div>
              <ArrowRight size={13} className={styles.recentWorkArrow} aria-hidden="true" />
            </div>

            {/* Item 3 */}
            <div
              className={styles.recentWorkItem}
              onClick={() =>
                onSelectPrompt(
                  `Inspect architectural drawing review Rev 04 for ${projectName}`
                )
              }
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectPrompt(
                    `Inspect architectural drawing review Rev 04 for ${projectName}`
                  );
                }
              }}
            >
              <div className={styles.recentWorkIconWrap} style={{ background: "#f0f9ff", color: "#0284c7" }}>
                <FileCheck2 size={15} aria-hidden="true" />
              </div>
              <div className={styles.recentWorkMeta}>
                <div className={styles.recentWorkTitleRow}>
                  <span className={styles.recentWorkTitle}>Drawing review — Rev 04</span>
                  <span className={styles.recentWorkBadgeReview}>Review</span>
                </div>
                <span className={styles.recentWorkSubtitle}>Architectural check · 92% complete</span>
              </div>
              <ArrowRight size={13} className={styles.recentWorkArrow} aria-hidden="true" />
            </div>
          </div>
        </section>

        {/* Right Column: Odin Noticed */}
        <section className={styles.intelligenceSection} aria-label="Odin proactive observations">
          <div className={styles.intelligenceSectionHeader}>
            <div className={styles.intelligenceHeaderTitle}>
              <Sparkles size={15} className={styles.odinSectionIcon} aria-hidden="true" />
              <h4>Odin noticed</h4>
            </div>
            <span className={styles.odinHeaderBadge}>3 observations</span>
          </div>

          <div className={styles.odinNoticedList}>
            {/* Observation 1 */}
            <div
              className={styles.odinNoticedCard}
              onClick={() =>
                onSelectPrompt(
                  `Inspect the 3 missing dimensions in the terrace drawing of ${projectName} and suggest corrections.`
                )
              }
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectPrompt(
                    `Inspect the 3 missing dimensions in the terrace drawing of ${projectName} and suggest corrections.`
                  );
                }
              }}
            >
              <div className={styles.odinNoticedIconWrap} style={{ background: "#fff1f2", color: "#e11d48" }}>
                <AlertTriangle size={15} aria-hidden="true" />
              </div>
              <div className={styles.odinNoticedMeta}>
                <h5 className={styles.odinNoticedTitle}>3 missing dimensions in the terrace drawing</h5>
                <p className={styles.odinNoticedDescription}>
                  Terrace slab edge offset & column line C-4 grid not fully dimensioned in DWG Rev 04.
                </p>
                <div className={styles.odinNoticedActionRow}>
                  <span className={styles.odinNoticedActionLink}>Inspect in Odin →</span>
                </div>
              </div>
            </div>

            {/* Observation 2 */}
            <div
              className={styles.odinNoticedCard}
              onClick={() =>
                onSelectPrompt(
                  `Calculate and add electrical sub-allowance for automated lighting in ${projectName} BOQ.`
                )
              }
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectPrompt(
                    `Calculate and add electrical sub-allowance for automated lighting in ${projectName} BOQ.`
                  );
                }
              }}
            >
              <div className={styles.odinNoticedIconWrap} style={{ background: "#fffbeb", color: "#d97706" }}>
                <Lightbulb size={15} aria-hidden="true" />
              </div>
              <div className={styles.odinNoticedMeta}>
                <h5 className={styles.odinNoticedTitle}>BOQ has no electrical allowance</h5>
                <p className={styles.odinNoticedDescription}>
                  Living Space lighting automation & DB sub-panels require preliminary provisional sum.
                </p>
                <div className={styles.odinNoticedActionRow}>
                  <span className={styles.odinNoticedActionLink}>Add allowance →</span>
                </div>
              </div>
            </div>

            {/* Observation 3 */}
            <div
              className={styles.odinNoticedCard}
              onClick={() =>
                onSelectPrompt(
                  `Draft a client review package for the Italian marble flooring specification in ${projectName}.`
                )
              }
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectPrompt(
                    `Draft a client review package for the Italian marble flooring specification in ${projectName}.`
                  );
                }
              }}
            >
              <div className={styles.odinNoticedIconWrap} style={{ background: "#eff6ff", color: "#2563eb" }}>
                <CheckCircle2 size={15} aria-hidden="true" />
              </div>
              <div className={styles.odinNoticedMeta}>
                <h5 className={styles.odinNoticedTitle}>Client approval pending for flooring</h5>
                <p className={styles.odinNoticedDescription}>
                  Italian Statuario marble specification draft is ready for client confirmation.
                </p>
                <div className={styles.odinNoticedActionRow}>
                  <span className={styles.odinNoticedActionLink}>Review item →</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
