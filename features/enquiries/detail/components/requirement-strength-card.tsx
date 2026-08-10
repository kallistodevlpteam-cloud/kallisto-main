"use client";

import React from "react";
import { Info } from "lucide-react";
import styles from "./requirement-strength-card.module.css";

export interface RequirementStrengthCardProps {
  completedSignals: number;
  totalSignals: number;
  previousScore?: number;
  onDetailsClick?: () => void;
  className?: string;
}

export function RequirementStrengthCard({
  completedSignals,
  totalSignals,
  previousScore,
  onDetailsClick,
  className,
}: RequirementStrengthCardProps) {
  // 1. Internal score calculation
  const score =
    totalSignals > 0 ? Math.round((completedSignals / totalSignals) * 100) : 0;

  const TOTAL_SEGMENTS = 50;

  // 2. Derive filled segments count out of 50
  const filledSegments = Math.min(
    TOTAL_SEGMENTS,
    Math.max(0, Math.round((score / 100) * TOTAL_SEGMENTS))
  );

  // 3. Trend calculation
  const rawScore = totalSignals > 0 ? (completedSignals / totalSignals) * 100 : 0;
  const trendVal = previousScore !== undefined ? rawScore - previousScore : null;

  // 4. Strength classification & semantic colours
  let strengthLabel = "Weak";
  let themeColor = "#dc2626"; // red for Weak

  if (score >= 80) {
    strengthLabel = "High Confidence";
    themeColor = "#16a34a"; // green
  } else if (score >= 60) {
    strengthLabel = "Strong";
    themeColor = "#16a34a"; // green
  } else if (score >= 35) {
    strengthLabel = "Moderate";
    themeColor = "#ff6b00"; // vibrant orange for Moderate (matching design reference)
  } else {
    strengthLabel = "Weak";
    themeColor = "#dc2626"; // red
  }

  // 5. Trend text formatting
  let trendTextPrefix = "";
  let trendTextSuffix = "";
  let trendClass = styles.trendNeutral;
  let trendFormattedShort = "";

  if (trendVal !== null) {
    const roundedTrend = Math.round(trendVal * 10) / 10;
    if (roundedTrend > 0) {
      trendTextPrefix = `+${roundedTrend.toFixed(1)}%`;
      trendTextSuffix = " vs last review";
      trendFormattedShort = `+${roundedTrend.toFixed(1)}%`;
      trendClass = styles.trendPositive;
    } else if (roundedTrend < 0) {
      trendTextPrefix = `${roundedTrend.toFixed(1)}%`;
      trendTextSuffix = " vs last review";
      trendFormattedShort = `${roundedTrend.toFixed(1)}%`;
      trendClass = styles.trendNegative;
    } else {
      trendTextPrefix = "No change";
      trendTextSuffix = " since last review";
      trendFormattedShort = "0.0%";
      trendClass = styles.trendNeutral;
    }
  }

  return (
    <div
      className={`${styles.card}${className ? ` ${className}` : ""}`}
      aria-label="Requirement strength analysis"
    >
      {/* Card Title */}
      <div className={styles.header}>
        <div className={styles.titleWrap}>
          <h3 className={styles.title}>Requirement Strength</h3>
          <span title="How requirement strength is calculated" style={{ display: "inline-flex", alignItems: "center" }}>
            <Info
              size={14}
              className={styles.infoIcon}
              aria-label="How requirement strength is calculated"
            />
          </span>
        </div>
      </div>

      {/* Main Metric Row */}
      <div className={styles.metricRow}>
        <span className={styles.scoreValue}>{score}%</span>
        {trendTextPrefix && (
          <span className={styles.trendWrap}>
            <span className={trendClass}>{trendTextPrefix}</span>
            <span>{trendTextSuffix}</span>
          </span>
        )}
      </div>

      {/* Segmented Strength Bar (50 segments) */}
      <div
        className={styles.segmentBar}
        role="progressbar"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Requirement strength: ${score}% (${strengthLabel})`}
      >
        {Array.from({ length: TOTAL_SEGMENTS }).map((_, idx) => {
          const isFilled = idx < filledSegments;
          // Progressive blue-to-green coloring logic across the bar (215deg Blue -> 135deg Green)
          const ratio = idx / (TOTAL_SEGMENTS - 1);
          const hue = Math.round(215 - ratio * 80);
          const segmentColor = `hsl(${hue}, 85%, 44%)`;

          return (
            <div
              key={idx}
              className={`${styles.segment} ${!isFilled ? styles.segmentUnfilled : ""}`}
              style={{ backgroundColor: isFilled ? segmentColor : undefined }}
            />
          );
        })}
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <span className={styles.footerLeft}>{strengthLabel}</span>
        <span className={styles.footerCenter}>
          {completedSignals} of {totalSignals} signals clear
        </span>
        {trendFormattedShort && (
          <span className={`${styles.footerRight} ${trendClass}`}>
            {trendFormattedShort}
          </span>
        )}
      </div>
    </div>
  );
}
