"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Phone,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import {
  LocationDuotoneIcon,
  CalendarDuotoneIcon,
} from "@/components/layout/sidebar-icons";
import { AssignmentDeployment } from "../../types/assignment-domain";
import { getProviderDisplayDetails } from "../../mock/provider-profiles-mock-data";
import styles from "./hands-assignments.module.css";

interface HandsAssignmentDrawerProps {
  assignment: AssignmentDeployment | null;
  isOpen: boolean;
  onClose: () => void;
}

export function HandsAssignmentDrawer({
  assignment,
  isOpen,
  onClose,
}: HandsAssignmentDrawerProps) {
  const router = useRouter();

  if (!isOpen || !assignment) return null;

  const providerDisplay = getProviderDisplayDetails(assignment.clientName);

  return (
    <div className={styles.drawerOverlay} onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-assignment-title">
      <div
        className={styles.assignmentDrawer}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Modal Header (Exact Match to Request Modal Header) */}
        <div className={styles.drawerHeader}>
          <div style={{ display: "flex", flexDirection: "column", gap: "3px", minWidth: 0 }}>
            {/* Top Badges: Status + Day count + View Profile */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px", flexWrap: "wrap" }}>
              <span className={styles.statusActiveBadge}>{assignment.status.toUpperCase()}</span>
              <span className={styles.timelineDayPill}>
                Day {assignment.currentDay} of {assignment.totalDays}
              </span>
              <button
                type="button"
                onClick={() => {
                  router.push(`/partner/hands/profile/${providerDisplay.slug}`);
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  border: "none",
                  background: "transparent",
                  color: "#2563eb",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  padding: 0,
                  marginLeft: "4px",
                }}
              >
                <span>View Profile</span>
                <ExternalLink size={12} />
              </button>
            </div>

            <h2 id="modal-assignment-title" style={{ margin: 0, fontSize: "19px", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em" }}>
              {assignment.clientName}
            </h2>

            <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "#64748b", fontWeight: 500 }}>
              <LocationDuotoneIcon size={14} style={{ color: "#2563eb", flexShrink: 0 }} />
              <span><strong>{assignment.projectName}</strong> · {assignment.location}</span>
            </div>
          </div>

          <button
            type="button"
            className={styles.drawerCloseBtn}
            onClick={onClose}
            aria-label="Close assignment details"
          >
            <X size={15} />
          </button>
        </div>

        {/* 2. Modal Body */}
        <div className={styles.drawerBody}>
          {/* Card 1: Attendance Status Briefing */}
          <div
            style={{
              backgroundColor: "#f8fafc",
              borderRadius: "12px",
              padding: "14px 16px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              boxShadow: "0 1px 2px rgba(15, 23, 42, 0.03)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", flexWrap: "wrap" }}>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 750,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "#64748b",
                }}
              >
                Attendance Status
              </span>

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  fontSize: "11.5px",
                  fontWeight: 600,
                  color: "#475569",
                  backgroundColor: "#ffffff",
                  padding: "3px 8px",
                  borderRadius: "6px",
                }}
              >
                <CalendarDuotoneIcon size={13} style={{ color: "#2563eb" }} />
                <span>{assignment.startDate} – {assignment.endDate}</span>
              </div>
            </div>

            <div style={{ fontSize: "17px", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.01em" }}>
              {assignment.attendance.present} / {assignment.attendance.total} Present Today
            </div>

            {assignment.attendance.unmarked > 0 ? (
              <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "#d97706", fontWeight: 600 }}>
                <AlertTriangle size={13} />
                <span>{assignment.attendance.unmarked} workers pending check-in</span>
              </div>
            ) : assignment.attendance.absent > 0 ? (
              <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "#dc2626", fontWeight: 600 }}>
                <AlertCircle size={13} />
                <span>{assignment.attendance.absent} workers absent today</span>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "#059669", fontWeight: 600 }}>
                <CheckCircle2 size={13} />
                <span>All workers deployed and attendance reported</span>
              </div>
            )}
          </div>

          {/* Card 2: Site Supervisor */}
          <div
            style={{
              backgroundColor: "#f8fafc",
              borderRadius: "12px",
              padding: "12px 14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              boxShadow: "0 1px 2px rgba(15, 23, 42, 0.03)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  backgroundColor: "#eff6ff",
                  color: "#2563eb",
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 750,
                  fontSize: "14px",
                  boxShadow: "0 1px 2px rgba(37, 99, 235, 0.1)",
                }}
              >
                {assignment.supervisor.name[0]}
              </div>
              <div>
                <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 500, display: "block" }}>
                  Site Supervisor
                </span>
                <div style={{ fontSize: "13.5px", fontWeight: 750, color: "#0f172a" }}>
                  {assignment.supervisor.name}
                </div>
              </div>
            </div>

            <a
              href={`tel:${assignment.supervisor.phone}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 14px",
                borderRadius: "8px",
                backgroundColor: "#0f172a",
                color: "#ffffff",
                fontSize: "12px",
                fontWeight: 650,
                textDecoration: "none",
                transition: "all 0.14s ease",
              }}
            >
              <Phone size={12} />
              <span>Call</span>
            </a>
          </div>

          {/* Card 3: Deployed Crew Roster */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 2px" }}>
              <h4
                style={{
                  margin: 0,
                  fontSize: "11px",
                  fontWeight: 750,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "#64748b",
                }}
              >
                Deployed Crew Roster ({assignment.totalWorkersAssigned})
              </h4>
              <span style={{ fontSize: "11.5px", color: "#64748b", fontWeight: 500 }}>
                {assignment.tradesBreakdown}
              </span>
            </div>

            <div className={styles.crewRosterList}>
              {assignment.crew.map((member) => (
                <div key={member.id} className={styles.crewMemberRow}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "13px", color: "#0f172a" }}>
                      {member.name}
                    </div>
                    <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 500 }}>
                      {member.trade} · {member.level}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {member.checkInTime && (
                      <span style={{ fontSize: "11px", color: "#64748b", fontFamily: "monospace" }}>
                        {member.checkInTime}
                      </span>
                    )}
                    <span
                      className={
                        member.status === "Present"
                          ? styles.crewStatusPresent
                          : member.status === "Absent"
                          ? styles.crewStatusAbsent
                          : styles.crewStatusUnmarked
                      }
                    >
                      {member.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
