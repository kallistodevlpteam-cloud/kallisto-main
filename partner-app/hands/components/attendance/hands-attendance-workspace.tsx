"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  Download,
  Building2,
  Users,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
  MapPin,
  AlertTriangle,
  FileCheck2,
  Sparkles,
  MoreVertical,
  Eye,
} from "lucide-react";
import { WorkerTrade } from "../../types/worker-domain";
import {
  AttendanceRecord,
  SiteAttendanceSummary,
  AttendanceSummaryMetrics,
  AttendanceStatus,
} from "../../types/attendance-domain";
import {
  INITIAL_ATTENDANCE_METRICS,
  INITIAL_SITE_SUMMARIES,
  INITIAL_ATTENDANCE_RECORDS,
} from "../../mock/attendance-mock-data";
import { AttendanceDetailModal } from "./attendance-detail-modal";
import { TimesheetExportModal } from "./timesheet-export-modal";
import styles from "./hands-attendance.module.css";

const PAGE_SIZE = 8;

export function HandsAttendanceWorkspace() {
  const [records, setRecords] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE_RECORDS);
  const [siteSummaries] = useState<SiteAttendanceSummary[]>(INITIAL_SITE_SUMMARIES);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"logs" | "sites">("logs");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Custom Dropdown State
  const [openDropdown, setOpenDropdown] = useState<"status" | "trade" | "site" | null>(null);
  const [actionRowMenuId, setActionRowMenuId] = useState<string | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (openDropdown && !target.closest(`.${styles.selectWrapper}`)) {
        setOpenDropdown(null);
      }
      if (actionRowMenuId && !target.closest(`.${styles.actionMenuWrapper}`)) {
        setActionRowMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdown, actionRowMenuId]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTrade, setSelectedTrade] = useState<WorkerTrade | "All">("All");
  const [selectedStatus, setSelectedStatus] = useState<AttendanceStatus | "All">("All");
  const [selectedSiteId, setSelectedSiteId] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filtered attendance records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = r.workerName.toLowerCase().includes(q);
        const matchesTrade = r.trade.toLowerCase().includes(q);
        const matchesSite = r.siteName.toLowerCase().includes(q);
        const matchesSupervisor = r.supervisorName.toLowerCase().includes(q);
        const matchesId = r.id.toLowerCase().includes(q);
        const matchesWorkerId = r.workerId.toLowerCase().includes(q);

        if (
          !matchesName &&
          !matchesTrade &&
          !matchesSite &&
          !matchesSupervisor &&
          !matchesId &&
          !matchesWorkerId
        ) {
          return false;
        }
      }

      // Trade
      if (selectedTrade !== "All" && r.trade !== selectedTrade) {
        return false;
      }

      // Status
      if (selectedStatus !== "All" && r.status !== selectedStatus) {
        return false;
      }

      // Site
      if (selectedSiteId !== "All" && r.siteId !== selectedSiteId) {
        return false;
      }

      return true;
    });
  }, [records, searchQuery, selectedTrade, selectedStatus, selectedSiteId]);

  // Pagination
  const totalRecords = filteredRecords.length;
  const totalPages = Math.ceil(totalRecords / PAGE_SIZE) || 1;
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedRecords = useMemo(() => {
    const startIdx = (safePage - 1) * PAGE_SIZE;
    return filteredRecords.slice(startIdx, startIdx + PAGE_SIZE);
  }, [filteredRecords, safePage]);

  const startRecordNum = totalRecords === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const endRecordNum = totalRecords === 0 ? 0 : Math.min(safePage * PAGE_SIZE, totalRecords);

  // Status Counts for pills
  const statusCounts = useMemo(() => {
    return {
      All: records.length,
      Present: records.filter((r) => r.status === "Present").length,
      Late: records.filter((r) => r.status === "Late").length,
      "Shift Completed": records.filter((r) => r.status === "Shift Completed").length,
      Absent: records.filter((r) => r.status === "Absent").length,
      Overtime: records.filter((r) => r.status === "Overtime").length,
    };
  }, [records]);

  // Actions
  const handleApproveOvertime = (id: string) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              complianceStatus: "Overtime Approved",
              status: "Overtime",
            }
          : r
      )
    );
    showToast(`Approved shift overtime and compliance log for record ${id}`);
  };

  const handleFlagDiscrepancy = (id: string) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              complianceStatus: "Geotag Discrepancy",
            }
          : r
      )
    );
    showToast(`Flagged geotag discrepancy for record ${id}. Supervisor notified.`);
  };

  const handleExportComplete = (format: "csv" | "pdf", range: string) => {
    showToast(`Exported ${format.toUpperCase()} attendance timesheet for range: ${range}`);
  };

  const getStatusDisplayLabel = (status: AttendanceStatus | "All") => {
    if (status === "All") return "Status";
    return status;
  };

  const getTradeDisplayLabel = (trade: WorkerTrade | "All") => {
    if (trade === "All") return "All Trades";
    return trade;
  };

  const getSiteDisplayLabel = (siteId: string) => {
    if (siteId === "All") return "All Sites";
    const found = siteSummaries.find((s) => s.siteId === siteId);
    return found ? found.siteName : "All Sites";
  };

  return (
    <div className={styles.workspaceNoOdin}>
      {/* Toast Feedback */}
      {toastMessage && (
        <div className={styles.toastNotification}>
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      <main className={styles.leftMainSection}>
        {/* 1. Page Header */}
        <div className={styles.pageHeader}>
          <div className={styles.headerInfo}>
            <h1 className={styles.pageTitle}>Attendance & Time-Tracking</h1>
            <p className={styles.pageSubtitle}>
              Daily biometric geotag logs, supervisor shift approvals, overtime tracking, and compliance records.
            </p>
            <div className={styles.subMetaRow}>
              <span className={styles.subMetaItem}>
                <strong>{INITIAL_ATTENDANCE_METRICS.activeDeployments}</strong> Active Deployments
              </span>
              <span>·</span>
              <span className={styles.subMetaItem}>
                <strong>{INITIAL_ATTENDANCE_METRICS.sitesCovered}</strong> Sites Covered
              </span>
              <span>·</span>
              <span className={styles.subMetaItem}>
                <strong>{INITIAL_ATTENDANCE_METRICS.shiftCompletionPercent}%</strong> Shift Completion
              </span>
              <span>·</span>
              <span className={styles.liveBadge}>
                <span className={styles.liveDot} /> Live
              </span>
            </div>
          </div>

          <div className={styles.headerActions}>
            <div className={styles.searchBox}>
              <Search size={14} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search worker, trade, site..."
                className={styles.searchInput}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <button
              type="button"
              className={styles.exportBtn}
              onClick={() => setIsExportModalOpen(true)}
            >
              <Download size={15} />
              <span>Export Timesheet</span>
            </button>
          </div>
        </div>

      {/* 2. 4 Top KPI Cards */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIconBox} style={{ backgroundColor: "#eff6ff", color: "#2563eb" }}>
            <Building2 size={20} />
          </div>
          <div className={styles.kpiMeta}>
            <span className={styles.kpiValue}>{INITIAL_ATTENDANCE_METRICS.activeDeployments}</span>
            <span className={styles.kpiLabel}>Active Deployments</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIconBox} style={{ backgroundColor: "#f0fdf4", color: "#16a34a" }}>
            <MapPin size={20} />
          </div>
          <div className={styles.kpiMeta}>
            <span className={styles.kpiValue}>{INITIAL_ATTENDANCE_METRICS.sitesCovered}</span>
            <span className={styles.kpiLabel}>Sites Covered</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIconBox} style={{ backgroundColor: "#faf5ff", color: "#9333ea" }}>
            <Users size={20} />
          </div>
          <div className={styles.kpiMeta}>
            <span className={styles.kpiValue}>{INITIAL_ATTENDANCE_METRICS.deployedCrew}</span>
            <span className={styles.kpiLabel}>Deployed Crew</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIconBox} style={{ backgroundColor: "#fffbe6", color: "#d97706" }}>
            <CheckCircle2 size={20} />
          </div>
          <div className={styles.kpiMeta}>
            <span className={styles.kpiValue}>{INITIAL_ATTENDANCE_METRICS.shiftCompletionPercent}%</span>
            <span className={styles.kpiLabel}>Shift Completion</span>
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className={styles.tabsNav} role="tablist" aria-label="Attendance Views">
        <div className={styles.tabsList}>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "logs"}
            className={`${styles.tabBtn} ${activeTab === "logs" ? styles.tabBtnActive : ""}`}
            onClick={() => setActiveTab("logs")}
          >
            <span>Live Biometric Logs</span>
            <span className={styles.countBadge}>{records.length}</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "sites"}
            className={`${styles.tabBtn} ${activeTab === "sites" ? styles.tabBtnActive : ""}`}
            onClick={() => setActiveTab("sites")}
          >
            <span>Site Deployment Summary</span>
            <span className={styles.countBadge}>{siteSummaries.length}</span>
          </button>
        </div>
      </div>

      {/* 4. Tab 1: Live Biometric & Geotag Logs */}
      {activeTab === "logs" && (
        <div className={styles.logsTabContainer}>
          {/* Filter Dropdowns Toolbar Row */}
          <div className={styles.toolbarCard}>
            <div className={styles.filterControlsRow}>
              {/* Status Dropdown */}
              <div className={styles.selectWrapper}>
                <button
                  type="button"
                  className={styles.customDropdownTrigger}
                  onClick={() => setOpenDropdown((prev) => (prev === "status" ? null : "status"))}
                  aria-expanded={openDropdown === "status"}
                  aria-haspopup="listbox"
                >
                  <span className={styles.selectLabel}>{getStatusDisplayLabel(selectedStatus)}</span>
                  <ChevronDown
                    size={13}
                    className={`${styles.selectChevronInline} ${
                      openDropdown === "status" ? styles.selectChevronRotated : ""
                    }`}
                  />
                </button>

                <select
                  className={styles.invisibleSelect}
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value as AttendanceStatus | "All");
                    setCurrentPage(1);
                  }}
                  aria-label="Filter Status"
                >
                  <option value="All">Status</option>
                  <option value="Present">Present</option>
                  <option value="Late">Late</option>
                  <option value="Overtime">Overtime</option>
                  <option value="Absent">Absent</option>
                </select>

                {openDropdown === "status" && (
                  <div className={styles.customDropdownMenu} role="listbox">
                    {(["All", "Present", "Late", "Overtime", "Absent"] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        role="option"
                        aria-selected={selectedStatus === st}
                        className={`${styles.customDropdownItem} ${
                          selectedStatus === st ? styles.customDropdownItemActive : ""
                        }`}
                        onClick={() => {
                          setSelectedStatus(st);
                          setCurrentPage(1);
                          setOpenDropdown(null);
                        }}
                      >
                        <span>{st === "All" ? "Status" : st}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Trade Dropdown */}
              <div className={styles.selectWrapper}>
                <button
                  type="button"
                  className={styles.customDropdownTrigger}
                  onClick={() => setOpenDropdown((prev) => (prev === "trade" ? null : "trade"))}
                  aria-expanded={openDropdown === "trade"}
                  aria-haspopup="listbox"
                >
                  <span className={styles.selectLabel}>{getTradeDisplayLabel(selectedTrade)}</span>
                  <ChevronDown
                    size={13}
                    className={`${styles.selectChevronInline} ${
                      openDropdown === "trade" ? styles.selectChevronRotated : ""
                    }`}
                  />
                </button>

                <select
                  className={styles.invisibleSelect}
                  value={selectedTrade}
                  onChange={(e) => {
                    setSelectedTrade(e.target.value as WorkerTrade | "All");
                    setCurrentPage(1);
                  }}
                  aria-label="Filter Trade"
                >
                  <option value="All">All Trades</option>
                  <option value="Mason">Mason</option>
                  <option value="Helper">Helper</option>
                  <option value="Electrician">Electrician</option>
                  <option value="Carpenter">Carpenter</option>
                  <option value="Plumber">Plumber</option>
                  <option value="Welder">Welder</option>
                </select>

                {openDropdown === "trade" && (
                  <div className={styles.customDropdownMenu} role="listbox">
                    {(["All", "Mason", "Helper", "Electrician", "Carpenter", "Plumber", "Welder"] as const).map(
                      (tr) => (
                        <button
                          key={tr}
                          type="button"
                          role="option"
                          aria-selected={selectedTrade === tr}
                          className={`${styles.customDropdownItem} ${
                            selectedTrade === tr ? styles.customDropdownItemActive : ""
                          }`}
                          onClick={() => {
                            setSelectedTrade(tr);
                            setCurrentPage(1);
                            setOpenDropdown(null);
                          }}
                        >
                          <span>{tr === "All" ? "All Trades" : tr}</span>
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* Site Dropdown */}
              <div className={styles.selectWrapper}>
                <button
                  type="button"
                  className={styles.customDropdownTrigger}
                  onClick={() => setOpenDropdown((prev) => (prev === "site" ? null : "site"))}
                  aria-expanded={openDropdown === "site"}
                  aria-haspopup="listbox"
                >
                  <span className={styles.selectLabel}>{getSiteDisplayLabel(selectedSiteId)}</span>
                  <ChevronDown
                    size={13}
                    className={`${styles.selectChevronInline} ${
                      openDropdown === "site" ? styles.selectChevronRotated : ""
                    }`}
                  />
                </button>

                <select
                  className={styles.invisibleSelect}
                  value={selectedSiteId}
                  onChange={(e) => {
                    setSelectedSiteId(e.target.value);
                    setCurrentPage(1);
                  }}
                  aria-label="Filter Site"
                >
                  <option value="All">All Sites</option>
                  {siteSummaries.map((s) => (
                    <option key={s.siteId} value={s.siteId}>
                      {s.siteName}
                    </option>
                  ))}
                </select>

                {openDropdown === "site" && (
                  <div className={styles.customDropdownMenu} role="listbox">
                    <button
                      type="button"
                      role="option"
                      aria-selected={selectedSiteId === "All"}
                      className={`${styles.customDropdownItem} ${
                        selectedSiteId === "All" ? styles.customDropdownItemActive : ""
                      }`}
                      onClick={() => {
                        setSelectedSiteId("All");
                        setCurrentPage(1);
                        setOpenDropdown(null);
                      }}
                    >
                      <span>All Sites</span>
                    </button>
                    {siteSummaries.map((s) => (
                      <button
                        key={s.siteId}
                        type="button"
                        role="option"
                        aria-selected={selectedSiteId === s.siteId}
                        className={`${styles.customDropdownItem} ${
                          selectedSiteId === s.siteId ? styles.customDropdownItemActive : ""
                        }`}
                        onClick={() => {
                          setSelectedSiteId(s.siteId);
                          setCurrentPage(1);
                          setOpenDropdown(null);
                        }}
                      >
                        <span>{s.siteName}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Records Table */}
          <div className={styles.tableCard}>
            <div className={styles.tableWrapper}>
              <table className={styles.attendanceTable}>
                <thead>
                  <tr>
                    <th>Worker Name & Trade</th>
                    <th>Site Location</th>
                    <th>Check-In / Out</th>
                    <th>Hours Logged</th>
                    <th>Status</th>
                    <th>Verification</th>
                    <th>Supervisor</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRecords.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: "center", padding: "32px", color: "#64748b" }}>
                        No attendance records matching filter criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedRecords.map((record) => {
                      const initials = record.workerName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)
                        .toUpperCase();

                      return (
                        <tr
                          key={record.id}
                          className={styles.attendanceRow}
                          onClick={() => setSelectedRecord(record)}
                        >
                          <td>
                            <div className={styles.workerCell}>
                              {record.avatarUrl ? (
                                <img
                                  src={record.avatarUrl}
                                  alt={record.workerName}
                                  className={styles.avatarImg}
                                />
                              ) : (
                                <div className={styles.avatarBox}>{initials}</div>
                              )}
                              <div className={styles.workerInfo}>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                  <span className={styles.workerName}>{record.workerName}</span>
                                  <span className={styles.tradeTag}>{record.trade}</span>
                                </div>
                                <span className={styles.workerMeta}>
                                  ID: {record.workerId} · {record.level}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td>
                            <div style={{ display: "flex", flexDirection: "column" }}>
                              <span style={{ fontWeight: 650, color: "#0f172a" }}>
                                {record.siteName}
                              </span>
                              <span style={{ fontSize: "11.5px", color: "#64748b" }}>
                                {record.location}
                              </span>
                            </div>
                          </td>

                          <td>
                            <div style={{ display: "flex", flexDirection: "column" }}>
                              <span style={{ fontWeight: 650, color: "#059669" }}>
                                {record.checkInTime}
                              </span>
                              <span style={{ fontSize: "11.5px", color: "#64748b" }}>
                                Out: {record.checkOutTime || "Active Shift"}
                              </span>
                            </div>
                          </td>

                          <td>
                            <div style={{ display: "flex", flexDirection: "column" }}>
                              <span style={{ fontWeight: 650, color: "#0f172a" }}>
                                {record.hoursLogged > 0 ? `${record.hoursLogged} hrs` : "0 hrs"}
                              </span>
                              {record.overtimeHours > 0 && (
                                <span style={{ fontSize: "11px", color: "#9333ea", fontWeight: 600 }}>
                                  +{record.overtimeHours}h Overtime
                                </span>
                              )}
                            </div>
                          </td>

                          <td>
                            <span
                              className={`${styles.statusPill} ${
                                styles[`status_${record.status.replace(/\s+/g, "_")}`]
                              }`}
                            >
                              ● {record.status}
                            </span>
                          </td>

                          <td>
                            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                              <span className={styles.methodBadge}>
                                <ShieldCheck size={11} color="#059669" />
                                {record.verificationMethod.replace(/ Geotag|\s*\+\s*GPS/gi, "")} ({record.faceMatchConfidence}%)
                              </span>
                            </div>
                          </td>

                          <td>
                            <span style={{ fontWeight: 600, color: "#334155" }}>
                              {record.supervisorName}
                            </span>
                          </td>

                          <td style={{ textAlign: "right", position: "relative" }}>
                            <div className={styles.actionMenuWrapper}>
                              <button
                                type="button"
                                className={styles.threeDotsBtn}
                                aria-label={`Actions for ${record.workerName}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActionRowMenuId((prev) => (prev === record.id ? null : record.id));
                                }}
                              >
                                <MoreVertical size={16} />
                              </button>

                              {actionRowMenuId === record.id && (
                                <div className={styles.actionDropdownMenu} onClick={(e) => e.stopPropagation()}>
                                  <button
                                    type="button"
                                    className={styles.actionMenuItem}
                                    onClick={() => {
                                      setSelectedRecord(record);
                                      setActionRowMenuId(null);
                                    }}
                                  >
                                    <Eye size={14} />
                                    <span>View Details</span>
                                  </button>

                                  <button
                                    type="button"
                                    className={styles.actionMenuItem}
                                    onClick={() => {
                                      handleApproveOvertime(record.id);
                                      setActionRowMenuId(null);
                                    }}
                                  >
                                    <CheckCircle2 size={14} color="#059669" />
                                    <span>Approve Overtime</span>
                                  </button>

                                  <button
                                    type="button"
                                    className={`${styles.actionMenuItem} ${styles.actionMenuItemDanger}`}
                                    onClick={() => {
                                      handleFlagDiscrepancy(record.id);
                                      setActionRowMenuId(null);
                                    }}
                                  >
                                    <AlertTriangle size={14} color="#dc2626" />
                                    <span>Flag Discrepancy</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Bar */}
          <div className={styles.paginationBar}>
            <span className={styles.paginationText}>
              Showing {startRecordNum}–{endRecordNum} of {totalRecords} attendance records
            </span>

            <div className={styles.paginationCtrls}>
              <button
                type="button"
                className={`${styles.pageBtn} ${safePage === 1 ? styles.pageBtnDisabled : ""}`}
                disabled={safePage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft size={14} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                <button
                  key={pg}
                  type="button"
                  className={`${styles.pageBtn} ${safePage === pg ? styles.pageBtnActive : ""}`}
                  onClick={() => setCurrentPage(pg)}
                >
                  {pg}
                </button>
              ))}

              <button
                type="button"
                className={`${styles.pageBtn} ${
                  safePage === totalPages ? styles.pageBtnDisabled : ""
                }`}
                disabled={safePage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Tab 2: Site Deployment Summary */}
      {activeTab === "sites" && (
        <div className={styles.siteGrid}>
          {siteSummaries.map((site) => (
            <div key={site.siteId} className={styles.siteCard}>
              <div className={styles.siteCardHeader}>
                <div>
                  <h3 className={styles.siteTitle}>{site.siteName}</h3>
                  <p className={styles.siteLocation}>{site.location}</p>
                </div>
                <span
                  className={`${styles.statusPill} ${
                    site.status === "On Track"
                      ? styles.status_Present
                      : site.status === "Minor Deficit"
                      ? styles.status_Late
                      : styles.status_Absent
                  }`}
                >
                  ● {site.status}
                </span>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px", color: "#475569" }}>
                  <span>Shift Completion Rate</span>
                  <strong style={{ color: "#0f172a" }}>{site.shiftCompletionPercent}%</strong>
                </div>
                <div className={styles.siteProgressTrack}>
                  <div
                    className={styles.siteProgressBar}
                    style={{ width: `${site.shiftCompletionPercent}%` }}
                  />
                </div>
              </div>

              <div className={styles.siteMetaRow}>
                <span>Assigned: <strong>{site.totalAssigned}</strong></span>
                <span>Present: <strong style={{ color: "#16a34a" }}>{site.presentCount}</strong></span>
                <span>Late: <strong style={{ color: "#d97706" }}>{site.lateCount}</strong></span>
                <span>Absent: <strong style={{ color: "#dc2626" }}>{site.absentCount}</strong></span>
              </div>

              <div style={{ fontSize: "12px", color: "#64748b", borderTop: "1px solid #f1f5f9", paddingTop: "8px" }}>
                Supervisor: <strong>{site.supervisorName}</strong>
              </div>
            </div>
          ))}
        </div>
      )}
      </main>

      {/* Inspection Modal */}
      <AttendanceDetailModal
        record={selectedRecord}
        onClose={() => setSelectedRecord(null)}
        onApproveOvertime={handleApproveOvertime}
        onFlagDiscrepancy={handleFlagDiscrepancy}
      />

      {/* Export Modal */}
      <TimesheetExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExportComplete}
        totalRecords={records.length}
      />
    </div>
  );
}
