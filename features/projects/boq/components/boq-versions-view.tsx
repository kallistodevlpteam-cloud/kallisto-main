"use client";

import { FileLock2, Info } from "lucide-react";
import { VersionsDuotoneIcon } from "@/components/layout/sidebar-icons";
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

function getStatusBadgeStyle(status: string) {
  switch (status.toLowerCase()) {
    case "approved":
      return {
        badge: styles.statusApproved,
        dot: styles.statusDotGreen,
      };
    case "reviewed":
      return {
        badge: styles.versionReviewed,
        dot: styles.statusDotBlue,
      };
    case "draft":
    default:
      return {
        badge: styles.versionDraft,
        dot: styles.statusDotMuted,
      };
  }
}

export function VersionsView({
  snapshot,
  selectedVersionId,
  onSelectVersion,
}: VersionsViewProps) {
  const hasRecords = snapshot.versions.length > 0;

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

      <div className={styles.supportingTableScroller}>
        <table className={styles.supportingTable}>
          <thead>
            <tr>
              <th className={styles.verColVersion}>Version</th>
              <th className={styles.verColStatus}>Status</th>
              <th className={styles.verColNote}>Revision Scope</th>
              <th className={styles.verColAuthor}>Created By</th>
              <th className={styles.verColTotal}>Total Amount</th>
              <th className={styles.verColAction}>Action</th>
            </tr>
          </thead>
          <tbody>
            {hasRecords ? (
              snapshot.versions.map((version) => {
                const isSelected = version.id === selectedVersionId;
                const statusConfig = getStatusBadgeStyle(version.status);

                return (
                  <tr key={version.id} className={styles.supportingTableRow}>
                    <td className={styles.verColVersion}>
                      <div className={styles.versionCellFlex}>
                        <div
                          className={`${styles.versionIconBoxSmall} ${
                            version.isLocked
                              ? styles.versionIconLocked
                              : styles.versionIconCurrent
                          }`}
                        >
                          {version.isLocked ? (
                            <FileLock2 size={14} aria-hidden="true" />
                          ) : (
                            <VersionsDuotoneIcon size={15} aria-hidden="true" />
                          )}
                        </div>
                        <div className={styles.versionLabelGroup}>
                          <span className={styles.tableTitleText}>
                            {version.label}
                          </span>
                          {version.isCurrent && (
                            <span className={styles.currentBadge}>Current</span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className={styles.verColStatus}>
                      <span className={`${styles.statusBadge} ${statusConfig.badge}`}>
                        <span
                          className={`${styles.statusDot} ${statusConfig.dot}`}
                          aria-hidden="true"
                        />
                        {version.status}
                      </span>
                    </td>

                    <td className={styles.verColNote}>
                      <span className={styles.versionTableNote} title={version.note}>
                        {version.note}
                      </span>
                    </td>

                    <td className={styles.verColAuthor}>
                      <span className={styles.tableAuthorSingleLine}>
                        {version.createdBy} · {formatDate(version.createdAt)}
                      </span>
                    </td>

                    <td className={styles.verColTotal}>
                      <strong className={styles.versionTableTotal}>
                        {formatIndianCurrency(version.total)}
                      </strong>
                    </td>

                    <td className={styles.verColAction}>
                      <button
                        type="button"
                        className={
                          isSelected
                            ? styles.selectedVersionBtn
                            : styles.inspectVersionBtn
                        }
                        onClick={() => onSelectVersion(version.id)}
                      >
                        {version.isCurrent ? "View" : "Inspect"}
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className={styles.emptyTableState}>
                  No versions recorded yet.
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
            Approved and reviewed versions are locked. Corrections require a new
            controlled revision so prior quantities, rates and approvals remain intact.
          </p>
        </div>
      </footer>
    </section>
  );
}
