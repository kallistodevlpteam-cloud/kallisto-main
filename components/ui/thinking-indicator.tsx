"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Sparkles, Check, Dot } from "lucide-react";
import styles from "./thinking-indicator.module.css";

export interface ThinkingStep {
  id?: string;
  label: string;
  status?: "pending" | "active" | "completed";
}

export interface ThinkingIndicatorProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "content"> {
  active?: boolean;
  variant?: "dots" | "spinner" | "pulse" | "shimmer";
  label?: string;
  showElapsed?: boolean;
  steps?: ThinkingStep[] | string[];
}

export function ThinkingIndicator({
  active = true,
  variant = "dots",
  label = "Thinking...",
  showElapsed = false,
  steps,
  className = "",
  ...props
}: ThinkingIndicatorProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!active || !showElapsed) {
      setElapsedSeconds(0);
      return;
    }

    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [active, showElapsed]);

  if (!active) return null;

  const normalizedSteps: ThinkingStep[] = steps
    ? steps.map((s, idx) =>
        typeof s === "string"
          ? { id: `step-${idx}`, label: s, status: idx === 0 ? "active" : "pending" }
          : { id: s.id || `step-${idx}`, label: s.label, status: s.status || "pending" }
      )
    : [];

  return (
    <div
      className={`${styles.indicatorWrapper} ${styles[variant]} ${className}`}
      role="status"
      aria-live="polite"
      {...props}
    >
      <div className={styles.mainRow}>
        {variant === "spinner" && (
          <Loader2 className={`${styles.icon} animate-spin`} size={15} />
        )}
        {variant === "pulse" && (
          <div className={styles.pulseDot} />
        )}
        {variant === "dots" && (
          <div className={styles.dotsContainer}>
            <span className={styles.dot} />
            <span className={styles.dot} />
            <span className={styles.dot} />
          </div>
        )}
        {variant === "shimmer" && (
          <Sparkles className={styles.shimmerIcon} size={15} />
        )}

        <span className={styles.label}>{label}</span>

        {showElapsed && (
          <span className={styles.elapsedBadge}>
            {elapsedSeconds}s
          </span>
        )}
      </div>

      {normalizedSteps.length > 0 && (
        <div className={styles.stepsList}>
          {normalizedSteps.map((step) => (
            <div
              key={step.id}
              className={`${styles.stepRow} ${styles[`step_${step.status || "pending"}`]}`}
            >
              <div className={styles.stepStatusIcon}>
                {step.status === "completed" ? (
                  <Check size={12} className={styles.checkIcon} />
                ) : step.status === "active" ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Dot size={12} />
                )}
              </div>
              <span className={styles.stepLabel}>{step.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
