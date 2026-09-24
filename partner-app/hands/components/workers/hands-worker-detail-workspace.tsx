"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  UserCheck,
  Calendar,
  DollarSign,
  FileText,
  Building2,
  Award,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Download,
  Edit3,
  Star,
  MapPin,
  Phone,
  CreditCard,
  Layers,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { WorkerProfile, WorkerCurrentAssignment } from "../../types/worker-domain";
import { HandsWorkerProfileDrawer } from "./hands-worker-profile-drawer";
import styles from "./hands-worker-detail.module.css";

const MONTH_ATTENDANCE_DATA = [
  {
    monthLabel: "August 2026",
    stats: { present: 22, absent: 2, halfDay: 1, notAssigned: 6 },
    days: Array.from({ length: 31 }, (_, i) => {
      const day = i + 1;
      let status: "Present" | "Absent" | "HalfDay" | "NotAssigned" = "Present";
      if (day === 4 || day === 18) status = "Absent";
      else if (day === 12) status = "HalfDay";
      else if (day === 7 || day === 14 || day === 21 || day >= 27) status = "NotAssigned";
      return { day, status };
    }),
  },
  {
    monthLabel: "September 2026",
    stats: { present: 20, absent: 2, halfDay: 1, notAssigned: 7 },
    days: Array.from({ length: 30 }, (_, i) => {
      const day = i + 1;
      let status: "Present" | "Absent" | "HalfDay" | "NotAssigned" = "Present";
      if (day === 3 || day === 10) status = "Absent";
      else if (day === 6) status = "HalfDay";
      else if (day === 17 || day === 20 || day >= 26) status = "NotAssigned";
      return { day, status };
    }),
  },
  {
    monthLabel: "October 2026",
    stats: { present: 21, absent: 2, halfDay: 1, notAssigned: 7 },
    days: Array.from({ length: 31 }, (_, i) => {
      const day = i + 1;
      let status: "Present" | "Absent" | "HalfDay" | "NotAssigned" = "Present";
      if (day === 5 || day === 15) status = "Absent";
      else if (day === 9) status = "HalfDay";
      else if (day === 22 || day >= 26) status = "NotAssigned";
      return { day, status };
    }),
  },
];

interface HandsWorkerDetailWorkspaceProps {
  worker: WorkerProfile;
}

export function HandsWorkerDetailWorkspace({
  worker,
}: HandsWorkerDetailWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeMonthIndex, setActiveMonthIndex] = useState(1);

  const currentMonthData = MONTH_ATTENDANCE_DATA[activeMonthIndex] || MONTH_ATTENDANCE_DATA[1];

  const handleMonthChange = (direction: number) => {
    setActiveMonthIndex((prev) => {
      const next = prev + direction;
      if (next < 0) return 0;
      if (next >= MONTH_ATTENDANCE_DATA.length) return MONTH_ATTENDANCE_DATA.length - 1;
      return next;
    });
  };

  const ext = worker.extended;

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "personal-details", label: "Personal Details & Skills" },
    { id: "work-projects", label: "Project History" },
    { id: "attendance", label: "Attendance History" },
    { id: "payment-bank", label: "Payment & Bank Details" },
    { id: "documents", label: "Documents", count: ext?.documents?.length },
  ];

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const currentProjectName = worker.currentAssignment?.projectName || "Greenwood Residency";

  const activeProjectsList: WorkerCurrentAssignment[] = (worker as any).activeAssignments || [
    {
      projectId: worker.currentAssignment?.projectId || "PRJ-01",
      projectName: worker.currentAssignment?.projectName || "Greenwood Residency",
      role: worker.currentAssignment?.role || `${worker.trade} Specialist`,
      location: worker.currentAssignment?.location || worker.location || "Kakkanad, Kochi",
      startDate: worker.currentAssignment?.startDate || "Aug 15, 2026",
      endDate: worker.currentAssignment?.endDate || "Sep 30, 2026",
    },
    {
      projectId: "PRJ-02",
      projectName: "Skyline Heights Phase 2",
      role: `Senior ${worker.trade}`,
      location: "Edappally, Kochi",
      startDate: "Sep 01, 2026",
      endDate: "Oct 15, 2026",
    },
  ];

  return (
    <div className={styles.container}>
      {/* ---------------------------------------------------------
         Top Navigation & Action Bar
         --------------------------------------------------------- */}


      {/* ---------------------------------------------------------
         Header Profile Banner Card
         --------------------------------------------------------- */}
      <div className={styles.profileBannerCard}>
        <div className={styles.bannerMainInfo}>
          <div className={styles.avatarLarge}>{getInitials(worker.name)}</div>

          <div className={styles.bannerMeta}>
            <div className={styles.nameRow}>
              <h1 className={styles.workerName}>{worker.name}</h1>
              <span className={styles.workerIdBadge}>{worker.id}</span>
            </div>

            <div className={styles.badgeRow}>
              <span className={styles.tradeTag}>{worker.trade}</span>
              <span className={styles.levelTag}>
                {worker.level || `${worker.experienceYears} Yrs Exp`}
              </span>

              {worker.availability === "Available" && (
                <span className={styles.statusAvailable}>
                  <span className={styles.dot} /> Available Today
                </span>
              )}
              {worker.availability === "Assigned" && (
                <span className={styles.statusAssigned}>
                  <span className={styles.dot} /> Assigned on Site
                </span>
              )}
              {worker.availability === "Unavailable" && (
                <span className={styles.statusUnavailable}>
                  <span className={styles.dot} /> On Leave / Unavailable
                </span>
              )}

              {worker.verificationStatus === "Verified" ? (
                <span className={styles.verifiedPill}>
                  <CheckCircle2 size={13} /> Verification Complete
                </span>
              ) : (
                <span className={styles.pendingPill}>
                  <Clock size={13} /> Verification Pending
                </span>
              )}
            </div>

            <div className={styles.subMetaRow}>
              <span className={styles.metaItem}>
                <MapPin size={14} /> {worker.location}
              </span>
              <span className={styles.metaItem}>
                <Phone size={14} /> {worker.phone}
              </span>
              <span className={styles.metaItem}>
                <Briefcase size={14} /> {worker.experienceYears} Years Trade Experience
              </span>
            </div>
          </div>
        </div>

        <div className={styles.dailyRateBox}>
          <span className={styles.rateLabel}>Standard Daily Rate</span>
          <span className={styles.rateValue}>₹{worker.dailyRate || 950} / day</span>
        </div>
      </div>

      {/* ---------------------------------------------------------
         Underline Tab Navigation Bar (Matching Reference Image)
         --------------------------------------------------------- */}
      <div className={styles.tabNavWrapper}>
        <div className={styles.tabList} role="tablist" aria-label="Worker Profile Tabs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={`${styles.tabItem} ${isActive ? styles.tabItemActive : ""}`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={styles.tabBadge}>{tab.count}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ---------------------------------------------------------
         TAB 1: OVERVIEW (Matching exact design layout from reference image)
         --------------------------------------------------------- */}
      {activeTab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
          {/* Top Card: CURRENT PROJECT & ASSIGNED SITE TASKS */}
          <div className={styles.projectProgressCard}>
            <div className={styles.projectProgressHeader}>
              <span className={styles.cardSectionTitle}>CURRENT PROJECT & TASKS</span>
              {worker.currentAssignment ? (
                <span className={styles.statusAssigned}>
                  <span className={styles.dot} /> Active Site Assignment
                </span>
              ) : (
                <span className={styles.statusAvailable}>
                  <span className={styles.dot} /> Available for Work Order
                </span>
              )}
            </div>

            {/* Today's Tasks Callout Box (1 or 2 tasks max per day) */}
            <div className={styles.ongoingWorkHighlightBox}>
              <div className={styles.ongoingWorkHeader}>
                <span className={styles.ongoingWorkTitle}>
                  <Briefcase size={14} /> Today's Assigned Tasks (2 Tasks)
                </span>
                <span className={styles.phaseBadgeProgress}>• Active On Site</span>
              </div>

              <div className={styles.todayTasksContainer}>
                {/* Task 1: Multi-day Task */}
                <div className={styles.todayTaskCard}>
                  <div className={styles.todayTaskHeader}>
                    <span className={styles.ongoingWorkDesc} style={{ fontSize: "14px" }}>
                      {worker.trade === "Mason"
                        ? "1. Block B - 2nd Floor Fly Ash Block Masonry & Lintel Alignment"
                        : worker.trade === "Electrician"
                        ? "1. Phase 2 Concealed Conduit Routing & DB Dressing"
                        : worker.trade === "Carpenter"
                        ? "1. Podium Slab Formwork Shuttering & Plywood Framing"
                        : `1. ${worker.trade} Structural Execution (Block B)`}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span className={styles.durationBadge}>Multi-day Task (Day 2 of 4)</span>
                      <span className={styles.phaseBadgeProgress}>In Progress</span>
                    </div>
                  </div>
                  <div className={styles.ongoingWorkSub}>
                    <span>Project: <strong>{currentProjectName}</strong></span>
                    <span>•</span>
                    <span>Target: <strong>180 sq.ft / day</strong></span>
                    <span>•</span>
                    <span>Logged Today: <strong>4.5 hrs</strong></span>
                    <span>•</span>
                    <span>Supervisor: <strong>K. R. Menon</strong></span>
                  </div>
                </div>

                {/* Task 2: 1-Day Task */}
                <div className={styles.todayTaskCard}>
                  <div className={styles.todayTaskHeader}>
                    <span className={styles.ongoingWorkDesc} style={{ fontSize: "14px" }}>
                      2. Mortar batching & line level inspection
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span className={styles.durationBadgeSingle}>1-Day Task</span>
                      <span className={styles.phaseBadgeCompleted}>Completed</span>
                    </div>
                  </div>
                  <div className={styles.ongoingWorkSub}>
                    <span>Project: <strong>Skyline Heights Phase 2</strong></span>
                    <span>•</span>
                    <span>Logged Today: <strong>2.0 hrs</strong></span>
                    <span>•</span>
                    <span>Status: <strong>Verified by Site Inspector</strong></span>
                  </div>
                </div>
              </div>

              {/* Next Scheduled Tasks */}
              <div className={styles.nextTasksBlock}>
                <span className={styles.nextTasksHeader}>NEXT SCHEDULED TASKS</span>
                <div className={styles.nextTaskList}>
                  <div className={styles.nextTaskRow}>
                    <span style={{ fontWeight: 650 }}>
                      1. Curing inspection & 3rd floor line marking
                    </span>
                    <div className={styles.nextTaskMeta}>
                      <span>Project: <strong>{currentProjectName}</strong></span>
                      <span>•</span>
                      <span>Scheduled: <strong>Tomorrow, Sep 24</strong></span>
                      <span className={styles.durationBadgeSingle}>1-Day Task</span>
                    </div>
                  </div>

                  <div className={styles.nextTaskRow}>
                    <span style={{ fontWeight: 650 }}>
                      2. Lintel beam shuttering & concrete casting
                    </span>
                    <div className={styles.nextTaskMeta}>
                      <span>Project: <strong>Skyline Heights Phase 2</strong></span>
                      <span>•</span>
                      <span>Scheduled: <strong>Sep 25 – Sep 27</strong></span>
                      <span className={styles.durationBadge}>3-Day Task</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Projects List (Multiple Assigned Projects Support) */}
            <div className={styles.activeProjectsBlock}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "4px 0 2px 0" }}>
                <span className={styles.cardSectionTitle} style={{ fontSize: "11.5px" }}>
                  ACTIVE ASSIGNED PROJECTS ({activeProjectsList.length} ASSIGNMENTS)
                </span>
              </div>

              <div className={styles.activeProjectsGridGroup}>
                {activeProjectsList.map((prj, idx) => (
                  <div key={prj.projectId || idx} className={styles.kvGrid}>
                    <div className={styles.kvItem}>
                      <span className={styles.kvLabel}>Active Project #{idx + 1}</span>
                      <span className={styles.kvValue}>{prj.projectName}</span>
                    </div>
                    <div className={styles.kvItem}>
                      <span className={styles.kvLabel}>Assigned Role</span>
                      <span className={styles.kvValue}>{prj.role}</span>
                    </div>
                    <div className={styles.kvItem}>
                      <span className={styles.kvLabel}>Site Location</span>
                      <span className={styles.kvValue}>{prj.location}</span>
                    </div>
                    <div className={styles.kvItem}>
                      <span className={styles.kvLabel}>Start Date</span>
                      <span className={styles.kvValue}>{prj.startDate}</span>
                    </div>
                    <div className={styles.kvItem}>
                      <span className={styles.kvLabel}>Target Completion</span>
                      <span className={styles.kvValue}>{prj.endDate || "Sep 30, 2026"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Section: RECENT ACTIVITY */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <span>Recent Activity Log</span>
              </h2>
            </div>

            <div className={styles.recentActivityList}>
              <div className={styles.recentActivityItem}>
                <span className={`${styles.activityDot} ${styles.dotGreen}`} />
                <div className={styles.activityBody}>
                  <span className={styles.activityText}>
                    Check-in at 07:52 AM — {currentProjectName}
                  </span>
                  <span className={styles.activityDate}>23 Sep 2026</span>
                </div>
              </div>

              <div className={styles.recentActivityItem}>
                <span className={`${styles.activityDot} ${styles.dotBlue}`} />
                <div className={styles.activityBody}>
                  <span className={styles.activityText}>
                    Payment of ₹4,750 credited for the week 15–19 Sep
                  </span>
                  <span className={styles.activityDate}>22 Sep 2026</span>
                </div>
              </div>

              <div className={styles.recentActivityItem}>
                <span className={`${styles.activityDot} ${styles.dotRed}`} />
                <div className={styles.activityBody}>
                  <span className={styles.activityText}>
                    Absent — no check-in recorded
                  </span>
                  <span className={styles.activityDate}>20 Sep 2026</span>
                </div>
              </div>

              <div className={styles.recentActivityItem}>
                <span className={`${styles.activityDot} ${styles.dotGrey}`} />
                <div className={styles.activityBody}>
                  <span className={styles.activityText}>
                    Completed masonry for 2nd floor — signed off by site engineer
                  </span>
                  <span className={styles.activityDate}>18 Sep 2026</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className={styles.cardFooterLink}
              onClick={() => setActiveTab("attendance")}
              style={{ alignSelf: "flex-start", marginTop: "8px" }}
            >
              <span>View full activity history</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------
         TAB 2: PERSONAL DETAILS & SKILLS
         --------------------------------------------------------- */}
      {activeTab === "personal-details" && (
        <div className={styles.tabContainerGroup}>
          {/* Row 1: Basic Information & Contact & Address Side-by-Side */}
          <div className={styles.twoColumnGridRow}>
            {/* Card 1: Basic Information */}
            <section className={styles.detailSectionCard}>
              <h2 className={styles.detailSectionHeading}>Basic Information</h2>
              <div className={styles.tableList}>
                <div className={styles.tableRow}>
                  <span className={styles.tableLabel}>Full Name</span>
                  <span className={styles.tableValue}>{worker.name}</span>
                </div>
                <div className={styles.tableRow}>
                  <span className={styles.tableLabel}>Date of Birth</span>
                  <span className={styles.tableValue}>{ext?.dateOfBirth || "12 August 1985"}</span>
                </div>
                <div className={styles.tableRow}>
                  <span className={styles.tableLabel}>Age</span>
                  <span className={styles.tableValue}>{worker.age || 41} years</span>
                </div>
                <div className={styles.tableRow}>
                  <span className={styles.tableLabel}>Gender</span>
                  <span className={styles.tableValue}>{worker.gender || "Male"}</span>
                </div>
                <div className={styles.tableRow}>
                  <span className={styles.tableLabel}>Blood Group</span>
                  <span className={styles.tableValue}>{worker.bloodGroup || ext?.bloodGroup || "B+"}</span>
                </div>
                <div className={styles.tableRow}>
                  <span className={styles.tableLabel}>Marital Status</span>
                  <span className={styles.tableValue}>{worker.maritalStatus || ext?.maritalStatus || "Married"}</span>
                </div>
                <div className={styles.tableRow}>
                  <span className={styles.tableLabel}>Nationality</span>
                  <span className={styles.tableValue}>{worker.nationality || ext?.nationality || "Indian"}</span>
                </div>
              </div>
            </section>

            {/* Card 2: Contact & Address */}
            <section className={styles.detailSectionCard}>
              <h2 className={styles.detailSectionHeading}>Contact & Address</h2>
              <div className={styles.tableList}>
                <div className={styles.tableRow}>
                  <span className={styles.tableLabel}>Mobile</span>
                  <span className={styles.tableValue}>{worker.phone}</span>
                </div>
                <div className={styles.tableRow}>
                  <span className={styles.tableLabel}>Alternate Mobile</span>
                  <span className={styles.tableValue}>
                    {worker.alternateMobile || worker.emergencyContact || "+91 87654 32109"}
                  </span>
                </div>
                <div className={styles.tableRow}>
                  <span className={styles.tableLabel}>Email</span>
                  <span className={styles.tableValue}>
                    {worker.email || ext?.email || `${worker.name.toLowerCase().replace(/\s+/g, ".")}@kallisto.in`}
                  </span>
                </div>
                <div className={styles.tableRow}>
                  <span className={styles.tableLabel}>Current Address</span>
                  <span className={styles.tableValue}>
                    {worker.currentAddress || ext?.currentAddress || `12/B, Site Colony, ${worker.location}`}
                  </span>
                </div>
                <div className={styles.tableRow}>
                  <span className={styles.tableLabel}>Permanent Address</span>
                  <span className={styles.tableValue}>
                    {ext?.permanentAddress || `Village Rampur, Dist. Trivandrum, ${worker.location}, Kerala 695011`}
                  </span>
                </div>
                <div className={styles.tableRow}>
                  <span className={styles.tableLabel}>State</span>
                  <span className={styles.tableValue}>{worker.state || ext?.state || "Kerala"}</span>
                </div>
                <div className={styles.tableRow}>
                  <span className={styles.tableLabel}>PIN Code</span>
                  <span className={styles.tableValue}>{worker.pinCode || ext?.pinCode || "695011"}</span>
                </div>
              </div>
            </section>
          </div>

          {/* Row 2: Skills & Work Performance */}
          <section className={styles.detailSectionCard}>
            <div className={styles.skillsSectionHeader}>
              <h2 className={styles.detailSectionHeading}>Skills & Work Performance</h2>
              <span className={styles.skillsSubTag}>4 Certified Capabilities</span>
            </div>

            {/* Top Skill Overview KPIs */}
            <div className={styles.skillKpiRow}>
              <div className={styles.skillKpiBox}>
                <span className={styles.skillKpiLabel}>PRIMARY SPECIALTY</span>
                <span className={styles.skillKpiVal}>{worker.trade} Specialist</span>
              </div>
              <div className={styles.skillKpiBox}>
                <span className={styles.skillKpiLabel}>MASTERY LEVEL</span>
                <span className={styles.skillKpiVal}>{worker.level || "Senior Execution"}</span>
              </div>
              <div className={styles.skillKpiBox}>
                <span className={styles.skillKpiLabel}>AVG PROFICIENCY SCORE</span>
                <span className={styles.skillKpiVal}>84.5%</span>
              </div>
              <div className={styles.skillKpiBox}>
                <span className={styles.skillKpiLabel}>SITE QUALITY RATING</span>
                <span className={styles.skillKpiVal}>★ {ext?.qualityRatingScore || 4.9} / 5.0</span>
              </div>
            </div>

            {/* 4-Column Skill Performance Grid */}
            <div className={styles.skillsTileGrid}>
              {ext?.skillProficiencies.map((sp) => {
                const filledDots = Math.round((sp.ratingScore / 100) * 5);
                return (
                  <div key={sp.skill} className={styles.newSkillTile}>
                    <div className={styles.skillTileTop}>
                      <span className={styles.newSkillName}>{sp.skill}</span>
                      <span className={styles.newSkillScore}>{sp.ratingScore}%</span>
                    </div>

                    <div className={styles.skillTileSub}>
                      <span className={styles.newSkillLevelPill}>{sp.proficiencyLevel}</span>
                      <span className={styles.skillAuditLabel}>Verified</span>
                    </div>

                    {/* 5-Segment Level Indicator */}
                    <div className={styles.segmentMeterRow} aria-label={`Skill score ${sp.ratingScore}%`}>
                      {[1, 2, 3, 4, 5].map((idx) => (
                        <span
                          key={idx}
                          className={`${styles.segmentBlock} ${idx <= filledDots ? styles.segmentBlockActive : ""}`}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {/* ---------------------------------------------------------
         TAB 3: PROJECT HISTORY
         --------------------------------------------------------- */}
      {activeTab === "work-projects" && (
        <div className={styles.tabContainerGroup}>
          <section id="work-projects" className={styles.detailSectionCard}>
            {/* KPI Summary Cards at Top */}
            <div className={styles.skillKpiRow}>
              <div className={styles.skillKpiBox}>
                <span className={styles.skillKpiLabel}>PROJECTS COMPLETED</span>
                <span className={styles.skillKpiVal}>{worker.recentWork.length + 12} Projects</span>
              </div>
              <div className={styles.skillKpiBox}>
                <span className={styles.skillKpiLabel}>FIELD EXPERIENCE</span>
                <span className={styles.skillKpiVal}>{worker.experienceYears || 8} Yrs Experience</span>
              </div>
              <div className={styles.skillKpiBox}>
                <span className={styles.skillKpiLabel}>ON-TIME COMPLETION</span>
                <span className={styles.skillKpiVal}>98.5%</span>
              </div>
              <div className={styles.skillKpiBox}>
                <span className={styles.skillKpiLabel}>SUPERVISOR RATING</span>
                <span className={styles.skillKpiVal}>★ {ext?.qualityRatingScore || 4.9} / 5.0</span>
              </div>
            </div>

            <div className={styles.tableWrapper}>
              <div className={styles.tableContainer}>
                <table className={styles.dataTable} aria-label="Project History Table">
                  <thead>
                    <tr>
                      <th>Project Name & Scope</th>
                      <th>Date Range</th>
                      <th>Location</th>
                      <th style={{ textAlign: "center" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {worker.recentWork.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ textAlign: "center", color: "#64748b" }}>
                          No prior archived projects on record.
                        </td>
                      </tr>
                    ) : (
                      worker.recentWork.map((item) => (
                        <tr key={item.id}>
                          {/* Col 1: Project Name & Role with Thumbnail Image */}
                          <td>
                            <div className={styles.projectCellGroup}>
                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt={item.projectName}
                                  className={styles.projectThumbImage}
                                />
                              ) : (
                                <div className={styles.projectThumbFallback}>
                                  <Briefcase size={16} />
                                </div>
                              )}
                              <div className={styles.txCellDateGroup}>
                                <span className={styles.txCellDate}>{item.projectName}</span>
                                <span className={styles.txCellSubId}>{item.role}</span>
                              </div>
                            </div>
                          </td>

                          {/* Col 2: Date Range */}
                          <td>
                            <span className={styles.txScopeDesc}>{item.dateRange}</span>
                          </td>

                          {/* Col 3: Location */}
                          <td>
                            <span className={styles.txScopeDesc}>{item.location}</span>
                          </td>

                          {/* Col 4: Status */}
                          <td style={{ textAlign: "center" }}>
                            <span className={styles.statusSettledPill}>✓ Completed</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer with Pagination matching reference image */}
              <div className={styles.tableFooterRow}>
                <span className={styles.tableFooterCount}>
                  Showing 1-{worker.recentWork.length} of {worker.recentWork.length} projects
                </span>
                <div className={styles.paginationGroup}>
                  <button type="button" className={styles.pageArrowBtn} disabled>&lt;</button>
                  <button type="button" className={`${styles.pageNumBtn} ${styles.pageNumBtnActive}`}>1</button>
                  <button type="button" className={styles.pageNumBtn}>2</button>
                  <button type="button" className={styles.pageArrowBtn}>&gt;</button>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ---------------------------------------------------------
         TAB 4: ATTENDANCE HISTORY
         --------------------------------------------------------- */}
      {activeTab === "attendance" && (
        <div className={styles.tabContainerGroup}>
          {/* Card 1: Month Attendance Heatmap Calendar */}
          <section className={styles.detailSectionCard}>
            <div className={styles.monthHeaderSelectorRow}>
              {/* Month Selector Controls matching media_1790167485427.png */}
              <div className={styles.monthPickerControls}>
                <button
                  type="button"
                  className={styles.monthNavBtn}
                  onClick={() => handleMonthChange(-1)}
                  disabled={activeMonthIndex === 0}
                  aria-label="Previous Month"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className={styles.monthTitleText}>{currentMonthData.monthLabel}</span>
                <button
                  type="button"
                  className={styles.monthNavBtn}
                  onClick={() => handleMonthChange(1)}
                  disabled={activeMonthIndex === MONTH_ATTENDANCE_DATA.length - 1}
                  aria-label="Next Month"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Legend Row with 4 statuses including Not Assigned */}
              <div className={styles.attendanceLegendRow}>
                <div className={styles.legendItem}>
                  <span className={`${styles.legendDot} ${styles.legendDotGreen}`} />
                  <span className={styles.legendLabel}>Present: <strong>{currentMonthData.stats.present}</strong></span>
                </div>
                <div className={styles.legendItem}>
                  <span className={`${styles.legendDot} ${styles.legendDotRed}`} />
                  <span className={styles.legendLabel}>Absent: <strong>{currentMonthData.stats.absent}</strong></span>
                </div>
                <div className={styles.legendItem}>
                  <span className={`${styles.legendDot} ${styles.legendDotYellow}`} />
                  <span className={styles.legendLabel}>Half Day: <strong>{currentMonthData.stats.halfDay}</strong></span>
                </div>
                <div className={styles.legendItem}>
                  <span className={`${styles.legendDot} ${styles.legendDotGrey}`} />
                  <span className={styles.legendLabel}>Not Assigned: <strong>{currentMonthData.stats.notAssigned}</strong></span>
                </div>
              </div>
            </div>

            {/* Calendar Tile Grid (Full 30 or 31 Days) */}
            <div className={styles.calendarTileGrid}>
              {currentMonthData.days.map((d) => (
                <div
                  key={d.day}
                  className={`${styles.calendarDayTile} ${
                    d.status === "Present"
                      ? styles.tilePresent
                      : d.status === "Absent"
                      ? styles.tileAbsent
                      : d.status === "HalfDay"
                      ? styles.tileHalfDay
                      : styles.tileNotAssigned
                  }`}
                  title={`Day ${d.day}: ${d.status === "HalfDay" ? "Half Day" : d.status === "NotAssigned" ? "Not Assigned" : d.status}`}
                >
                  {d.day}
                </div>
              ))}
            </div>
          </section>

          {/* Card 2: Attendance History Log Table */}
          <section id="attendance" className={styles.detailSectionCard}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <span>Attendance & Work History Log</span>
              </h2>
              <span className={styles.sectionSubCount}>Recent 5 Days Logged</span>
            </div>

            <div className={styles.tableWrapper}>
              <div className={styles.tableContainer}>
                <table className={styles.dataTable} aria-label="Attendance History Log">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Project Site</th>
                      <th>Check-In</th>
                      <th>Check-Out</th>
                      <th>Shift Hours</th>
                      <th>Overtime</th>
                      <th>Status</th>
                      <th>Site Supervisor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ext?.attendanceLogs.map((log) => (
                      <tr key={log.id}>
                        <td style={{ fontWeight: 650 }}>{log.date}</td>
                        <td>{log.projectName}</td>
                        <td>{log.checkInTime}</td>
                        <td>{log.checkOutTime}</td>
                        <td>{log.hoursWorked} hrs</td>
                        <td>{log.overtimeHours > 0 ? `+${log.overtimeHours} hrs` : "—"}</td>
                        <td>
                          <span className={styles.statusSettledPill} style={{ padding: "2px 8px" }}>
                            {log.status}
                          </span>
                        </td>
                        <td style={{ color: "#64748b" }}>{log.approvedBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table Footer with Pagination */}
              <div className={styles.tableFooterRow}>
                <span className={styles.tableFooterCount}>
                  Showing 1-{ext?.attendanceLogs.length || 5} of {ext?.attendanceLogs.length || 5} attendance logs
                </span>
                <div className={styles.paginationGroup}>
                  <button type="button" className={styles.pageArrowBtn} disabled>&lt;</button>
                  <button type="button" className={`${styles.pageNumBtn} ${styles.pageNumBtnActive}`}>1</button>
                  <button type="button" className={styles.pageNumBtn}>2</button>
                  <button type="button" className={styles.pageArrowBtn}>&gt;</button>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ---------------------------------------------------------
         TAB 5: PAYMENT & BANK DETAILS
         --------------------------------------------------------- */}
      {activeTab === "payment-bank" && (
        <section id="payment-bank" className={styles.sectionCard}>
          {/* Sub-section A: Verified Bank Account & UPI Details */}
          <div className={styles.subSectionBlock}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
              <h3 className={styles.subSectionTitle}>
                Verified Bank Account & UPI Details
              </h3>
              <span className={styles.verifiedPill}>
                <ShieldCheck size={13} /> Penny Drop Verified
              </span>
            </div>

            <div className={styles.kvGrid}>
              <div className={styles.kvItem}>
                <span className={styles.kvLabel}>Account Holder Name</span>
                <span className={styles.kvValue}>{ext?.bankDetails.accountHolderName}</span>
              </div>

              <div className={styles.kvItem}>
                <span className={styles.kvLabel}>Bank Name</span>
                <span className={styles.kvValue}>{ext?.bankDetails.bankName}</span>
              </div>

              <div className={styles.kvItem}>
                <span className={styles.kvLabel}>Account Number (Masked)</span>
                <span className={styles.kvValue}>{ext?.bankDetails.accountNumberMasked}</span>
              </div>

              <div className={styles.kvItem}>
                <span className={styles.kvLabel}>IFSC Code</span>
                <span className={styles.kvValue}>{ext?.bankDetails.ifscCode}</span>
              </div>

              <div className={styles.kvItem}>
                <span className={styles.kvLabel}>Branch Location</span>
                <span className={styles.kvValue}>{ext?.bankDetails.branchName}</span>
              </div>

              <div className={styles.kvItem}>
                <span className={styles.kvLabel}>UPI Address</span>
                <span className={styles.kvValue}>{ext?.bankDetails.upiId}</span>
              </div>
            </div>
          </div>

          {/* Sub-section B: Wage Disbursement Transaction Ledger */}
          <div className={styles.subSectionBlock}>
            <h3 className={styles.subSectionTitle}>
              Wage Disbursement Transaction Ledger
            </h3>

            <div className={styles.tableWrapper}>
              <div className={styles.tableContainer}>
                <table className={styles.dataTable} aria-label="Wage Disbursement Transaction Ledger">
                  <thead>
                    <tr>
                      <th>Date & Payment / Bill ID</th>
                      <th>Scope & Activity</th>
                      <th style={{ textAlign: "right" }}>Amount</th>
                      <th style={{ textAlign: "center" }}>Status</th>
                      <th style={{ textAlign: "right" }}>Receipt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ext?.financialTransactions.map((tx) => (
                      <tr key={tx.id}>
                        {/* Col 1: Date & Payment / Bill ID */}
                        <td>
                          <div className={styles.txCellDateGroup}>
                            <span className={styles.txCellDate}>{tx.date}</span>
                            <span className={styles.txCellSubId}>{tx.referenceNo}</span>
                          </div>
                        </td>

                        {/* Col 2: Scope & Activity */}
                        <td>
                          <div className={styles.txCellScopeGroup}>
                            <div className={styles.txScopeTitleRow}>
                              <span className={styles.txScopeTitle}>{tx.projectName}</span>
                              <span className={styles.txCategoryBadge}>
                                {tx.type === "Credit" ? "Weekly Deployment Settlement" : tx.type}
                              </span>
                            </div>
                            <span className={styles.txScopeDesc}>{tx.description}</span>
                          </div>
                        </td>

                        {/* Col 3: Amount */}
                        <td style={{ textAlign: "right" }}>
                          <span className={styles.txAmountText}>₹{tx.amount.toLocaleString()}</span>
                        </td>

                        {/* Col 4: Status */}
                        <td style={{ textAlign: "center" }}>
                          {tx.status === "Paid" ? (
                            <span className={styles.statusSettledPill}>✓ Settled</span>
                          ) : tx.status === "Processing" ? (
                            <span className={styles.statusProcessingPill}>⌛ Processing</span>
                          ) : (
                            <span className={styles.statusPendingPill}>• Pending</span>
                          )}
                        </td>

                        {/* Col 5: Receipt */}
                        <td style={{ textAlign: "right" }}>
                          <button
                            type="button"
                            className={styles.receiptIconBtn}
                            title="View Receipt"
                            onClick={() => alert(`Viewing receipt for ${tx.referenceNo}...`)}
                          >
                            <FileText size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table Footer with Pagination matching reference image */}
              <div className={styles.tableFooterRow}>
                <span className={styles.tableFooterCount}>
                  Showing 1-5 of {ext?.financialTransactions.length || 5} transactions
                </span>
                <div className={styles.paginationGroup}>
                  <button type="button" className={styles.pageArrowBtn} disabled>&lt;</button>
                  <button type="button" className={`${styles.pageNumBtn} ${styles.pageNumBtnActive}`}>1</button>
                  <button type="button" className={styles.pageNumBtn}>2</button>
                  <button type="button" className={styles.pageArrowBtn}>&gt;</button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ---------------------------------------------------------
         TAB 6: DOCUMENTS
         --------------------------------------------------------- */}
      {activeTab === "documents" && (
        <section id="documents" className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <span>Verified Documents & Credentials</span>
            </h2>
            <span className={styles.sectionSubCount}>
              {ext?.documents.length} Uploaded Files
            </span>
          </div>

          <div className={styles.docsGrid}>
            {ext?.documents.map((doc) => (
              <div key={doc.id} className={styles.docCard}>
                <div className={styles.docMeta}>
                  <span className={styles.docTitle}>{doc.title}</span>
                  <span className={styles.docSub}>
                    Ref: {doc.documentNumber || "Verified"}
                  </span>
                </div>
                <button
                  type="button"
                  className={styles.docActionBtn}
                  onClick={() => alert(`Opening document ${doc.title}...`)}
                >
                  <Download size={13} />
                  <span>View</span>
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Quick Profile Drawer overlay if triggered from CTAs */}
      {isDrawerOpen && (
        <HandsWorkerProfileDrawer
          worker={worker}
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
        />
      )}
    </div>
  );
}
