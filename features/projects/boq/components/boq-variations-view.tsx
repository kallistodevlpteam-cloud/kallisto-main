"use client";

import { CheckCircle2, Clock3, HelpCircle, Info, TrendingUp, XCircle } from "lucide-react";
import React from "react";
import { BoqVariationStatus, ProjectBoqSnapshot } from "@/types/domain/project-boq";
import {
  PaymentsDuotoneIcon,
  LayersDuotoneIcon,
  VariationsDuotoneIcon,
} from "@/components/layout/sidebar-icons";
import {
  formatIndianCurrency,
  getApprovedVariationTotal,
  getPendingVariationTotal,
} from "../services/project-boq-calculations";
import styles from "./project-boq-workspace.module.css";

interface VariationsViewProps {
  snapshot: ProjectBoqSnapshot;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function getVariationStatusClass(status: BoqVariationStatus): string {
  if (status === "Approved") {
    return styles.variationApproved;
  }
  if (status === "Pending" || status === "Submitted") {
    return styles.variationPending;
  }
  if (status === "Rejected") {
    return styles.statusAttention;
  }
  if (status === "Withdrawn") {
    return styles.variationWithdrawn;
  }
  return styles.variationDraft;
}

function getVariationIconConfig(status: BoqVariationStatus) {
  if (status === "Approved") {
    return {
      icon: CheckCircle2,
      bg: "#ECFDF5",
      color: "#059669",
      border: "#A7F3D0",
    };
  }
  if (status === "Pending" || status === "Submitted") {
    return {
      icon: Clock3,
      bg: "#FFFBEB",
      color: "#D97706",
      border: "#FDE68A",
    };
  }
  if (status === "Rejected") {
    return {
      icon: XCircle,
      bg: "#FEF2F2",
      color: "#DC2626",
      border: "#FECACA",
    };
  }
  return {
    icon: VariationsDuotoneIcon,
    bg: "#F8FAFC",
    color: "#475569",
    border: "#E2E8F0",
  };
}

export function VariationsView({ snapshot }: VariationsViewProps) {
  const approvedTotal = getApprovedVariationTotal(snapshot.variations);
  const pendingTotal = getPendingVariationTotal(snapshot.variations);
  const approvedRevisedTotal = snapshot.baseTotal + approvedTotal;
  const scenarioTotal = approvedRevisedTotal + pendingTotal;
  const hasRecords = snapshot.variations.length > 0;

  return (
    <section className={styles.supportingView} aria-labelledby="variations-title">
      <div className={styles.supportingViewHeader}>
        <div>
          <h3 id="variations-title">Variations</h3>
          <p>Controlled commercial scope changes linked to this project BOQ.</p>
        </div>
        <span className={styles.supportingRecordCount}>
          {snapshot.variations.length} records
        </span>
      </div>

      <dl className={styles.variationSummaryStrip} aria-label="Variation totals">
        <div className={styles.summaryCard}>
          <div className={styles.summaryIconBox} style={{ backgroundColor: "#EEF2FF", color: "#4F46E5" }}>
            <PaymentsDuotoneIcon size={18} aria-hidden="true" />
          </div>
          <div className={styles.summaryCardContent}>
            <dt>Base BOQ</dt>
            <dd>{formatIndianCurrency(snapshot.baseTotal)}</dd>
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryIconBox} style={{ backgroundColor: "#ECFDF5", color: "#059669" }}>
            <CheckCircle2 size={18} aria-hidden="true" />
          </div>
          <div className={styles.summaryCardContent}>
            <dt>Approved Variations</dt>
            <dd style={{ color: "#059669" }}>{formatIndianCurrency(approvedTotal)}</dd>
          </div>
        </div>

        <div className={`${styles.summaryCard} ${styles.summaryCardHighlight}`}>
          <div className={styles.summaryIconBox} style={{ backgroundColor: "#F5F3FF", color: "#7C3AED" }}>
            <LayersDuotoneIcon size={18} aria-hidden="true" />
          </div>
          <div className={styles.summaryCardContent}>
            <dt>Approved Revised Total</dt>
            <dd>{formatIndianCurrency(approvedRevisedTotal)}</dd>
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryIconBox} style={{ backgroundColor: "#FFFBEB", color: "#D97706" }}>
            <Clock3 size={18} aria-hidden="true" />
          </div>
          <div className={styles.summaryCardContent}>
            <dt>Pending Variations</dt>
            <dd style={{ color: "#d97706" }}>{formatIndianCurrency(pendingTotal)}</dd>
          </div>
        </div>

        <div className={`${styles.summaryCard} ${styles.summaryCardScenario}`}>
          <div className={styles.summaryIconBox} style={{ backgroundColor: "#EFF6FF", color: "#2563EB" }}>
            <TrendingUp size={18} aria-hidden="true" />
          </div>
          <div className={styles.summaryCardContent}>
            <dt>Scenario Total</dt>
            <dd>{formatIndianCurrency(scenarioTotal)}</dd>
          </div>
        </div>
      </dl>

      <div className={styles.supportingTableScroller}>
        <table className={styles.supportingTable}>
          <thead>
            <tr>
              <th className={styles.varColRef}>Ref</th>
              <th className={styles.varColTitle}>Title & Scope</th>
              <th className={styles.varColStatus}>Status</th>
              <th className={styles.varColAuthor}>Submitted By</th>
              <th className={styles.varColEvidence}>Evidence</th>
              <th className={styles.varColImpact}>Impact</th>
            </tr>
          </thead>
          <tbody>
            {hasRecords ? (
              snapshot.variations.map((variation) => (
                <tr key={variation.id} className={styles.supportingTableRow}>
                  <td className={styles.varColRef}>
                    <span className={styles.recordReference}>
                      {variation.reference}
                    </span>
                  </td>
                  <td className={styles.varColTitle}>
                    <div className={styles.tableTitleCell}>
                      <span className={styles.tableTitleText}>{variation.title}</span>
                      {variation.boqReference && (
                        <span className={styles.boqScopePill}>
                          Linked to BOQ {variation.boqReference}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className={styles.varColStatus}>
                    <span
                      className={`${styles.statusBadge} ${getVariationStatusClass(
                        variation.status
                      )}`}
                    >
                      <span className={styles.statusDot} aria-hidden="true" />
                      {variation.status}
                    </span>
                  </td>
                  <td className={styles.varColAuthor}>
                    <div className={styles.tableAuthorCell}>
                      <span className={styles.tableAuthorName}>{variation.submittedBy}</span>
                      <span className={styles.tableDateText}>
                        {formatDate(variation.submittedAt)}
                      </span>
                    </div>
                  </td>
                  <td className={styles.varColEvidence}>
                    <div className={styles.evidenceInline}>
                      {variation.status === "Approved" ? (
                        <CheckCircle2 size={13} className={styles.evidenceIconSuccess} aria-hidden="true" />
                      ) : variation.status === "Rejected" ? (
                        <XCircle size={13} className={styles.evidenceIconDanger} aria-hidden="true" />
                      ) : variation.status === "Pending" || variation.status === "Submitted" ? (
                        <Clock3 size={13} className={styles.evidenceIconPending} aria-hidden="true" />
                      ) : (
                        <HelpCircle size={13} className={styles.evidenceIconMuted} aria-hidden="true" />
                      )}
                      <span>{variation.evidenceReference ?? "Not recorded"}</span>
                    </div>
                  </td>
                  <td className={styles.varColImpact}>
                    <strong
                      className={`${styles.financialValue} ${
                        variation.financialImpact < 0
                          ? styles.impactNegative
                          : variation.financialImpact > 0
                          ? styles.impactPositive
                          : ""
                      }`}
                    >
                      {formatIndianCurrency(variation.financialImpact)}
                    </strong>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className={styles.emptySupportingCell}>
                  <span>No variations recorded for this project.</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <footer className={styles.supportingFooter}>
        <div className={styles.governanceBox}>
          <Info size={15} className={styles.governanceIcon} aria-hidden="true" />
          <p className={styles.governanceNote}>
            Only approved variations affect the approved revised contract total. Pending
            variations appear only in the scenario total. Rejected and withdrawn variations do
            not affect either total.
          </p>
        </div>
      </footer>
    </section>
  );
}
