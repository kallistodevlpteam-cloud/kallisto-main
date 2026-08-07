"use client";

import React from "react";
import { Activity, AlertTriangle, Calendar, CheckCircle2, TrendingUp } from "lucide-react";
import styles from "../chronological/chronological-timeline.module.css";

export interface ScheduleHealthCardProps {
  scheduleHealth?: string;
  isAhead?: boolean;
  phaseEndDate?: string;
  criticalPathActivity?: string;
  plannedProgress?: number;
  actualProgress?: number;
  delayedCount?: number;
}

export function CurrentPhaseCard({
  scheduleHealth = "2 days ahead",
  isAhead = true,
  phaseEndDate = "30 Nov 2026",
  criticalPathActivity = "Roof Slab Reinforcement & Pouring",
  plannedProgress = 65,
  actualProgress = 68,
  delayedCount = 0,
}: ScheduleHealthCardProps) {
  return (
    <section className={styles.sidebarCard} aria-labelledby="schedule-health-card-title">
      <div className={styles.sidebarCardHeader}>
        <h3 id="schedule-health-card-title" className={styles.sidebarCardHeading}>
          Schedule health
        </h3>
        <span
          className={`${styles.scheduleHealthBadge} ${
            isAhead ? styles.healthAhead : styles.healthDelayed
          }`}
        >
          <TrendingUp size={12} />
          {scheduleHealth}
        </span>
      </div>

      <div className={styles.scheduleHealthBody}>
        {/* Two-Line Planned vs Actual Progress Bars */}
        <div className={styles.progressComparisonBox}>
          {/* Line 1: Planned Progress */}
          <div className={styles.progressComparisonLine}>
            <div className={styles.progressLabelRow}>
              <span className={styles.progressLabelText}>Planned</span>
              <span className={styles.progressPercentPlanned}>{plannedProgress}%</span>
            </div>
            <div className={styles.thinTrackBg}>
              <div
                className={styles.thinTrackFillPlanned}
                style={{ width: `${plannedProgress}%` }}
              />
            </div>
          </div>

          {/* Line 2: Actual Progress */}
          <div className={styles.progressComparisonLine}>
            <div className={styles.progressLabelRow}>
              <span className={styles.progressLabelTextBold}>Actual</span>
              <span className={styles.progressPercentActual}>{actualProgress}%</span>
            </div>
            <div className={styles.thinTrackBg}>
              <div
                className={styles.thinTrackFillActual}
                style={{ width: `${actualProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Operational Metrics Stack */}
        <div className={styles.healthDetailList}>
          {/* Current Phase End Date */}
          <div className={styles.healthDetailItem}>
            <Calendar size={13} className={styles.healthDetailIcon} />
            <div className={styles.healthTextStack}>
              <span className={styles.detailLabel}>Phase end date:</span>
              <strong className={styles.detailValue}>{phaseEndDate}</strong>
            </div>
          </div>

          {/* Critical-Path Activity */}
          <div className={styles.healthDetailItem}>
            <Activity size={13} className={styles.healthDetailIcon} />
            <div className={styles.healthTextStack}>
              <span className={styles.detailLabel}>Critical path:</span>
              <strong className={styles.detailValue}>{criticalPathActivity}</strong>
            </div>
          </div>

          {/* Delayed Activities */}
          <div className={styles.healthDetailItem}>
            {delayedCount > 0 ? (
              <AlertTriangle size={13} className={styles.healthWarnIcon} />
            ) : (
              <CheckCircle2 size={13} className={styles.healthSuccessIcon} />
            )}
            <div className={styles.healthTextStack}>
              <span className={styles.detailLabel}>Delayed activities:</span>
              <strong className={styles.detailValue}>
                {delayedCount === 0 ? "0 delayed (On track)" : `${delayedCount} delayed`}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
