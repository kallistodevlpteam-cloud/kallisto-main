import {
  BudgetCategorySnapshot,
  ProjectFinanceSummary,
} from "../types/project-finance.types";
import { formatINR } from "../utils/format-inr";
import styles from "./project-finance-workspace.module.css";

interface BudgetPerformanceCardProps {
  summary: ProjectFinanceSummary;
  categories: BudgetCategorySnapshot[];
}

function percentage(value: number, total: number): number {
  if (total <= 0) {
    return 0;
  }

  return Math.min(100, Math.max(0, (value / total) * 100));
}

export function BudgetPerformanceCard({
  summary,
  categories,
}: BudgetPerformanceCardProps) {
  const paidPercent = percentage(
    summary.paidExpenses,
    summary.approvedProjectValue
  );
  const committedPercent = percentage(
    summary.committedExpenses,
    summary.approvedProjectValue
  );
  const remainingPercent = Math.max(0, 100 - paidPercent - committedPercent);

  return (
    <article className={`${styles.card} ${styles.budgetCard}`}>
      <div className={styles.cardHeader}>
        <div>
          <h3>Budget Performance</h3>
          <p>Approved allocation against paid and committed cost</p>
        </div>
      </div>

      <dl className={styles.budgetMetrics}>
        <div>
          <dt>Approved budget</dt>
          <dd>{formatINR(summary.approvedProjectValue)}</dd>
        </div>
        <div>
          <dt>Actual paid</dt>
          <dd>{formatINR(summary.paidExpenses)}</dd>
        </div>
        <div>
          <dt>Committed cost</dt>
          <dd>{formatINR(summary.committedExpenses)}</dd>
        </div>
        <div>
          <dt>Remaining amount</dt>
          <dd>{formatINR(summary.availableBalance)}</dd>
        </div>
      </dl>

      <div>
        <div
          className={styles.stackedBudgetBar}
          role="img"
          aria-label={`${Math.round(paidPercent)} percent paid, ${Math.round(
            committedPercent
          )} percent committed, ${Math.round(remainingPercent)} percent remaining`}
        >
          <span
            className={styles.budgetPaid}
            style={{ width: `${paidPercent}%` }}
          />
          <span
            className={styles.budgetCommitted}
            style={{ width: `${committedPercent}%` }}
          />
          <span
            className={styles.budgetRemaining}
            style={{ width: `${remainingPercent}%` }}
          />
        </div>
        <div className={styles.budgetLegend} aria-label="Budget bar legend">
          <span><i className={styles.legendPaid} /> Paid</span>
          <span><i className={styles.legendCommitted} /> Committed</span>
          <span><i className={styles.legendRemaining} /> Remaining</span>
        </div>
      </div>

      <div className={styles.categoryTable} role="table" aria-label="Budget categories">
        <div className={styles.categoryHeader} role="row">
          <span role="columnheader">Category</span>
          <span role="columnheader">Approved</span>
          <span role="columnheader">Paid</span>
          <span role="columnheader">Committed</span>
          <span role="columnheader">Variance</span>
        </div>
        {categories.map((category) => (
          <div className={styles.categoryRow} role="row" key={category.id}>
            <div className={styles.categoryNameCell} role="cell">
              <span>{category.name}</span>
              <div
                className={styles.categoryProgress}
                role="progressbar"
                aria-label={`${category.name} budget exposure`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(category.exposurePercent)}
              >
                <span
                  className={
                    category.varianceState === "over"
                      ? styles.categoryProgressOver
                      : category.varianceState === "approaching"
                        ? styles.categoryProgressWarning
                        : styles.categoryProgressNeutral
                  }
                  style={{ width: `${Math.min(100, category.exposurePercent)}%` }}
                />
              </div>
            </div>
            <span role="cell">{formatINR(category.approvedAmount)}</span>
            <span role="cell">{formatINR(category.paidAmount)}</span>
            <span role="cell">{formatINR(category.committedAmount)}</span>
            <span
              role="cell"
              className={
                category.varianceState === "over"
                  ? styles.varianceOver
                  : category.varianceState === "approaching"
                    ? styles.varianceWarning
                    : styles.varianceNeutral
              }
            >
              {formatINR(Math.abs(category.varianceAmount))}{" "}
              {category.varianceAmount < 0 ? "over" : "left"}
            </span>
          </div>
        ))}
      </div>
    </article>
  );
}
