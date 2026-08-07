"use client";

import { AlertCircle, CircleCheck, FileBarChart2, Plus } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Project } from "@/types/domain/project";
import { useProjectFinance } from "../hooks/use-project-finance";
import {
  FinanceView,
  ProjectFinanceSnapshot,
} from "../types/project-finance.types";
import {
  ProjectFinanceService,
  projectFinanceService,
} from "../services/project-finance.service";
import {
  createFinanceViewUrl,
  isFinanceView,
} from "../utils/finance-query-state";
import { formatINR } from "../utils/format-inr";
import { AddTransactionDrawer } from "./add-transaction-drawer";
import { BudgetPerformanceCard } from "./budget-performance-card";
import { CashFlowCard } from "./cash-flow-card";
import { ClientCollectionCard } from "./client-collection-card";
import { FinanceAttentionStrip } from "./finance-attention-strip";
import { FinanceHeader } from "./finance-header";
import { InvoicesView, ReportsView } from "./finance-secondary-views";
import { FinanceSubnav } from "./finance-subnav";
import { FinanceSummaryGrid } from "./finance-summary-grid";
import { PaymentMilestonesTable } from "./payment-milestones-table";
import { RecentTransactionsTable } from "./recent-transactions-table";
import styles from "./project-finance-workspace.module.css";

interface ProjectFinanceWorkspaceProps {
  project: Project;
  service?: ProjectFinanceService;
}

function exportFinanceCsv(snapshot: ProjectFinanceSnapshot, dateRange: string) {
  const summaryRows = [
    ["Summary", "Amount (paise)"],
    ["Approved project value", snapshot.summary.approvedProjectValue],
    ["Invoiced", snapshot.summary.invoicedAmount],
    ["Received", snapshot.summary.receivedAmount],
    ["Paid expenses", snapshot.summary.paidExpenses],
    ["Approved commitments", snapshot.summary.committedExpenses],
    ["Available balance", snapshot.summary.availableBalance],
    [],
    [
      "Date",
      "Description",
      "Type",
      "Counterparty",
      "Reference",
      "Amount (paise)",
      "Status",
    ],
    ...snapshot.transactions.map((transaction) => [
      transaction.date,
      transaction.description,
      transaction.type,
      transaction.counterparty ?? "",
      transaction.reference ?? "",
      transaction.amount,
      transaction.status,
    ]),
  ];
  const csv = summaryRows
    .map((row) =>
      row
        .map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`)
        .join(",")
    )
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${snapshot.projectCode}-finance-${dateRange}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function ProjectFinanceWorkspace({
  project,
  service = projectFinanceService,
}: ProjectFinanceWorkspaceProps) {
  const searchParams = useSearchParams();
  const queryView = searchParams.get("financeView");
  const [view, setView] = useState<FinanceView>(
    isFinanceView(queryView) ? queryView : "overview"
  );
  const [dateRange, setDateRange] = useState("project");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const {
    snapshot,
    loading,
    saving,
    error,
    retry,
    addTransaction,
  } = useProjectFinance(
    project.id,
    project.name,
    project.projectCode,
    service
  );

  const filteredTransactions = useMemo(() => {
    if (!snapshot || dateRange === "project") {
      return snapshot?.transactions ?? [];
    }

    const currentDate = new Date("2026-07-27T00:00:00");
    let cutoff = new Date(currentDate);

    if (dateRange === "30") {
      cutoff.setDate(cutoff.getDate() - 30);
    } else if (dateRange === "90") {
      cutoff.setDate(cutoff.getDate() - 90);
    } else {
      cutoff = new Date("2026-04-01T00:00:00");
    }

    const cutoffValue = cutoff.toISOString().slice(0, 10);
    return snapshot.transactions.filter(
      (transaction) => transaction.date >= cutoffValue
    );
  }, [dateRange, snapshot]);

  function handleViewChange(nextView: FinanceView) {
    setView(nextView);
    const nextUrl = createFinanceViewUrl(window.location.href, nextView);
    window.history.replaceState({}, "", nextUrl);
  }

  function handleCreateInvoice() {
    handleViewChange("invoices");
    setNotice(
      "Invoice drafting requires the governed invoice workflow. Existing project invoices are shown below."
    );
  }

  if (loading) {
    return (
      <section className={styles.workspace} aria-label="Loading project finance">
        <div className={styles.loadingHeader}>
          <div>
            <span className={styles.skeletonLineWide} />
            <span className={styles.skeletonLine} />
          </div>
          <span className={styles.skeletonAction} />
        </div>
        <div className={styles.loadingSummary}>
          {Array.from({ length: 4 }, (_, index) => (
            <span key={index} />
          ))}
        </div>
        <div className={styles.loadingPanel} />
      </section>
    );
  }

  if (error || !snapshot) {
    return (
      <section className={styles.workspace} aria-label="Finance load error">
        <div className={styles.statePanel}>
          <AlertCircle size={24} aria-hidden="true" />
          <h2>Finance workspace unavailable</h2>
          <p>{error ?? "The project finance record could not be found."}</p>
          <button type="button" className={styles.secondaryButton} onClick={() => void retry()}>
            Retry
          </button>
        </div>
      </section>
    );
  }

  const isEmpty =
    snapshot.summary.approvedProjectValue === 0 &&
    snapshot.transactions.length === 0 &&
    snapshot.milestones.length === 0;
  const hasPartialData =
    !isEmpty &&
    (snapshot.budgetCategories.length === 0 || snapshot.cashFlow.length === 0);

  return (
    <section className={`${styles.workspace} projectFinanceWorkspace`} aria-labelledby="finance-workspace-title">
      <FinanceHeader
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onExport={() => {
          exportFinanceCsv(snapshot, dateRange);
          setNotice("Project finance data exported as CSV.");
        }}
        onAddTransaction={() => setDrawerOpen(true)}
      />
      <FinanceSubnav activeView={view} onViewChange={handleViewChange} />

      {notice && (
        <div className={styles.notice} role="status">
          <CircleCheck size={15} aria-hidden="true" />
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice(null)}>
            Dismiss
          </button>
        </div>
      )}

      {hasPartialData && (
        <div className={styles.partialDataNotice} role="status">
          Some finance records are not available yet. Available totals are shown without substituting missing data.
        </div>
      )}

      {isEmpty ? (
        <div className={styles.emptyState}>
          <FileBarChart2 size={28} aria-hidden="true" />
          <h3>Set up project finance</h3>
          <p>
            Record the first project transaction or configure the collection
            milestones for {snapshot.projectName}.
          </p>
          <div>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={() => setDrawerOpen(true)}
            >
              <Plus size={15} aria-hidden="true" />
              Add first transaction
            </button>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => handleViewChange("milestones")}
            >
              Configure payment milestones
            </button>
          </div>
        </div>
      ) : (
        <>
          {view === "overview" && (
            <>
              <FinanceAttentionStrip
                items={snapshot.attentionItems}
                onSelect={handleViewChange}
              />
              <FinanceSummaryGrid summary={snapshot.summary} />
              <section className={styles.primaryGrid} aria-label="Budget and collection">
                <BudgetPerformanceCard
                  summary={snapshot.summary}
                  categories={snapshot.budgetCategories}
                />
                <ClientCollectionCard
                  summary={snapshot.summary}
                  milestones={snapshot.milestones}
                  onViewMilestone={() => handleViewChange("milestones")}
                  onCreateInvoice={handleCreateInvoice}
                />
              </section>
              <CashFlowCard points={snapshot.cashFlow} />
              <PaymentMilestonesTable
                milestones={snapshot.milestones}
                onViewAll={() => handleViewChange("milestones")}
                onCreateInvoice={handleCreateInvoice}
              />
              <RecentTransactionsTable
                transactions={filteredTransactions}
                onViewAll={() => handleViewChange("transactions")}
                onAddTransaction={() => setDrawerOpen(true)}
              />
            </>
          )}

          {view === "milestones" && (
            <PaymentMilestonesTable
              milestones={snapshot.milestones}
              onViewAll={() => undefined}
              onCreateInvoice={handleCreateInvoice}
            />
          )}

          {view === "transactions" && (
            <RecentTransactionsTable
              transactions={filteredTransactions}
              onViewAll={() => undefined}
              onAddTransaction={() => setDrawerOpen(true)}
              showAll
            />
          )}

          {view === "invoices" && <InvoicesView invoices={snapshot.invoices} />}

          {view === "reports" && (
            <ReportsView
              summary={snapshot.summary}
              onExport={() => {
                exportFinanceCsv(snapshot, dateRange);
                setNotice("Project finance report exported as CSV.");
              }}
            />
          )}
        </>
      )}

      {drawerOpen && (
        <AddTransactionDrawer
          saving={saving}
          milestones={snapshot.milestones}
          invoices={snapshot.invoices}
          onClose={() => setDrawerOpen(false)}
          onSubmit={async (input) => {
            const transaction = await addTransaction(input);
            setDrawerOpen(false);
            setNotice(
              `${transaction.description} saved as ${transaction.status}. ${
                transaction.type === "client_receipt"
                  ? `Collections now total ${formatINR(
                      snapshot.summary.receivedAmount + transaction.amount
                    )}.`
                  : "It will affect approved totals after financial review."
              }`
            );
          }}
        />
      )}
    </section>
  );
}
