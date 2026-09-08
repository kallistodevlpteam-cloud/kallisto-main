"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  X,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  Briefcase,
  Building2,
  CalendarClock,
  ShieldCheck,
} from "lucide-react";
import type { Deployment, DeploymentContractor } from "../types/hands.types";
import { getContractorWorkersSummary } from "../utils/contractor-workers";

interface ContractorAssignedWorkersModalProps {
  contractor: DeploymentContractor | null;
  deployment: Deployment;
  isOpen: boolean;
  onClose: () => void;
}

export function ContractorAssignedWorkersModal({
  contractor,
  deployment,
  isOpen,
  onClose,
}: ContractorAssignedWorkersModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "on-leave">("all");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const workersSummary = useMemo(() => {
    if (!contractor) return null;
    return getContractorWorkersSummary(contractor, deployment);
  }, [contractor, deployment]);

  const filteredWorkers = useMemo(() => {
    if (!workersSummary) return [];
    return workersSummary.assignedWorkers.filter((worker) => {
      if (statusFilter !== "all" && worker.status !== statusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = worker.name.toLowerCase().includes(q);
        const matchRole = worker.role.toLowerCase().includes(q);
        const matchTask = worker.taskAssignment?.toLowerCase().includes(q);
        const matchPhone = worker.phone?.toLowerCase().includes(q);
        if (!matchName && !matchRole && !matchTask && !matchPhone) {
          return false;
        }
      }
      return true;
    });
  }, [workersSummary, statusFilter, searchQuery]);

  if (!isOpen || !contractor || !workersSummary) return null;

  const initials =
    contractor.name
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "LC";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="contractor-workers-modal-title"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "16px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "640px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.25)",
          overflow: "hidden",
          border: "1px solid #e2e8f0",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "1px solid #f1f5f9",
            backgroundColor: "#f8fafc",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                backgroundColor: "#0f172a",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "13px",
                fontWeight: 700,
              }}
            >
              {initials}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <h3
                  id="contractor-workers-modal-title"
                  style={{
                    fontSize: "15px",
                    fontWeight: 700,
                    color: "#0f172a",
                    margin: 0,
                  }}
                >
                  {contractor.name} — Labour Details
                </h3>
                {contractor.badge && (
                  <span
                    style={{
                      fontSize: "10.5px",
                      fontWeight: 650,
                      backgroundColor: "#ecfdf5",
                      color: "#059669",
                      padding: "1px 7px",
                      borderRadius: "6px",
                      border: "1px solid #a7f3d0",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "3px",
                    }}
                  >
                    <ShieldCheck size={11} />
                    {contractor.badge}
                  </span>
                )}
              </div>
              <p style={{ fontSize: "11.5px", color: "#64748b", margin: "2px 0 0" }}>
                Assigned labours roster &amp; shift status for {deployment.projectName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close assigned labours modal"
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

        {/* Content Body */}
        <div style={{ padding: "18px 20px", overflowY: "auto", flex: 1 }}>
          {/* Key Metrics Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "10px",
              marginBottom: "16px",
            }}
          >
            {/* Total Workers */}
            <div
              style={{
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#64748b", fontSize: "11px", fontWeight: 650 }}>
                <Users size={13} />
                <span>Total Labours</span>
              </div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", marginTop: "4px" }}>
                {workersSummary.totalWorkers}
              </div>
              <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                {contractor.trade || "Tradespeople"} contracted
              </div>
            </div>

            {/* Active Workers */}
            <div
              style={{
                backgroundColor: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: "10px",
                padding: "12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#166534", fontSize: "11px", fontWeight: 650 }}>
                <CheckCircle2 size={13} />
                <span>Active Labours</span>
              </div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: "#15803d", marginTop: "4px" }}>
                {workersSummary.activeWorkers}
              </div>
              <div style={{ fontSize: "11px", color: "#16a34a", marginTop: "2px", fontWeight: 600 }}>
                ● {Math.round((workersSummary.activeWorkers / workersSummary.totalWorkers) * 100)}% muster recorded
              </div>
            </div>

            {/* On Leave Workers */}
            <div
              style={{
                backgroundColor: workersSummary.onLeaveWorkers > 0 ? "#fef3c7" : "#f8fafc",
                border: workersSummary.onLeaveWorkers > 0 ? "1px solid #fde68a" : "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "12px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  color: workersSummary.onLeaveWorkers > 0 ? "#92400e" : "#64748b",
                  fontSize: "11px",
                  fontWeight: 650,
                }}
              >
                <AlertCircle size={13} />
                <span>On Leave</span>
              </div>
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: 800,
                  color: workersSummary.onLeaveWorkers > 0 ? "#b45309" : "#0f172a",
                  marginTop: "4px",
                }}
              >
                {workersSummary.onLeaveWorkers}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: workersSummary.onLeaveWorkers > 0 ? "#b45309" : "#64748b",
                  marginTop: "2px",
                }}
              >
                {workersSummary.onLeaveWorkers > 0 ? "Absence noted" : "Full attendance"}
              </div>
            </div>
          </div>

          {/* Project & Shift Context Strip */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "10px",
              padding: "8px 12px",
              backgroundColor: "#f8fafc",
              border: "1px solid #f1f5f9",
              borderRadius: "8px",
              fontSize: "11.5px",
              color: "#475569",
              marginBottom: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Building2 size={13} color="#64748b" />
              <span>Project: <strong>{deployment.projectName}</strong></span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <CalendarClock size={13} color="#64748b" />
              <span>Shift: <strong>{deployment.shift}</strong></span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Briefcase size={13} color="#64748b" />
              <span>Supervisor: <strong>{deployment.supervisor}</strong></span>
            </div>
          </div>

          {/* Toolbar: Search & Filter Tabs */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "10px",
              marginBottom: "14px",
            }}
          >
            {/* Filter Pills */}
            <div style={{ display: "flex", gap: "6px" }}>
              {[
                { id: "all", label: `All (${workersSummary.totalWorkers})` },
                { id: "active", label: `Active (${workersSummary.activeWorkers})` },
                { id: "on-leave", label: `On Leave (${workersSummary.onLeaveWorkers})` },
              ].map((tab) => {
                const isActive = statusFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setStatusFilter(tab.id as "all" | "active" | "on-leave")}
                    style={{
                      padding: "4px 10px",
                      fontSize: "11.5px",
                      fontWeight: isActive ? 700 : 500,
                      borderRadius: "9999px",
                      border: isActive ? "1px solid #0f172a" : "1px solid #e2e8f0",
                      backgroundColor: isActive ? "#0f172a" : "#ffffff",
                      color: isActive ? "#ffffff" : "#475569",
                      cursor: "pointer",
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Search */}
            <div style={{ position: "relative", minWidth: "220px" }}>
              <Search
                size={13}
                color="#94a3b8"
                style={{ position: "absolute", left: "9px", top: "50%", transform: "translateY(-50%)" }}
              />
              <input
                type="text"
                placeholder="Search worker, role, task..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  height: "30px",
                  paddingLeft: "28px",
                  paddingRight: "8px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  fontSize: "12px",
                  color: "#0f172a",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          {/* Workers Roster List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {filteredWorkers.length === 0 ? (
              <div
                style={{
                  padding: "24px",
                  textAlign: "center",
                  color: "#64748b",
                  backgroundColor: "#f8fafc",
                  borderRadius: "8px",
                  fontSize: "12.5px",
                }}
              >
                No assigned workers match your search or filter criteria.
              </div>
            ) : (
              filteredWorkers.map((worker) => {
                const workerInitials = worker.name
                  .split(" ")
                  .slice(0, 2)
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase();
                const isActive = worker.status === "active";

                return (
                  <div
                    key={worker.id}
                    style={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "10px",
                      padding: "10px 14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "12px",
                      boxShadow: "0 1px 2px rgba(15, 23, 42, 0.02)",
                    }}
                  >
                    {/* Worker Info */}
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: 0 }}>
                      <div style={{ position: "relative", flexShrink: 0 }}>
                        <div
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            backgroundColor: isActive ? "#0f172a" : "#64748b",
                            color: "#ffffff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "11px",
                            fontWeight: 700,
                          }}
                        >
                          {workerInitials}
                        </div>
                        <span
                          style={{
                            position: "absolute",
                            bottom: "-1px",
                            right: "-1px",
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            backgroundColor: isActive ? "#22c55e" : "#f59e0b",
                            border: "1.5px solid #ffffff",
                          }}
                        />
                      </div>

                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>
                            {worker.name}
                          </span>
                          <span
                            style={{
                              fontSize: "10px",
                              fontWeight: 600,
                              padding: "1px 6px",
                              borderRadius: "4px",
                              backgroundColor: "#f1f5f9",
                              color: "#475569",
                            }}
                          >
                            {worker.role}
                          </span>
                        </div>
                        {worker.taskAssignment && (
                          <p
                            style={{
                              margin: "2px 0 0",
                              fontSize: "11.5px",
                              color: "#64748b",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                            title={worker.taskAssignment}
                          >
                            <strong>Task:</strong> {worker.taskAssignment}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Status & Check-In */}
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
                      <div style={{ textAlign: "right" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            fontSize: "11px",
                            fontWeight: 650,
                            padding: "2px 8px",
                            borderRadius: "6px",
                            backgroundColor: isActive ? "#f0fdf4" : "#fef3c7",
                            color: isActive ? "#16a34a" : "#b45309",
                            border: isActive ? "1px solid #bbf7d0" : "1px solid #fde68a",
                          }}
                        >
                          {isActive ? "● Active on Site" : "○ On Leave"}
                        </span>
                        <div style={{ fontSize: "10.5px", color: "#64748b", marginTop: "2px" }}>
                          <Clock size={10} style={{ display: "inline", verticalAlign: "middle", marginRight: "3px" }} />
                          {worker.checkInTime}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 20px",
            borderTop: "1px solid #f1f5f9",
            backgroundColor: "#f8fafc",
            flexShrink: 0,
          }}
        >
          <div style={{ fontSize: "11.5px", color: "#64748b" }}>
            Showing {filteredWorkers.length} of {workersSummary.totalWorkers} workers
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "7px 16px",
              fontSize: "12px",
              fontWeight: 650,
              backgroundColor: "#0f172a",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
