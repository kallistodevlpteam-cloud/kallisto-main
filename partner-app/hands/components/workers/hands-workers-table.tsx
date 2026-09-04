"use client";

import React, { useState, useEffect } from "react";
import {
  Check,
  Clock,
  UserCheck,
  UserPlus,
  AlertTriangle,
  MoreHorizontal,
  Eye,
  Sparkles,
  Copy,
} from "lucide-react";
import { StudioDuotoneIcon } from "@/components/layout/sidebar-icons";
import { WorkerProfile, WorkerAvailability } from "../../types/worker-domain";
import styles from "./hands-workers.module.css";

interface HandsWorkersTableProps {
  workers: WorkerProfile[];
  selectedWorkerId?: string;
  onSelectWorker: (worker: WorkerProfile) => void;
  onOpenAddWorker: () => void;
  onAskOdinForWorker?: (worker: WorkerProfile) => void;
}

export function HandsWorkersTable({
  workers,
  selectedWorkerId,
  onSelectWorker,
  onOpenAddWorker,
  onAskOdinForWorker,
}: HandsWorkersTableProps) {
  const [openMenuWorkerId, setOpenMenuWorkerId] = useState<string | null>(null);

  // Close actions menu on outside click
  useEffect(() => {
    if (!openMenuWorkerId) return;
    function handleOutsideClick(e: MouseEvent | PointerEvent) {
      const target = e.target as HTMLElement | null;
      if (target && target.closest && target.closest("[data-worker-actions]")) {
        return;
      }
      setOpenMenuWorkerId(null);
    }
    window.addEventListener("pointerdown", handleOutsideClick);
    return () => window.removeEventListener("pointerdown", handleOutsideClick);
  }, [openMenuWorkerId]);

  const getAvailabilityClass = (status: WorkerAvailability) => {
    switch (status) {
      case "Available":
        return styles.statusAvailable;
      case "Assigned":
        return styles.statusAssigned;
      case "Unavailable":
        return styles.statusUnavailable;
      default:
        return styles.statusUnavailable;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const handleCopyId = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(id);
    setOpenMenuWorkerId(null);
  };

  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableWrapper}>
        <table className={styles.workersTable} aria-label="Workers Directory">
          <thead>
            <tr className={styles.tableHeaderRow}>
              <th className={styles.tableHeaderCell}>Worker</th>
              <th className={styles.tableHeaderCell}>Trade</th>
              <th className={styles.tableHeaderCell}>Level</th>
              <th className={styles.tableHeaderCell}>Experience</th>
              <th className={styles.tableHeaderCell}>Availability</th>
              <th className={styles.tableHeaderCell}>Current Assignment</th>
              <th className={styles.tableHeaderCell}>Verification</th>
              <th className={styles.tableHeaderCell} style={{ textAlign: "right", width: "48px" }}></th>
            </tr>
          </thead>
          <tbody>
            {workers.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <div className={styles.emptyState}>
                    <UserCheck size={32} style={{ color: "#94a3b8" }} />
                    <h4 className={styles.emptyTitle}>No Workers Found</h4>
                    <p className={styles.emptySubtitle}>
                      No registered workers match your current search and filter criteria. Try resetting filters or register a new worker.
                    </p>
                    <button
                      type="button"
                      className={styles.addWorkerBtn}
                      onClick={onOpenAddWorker}
                    >
                      <StudioDuotoneIcon size={16} />
                      <span>Add Worker</span>
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              workers.map((worker) => {
                const isSelected = selectedWorkerId === worker.id;
                const isMenuOpen = openMenuWorkerId === worker.id;
                return (
                  <tr
                    key={worker.id}
                    className={`${styles.tableBodyRow} ${
                      isSelected ? styles.tableBodyRowSelected : ""
                    }`}
                    onClick={() => onSelectWorker(worker)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSelectWorker(worker);
                      }
                    }}
                    aria-label={`Select ${worker.name}, ${worker.trade}`}
                  >
                    {/* Worker Cell */}
                    <td className={styles.tableCell}>
                      <div className={styles.workerProfileCell}>
                        <div className={styles.avatarCircle}>
                          {getInitials(worker.name)}
                        </div>
                        <div className={styles.workerMeta}>
                          <span className={styles.workerName}>{worker.name}</span>
                          <span className={styles.workerId}>{worker.id}</span>
                        </div>
                      </div>
                    </td>

                    {/* Trade Cell */}
                    <td className={styles.tableCell}>
                      <span className={styles.tradeBadge}>{worker.trade}</span>
                    </td>

                    {/* Level Cell */}
                    <td className={styles.tableCell}>
                      <span className={styles.levelBadge}>
                        {worker.level || (worker.experienceYears >= 8 ? "Senior" : worker.experienceYears >= 4 ? "Skilled" : "Helper")}
                      </span>
                    </td>

                    {/* Experience Cell */}
                    <td className={styles.tableCell}>
                      <span className={styles.experienceText}>
                        {worker.experienceYears} Years
                      </span>
                    </td>

                    {/* Availability Cell */}
                    <td className={styles.tableCell}>
                      <span
                        className={`${styles.statusPill} ${getAvailabilityClass(
                          worker.availability
                        )}`}
                      >
                        <span className={styles.statusDot} />
                        {worker.availability}
                      </span>
                    </td>

                    {/* Current Assignment Cell */}
                    <td className={styles.tableCell}>
                      {worker.currentAssignment ? (
                        <span className={styles.assignmentText}>
                          {worker.currentAssignment.projectName}
                        </span>
                      ) : (
                        <span className={styles.assignmentEmpty}>—</span>
                      )}
                    </td>

                    {/* Verification Status Cell */}
                    <td className={styles.tableCell}>
                      {worker.verificationStatus === "Verified" ? (
                        <span className={`${styles.verificationPill} ${styles.verified}`}>
                          <Check size={12} className={styles.checkIcon} />
                          Verified
                        </span>
                      ) : (
                        <span className={`${styles.verificationPill} ${styles.pendingVerification}`}>
                          <Clock size={12} className={styles.uncheckIcon} />
                          Pending
                        </span>
                      )}
                      {worker.needsAttentionReason && (
                        <span
                          title={worker.needsAttentionReason}
                          style={{ marginLeft: "6px", display: "inline-flex", verticalAlign: "middle" }}
                        >
                          <AlertTriangle size={13} style={{ color: "#f59e0b" }} />
                        </span>
                      )}
                    </td>

                    {/* Actions: Three Dots Menu */}
                    <td
                      className={styles.tableCell}
                      style={{ textAlign: "right", position: "relative" }}
                      data-worker-actions
                    >
                      <button
                        type="button"
                        className={styles.moreActionsBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuWorkerId(isMenuOpen ? null : worker.id);
                        }}
                        aria-label={`Actions for ${worker.name}`}
                        aria-expanded={isMenuOpen}
                      >
                        <MoreHorizontal size={16} />
                      </button>

                      {isMenuOpen && (
                        <div className={styles.actionMenuPopover}>
                          <button
                            type="button"
                            className={styles.actionMenuItem}
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuWorkerId(null);
                              onSelectWorker(worker);
                            }}
                          >
                            <Eye size={13} color="#64748b" />
                            <span>View Profile</span>
                          </button>

                          {onAskOdinForWorker && (
                            <button
                              type="button"
                              className={styles.actionMenuItem}
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuWorkerId(null);
                                onAskOdinForWorker(worker);
                              }}
                            >
                              <Sparkles size={13} color="#0f172a" />
                              <span>Ask Odin</span>
                            </button>
                          )}

                          <button
                            type="button"
                            className={styles.actionMenuItem}
                            onClick={(e) => handleCopyId(e, worker.id)}
                          >
                            <Copy size={13} color="#64748b" />
                            <span>Copy ID</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
