"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import styles from "@/features/basics/components/basics-workspace.module.css";

export default function BasicsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className={styles.stateView}>
      <span className={styles.stateIcon}>
        <AlertTriangle size={21} aria-hidden="true" />
      </span>
      <h2>Basics could not be loaded</h2>
      <p>
        A temporary workspace error prevented this page from loading. Your
        current project and filter URL are unchanged.
      </p>
      <button type="button" className={styles.secondaryButton} onClick={reset}>
        <RefreshCw size={13} aria-hidden="true" />
        Try again
      </button>
    </section>
  );
}
