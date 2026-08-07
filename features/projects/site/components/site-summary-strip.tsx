import { LucideIcon } from "lucide-react";
import styles from "./project-site-workspace.module.css";

export interface SiteSummaryMetric {
  id: string;
  label: string;
  value: string;
  detail?: string;
  icon: LucideIcon;
  tone?: "neutral" | "warning" | "danger" | "success";
}

interface SiteSummaryStripProps {
  metrics: SiteSummaryMetric[];
  ariaLabel: string;
}

export function SiteMetric({ metric }: { metric: SiteSummaryMetric }) {
  const Icon = metric.icon;

  return (
    <div className={styles.summaryMetric}>
      <span
        className={`${styles.summaryMetricIcon} ${
          metric.tone === "warning"
            ? styles.summaryMetricWarning
            : metric.tone === "danger"
              ? styles.summaryMetricDanger
              : metric.tone === "success"
                ? styles.summaryMetricSuccess
                : ""
        }`}
      >
        <Icon size={15} aria-hidden="true" />
      </span>
      <span>
        <dt>{metric.label}</dt>
        <dd>{metric.value}</dd>
        {metric.detail ? <small>{metric.detail}</small> : null}
      </span>
    </div>
  );
}

export function SiteSummaryStrip({
  metrics,
  ariaLabel,
}: SiteSummaryStripProps) {
  return (
    <dl className={styles.summaryStrip} aria-label={ariaLabel}>
      {metrics.map((metric) => (
        <SiteMetric key={metric.id} metric={metric} />
      ))}
    </dl>
  );
}
