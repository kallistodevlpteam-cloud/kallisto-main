"use client";

import { ExternalLink, PanelRightClose } from "lucide-react";
import Link from "next/link";
import React, { useEffect } from "react";
import { BoqItem, BoqSection, BoqSubsection } from "@/types/domain/project-boq";
import {
  formatBoqNumber,
  formatIndianCurrency,
  isMissingBoqValue,
} from "../services/project-boq-calculations";
import styles from "./project-boq-workspace.module.css";

interface BoqItemInspectorProps {
  item: BoqItem;
  section: BoqSection | undefined;
  subsection?: BoqSubsection | null;
  versionLabel: string;
  projectId?: string;
  versionId?: string;
  onClose: () => void;
}

export function BoqItemInspector({
  item,
  section,
  subsection,
  versionLabel,
  projectId,
  versionId,
  onClose,
}: BoqItemInspectorProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function getStatusClass(status: string): string {
    if (status === "Approved") {
      return styles.statusApproved;
    }
    if (status === "Reviewed") {
      return styles.statusReviewed;
    }
    if (status === "Needs attention") {
      return styles.statusAttention;
    }
    return styles.statusDraft;
  }

  const studioItemUrl =
    projectId && versionId
      ? `/studio?projectId=${encodeURIComponent(
          projectId
        )}&intent=edit-boq-item&versionId=${encodeURIComponent(
          versionId
        )}&itemId=${encodeURIComponent(item.id)}`
      : null;

  return (
    <>
      <div className={styles.drawerBackdrop} onClick={onClose} />
      <aside
        className={styles.inspectorDrawer}
        role="dialog"
        aria-modal="true"
        aria-labelledby="boq-item-inspector-title"
      >
        <header className={styles.drawerHeader}>
          <div>
            <span className={styles.inspectorSubhead}>Item Inspection</span>
            <h3 id="boq-item-inspector-title" className={styles.inspectorTitleCode}>
              {item.code}
            </h3>
          </div>
          <button
            type="button"
            className={styles.rowIconButton}
            aria-label="Close item inspector"
            onClick={onClose}
          >
            <PanelRightClose size={15} aria-hidden="true" />
          </button>
        </header>

        <div className={styles.drawerBody}>
          <p className={styles.inspectorDescription}>{item.description}</p>

          <div className={styles.inspectorStatusRow}>
            <span className={styles.inspectorLabel}>Status</span>
            <span
              className={`${styles.statusBadge} ${getStatusClass(
                item.status
              )}`}
            >
              {item.status}
            </span>
          </div>

          <dl className={styles.inspectorFactsGrid}>
            <div className={styles.inspectorFact}>
              <dt>Section</dt>
              <dd>
                {section ? `${section.code} · ${section.title}` : "—"}
              </dd>
            </div>
            <div className={styles.inspectorFact}>
              <dt>Subsection</dt>
              <dd>
                {subsection
                  ? `${subsection.code} · ${subsection.title}`
                  : "Direct section item"}
              </dd>
            </div>
            <div className={styles.inspectorFact}>
              <dt>Unit</dt>
              <dd>{item.unit}</dd>
            </div>
            <div className={styles.inspectorFact}>
              <dt>Quantity</dt>
              <dd>
                {isMissingBoqValue(item.quantity)
                  ? "Missing"
                  : formatBoqNumber(item.quantity)}
              </dd>
            </div>
            <div className={styles.inspectorFact}>
              <dt>Rate</dt>
              <dd>
                {isMissingBoqValue(item.rate)
                  ? "Missing"
                  : formatIndianCurrency(item.rate)}
              </dd>
            </div>
            <div className={styles.inspectorFactFull}>
              <dt>Amount</dt>
              <dd className={styles.inspectorAmountValue}>
                {item.amount === null
                  ? "Not calculated"
                  : formatIndianCurrency(item.amount)}
              </dd>
            </div>
            <div className={styles.inspectorFactFull}>
              <dt>Last updated</dt>
              <dd>
                {new Intl.DateTimeFormat("en-IN", {
                  dateStyle: "medium",
                }).format(new Date(item.lastUpdatedAt))}
              </dd>
            </div>
          </dl>

          {item.notes && (
            <div className={styles.inspectorNote}>
              <span>Estimator note</span>
              <p>{item.notes}</p>
            </div>
          )}

          <div className={styles.inspectorAudit}>
            <span>Version record</span>
            <p>
              {versionLabel}, updated by {item.lastUpdatedBy}
            </p>
          </div>

          {studioItemUrl && (
            <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid #e2e8f0" }}>
              <Link
                href={studioItemUrl}
                className={styles.secondaryButton}
                style={{ width: "100%", justifyContent: "center", textDecoration: "none" }}
              >
                <span>Edit in Hive Studio</span>
                <ExternalLink size={13} aria-hidden="true" />
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
