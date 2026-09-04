"use client";

import React from "react";
import { RequestSummaryMetrics } from "../../types/request-domain";
import styles from "./hands-requests.module.css";

interface HandsRequestsSummaryCardsProps {
  metrics: RequestSummaryMetrics;
}

function MetricBoxDuotoneIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L3 6.5L12 11L21 6.5L12 2Z" fill="currentColor" opacity="0.4" />
      <path d="M3 7.8V17.2L11.5 21.8V12.3L3 7.8Z" fill="currentColor" />
      <path d="M12.5 12.3V21.8L21 17.2V7.8L12.5 12.3Z" fill="currentColor" opacity="0.8" />
    </svg>
  );
}

function MetricBuildingDuotoneIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 6H20C21.1 6 22 6.9 22 8V20C22 21.1 21.1 22 20 22H14V6Z" fill="currentColor" opacity="0.38" />
      <path d="M2 22H14V4C14 2.9 13.1 2 12 2H4C2.9 2 2 2.9 2 4V22ZM5 6H8V8H5V6ZM5 10H8V12H5V10ZM5 14H8V16H5V14ZM5 18H8V20H5V18Z" fill="currentColor" />
    </svg>
  );
}

function MetricLayersDuotoneIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 17L12 22L22 17L12 12L2 17Z" fill="currentColor" opacity="0.32" />
      <path d="M2 12L12 17L22 12L12 7L2 12Z" fill="currentColor" opacity="0.55" />
      <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" />
    </svg>
  );
}

function MetricClockDuotoneIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.28" />
      <path d="M12 7V12L15.5 14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}

export function HandsRequestsSummaryCards({ metrics }: HandsRequestsSummaryCardsProps) {
  return (
    <section className={styles.summaryGrid} aria-label="Operational Summary">
      {/* Metric 1: New Requests */}
      <div className={styles.summaryCard}>
        <div className={styles.summaryIconBox} style={{ backgroundColor: "#fef3c7", color: "#b45309" }}>
          <MetricBoxDuotoneIcon size={18} />
        </div>
        <div className={styles.summaryTexts}>
          <span className={styles.summaryValue}>{metrics.newRequests}</span>
          <span className={styles.summaryLabel}>New Requests</span>
        </div>
      </div>

      {/* Metric 2: Workers Needed */}
      <div className={styles.summaryCard}>
        <div className={styles.summaryIconBox} style={{ backgroundColor: "#ecfdf5", color: "#059669" }}>
          <MetricBuildingDuotoneIcon size={18} />
        </div>
        <div className={styles.summaryTexts}>
          <span className={styles.summaryValue}>{metrics.workersNeeded}</span>
          <span className={styles.summaryLabel}>Workers Needed</span>
        </div>
      </div>

      {/* Metric 3: Can Fulfil */}
      <div className={styles.summaryCard}>
        <div className={styles.summaryIconBox} style={{ backgroundColor: "#eff6ff", color: "#2563eb" }}>
          <MetricLayersDuotoneIcon size={18} />
        </div>
        <div className={styles.summaryTexts}>
          <span className={styles.summaryValue}>{metrics.canFulfil}</span>
          <span className={styles.summaryLabel}>Can Fulfil</span>
        </div>
      </div>

      {/* Metric 4: Need Attention */}
      <div className={styles.summaryCard}>
        <div className={styles.summaryIconBox} style={{ backgroundColor: "#fff7ed", color: "#ea580c" }}>
          <MetricClockDuotoneIcon size={18} />
        </div>
        <div className={styles.summaryTexts}>
          <span className={styles.summaryValue}>{metrics.needAttention}</span>
          <span className={styles.summaryLabel}>Need Attention</span>
        </div>
      </div>
    </section>
  );
}
