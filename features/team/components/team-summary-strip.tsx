import type { ReactNode } from "react";
import styles from "./team-page.module.css";

interface SummaryItem {
  label: string;
  value: ReactNode;
}

interface TeamSummaryStripProps {
  items: SummaryItem[];
}

export function TeamSummaryStrip({ items }: TeamSummaryStripProps) {
  return (
    <section className={styles.summaryStrip} aria-label="Team summary">
      {items.map((item) => (
        <div className={styles.summaryItem} key={item.label}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
        </div>
      ))}
    </section>
  );
}
