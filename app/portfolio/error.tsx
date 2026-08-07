"use client";

import { AlertCircle, RotateCcw } from "lucide-react";
import styles from "@/features/portfolio/components/portfolio.module.css";

export default function PortfolioError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className={styles.routeError} role="alert">
      <AlertCircle size={22} aria-hidden="true" />
      <div>
        <h1>Portfolio could not be loaded</h1>
        <p>Refresh this workspace to try loading the portfolio again.</p>
      </div>
      <button className={styles.secondaryButton} type="button" onClick={reset}>
        <RotateCcw size={15} aria-hidden="true" />
        Retry
      </button>
    </div>
  );
}
