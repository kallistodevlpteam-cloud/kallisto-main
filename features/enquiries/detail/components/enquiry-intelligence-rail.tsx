"use client";

import React, { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  ChevronRight,
  FileCheck2,
  HelpCircle,
  AlertTriangle,
  XCircle,
  FileText,
  Clock,
  ExternalLink,
} from "lucide-react";
import { EnquiryIntelligence } from "../../services/enquiry-intelligence";
import { EnquiryStage } from "../../types/enquiry.types";
import styles from "./enquiry-intelligence-rail.module.css";

export interface EnquiryIntelligenceRailProps {
  intelligence: EnquiryIntelligence;
  stage: EnquiryStage;
  onStageChange: (newStage: EnquiryStage) => void;
  onRequestClarification?: () => void;
  className?: string;
}

export function EnquiryIntelligenceRail({
  intelligence,
  stage,
  onStageChange,
  onRequestClarification,
  className,
}: EnquiryIntelligenceRailProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [showAcceptConfirm, setShowAcceptConfirm] = useState(false);

  const {
    requirementStrength,
    opportunityFit,
    proposalReadiness,
    criticalGaps,
    evidenceSummary,
    recommendedAction,
  } = intelligence;

  function navigateToTab(tabKey: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tabKey);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function handlePrimaryActionClick() {
    const actionType = recommendedAction.primaryAction.type;
    if (actionType === "request_clarification") {
      if (onRequestClarification) {
        onRequestClarification();
      } else {
        navigateToTab("clarifications");
      }
    } else if (actionType === "accept_enquiry") {
      setShowAcceptConfirm(true);
    } else if (actionType === "create_proposal" || actionType === "open_proposal") {
      router.push("/studio?intent=create_proposal");
    }
  }

  function handleConfirmAccept() {
    setShowAcceptConfirm(false);
    onStageChange("accepted");
  }

  const isPartial = proposalReadiness.state === "PARTIAL";

  return (
    <aside
      className={`${styles.railContainer}${className ? ` ${className}` : ""}`}
      aria-label="Enquiry Intelligence"
    >
      {/* Header */}
      <div className={styles.railHeader}>
        <h2 className={styles.railTitle}>ENQUIRY INTELLIGENCE</h2>
      </div>

      <div className={styles.railBody}>
        {/* ── 1. Requirement Strength ────────────────────────── */}
        <section className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Requirement Strength</span>
            <span className={styles.strengthBadge}>{requirementStrength.label}</span>
          </div>

          <div className={styles.scoreRow}>
            <span className={styles.scoreValue}>{requirementStrength.score}%</span>
            <span className={styles.signalsCount}>
              {requirementStrength.clearSignals} of {requirementStrength.totalSignals} clear
            </span>
          </div>

          <div className={styles.progressBarBg}>
            <div
              className={styles.progressBarFill}
              style={{ width: `${requirementStrength.score}%` }}
            />
          </div>

          <p className={styles.explanationText}>{requirementStrength.explanation}</p>
        </section>

        {/* ── 2. Opportunity Fit ────────────────────────────── */}
        <section className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Opportunity Fit</span>
            <span className={styles.fitBadge}>{opportunityFit.label}</span>
          </div>

          <div className={styles.scoreRow}>
            <span className={styles.scoreValue}>{opportunityFit.score}%</span>
            <span className={styles.confidenceText}>Confidence: {opportunityFit.confidence}</span>
          </div>

          <div className={styles.factorsList}>
            {opportunityFit.factors.map((factor) => (
              <div key={factor.key} className={styles.factorItem}>
                <span
                  className={`${styles.factorDot} ${
                    factor.status === "match"
                      ? styles.dotMatch
                      : factor.status === "partial"
                      ? styles.dotPartial
                      : styles.dotUnknown
                  }`}
                />
                <span className={styles.factorLabel}>{factor.label}</span>
                <span className={styles.factorReason}>{factor.reason}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── 3. Proposal Readiness ─────────────────────────── */}
        <section className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Proposal Readiness</span>
            <span
              className={`${styles.readinessBadge} ${
                isPartial ? styles.readinessPartial : styles.readinessReady
              }`}
            >
              {proposalReadiness.state}
            </span>
          </div>

          <p className={styles.readinessReason}>{proposalReadiness.reason}</p>
        </section>

        {/* ── 4. Critical Gaps ──────────────────────────────── */}
        <section className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Critical Gaps</span>
            <span className={styles.gapsCountBadge}>
              {criticalGaps.length} blocker{criticalGaps.length === 1 ? "" : "s"}
            </span>
          </div>

          <ul className={styles.gapsList}>
            {criticalGaps.map((gap, idx) => (
              <li key={idx} className={styles.gapItem}>
                <AlertTriangle size={13} className={styles.gapIcon} aria-hidden="true" />
                <span>{gap}</span>
              </li>
            ))}
          </ul>

          <button
            type="button"
            className={styles.textLinkBtn}
            onClick={() => navigateToTab("requirements")}
          >
            <span>Open Requirements</span>
            <ChevronRight size={14} />
          </button>
        </section>

        {/* ── 5. Project Evidence ────────────────────────────── */}
        <section className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Project Evidence</span>
            <FileCheck2 size={15} className={styles.evidenceIcon} />
          </div>

          <div className={styles.evidenceGrid}>
            <div className={styles.evidenceMetric}>
              <span className={styles.evidenceValue}>{evidenceSummary.siteImagesCount}</span>
              <span className={styles.evidenceLabel}>Site Images</span>
            </div>
            <div className={styles.evidenceMetric}>
              <span className={styles.evidenceValue}>{evidenceSummary.documentsCount}</span>
              <span className={styles.evidenceLabel}>Documents</span>
            </div>
            <div className={styles.evidenceMetric}>
              <span className={`${styles.evidenceValue} ${styles.textPositive}`}>
                {evidenceSummary.verifiedCount}
              </span>
              <span className={styles.evidenceLabel}>Verified</span>
            </div>
            <div className={styles.evidenceMetric}>
              <span className={`${styles.evidenceValue} ${styles.textWarning}`}>
                {evidenceSummary.needsVerificationCount}
              </span>
              <span className={styles.evidenceLabel}>Needs Review</span>
            </div>
          </div>

          <button
            type="button"
            className={styles.secondaryLinkBtn}
            onClick={() => navigateToTab("evidence")}
          >
            <span>View Site & Evidence</span>
            <ExternalLink size={13} />
          </button>
        </section>

        {/* ── 6. Recommended Next Action ──────────────────────── */}
        <section className={styles.actionCard}>
          <div className={styles.actionHeader}>
            <span className={styles.actionTitle}>RECOMMENDED NEXT ACTION</span>
          </div>

          <p className={styles.actionDesc}>{recommendedAction.primaryAction.description}</p>

          <div className={styles.actionButtonsGroup}>
            {/* Primary Action Button */}
            <button
              type="button"
              className={
                recommendedAction.primaryAction.type === "request_clarification"
                  ? styles.btnPrimaryClarification
                  : styles.btnPrimaryAccept
              }
              onClick={handlePrimaryActionClick}
            >
              {recommendedAction.primaryAction.type === "request_clarification" && (
                <HelpCircle size={15} />
              )}
              {recommendedAction.primaryAction.type === "accept_enquiry" && (
                <CheckCircle2 size={15} />
              )}
              {recommendedAction.primaryAction.type === "create_proposal" && (
                <FileText size={15} />
              )}
              {recommendedAction.primaryAction.type === "open_proposal" && (
                <FileText size={15} />
              )}
              <span>{recommendedAction.primaryAction.label}</span>
            </button>

            {/* Secondary Action Buttons */}
            {recommendedAction.secondaryActions.length > 0 && (
              <div className={styles.secondaryButtonsRow}>
                {recommendedAction.secondaryActions.map((sec) => {
                  if (sec.type === "accept_enquiry") {
                    return (
                      <button
                        key={sec.type}
                        type="button"
                        className={styles.btnSecondaryAccept}
                        onClick={() => setShowAcceptConfirm(true)}
                      >
                        <CheckCircle2 size={14} />
                        <span>Accept</span>
                      </button>
                    );
                  }
                  if (sec.type === "reject_enquiry") {
                    return (
                      <button
                        key={sec.type}
                        type="button"
                        className={styles.btnSecondaryReject}
                        onClick={() => onStageChange("rejected")}
                      >
                        <XCircle size={14} />
                        <span>Reject</span>
                      </button>
                    );
                  }
                  return (
                    <button
                      key={sec.type}
                      type="button"
                      className={styles.btnSecondaryGeneric}
                      onClick={() => navigateToTab("clarifications")}
                    >
                      <Clock size={14} />
                      <span>{sec.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Accept Confirmation Dialog */}
        {showAcceptConfirm && (
          <div className={styles.dialogOverlay}>
            <div className={styles.dialogBox} role="dialog" aria-modal="true">
              <h3 className={styles.dialogTitle}>Accept this Enquiry?</h3>
              <p className={styles.dialogDesc}>
                You are about to accept this enquiry and proceed with the client.
              </p>
              <div className={styles.dialogActions}>
                <button
                  type="button"
                  className={styles.dialogCancelBtn}
                  onClick={() => setShowAcceptConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={styles.dialogConfirmBtn}
                  onClick={handleConfirmAccept}
                >
                  Yes, Accept
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
