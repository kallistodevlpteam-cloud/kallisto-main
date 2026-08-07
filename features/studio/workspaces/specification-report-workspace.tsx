"use client";

import React from "react";
import { SpecificationReportTaskConfiguration, StudioOutputVersion, StudioTask } from "@/types/domain/studio";
import styles from "./studio-workspace.module.css";

export interface SpecificationReportWorkspaceProps {
  task: StudioTask;
  version: StudioOutputVersion;
  readOnly?: boolean;
}

export function SpecificationReportWorkspace({ task, version, readOnly }: SpecificationReportWorkspaceProps) {
  const config = version.configurationSnapshot as SpecificationReportTaskConfiguration;

  return (
    <div className={styles.editorContainer}>
      <div className={styles.paramsSummaryRow}>
        <div className={styles.paramItem}>
          <span className={styles.paramLabel}>Report Category:</span>
          <span className={styles.paramVal}>{config.reportCategory?.toUpperCase() || "MATERIAL SPECIFICATION"}</span>
        </div>
        <div className={styles.paramItem}>
          <span className={styles.paramLabel}>Inspection Date:</span>
          <span className={styles.paramVal}>{config.siteVisitDate || "2026-07-22"}</span>
        </div>
        <div className={styles.paramItem}>
          <span className={styles.paramLabel}>Status:</span>
          <span className={styles.paramVal}>Verified Field Record</span>
        </div>
      </div>

      <div className={styles.proposalDocCard}>
        <h4 className={styles.docSectionTitle}>Field Observations &amp; Quality Notes</h4>
        <ul className={styles.docList}>
          {(config.observations || ["Site excavation completed on schedule.", "Concrete cube testing passed 28-day strength benchmark."]).map((obs, i) => (
            <li key={i}>{obs}</li>
          ))}
        </ul>

        <h4 className={styles.docSectionTitle}>Material Approved-Makes List</h4>
        <div className={styles.tableWrap}>
          <table className={styles.boqTable}>
            <thead>
              <tr>
                <th>Category</th>
                <th>Approved Brand / Make</th>
                <th>Grade / Specs</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Cement</td>
                <td>UltraTech / ACC Cement</td>
                <td>OPC 53 Grade</td>
              </tr>
              <tr>
                <td>Rebar Steel</td>
                <td>Tata Tiscon / JSW Neosteel</td>
                <td>Fe 550D TMT Rebar</td>
              </tr>
              <tr>
                <td>Plywood</td>
                <td>Greenply / CenturyPly</td>
                <td>BWP Marine Grade IS 710</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
