import { Download, FileBarChart2 } from "lucide-react";
import {
  FinanceInvoice,
  ProjectFinanceSummary,
} from "../types/project-finance.types";
import {
  formatInvoiceStatus,
  getStatusTone,
} from "../utils/finance-labels";
import { formatFinanceDate, formatINR } from "../utils/format-inr";
import styles from "./project-finance-workspace.module.css";

interface InvoicesViewProps {
  invoices: FinanceInvoice[];
}

export function InvoicesView({ invoices }: InvoicesViewProps) {
  return (
    <article className={`${styles.card} ${styles.tableCard}`}>
      <div className={styles.tableCardHeader}>
        <div className={styles.cardHeader}>
          <div>
            <h3>Project Invoices</h3>
            <p>Invoices issued for this project only</p>
          </div>
        </div>
      </div>
      {invoices.length === 0 ? (
        <div className={styles.tableEmptyState}>
          <p>No invoices have been created for this project.</p>
        </div>
      ) : (
        <div className={styles.tableScroller}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Description</th>
                <th>Issued</th>
                <th>Due</th>
                <th className={styles.amountColumn}>Amount</th>
                <th className={styles.amountColumn}>Received</th>
                <th className={styles.amountColumn}>Balance</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => {
                const tone = getStatusTone(invoice.status);
                return (
                  <tr key={invoice.id}>
                    <td><strong className={styles.tablePrimaryText}>{invoice.invoiceNumber}</strong></td>
                    <td>{invoice.title}</td>
                    <td>{formatFinanceDate(invoice.issuedDate)}</td>
                    <td>{formatFinanceDate(invoice.dueDate)}</td>
                    <td className={styles.amountColumn}>{formatINR(invoice.amount)}</td>
                    <td className={styles.amountColumn}>{formatINR(invoice.receivedAmount)}</td>
                    <td className={styles.amountColumn}>
                      {formatINR(Math.max(0, invoice.amount - invoice.receivedAmount))}
                    </td>
                    <td>
                      <span className={styles[`status${tone[0].toUpperCase()}${tone.slice(1)}`]}>
                        {formatInvoiceStatus(invoice.status)}
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

interface ReportsViewProps {
  summary: ProjectFinanceSummary;
  onExport: () => void;
}

export function ReportsView({ summary, onExport }: ReportsViewProps) {
  const reports = [
    {
      id: "collection",
      title: "Collection statement",
      description: "Invoices, client receipts and outstanding balances.",
    },
    {
      id: "cost",
      title: "Cost exposure report",
      description: "Paid project costs and approved commitments by category.",
    },
    {
      id: "cash",
      title: "Cash flow statement",
      description: "Monthly inflow, outflow and net cash position.",
    },
  ];

  return (
    <article className={`${styles.card} ${styles.reportsCard}`}>
      <div className={styles.cardHeader}>
        <div>
          <h3>Finance Reports</h3>
          <p>Project-scoped statements prepared from the current finance record</p>
        </div>
      </div>
      <dl className={styles.reportSummary}>
        <div>
          <dt>Outstanding client amount</dt>
          <dd>{formatINR(summary.outstandingClientAmount)}</dd>
        </div>
        <div>
          <dt>Unbilled project value</dt>
          <dd>{formatINR(summary.unbilledProjectValue)}</dd>
        </div>
        <div>
          <dt>Total cost exposure</dt>
          <dd>{formatINR(summary.paidExpenses + summary.committedExpenses)}</dd>
        </div>
      </dl>
      <div className={styles.reportList}>
        {reports.map((report) => (
          <div key={report.id} className={styles.reportRow}>
            <FileBarChart2 size={18} aria-hidden="true" />
            <div>
              <strong>{report.title}</strong>
              <span>{report.description}</span>
            </div>
            <button type="button" className={styles.secondaryButton} onClick={onExport}>
              <Download size={14} aria-hidden="true" />
              Export CSV
            </button>
          </div>
        ))}
      </div>
    </article>
  );
}
