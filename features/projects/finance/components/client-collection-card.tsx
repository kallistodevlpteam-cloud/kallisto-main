import { ArrowRight, FilePlus2 } from "lucide-react";
import {
  PaymentMilestone,
  ProjectFinanceSummary,
} from "../types/project-finance.types";
import { formatMilestoneStatus } from "../utils/finance-labels";
import { formatINR, formatPercent } from "../utils/format-inr";
import styles from "./project-finance-workspace.module.css";

interface ClientCollectionCardProps {
  summary: ProjectFinanceSummary;
  milestones: PaymentMilestone[];
  onViewMilestone: () => void;
  onCreateInvoice: () => void;
}

export function ClientCollectionCard({
  summary,
  milestones,
  onViewMilestone,
  onCreateInvoice,
}: ClientCollectionCardProps) {
  const collectionPercent =
    summary.invoicedAmount > 0
      ? (summary.receivedAmount / summary.invoicedAmount) * 100
      : 0;
  const nextMilestone = milestones.find(
    (milestone) =>
      milestone.status === "invoice_ready" || milestone.status === "upcoming"
  );
  const circumference = 2 * Math.PI * 40;
  const dashOffset =
    circumference - (Math.min(100, collectionPercent) / 100) * circumference;

  return (
    <article className={`${styles.card} ${styles.collectionCard}`}>
      <div className={styles.cardHeader}>
        <div>
          <h3>Client Collection</h3>
          <p>Invoiced value and receipt progress</p>
        </div>
      </div>

      <div className={styles.collectionOverview}>
        <div className={styles.collectionRing}>
          <svg viewBox="0 0 96 96" role="img" aria-label={`${formatPercent(collectionPercent)} of invoiced amount received`}>
            <circle cx="48" cy="48" r="40" className={styles.ringTrack} />
            <circle
              cx="48"
              cy="48"
              r="40"
              className={styles.ringValue}
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
            />
          </svg>
          <strong>{formatPercent(collectionPercent)}</strong>
          <span>collected</span>
        </div>
        <dl className={styles.collectionMetrics}>
          <div>
            <dt>Total project value</dt>
            <dd>{formatINR(summary.approvedProjectValue)}</dd>
          </div>
          <div>
            <dt>Invoiced</dt>
            <dd>{formatINR(summary.invoicedAmount)}</dd>
          </div>
          <div>
            <dt>Received</dt>
            <dd>{formatINR(summary.receivedAmount)}</dd>
          </div>
          <div>
            <dt>Outstanding</dt>
            <dd>{formatINR(summary.outstandingClientAmount)}</dd>
          </div>
          <div>
            <dt>Overdue</dt>
            <dd className={styles.overdueValue}>{formatINR(summary.overdueAmount)}</dd>
          </div>
        </dl>
      </div>

      <div className={styles.nextMilestone}>
        <p className={styles.nextMilestoneLabel}>Next Payment Milestone</p>
        {nextMilestone ? (
          <>
            <div className={styles.nextMilestoneHeading}>
              <div>
                <h4>{nextMilestone.title}</h4>
                <strong>{formatINR(nextMilestone.amount)}</strong>
              </div>
              <span className={styles.statusWarning}>
                {formatMilestoneStatus(nextMilestone.status)}
              </span>
            </div>
            <p className={styles.dueSoonText}>Due in 3 days</p>
            <div className={styles.milestoneActions}>
              <button type="button" className={styles.textButton} onClick={onViewMilestone}>
                View milestone
                <ArrowRight size={14} aria-hidden="true" />
              </button>
              <button type="button" className={styles.secondaryButton} onClick={onCreateInvoice}>
                <FilePlus2 size={14} aria-hidden="true" />
                Create invoice
              </button>
            </div>
          </>
        ) : (
          <div className={styles.compactEmptyState}>
            <p>No upcoming payment milestones are configured.</p>
            <button type="button" className={styles.textButton} onClick={onViewMilestone}>
              Configure payment milestones
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
