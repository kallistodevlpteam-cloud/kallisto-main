"use client";

import { CheckCircle2, Clock3, HelpCircle, XCircle } from "lucide-react";
import React from "react";
import { BoqVariationStatus, ProjectBoqSnapshot } from "@/types/domain/project-boq";
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

export function VariationsView({ snapshot }: VariationsViewProps) {
  const approvedTotal = getApprovedVariationTotal(snapshot.variations);
  const pendingTotal = getPendingVariationTotal(snapshot.variations);
  const approvedRevisedTotal = snapshot.baseTotal + approvedTotal;
  const scenarioTotal = approvedRevisedTotal + pendingTotal;

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

      <dl className={styles.variationSummaryStrip}>
        <div className={styles.summaryCell}>
          <dt>Base BOQ</dt>
          <dd>{formatIndianCurrency(snapshot.baseTotal)}</dd>
        </div>
        <div className={styles.summaryCell}>
          <dt>Approved Variations</dt>
          <dd>{formatIndianCurrency(approvedTotal)}</dd>
        </div>
        <div className={styles.summaryCellHighlight}>
          <dt>Approved Revised Total</dt>
          <dd>{formatIndianCurrency(approvedRevisedTotal)}</dd>
        </div>
        <div className={styles.summaryCell}>
          <dt>Pending Variations</dt>
          <dd>{formatIndianCurrency(pendingTotal)}</dd>
        </div>
        <div className={styles.summaryCellScenario}>
          <dt>Scenario Total</dt>
          <dd>{formatIndianCurrency(scenarioTotal)}</dd>
        </div>
      </dl>

      <div className={styles.recordList}>
        {snapshot.variations.length > 0 ? (
          snapshot.variations.map((variation) => (
            <article key={variation.id} className={styles.variationRecordCard}>
              <div className={styles.recordMain}>
                <div className={styles.recordHeaderRow}>
                  <span className={styles.recordReference}>
                    {variation.reference}
                  </span>
                  <span
                    className={`${styles.statusBadge} ${getVariationStatusClass(
                      variation.status
                    )}`}
                  >
                    {variation.status}
                  </span>
                </div>
                <h4 className={styles.recordTitle}>{variation.title}</h4>
                <div className={styles.recordMetaLine}>
                  <span>
                    {variation.boqReference
                      ? `Linked to BOQ ${variation.boqReference}`
                      : "BOQ reference pending"}
                  </span>
                  <span>·</span>
                  <span>
                    Submitted by {variation.submittedBy} on{" "}
                    {formatDate(variation.submittedAt)}
                  </span>
                </div>
                <div className={styles.recordEvidenceRow}>
                  {variation.status === "Approved" ? (
                    <CheckCircle2 size={14} className={styles.evidenceIconSuccess} aria-hidden="true" />
                  ) : variation.status === "Rejected" ? (
                    <XCircle size={14} className={styles.evidenceIconDanger} aria-hidden="true" />
                  ) : variation.status === "Pending" || variation.status === "Submitted" ? (
                    <Clock3 size={14} className={styles.evidenceIconPending} aria-hidden="true" />
                  ) : (
                    <HelpCircle size={14} className={styles.evidenceIconMuted} aria-hidden="true" />
                  )}
                  <span className={styles.evidenceText}>
                    {variation.evidenceReference ?? "Not recorded"}
                  </span>
                </div>
              </div>

              <div className={styles.recordFinancialColumn}>
                <span className={styles.financialLabel}>Impact</span>
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
              </div>
            </article>
          ))
        ) : (
          <div className={styles.emptySupportingCell}>
            <span>No variations recorded for this project.</span>
          </div>
        )}
      </div>

      <footer className={styles.supportingFooter}>
        <p className={styles.governanceNote}>
          Only approved variations affect the approved revised contract total. Pending
          variations appear only in the scenario total. Rejected and withdrawn variations do
          not affect either total.
        </p>
      </footer>
    </section>
  );
}
