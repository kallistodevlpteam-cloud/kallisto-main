"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Users,
  Sparkles,
  Phone,
  PhoneCall,
  ShieldCheck,
  Check,
  DollarSign,
  FileText,
  Activity,
  AlertTriangle,
  Plus,
  Search,
  ChevronRight,
  Eye,
  MoreHorizontal,
  Copy,
} from "lucide-react";

import { HandsProjectRecord } from "../../types/project-domain";
import styles from "./hands-project-detail.module.css";

interface HandsProjectDetailViewProps {
  project: HandsProjectRecord;
}

const PROJECT_ASSIGNMENTS = [
  {
    id: "101",
    asgCode: "ASG-101",
    title: "Level 2 Structural Masonry",
    status: "on_track",
    statusLabel: "On Track",
    healthBadge: null,
    location: "Block A – South Elevation",
    supervisor: "Suresh Nair",
    workersCount: 12,
    currentDay: 12,
    totalDays: 30,
    progress: 85,
    progressColor: "#10b981",
  },
  {
    id: "102",
    asgCode: "ASG-102",
    title: "Foundation Waterproofing",
    status: "on_track",
    statusLabel: "On Track",
    healthBadge: null,
    location: "Block B – Basement",
    supervisor: "Priya Menon",
    workersCount: 8,
    currentDay: 8,
    totalDays: 20,
    progress: 60,
    progressColor: "#10b981",
  },
  {
    id: "103",
    asgCode: "ASG-103",
    title: "Roof Slab Shuttering",
    status: "at_risk",
    statusLabel: "At Risk",
    healthBadge: "At Risk",
    location: "Block C – Third Floor",
    supervisor: "Rajan Pillai",
    workersCount: 6,
    currentDay: 4,
    totalDays: 18,
    progress: 30,
    progressColor: "#ea580c",
  },
  {
    id: "104",
    asgCode: "ASG-104",
    title: "Interior Plastering",
    status: "delayed",
    statusLabel: "Delayed",
    healthBadge: "At Risk",
    location: "Block A – Level 1",
    supervisor: "Anitha Rao",
    workersCount: 10,
    currentDay: 10,
    totalDays: 25,
    progress: 48,
    progressColor: "#ea580c",
  },
];

export function HandsProjectDetailView({ project }: HandsProjectDetailViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "overview" | "assignments" | "workers" | "documents" | "accounts_billing"
  >("overview");
  const [workerSearchQuery, setWorkerSearchQuery] = useState("");
  const [openWorkerMenuId, setOpenWorkerMenuId] = useState<string | null>(null);

  // Close actions menu on outside click
  useEffect(() => {
    if (!openWorkerMenuId) return;
    function handleOutsideClick(e: MouseEvent | PointerEvent) {
      const target = e.target as HTMLElement | null;
      if (target && target.closest && target.closest("[data-worker-actions]")) {
        return;
      }
      setOpenWorkerMenuId(null);
    }
    window.addEventListener("pointerdown", handleOutsideClick);
    return () => window.removeEventListener("pointerdown", handleOutsideClick);
  }, [openWorkerMenuId]);

  const percentComplete = Math.round((project.currentDay / project.totalDays) * 100) || 0;

  // Format currency in INR
  const formatINR = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const presentCount = project.attendance.present;
  const absentCount = project.attendance.absent;
  const totalAttendance = project.attendance.total || 1;
  const presentPercent = Math.round((presentCount / totalAttendance) * 100);

  const filteredWorkers = project.crew.filter((w) => {
    if (!workerSearchQuery.trim()) return true;
    const q = workerSearchQuery.toLowerCase();
    return (
      w.name.toLowerCase().includes(q) ||
      w.trade.toLowerCase().includes(q) ||
      w.level.toLowerCase().includes(q)
    );
  });

  return (
    <div className={styles.pageWrapper}>
      {/* ── Two-Column Layout (Matching /assignments/ASG-101 Architecture) ── */}
      <div className={styles.twoColGrid}>
        {/* ── Left Column: Operations Workspace ── */}
        <main className={styles.leftWorkspaceCol}>
          {/* Header Block */}
          <header className={styles.headerBlock} aria-label="Project Details Header">
            <div className={styles.topNavRow}>
              <Link href="/partner/hands/projects" className={styles.backBtn}>
                <ArrowLeft size={13} />
                <span>Back to Projects Directory</span>
              </Link>
            </div>

            <div className={styles.titleRow}>
              <h1 className={styles.assignmentMainTitle}>{project.projectName}</h1>

              <div className={styles.headerActionsCol}>
                <a
                  href={`tel:${project.supervisor.phone}`}
                  className={styles.callBtn}
                  title={`Call Supervisor ${project.supervisor.name}`}
                >
                  <PhoneCall size={13} />
                  <span>Call Supervisor</span>
                </a>
              </div>
            </div>

            <div className={styles.subMetaRow}>
              <div className={styles.subMetaLeft}>
                <span className={styles.metaItem}>
                  <MapPin size={14} className={styles.locationPinIcon} />
                  <span>{project.category}</span>
                  <span className={styles.metaDivider}>·</span>
                  <span>{project.location}</span>
                </span>
                <span className={styles.metaDivider}>·</span>
                <span className={styles.metaItem}>
                  Service Provider: {project.clientName}
                </span>
                <span className={styles.metaDivider}>·</span>
                <span className={styles.metaItem}>
                  <Calendar size={13} className={styles.metaIcon} />
                  <span>{project.startDate} – {project.endDate}</span>
                </span>
              </div>

              <div className={styles.badgesRow}>
                <span className={styles.statusActiveBadge}>● ACTIVE PROJECT</span>
                <span className={styles.timelineDayPill}>Day {project.currentDay} of {project.totalDays}</span>
                <span className={styles.siteStatusPill}>{project.siteStatus || "ON SITE"}</span>
                <span className={`${styles.healthPill} ${styles.health_on_track}`}>● On Track</span>
              </div>
            </div>
          </header>

          {/* Segmented Tabs Bar */}
          <nav className={styles.tabsContainer} role="tablist" aria-label="Project Sections">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "overview"}
              onClick={() => setActiveTab("overview")}
              className={`${styles.tabBtn} ${activeTab === "overview" ? styles.tabBtnActive : ""}`}
            >
              <span>Overview</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "assignments"}
              onClick={() => setActiveTab("assignments")}
              className={`${styles.tabBtn} ${activeTab === "assignments" ? styles.tabBtnActive : ""}`}
            >
              <span>Assignments</span>
              <span className={styles.tabPillCount}>{project.crew.length || 4}</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "workers"}
              onClick={() => setActiveTab("workers")}
              className={`${styles.tabBtn} ${activeTab === "workers" ? styles.tabBtnActive : ""}`}
            >
              <span>Workers</span>
              <span className={styles.tabPillCount}>{project.totalWorkersAssigned || 36}</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "documents"}
              onClick={() => setActiveTab("documents")}
              className={`${styles.tabBtn} ${activeTab === "documents" ? styles.tabBtnActive : ""}`}
            >
              <span>Documents</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "accounts_billing"}
              onClick={() => setActiveTab("accounts_billing")}
              className={`${styles.tabBtn} ${activeTab === "accounts_billing" ? styles.tabBtnActive : ""}`}
            >
              <span>Accounts & Billing</span>
            </button>
          </nav>

          {/* Tab Content Views */}
          <div className={styles.tabContentLayout}>
            {activeTab === "overview" && (
              <>
                {/* Odin AI Project Brief Banner */}
                <div className={styles.odinBriefCard}>
                  <div className={styles.odinBriefLeftIcon}>
                    <Sparkles size={18} className={styles.odinBriefIcon} />
                  </div>
                  <div className={styles.odinBriefContent}>
                    <span className={styles.odinBriefLabel}>ODIN PROJECT BRIEF</span>
                    <span className={styles.odinBriefTitle}>AI-synthesized requirement assessment</span>
                    <p className={styles.odinBriefText}>{project.odinBrief}</p>
                  </div>
                </div>

                {/* 4-Card Operational Snapshot Grid (Matching ASG-101) */}
                <div className={styles.snapshotGrid}>
                  <div className={styles.snapshotCard}>
                    <span className={styles.snapshotLabel}>PROJECT PROGRESS</span>
                    <span className={styles.snapshotValue}>{percentComplete}% Completed</span>
                    <span className={styles.snapshotSub}>Day {project.currentDay} of {project.totalDays} Shifts</span>
                  </div>

                  <div className={styles.snapshotCard}>
                    <span className={styles.snapshotLabel}>CONTRACT VALUE</span>
                    <span className={styles.snapshotValue}>{formatINR(project.totalContractValue)}</span>
                    <span className={styles.snapshotSub}>Daily Rate: {formatINR(project.dailyBillingRate)} / day</span>
                  </div>

                  <div className={styles.snapshotCard}>
                    <span className={styles.snapshotLabel}>SITE SUPERVISOR</span>
                    <span className={styles.snapshotValue} style={{ fontSize: "14px" }}>{project.supervisor.name}</span>
                    <span className={styles.snapshotSub}>{project.supervisor.phone}</span>
                  </div>

                  <div className={styles.snapshotCard}>
                    <span className={styles.snapshotLabel}>TODAY ATTENDANCE</span>
                    <span className={styles.snapshotValue}>{presentCount} / {project.attendance.total} Present</span>
                    <span className={styles.snapshotSub}>{project.tradesBreakdown}</span>
                  </div>
                </div>

                {/* Live Shift Attendance Card */}
                <div className={styles.attendanceCard}>
                  <div className={styles.attendanceHeaderRow}>
                    <span className={styles.attendanceTitle}>Live Shift Attendance</span>
                    <div className={styles.attendanceCounts}>
                      <span style={{ color: "#059669" }}>● {presentCount} Present</span>
                      <span style={{ color: "#dc2626" }}>● {absentCount} Absent</span>
                    </div>
                  </div>
                  <div className={styles.attendanceTrack}>
                    <div className={styles.attendanceFill} style={{ width: `${presentPercent}%` }} />
                  </div>
                </div>

                {/* Master Project Phase Milestones */}
                <div className={styles.contentCard}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>Master Project Phase Milestones</h3>
                    <span style={{ fontSize: "12px", color: "#059669", fontWeight: 700 }}>
                      Active Phase 2: Superstructure & Masonry (70%)
                    </span>
                  </div>

                  <div className={styles.timelineList}>
                    <div className={styles.timelineItem}>
                      <div className={`${styles.timelineDot} ${styles.timelineDotCompleted}`}>
                        <Check size={14} />
                      </div>
                      <div className={styles.timelineTexts}>
                        <span className={styles.timelineTitle}>Phase 1: Site Feasibility & Substructure</span>
                        <span className={styles.timelineDesc}>Plot excavation, footings, and plinth beam reinforced concrete completed.</span>
                      </div>
                    </div>

                    <div className={styles.timelineItem}>
                      <div className={`${styles.timelineDot} ${styles.timelineDotActive}`}>
                        <span>2</span>
                      </div>
                      <div className={styles.timelineTexts}>
                        <span className={styles.timelineTitle}>Phase 2: Superstructure & Masonry (Active · 70%)</span>
                        <span className={styles.timelineDesc}>Load-bearing masonry walls, lintel beam casting, and conduit chasing in progress.</span>
                      </div>
                    </div>

                    <div className={styles.timelineItem}>
                      <div className={styles.timelineDot}>
                        <span>3</span>
                      </div>
                      <div className={styles.timelineTexts}>
                        <span className={styles.timelineTitle}>Phase 3: MEP Rough-Ins & Glazing Framing</span>
                        <span className={styles.timelineDesc}>Electrical distribution board installation, plumbing stacks, and window frames.</span>
                      </div>
                    </div>

                    <div className={styles.timelineItem}>
                      <div className={styles.timelineDot}>
                        <span>4</span>
                      </div>
                      <div className={styles.timelineTexts}>
                        <span className={styles.timelineTitle}>Phase 4: Internal Finishes & Painting</span>
                        <span className={styles.timelineDesc}>Gypsum plastering, tile laying, door shuttering, and paint coats.</span>
                      </div>
                    </div>

                    <div className={styles.timelineItem}>
                      <div className={styles.timelineDot}>
                        <span>5</span>
                      </div>
                      <div className={styles.timelineTexts}>
                        <span className={styles.timelineTitle}>Phase 5: Handover & Punch List Sign-Off</span>
                        <span className={styles.timelineDesc}>Final quality audit, cleaning, snag clearance, and client handover.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === "assignments" && (
              <div className={`${styles.contentCard} ${styles.asgContentCard}`}>
                {/* List of Assignment Rows */}
                <div className={styles.asgList}>
                  {PROJECT_ASSIGNMENTS.map((asg) => (
                    <div
                      key={asg.id}
                      className={styles.asgRow}
                      onClick={() => router.push(`/partner/hands/assignments/${asg.asgCode}`)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          router.push(`/partner/hands/assignments/${asg.asgCode}`);
                        }
                      }}
                    >
                      <div className={styles.asgRowLeft}>
                        <div className={styles.asgMainCol}>
                          <div className={styles.asgTitleRow}>
                            <span className={styles.asgTitle}>{asg.title}</span>
                            <span
                              className={
                                asg.status === "on_track"
                                  ? styles.asgPillOnTrack
                                  : asg.status === "delayed"
                                  ? styles.asgPillDelayed
                                  : styles.asgPillAtRisk
                              }
                            >
                              {asg.statusLabel}
                            </span>
                            {asg.healthBadge && (
                              <span className={styles.asgPillAtRisk}>
                                ● {asg.healthBadge}
                              </span>
                            )}
                          </div>
                          <div className={styles.asgSubRow}>
                            <MapPin size={12} className={styles.asgPinIcon} />
                            <span>
                              {asg.location} · Supervisor: {asg.supervisor} · {asg.workersCount} Workers · Day {asg.currentDay} of {asg.totalDays}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className={styles.asgRowRight}>
                        <div className={styles.asgProgressCol}>
                          <div className={styles.asgProgressHeader}>
                            <span className={styles.asgProgressLabel}>Progress</span>
                            <span className={styles.asgProgressVal}>{asg.progress}%</span>
                          </div>
                          <div className={styles.asgProgressTrack}>
                            <div
                              className={styles.asgProgressFill}
                              style={{
                                width: `${asg.progress}%`,
                                backgroundColor: asg.progressColor,
                              }}
                            />
                          </div>
                        </div>
                        <ChevronRight size={15} className={styles.asgChevron} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "workers" && (
              <div className={`${styles.contentCard} ${styles.asgContentCard}`}>
                {/* Search Bar Row */}
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "4px" }}>
                  <input
                    type="text"
                    placeholder="Search worker..."
                    className={styles.asgSearchInput}
                    value={workerSearchQuery}
                    onChange={(e) => setWorkerSearchQuery(e.target.value)}
                  />
                </div>

                <table className={styles.crewTable}>
                  <thead>
                    <tr>
                      <th>Worker Name</th>
                      <th>Trade Skill</th>
                      <th>Level</th>
                      <th>Assigned Work</th>
                      <th>Daily Rate</th>
                      <th>Attendance Rate</th>
                      <th style={{ textAlign: "right" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWorkers.map((w, idx) => {
                      const assignedWorkList = [
                        "Level 2 Structural Masonry",
                        "Lintel & Column Casting",
                        "Conduit Chasing & DB Wiring",
                        "Material Handling & Mortar Mix",
                      ];
                      const dailyRates = ["₹1,200 / day", "₹1,150 / day", "₹1,400 / day", "₹750 / day"];
                      const attendanceRates = ["98%", "96%", "99%", "94%"];

                      const assignedWork = assignedWorkList[idx % assignedWorkList.length];
                      const dailyRate = dailyRates[idx % dailyRates.length];
                      const attendanceRate = attendanceRates[idx % attendanceRates.length];

                      return (
                        <tr key={w.id}>
                          <td>
                            <Link
                              href={`/partner/hands/workers/${w.id}`}
                              className={styles.workerCell}
                              style={{ textDecoration: "none", color: "inherit" }}
                            >
                              <div className={styles.workerAvatar}>
                                {w.name.split(" ").map((n) => n[0]).join("")}
                              </div>
                              <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                                <span style={{ fontWeight: 650, color: "#0f172a" }}>{w.name}</span>
                                <span style={{ fontSize: "11.5px", color: "#64748b" }}>{w.phone || "+91 98470 12345"}</span>
                              </div>
                            </Link>
                          </td>
                          <td style={{ fontWeight: 550, color: "#334155" }}>{w.trade}</td>
                          <td>
                            <span
                              style={{
                                fontSize: "11.5px",
                                fontWeight: 650,
                                color: w.level === "Master" ? "#7c3aed" : w.level === "Senior" ? "#2563eb" : "#475569",
                                backgroundColor: w.level === "Master" ? "#f5f3ff" : w.level === "Senior" ? "#eff6ff" : "#f1f5f9",
                                padding: "2px 8px",
                                borderRadius: "6px",
                              }}
                            >
                              {w.level}
                            </span>
                          </td>
                          <td style={{ fontSize: "12.5px", color: "#334155", fontWeight: 500 }}>
                            {assignedWork}
                          </td>
                          <td style={{ fontSize: "12.5px", color: "#0f172a", fontWeight: 650 }}>
                            {dailyRate}
                          </td>
                          <td>
                            <span className={styles.statusPresent}>
                              ● {attendanceRate}
                            </span>
                          </td>
                          <td
                            style={{ textAlign: "right", position: "relative" }}
                            data-worker-actions
                          >
                            <button
                              type="button"
                              className={styles.moreActionsBtn}
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenWorkerMenuId(openWorkerMenuId === w.id ? null : w.id);
                              }}
                              aria-label={`Actions for ${w.name}`}
                            >
                              <MoreHorizontal size={16} />
                            </button>

                            {openWorkerMenuId === w.id && (
                              <div className={styles.actionMenuPopover}>
                                <button
                                  type="button"
                                  className={styles.actionMenuItem}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenWorkerMenuId(null);
                                    router.push(`/partner/hands/workers/${w.id}`);
                                  }}
                                >
                                  <Eye size={13} color="#475569" />
                                  <span>View Profile</span>
                                </button>

                                <button
                                  type="button"
                                  className={styles.actionMenuItem}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenWorkerMenuId(null);
                                    alert(`Odin AI assistant initialized for worker ${w.name}`);
                                  }}
                                >
                                  <Sparkles size={13} color="#0f172a" />
                                  <span>Ask Odin</span>
                                </button>

                                <button
                                  type="button"
                                  className={styles.actionMenuItem}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard?.writeText(w.id);
                                    setOpenWorkerMenuId(null);
                                  }}
                                >
                                  <Copy size={13} color="#64748b" />
                                  <span>Copy ID</span>
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "documents" && (
              <div className={`${styles.contentCard} ${styles.asgContentCard}`}>
                <div className={styles.docList}>
                  <div className={styles.docItem}>
                    <div className={styles.docLeft}>
                      <div className={styles.docIconContainer}>
                        <FileText size={18} />
                      </div>
                      <div className={styles.docMeta}>
                        <span className={styles.docTitle}>Site Feasibility & Soil Audit Report v1.0</span>
                        <span className={styles.docSub}>PDF · 2.4 MB · Verified by Kallisto Odin Team</span>
                      </div>
                    </div>
                    <div className={styles.docActions}>
                      <button type="button" className={styles.docBtn}>
                        <span>Download</span>
                      </button>
                    </div>
                  </div>

                  <div className={styles.docItem}>
                    <div className={styles.docLeft}>
                      <div className={styles.docIconContainer}>
                        <FileText size={18} />
                      </div>
                      <div className={styles.docMeta}>
                        <span className={styles.docTitle}>Approved Structural & Architectural Blueprints v2.1</span>
                        <span className={styles.docSub}>DWG / PDF · 14.8 MB · Author: Ar. Vivek Menon</span>
                      </div>
                    </div>
                    <div className={styles.docActions}>
                      <button type="button" className={styles.docBtn}>
                        <span>Download</span>
                      </button>
                    </div>
                  </div>

                  <div className={styles.docItem}>
                    <div className={styles.docLeft}>
                      <div className={styles.docIconContainer}>
                        <FileText size={18} />
                      </div>
                      <div className={styles.docMeta}>
                        <span className={styles.docTitle}>BOQ Schedule & Client Contract Agreement</span>
                        <span className={styles.docSub}>PDF · 1.2 MB · Signed & Verified</span>
                      </div>
                    </div>
                    <div className={styles.docActions}>
                      <button type="button" className={styles.docBtn}>
                        <span>Download</span>
                      </button>
                    </div>
                  </div>

                  <div className={styles.docItem}>
                    <div className={styles.docLeft}>
                      <div className={styles.docIconContainer}>
                        <FileText size={18} />
                      </div>
                      <div className={styles.docMeta}>
                        <span className={styles.docTitle}>MEP Conduit Layout & Plumbing Stack Details</span>
                        <span className={styles.docSub}>PDF · 4.1 MB · Approved</span>
                      </div>
                    </div>
                    <div className={styles.docActions}>
                      <button type="button" className={styles.docBtn}>
                        <span>Download</span>
                      </button>
                    </div>
                  </div>

                  <div className={styles.docItem}>
                    <div className={styles.docLeft}>
                      <div className={styles.docIconContainer}>
                        <ShieldCheck size={18} />
                      </div>
                      <div className={styles.docMeta}>
                        <span className={styles.docTitle}>Kallisto Site Safety & Environmental Quality Cert</span>
                        <span className={styles.docSub}>PDF · 850 KB · Valid till Oct 2026</span>
                      </div>
                    </div>
                    <div className={styles.docActions}>
                      <button type="button" className={styles.docBtn}>
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "accounts_billing" && (
              <div className={`${styles.contentCard} ${styles.asgContentCard}`}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                  <div style={{ padding: "12px", backgroundColor: "#f8fafc", borderRadius: "10px" }}>
                    <span style={{ fontSize: "11.5px", color: "#64748b", fontWeight: 600 }}>Total Contract Value</span>
                    <div style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", marginTop: "4px" }}>
                      {formatINR(project.totalContractValue)}
                    </div>
                  </div>

                  <div style={{ padding: "12px", backgroundColor: "#ecfdf5", borderRadius: "10px" }}>
                    <span style={{ fontSize: "11.5px", color: "#047857", fontWeight: 600 }}>Earned to Date (70%)</span>
                    <div style={{ fontSize: "18px", fontWeight: 800, color: "#065f46", marginTop: "4px" }}>
                      {formatINR(Math.round(project.totalContractValue * (percentComplete / 100)))}
                    </div>
                  </div>

                  <div style={{ padding: "12px", backgroundColor: "#f1f5f9", borderRadius: "10px" }}>
                    <span style={{ fontSize: "11.5px", color: "#475569", fontWeight: 600 }}>Remaining Balance</span>
                    <div style={{ fontSize: "18px", fontWeight: 800, color: "#334155", marginTop: "4px" }}>
                      {formatINR(Math.round(project.totalContractValue * ((100 - percentComplete) / 100)))}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: "8px" }}>
                  <table className={styles.ledgerTable}>
                    <thead>
                      <tr>
                        <th>Billing Phase</th>
                        <th>Milestone Description</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ fontWeight: 600 }}>Phase 1</td>
                        <td>Site Feasibility & Substructure Completion</td>
                        <td style={{ fontWeight: 650 }}>{formatINR(129600)}</td>
                        <td>
                          <span className={styles.statusPresent}>● Paid</span>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 600 }}>Phase 2</td>
                        <td>Superstructure & Masonry (Active · 70%)</td>
                        <td style={{ fontWeight: 650 }}>{formatINR(172800)}</td>
                        <td>
                          <span style={{ fontSize: "11.5px", fontWeight: 650, color: "#2563eb", backgroundColor: "#eff6ff", padding: "2px 8px", borderRadius: "6px" }}>
                            ● In Progress
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 600 }}>Phase 3</td>
                        <td>Internal Finishes & Handover</td>
                        <td style={{ fontWeight: 650 }}>{formatINR(129600)}</td>
                        <td>
                          <span style={{ fontSize: "11.5px", fontWeight: 600, color: "#64748b", backgroundColor: "#f1f5f9", padding: "2px 8px", borderRadius: "6px" }}>
                            Upcoming
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
