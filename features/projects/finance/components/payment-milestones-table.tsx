"use client";

import { MoreHorizontal, MoveRight } from "lucide-react";
import { useState } from "react";
import { PaymentMilestone } from "../types/project-finance.types";
import {
  formatMilestoneStatus,
  getStatusTone,
} from "../utils/finance-labels";
import { formatFinanceDate, formatINR } from "../utils/format-inr";
import styles from "./project-finance-workspace.module.css";

interface PaymentMilestonesTableProps {
  milestones: PaymentMilestone[];
  onViewAll: () => void;
  onCreateInvoice: () => void;
}

export function PaymentMilestonesTable({
  milestones,
  onViewAll,
  onCreateInvoice,
}: PaymentMilestonesTableProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);

  return (
    <article className={`${styles.card} ${styles.tableCard}`}>
      <div className={styles.tableCardHeader}>
        <div className={styles.cardHeader}>
          <div>
            <h3>Payment Milestones</h3>
            <p>Planned collection schedule for this project</p>
          </div>
        </div>
        <button type="button" className={styles.inlineAction} onClick={onViewAll}>
          View all milestones
          <MoveRight size={14} aria-hidden="true" />
        </button>
      </div>

      {milestones.length === 0 ? (
        <div className={styles.tableEmptyState}>
          <p>No payment milestones have been configured for this project.</p>
          <button type="button" className={styles.secondaryButton} onClick={onViewAll}>
            Configure payment milestones
          </button>
        </div>
      ) : (
        <div className={styles.tableScroller}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Milestone</th>
                <th>Planned date</th>
                <th className={styles.amountColumn}>Amount</th>
                <th className={styles.amountColumn}>Invoice</th>
                <th className={styles.amountColumn}>Received</th>
                <th className={styles.amountColumn}>Balance</th>
                <th>Status</th>
                <th className={styles.actionColumn}>Action</th>
              </tr>
            </thead>
            <tbody>
              {milestones.map((milestone) => {
                const tone = getStatusTone(milestone.status);
                const balance = Math.max(
                  0,
                  milestone.amount - milestone.receivedAmount
                );
                return (
                  <tr
                    key={milestone.id}
                    tabIndex={0}
                    aria-selected={selectedId === milestone.id}
                    className={
                      selectedId === milestone.id ? styles.selectedTableRow : undefined
                    }
                    onClick={() => setSelectedId(milestone.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedId(milestone.id);
                      }
                    }}
                  >
                    <td>
                      <strong className={styles.tablePrimaryText}>{milestone.title}</strong>
                    </td>
                    <td>{formatFinanceDate(milestone.plannedDate)}</td>
                    <td className={styles.amountColumn}>{formatINR(milestone.amount)}</td>
                    <td className={styles.amountColumn}>{formatINR(milestone.invoicedAmount)}</td>
                    <td className={styles.amountColumn}>{formatINR(milestone.receivedAmount)}</td>
                    <td className={styles.amountColumn}>{formatINR(balance)}</td>
                    <td>
                      <span className={styles[`status${tone[0].toUpperCase()}${tone.slice(1)}`]}>
                        {formatMilestoneStatus(milestone.status)}
                      </span>
                    </td>
                    <td className={styles.actionColumn}>
                      <div className={styles.rowMenuAnchor}>
                        <button
                          type="button"
                          className={styles.iconButton}
                          aria-label={`Actions for ${milestone.title}`}
                          aria-expanded={menuId === milestone.id}
                          onClick={(event) => {
                            event.stopPropagation();
                            setMenuId((current) =>
                              current === milestone.id ? null : milestone.id
                            );
                          }}
                        >
                          <MoreHorizontal size={16} aria-hidden="true" />
                        </button>
                        {menuId === milestone.id && (
                          <div className={styles.rowMenu} role="menu">
                            <button
                              type="button"
                              role="menuitem"
                              onClick={(event) => {
                                event.stopPropagation();
                                setSelectedId(milestone.id);
                                setMenuId(null);
                              }}
                            >
                              View milestone
                            </button>
                            <button
                              type="button"
                              role="menuitem"
                              onClick={(event) => {
                                event.stopPropagation();
                                onCreateInvoice();
                                setMenuId(null);
                              }}
                            >
                              Create invoice
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </article>
  );
}
