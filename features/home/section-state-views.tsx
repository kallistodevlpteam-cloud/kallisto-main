"use client";

import React from "react";
import { AlertCircle, Lock, RefreshCw, WifiOff } from "lucide-react";
import styles from "./home-workspace.module.css";

export function SectionSkeleton() {
  return (
    <div className={styles.sectionSkeletonWrap} aria-label="Loading section content">
      <div className={styles.skeletonLineHeader} />
      <div className={styles.skeletonCardRow}>
        <div className={styles.skeletonCard} />
        <div className={styles.skeletonCard} />
        <div className={styles.skeletonCard} />
      </div>
    </div>
  );
}

export function SectionErrorState({
  title = "Failed to load section data",
  onRetry,
}: {
  title?: string;
  onRetry?: () => void;
}) {
  return (
    <div className={styles.stateContainerError} role="alert">
      <AlertCircle size={24} className={styles.iconRed} />
      <div className={styles.stateTextStack}>
        <h4 className={styles.stateTitle}>{title}</h4>
        <p className={styles.stateMessage}>
          A temporary error occurred while fetching data from the repository.
        </p>
      </div>
      {onRetry && (
        <button type="button" onClick={onRetry} className={styles.btnRetry}>
          <RefreshCw size={14} />
          <span>Retry</span>
        </button>
      )}
    </div>
  );
}

export function SectionOfflineState({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className={styles.stateContainerOffline} role="alert">
      <WifiOff size={24} className={styles.iconAmber} />
      <div className={styles.stateTextStack}>
        <h4 className={styles.stateTitle}>Working Offline</h4>
        <p className={styles.stateMessage}>
          Displaying cached workspace records. Re-establish connection to sync updates.
        </p>
      </div>
      {onRetry && (
        <button type="button" onClick={onRetry} className={styles.btnRetry}>
          <RefreshCw size={14} />
          <span>Sync</span>
        </button>
      )}
    </div>
  );
}

export function SectionRestrictedState({
  reason = "Access to this section is restricted for your assigned role.",
}: {
  reason?: string;
}) {
  return (
    <div className={styles.stateContainerRestricted}>
      <Lock size={22} className={styles.iconGray} />
      <div className={styles.stateTextStack}>
        <h4 className={styles.stateTitle}>Permission Restricted</h4>
        <p className={styles.stateMessage}>{reason}</p>
      </div>
    </div>
  );
}

export function SectionStaleState({ onRefresh }: { onRefresh: () => void }) {
  return (
    <div className={styles.stateContainerStale}>
      <RefreshCw size={18} className={styles.iconAmber} />
      <div className={styles.stateTextStack}>
        <h4 className={styles.stateTitle}>Data Outdated</h4>
        <p className={styles.stateMessage}>
          This section has been modified by another workspace user.
        </p>
      </div>
      <button type="button" onClick={onRefresh} className={styles.btnRetry}>
        <span>Refresh Section</span>
      </button>
    </div>
  );
}
