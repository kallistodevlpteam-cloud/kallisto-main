"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  ShieldAlert,
  Clock,
  Building2,
  User,
  Layers,
  FileText,
  BadgeCheck,
} from "lucide-react";
import styles from "../home-workspace.module.css";
import { practiceSetupService } from "@/services/repositories/practice-setup-service";


function CircularProgress({ percentage }: { percentage: number }) {
  const totalSegments = 10;
  const activeSegments = Math.round(percentage / 10);
  // circumference of r=22 circle: 2*PI*22 ≈ 138.2; each segment: 138.2/10=13.82
  // dash: 9.5 gap: 4.32 (=13.82)
  return (
    <div className={styles.pcsCircularGaugeContainer}>
      <svg width="72" height="72" viewBox="0 0 48 48" className={styles.pcsCircularGaugeSvg}>
        {Array.from({ length: totalSegments }).map((_, index) => {
          const angle = index * (360 / totalSegments) - 90;
          const isActive = index < activeSegments;
          return (
            <circle
              key={index}
              cx="24"
              cy="24"
              r="18"
              fill="none"
              stroke={isActive ? "#f97316" : "#e5e7eb"}
              strokeWidth="4"
              strokeDasharray="8 105.6"
              transform={`rotate(${angle} 24 24)`}
              strokeLinecap="round"
            />
          );
        })}
      </svg>
      <div className={styles.pcsCircularGaugeText}>
        {percentage}%
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   STAGE STATUS BADGE  (IN PROGRESS / PENDING / DONE)
 ───────────────────────────────────────────────────────────── */
function StageBadge({ state }: { state: "active" | "completed" | "pending" }) {
  if (state === "active")
    return <span className={styles.pcsStageBadgeActive}>In progress</span>;
  if (state === "completed")
    return <span className={styles.pcsStageBadgeDone}>Done</span>;
  return <span className={styles.pcsStageBadgePending}>Pending</span>;
}

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
export function ProfileCompletionCard() {
  const setupData = practiceSetupService.getProgress();

  // Hidden when very complete
  if (setupData.displayMode === "hidden") return null;

  // ── In Review Banner ──────────────────────────────────────
  if (setupData.displayMode === "in_review_banner") {
    return (
      <div className={styles.practiceSetupContainerInReview}>
        <div className={styles.setupBannerHeader}>
          <div className={styles.setupBannerTitleGroup}>
            <div className={styles.setupIconBoxReview}>
              <Clock size={18} />
            </div>
            <div>
              <div className={styles.setupHeadlineRow}>
                <h2 className={styles.practiceTitle}>Setup submitted — verification in review</h2>
                <span className={styles.statusPillReview}>IN REVIEW</span>
              </div>
              <p className={styles.practiceSubtitle}>
                Your credentials and professional details are currently being reviewed by Kallisto. You will be notified once verified.
              </p>
            </div>
          </div>
          <Link href="/settings/workspace" className={styles.btnSecondarySetup}>
            <span>View status</span>
            <ArrowRight size={14} />
          </Link>
        </div>
        <div className={styles.thinProgressBarTrack}>
          <div className={styles.thinProgressBarFill} style={{ width: "90%" }} />
        </div>
      </div>
    );
  }

  // ── Attention Required ────────────────────────────────────
  if (setupData.displayMode === "attention_card") {
    return (
      <div className={styles.practiceSetupContainerAttention}>
        <div className={styles.setupBannerHeader}>
          <div className={styles.setupBannerTitleGroup}>
            <div className={styles.setupIconBoxAttention}>
              <ShieldAlert size={18} />
            </div>
            <div>
              <div className={styles.setupHeadlineRow}>
                <h2 className={styles.practiceTitle}>Verification requires attention</h2>
                <span className={styles.statusPillAttention}>ACTION REQUIRED</span>
              </div>
              <p className={styles.practiceSubtitle}>
                {setupData.attentionReason ||
                  "Identity document or business proof requires re-upload. Please update your verification submission."}
              </p>
            </div>
          </div>
          <Link href="/settings/workspace" className={styles.btnPrimarySetup}>
            <span>Update verification</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  // ── Compact Banner (75–99%: reduced prominence while keeping next step visible) ──
  if (setupData.displayMode === "compact_banner") {
    return (
      <div className={styles.practiceSetupContainerCompact}>
        <div className={styles.compactSetupHeaderRow}>
          <div className={styles.compactTitleGroup}>
            <div className={styles.setupPercentBadgeBoxCompact}>
              <span className={styles.percentNumber}>{setupData.totalPercentage}%</span>
            </div>
            <div>
              <div className={styles.setupHeadlineRow}>
                <h2 className={styles.practiceTitle}>Complete Your Practice Setup</h2>
                <span className={styles.remainingBadge}>
                  {setupData.progressState.label} · {setupData.remainingStepsCount}{" "}
                  {setupData.remainingStepsCount === 1 ? "step" : "steps"} remaining
                </span>
              </div>
              <p className={styles.nextStepText}>
                <strong>Next step:</strong> {setupData.nextStepRequirement}
              </p>
            </div>
          </div>
          <Link href={setupData.nextStepRoute} className={styles.btnPrimarySetup}>
            <span>Continue Setup</span>
            <ArrowRight size={14} />
          </Link>
        </div>
        <div className={styles.thinProgressBarTrack}>
          <div
            className={styles.thinProgressBarFill}
            style={{ width: `${setupData.totalPercentage}%` }}
          />
        </div>
      </div>
    );
  }

  // ── Full Card (0–74% & Complete) — MAIN STATE ──────────────
  const STAGE_ICONS = {
    account: User,
    business: Building2,
    portfolio: FileText,
    verification: BadgeCheck,
  };

  const getStageState = (stage: (typeof setupData.stages)[number]) => {
    if (stage.isCompleted) return "completed" as const;
    if (stage.isCurrent) return "active" as const;
    return "pending" as const;
  };

  const stateClassMap: Record<string, string> = {
    critical: styles.stateCritical,
    low: styles.stateLow,
    progress: styles.stateProgress,
    good: styles.stateGood,
    strong: styles.stateStrong,
    complete: styles.stateComplete,
  };
  const currentStateClass = stateClassMap[setupData.progressState.state] || styles.stateProgress;
  const completedCount = setupData.stages.filter((s) => s.isCompleted).length;

  return (
    <>
      {/* ── LEFT: Main setup card (Production SaaS Desktop Card) ── */}
      <div className={`${styles.pcsMainCard} ${currentStateClass}`}>
        {/* Header */}
        <div className={styles.pcsHeader}>
          <div className={styles.pcsHeaderLeft}>
            <div className={styles.pcsLayersIconWrapper} title="Practice Setup">
              <Layers size={20} className={styles.pcsLayersIcon} />
            </div>
            <div className={styles.pcsTitleBlock}>
              <h2 className={styles.pcsTitle}>Complete Your Practice Setup</h2>
              <p className={styles.pcsSubtitle}>
                Finish the essentials required to receive enquiries, build client trust, and activate your public presence.
              </p>
            </div>
          </div>
          <div className={styles.pcsHeaderRight}>
            <CircularProgress percentage={setupData.totalPercentage} />
            <span className={styles.pcsProgressGaugeSubtext}>
              {completedCount} of {setupData.stages.length} steps completed
            </span>
          </div>
        </div>

        {/* Stepper */}
        <div className={styles.pcsStepperWrap}>
          {/* Connecting lines container */}
          <div className={styles.pcsDottedLinesContainer}>
            <svg className={styles.pcsDottedLinesSvg} width="100%" height="4" fill="none">
              <line
                x1="12.5%"
                y1="2"
                x2="37.5%"
                y2="2"
                stroke={setupData.stages[1].isCompleted || setupData.stages[1].isCurrent ? "#16a34a" : "#d1d5db"}
                strokeWidth="2"
                strokeDasharray="1 5"
                strokeLinecap="round"
              />
              <line
                x1="37.5%"
                y1="2"
                x2="62.5%"
                y2="2"
                stroke={setupData.stages[2].isCompleted || setupData.stages[2].isCurrent ? "#16a34a" : "#d1d5db"}
                strokeWidth="2"
                strokeDasharray="1 5"
                strokeLinecap="round"
              />
              <line
                x1="62.5%"
                y1="2"
                x2="87.5%"
                y2="2"
                stroke={setupData.stages[3].isCompleted || setupData.stages[3].isCurrent ? "#16a34a" : "#d1d5db"}
                strokeWidth="2"
                strokeDasharray="1 5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className={styles.pcsStepperGrid}>
            {setupData.stages.map((stage) => {
              const IconComp = STAGE_ICONS[stage.id];
              const stageState = getStageState(stage);
              return (
                <Link
                  key={stage.id}
                  href={stage.route}
                  className={`${styles.pcsStageCol} ${
                    stageState === "active"
                      ? styles.pcsStageColActive
                      : stageState === "completed"
                      ? styles.pcsStageColDone
                      : styles.pcsStageColPending
                  }`}
                  title={`${stage.title}: ${stage.isCompleted ? "Completed" : stage.missingRequirement}`}
                >
                  {/* Circle node */}
                  <div className={styles.pcsNodeWrap}>
                    <div className={styles.pcsNodeCircle}>
                      <IconComp size={18} />
                    </div>
                  </div>

                  {/* Label + badge */}
                  <span className={styles.pcsStageLabel}>{stage.title}</span>
                  <StageBadge state={stageState} />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Next action bar */}
        <div className={styles.pcsNextBar}>
          <div className={styles.pcsNextLeft}>
            <div className={styles.pcsNextIconWrap}>
              <ArrowRight size={14} className={styles.pcsNextArrowIcon} />
            </div>
            <div>
              <span className={styles.pcsNextEyebrow}>NEXT STEP</span>
              <p className={styles.pcsNextText}>{setupData.nextStepRequirement}</p>
            </div>
          </div>
          <Link
            href={setupData.nextStepRoute}
            className={styles.pcsContinueBtn}
            onClick={() => {
              if (setupData.isComplete) {
                practiceSetupService.acknowledgeCompletion();
              }
            }}
          >
            <span>{setupData.isComplete ? "View Profile" : "Continue Setup"}</span>
            <span className={styles.pcsBtnChevron}>&gt;</span>
          </Link>
        </div>
      </div>

    </>
  );
}
