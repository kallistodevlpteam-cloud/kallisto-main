"use client";

import React, { useState, useMemo } from "react";
import { 
  Download,
  FileText,
  X,
  ChevronLeft,
  ChevronRight,
  Search
} from "lucide-react";
import { 
  AssignmentAccounts, 
  AssignmentTransaction, 
  TransactionStatus
} from "../../types/assignment-domain";
import styles from "./assignment-detail.module.css";

interface AssignmentAccountsPanelProps {
  assignmentId: string;
  projectName: string;
  clientName?: string;
  supervisorName?: string;
  accounts?: AssignmentAccounts;
}

export function AssignmentAccountsPanel({
  assignmentId,
  projectName,
  clientName: _clientName = "Client Partner",
  supervisorName: _supervisorName = "Site Supervisor",
  accounts,
}: AssignmentAccountsPanelProps) {
  const acc: AssignmentAccounts = useMemo(
    () =>
      accounts || {
        totalContractValue: 180000,
        dailyBillingRate: 9000,
        shiftsDelivered: 14,
        totalShiftsContracted: 20,
        paidAmount: 126000,
        pendingAmount: 54000,
        settlementStatus: "On Track - Weekly Cycle",
        invoiceNumber: `INV-${assignmentId}-W2`,
        nextDisbursementDate: "Sep 15, 2026",
        tradeRates: [
          { trade: "Electricians", workersCount: 7, ratePerDay: 800, totalPerDay: 5600 },
          { trade: "Plumbers", workersCount: 5, ratePerDay: 680, totalPerDay: 3400 },
        ],
      },
    [accounts, assignmentId],
  );

  const transactions: AssignmentTransaction[] = useMemo(() => {
    if (acc.transactions && acc.transactions.length > 0) {
      return acc.transactions;
    }
    const halfPaid = Math.round(acc.paidAmount * 0.5);
    return [
      {
        id: `TXN-${assignmentId}-01`,
        date: "Sep 01, 2026",
        referenceNo: "UTR7710293841",
        paidBy: "Service Provider",
        paidByRole: "Service Provider",
        paidTo: "Labor Contractor",
        title: "Milestone Deployment Advance",
        description: "Initial mobilization advance paid to labor contractor (Shifts 1–6).",
        amount: halfPaid,
        paymentMethod: "NEFT / Bank Transfer",
        status: "settled",
        invoiceRef: `INV-${assignmentId}-W1`,
      },
      {
        id: `TXN-${assignmentId}-02`,
        date: "Sep 08, 2026",
        referenceNo: "UTR8829104821",
        paidBy: "Service Provider",
        paidByRole: "Service Provider",
        paidTo: "Labor Contractor",
        title: "Weekly Deployment Settlement - Cycle 1",
        description: "Cycle 1 wage settlement paid to labor contractor for verified deployment shifts.",
        amount: acc.paidAmount - halfPaid,
        paymentMethod: "NEFT / Bank Transfer",
        status: "settled",
        invoiceRef: `INV-${assignmentId}-W2`,
      },
      {
        id: `TXN-${assignmentId}-03`,
        date: "Sep 15, 2026",
        referenceNo: `INV-${assignmentId}-W3`,
        paidBy: "Service Provider",
        paidByRole: "Service Provider",
        paidTo: "Labor Contractor",
        title: "Weekly Deployment Settlement - Cycle 2",
        description: "Pending cycle 2 settlement for active deployment shifts under review.",
        amount: Math.round(acc.pendingAmount * 0.33),
        paymentMethod: "NEFT / Bank Transfer",
        status: "processing",
        invoiceRef: `INV-${assignmentId}-W3`,
      },
      {
        id: `TXN-${assignmentId}-04`,
        date: "Sep 22, 2026",
        referenceNo: `INV-${assignmentId}-W4`,
        paidBy: "Service Provider",
        paidByRole: "Service Provider",
        paidTo: "Labor Contractor",
        title: "Weekly Deployment Settlement - Cycle 3",
        description: "Scheduled cycle 3 settlement for shifts 13 to 18 verified on site.",
        amount: Math.round(acc.pendingAmount * 0.33),
        paymentMethod: "NEFT / Bank Transfer",
        status: "pending",
        invoiceRef: `INV-${assignmentId}-W4`,
      },
      {
        id: `TXN-${assignmentId}-05`,
        date: "Sep 29, 2026",
        referenceNo: `INV-${assignmentId}-W5`,
        paidBy: "Service Provider",
        paidByRole: "Service Provider",
        paidTo: "Labor Contractor",
        title: "Milestone Final Retention Settlement",
        description: "Final retention and project completion handover settlement.",
        amount: acc.pendingAmount - Math.round(acc.pendingAmount * 0.33) * 2,
        paymentMethod: "NEFT / Bank Transfer",
        status: "pending",
        invoiceRef: `INV-${assignmentId}-W5`,
      },
      {
        id: `TXN-${assignmentId}-06`,
        date: "Oct 06, 2026",
        referenceNo: "UTR9930214812",
        paidBy: "Service Provider",
        paidByRole: "Service Provider",
        paidTo: "Labor Contractor",
        title: "Specialist Stone Masonry Incentive",
        description: "Performance completion incentive for curved boundary masonry detailing.",
        amount: 18000,
        paymentMethod: "NEFT / Bank Transfer",
        status: "settled",
        invoiceRef: `INV-${assignmentId}-W6`,
      },
      {
        id: `TXN-${assignmentId}-07`,
        date: "Oct 13, 2026",
        referenceNo: `INV-${assignmentId}-W7`,
        paidBy: "Service Provider",
        paidByRole: "Service Provider",
        paidTo: "Labor Contractor",
        title: "Night Curing & Shuttering Overtime",
        description: "Verified overtime settlement for weather-proofing and beam curing crew.",
        amount: 22000,
        paymentMethod: "NEFT / Bank Transfer",
        status: "settled",
        invoiceRef: `INV-${assignmentId}-W7`,
      },
      {
        id: `TXN-${assignmentId}-08`,
        date: "Oct 20, 2026",
        referenceNo: `INV-${assignmentId}-W8`,
        paidBy: "Service Provider",
        paidByRole: "Service Provider",
        paidTo: "Labor Contractor",
        title: "Site Demobilization & Final Clearance",
        description: "Scheduled final post-handover site clearance and demobilization disbursement.",
        amount: 25000,
        paymentMethod: "NEFT / Bank Transfer",
        status: "pending",
        invoiceRef: `INV-${assignmentId}-W8`,
      },
    ];
  }, [acc, assignmentId]);

  const [selectedVoucher, setSelectedVoucher] = useState<AssignmentTransaction | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "settled" | "processing" | "pending">("all");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // 1. Status Filter
      if (filterStatus !== "all") {
        if (filterStatus === "settled") {
          if (t.status !== "settled" && t.status !== "paid") return false;
        } else if (t.status !== filterStatus) {
          return false;
        }
      }

      // 2. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchDesc = t.description.toLowerCase().includes(q);
        const matchRef = t.referenceNo.toLowerCase().includes(q);
        const matchId = t.id.toLowerCase().includes(q);
        const matchDate = t.date.toLowerCase().includes(q);
        const matchAmount = t.amount.toString().includes(q);
        if (!matchTitle && !matchDesc && !matchRef && !matchId && !matchDate && !matchAmount) {
          return false;
        }
      }

      return true;
    });
  }, [transactions, filterStatus, searchQuery]);

  const itemsPerPage = 5;
  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / itemsPerPage));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

  const handleExportTransactions = () => {
    const toExport = filteredTransactions.length > 0 ? filteredTransactions : transactions;
    const headers = [
      "Date",
      "Transaction ID",
      "Reference No",
      "Scope",
      "Description",
      "Amount",
      "Status",
      "Payment Method",
      "Invoice Ref",
    ];
    const rows = toExport.map((t) => [
      `"${t.date}"`,
      `"${t.id}"`,
      `"${t.referenceNo}"`,
      `"${t.title.replace(/"/g, '""')}"`,
      `"${t.description.replace(/"/g, '""')}"`,
      t.amount,
      `"${t.status}"`,
      `"${t.paymentMethod}"`,
      `"${t.invoiceRef || ""}"`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `transactions_${assignmentId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const shiftProgressPercent = Math.round(
    (acc.shiftsDelivered / (acc.totalShiftsContracted || 1)) * 100
  );

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const settledTotal = useMemo(() => {
    return transactions
      .filter((t) => t.status === "settled" || t.status === "paid")
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const getStatusBadge = (status: TransactionStatus) => {
    switch (status) {
      case "settled":
      case "paid":
        return <span className={styles.txnStatusSettled}>✓ Settled</span>;
      case "processing":
        return <span className={styles.txnStatusProcessing}>⏳ Processing</span>;
      default:
        return (
          <span
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: "#2563eb",
              backgroundColor: "#eff6ff",
              border: "1px solid rgba(37, 99, 235, 0.2)",
              padding: "2px 8px",
              borderRadius: "9999px",
            }}
          >
            ● Pending
          </span>
        );
    }
  };

  return (
    <div className={styles.accountsContent}>
      {/* 4-Card Financial Overview */}
      <div className={styles.financialGrid}>
        <div className={styles.financialCard}>
          <span className={styles.financialLabel}>Total Contract Value</span>
          <span className={styles.financialValue}>
            {formatCurrency(acc.totalContractValue)}
          </span>
          <span style={{ fontSize: "11px", color: "#64748b" }}>
            {acc.totalShiftsContracted} contracted shifts
          </span>
        </div>

        <div className={styles.financialCard}>
          <span className={styles.financialLabel}>Daily Billing Rate</span>
          <span className={styles.financialValue} style={{ color: "#2563eb" }}>
            {formatCurrency(acc.dailyBillingRate)}
          </span>
          <span style={{ fontSize: "11px", color: "#64748b" }}>
            per active deployment day
          </span>
        </div>

        <div className={styles.financialCard}>
          <span className={styles.financialLabel}>Paid to Date</span>
          <span className={styles.financialValue} style={{ color: "#059669" }}>
            {formatCurrency(acc.paidAmount)}
          </span>
          <span style={{ fontSize: "11px", color: "#059669", fontWeight: 600 }}>
            ✓ Verified settlements
          </span>
        </div>

        <div className={styles.financialCard}>
          <span className={styles.financialLabel}>Pending Settlement</span>
          <span className={styles.financialValue} style={{ color: "#d97706" }}>
            {formatCurrency(acc.pendingAmount)}
          </span>
          <span style={{ fontSize: "11px", color: "#64748b" }}>
            Due on cycle completion
          </span>
        </div>
      </div>

      <div
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "14px",
          padding: "18px 20px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          boxShadow: "0 1px 2px rgba(15, 23, 42, 0.03)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <div>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "#64748b",
              }}
            >
              Settlement Status & Billing Cycle
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
              <span style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>
                {acc.settlementStatus}
              </span>
              <span
                style={{
                  fontSize: "11.5px",
                  fontWeight: 600,
                  color: "#2563eb",
                  backgroundColor: "#eff6ff",
                  padding: "2px 8px",
                  borderRadius: "6px",
                  fontFamily: "monospace",
                }}
              >
                {acc.invoiceNumber}
              </span>
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: "11px", color: "#64748b", display: "block" }}>
              Next Payout Date
            </span>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>
              {acc.nextDisbursementDate}
            </span>
          </div>
        </div>

        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "12px",
              marginBottom: "6px",
              color: "#475569",
            }}
          >
            <span>
              Shift Delivery Progress ({acc.shiftsDelivered} of {acc.totalShiftsContracted} shifts)
            </span>
            <span style={{ fontWeight: 700, color: "#0f172a" }}>{shiftProgressPercent}%</span>
          </div>
          <div
            style={{
              height: "8px",
              backgroundColor: "#e2e8f0",
              borderRadius: "9999px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${shiftProgressPercent}%`,
                height: "100%",
                backgroundColor: "#0f172a",
                borderRadius: "9999px",
              }}
            />
          </div>
        </div>
      </div>

      <div
        className={styles.transactionsCard}
        style={{
          border: "none",
          boxShadow: "none",
          backgroundColor: "transparent",
          padding: "4px 0 0 0",
        }}
      >
        <div className={styles.transactionsHeader} style={{ alignItems: "center" }}>
          <div>
            <h3 className={styles.transactionsTitle}>
              Transaction Details
            </h3>
            <p className={styles.transactionsSubtitle}>
              Disbursement records and cycle settlements for labor contractor on {projectName}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
            <div style={{ textAlign: "right", whiteSpace: "nowrap" }}>
              <span style={{ fontSize: "11px", color: "#64748b", display: "block", fontWeight: 600 }}>
                Total Settled to Date
              </span>
              <span style={{ fontSize: "17px", fontWeight: 800, color: "#0f172a" }}>
                {formatCurrency(settledTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className={styles.txnToolbarRow}>
          {/* Left Side: Filter Pills */}
          <div className={styles.txnFilterPills}>
            {(["all", "settled", "processing", "pending"] as const).map((st) => {
              const count =
                st === "all"
                  ? transactions.length
                  : transactions.filter((t) =>
                      st === "settled"
                        ? t.status === "settled" || t.status === "paid"
                        : t.status === st
                    ).length;

              const isActive = filterStatus === st;
              const label = st === "all" ? "All" : st.charAt(0).toUpperCase() + st.slice(1);

              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => {
                    setFilterStatus(st);
                    setCurrentPage(1);
                  }}
                  className={`${styles.txnFilterPill} ${isActive ? styles.txnFilterPillActive : ""}`}
                  aria-pressed={isActive}
                >
                  <span>{label}</span>
                  <span className={styles.txnFilterBadge}>{count}</span>
                </button>
              );
            })}
          </div>

          {/* Right Side: Search Bar & Export Button */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <div className={styles.txnSearchWrap}>
              <Search size={13} className={styles.txnSearchIcon} />
              <input
                type="text"
                placeholder="Search ID, scope, or UTR..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className={styles.txnSearchInput}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setCurrentPage(1);
                  }}
                  className={styles.txnSearchClearBtn}
                  aria-label="Clear search"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleExportTransactions}
              className={styles.txnExportBtn}
              title="Export transaction records as CSV"
              aria-label="Export transactions"
            >
              <Download size={12} strokeWidth={2} />
              <span>Export</span>
            </button>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div
            style={{
              padding: "36px 16px",
              textAlign: "center",
              color: "#64748b",
              backgroundColor: "#f8fafc",
              borderRadius: "8px",
              margin: "10px 0",
            }}
          >
            <p style={{ margin: 0, fontWeight: 700, color: "#0f172a", fontSize: "13.5px" }}>
              No matching transactions found
            </p>
            <p style={{ margin: "4px 0 12px 0", fontSize: "12px" }}>
              No transactions match &ldquo;{searchQuery || filterStatus}&rdquo;. Try clearing filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setFilterStatus("all");
                setCurrentPage(1);
              }}
              style={{
                padding: "5px 12px",
                fontSize: "11.5px",
                fontWeight: 600,
                backgroundColor: "#f1f5f9",
                color: "#0f172a",
                border: "1px solid #cbd5e1",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Clear search &amp; filters
            </button>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className={styles.ratesTable}>
              <thead>
                <tr>
                  <th>Date & Transaction ID</th>
                  <th>Settlement Scope</th>
                  <th style={{ textAlign: "right" }}>Amount</th>
                  <th style={{ textAlign: "center" }}>Status</th>
                  <th style={{ textAlign: "center" }}>Receipt</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTransactions.map((t, idx) => {
                  const isLast = idx === paginatedTransactions.length - 1;
                  const cellBorder = isLast ? { borderBottom: "none" } : undefined;
                  return (
                    <tr key={t.id}>
                      <td style={cellBorder}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          <span style={{ fontWeight: 650, fontSize: "12.5px", color: "#0f172a" }}>
                            {t.date}
                          </span>
                          <span
                            style={{
                              fontFamily: "monospace",
                              fontSize: "11px",
                              color: "#64748b",
                              letterSpacing: "0.02em",
                            }}
                          >
                            {t.referenceNo}
                          </span>
                        </div>
                      </td>
                      <td style={cellBorder}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px", maxWidth: "460px" }}>
                          <span style={{ fontWeight: 700, fontSize: "13px", color: "#0f172a" }}>
                            {t.title}
                          </span>
                          <span style={{ fontSize: "11.5px", color: "#64748b", lineHeight: 1.35 }}>
                            {t.description}
                          </span>
                        </div>
                      </td>
                      <td style={{ ...cellBorder, textAlign: "right" }}>
                        <span
                          style={{
                            fontWeight: 750,
                            fontSize: "13.5px",
                            color: "#0f172a",
                          }}
                        >
                          {formatCurrency(t.amount)}
                        </span>
                      </td>
                      <td style={{ ...cellBorder, textAlign: "center" }}>
                        {getStatusBadge(t.status)}
                      </td>
                      <td style={{ ...cellBorder, textAlign: "center" }}>
                        <button
                          type="button"
                          onClick={() => setSelectedVoucher(t)}
                          className={styles.txnReceiptBtn}
                          title={`View receipt voucher for ${t.referenceNo}`}
                          aria-label={`View voucher for ${t.id}`}
                        >
                          <FileText size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Enhanced Pagination Controls */}
        <div className={styles.paginationBar}>
          <div className={styles.paginationCount}>
            <span>
              Showing {filteredTransactions.length === 0 ? 0 : `${startIndex + 1}-${Math.min(startIndex + itemsPerPage, filteredTransactions.length)}`} of {filteredTransactions.length} transactions
            </span>
            {filteredTransactions.length !== transactions.length && (
              <span style={{ fontSize: "11px", color: "#94a3b8", marginLeft: "4px" }}>
                (filtered from {transactions.length} total)
              </span>
            )}
          </div>

          <div className={styles.paginationControls}>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safeCurrentPage <= 1}
              className={styles.paginationArrowBtn}
              aria-label="Previous page"
            >
              <ChevronLeft size={16} strokeWidth={1.75} />
            </button>

            <div className={styles.paginationPageNumbers}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`${styles.paginationPageNumberBtn} ${
                    safeCurrentPage === pageNum ? styles.paginationPageNumberActive : ""
                  }`}
                  aria-label={`Go to page ${pageNum}`}
                  aria-current={safeCurrentPage === pageNum ? "page" : undefined}
                >
                  {pageNum}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage >= totalPages}
              className={styles.paginationArrowBtn}
              aria-label="Next page"
            >
              <ChevronRight size={16} strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </div>

      {selectedVoucher && (
        <div
          className={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="voucher-dialog-title"
        >
          <div className={styles.modalCard} style={{ maxWidth: "480px" }}>
            <div className={styles.modalHeader}>
              <div>
                <h3 id="voucher-dialog-title" className={styles.modalTitle}>
                  Settlement Voucher & Payment Receipt
                </h3>
                <span style={{ fontSize: "11px", color: "#64748b" }}>
                  Reference: {selectedVoucher.referenceNo}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVoucher(null)}
                className={styles.modalCloseBtn}
                aria-label="Close dialog"
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "8px 0" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 14px",
                  backgroundColor: "#f8fafc",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div>
                  <span style={{ fontSize: "11px", color: "#64748b", display: "block" }}>Settlement Amount</span>
                  <strong
                    style={{
                      fontSize: "20px",
                      color: "#059669",
                    }}
                  >
                    {formatCurrency(selectedVoucher.amount)}
                  </strong>
                </div>
                <div>{getStatusBadge(selectedVoucher.status)}</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "12px" }}>
                <div>
                  <span style={{ color: "#64748b", display: "block" }}>Paid By</span>
                  <strong style={{ color: "#0f172a" }}>
                    {selectedVoucher.paidBy || "Service Provider"} ({selectedVoucher.paidByRole || "Service Provider"})
                  </strong>
                </div>

                <div>
                  <span style={{ color: "#64748b", display: "block" }}>Disbursed To</span>
                  <strong style={{ color: "#0f172a" }}>{selectedVoucher.paidTo || "Labor Contractor"}</strong>
                </div>

                <div>
                  <span style={{ color: "#64748b", display: "block" }}>Project</span>
                  <strong style={{ color: "#0f172a" }}>{projectName}</strong>
                </div>

                <div>
                  <span style={{ color: "#64748b", display: "block" }}>Date & Time</span>
                  <strong style={{ color: "#0f172a" }}>{selectedVoucher.date}</strong>
                </div>

                <div>
                  <span style={{ color: "#64748b", display: "block" }}>Payment Mode</span>
                  <strong style={{ color: "#0f172a" }}>{selectedVoucher.paymentMethod}</strong>
                </div>

                {selectedVoucher.invoiceRef && (
                  <div>
                    <span style={{ color: "#64748b", display: "block" }}>Billing Reference</span>
                    <strong style={{ color: "#2563eb", fontFamily: "monospace" }}>
                      {selectedVoucher.invoiceRef}
                    </strong>
                  </div>
                )}
              </div>

              <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "10px" }}>
                <span style={{ fontSize: "11px", color: "#64748b", display: "block" }}>Scope & Settlement Purpose</span>
                <p style={{ margin: "2px 0 0", fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>
                  {selectedVoucher.title}
                </p>
                <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#475569" }}>
                  {selectedVoucher.description}
                </p>
              </div>
            </div>

            <div className={styles.modalActionRow}>
              <button
                type="button"
                onClick={() => setSelectedVoucher(null)}
                className={styles.cancelBtn}
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  alert(`Downloaded official settlement receipt voucher for ${selectedVoucher.referenceNo}`);
                  setSelectedVoucher(null);
                }}
                className={styles.submitBtn}
                style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <Download size={14} />
                <span>Download Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
