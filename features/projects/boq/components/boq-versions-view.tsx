"use client";

import { FileLock2, GitBranch } from "lucide-react";
import React from "react";
import { ProjectBoqSnapshot } from "@/types/domain/project-boq";
import { formatIndianCurrency } from "../services/project-boq-calculations";
import styles from "./project-boq-workspace.module.css";

interface VersionsViewProps {
  snapshot: ProjectBoqSnapshot;
  selectedVersionId: string;
  onSelectVersion: (versionId: string) => void;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export function VersionsView({
  snapshot,
  selectedVersionId,
  onSelectVersion,
}: VersionsViewProps) {
  return (
    <section className={styles.supportingView} aria-labelledby="versions-title">
      <div className={styles.supportingViewHeader}>
        <div>
          <h3 id="versions-title">Version Governance</h3>
          <p>Immutable revision history for review and approval traceability.</p>
        </div>
        <span className={styles.supportingRecordCount}>
          {snapshot.versions.length} versions
        </span>
      </div>

      <div className={styles.versionList}>
        {snapshot.versions.map((version) => {
          const isSelected = version.id === selectedVersionId;
          return (
            <article
              key={version.id}
              className={`${styles.versionRecordCard} ${
                isSelected ? styles.versionRecordSelected : ""
              }`}
            >
              <div className={styles.versionIconCell}>
                {version.isLocked ? (
                  <FileLock2 size={16} className={styles.iconLocked} aria-hidden="true" />
                ) : (
                  <GitBranch size={16} className={styles.iconCurrent} aria-hidden="true" />
                )}
              </div>

              <div className={styles.versionContent}>
                <div className={styles.versionTitleRow}>
                  <h4 className={styles.versionLabel}>{version.label}</h4>
                  <span className={`${styles.statusBadge} ${styles.statusApproved}`}>
                    {version.status}
                  </span>
                  {version.isCurrent && (
                    <span className={styles.currentBadge}>Current</span>
                  )}
                  {version.isLocked && (
                    <span className={styles.lockedBadge}>Locked</span>
                  )}
                </div>
                <p className={styles.versionNote}>{version.note}</p>
                <span className={styles.versionMeta}>
                  Created by {version.createdBy} · {formatDate(version.createdAt)}
                </span>
              </div>

              <div className={styles.versionRightCol}>
                <strong className={styles.versionTotal}>
                  {formatIndianCurrency(version.total)}
                </strong>
                <button
                  type="button"
                  className={`${styles.secondaryButton} ${
                    isSelected ? styles.selectedVersionBtn : ""
                  }`}
                  onClick={() => onSelectVersion(version.id)}
                >
                  {version.isCurrent ? "View version" : "Inspect"}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <footer className={styles.supportingFooter}>
        <p className={styles.governanceNote}>
          Approved and reviewed versions are locked. Corrections require a new controlled
          revision so prior quantities, rates and approvals remain intact.
        </p>
      </footer>
    </section>
  );
}
