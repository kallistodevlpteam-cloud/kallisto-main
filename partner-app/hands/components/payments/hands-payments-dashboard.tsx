"use client";

import React, { useState, useMemo } from "react";
import {
  Download,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  FileText,
} from "lucide-react";
import {
  AssignmentTransaction,
  LaborWageRecord,
} from "../../types/assignment-domain";
import { getHandsPaymentsOverview } from "../../mock/assignments-mock-data";
import { TradeWageScheduleCard } from "./trade-wage-schedule-card";
import styles from "./hands-payments.module.css";

export function HandsPaymentsDashboard() {
  const [selectedProject, setSelectedProject] = useState<string>("all");

  // Table 1: Provider -> Contractor State
  const [providerSearch, setProviderSearch] = useState("");
  const [providerStatusFilter, setProviderStatusFilter] = useState<
    "all" | "settled" | "processing" | "pending"
  >("all");
  const [providerPage, setProviderPage] = useState(1);

  // Table 2: Contractor -> Labor Wages State
  const [laborSearch, setLaborSearch] = useState("");
  const [laborStatusFilter, setLaborStatusFilter] = useState<
    "all" | "paid" | "processing" | "pending"
  >("all");
  const [laborPage, setLaborPage] = useState(1);

  // Active Voucher/Slip Modal
  const [selectedVoucher, setSelectedVoucher] = useState<
    AssignmentTransaction | LaborWageRecord | null
  >(null);

  // Wage schedule assignment selection
  const [scheduleProjectId, setScheduleProjectId] = useState<string>("ASG-102");

  const overview = useMemo(() => {
    return getHandsPaymentsOverview(selectedProject);
  }, [selectedProject]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // ── Table 1 Data: Provider -> Contractor ──
  const filteredProviderRows = useMemo(() => {
    return overview.providerTransactions.filter((t) => {
      // 1. Status Filter
      if (providerStatusFilter !== "all") {
        const unifiedStatus: "settled" | "processing" | "pending" =
          t.status === "settled" || t.status === "paid"
            ? "settled"
            : t.status === "processing"
            ? "processing"
            : "pending";

        if (unifiedStatus !== providerStatusFilter) {
          return false;
        }
      }

      // 2. Search Query Filter
      if (providerSearch.trim()) {
        const q = providerSearch.toLowerCase().trim();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchPayee = (t.paidTo || "").toLowerCase().includes(q);
        const matchRef = t.referenceNo.toLowerCase().includes(q);
        const matchId = t.id.toLowerCase().includes(q);
        const matchProject = (t.projectName || "").toLowerCase().includes(q);
        const matchAmount = t.amount.toString().includes(q);

        if (!matchTitle && !matchPayee && !matchRef && !matchId && !matchProject && !matchAmount) {
          return false;
        }
      }

      return true;
    });
  }, [overview.providerTransactions, providerStatusFilter, providerSearch]);

  const itemsPerPage = 5;
  const providerTotalPages = Math.max(1, Math.ceil(filteredProviderRows.length / itemsPerPage));
  const safeProviderPage = Math.min(Math.max(1, providerPage), providerTotalPages);
  const providerStartIndex = (safeProviderPage - 1) * itemsPerPage;
  const paginatedProviderRows = filteredProviderRows.slice(
    providerStartIndex,
    providerStartIndex + itemsPerPage
  );

  const handleExportProviderCSV = () => {
    const toExport = filteredProviderRows.length > 0 ? filteredProviderRows : overview.providerTransactions;
    const headers = ["Transaction ID", "Date", "Reference No", "Scope / Milestone", "Disbursed To", "Project", "Amount", "Payment Mode", "Status"];
    const csvRows = [
      headers.join(","),
      ...toExport.map((t) =>
        [
          t.id,
          `"${t.date}"`,
          t.referenceNo,
          `"${t.title.replace(/"/g, '""')}"`,
          `"${(t.paidTo || "Labor Contractor").replace(/"/g, '""')}"`,
          `"${(t.projectName || "Assignment").replace(/"/g, '""')}"`,
          t.amount,
          `"${t.paymentMethod}"`,
          t.status,
        ].join(",")
      ),
    ];

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `kallisto_provider_settlements_${selectedProject}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // ── Table 2 Data: Contractor -> Labors ──
  const filteredLaborRows = useMemo(() => {
    return overview.laborWages.filter((lw) => {
      // 1. Status Filter
      if (laborStatusFilter !== "all" && lw.status !== laborStatusFilter) {
        return false;
      }

      // 2. Search Query Filter
      if (laborSearch.trim()) {
        const q = laborSearch.toLowerCase().trim();
        const matchWorker = lw.workerName.toLowerCase().includes(q);
        const matchTrade = lw.trade.toLowerCase().includes(q);
        const matchContractor = lw.contractorName.toLowerCase().includes(q);
        const matchRef = lw.referenceNo.toLowerCase().includes(q);
        const matchId = lw.id.toLowerCase().includes(q);
        const matchProject = lw.projectName.toLowerCase().includes(q);
        const matchAmount = lw.totalWage.toString().includes(q);

        if (!matchWorker && !matchTrade && !matchContractor && !matchRef && !matchId && !matchProject && !matchAmount) {
          return false;
        }
      }

      return true;
    });
  }, [overview.laborWages, laborStatusFilter, laborSearch]);

  const laborTotalPages = Math.max(1, Math.ceil(filteredLaborRows.length / itemsPerPage));
  const safeLaborPage = Math.min(Math.max(1, laborPage), laborTotalPages);
  const laborStartIndex = (safeLaborPage - 1) * itemsPerPage;
  const paginatedLaborRows = filteredLaborRows.slice(
    laborStartIndex,
    laborStartIndex + itemsPerPage
  );

  const handleExportLaborCSV = () => {
    const toExport = filteredLaborRows.length > 0 ? filteredLaborRows : overview.laborWages;
    const headers = ["Wage ID", "Payout Date", "Reference No", "Worker Name", "Trade", "Contractor", "Project", "Shifts", "Daily Rate", "Net Wage", "Payment Mode", "Status"];
    const csvRows = [
      headers.join(","),
      ...toExport.map((lw) =>
        [
          lw.id,
          `"${lw.payoutDate}"`,
          lw.referenceNo,
          `"${lw.workerName.replace(/"/g, '""')}"`,
          `"${lw.trade}"`,
          `"${lw.contractorName.replace(/"/g, '""')}"`,
          `"${lw.projectName.replace(/"/g, '""')}"`,
          lw.shiftsWorked,
          lw.dailyRate,
          lw.totalWage,
          `"${lw.paymentMethod}"`,
          lw.status,
        ].join(",")
      ),
    ];

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `kallisto_contractor_labor_wages_${selectedProject}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: "settled" | "paid" | "processing" | "pending" | "due") => {
    switch (status) {
      case "settled":
      case "paid":
        return <span className={styles.statusSettled}>✓ {status === "paid" ? "Paid" : "Settled"}</span>;
      case "processing":
        return <span className={styles.statusProcessing}>⏳ Processing</span>;
      case "due":
        return <span className={styles.statusPending}>● Due</span>;
      default:
        return <span className={styles.statusPending}>● Pending / Due</span>;
    }
  };

  // Active trade wage schedule to display (single clean card matching reference)
  const activeSchedule = useMemo(() => {
    const targetId = selectedProject !== "all" ? selectedProject : scheduleProjectId;
    const found = overview.tradeSchedules.find((s) => s.assignmentId === targetId);
    return found || overview.tradeSchedules[0];
  }, [overview.tradeSchedules, selectedProject, scheduleProjectId]);

  return (
    <div className={styles.paymentsContainer}>
      {/* ── Dashboard Header ── */}
      <div className={styles.dashboardHeader}>
        <div className={styles.titleArea}>
          <h1 className={styles.pageTitle}>Payments &amp; Settlements</h1>
          <p className={styles.pageSubtitle}>
            Financial oversight for Kallisto Hands: Service Provider disbursements to contractors and contractor wage payouts to on-site labors.
          </p>
        </div>

        <div className={styles.headerControls}>
          <select
            value={selectedProject}
            onChange={(e) => {
              setSelectedProject(e.target.value);
              setProviderPage(1);
              setLaborPage(1);
            }}
            className={styles.projectSelect}
            aria-label="Filter by project deployment"
          >
            <option value="all">All Deployments ({overview.assignments.length})</option>
            {overview.assignments.map((a) => (
              <option key={a.id} value={a.id}>
                {a.projectName} ({a.id})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── 4-Card Overview Metrics Grid ── */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Provider Settled</span>
          <span className={styles.metricValue} style={{ color: "#059669" }}>
            {formatCurrency(overview.metrics.providerSettled)}
          </span>
          <span className={styles.metricSubtext}>Disbursed to labor contractors</span>
        </div>

        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Pending &amp; In Processing</span>
          <span className={styles.metricValue} style={{ color: "#d97706" }}>
            {formatCurrency(overview.metrics.providerProcessing + overview.metrics.providerPending)}
          </span>
          <span className={styles.metricSubtext}>Cycle escrows &amp; retentions</span>
        </div>

        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Labor Wages Paid</span>
          <span className={styles.metricValue} style={{ color: "#2563eb" }}>
            {formatCurrency(overview.metrics.laborPaid)}
          </span>
          <span className={styles.metricSubtext}>
            Across {overview.metrics.totalAssignedPersonnel} deployed workers
          </span>
        </div>

        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Daily Wage Commitment</span>
          <span className={styles.metricValue} style={{ color: "#0f172a" }}>
            {formatCurrency(overview.metrics.totalDailyWageCommitment)}
          </span>
          <span className={styles.metricSubtext}>Combined daily wage commitment</span>
        </div>
      </div>

      {/* ── Trade Wage Rate Schedule Card (Matches reference media_1788797894888.png) ── */}
      {activeSchedule && (
        <TradeWageScheduleCard
          scheduleTitle="Trade Wage Rate Schedule"
          personnelCount={activeSchedule.personnelCount}
          tradeRates={activeSchedule.tradeRates}
          projectSelector={
            selectedProject === "all" ? (
              <select
                value={scheduleProjectId}
                onChange={(e) => setScheduleProjectId(e.target.value)}
                className={styles.scheduleSelect}
                aria-label="Select assignment for wage schedule"
              >
                {overview.tradeSchedules.map((s) => (
                  <option key={s.assignmentId} value={s.assignmentId}>
                    {s.projectName} ({s.assignmentId})
                  </option>
                ))}
              </select>
            ) : (
              <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 500 }}>
                · {activeSchedule.projectName}
              </span>
            )
          }
        />
      )}

      {/* ════════════════════════════════════════════════════════════════
          TABLE 1: Provider Payments
      ════════════════════════════════════════════════════════════════ */}
      <div className={styles.tableSectionCard}>
        {/* Section Header */}
        <div className={styles.tableSectionHeader}>
          <div className={styles.tableSectionTitleArea}>
            <div className={styles.tableSectionTitleRow}>
              <h2 className={styles.tableSectionTitle}>Provider Payments</h2>
              <span className={styles.tableSectionCountBadge}>
                {overview.providerTransactions.length} records
              </span>
            </div>
            <p className={styles.tableSectionSubtitle}>
              Contract milestone advances, weekly deployment cycle disbursements, retention releases, and site mobilization clearances.
            </p>
          </div>
        </div>

        {/* Toolbar: Filters on Left, Search + Export on Right */}
        <div className={styles.txnToolbarRow}>
          {/* Left Side: Status Filters */}
          <div className={styles.txnFilterPills}>
            {(["all", "settled", "processing", "pending"] as const).map((st) => {
              const count =
                st === "all"
                  ? overview.providerTransactions.length
                  : overview.providerTransactions.filter((t) => {
                      const uStatus =
                        t.status === "settled" || t.status === "paid"
                          ? "settled"
                          : t.status === "processing"
                          ? "processing"
                          : "pending";
                      return uStatus === st;
                    }).length;

              const isActive = providerStatusFilter === st;
              const label =
                st === "all"
                  ? "All"
                  : st === "settled"
                  ? "Settled"
                  : st === "processing"
                  ? "Processing"
                  : "Pending / Due";

              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => {
                    setProviderStatusFilter(st);
                    setProviderPage(1);
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

          {/* Right Side: Search Input & Export Button to its Right */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <div className={styles.txnSearchWrap}>
              <Search size={13} className={styles.txnSearchIcon} />
              <input
                type="text"
                placeholder="Search contractor, scope, UTR, ID..."
                value={providerSearch}
                onChange={(e) => {
                  setProviderSearch(e.target.value);
                  setProviderPage(1);
                }}
                className={styles.txnSearchInput}
                aria-label="Search provider contractor settlements"
              />
              {providerSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setProviderSearch("");
                    setProviderPage(1);
                  }}
                  className={styles.txnSearchClearBtn}
                  aria-label="Clear provider search"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleExportProviderCSV}
              className={styles.txnExportBtn}
              title="Export provider settlements as CSV"
              aria-label="Export provider settlements"
            >
              <Download size={12} strokeWidth={2} />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Table */}
        {filteredProviderRows.length === 0 ? (
          <div
            style={{
              padding: "36px 16px",
              textAlign: "center",
              color: "#64748b",
              backgroundColor: "#f8fafc",
              borderRadius: "8px",
            }}
          >
            <p style={{ margin: 0, fontWeight: 700, color: "#0f172a", fontSize: "13.5px" }}>
              No provider settlements found
            </p>
            <p style={{ margin: "4px 0 12px 0", fontSize: "12px" }}>
              No settlement records match your search or filter selection.
            </p>
            <button
              type="button"
              onClick={() => {
                setProviderSearch("");
                setProviderStatusFilter("all");
                setProviderPage(1);
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
              Clear filters
            </button>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className={styles.ratesTable}>
              <thead>
                <tr>
                  <th>Date &amp; Reference</th>
                  <th>Contractor &amp; Scope</th>
                  <th>Project Deployment</th>
                  <th style={{ textAlign: "right" }}>Amount</th>
                  <th style={{ textAlign: "center" }}>Status</th>
                  <th style={{ textAlign: "center" }}>Voucher</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProviderRows.map((row) => {
                  const uStatus: "settled" | "processing" | "pending" =
                    row.status === "settled" || row.status === "paid"
                      ? "settled"
                      : row.status === "processing"
                      ? "processing"
                      : "pending";

                  return (
                    <tr key={row.id}>
                      <td>
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          <span style={{ fontWeight: 650, fontSize: "12.5px", color: "#0f172a" }}>
                            {row.date}
                          </span>
                          <span
                            style={{
                              fontFamily: "monospace",
                              fontSize: "11px",
                              color: "#64748b",
                            }}
                          >
                            {row.referenceNo}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px", maxWidth: "420px" }}>
                          <span style={{ fontWeight: 700, fontSize: "13px", color: "#0f172a" }}>
                            {row.title}
                          </span>
                          <span style={{ fontSize: "11.5px", color: "#64748b", lineHeight: 1.35 }}>
                            Disbursed to: <strong style={{ color: "#334155" }}>{row.paidTo || "Labor Contractor"}</strong>
                          </span>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: "12px", color: "#334155", fontWeight: 500 }}>
                          {row.projectName || "Deployment Project"}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <span style={{ fontWeight: 750, fontSize: "13.5px", color: "#0f172a" }}>
                          {formatCurrency(row.amount)}
                        </span>
                      </td>
                      <td style={{ textAlign: "center" }}>{getStatusBadge(uStatus)}</td>
                      <td style={{ textAlign: "center" }}>
                        <button
                          type="button"
                          onClick={() => setSelectedVoucher(row)}
                          className={styles.txnReceiptBtn}
                          title={`View voucher for ${row.referenceNo}`}
                          aria-label={`View voucher for ${row.id}`}
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

        {/* 5-Row Pagination Bar */}
        <div className={styles.paginationBar}>
          <div className={styles.paginationCount}>
            <span>
              Showing {filteredProviderRows.length === 0 ? 0 : `${providerStartIndex + 1}-${Math.min(providerStartIndex + itemsPerPage, filteredProviderRows.length)}`} of {filteredProviderRows.length} records
            </span>
            {filteredProviderRows.length !== overview.providerTransactions.length && (
              <span style={{ fontSize: "11px", color: "#94a3b8", marginLeft: "4px" }}>
                (filtered from {overview.providerTransactions.length} total)
              </span>
            )}
          </div>

          <div className={styles.paginationControls}>
            <button
              type="button"
              onClick={() => setProviderPage((p) => Math.max(1, p - 1))}
              disabled={safeProviderPage <= 1}
              className={styles.paginationArrowBtn}
              aria-label="Previous provider page"
            >
              <ChevronLeft size={16} strokeWidth={1.75} />
            </button>

            <div className={styles.paginationPageNumbers}>
              {Array.from({ length: providerTotalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setProviderPage(pageNum)}
                  className={`${styles.paginationPageNumberBtn} ${
                    safeProviderPage === pageNum ? styles.paginationPageNumberActive : ""
                  }`}
                  aria-label={`Go to provider page ${pageNum}`}
                  aria-current={safeProviderPage === pageNum ? "page" : undefined}
                >
                  {pageNum}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setProviderPage((p) => Math.min(providerTotalPages, p + 1))}
              disabled={safeProviderPage >= providerTotalPages}
              className={styles.paginationArrowBtn}
              aria-label="Next provider page"
            >
              <ChevronRight size={16} strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          TABLE 2: Labor Payments
      ════════════════════════════════════════════════════════════════ */}
      <div className={styles.tableSectionCard}>
        {/* Section Header */}
        <div className={styles.tableSectionHeader}>
          <div className={styles.tableSectionTitleArea}>
            <div className={styles.tableSectionTitleRow}>
              <h2 className={styles.tableSectionTitle}>Labor Payments</h2>
              <span className={styles.tableSectionCountBadge}>
                {overview.laborWages.length} records
              </span>
            </div>
            <p className={styles.tableSectionSubtitle}>
              Direct worker wage payouts, daily trade allowances, and shift settlements across on-site personnel.
            </p>
          </div>
        </div>

        {/* Toolbar: Filters on Left, Search + Export on Right */}
        <div className={styles.txnToolbarRow}>
          {/* Left Side: Status Filters */}
          <div className={styles.txnFilterPills}>
            {(["all", "paid", "processing", "pending"] as const).map((st) => {
              const count =
                st === "all"
                  ? overview.laborWages.length
                  : overview.laborWages.filter((lw) => lw.status === st).length;

              const isActive = laborStatusFilter === st;
              const label =
                st === "all"
                  ? "All"
                  : st === "paid"
                  ? "Paid"
                  : st === "processing"
                  ? "Processing"
                  : "Due";

              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => {
                    setLaborStatusFilter(st);
                    setLaborPage(1);
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

          {/* Right Side: Search Input & Export Button to its Right */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <div className={styles.txnSearchWrap}>
              <Search size={13} className={styles.txnSearchIcon} />
              <input
                type="text"
                placeholder="Search worker, trade, reference..."
                value={laborSearch}
                onChange={(e) => {
                  setLaborSearch(e.target.value);
                  setLaborPage(1);
                }}
                className={styles.txnSearchInput}
                aria-label="Search contractor labor wages"
              />
              {laborSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setLaborSearch("");
                    setLaborPage(1);
                  }}
                  className={styles.txnSearchClearBtn}
                  aria-label="Clear labor search"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleExportLaborCSV}
              className={styles.txnExportBtn}
              title="Export labor wages as CSV"
              aria-label="Export labor wages"
            >
              <Download size={12} strokeWidth={2} />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Table */}
        {filteredLaborRows.length === 0 ? (
          <div
            style={{
              padding: "36px 16px",
              textAlign: "center",
              color: "#64748b",
              backgroundColor: "#f8fafc",
              borderRadius: "8px",
            }}
          >
            <p style={{ margin: 0, fontWeight: 700, color: "#0f172a", fontSize: "13.5px" }}>
              No labor wage records found
            </p>
            <p style={{ margin: "4px 0 12px 0", fontSize: "12px" }}>
              No wage payout records match your search or filter selection.
            </p>
            <button
              type="button"
              onClick={() => {
                setLaborSearch("");
                setLaborStatusFilter("all");
                setLaborPage(1);
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
              Clear filters
            </button>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className={styles.ratesTable}>
              <thead>
                <tr>
                  <th>Date &amp; Reference</th>
                  <th>Worker &amp; Trade</th>
                  <th>Project Deployment</th>
                  <th style={{ textAlign: "right" }}>Net Wage</th>
                  <th style={{ textAlign: "center" }}>Status</th>
                  <th style={{ textAlign: "center" }}>Wage Slip</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLaborRows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <span style={{ fontWeight: 650, fontSize: "12.5px", color: "#0f172a" }}>
                          {row.payoutDate}
                        </span>
                        <span
                          style={{
                            fontFamily: "monospace",
                            fontSize: "11px",
                            color: "#64748b",
                          }}
                        >
                          {row.referenceNo}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px", maxWidth: "420px" }}>
                        <span style={{ fontWeight: 700, fontSize: "13px", color: "#0f172a" }}>
                          {row.workerName}
                        </span>
                        <span style={{ fontSize: "11.5px", color: "#64748b", lineHeight: 1.35 }}>
                          {row.level || "Skilled"} {row.trade} · {row.shiftsWorked} shifts @ ₹{row.dailyRate}/day
                        </span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: "12px", color: "#334155", fontWeight: 500 }}>
                        {row.projectName}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <span style={{ fontWeight: 750, fontSize: "13.5px", color: "#0f172a" }}>
                        {formatCurrency(row.totalWage)}
                      </span>
                    </td>
                    <td style={{ textAlign: "center" }}>{getStatusBadge(row.status)}</td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        type="button"
                        onClick={() => setSelectedVoucher(row)}
                        className={styles.txnReceiptBtn}
                        title={`View wage slip for ${row.workerName}`}
                        aria-label={`View slip for ${row.id}`}
                      >
                        <FileText size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 5-Row Pagination Bar */}
        <div className={styles.paginationBar}>
          <div className={styles.paginationCount}>
            <span>
              Showing {filteredLaborRows.length === 0 ? 0 : `${laborStartIndex + 1}-${Math.min(laborStartIndex + itemsPerPage, filteredLaborRows.length)}`} of {filteredLaborRows.length} records
            </span>
            {filteredLaborRows.length !== overview.laborWages.length && (
              <span style={{ fontSize: "11px", color: "#94a3b8", marginLeft: "4px" }}>
                (filtered from {overview.laborWages.length} total)
              </span>
            )}
          </div>

          <div className={styles.paginationControls}>
            <button
              type="button"
              onClick={() => setLaborPage((p) => Math.max(1, p - 1))}
              disabled={safeLaborPage <= 1}
              className={styles.paginationArrowBtn}
              aria-label="Previous labor page"
            >
              <ChevronLeft size={16} strokeWidth={1.75} />
            </button>

            <div className={styles.paginationPageNumbers}>
              {Array.from({ length: laborTotalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setLaborPage(pageNum)}
                  className={`${styles.paginationPageNumberBtn} ${
                    safeLaborPage === pageNum ? styles.paginationPageNumberActive : ""
                  }`}
                  aria-label={`Go to labor page ${pageNum}`}
                  aria-current={safeLaborPage === pageNum ? "page" : undefined}
                >
                  {pageNum}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setLaborPage((p) => Math.min(laborTotalPages, p + 1))}
              disabled={safeLaborPage >= laborTotalPages}
              className={styles.paginationArrowBtn}
              aria-label="Next labor page"
            >
              <ChevronRight size={16} strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Voucher / Slip Modal ── */}
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
                  {"workerName" in selectedVoucher ? "Labor Wage Payout Slip" : "Settlement Voucher & Payment Receipt"}
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
                  <span style={{ fontSize: "11px", color: "#64748b", display: "block" }}>
                    {"workerName" in selectedVoucher ? "Net Wage Payout" : "Settlement Amount"}
                  </span>
                  <strong style={{ fontSize: "20px", color: "#059669" }}>
                    {formatCurrency("workerName" in selectedVoucher ? selectedVoucher.totalWage : selectedVoucher.amount)}
                  </strong>
                </div>
                <div>
                  {"workerName" in selectedVoucher
                    ? selectedVoucher.status === "paid"
                      ? <span className={styles.statusSettled}>✓ Paid</span>
                      : selectedVoucher.status === "processing"
                      ? <span className={styles.statusProcessing}>⏳ Processing</span>
                      : <span className={styles.statusPending}>● Due</span>
                    : getStatusBadge(
                        selectedVoucher.status === "settled" || selectedVoucher.status === "paid"
                          ? "settled"
                          : selectedVoucher.status === "processing"
                          ? "processing"
                          : "pending"
                      )}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "12px" }}>
                {"workerName" in selectedVoucher ? (
                  <>
                    <div>
                      <span style={{ color: "#64748b", display: "block" }}>Beneficiary Worker</span>
                      <strong style={{ color: "#0f172a" }}>{selectedVoucher.workerName}</strong>
                    </div>
                    <div>
                      <span style={{ color: "#64748b", display: "block" }}>Trade &amp; Level</span>
                      <strong style={{ color: "#0f172a" }}>
                        {selectedVoucher.level || "Skilled"} {selectedVoucher.trade}
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: "#64748b", display: "block" }}>Contractor Organization</span>
                      <strong style={{ color: "#0f172a" }}>{selectedVoucher.contractorName}</strong>
                    </div>
                    <div>
                      <span style={{ color: "#64748b", display: "block" }}>Project Assignment</span>
                      <strong style={{ color: "#0f172a" }}>{selectedVoucher.projectName}</strong>
                    </div>
                    <div>
                      <span style={{ color: "#64748b", display: "block" }}>Shifts Delivered</span>
                      <strong style={{ color: "#0f172a" }}>
                        {selectedVoucher.shiftsWorked} shifts @ ₹{selectedVoucher.dailyRate}/day
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: "#64748b", display: "block" }}>Payout Date</span>
                      <strong style={{ color: "#0f172a" }}>{selectedVoucher.payoutDate}</strong>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <span style={{ color: "#64748b", display: "block" }}>Paid By</span>
                      <strong style={{ color: "#0f172a" }}>{selectedVoucher.paidBy || "Service Provider"}</strong>
                    </div>
                    <div>
                      <span style={{ color: "#64748b", display: "block" }}>Disbursed To</span>
                      <strong style={{ color: "#0f172a" }}>{selectedVoucher.paidTo || "Labor Contractor"}</strong>
                    </div>
                    <div>
                      <span style={{ color: "#64748b", display: "block" }}>Scope</span>
                      <strong style={{ color: "#0f172a" }}>{selectedVoucher.title}</strong>
                    </div>
                    <div>
                      <span style={{ color: "#64748b", display: "block" }}>Payment Date</span>
                      <strong style={{ color: "#0f172a" }}>{selectedVoucher.date}</strong>
                    </div>
                  </>
                )}
                <div>
                  <span style={{ color: "#64748b", display: "block" }}>Payment Mode</span>
                  <strong style={{ color: "#0f172a" }}>{selectedVoucher.paymentMethod}</strong>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => setSelectedVoucher(null)}
                  style={{
                    padding: "7px 14px",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#0f172a",
                    backgroundColor: "#f1f5f9",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
