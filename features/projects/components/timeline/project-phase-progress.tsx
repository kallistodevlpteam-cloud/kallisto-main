"use client";

import React from "react";
import styles from "./chronological/chronological-timeline.module.css";

export interface ProjectPhaseItem {
  id: string;
  name: string;
  status: "completed" | "active" | "upcoming";
  percent?: number;
}

export interface ProjectPhaseProgressProps {
  progressPercent?: number;
  phases?: ProjectPhaseItem[];
}

export function ProjectPhaseProgress({
  progressPercent = 68,
  phases = [
    { id: "p1", name: "Pre-design", status: "completed" },
    { id: "p2", name: "Design", status: "completed" },
    { id: "p3", name: "Procurement", status: "completed" },
    { id: "p4", name: "Construction", status: "active", percent: progressPercent },
    { id: "p5", name: "Handover", status: "upcoming" },
  ],
}: ProjectPhaseProgressProps) {
  return (
    <div className={styles.stepperPhaseStripContainer} aria-label="Project phase progress stepper">
      <div className={styles.stepperTrackWrapper}>
        {/* Continuous Horizontal Background Track Line */}
        <div className={styles.stepperContinuousLineBg} />
        {/* Active Progress Fill Line */}
        <div className={styles.stepperContinuousLineFill} style={{ width: "75%" }} />

        {/* 5 Equally Spaced Stage Nodes */}
        <div className={styles.stepperGrid}>
          {phases.map((phase) => {
            const isCompleted = phase.status === "completed";
            const isActive = phase.status === "active";

            return (
              <div key={phase.id} className={styles.stepperNodeSegment}>
                {/* Node Icon / Pill */}
                <div
                  className={`${styles.stepperNodeIcon} ${
                    isCompleted
                      ? styles.nodeIconCompleted
                      : isActive
                      ? styles.nodeIconActive
                      : styles.nodeIconUpcoming
                  }`}
                >
                  {isCompleted && <span>✓</span>}
                  {isActive && <span className={styles.nodePercentText}>{phase.percent ?? progressPercent}%</span>}
                </div>

                {/* Stage Name Label */}
                <span
                  className={`${styles.stepperNodeLabel} ${
                    isCompleted
                      ? styles.nodeLabelCompleted
                      : isActive
                      ? styles.nodeLabelActive
                      : styles.nodeLabelUpcoming
                  }`}
                >
                  {phase.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
