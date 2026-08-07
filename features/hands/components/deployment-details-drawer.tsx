"use client";

import {
  CalendarClock,
  HardHat,
  IndianRupee,
  MapPin,
  UserRound,
  X,
} from "lucide-react";
import { useRef } from "react";
import type { Deployment, HandsTab } from "../types/hands.types";
import {
  formatAttendance,
  formatInr,
} from "../utils/hands-formatters";
import { useDrawerBehaviour } from "./use-drawer-behaviour";
import styles from "./hands-overview.module.css";

interface DeploymentDetailsDrawerProps {
  deployment: Deployment;
  onClose: () => void;
  onNavigateTab: (tab: HandsTab) => void;
}

export function DeploymentDetailsDrawer({
  deployment,
  onClose,
  onNavigateTab,
}: DeploymentDetailsDrawerProps) {
  const panelRef = useRef<HTMLElement>(null);
  useDrawerBehaviour(panelRef, onClose);

  const statusClass =
    deployment.status === "Active"
      ? styles.statusActive
      : deployment.status === "Needs attention"
        ? styles.statusAttention
        : styles.statusWaiting;

  return (
    <div
      className={styles.drawerBackdrop}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <aside
        ref={panelRef}
        className={styles.drawer}
        role="dialog"
        aria-modal="true"
        aria-labelledby="deployment-drawer-title"
        aria-describedby="deployment-drawer-description"
        tabIndex={-1}
      >
        <header className={styles.drawerHeader}>
          <div>
            <p>Active deployment</p>
            <h2 id="deployment-drawer-title">{deployment.projectName}</h2>
            <span id="deployment-drawer-description">
              {deployment.location}
            </span>
          </div>
          <button
            type="button"
            className={styles.drawerCloseButton}
            aria-label="Close deployment details"
            onClick={onClose}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        <div className={styles.drawerBody}>
          <div className={styles.drawerStatusRow}>
            <span className={`${styles.statusBadge} ${statusClass}`}>
              <span className={styles.statusDot} aria-hidden="true" />
              {deployment.status}
            </span>
            <span>
              {deployment.startDate} – {deployment.endDate}
            </span>
          </div>

          <section
            className={styles.detailSection}
            aria-labelledby="deployment-assignment-title"
          >
            <h3 id="deployment-assignment-title">Site assignment</h3>
            <dl className={styles.detailList}>
              <div>
                <dt>
                  <MapPin size={15} aria-hidden="true" />
                  Project site
                </dt>
                <dd>
                  {deployment.projectName}, {deployment.location}
                </dd>
              </div>
              <div>
                <dt>
                  <HardHat size={15} aria-hidden="true" />
                  Workforce
                </dt>
                <dd>{deployment.workforce}</dd>
              </div>
              <div>
                <dt>
                  <CalendarClock size={15} aria-hidden="true" />
                  Shift
                </dt>
                <dd>{deployment.shift}</dd>
              </div>
              <div>
                <dt>
                  <UserRound size={15} aria-hidden="true" />
                  Supervisor
                </dt>
                <dd>{deployment.supervisor}</dd>
              </div>
              <div>
                <dt>Attendance today</dt>
                <dd>{formatAttendance(deployment.attendance)}</dd>
              </div>
              <div>
                <dt>
                  <IndianRupee size={15} aria-hidden="true" />
                  Daily cost
                </dt>
                <dd>{formatInr(deployment.dailyCost)}</dd>
              </div>
            </dl>
          </section>

          {deployment.status === "Needs attention" ? (
            <div className={styles.drawerNotice} role="status">
              Two workers have not checked in. Review today&apos;s attendance
              before confirming the daily record.
            </div>
          ) : null}
        </div>

        <footer className={styles.drawerFooter}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => {
              onClose();
              onNavigateTab("deployments");
            }}
          >
            View deployment
          </button>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => {
              onClose();
              onNavigateTab("attendance");
            }}
          >
            Record attendance
          </button>
        </footer>
      </aside>
    </div>
  );
}
