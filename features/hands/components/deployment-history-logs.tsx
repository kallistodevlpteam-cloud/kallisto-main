"use client";

import React, { useState, useMemo } from "react";
import {
  ClipboardList,
  Search,
  Clock,
  User,
  CheckCircle2,
  ShieldCheck,
  X,
  FileText,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import type { Deployment, DeploymentHistoryLogEntry } from "../types/hands.types";

interface DeploymentHistoryLogsProps {
  deployment: Deployment;
  logs: DeploymentHistoryLogEntry[];
  onAddLog?: (entry: DeploymentHistoryLogEntry) => void;
}

export function DeploymentHistoryLogs({
  deployment,
  logs,
}: DeploymentHistoryLogsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [isSupervisorProfileOpen, setIsSupervisorProfileOpen] = useState(false);

  const supervisorName = deployment.supervisor || "Rajeev K.";
  const supervisorInitials = useMemo(() => {
    return (
      supervisorName
        .split(" ")
        .map((p) => p[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase() || "SS"
    );
  }, [supervisorName]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Category filter
      if (filterCategory !== "all" && log.category !== filterCategory) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchContent = log.content.toLowerCase().includes(q);
        const matchAuthor = log.author.toLowerCase().includes(q);
        const matchCategory = log.category.toLowerCase().includes(q);
        const matchDate = log.date.toLowerCase().includes(q);
        const matchTasks = log.tasksCompleted?.some((t) => t.toLowerCase().includes(q));
        if (!matchContent && !matchAuthor && !matchCategory && !matchDate && !matchTasks) {
          return false;
        }
      }
      return true;
    });
  }, [logs, filterCategory, searchQuery]);

  const getCategoryBadgeStyle = (category: DeploymentHistoryLogEntry["category"]) => {
    switch (category) {
      case "Shift Completion Sign-off":
        return { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" };
      case "Milestone Verification":
        return { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" };
      case "Safety & Logistics":
        return { bg: "#fef3c7", color: "#d97706", border: "#fde68a" };
      case "Task Event":
        return { bg: "#f5f3ff", color: "#7c3aed", border: "#ddd6fe" };
      default:
        return { bg: "#f1f5f9", color: "#475569", border: "#cbd5e1" };
    }
  };

  return (
    <section
      aria-labelledby="deployment-history-logs-heading"
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "14px",
        padding: "20px 22px",
        boxShadow: "0 1px 2px rgba(15, 23, 42, 0.03)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "16px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <ClipboardList size={18} color="#0f172a" />
            <h2
              id="deployment-history-logs-heading"
              style={{
                fontSize: "16px",
                fontWeight: 700,
                color: "#0f172a",
                margin: 0,
              }}
            >
              Site Activity &amp; Supervisor History Logs
            </h2>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                backgroundColor: "#f1f5f9",
                color: "#475569",
                padding: "2px 8px",
                borderRadius: "9999px",
              }}
            >
              {logs.length} Total Logs
            </span>
          </div>
          <p style={{ fontSize: "12px", color: "#64748b", margin: "4px 0 0" }}>
            Chronological shift muster logs, completed tasks, supervisor sign-offs, and workforce events for{" "}
            {deployment.projectName}
          </p>
        </div>

        {/* Site Supervisor Primary Button */}
        <button
          type="button"
          onClick={() => setIsSupervisorProfileOpen(true)}
          aria-label="Supervisor"
          title={`View Site Supervisor: ${supervisorName}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            height: "34px",
            padding: "0 14px",
            backgroundColor: "#0f172a",
            color: "#ffffff",
            border: "1px solid #0f172a",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: 650,
            cursor: "pointer",
            boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
            transition: "all 150ms ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#1e293b";
            e.currentTarget.style.borderColor = "#1e293b";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#0f172a";
            e.currentTarget.style.borderColor = "#0f172a";
          }}
        >
          <User size={13} aria-hidden="true" />
          <span>Supervisor</span>
        </button>
      </div>

      {/* Toolbar: Filters & Search */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "10px",
          marginBottom: "18px",
          paddingBottom: "14px",
          borderBottom: "1px solid #f1f5f9",
        }}
      >
        {/* Filter Pills */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {[
            { id: "all", label: `All Logs (${logs.length})` },
            {
              id: "Muster & Shift Progress",
              label: "Muster & Shift",
            },
            {
              id: "Shift Completion Sign-off",
              label: "Sign-offs",
            },
            {
              id: "Milestone Verification",
              label: "Milestones",
            },
            {
              id: "Safety & Logistics",
              label: "Safety",
            },
          ].map((cat) => {
            const isActive = filterCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setFilterCategory(cat.id)}
                style={{
                  padding: "5px 11px",
                  fontSize: "11.5px",
                  fontWeight: isActive ? 700 : 500,
                  borderRadius: "9999px",
                  border: isActive ? "1px solid #0f172a" : "1px solid #e2e8f0",
                  backgroundColor: isActive ? "#0f172a" : "#ffffff",
                  color: isActive ? "#ffffff" : "#475569",
                  cursor: "pointer",
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div style={{ position: "relative", minWidth: "240px" }}>
          <Search
            size={13}
            color="#94a3b8"
            style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }}
          />
          <input
            type="text"
            placeholder="Search logs, notes, or supervisor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              height: "32px",
              paddingLeft: "30px",
              paddingRight: "10px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "12px",
              color: "#0f172a",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
      </div>

      {/* Logs List */}
      {filteredLogs.length === 0 ? (
        <div
          style={{
            padding: "36px 16px",
            textAlign: "center",
            color: "#64748b",
            backgroundColor: "#f8fafc",
            borderRadius: "10px",
          }}
        >
          <FileText size={24} color="#94a3b8" style={{ margin: "0 auto 8px" }} />
          <p style={{ margin: 0, fontWeight: 700, color: "#0f172a", fontSize: "13px" }}>
            No matching history logs found
          </p>
          <p style={{ margin: "4px 0 0", fontSize: "12px" }}>
            Try adjusting your search query or category filters.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filteredLogs.map((log) => {
            const badgeStyle = getCategoryBadgeStyle(log.category);
            return (
              <div
                key={log.id}
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  padding: "14px 16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.02)",
                }}
              >
                {/* Log Card Header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "8px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: "6px",
                        backgroundColor: badgeStyle.bg,
                        color: badgeStyle.color,
                        border: `1px solid ${badgeStyle.border}`,
                      }}
                    >
                      {log.category}
                    </span>
                    <strong style={{ fontSize: "13px", color: "#0f172a" }}>
                      {log.date}
                    </strong>
                    {log.shiftNumber && (
                      <span
                        style={{
                          fontSize: "11px",
                          color: "#64748b",
                          fontFamily: "monospace",
                          backgroundColor: "#f1f5f9",
                          padding: "1px 6px",
                          borderRadius: "4px",
                        }}
                      >
                        {log.shiftNumber}
                      </span>
                    )}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11.5px", color: "#64748b" }}>
                    <Clock size={12} />
                    <span>{log.time}</span>
                    <span>•</span>
                    <User size={12} />
                    <span>{log.author} ({log.authorRole})</span>
                  </div>
                </div>

                {/* Log Content */}
                <p
                  style={{
                    margin: 0,
                    fontSize: "12.5px",
                    color: "#334155",
                    lineHeight: 1.5,
                  }}
                >
                  {log.content}
                </p>

                {/* Bottom Meta & Associated Tasks */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "8px",
                    paddingTop: "6px",
                    borderTop: "1px dashed #f1f5f9",
                  }}
                >
                  {log.tasksCompleted && log.tasksCompleted.length > 0 ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>
                        Tasks:
                      </span>
                      {log.tasksCompleted.map((task) => (
                        <span
                          key={task}
                          style={{
                            fontSize: "11px",
                            backgroundColor: "#f0fdf4",
                            color: "#16a34a",
                            border: "1px solid #bbf7d0",
                            borderRadius: "4px",
                            padding: "1px 6px",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "3px",
                          }}
                        >
                          <CheckCircle2 size={10} />
                          {task}
                        </span>
                      ))}
                    </div>
                  ) : <div />}

                  {log.attendanceSummary && (
                    <div
                      style={{
                        fontSize: "11px",
                        fontWeight: 650,
                        color: "#475569",
                        backgroundColor: "#f8fafc",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      {log.attendanceSummary}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Site Supervisor Profile Modal */}
      {isSupervisorProfileOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="supervisor-profile-modal-title"
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "16px",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsSupervisorProfileOpen(false);
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "480px",
              boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.25)",
              overflow: "hidden",
              border: "1px solid #e2e8f0",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 20px",
                borderBottom: "1px solid #f1f5f9",
                backgroundColor: "#f8fafc",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ShieldCheck size={18} color="#2563eb" />
                <div>
                  <h3
                    id="supervisor-profile-modal-title"
                    style={{
                      fontSize: "15px",
                      fontWeight: 700,
                      color: "#0f172a",
                      margin: 0,
                    }}
                  >
                    Site Supervisor Profile
                  </h3>
                  <p style={{ fontSize: "11.5px", color: "#64748b", margin: "2px 0 0" }}>
                    Verified Kallisto On-site Personnel · {deployment.projectName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSupervisorProfileOpen(false)}
                aria-label="Close supervisor profile"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "30px",
                  height: "30px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  backgroundColor: "#ffffff",
                  color: "#64748b",
                  cursor: "pointer",
                }}
              >
                <X size={15} />
              </button>
            </div>

            {/* Profile Content */}
            <div style={{ padding: "20px" }}>
              {/* Supervisor Hero Banner */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  padding: "14px 16px",
                  backgroundColor: "#f8fafc",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  marginBottom: "16px",
                }}
              >
                <div style={{ position: "relative" }}>
                  <div
                    style={{
                      width: "52px",
                      height: "52px",
                      borderRadius: "50%",
                      backgroundColor: "#0f172a",
                      color: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "18px",
                      fontWeight: 700,
                    }}
                  >
                    {supervisorInitials}
                  </div>
                  <span
                    style={{
                      position: "absolute",
                      bottom: "1px",
                      right: "1px",
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      backgroundColor: "#22c55e",
                      border: "2px solid #ffffff",
                    }}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <h4 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>
                      {supervisorName}
                    </h4>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "3px",
                        backgroundColor: "#eff6ff",
                        color: "#2563eb",
                        border: "1px solid #bfdbfe",
                        borderRadius: "9999px",
                        padding: "1px 7px",
                        fontSize: "10.5px",
                        fontWeight: 600,
                      }}
                    >
                      <CheckCircle2 size={10} />
                      Verified
                    </span>
                  </div>
                  <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#475569", fontWeight: 500 }}>
                    Certified Site Supervisor &amp; QA Lead
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                    <span
                      style={{
                        fontSize: "11px",
                        backgroundColor: "#f0fdf4",
                        color: "#16a34a",
                        padding: "1px 6px",
                        borderRadius: "4px",
                        fontWeight: 600,
                      }}
                    >
                      ● On Shift
                    </span>
                    <span style={{ fontSize: "11px", color: "#64748b" }}>
                      Shift: {deployment.shift}
                    </span>
                  </div>
                </div>
              </div>

              {/* Information Cards Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "10px",
                    padding: "10px 12px",
                  }}
                >
                  <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 600, display: "block" }}>
                    Assigned Project
                  </span>
                  <span style={{ fontSize: "12.5px", fontWeight: 700, color: "#0f172a", marginTop: "2px", display: "block" }}>
                    {deployment.projectName}
                  </span>
                  <span style={{ fontSize: "11px", color: "#64748b", display: "flex", alignItems: "center", gap: "3px", marginTop: "2px" }}>
                    <MapPin size={11} />
                    {deployment.location}
                  </span>
                </div>

                <div
                  style={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "10px",
                    padding: "10px 12px",
                  }}
                >
                  <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 600, display: "block" }}>
                    Daily Attendance &amp; Logs
                  </span>
                  <span style={{ fontSize: "12.5px", fontWeight: 700, color: "#0f172a", marginTop: "2px", display: "block" }}>
                    {deployment.attendance?.present ? `${deployment.attendance.present} / ${deployment.attendance.total} workers present` : "Recorded"}
                  </span>
                  <span style={{ fontSize: "11px", color: "#16a34a", display: "flex", alignItems: "center", gap: "3px", marginTop: "2px", fontWeight: 600 }}>
                    <ClipboardList size={11} />
                    {logs.length} Shift Logs Recorded
                  </span>
                </div>
              </div>

              {/* Direct Contact & Oversight */}
              <div
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  padding: "12px 14px",
                  marginBottom: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>
                    Direct Contact
                  </span>
                  <span style={{ fontSize: "11px", color: "#2563eb", fontWeight: 600 }}>
                    On-Site Dispatch
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12.5px", color: "#0f172a", fontWeight: 600 }}>
                  <Phone size={13} color="#64748b" />
                  <span>+91 98470 21980</span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12.5px", color: "#0f172a", fontWeight: 500 }}>
                  <Mail size={13} color="#64748b" />
                  <span>supervisor.rajeev@kallistopartners.in</span>
                </div>

                <div
                  style={{
                    paddingTop: "8px",
                    borderTop: "1px dashed #f1f5f9",
                    fontSize: "11.5px",
                    color: "#475569",
                    lineHeight: 1.4,
                  }}
                >
                  <strong style={{ color: "#0f172a" }}>Oversight Scope: </strong>
                  Muster verification, work-front distribution, scaffolding safety clearance, and daily subcontractor progress audits.
                </div>
              </div>

              {/* Footer Actions */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  gap: "10px",
                  paddingTop: "4px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsSupervisorProfileOpen(false)}
                  style={{
                    padding: "8px 16px",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#475569",
                    backgroundColor: "#f1f5f9",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  Close
                </button>
                <a
                  href="tel:+919847021980"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 16px",
                    fontSize: "12px",
                    fontWeight: 650,
                    color: "#ffffff",
                    backgroundColor: "#0f172a",
                    border: "none",
                    borderRadius: "8px",
                    textDecoration: "none",
                    cursor: "pointer",
                  }}
                >
                  <Phone size={13} />
                  <span>Call Supervisor</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
