"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import {
  Calendar,
  Clock,
  CheckCircle2,
  FileCheck2,
  HardHat,
  ShieldCheck,
  Search,
  Plus,
  Filter,
  MapPin,
  CheckSquare,
  X,
  ThumbsUp,
} from "lucide-react";
import { ClockDuotoneIcon } from "@/components/layout/sidebar-icons";
import styles from "./project-activity-workspace.module.css";

export interface UpcomingActivityItem {
  id: string;
  title: string;
  dateDay: string;
  dateMonth: string;
  dateTime: string;
  relativeLabel: string;
  category: string;
  location: string;
  assignedSupervisor: string;
  urgency: "critical" | "high" | "standard";
  urgencyLabel: string;
  description: string;
  checklist: string[];
  status: "scheduled" | "in_progress" | "completed";
}

export interface SupervisorLogEntry {
  id: string;
  supervisorName: string;
  supervisorRole: string;
  avatar?: string;
  timestamp: string;
  title: string;
  category: string;
  status: "verified" | "approved" | "action_required";
  statusLabel: string;
  notes: string;
  siteConditions: {
    weather: string;
    laborHandsCount: string;
    ppeCompliance: string;
  };
  evidencePhotos: Array<{
    url: string;
    caption: string;
    geoTag: string;
  }>;
  signOffLicense: string;
  attachedDoc?: {
    title: string;
    size: string;
  };
  acknowledged?: boolean;
}

export interface MilestoneEvent {
  id: string;
  title: string;
  timestamp: string;
  description: string;
  status: "active" | "completed";
}

export const INITIAL_UPCOMING_ACTIVITIES: UpcomingActivityItem[] = [
  {
    id: "act-up-01",
    title: "Structural Slab Rebar & Shuttering Inspection",
    dateDay: "25",
    dateMonth: "JUL",
    dateTime: "10:30 AM",
    relativeLabel: "Tomorrow",
    category: "Site Inspection",
    location: "First Floor Slab & Cantilever Deck",
    assignedSupervisor: "Vikram Das (Kallisto FTP Supervisor)",
    urgency: "critical",
    urgencyLabel: "Critical Path · Pre-Pour Clearance",
    description:
      "Mandatory pre-pour inspection of high-yield Fe550D rebar spacing (150mm c/c), 25mm PVC cover blocks, and electrical conduit sleeves prior to RMC batch dispatch.",
    checklist: [
      "25mm cover blocks verified",
      "Rebar spacing 150mm c/c confirmed",
      "Electrical conduits encased",
    ],
    status: "scheduled",
  },
  {
    id: "act-up-02",
    title: "Plumbing Rough-in & Pressure Testing",
    dateDay: "27",
    dateMonth: "JUL",
    dateTime: "02:00 PM",
    relativeLabel: "In 3 days",
    category: "MEP Verification",
    location: "Master Bath & Kitchen Utility Core",
    assignedSupervisor: "Suresh Nair (FTP MEP Field Lead)",
    urgency: "high",
    urgencyLabel: "High Priority · QA Witness",
    description:
      "Hydrostatic pressure testing of all CPVC water supply lines at 10 bar for 4 hours; gravity slope verification for soil and waste drain pipes.",
    checklist: ["10-bar hydrostatic hold test", "Slope gradient >= 1:50", "Duct sleeve watertightness"],
    status: "scheduled",
  },
  {
    id: "act-up-03",
    title: "Electrical Conduit Routing & DB Box Placement Check",
    dateDay: "29",
    dateMonth: "JUL",
    dateTime: "11:00 AM",
    relativeLabel: "In 5 days",
    category: "Trade Inspection",
    location: "Living Room & Formal Foyer",
    assignedSupervisor: "Rajesh Kumar (FTP Electrical Supervisor)",
    urgency: "standard",
    urgencyLabel: "Standard Schedule",
    description:
      "Verification of wall chasing depths, conduit fire-resistance rating, and exact socket centerlines conforming to GFC electrical drawings.",
    checklist: ["Wall chase depth <= 35mm", "Switch box heights 1200mm AFF", "Earthing path continuity"],
    status: "scheduled",
  },
  {
    id: "act-up-04",
    title: "Client & Architect On-Site Sample Review",
    dateDay: "01",
    dateMonth: "AUG",
    dateTime: "04:00 PM",
    relativeLabel: "Next Week",
    category: "Client Review",
    location: "On-Site Mockup Bay",
    assignedSupervisor: "Priya Sharma (Lead Architect) & Vikram Das (FTP)",
    urgency: "high",
    urgencyLabel: "Client Milestone",
    description:
      "Review 1:1 dry-lay mockups of Italian Statuario marble floor tiles and teak wood fluted wall panelling with client stakeholders.",
    checklist: ["Vein continuity matched", "Polish sheen benchmarked", "Client sign-off docket prepared"],
    status: "scheduled",
  },
  {
    id: "act-up-05",
    title: "Ready-Mix Concrete (RMC) M25 Batch Pour",
    dateDay: "03",
    dateMonth: "AUG",
    dateTime: "07:00 AM",
    relativeLabel: "In 10 days",
    category: "Milestone Execution",
    location: "Level 1 Suspended Slab",
    assignedSupervisor: "Kallisto FTP Field Operations Team",
    urgency: "critical",
    urgencyLabel: "Contract Milestone",
    description:
      "Monolithic pour of 48 m³ M25 design mix; on-site slump cone testing, temperature logging, and 6-cube sampling for 7-day and 28-day curing tests.",
    checklist: ["Slump measured 110±10mm", "6 cube specimens cast", "Vibrator needle crew deployed"],
    status: "scheduled",
  },
];

export const INITIAL_SUPERVISOR_LOGS: SupervisorLogEntry[] = [
  {
    id: "sup-log-01",
    supervisorName: "Vikram Das",
    supervisorRole: "FTP Site Supervisor · Kallisto Field Team",
    avatar: "/assets/arjun-avatar.jpg",
    timestamp: "Today · 11:45 AM",
    title: "Daily Site Supervision & Rebar Verification Log",
    category: "Structural QA/QC",
    status: "verified",
    statusLabel: "Passed QA/QC Check",
    notes:
      "Comprehensive inspection of Level 1 slab reinforcement completed. Bottom reinforcement steel (12mm Fe550D) tied at 150mm c/c with approved binding wire. Cover blocks positioned at 1m intervals. Electrician crew has laid conduit lines for recessed ceiling lights. Shuttering oil evenly applied without ponding.",
    siteConditions: {
      weather: "☀️ 32°C · Dry site conditions",
      laborHandsCount: "👷 22 Hands active (14 Masons, 6 Helpers, 2 Electricians)",
      ppeCompliance: "🛡️ 100% PPE compliant (Helmets, boots & safety harnesses)",
    },
    evidencePhotos: [
      {
        url: "/assets/nila-thumb1.jpg",
        caption: "Rebar grid tie-points & cantilever beam anchoring",
        geoTag: "GPS: 9.9816° N, 76.2999° E · Kochi",
      },
      {
        url: "/assets/nila-thumb2.jpg",
        caption: "25mm PVC cover blocks installed beneath bottom mesh",
        geoTag: "GPS: 9.9816° N, 76.2999° E · Kochi",
      },
      {
        url: "/assets/nila-thumb3.jpg",
        caption: "Embedded PVC conduits for living ceiling lighting",
        geoTag: "GPS: 9.9816° N, 76.2999° E · Kochi",
      },
      {
        url: "/assets/nila-hero.jpg",
        caption: "Perimeter shuttering line alignment inspection",
        geoTag: "GPS: 9.9816° N, 76.2999° E · Kochi",
      },
    ],
    signOffLicense: "Signed off by Vikram Das (Kallisto FTP License #KL-FTP-4091)",
    attachedDoc: {
      title: "FTP Structural Inspection Checklist #FTP-2026-088.pdf",
      size: "1.4 MB",
    },
    acknowledged: true,
  },
  {
    id: "sup-log-02",
    supervisorName: "Rohan Verma",
    supervisorRole: "Senior QA/QC Field Engineer · FTP Team",
    avatar: "/assets/allen-avatar.jpg",
    timestamp: "Yesterday · 04:20 PM",
    title: "Inward Material Batch & Quality Inspection",
    category: "Material Verification",
    status: "approved",
    statusLabel: "Batch Approved",
    notes:
      "Received consignment of 240 bags of UltraTech 53-Grade OPC Cement (Batch #UT-KL-8821) and 12 metric tonnes of Tata Tiscon Fe550D TMT rebar. Verified manufacturer test certificates against Kallisto BOQ specifications. Bags stacked on raised wooden pallets with water-resistant tarpaulin coverage.",
    siteConditions: {
      weather: "⛅ 29°C · Clear skies",
      laborHandsCount: "👷 18 Hands active on site",
      ppeCompliance: "🛡️ 100% PPE compliant",
    },
    evidencePhotos: [
      {
        url: "/assets/nila-thumb2.jpg",
        caption: "UltraTech 53 Grade cement inward stack inspection",
        geoTag: "GPS: 9.9815° N, 76.2998° E · Kochi",
      },
      {
        url: "/assets/nila-thumb1.jpg",
        caption: "TMT rebar tag validation & caliper diameter checks",
        geoTag: "GPS: 9.9815° N, 76.2998° E · Kochi",
      },
    ],
    signOffLicense: "Signed off by Rohan Verma (QA/QC #FTP-QC-1102)",
    attachedDoc: {
      title: "Material Inward & Mill Test Certificate #MTC-2026-319.pdf",
      size: "820 KB",
    },
    acknowledged: false,
  },
  {
    id: "sup-log-03",
    supervisorName: "Vikram Das",
    supervisorRole: "FTP Site Supervisor · Kallisto Field Team",
    avatar: "/assets/arjun-avatar.jpg",
    timestamp: "22 Jul 2026 · 09:15 AM",
    title: "Foundation & Anti-Termite Treatment Soil Log",
    category: "Sub-structure & Chemical",
    status: "verified",
    statusLabel: "Signed Off",
    notes:
      "Pre-construction anti-termite chemical emulsion (Chlorpyrifos 20% EC) injected along foundation trenches and backfill perimeter at specified dosage of 5L/m². Completed before plinth beam backfilling. Soil compaction tests yielded 96% Proctor density.",
    siteConditions: {
      weather: "🌧️ 26°C · Light morning drizzle",
      laborHandsCount: "👷 12 Hands active",
      ppeCompliance: "🛡️ Respirators & chemical gloves verified",
    },
    evidencePhotos: [
      {
        url: "/assets/nila-thumb3.jpg",
        caption: "Chemical soil barrier application along plinth perimeter",
        geoTag: "GPS: 9.9816° N, 76.2999° E · Kochi",
      },
    ],
    signOffLicense: "Signed off by Vikram Das (Kallisto FTP License #KL-FTP-4091)",
    attachedDoc: {
      title: "Anti-Termite Treatment Guarantee Certificate #ATT-2026-05.pdf",
      size: "640 KB",
    },
    acknowledged: true,
  },
  {
    id: "sup-log-04",
    supervisorName: "Anand Kumar",
    supervisorRole: "FTP EHS & Safety Auditor · Kallisto Field Team",
    avatar: "/assets/rahul-avatar.jpg",
    timestamp: "20 Jul 2026 · 02:30 PM",
    title: "Site Safety & Hazard Assessment Audit",
    category: "EHS Safety Audit",
    status: "action_required",
    statusLabel: "Passed with 1 Advisory",
    notes:
      "Weekly site safety checklist audited. Perimeter barricading intact, first aid box replenished, temporary electrical distribution board grounded with working ELCB. Advisory noted: Edge protection railing on stairwell opening required an additional intermediate toe-board, which was erected immediately by site carpenter.",
    siteConditions: {
      weather: "☀️ 31°C · Hot & humid",
      laborHandsCount: "👷 20 Hands active",
      ppeCompliance: "🛡️ 100% verified after safety briefing",
    },
    evidencePhotos: [
      {
        url: "/assets/nila-hero.jpg",
        caption: "Temporary distribution board & ELCB ground audit",
        geoTag: "GPS: 9.9816° N, 76.2999° E · Kochi",
      },
    ],
    signOffLicense: "Signed off by Anand Kumar (Kallisto EHS Auditor #KL-SAF-089)",
    acknowledged: true,
  },
];

export const INITIAL_MILESTONE_EVENTS: MilestoneEvent[] = [
  {
    id: "evt-01",
    title: "Project Created & Active",
    timestamp: "Active",
    description: "Enquiry requirement brief accepted and converted to live active project workspace.",
    status: "active",
  },
  {
    id: "evt-02",
    title: "Proposal Accepted",
    timestamp: "24 Jul 2026",
    description: "Commercial proposal and initial scope acknowledged by client.",
    status: "completed",
  },
  {
    id: "evt-03",
    title: "Site Feasibility Verified",
    timestamp: "23 Jul 2026",
    description: "Field survey contours and site evidence documents reviewed by ODIN.",
    status: "completed",
  },
  {
    id: "evt-04",
    title: "Enquiry Received",
    timestamp: "23 Jul 2026",
    description: "New requirement brief submitted and logged into Kallisto pipeline.",
    status: "completed",
  },
];

export interface ProjectActivityWorkspaceProps {
  projectId?: string;
  projectName?: string;
  initialTab?: "all" | "upcoming" | "supervisor" | "timeline";
}

export function ProjectActivityWorkspace({
  projectId = "proj-001",
  projectName = "Nila Residence",
  initialTab = "all",
}: ProjectActivityWorkspaceProps) {
  const [activeSegment, setActiveSegment] = useState<"all" | "upcoming" | "supervisor" | "timeline">(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [upcomingList] = useState<UpcomingActivityItem[]>(INITIAL_UPCOMING_ACTIVITIES);
  const [supervisorLogs, setSupervisorLogs] = useState<SupervisorLogEntry[]>(INITIAL_SUPERVISOR_LOGS);
  const [milestones] = useState<MilestoneEvent[]>(INITIAL_MILESTONE_EVENTS);

  // Modal states
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<{
    url: string;
    caption: string;
    geoTag: string;
  } | null>(null);

  // Form states for adding a new supervisor log
  const [formSupervisorName, setFormSupervisorName] = useState("Vikram Das");
  const [formSupervisorRole, setFormSupervisorRole] = useState("FTP Site Supervisor · Kallisto Field Team");
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("Structural QA/QC");
  const [formNotes, setFormNotes] = useState("");
  const [formStatus, setFormStatus] = useState<"verified" | "approved" | "action_required">("verified");
  const [formWeather, setFormWeather] = useState("☀️ 32°C · Clear & Dry");
  const [formLabor, setFormLabor] = useState("👷 22 Hands active on site");

  const handleAcknowledgeLog = (logId: string) => {
    setSupervisorLogs((prev) =>
      prev.map((log) => (log.id === logId ? { ...log, acknowledged: true } : log))
    );
  };

  const handleCreateLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formNotes.trim()) return;

    const newLog: SupervisorLogEntry = {
      id: `sup-log-${Date.now()}`,
      supervisorName: formSupervisorName,
      supervisorRole: formSupervisorRole,
      avatar: "/assets/arjun-avatar.jpg",
      timestamp: "Just now",
      title: formTitle,
      category: formCategory,
      status: formStatus,
      statusLabel:
        formStatus === "verified"
          ? "Passed QA/QC Check"
          : formStatus === "approved"
          ? "Batch Approved"
          : "Action Required",
      notes: formNotes,
      siteConditions: {
        weather: formWeather,
        laborHandsCount: formLabor,
        ppeCompliance: "🛡️ 100% PPE compliant",
      },
      evidencePhotos: [
        {
          url: "/assets/nila-thumb1.jpg",
          caption: `Photo evidence: ${formTitle}`,
          geoTag: "GPS: 9.9816° N, 76.2999° E · Verified on Site",
        },
      ],
      signOffLicense: `Signed off by ${formSupervisorName} (Kallisto FTP Field Supervisor)`,
      acknowledged: true,
    };

    setSupervisorLogs([newLog, ...supervisorLogs]);
    setIsLogModalOpen(false);
    setFormTitle("");
    setFormNotes("");
    setActiveSegment("supervisor");
  };

  // Filtered upcoming activities
  const filteredUpcoming = useMemo(() => {
    return upcomingList.filter((item) => {
      const matchesSearch =
        searchQuery === "" ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.assignedSupervisor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        categoryFilter === "all" || item.category.toLowerCase().includes(categoryFilter.toLowerCase());

      return matchesSearch && matchesCategory;
    });
  }, [upcomingList, searchQuery, categoryFilter]);

  // Filtered supervisor logs
  const filteredSupervisorLogs = useMemo(() => {
    return supervisorLogs.filter((item) => {
      const matchesSearch =
        searchQuery === "" ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.supervisorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        categoryFilter === "all" || item.category.toLowerCase().includes(categoryFilter.toLowerCase());

      return matchesSearch && matchesCategory;
    });
  }, [supervisorLogs, searchQuery, categoryFilter]);

  const totalEventCount = upcomingList.length + supervisorLogs.length + milestones.length;

  return (
    <div
      className={styles.workspaceRoot}
      aria-label="Project Activity & Field Operations"
      data-project-id={projectId}
      data-project-name={projectName}
    >
      {/* ── 1. KPI & OPERATIONAL STATUS STRIP ───────────────────── */}
      <div className={styles.kpiStrip}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiTopRow}>
            <span className={styles.kpiLabel}>Upcoming Activities</span>
            <span className={`${styles.kpiIconBox} ${styles.kpiIconBlue}`}>
              <Calendar size={15} />
            </span>
          </div>
          <div className={styles.kpiValueRow}>
            <span className={styles.kpiValue}>{upcomingList.length}</span>
            <span className={styles.kpiSubText}>Scheduled</span>
          </div>
          <span className={styles.kpiSubText}>Next: Slab Rebar Inspection</span>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiTopRow}>
            <span className={styles.kpiLabel}>Supervisor (FTP) Logs</span>
            <span className={`${styles.kpiIconBox} ${styles.kpiIconEmerald}`}>
              <ShieldCheck size={15} />
            </span>
          </div>
          <div className={styles.kpiValueRow}>
            <span className={styles.kpiValue}>{supervisorLogs.length}</span>
            <span className={styles.kpiSubText}>Verified Reports</span>
          </div>
          <span className={styles.kpiSubText}>Latest: Today, 11:45 AM</span>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiTopRow}>
            <span className={styles.kpiLabel}>Site Labor on Site</span>
            <span className={`${styles.kpiIconBox} ${styles.kpiIconAmber}`}>
              <HardHat size={15} />
            </span>
          </div>
          <div className={styles.kpiValueRow}>
            <span className={styles.kpiValue}>22</span>
            <span className={styles.kpiSubText}>Hands Active</span>
          </div>
          <span className={styles.kpiSubText}>14 Masons · 6 Helpers · 2 MEP</span>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiTopRow}>
            <span className={styles.kpiLabel}>QA/QC Verification</span>
            <span className={`${styles.kpiIconBox} ${styles.kpiIconPurple}`}>
              <CheckCircle2 size={15} />
            </span>
          </div>
          <div className={styles.kpiValueRow}>
            <span className={styles.kpiValue}>100%</span>
            <span className={styles.kpiSubText}>Passed</span>
          </div>
          <span className={styles.kpiSubText}>0 Critical Non-conformances</span>
        </div>
      </div>

      {/* ── 2. TOOLBAR: SEGMENT TABS, SEARCH & LOG SITE VISIT BUTTON ─ */}
      <div className={styles.toolbarCard}>
        <div className={styles.toolbarLeft}>
          <div className={styles.segmentGroup} role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeSegment === "all"}
              className={`${styles.segmentBtn} ${activeSegment === "all" ? styles.segmentBtnActive : ""}`}
              onClick={() => setActiveSegment("all")}
            >
              <span>All Activity</span>
              <span className={styles.segmentCountBadge}>{totalEventCount}</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeSegment === "upcoming"}
              className={`${styles.segmentBtn} ${activeSegment === "upcoming" ? styles.segmentBtnActive : ""}`}
              onClick={() => setActiveSegment("upcoming")}
            >
              <span>Upcoming Activities</span>
              <span className={styles.segmentCountBadge}>{upcomingList.length}</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeSegment === "supervisor"}
              className={`${styles.segmentBtn} ${activeSegment === "supervisor" ? styles.segmentBtnActive : ""}`}
              onClick={() => setActiveSegment("supervisor")}
            >
              <span>Supervisor Log (FTP Team)</span>
              <span className={styles.segmentCountBadge}>{supervisorLogs.length}</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeSegment === "timeline"}
              className={`${styles.segmentBtn} ${activeSegment === "timeline" ? styles.segmentBtnActive : ""}`}
              onClick={() => setActiveSegment("timeline")}
            >
              <span>Milestone History</span>
              <span className={styles.segmentCountBadge}>{milestones.length}</span>
            </button>
          </div>

          <div className={styles.searchBox}>
            <Search size={14} style={{ color: "#94a3b8", flexShrink: 0 }} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search activities, supervisor notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search activity records"
            />
          </div>

          <div className={styles.searchBox} style={{ minWidth: "150px" }}>
            <Filter size={14} style={{ color: "#94a3b8", flexShrink: 0 }} />
            <select
              className={styles.searchInput}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filter by category"
            >
              <option value="all">All Categories</option>
              <option value="Site Inspection">Site Inspection</option>
              <option value="Structural QA/QC">Structural QA/QC</option>
              <option value="MEP">MEP Verification</option>
              <option value="Material">Material QA/QC</option>
              <option value="Safety">Safety &amp; EHS</option>
            </select>
          </div>
        </div>

        <div className={styles.toolbarRight}>
          <button
            type="button"
            className={styles.primaryActionBtn}
            onClick={() => setIsLogModalOpen(true)}
            aria-label="Request for site inspection"
          >
            <Plus size={14} strokeWidth={2.2} />
            <span>Request for Site Inspection</span>
          </button>
        </div>
      </div>

      {/* ── 3. UPCOMING ACTIVITIES SECTION ──────────────────────── */}
      {(activeSegment === "all" || activeSegment === "upcoming") && (
        <section className={styles.sectionBlock} aria-label="Upcoming Project Activities">
          <div className={styles.sectionHeaderRow}>
            <div className={styles.sectionTitleGroup}>
              <span className={styles.sectionIconBadge}>
                <Calendar size={14} />
              </span>
              <h3 className={styles.sectionTitle}>Upcoming Activities</h3>
              <span className={styles.countChip}>{filteredUpcoming.length} scheduled</span>
            </div>
            <span style={{ fontSize: "12px", color: "#64748b" }}>
              Technical site inspections &amp; key execution milestones
            </span>
          </div>

          {filteredUpcoming.length === 0 ? (
            <div className={styles.emptyStateCard}>
              <p className={styles.emptyStateTitle}>No upcoming activities match your search</p>
              <p className={styles.emptyStateText}>Clear your search filter to view all scheduled items.</p>
            </div>
          ) : (
            <div className={styles.upcomingGrid}>
              {filteredUpcoming.map((item) => (
                <div key={item.id} className={styles.upcomingCard}>
                  <div className={styles.dateBox}>
                    <span className={styles.dateMonth}>{item.dateMonth}</span>
                    <span className={styles.dateDay}>{item.dateDay}</span>
                    <span className={styles.dateTime}>{item.dateTime}</span>
                  </div>

                  <div className={styles.upcomingContent}>
                    <div className={styles.upcomingTopLine}>
                      <div className={styles.upcomingTitleRow}>
                        <h4 className={styles.upcomingTitle}>{item.title}</h4>
                        <span
                          className={
                            item.urgency === "critical"
                              ? styles.badgeCritical
                              : item.urgency === "high"
                              ? styles.badgeHigh
                              : styles.badgeStandard
                          }
                        >
                          {item.urgencyLabel}
                        </span>
                      </div>
                      <span style={{ fontSize: "11.5px", fontWeight: 600, color: "#2563eb" }}>
                        {item.relativeLabel}
                      </span>
                    </div>

                    <p className={styles.upcomingDescription}>{item.description}</p>

                    <div className={styles.upcomingMetaPills}>
                      <span className={styles.metaItem}>
                        <MapPin size={12} style={{ color: "#94a3b8" }} />
                        <span>{item.location}</span>
                      </span>
                      <span className={styles.metaItem}>
                        <HardHat size={12} style={{ color: "#94a3b8" }} />
                        <span><strong>Supervisor:</strong> {item.assignedSupervisor}</span>
                      </span>
                    </div>

                    {item.checklist && item.checklist.length > 0 && (
                      <div className={styles.checklistRow}>
                        {item.checklist.map((check, idx) => (
                          <span key={idx} className={styles.checklistItem}>
                            <CheckSquare size={11} style={{ color: "#16a34a" }} />
                            <span>{check}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className={styles.upcomingRightActions}>
                    <button
                      type="button"
                      className={`${styles.iconBtn} ${styles.iconBtnPrimary}`}
                      onClick={() => {
                        setFormTitle(`Verification: ${item.title}`);
                        setFormNotes(`Inspection notes for ${item.location} scheduled for ${item.dateDay} ${item.dateMonth}.`);
                        setIsLogModalOpen(true);
                      }}
                      title="Request site inspection for this activity"
                    >
                      <Plus size={13} strokeWidth={2.2} />
                      <span>Request Inspection</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── 4. SUPERVISOR (FTP TEAM) ACTIVITY LOG FEED ─────────── */}
      {(activeSegment === "all" || activeSegment === "supervisor") && (
        <section className={styles.sectionBlock} aria-label="Supervisor Activity Log">
          <div className={styles.sectionHeaderRow}>
            <div className={styles.sectionTitleGroup}>
              <span className={`${styles.sectionIconBadge}`} style={{ background: "#ecfdf5", color: "#059669" }}>
                <ShieldCheck size={14} />
              </span>
              <h3 className={styles.sectionTitle}>Active Log of Supervisor (FTP Team Updates)</h3>
              <span className={styles.countChip}>{filteredSupervisorLogs.length} verified logs</span>
            </div>
            <span style={{ fontSize: "12px", color: "#64748b" }}>
              Field Technical Partner daily governance &amp; QA/QC verification reports
            </span>
          </div>

          {filteredSupervisorLogs.length === 0 ? (
            <div className={styles.emptyStateCard}>
              <p className={styles.emptyStateTitle}>No supervisor logs match your search</p>
              <p className={styles.emptyStateText}>Clear your filters or log a new supervisor site inspection.</p>
            </div>
          ) : (
            <div className={styles.supervisorLogFeed}>
              {filteredSupervisorLogs.map((log) => (
                <div key={log.id} className={styles.supervisorLogCard}>
                  <div className={styles.logHeader}>
                    <div className={styles.supervisorProfileRow}>
                      {log.avatar ? (
                        <Image
                          src={log.avatar}
                          alt={log.supervisorName}
                          width={40}
                          height={40}
                          className={styles.supervisorAvatar}
                          unoptimized
                        />
                      ) : (
                        <div className={styles.avatarFallback}>
                          {log.supervisorName.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className={styles.supervisorInfo}>
                        <div className={styles.supervisorNameRow}>
                          <strong className={styles.supervisorName}>{log.supervisorName}</strong>
                          <span className={styles.ftpVerifiedBadge}>
                            <ShieldCheck size={11} />
                            <span>FTP Verified</span>
                          </span>
                        </div>
                        <span className={styles.supervisorRole}>{log.supervisorRole}</span>
                      </div>
                    </div>

                    <div className={styles.logTimestamp}>
                      <Clock size={13} />
                      <span>{log.timestamp}</span>
                    </div>
                  </div>

                  <div className={styles.logTitleBanner}>
                    <h4 className={styles.logTitle}>{log.title}</h4>
                    <span
                      className={
                        log.status === "verified"
                          ? styles.statusVerified
                          : log.status === "approved"
                          ? styles.statusApproved
                          : styles.statusActionRequired
                      }
                    >
                      {log.statusLabel}
                    </span>
                  </div>

                  <p className={styles.logNotes}>{log.notes}</p>

                  <div className={styles.siteConditionsStrip}>
                    <span className={styles.conditionChip}>{log.siteConditions.weather}</span>
                    <span className={styles.conditionChip}>{log.siteConditions.laborHandsCount}</span>
                    <span className={styles.conditionChip}>{log.siteConditions.ppeCompliance}</span>
                  </div>

                  {log.evidencePhotos && log.evidencePhotos.length > 0 && (
                    <div className={styles.mediaGallery}>
                      {log.evidencePhotos.map((photo, pIdx) => (
                        <div
                          key={pIdx}
                          className={styles.mediaThumbWrapper}
                          onClick={() => setPreviewPhoto(photo)}
                          role="button"
                          tabIndex={0}
                          aria-label={`View photo: ${photo.caption}`}
                        >
                          <Image
                            src={photo.url}
                            alt={photo.caption}
                            fill
                            className={styles.mediaThumbImage}
                            sizes="(max-width: 640px) 50vw, 25vw"
                            unoptimized
                          />
                          <div className={styles.mediaGeoBadge}>
                            <MapPin size={10} />
                            <span>{photo.caption}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className={styles.logFooterRow}>
                    <div className={styles.signoffInfo}>
                      <FileCheck2 size={13} style={{ color: "#16a34a" }} />
                      <span>{log.signOffLicense}</span>
                      {log.attachedDoc && (
                        <span style={{ color: "#2563eb", cursor: "pointer", fontWeight: 600 }}>
                          · {log.attachedDoc.title} ({log.attachedDoc.size})
                        </span>
                      )}
                    </div>

                    <div className={styles.logActions}>
                      <button
                        type="button"
                        className={styles.iconBtn}
                        onClick={() => handleAcknowledgeLog(log.id)}
                        disabled={log.acknowledged}
                      >
                        <ThumbsUp size={12} style={{ color: log.acknowledged ? "#16a34a" : "#64748b" }} />
                        <span>{log.acknowledged ? "Acknowledged" : "Acknowledge"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── 5. MILESTONE HISTORY TIMELINE ──────────────────────── */}
      {(activeSegment === "all" || activeSegment === "timeline") && (
        <section className={styles.sectionBlock} aria-label="Milestone History">
          <div className={styles.sectionHeaderRow}>
            <div className={styles.sectionTitleGroup}>
              <span className={styles.sectionIconBadge} style={{ background: "#f5f3ff", color: "#7c3aed" }}>
                <ClockDuotoneIcon size={14} />
              </span>
              <h3 className={styles.activityTitle || styles.sectionTitle}>Activity Timeline</h3>
              <span className={styles.countBadge || styles.countChip}>{milestones.length} events</span>
            </div>
            <span style={{ fontSize: "12px", color: "#64748b" }}>
              Authoritative project lifecycle and commercial governance history
            </span>
          </div>

          <div className={styles.timelineCard}>
            <div className={styles.timelineTrack}>
              {milestones.map((evt) => (
                <div key={evt.id} className={styles.timelineNode}>
                  <div
                    className={`${styles.timelineNodeIconBox} ${
                      evt.status === "active" ? styles.timelineNodeSuccess : styles.timelineNodePrimary
                    }`}
                  >
                    {evt.status === "active" ? <CheckCircle2 size={16} /> : <FileCheck2 size={16} />}
                  </div>
                  <div className={styles.timelineNodeContent}>
                    <div className={styles.timelineNodeHeader}>
                      <strong className={styles.timelineNodeTitle}>{evt.title}</strong>
                      <span className={styles.timelineNodeTimestamp}>{evt.timestamp}</span>
                    </div>
                    <p className={styles.timelineNodeDesc}>{evt.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 6. LOG INSPECTION MODAL ─────────────────────────────── */}
      {isLogModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsLogModalOpen(false)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Request for Site Inspection (FTP Team)</h3>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setIsLogModalOpen(false)}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateLog}>
              <div className={styles.modalBody}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Supervisor Name</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={formSupervisorName}
                      onChange={(e) => setFormSupervisorName(e.target.value)}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Supervisor Role &amp; FTP Designation</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={formSupervisorRole}
                      onChange={(e) => setFormSupervisorRole(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Inspection / Log Title</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      placeholder="e.g. Electrical Conduit Sleeve Verification"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Category</label>
                    <select
                      className={styles.formSelect}
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                    >
                      <option value="Structural QA/QC">Structural QA/QC</option>
                      <option value="Material Verification">Material Verification</option>
                      <option value="MEP Verification">MEP Verification</option>
                      <option value="Sub-structure & Chemical">Sub-structure & Chemical</option>
                      <option value="EHS Safety Audit">EHS Safety Audit</option>
                      <option value="Finishes & Dry-lay">Finishes & Dry-lay</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Observations &amp; Technical Notes</label>
                  <textarea
                    rows={4}
                    className={styles.formTextarea}
                    placeholder="Enter detailed site observation, measurements, tolerances, and labor deployment..."
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Verification Status</label>
                    <select
                      className={styles.formSelect}
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as "verified" | "approved" | "action_required")}
                    >
                      <option value="verified">Passed QA/QC Check</option>
                      <option value="approved">Batch Approved</option>
                      <option value="action_required">Action Required / Advisory</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Weather Condition</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={formWeather}
                      onChange={(e) => setFormWeather(e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Site Labor Active (Hands)</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={formLabor}
                    onChange={(e) => setFormLabor(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={() => setIsLogModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.primaryActionBtn}>
                  Submit Inspection Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 7. PHOTO LIGHTBOX PREVIEW MODAL ────────────────────── */}
      {previewPhoto && (
        <div className={styles.modalOverlay} onClick={() => setPreviewPhoto(null)}>
          <div className={styles.lightboxBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.lightboxImageWrapper}>
              <Image
                src={previewPhoto.url}
                alt={previewPhoto.caption}
                width={800}
                height={520}
                className={styles.lightboxImage}
                unoptimized
              />
            </div>
            <div className={styles.lightboxMetaBar}>
              <div>
                <h4 className={styles.lightboxTitle}>{previewPhoto.caption}</h4>
                <p className={styles.lightboxSub}>{previewPhoto.geoTag}</p>
              </div>
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={() => setPreviewPhoto(null)}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
