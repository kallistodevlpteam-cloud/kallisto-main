import {
  BriefcaseBusiness,
  HardHat,
  IndianRupee,
  UserRoundSearch,
} from "lucide-react";
import type { HandsMetric } from "../types/hands.types";
import { formatInr } from "../utils/hands-formatters";
import styles from "./hands-overview.module.css";

const METRIC_ICONS = {
  workers: HardHat,
  deployments: BriefcaseBusiness,
  positions: UserRoundSearch,
  cost: IndianRupee,
} as const;

interface HandsMetricCardProps {
  metric: HandsMetric;
}

export function HandsMetricCard({ metric }: HandsMetricCardProps) {
  const Icon = METRIC_ICONS[metric.icon];
  const value =
    metric.valueFormat === "currency"
      ? formatInr(metric.value)
      : metric.value.toLocaleString("en-IN");

  return (
    <article className={styles.metricCard}>
      <div className={styles.metricLabelRow}>
        <span>{metric.label}</span>
        <Icon size={16} strokeWidth={1.8} aria-hidden="true" />
      </div>
      <strong className={styles.metricValue}>{value}</strong>
      <p
        className={`${styles.metricSupport} ${
          metric.tone ? styles[`tone${metric.tone}`] : ""
        }`}
      >
        {metric.supportingText}
      </p>
    </article>
  );
}
