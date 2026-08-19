"use client";

import React from "react";
import Link from "next/link";
import {
  Calendar,
  ArrowRight,
} from "lucide-react";
import styles from "../home-workspace.module.css";
import { practiceSetupService } from "@/services/repositories/practice-setup-service";

interface CircularProgressRingProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
}

function CircularProgressRing({
  value,
  size = 22,
  strokeWidth = 2.5,
  color = "#10b981",
  trackColor = "#f1f5f9",
}: CircularProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;

  return (
    <div
      className={styles.rearrangedRingWrapper}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className={styles.rearrangedRingSvg}
      >
        {/* Subtle glass inner disc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius - 1}
          fill="rgba(248, 250, 252, 0.7)"
        />
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress Arc */}
        {value > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        )}
      </svg>
    </div>
  );
}

export function ProfileCompletionCard() {
  const setupData = practiceSetupService.getProgress();

  const completedCount =
    setupData?.stages?.filter((s) => s.isCompleted)?.length || 1;
  const percentage = setupData?.totalPercentage || 42;

  return (
    <div className={styles.rearrangedProfileCard}>
      {/* ════════════════════════════════════════════════════════
          LEFT COLUMN: FULL-BLEED ARCHITECTURAL HERO IMAGE
      ════════════════════════════════════════════════════════ */}
      <div className={styles.rearrangedHeroImgCol}>
        <img
          src="/assets/projects/profile-feature-architecture.webp"
          alt="Architectural Practice Feature"
          className={styles.rearrangedFullBleedImg}
        />
      </div>

      {/* ════════════════════════════════════════════════════════
          RIGHT COLUMN: PROGRESS, ACTIONS & REQUIREMENTS
      ════════════════════════════════════════════════════════ */}
      <div className={styles.rearrangedContentCol}>
        {/* Header Row: Title + Date Badge */}
        <div className={styles.rearrangedHeaderRow}>
          <div className={styles.rearrangedTitleGroup}>
            <h2 className="sr-only">Complete Your Practice Setup</h2>
            <span className={styles.rearrangedTitle}>Profile Completion</span>
            <span className={styles.rearrangedDateBadge}>
              <Calendar size={11} />
              <span>June 2025</span>
            </span>
          </div>
        </div>

        {/* Normal Score Value */}
        <div className={styles.rearrangedScoreRow}>
          <span className={styles.rearrangedScore}>{percentage}%</span>
        </div>

        {/* Progress Target Metas */}
        <div className={styles.rearrangedMetaRow}>
          <span className={styles.rearrangedMetaCurrent}>
            — {completedCount} of 4 completed
          </span>
          <span className={styles.rearrangedMetaTarget}>100% Target</span>
        </div>

        {/* Segmented Horizontal Progress Line Ticks */}
        <div
          className={styles.rearrangedSegmentedBar}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Practice Setup Progress: ${percentage}%`}
        >
          {Array.from({ length: 52 }).map((_, i) => {
            const filledCount = Math.round((percentage / 100) * 52);
            const isFilled = i < filledCount;
            return (
              <span
                key={i}
                className={`${styles.rearrangedSegmentTick} ${
                  isFilled
                    ? styles.rearrangedTickFilled
                    : styles.rearrangedTickEmpty
                }`}
              />
            );
          })}
        </div>

        {/* Requirements Section Header */}
        <div className={styles.rearrangedSectionHeader}>
          <h3 className={styles.rearrangedSectionTitle}>Profile Requirements</h3>
        </div>

        {/* Compact Stages Checklist with Circular Progress Rings */}
        <div className={styles.rearrangedStagesList}>
          {/* 1. Account Setup */}
          <Link
            href="/settings/workspace"
            className={styles.rearrangedStageRow}
          >
            <div className={styles.rearrangedStageRowLeft}>
              <CircularProgressRing
                value={100}
                size={22}
                color="#10b981"
                trackColor="#e2e8f0"
              />
              <div className={styles.rearrangedStageTexts}>
                <span className={styles.rearrangedStageName}>Account Setup</span>
                <span className={styles.rearrangedStageSub}>
                  Completed yesterday
                </span>
              </div>
            </div>
            <span className={styles.rearrangedStageScoreDone}>100%</span>
          </Link>

          {/* 2. Business Profile */}
          <Link
            href="/settings/workspace"
            className={styles.rearrangedStageRow}
          >
            <div className={styles.rearrangedStageRowLeft}>
              <CircularProgressRing
                value={72}
                size={22}
                color="#0f172a"
                trackColor="#e2e8f0"
              />
              <div className={styles.rearrangedStageTexts}>
                <span className={styles.rearrangedStageNameActive}>
                  Business Profile
                </span>
                <span className={styles.rearrangedStageSub}>
                  In progress · 72%
                </span>
              </div>
            </div>
            <span className={styles.rearrangedStageScoreActive}>72%</span>
          </Link>

          {/* 3. Portfolio */}
          <Link href="/portfolio" className={styles.rearrangedStageRow}>
            <div className={styles.rearrangedStageRowLeft}>
              <CircularProgressRing
                value={45}
                size={22}
                color="#3b82f6"
                trackColor="#e2e8f0"
              />
              <div className={styles.rearrangedStageTexts}>
                <span className={styles.rearrangedStageName}>Portfolio</span>
                <span className={styles.rearrangedStageSub}>
                  Pending upload
                </span>
              </div>
            </div>
            <span className={styles.rearrangedStageScorePending}>45%</span>
          </Link>

          {/* 4. Verification */}
          <Link
            href="/settings/workspace"
            className={styles.rearrangedStageRow}
          >
            <div className={styles.rearrangedStageRowLeft}>
              <CircularProgressRing
                value={0}
                size={22}
                color="#94a3b8"
                trackColor="#e2e8f0"
              />
              <div className={styles.rearrangedStageTexts}>
                <span className={styles.rearrangedStageName}>Verification</span>
                <span className={styles.rearrangedStageSub}>
                  Pending review
                </span>
              </div>
            </div>
            <span className={styles.rearrangedStageScorePending}>0%</span>
          </Link>
        </div>

        {/* Bottom Right CTA (Ask Odin Theme) */}
        <div className={styles.rearrangedBottomActionRow}>
          <Link
            href="/settings/workspace"
            className={styles.odinThemeContinueBtn}
          >
            <span>Continue</span>
            <ArrowRight size={13} className={styles.odinArrowIcon} />
          </Link>
        </div>
      </div>
    </div>
  );
}
