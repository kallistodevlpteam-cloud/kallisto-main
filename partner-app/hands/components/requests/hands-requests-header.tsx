"use client";

import React from "react";
import styles from "./hands-requests.module.css";

export function HandsRequestsHeader() {
  return (
    <header className={styles.pageHeader}>
      <div>
        <div className={styles.titleRow}>
          <h1 className={styles.pageTitle}>Requests</h1>
          <div className={styles.liveBadge} aria-label="Live Workforce Demand Status">
            <span className={styles.liveDot} />
            <span>Live</span>
          </div>
        </div>
        <p className={styles.pageSubtitle}>
          Review incoming workforce requirements and respond to project demands.
        </p>
      </div>
    </header>
  );
}
