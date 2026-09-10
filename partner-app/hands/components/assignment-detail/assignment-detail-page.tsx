"use client";

import React, { useState } from "react";
import { 
  MapPin, 
  PhoneCall, 
} from "lucide-react";
import { AssignmentDeployment } from "../../types/assignment-domain";
import { OdinDeploymentBrief } from "./odin-deployment-brief";
import { AssignmentUpdatesPanel } from "./assignment-updates-panel";
import { AssignmentComplaintsPanel } from "./assignment-complaints-panel";
import { AssignmentAccountsPanel } from "./assignment-accounts-panel";
import { AssignmentActivitiesPanel } from "./assignment-activities-panel";
import styles from "./assignment-detail.module.css";

interface AssignmentDetailPageProps {
  assignment: AssignmentDeployment;
}

export function AssignmentDetailPage({ assignment }: AssignmentDetailPageProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "complaints" | "accounts" | "activities">("overview");
  const [workerSearch, setWorkerSearch] = useState("");

  const isCompleted = assignment.status === "completed";
  const openComplaintsCount = assignment.complaints?.filter((c) => c.status === "open").length || 0;

  // Filtered workers list
  const filteredCrew = assignment.crew.filter((w) => {
    if (!workerSearch.trim()) return true;
    const q = workerSearch.toLowerCase();
    return (
      w.name.toLowerCase().includes(q) ||
      w.trade.toLowerCase().includes(q) ||
      w.level.toLowerCase().includes(q) ||
      w.status.toLowerCase().includes(q)
    );
  });

  const totalAttendance = assignment.attendance.total > 0
    ? assignment.attendance.total
    : (assignment.attendance.present + assignment.attendance.unmarked + assignment.attendance.absent) || 1;

  const attendancePercent = assignment.attendance.total > 0
    ? Math.round((assignment.attendance.present / assignment.attendance.total) * 100)
    : 0;

  const presentPercent = (assignment.attendance.present / totalAttendance) * 100;
  const unmarkedPercent = (assignment.attendance.unmarked / totalAttendance) * 100;
  const absentPercent = (assignment.attendance.absent / totalAttendance) * 100;

  return (
    <div className={styles.pageWrapper}>
      {/* ── Two-Column Layout (Matching /projects/prj-1 Architecture) ── */}
      <div className={styles.twoColGrid}>
        {/* ── Left Column: Operations Workspace ── */}
        <main className={styles.leftWorkspaceCol}>
          {/* Header Block (Title Row with Actions, Submeta Row with Badges) */}
          <header className={styles.headerBlock} aria-label="Assignment Details Header">
            <div className={styles.titleRow}>
              <h1 className={styles.assignmentMainTitle}>{assignment.clientName}</h1>

              <div className={styles.headerActionsCol}>
                <a
                  href={`tel:${assignment.supervisor.phone}`}
                  className={styles.callBtn}
                  title={`Call Supervisor ${assignment.supervisor.name}`}
                >
                  <PhoneCall size={13} />
                  <span>Call Supervisor ({assignment.supervisor.name})</span>
                </a>
              </div>
            </div>

            <div className={styles.subMetaRow}>
              <div className={styles.subMetaLeft}>
                <span className={styles.metaItem}>
                  <MapPin size={14} strokeWidth={2} className={styles.locationPinIcon} aria-hidden="true" />
                  <span>{assignment.projectName} · {assignment.location}</span>
                </span>
              </div>

              <div className={styles.badgesRow}>
                {isCompleted ? (
                  <span className={styles.statusCompletedBadge}>
                    ✓ Completed Successfully
                  </span>
                ) : (
                  <span className={styles.statusActiveBadge}>
                    ● Active Deployment
                  </span>
                )}

                <span className={styles.timelineDayPill}>
                  {isCompleted
                    ? `${assignment.totalDays} of ${assignment.totalDays} Shifts Delivered`
                    : `Day ${assignment.currentDay} of ${assignment.totalDays}`}
                </span>

                <span className={styles.siteStatusPill}>
                  {assignment.siteStatus}
                </span>

                <span className={`${styles.healthPill} ${styles[`health_${assignment.health}`]}`}>
                  {assignment.health === "on_track"
                    ? "● On Track"
                    : assignment.health === "attention_required"
                    ? "● Attention Required"
                    : "● At Risk"}
                </span>
              </div>
            </div>
          </header>
          {/* Segmented Tabs Bar */}
          <nav className={styles.tabsContainer} aria-label="Assignment Sections">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={`${styles.tabBtn} ${activeTab === "overview" ? styles.tabBtnActive : ""}`}
            >
              <span>Overview</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("activities")}
              className={`${styles.tabBtn} ${activeTab === "activities" ? styles.tabBtnActive : ""}`}
            >
              <span>Activities</span>
              {(assignment.activities?.length || 0) > 0 && (
                <span className={styles.tabPillCount}>
                  {assignment.activities?.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("complaints")}
              className={`${styles.tabBtn} ${activeTab === "complaints" ? styles.tabBtnActive : ""}`}
            >
              <span>Site Complaints</span>
              {openComplaintsCount > 0 ? (
                <span className={`${styles.tabPillCount} ${styles.tabPillCountAlert}`}>
                  {openComplaintsCount} Open
                </span>
              ) : (
                <span className={styles.tabPillCount}>0</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("accounts")}
              className={`${styles.tabBtn} ${activeTab === "accounts" ? styles.tabBtnActive : ""}`}
            >
              <span>Accounts & Billing</span>
            </button>
          </nav>

          {/* Tab 1: Overview */}
          {activeTab === "overview" && (
            <div className={styles.overviewContent}>
              {/* ODIN Project Brief Card */}
              <OdinDeploymentBrief assignment={assignment} />

              {/* 4-Card Snapshot Grid */}
              <div className={styles.snapshotGrid}>
                <div className={styles.snapshotCard}>
                  <span className={styles.snapshotLabel}>Crew Deployed</span>
                  <span className={styles.snapshotValue}>
                    {assignment.totalWorkersAssigned} Workers
                  </span>
                  <span className={styles.snapshotSub}>{assignment.tradesBreakdown}</span>
                </div>

                <div className={styles.snapshotCard}>
                  <span className={styles.snapshotLabel}>Shift Window</span>
                  <span className={styles.snapshotValue}>
                    {assignment.startDate} – {assignment.endDate}
                  </span>
                  <span className={styles.snapshotSub}>
                    {assignment.totalDays} Total Shifts
                  </span>
                </div>

                <div className={styles.snapshotCard}>
                  <span className={styles.snapshotLabel}>Supervisor</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "2px" }}>
                    <img
                      src={assignment.supervisor.avatar || "/assets/rahul-avatar.jpg"}
                      alt={assignment.supervisor.name}
                      style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        if (!target.src.endsWith("/assets/rahul-avatar.jpg")) {
                          target.src = "/assets/rahul-avatar.jpg";
                        }
                      }}
                    />
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span className={styles.snapshotValue} style={{ fontSize: "14.5px", lineHeight: "1.2" }}>{assignment.supervisor.name}</span>
                      <span className={styles.snapshotSub}>{assignment.supervisor.phone}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.snapshotCard}>
                  <span className={styles.snapshotLabel}>Today Attendance</span>
                  <span className={styles.snapshotValue}>
                    {assignment.attendance.present} / {assignment.attendance.total}
                  </span>
                  <span className={styles.snapshotSub}>
                    {attendancePercent}% Reported Present
                  </span>
                </div>
              </div>

              {/* Live Attendance Card */}
              <div className={styles.attendanceCard}>
                <div className={styles.attendanceHeaderRow}>
                  <h3 className={styles.attendanceTitle}>Live Shift Attendance</h3>
                  <div className={styles.attendancePillsRow}>
                    <div className={styles.attendancePillItem}>
                      <span
                        className={styles.attendancePillDot}
                        style={{ backgroundColor: "#00b875" }}
                      />
                      <span>{assignment.attendance.present} Present</span>
                    </div>

                    <div className={styles.attendancePillItem}>
                      <span
                        className={styles.attendancePillDot}
                        style={{ backgroundColor: "#fdbf4c" }}
                      />
                      <span>{assignment.attendance.unmarked} Unmarked</span>
                    </div>

                    <div className={styles.attendancePillItem}>
                      <span
                        className={styles.attendancePillDot}
                        style={{ backgroundColor: "#fb354c" }}
                      />
                      <span>{assignment.attendance.absent} Absent</span>
                    </div>
                  </div>
                </div>

                <div className={styles.attendanceProgressWrap}>
                  <div
                    className={styles.progressBarTrack}
                    role="progressbar"
                    aria-label="Live Shift Attendance"
                    aria-valuenow={Math.round(attendancePercent)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    {presentPercent > 0 && (
                      <div
                        className={styles.progressBarSegment}
                        style={{
                          width: `${presentPercent}%`,
                          backgroundColor: "#00b875",
                        }}
                        title={`${assignment.attendance.present} Present (${Math.round(presentPercent)}%)`}
                      />
                    )}
                    {unmarkedPercent > 0 && (
                      <div
                        className={styles.progressBarSegment}
                        style={{
                          width: `${unmarkedPercent}%`,
                          backgroundColor: "#fdbf4c",
                        }}
                        title={`${assignment.attendance.unmarked} Unmarked (${Math.round(unmarkedPercent)}%)`}
                      />
                    )}
                    {absentPercent > 0 && (
                      <div
                        className={styles.progressBarSegment}
                        style={{
                          width: `${absentPercent}%`,
                          backgroundColor: "#fb354c",
                        }}
                        title={`${assignment.attendance.absent} Absent (${Math.round(absentPercent)}%)`}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Crew Roster Card */}
              <div className={styles.rosterCard}>
                <div className={styles.rosterHeaderRow}>
                  <h3 className={styles.rosterTitle}>
                    Assigned Crew Roster ({filteredCrew.length} of {assignment.crew.length})
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <input
                      type="text"
                      placeholder="Search trade or worker..."
                      value={workerSearch}
                      onChange={(e) => setWorkerSearch(e.target.value)}
                      className={styles.rosterFilterInput}
                    />
                  </div>
                </div>

                <div className={styles.rosterList}>
                  {filteredCrew.length === 0 ? (
                    <div style={{ padding: "24px", textAlign: "center", color: "#64748b", fontSize: "13px" }}>
                    No workers matching &ldquo;{workerSearch}&rdquo;
                    </div>
                  ) : (
                    filteredCrew.map((worker) => (
                      <div key={worker.id} className={styles.rosterItemRow}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          {worker.avatar ? (
                            <img
                              src={worker.avatar}
                              alt={worker.name}
                              style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                            />
                          ) : (
                            <div
                              style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "50%",
                                backgroundColor: "#f1f5f9",
                                color: "#475569",
                                display: "grid",
                                placeItems: "center",
                                fontSize: "11px",
                                fontWeight: 700,
                                flexShrink: 0,
                                border: "1px solid #e2e8f0",
                              }}
                            >
                              {worker.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .substring(0, 2)
                                .toUpperCase()}
                            </div>
                          )}
                          <div className={styles.rosterMemberInfo}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span className={styles.rosterMemberName}>{worker.name}</span>
                              <span
                                style={{
                                  fontSize: "11px",
                                  fontWeight: 650,
                                  color: "#475569",
                                  backgroundColor: "#ffffff",
                                  border: "1px solid #e2e8f0",
                                  padding: "1.5px 6px",
                                  borderRadius: "4px",
                                }}
                              >
                                {worker.trade} ({worker.level})
                              </span>
                            </div>
                            <span className={styles.rosterMemberMeta}>
                              ID: {worker.id} • Phone: {worker.phone}
                              {worker.checkInTime && ` • Checked in: ${worker.checkInTime}`}
                            </span>
                          </div>
                        </div>

                        <div>
                          {isCompleted ? (
                            <span className={styles.rosterStatusCompleted}>
                              ✓ Completed
                            </span>
                          ) : worker.status === "Present" ? (
                            <span className={styles.rosterStatusPresent}>
                              ● Present
                            </span>
                          ) : worker.status === "Unmarked" ? (
                            <span className={styles.rosterStatusUnmarked}>
                              ⏳ Unmarked
                            </span>
                          ) : (
                            <span className={styles.rosterStatusAbsent}>
                              ✕ Absent
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Activities */}
          {activeTab === "activities" && (
            <AssignmentActivitiesPanel
              assignmentId={assignment.id}
              projectName={assignment.projectName}
              supervisorName={assignment.supervisor.name}
              assignment={assignment}
            />
          )}

          {/* Tab 3: Complaints */}
          {activeTab === "complaints" && (
            <AssignmentComplaintsPanel
              assignmentId={assignment.id}
              projectName={assignment.projectName}
              supervisorName={assignment.supervisor.name}
              contractorName="Apex Integrated Civil"
              initialComplaints={assignment.complaints}
            />
          )}

          {/* Tab 4: Accounts */}
          {activeTab === "accounts" && (
            <AssignmentAccountsPanel
              assignmentId={assignment.id}
              projectName={assignment.projectName}
              clientName={assignment.clientName}
              supervisorName={assignment.supervisor.name}
              accounts={assignment.accounts}
            />
          )}
        </main>

        {/* ── Right Column: Project Updates Feed (Images 2 & 3 Match) ── */}
        <AssignmentUpdatesPanel
          assignmentId={assignment.id}
          supervisorName={assignment.supervisor.name}
          contractorName="Apex Integrated Civil"
          initialUpdates={assignment.updates}
        />
      </div>
    </div>
  );
}
