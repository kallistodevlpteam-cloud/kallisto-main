"use client";

import React from "react";
import { ProposalTaskConfiguration, StudioOutputVersion, StudioTask } from "@/types/domain/studio";
import styles from "./studio-workspace.module.css";

export interface ProposalWorkspaceProps {
  task: StudioTask;
  version: StudioOutputVersion;
  readOnly?: boolean;
}

export function ProposalWorkspace({ task, version, readOnly }: ProposalWorkspaceProps) {
  const config = version.configurationSnapshot as ProposalTaskConfiguration;

  return (
    <div className={styles.editorContainer}>
      <div className={styles.paramsSummaryRow}>
        <div className={styles.paramItem}>
          <span className={styles.paramLabel}>Document Type:</span>
          <span className={styles.paramVal}>{config.documentType || "Project Proposal"}</span>
        </div>
        <div className={styles.paramItem}>
          <span className={styles.paramLabel}>Target Audience:</span>
          <span className={styles.paramVal}>{config.targetAudience || "Client Executive Board"}</span>
        </div>
        <div className={styles.paramItem}>
          <span className={styles.paramLabel}>Branding:</span>
          <span className={styles.paramVal}>{config.applyWorkspaceBranding ? "Kallisto Verified Template" : "Standard"}</span>
        </div>
      </div>

      <div className={styles.proposalDocCard}>
        <h4 className={styles.docSectionTitle}>1. Executive Summary &amp; Project Scope</h4>
        <p className={styles.docParagraph}>
          This proposal outlines the architectural design, space planning, procurement guidelines, and interior execution strategy for {task.projectName}.
        </p>

        <h4 className={styles.docSectionTitle}>2. Fee Structure &amp; Payment Milestones</h4>
        <ul className={styles.docList}>
          <li><strong>Concept Design Phase (15%):</strong> Sign-off on spatial layouts and mood boards.</li>
          <li><strong>Design Development Phase (35%):</strong> Detailed 3D renders, material specs, and preliminary estimates.</li>
          <li><strong>Working Drawings &amp; BOQ Phase (35%):</strong> Complete GFC drawings, BOQ, rate analysis, and contractor tender docs.</li>
          <li><strong>Handover &amp; Site Supervision (15%):</strong> Periodic site visits and completion certification.</li>
        </ul>
      </div>
    </div>
  );
}
