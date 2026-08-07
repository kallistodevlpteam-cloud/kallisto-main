"use client";

import { MoveRight, Search } from "lucide-react";
import { useMemo, useState } from "react";
import {
  FinanceTransactionStatus,
  FinanceTransactionType,
  ProjectFinanceTransaction,
} from "../types/project-finance.types";
import {
  formatTransactionStatus,
  formatTransactionType,
  getStatusTone,
} from "../utils/finance-labels";
import { formatFinanceDate, formatINR } from "../utils/format-inr";
import styles from "./project-finance-workspace.module.css";

interface RecentTransactionsTableProps {
  transactions: ProjectFinanceTransaction[];
  onViewAll: () => void;
  onAddTransaction: () => void;
  showAll?: boolean;
}

export function RecentTransactionsTable({
  transactions,
  onViewAll,
  onAddTransaction,
  showAll = false,
}: RecentTransactionsTableProps) {
  const [search, setSearch] = useState("");
  const [type, setType] = useState<FinanceTransactionType | "all">("all");
  const [status, setStatus] = useState<FinanceTransactionStatus | "all">("all");
  const filteredTransactions = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const matches = transactions.filter((transaction) => {
      const matchesSearch =
        !normalizedSearch ||
        [
          transaction.description,
          transaction.counterparty,
          transaction.reference,
          transaction.category,
        ]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(normalizedSearch));
      const matchesType = type === "all" || transaction.type === type;
      const matchesStatus =
        status === "all" || transaction.status === status;
      return matchesSearch && matchesType && matchesStatus;
    });

    return showAll ? matches : matches.slice(0, 8);
  }, [search, showAll, status, transactions, type]);

  return (
    <article className={`${styles.card} ${styles.tableCard}`}>
      <div className={styles.tableCardHeader}>
        <div className={styles.cardHeader}>
          <div>
            <h3>{showAll ? "Project Transactions" : "Recent Transactions"}</h3>
            <p>Auditable receipts, costs, commitments and adjustments</p>
          </div>
        </div>
        {!showAll && (
          <button type="button" className={styles.inlineAction} onClick={onViewAll}>
            View all transactions
            <MoveRight size={14} aria-hidden="true" />
          </button>
        )}
      </div>

      <div className={styles.transactionToolbar}>
        <label className={styles.searchControl}>
          <Search size={15} aria-hidden="true" />
          <span className="sr-only">Search transactions</span>
          <input
            type="search"
            aria-label="Search transactions"
            placeholder="Search description, counterparty or reference"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <label className={styles.filterControl}>
          <span className="sr-only">Transaction type</span>
          <select
            aria-label="Transaction type"
            value={type}
            onChange={(event) =>
              setType(event.target.value as FinanceTransactionType | "all")
            }
          >
            <option value="all">All types</option>
            <option value="client_receipt">Client receipt</option>
            <option value="expense">Expense</option>
            <option value="commitment">Commitment</option>
            <option value="refund">Refund</option>
            <option value="adjustment">Adjustment</option>
          </select>
        </label>
        <label className={styles.filterControl}>
          <span className="sr-only">Transaction status</span>
          <select
            aria-label="Transaction status"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as FinanceTransactionStatus | "all")
            }
          >
            <option value="all">All statuses</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="paid">Paid</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>
      </div>

      {transactions.length === 0 ? (
        <div className={styles.tableEmptyState}>
          <p>No finance transactions have been recorded for this project.</p>
          <button type="button" className={styles.primaryButton} onClick={onAddTransaction}>
            Add first transaction
          </button>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className={styles.tableEmptyState}>
          <p>No transactions match the current search and filters.</p>
          <button
            type="button"
            className={styles.textButton}
            onClick={() => {
              setSearch("");
              setType("all");
              setStatus("all");
            }}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className={styles.tableScroller}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Type</th>
                <th>Counterparty</th>
                <th>Reference</th>
                <th className={styles.amountColumn}>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction) => {
                const isIncome = transaction.type === "client_receipt";
                const tone = getStatusTone(transaction.status);
                return (
                  <tr key={transaction.id}>
                    <td>{formatFinanceDate(transaction.date)}</td>
                    <td>
                      <strong className={styles.tablePrimaryText}>
                        {transaction.description}
                      </strong>
                    </td>
                    <td>{formatTransactionType(transaction)}</td>
                    <td>{transaction.counterparty ?? "Not specified"}</td>
                    <td className={styles.referenceCell}>
                      {transaction.reference ?? "No reference"}
                    </td>
                    <td
                      className={`${styles.amountColumn} ${
                        isIncome ? styles.incomeAmount : styles.expenseAmount
                      }`}
                      aria-label={`${isIncome ? "Income" : "Outflow"} ${formatINR(
                        transaction.amount
                      )}`}
                    >
                      {isIncome ? "+" : "−"}
                      {formatINR(transaction.amount)}
                    </td>
                    <td>
                      <span className={styles[`status${tone[0].toUpperCase()}${tone.slice(1)}`]}>
                        {formatTransactionStatus(transaction.status)}
                      </span>
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
