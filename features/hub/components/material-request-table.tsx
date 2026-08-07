import { ArrowRight, Inbox } from "lucide-react";
import type { KeyboardEvent } from "react";

import type { MaterialRequest } from "../types/hub.types";
import { MATERIAL_REQUEST_STATUS_LABELS } from "../utils/filter-material-requests";
import styles from "./hub-workspace.module.css";

interface MaterialRequestTableProps {
  requests: ReadonlyArray<MaterialRequest>;
  selectedRequestId: string | null;
  totalRequestCount: number;
  onSelectRequest: (request: MaterialRequest) => void;
  onClearFilters: () => void;
}

function handleRowKeyDown(
  event: KeyboardEvent,
  request: MaterialRequest,
  onSelectRequest: (request: MaterialRequest) => void,
) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    onSelectRequest(request);
  }
}

function StatusBadge({ status }: Pick<MaterialRequest, "status">) {
  return (
    <span className={`${styles.statusBadge} ${styles[`status_${status}`]}`}>
      {MATERIAL_REQUEST_STATUS_LABELS[status]}
    </span>
  );
}

export function MaterialRequestTable({
  requests,
  selectedRequestId,
  totalRequestCount,
  onSelectRequest,
  onClearFilters,
}: MaterialRequestTableProps) {
  if (requests.length === 0) {
    return (
      <div className={styles.emptyState} role="status">
        <span className={styles.emptyIcon}>
          <Inbox size={20} aria-hidden="true" />
        </span>
        <h3>No material requests match these filters</h3>
        <p>
          Adjust the project, pipeline stage, status, category or required date
          to see active requests.
        </p>
        <button type="button" onClick={onClearFilters}>
          Clear filters
        </button>
      </div>
    );
  }

  return (
    <>
      <div className={styles.requestCount}>
        Showing {requests.length} of {totalRequestCount} requests
      </div>
      <div className={styles.desktopRequestTable}>
        <table>
          <thead>
            <tr>
              <th>Request</th>
              <th>Project</th>
              <th>Categories</th>
              <th>Quotes</th>
              <th>Required by</th>
              <th>Status</th>
              <th aria-label="Action" />
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => {
              const isSelected = selectedRequestId === request.id;
              return (
                <tr
                  key={request.id}
                  className={isSelected ? styles.requestRowSelected : undefined}
                  tabIndex={0}
                  aria-label={`${request.name}, ${request.projectName}, ${MATERIAL_REQUEST_STATUS_LABELS[request.status]}`}
                  aria-current={isSelected ? "true" : undefined}
                  onClick={() => onSelectRequest(request)}
                  onKeyDown={(event) =>
                    handleRowKeyDown(event, request, onSelectRequest)
                  }
                >
                  <td>
                    <strong>{request.name}</strong>
                  </td>
                  <td>{request.projectName}</td>
                  <td>
                    <span className={styles.categoryText}>
                      {request.categories.join(", ")}
                    </span>
                  </td>
                  <td>{request.quoteCount}</td>
                  <td>{request.requiredByLabel}</td>
                  <td>
                    <StatusBadge status={request.status} />
                  </td>
                  <td>
                    <button
                      className={styles.rowAction}
                      type="button"
                      aria-label={`${request.actionLabel} ${request.name}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        onSelectRequest(request);
                      }}
                    >
                      {request.actionLabel}
                      <ArrowRight size={13} aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div
        className={styles.mobileRequestList}
        role="list"
        aria-label="Active material requests"
      >
        {requests.map((request) => {
          const isSelected = selectedRequestId === request.id;
          return (
            <div
              className={styles.mobileRequestItem}
              key={request.id}
              role="listitem"
            >
              <button
                className={`${styles.mobileRequestCard}${
                  isSelected ? ` ${styles.mobileRequestCardSelected}` : ""
                }`}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onSelectRequest(request)}
              >
                <span className={styles.mobileRequestHeader}>
                  <span>
                    <strong>{request.name}</strong>
                    <small>{request.projectName}</small>
                  </span>
                  <StatusBadge status={request.status} />
                </span>
                <span className={styles.mobileRequestCategories}>
                  {request.categories.join(", ")}
                </span>
                <span className={styles.mobileRequestMeta}>
                  <span>
                    <small>Quotes</small>
                    <strong>{request.quoteCount}</strong>
                  </span>
                  <span>
                    <small>Required by</small>
                    <strong>{request.requiredByLabel}</strong>
                  </span>
                  <span className={styles.mobileRequestAction}>
                    {request.actionLabel}
                    <ArrowRight size={13} aria-hidden="true" />
                  </span>
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}
