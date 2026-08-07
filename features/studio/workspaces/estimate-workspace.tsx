"use client";

import React from "react";
import { EstimateTaskConfiguration, StudioOutputVersion, StudioTask } from "@/types/domain/studio";
import styles from "./studio-workspace.module.css";

export interface EstimateWorkspaceProps {
  task: StudioTask;
  version: StudioOutputVersion;
  readOnly?: boolean;
}

export function EstimateWorkspace({ task, version, readOnly }: EstimateWorkspaceProps) {
  const config = version.configurationSnapshot as EstimateTaskConfiguration;
  const area = config.totalAreaSqFt || 4500;
  const tierRateMap = { standard: 2800, premium: 4200, luxury: 6800 };
  const baseRate = tierRateMap[config.qualityTier] || 4200;

  const estimatedTotal = area * baseRate;

  const packageBreakdown = [
    { name: "Civil & Structural Shell", share: 0.35, amount: estimatedTotal * 0.35 },
    { name: "Interior Joinery & Millwork", share: 0.25, amount: estimatedTotal * 0.25 },
    { name: "MEP & Electrical Systems", share: 0.20, amount: estimatedTotal * 0.20 },
    { name: "Finishes, Flooring & Painting", share: 0.15, amount: estimatedTotal * 0.15 },
    { name: "Contingency & Site Management", share: 0.05, amount: estimatedTotal * 0.05 },
  ];

  return (
    <div className={styles.editorContainer}>
      <div className={styles.paramsSummaryRow}>
        <div className={styles.paramItem}>
          <span className={styles.paramLabel}>Total Project Area:</span>
          <span className={styles.paramVal}>{area.toLocaleString("en-IN")} sq ft</span>
        </div>
        <div className={styles.paramItem}>
          <span className={styles.paramLabel}>Quality Tier:</span>
          <span className={styles.paramVal}>{config.qualityTier?.toUpperCase() || "PREMIUM"}</span>
        </div>
        <div className={styles.paramItem}>
          <span className={styles.paramLabel}>Base Rate:</span>
          <span className={styles.paramVal}>₹ {baseRate.toLocaleString("en-IN")} / sq ft</span>
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.boqTable}>
          <thead>
            <tr>
              <th>Package Name</th>
              <th className={styles.textRight}>Allocation %</th>
              <th className={styles.textRight}>Est. Cost per Sq Ft (₹)</th>
              <th className={styles.textRight}>Package Budget (₹)</th>
            </tr>
          </thead>
          <tbody>
            {packageBreakdown.map((pkg, i) => (
              <tr key={i}>
                <td className={styles.descCell}>{pkg.name}</td>
                <td className={styles.textRight}>{(pkg.share * 100).toFixed(0)}%</td>
                <td className={styles.textRight}>{(baseRate * pkg.share).toFixed(0)}</td>
                <td className={styles.textRightFont}>₹ {pkg.amount.toLocaleString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.financialSummaryCard}>
        <div className={`${styles.finRow} ${styles.finRowTotal}`}>
          <span>Target Preliminary Estimate Total:</span>
          <span>₹ {estimatedTotal.toLocaleString("en-IN")}</span>
        </div>
      </div>
    </div>
  );
}
