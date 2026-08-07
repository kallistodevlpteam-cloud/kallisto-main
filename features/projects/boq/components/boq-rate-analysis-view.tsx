"use client";

import React from "react";
import { ProjectBoqSnapshot } from "@/types/domain/project-boq";
import { formatIndianCurrency } from "../services/project-boq-calculations";
import styles from "./project-boq-workspace.module.css";

interface RateAnalysisViewProps {
  snapshot: ProjectBoqSnapshot;
}

export function RateAnalysisView({ snapshot }: RateAnalysisViewProps) {
  const hasRecords = snapshot.rateAnalysis.length > 0;

  return (
    <section className={styles.supportingView} aria-labelledby="rate-analysis-title">
      <div className={styles.supportingViewHeader}>
        <div>
          <h3 id="rate-analysis-title">Rate Analysis</h3>
          <p>Cost composition breakdown for measured work items in the current BOQ version.</p>
        </div>
        <span className={styles.supportingRecordCount}>
          {snapshot.rateAnalysis.length} analysed rates
        </span>
      </div>

      <div className={styles.supportingTableScroller}>
        <table className={styles.supportingTable}>
          <thead>
            <tr>
              <th className={styles.rateItemCol}>Item</th>
              <th className={styles.rateDescCol}>Description</th>
              <th className={styles.rateNumericCol}>Material</th>
              <th className={styles.rateNumericCol}>Labour</th>
              <th className={styles.rateNumericCol}>Plant</th>
              <th className={styles.rateNumericCol}>Overhead</th>
              <th className={styles.rateTotalCol}>Total Rate</th>
            </tr>
          </thead>
          <tbody>
            {hasRecords ? (
              snapshot.rateAnalysis.map((rate) => (
                <tr key={rate.id} className={styles.supportingTableRow}>
                  <td className={styles.rateItemCol}>
                    <span className={styles.sectionBadge}>{rate.itemCode}</span>
                  </td>
                  <td className={styles.rateDescCol} title={rate.itemDescription}>
                    {rate.itemDescription}
                  </td>
                  <td className={styles.numericCell}>
                    {formatIndianCurrency(rate.material)}
                  </td>
                  <td className={styles.numericCell}>
                    {formatIndianCurrency(rate.labour)}
                  </td>
                  <td className={styles.numericCell}>
                    {formatIndianCurrency(rate.plant)}
                  </td>
                  <td className={styles.numericCell}>
                    {formatIndianCurrency(rate.overhead)}
                  </td>
                  <td className={styles.rateTotalCell}>
                    <strong>{formatIndianCurrency(rate.totalRate)}</strong>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className={styles.emptySupportingCell}>
                  <span>No rate analysis breakdown records available for this version.</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <footer className={styles.supportingFooter}>
        <p className={styles.governanceNote}>
          Rate components are version-bound. Changes to an approved rate require a
          controlled BOQ revision.
        </p>
      </footer>
    </section>
  );
}
