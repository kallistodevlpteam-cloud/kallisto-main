import { Activity } from "lucide-react";
import { SiteDailyProgress } from "../types/site.types";
import styles from "./project-site-workspace.module.css";

interface DailyProgressCardProps {
  progress: SiteDailyProgress[];
}

function varianceLabel(item: SiteDailyProgress): string {
  if (item.varianceState === "on_plan") {
    return "On plan";
  }

  return `${Math.abs(item.variancePercent)}% ${item.varianceState}`;
}

function varianceClassName(item: SiteDailyProgress): string {
  if (item.varianceState === "behind") {
    return styles.varianceBehind;
  }

  if (item.varianceState === "ahead") {
    return styles.varianceAhead;
  }

  return styles.varianceOnPlan;
}

export function DailyProgressCard({ progress }: DailyProgressCardProps) {
  return (
    <article className={`${styles.card} ${styles.progressCard}`}>
      <div className={styles.cardHeader}>
        <div>
          <h3>Daily Progress</h3>
          <p>Work-package execution against plan</p>
        </div>
        <span className={styles.cardHeaderMeta}>
          <Activity size={14} aria-hidden="true" />
          Quantity tracked
        </span>
      </div>

      <div className={styles.progressList}>
        {progress.map((item) => (
          <div className={styles.progressRow} key={item.id}>
            <div className={styles.progressRowHeader}>
              <div>
                <strong>{item.workPackage}</strong>
                <span>
                  {item.completedQuantity.toLocaleString("en-IN")} /{" "}
                  {item.totalQuantity.toLocaleString("en-IN")} {item.unit}
                </span>
              </div>
              <div>
                <strong>{item.progressPercent}%</strong>
                <span className={varianceClassName(item)}>
                  {varianceLabel(item)}
                </span>
              </div>
            </div>
            <div
              className={styles.progressTrack}
              role="progressbar"
              aria-label={`${item.workPackage} execution progress`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={item.progressPercent}
            >
              <span style={{ width: `${item.progressPercent}%` }} />
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
