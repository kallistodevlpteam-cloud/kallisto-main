import { ProjectFinanceSummary } from "../types/project-finance.types";
import { formatINR, formatPercent } from "../utils/format-inr";
import styles from "./project-finance-workspace.module.css";

interface FinanceSummaryGridProps {
  summary: ProjectFinanceSummary;
}

interface SummaryCardProps {
  label: string;
  value: string;
  support: string;
}

function FinanceSummaryCard({ label, value, support }: SummaryCardProps) {
  return (
    <article className={styles.summaryCard}>
      <p className={styles.summaryLabel}>{label}</p>
      <p className={styles.summaryValue}>{value}</p>
      <p className={styles.summarySupport}>{support}</p>
    </article>
  );
}

export function FinanceSummaryGrid({ summary }: FinanceSummaryGridProps) {
  const receivedPercent =
    summary.approvedProjectValue > 0
      ? (summary.receivedAmount / summary.approvedProjectValue) * 100
      : 0;
  const exposure = summary.paidExpenses + summary.committedExpenses;

  return (
    <section className={styles.summaryGrid} aria-label="Project finance summary">
      <FinanceSummaryCard
        label="Approved Project Value"
        value={formatINR(summary.approvedProjectValue)}
        support="Includes approved variations"
      />
      <FinanceSummaryCard
        label="Client Payments Received"
        value={formatINR(summary.receivedAmount)}
        support={`${formatPercent(receivedPercent)} of project value`}
      />
      <FinanceSummaryCard
        label="Expenses + Commitments"
        value={formatINR(exposure)}
        support={`${formatINR(summary.paidExpenses)} paid · ${formatINR(
          summary.committedExpenses
        )} committed`}
      />
      <FinanceSummaryCard
        label="Available Project Balance"
        value={formatINR(summary.availableBalance)}
        support="Excludes unapproved variations"
      />
    </section>
  );
}
