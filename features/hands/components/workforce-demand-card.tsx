import { ArrowUpRight, CalendarDays } from "lucide-react";
import type { HandsTab, WorkforceDemand } from "../types/hands.types";
import styles from "./hands-overview.module.css";

interface WorkforceDemandCardProps {
  demand: WorkforceDemand[];
  onNavigateTab: (tab: HandsTab) => void;
}

export function WorkforceDemandCard({
  demand,
  onNavigateTab,
}: WorkforceDemandCardProps) {
  return (
    <section
      className={styles.sectionCard}
      aria-labelledby="workforce-demand-title"
    >
      <div className={styles.cardHeader}>
        <div>
          <h2 id="workforce-demand-title">Upcoming workforce demand</h2>
          <p>Expected labour requirements for the next seven days</p>
        </div>
        <CalendarDays
          className={styles.cardHeaderIcon}
          size={18}
          aria-hidden="true"
        />
      </div>

      <div className={styles.demandGrid}>
        {demand.map((item) => {
          const stateClass =
            item.state === "Confirmed"
              ? styles.demandConfirmed
              : item.state === "Request pending"
                ? styles.demandPending
                : styles.demandNotRequested;

          return (
            <article key={item.id} className={styles.demandItem}>
              <h3>{item.dateLabel}</h3>
              <strong>{item.projectName}</strong>
              <p>
                {item.trade} · {item.quantity} workers
              </p>
              <span className={`${styles.demandState} ${stateClass}`}>
                <span className={styles.statusDot} aria-hidden="true" />
                {item.state}
              </span>
            </article>
          );
        })}
      </div>

      <div className={`${styles.cardFooter} ${styles.demandFooter}`}>
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={() => onNavigateTab("requests")}
        >
          Open workforce planner
          <ArrowUpRight size={14} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
