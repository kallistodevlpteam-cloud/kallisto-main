import { CalendarRange, Download, Plus } from "lucide-react";
import styles from "./project-finance-workspace.module.css";

interface FinanceHeaderProps {
  dateRange: string;
  onDateRangeChange: (value: string) => void;
  onExport: () => void;
  onAddTransaction: () => void;
}

export function FinanceHeader({
  dateRange,
  onDateRangeChange,
  onExport,
  onAddTransaction,
}: FinanceHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.headerIdentity}>
        <h2 id="finance-workspace-title">Finance</h2>
        <p>Track project value, collections, expenses and cash flow.</p>
      </div>
      <div className={styles.headerActions}>
        <label className={styles.dateRangeControl}>
          <CalendarRange size={15} aria-hidden="true" />
          <span className="sr-only">Finance date range</span>
          <select
            aria-label="Finance date range"
            value={dateRange}
            onChange={(event) => onDateRangeChange(event.target.value)}
          >
            <option value="project">Project to date</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="year">This financial year</option>
          </select>
        </label>
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={onExport}
        >
          <Download size={15} aria-hidden="true" />
          Export
        </button>
        <button
          type="button"
          className={styles.primaryButton}
          onClick={onAddTransaction}
        >
          <Plus size={15} aria-hidden="true" />
          Add transaction
        </button>
      </div>
    </header>
  );
}
