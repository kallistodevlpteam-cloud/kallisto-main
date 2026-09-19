"use client";

import React, { useState } from "react";
import { MapPin, PhoneCall } from "lucide-react";
import { AssignmentDeployment, AssignedWorkerRecord, AssignmentSiteUpdate, AssignmentComplaint } from "../../types/assignment-domain";
import { OdinDeploymentBrief } from "./odin-deployment-brief";
import { AssignmentUpdatesPanel } from "./assignment-updates-panel";
import { AssignmentComplaintsPanel } from "./assignment-complaints-panel";
import { AssignmentAccountsPanel } from "./assignment-accounts-panel";
import { AssignmentActivitiesPanel } from "./assignment-activities-panel";
import { AssignmentReplacementModal, ReplacementCandidate } from "./assignment-replacement-modal";
import styles from "./assignment-detail.module.css";

interface AssignmentDetailPageProps {
  assignment: AssignmentDeployment;
}

export function AssignmentDetailPage({ assignment: initialAssignment }: AssignmentDetailPageProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "complaints" | "accounts" | "activities">("overview");
  const [workerSearch, setWorkerSearch] = useState("");
  const [currentAssignment, setCurrentAssignment] = useState<AssignmentDeployment>(initialAssignment);
  const [isReplacementModalOpen, setIsReplacementModalOpen] = useState(false);
  const [targetAbsentWorker, setTargetAbsentWorker] = useState<AssignedWorkerRecord | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isCompleted = currentAssignment.status === "completed";
  const openComplaintsCount = currentAssignment.complaints?.filter((c: AssignmentComplaint) => c.status === "open").length || 0;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleOpenReplacementModal = (worker: AssignedWorkerRecord | null = null) => {
    setTargetAbsentWorker(worker);
    setIsReplacementModalOpen(true);
  };

  const handleAssignReplacement = (
    candidate: ReplacementCandidate,
    timePeriodLabel: string = "Replacement",
    workerToReplace?: AssignedWorkerRecord | null
  ) => {
    const effectiveTargetWorker = workerToReplace || targetAbsentWorker;
    const newWorkerRecord: AssignedWorkerRecord = {
      id: candidate.id,
      name: candidate.name,
      trade: candidate.trade,
      level: candidate.level,
      status: "Present",
      checkInTime: "Just Now",
      phone: candidate.phone,
    };

    setCurrentAssignment((prev: AssignmentDeployment) => {
      let updatedCrew = [...prev.crew];

      if (effectiveTargetWorker) {
        // Replace target absent worker in crew or append replacement
        const index = updatedCrew.findIndex((w) => w.id === effectiveTargetWorker.id);
        if (index !== -1) {
          updatedCrew[index] = newWorkerRecord;
        } else {
          updatedCrew.push(newWorkerRecord);
        }
      } else {
        // If no specific absent worker selected, replace first absent worker or append
        const firstAbsentIndex = updatedCrew.findIndex((w) => w.status === "Absent");
        if (firstAbsentIndex !== -1) {
          updatedCrew[firstAbsentIndex] = newWorkerRecord;
        } else {
          updatedCrew.push(newWorkerRecord);
        }
      }

      const newPresent = prev.attendance.present + 1;
      const newAbsent = Math.max(0, prev.attendance.absent - 1);
      const newTotal = updatedCrew.length;

      const replacementUpdate: AssignmentSiteUpdate = {
        id: `upd-rep-${Date.now()}`,
        authorName: "You (Contractor)",
        authorRole: "Contractor Lead",
        timestamp: "Just now",
        text: `Deployed replacement worker ${candidate.name} (${candidate.trade} ${candidate.level}) replacing ${
          effectiveTargetWorker ? effectiveTargetWorker.name : "absent worker"
        } for ${timePeriodLabel}.`,
        category: "Crew Deployment",
        acknowledged: true,
      };

      const existingUpdates = prev.updates || [];

      return {
        ...prev,
        totalWorkersAssigned: newTotal,
        attendance: {
          ...prev.attendance,
          present: newPresent,
          absent: newAbsent,
          total: newTotal,
        },
        crew: updatedCrew,
        updates: [replacementUpdate, ...existingUpdates],
      };
    });

    showToast(
      `Successfully assigned replacement worker ${candidate.name} (${candidate.trade}) for ${timePeriodLabel}!`
    );
  };

  // Filtered workers list
  const filteredCrew = currentAssignment.crew.filter((w: AssignedWorkerRecord) => {
    if (!workerSearch.trim()) return true;
    const q = workerSearch.toLowerCase();
    return (
      w.name.toLowerCase().includes(q) ||
      w.trade.toLowerCase().includes(q) ||
      w.level.toLowerCase().includes(q) ||
      w.status.toLowerCase().includes(q)
    );
  });

  const presentCount = currentAssignment.crew.filter(
    (w: AssignedWorkerRecord) => w.status === "Present"
  ).length;

  const absentCount = currentAssignment.crew.filter(
    (w: AssignedWorkerRecord) => w.status === "Absent"
  ).length;

  const totalAttendance = currentAssignment.crew.length || 1;

  const attendancePercent = Math.round((presentCount / totalAttendance) * 100);

  const presentPercent = (presentCount / totalAttendance) * 100;
  const absentPercent = (absentCount / totalAttendance) * 100;

  return (
    <div className={styles.pageWrapper}>
      {/* Toast Feedback */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            backgroundColor: "#0f172a",
            color: "#ffffff",
            padding: "12px 20px",
            borderRadius: "10px",
            fontSize: "13.5px",
            fontWeight: 600,
            boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)",
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Two-Column Layout (Matching /projects/prj-1 Architecture) ── */}
      <div className={styles.twoColGrid}>
        {/* ── Left Column: Operations Workspace ── */}
        <main className={styles.leftWorkspaceCol}>
          {/* Header Block (Title Row with Actions, Submeta Row with Badges) */}
          <header className={styles.headerBlock} aria-label="Assignment Details Header">
            <div className={styles.titleRow}>
              <h1 className={styles.assignmentMainTitle}>{currentAssignment.clientName}</h1>

              <div className={styles.headerActionsCol}>
                <a
                  href={`tel:${currentAssignment.supervisor.phone}`}
                  className={styles.callBtn}
                  title={`Call Supervisor ${currentAssignment.supervisor.name}`}
                >
                  <PhoneCall size={13} />
                  <span>Call Supervisor ({currentAssignment.supervisor.name})</span>
                </a>
              </div>
            </div>

            <div className={styles.subMetaRow}>
              <div className={styles.subMetaLeft}>
                <span className={styles.metaItem}>
                  <MapPin size={14} strokeWidth={2} className={styles.locationPinIcon} aria-hidden="true" />
                  <span>{currentAssignment.projectName} · {currentAssignment.location}</span>
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
                    ? `${currentAssignment.totalDays} of ${currentAssignment.totalDays} Shifts Delivered`
                    : `Day ${currentAssignment.currentDay} of ${currentAssignment.totalDays}`}
                </span>

                <span className={styles.siteStatusPill}>
                  {currentAssignment.siteStatus}
                </span>

                <span className={`${styles.healthPill} ${styles[`health_${currentAssignment.health}`]}`}>
                  {currentAssignment.health === "on_track"
                    ? "● On Track"
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
              {(currentAssignment.activities?.length || 0) > 0 && (
                <span className={styles.tabPillCount}>
                  {currentAssignment.activities?.length}
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
              <OdinDeploymentBrief assignment={currentAssignment} />

              {/* 4-Card Snapshot Grid */}
              <div className={styles.snapshotGrid}>
                <div className={styles.snapshotCard}>
                  <span className={styles.snapshotLabel}>Crew Deployed</span>
                  <span className={styles.snapshotValue}>
                    {currentAssignment.totalWorkersAssigned} Workers
                  </span>
                  <span className={styles.snapshotSub}>{currentAssignment.tradesBreakdown}</span>
                </div>

                <div className={styles.snapshotCard}>
                  <span className={styles.snapshotLabel}>Shift Window</span>
                  <span className={styles.snapshotValue}>
                    {currentAssignment.startDate} – {currentAssignment.endDate}
                  </span>
                  <span className={styles.snapshotSub}>
                    {currentAssignment.totalDays} Total Shifts
                  </span>
                </div>

                <div className={styles.snapshotCard}>
                  <span className={styles.snapshotLabel}>Supervisor</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "2px" }}>
                    <img
                      src={currentAssignment.supervisor.avatar || "/assets/rahul-avatar.jpg"}
                      alt={currentAssignment.supervisor.name}
                      style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        if (!target.src.endsWith("/assets/rahul-avatar.jpg")) {
                          target.src = "/assets/rahul-avatar.jpg";
                        }
                      }}
                    />
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span className={styles.snapshotValue} style={{ fontSize: "14.5px", lineHeight: "1.2" }}>{currentAssignment.supervisor.name}</span>
                      <span className={styles.snapshotSub}>{currentAssignment.supervisor.phone}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.snapshotCard}>
                  <span className={styles.snapshotLabel}>Today Attendance</span>
                  <span className={styles.snapshotValue}>
                    {presentCount} / {totalAttendance}
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
                      <span>{presentCount} Present</span>
                    </div>

                    <div className={styles.attendancePillItem}>
                      <span
                        className={styles.attendancePillDot}
                        style={{ backgroundColor: "#fb354c" }}
                      />
                      <span>{absentCount} Absent</span>
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
                        title={`${presentCount} Present (${Math.round(presentPercent)}%)`}
                      />
                    )}
                    {absentPercent > 0 && (
                      <div
                        className={styles.progressBarSegment}
                        style={{
                          width: `${absentPercent}%`,
                          backgroundColor: "#fb354c",
                        }}
                        title={`${absentCount} Absent (${Math.round(absentPercent)}%)`}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Crew Roster List */}
              <div className={styles.rosterCard}>
                <div className={styles.rosterHeaderRow}>
                  <h3 className={styles.rosterTitle}>
                    Assigned Crew Roster ({currentAssignment.crew.length} of {currentAssignment.totalWorkersAssigned})
                  </h3>

                  <div className={styles.rosterControlsGroup}>
                    {!isCompleted && absentCount > 0 && (
                      <button
                        type="button"
                        className={styles.headerAssignReplacementBtn}
                        onClick={() => handleOpenReplacementModal(null)}
                      >
                        + Assign Replacement
                      </button>
                    )}
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
                    filteredCrew.map((worker: AssignedWorkerRecord) => (
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
                                .map((n: string) => n[0])
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

                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          {isCompleted ? (
                            <span className={styles.rosterStatusCompleted}>
                              ✓ Completed
                            </span>
                          ) : worker.status === "Present" ? (
                            <span className={styles.rosterStatusPresent}>
                              ● Present
                            </span>
                          ) : (
                            <>
                              <span className={styles.rosterStatusAbsent}>
                                ✕ Absent
                              </span>
                              <button
                                type="button"
                                className={styles.assignReplacementBtn}
                                onClick={() => handleOpenReplacementModal(worker)}
                              >
                                + Assign Replacement
                              </button>
                            </>
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
              assignmentId={currentAssignment.id}
              projectName={currentAssignment.projectName}
              supervisorName={currentAssignment.supervisor.name}
              assignment={currentAssignment}
            />
          )}

          {/* Tab 3: Complaints */}
          {activeTab === "complaints" && (
            <AssignmentComplaintsPanel
              assignmentId={currentAssignment.id}
              projectName={currentAssignment.projectName}
              supervisorName={currentAssignment.supervisor.name}
              contractorName="Apex Integrated Civil"
              initialComplaints={currentAssignment.complaints}
            />
          )}

          {/* Tab 4: Accounts */}
          {activeTab === "accounts" && (
            <AssignmentAccountsPanel
              assignmentId={currentAssignment.id}
              projectName={currentAssignment.projectName}
              clientName={currentAssignment.clientName}
              supervisorName={currentAssignment.supervisor.name}
              accounts={currentAssignment.accounts}
            />
          )}
        </main>

        {/* ── Right Column: Project Updates Feed (Images 2 & 3 Match) ── */}
        <AssignmentUpdatesPanel
          assignmentId={currentAssignment.id}
          supervisorName={currentAssignment.supervisor.name}
          contractorName="Apex Integrated Civil"
          initialUpdates={currentAssignment.updates}
        />
      </div>

      {/* Replacement Candidate Overlay Modal */}
      <AssignmentReplacementModal
        isOpen={isReplacementModalOpen}
        onClose={() => setIsReplacementModalOpen(false)}
        projectName={currentAssignment.projectName}
        assignmentDates={`${currentAssignment.startDate} – ${currentAssignment.endDate} (${currentAssignment.totalDays} Days)`}
        absentWorker={targetAbsentWorker}
        absentWorkersList={currentAssignment.crew}
        onAssign={handleAssignReplacement}
      />
    </div>
  );
}

