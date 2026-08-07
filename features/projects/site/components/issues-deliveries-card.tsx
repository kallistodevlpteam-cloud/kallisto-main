"use client";

import { useState } from "react";
import { PackageCheck, TriangleAlert } from "lucide-react";
import { SiteDelivery, SiteIssue } from "../types/site.types";
import {
  formatDeliveryStatus,
  formatIssueStatus,
} from "../utils/site-formatters";
import {
  getDeliveryStatusTone,
  getIssueSeverityTone,
  SiteStatusTone,
} from "../utils/site-status";
import styles from "./project-site-workspace.module.css";

type RegisterView = "issues" | "deliveries";

interface IssuesDeliveriesCardProps {
  issues: SiteIssue[];
  deliveries: SiteDelivery[];
}

function toneClassName(tone: SiteStatusTone): string {
  const toneClasses: Record<SiteStatusTone, string> = {
    neutral: styles.statusNeutral,
    active: styles.statusActive,
    warning: styles.statusWarning,
    danger: styles.statusDanger,
    success: styles.statusSuccess,
  };

  return toneClasses[tone];
}

export function IssuesDeliveriesCard({
  issues,
  deliveries,
}: IssuesDeliveriesCardProps) {
  const [activeView, setActiveView] = useState<RegisterView>("issues");

  return (
    <article className={`${styles.card} ${styles.registerCard}`}>
      <div className={styles.registerHeader}>
        <div>
          <h3>Field Registers</h3>
          <p>Open constraints and today&apos;s material movement</p>
        </div>

        <div
          className={styles.registerSegmentedControl}
          role="tablist"
          aria-label="Field registers"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeView === "issues"}
            className={
              activeView === "issues"
                ? styles.registerSegmentActive
                : styles.registerSegment
            }
            onClick={() => setActiveView("issues")}
          >
            <TriangleAlert size={14} aria-hidden="true" />
            Open Issues
            <span>{issues.length}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeView === "deliveries"}
            className={
              activeView === "deliveries"
                ? styles.registerSegmentActive
                : styles.registerSegment
            }
            onClick={() => setActiveView("deliveries")}
          >
            <PackageCheck size={14} aria-hidden="true" />
            Deliveries
            <span>{deliveries.length}</span>
          </button>
        </div>
      </div>

      <div className={styles.tableScroller}>
        {activeView === "issues" ? (
          <table className={styles.registerTable}>
            <caption className="sr-only">Open site issues</caption>
            <thead>
              <tr>
                <th>Issue</th>
                <th>Severity</th>
                <th>Location</th>
                <th>Owner</th>
                <th>Age</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {issues.map((issue) => (
                <tr key={issue.id}>
                  <td>
                    <strong>{issue.title}</strong>
                  </td>
                  <td>
                    <span
                      className={`${styles.statusBadge} ${toneClassName(
                        getIssueSeverityTone(issue.severity),
                      )}`}
                    >
                      {issue.severity}
                    </span>
                  </td>
                  <td>{issue.location}</td>
                  <td>{issue.ownerName}</td>
                  <td>{issue.age}</td>
                  <td>{formatIssueStatus(issue.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className={styles.registerTable}>
            <caption className="sr-only">Site deliveries</caption>
            <thead>
              <tr>
                <th>Material</th>
                <th>Supplier</th>
                <th>Expected time</th>
                <th>Quantity</th>
                <th>Receiving person</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map((delivery) => (
                <tr key={delivery.id}>
                  <td>
                    <strong>{delivery.material}</strong>
                  </td>
                  <td>{delivery.supplier}</td>
                  <td>{delivery.expectedTime}</td>
                  <td>{delivery.quantity}</td>
                  <td>{delivery.receivingPerson}</td>
                  <td>
                    <span
                      className={`${styles.statusBadge} ${toneClassName(
                        getDeliveryStatusTone(delivery.status),
                      )}`}
                    >
                      {formatDeliveryStatus(delivery.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </article>
  );
}
