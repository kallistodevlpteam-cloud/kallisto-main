import { ChevronRight, Plus } from "lucide-react";
import type { HandsTab, WorkforceRequest } from "../types/hands.types";
import { getFulfilmentPercentage } from "../utils/hands-formatters";
import styles from "./hands-overview.module.css";

interface OpenRequestsCardProps {
  requests: WorkforceRequest[];
  onNavigateTab: (tab: HandsTab) => void;
  onRequestWorkforce: () => void;
}

export function OpenRequestsCard({
  requests,
  onNavigateTab,
  onRequestWorkforce,
}: OpenRequestsCardProps) {
  return (
    <section
      className={`${styles.sectionCard} ${styles.requestsCard}`}
      aria-labelledby="open-requests-title"
    >
      <div className={styles.cardHeader}>
        <div>
          <h2 id="open-requests-title">Open requests</h2>
          <p>Unfulfilled site workforce requirements</p>
        </div>
        <button
          type="button"
          className={styles.textButton}
          onClick={() => onNavigateTab("requests")}
        >
          View all
        </button>
      </div>

      {requests.length > 0 ? (
        <div className={styles.requestList}>
          {requests.map((request) => {
            const progress = getFulfilmentPercentage(
              request.fulfilled,
              request.quantity,
            );

            return (
              <button
                key={request.id}
                type="button"
                className={styles.requestItem}
                onClick={() => onNavigateTab("requests")}
                aria-label={`Open ${request.trade} request for ${request.projectName}`}
              >
                <span className={styles.requestTopLine}>
                  <strong>{request.trade}</strong>
                  <ChevronRight size={15} aria-hidden="true" />
                </span>
                <span className={styles.requestMeta}>
                  {request.projectName} · Required {request.requiredDate}
                </span>
                <span className={styles.requestProgressMeta}>
                  <span>
                    Fulfilled <strong>{request.fulfilled} of {request.quantity}</strong>
                  </span>
                  <span>{request.quantity} workers</span>
                </span>
                <span
                  className={styles.progressTrack}
                  role="progressbar"
                  aria-label={`${request.trade} fulfilment`}
                  aria-valuemin={0}
                  aria-valuemax={request.quantity}
                  aria-valuenow={request.fulfilled}
                >
                  <span
                    className={styles.progressFill}
                    style={{ width: `${progress}%` }}
                  />
                </span>
                <span className={styles.requestStatus}>{request.status}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className={styles.compactEmptyState}>
          <h3>All workforce requests are fulfilled</h3>
          <p>There are currently no unresolved labour requirements.</p>
        </div>
      )}

      <div className={styles.cardFooter}>
        <button
          type="button"
          className={`${styles.secondaryButton} ${styles.fullWidthButton}`}
          onClick={onRequestWorkforce}
        >
          <Plus size={14} aria-hidden="true" />
          Request more workers
        </button>
      </div>
    </section>
  );
}
