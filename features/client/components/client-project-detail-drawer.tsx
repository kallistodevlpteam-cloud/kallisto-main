"use client";

import React, { useState } from "react";
import {
  X,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  FileText,
  FileCheck,
  CreditCard,
  Building,
  Users,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Star,
  Lock,
} from "lucide-react";
import {
  OdinDuotoneIcon,
  DocumentsDuotoneIcon,
  PaymentsDuotoneIcon,
  ProjectsDuotoneIcon,
} from "@/components/layout/sidebar-icons";
import { ClientProject } from "../types";
import styles from "./client-projects.module.css";

interface ClientProjectDetailDrawerProps {
  project: ClientProject;
  onClose: () => void;
  onOpenOdinWithPrompt: (promptText: string) => void;
}

type DetailTab = "timeline" | "deliverables" | "finance" | "team";

const TIMELINE_STAGES = [
  {
    id: "stage-1",
    title: "1. Site Feasibility & Topography Survey",
    status: "completed",
    date: "Completed • June 2026",
    description: "Digital terrain model, soil bearing capacity test, and boundary contour verified.",
  },
  {
    id: "stage-2",
    title: "2. Architectural Concept & Layout Approvals",
    status: "completed",
    date: "Completed • July 2026",
    description: "2D floor plans, spatial circulation, elevation renders, and municipal permits approved.",
  },
  {
    id: "stage-3",
    title: "3. Structural Engineering & Plinth Casting",
    status: "active",
    date: "In Progress • Due August 2026",
    description: "Foundation footings casted. Plinth beam steel reinforcement inspection pending sign-off.",
  },
  {
    id: "stage-4",
    title: "4. Superstructure & Roof Slab Casting",
    status: "locked",
    date: "Upcoming • September 2026",
    description: "Column shuttering, masonry brickwork, and first floor slab casting.",
  },
  {
    id: "stage-5",
    title: "5. MEP, Finishing, Interior Handover",
    status: "locked",
    date: "Upcoming • November 2026",
    description: "Concealed electrical, Italian marble flooring, false ceiling, and final snag audit.",
  },
];

const DELIVERABLES_LIST = [
  {
    id: "del-1",
    name: "Electrical_Layout_V2.1.pdf",
    category: "Electrical & Lighting",
    status: "Action Required",
    badgeClass: "badgeAlert",
    date: "Uploaded Yesterday",
    size: "12.4 MB",
    prompt: "Review Electrical Layout Drawing V2.1 and check switch placements.",
  },
  {
    id: "del-2",
    name: "Living_Terrace_Concept_Render.png",
    category: "3D Visualization",
    status: "Ready for Review",
    badgeClass: "badgeReady",
    date: "2 days ago",
    size: "18.2 MB",
    prompt: "Review the 3D living terrace concept rendering with Odin.",
  },
  {
    id: "del-3",
    name: "Preliminary_BOQ_Rev2.xlsx",
    category: "Cost & Quantity",
    status: "Approved",
    badgeClass: "badgeDraft",
    date: "1 week ago",
    size: "1.4 MB",
    prompt: "Show me the line item breakdown in Preliminary BOQ Rev 2.",
  },
  {
    id: "del-4",
    name: "Soil_Investigation_Certified_Report.pdf",
    category: "Geotechnical",
    status: "Certified",
    badgeClass: "badgeDraft",
    date: "June 2026",
    size: "6.8 MB",
    prompt: "Summarize the geotechnical soil report findings for this site.",
  },
];

const TEAM_MEMBERS = [
  {
    id: "tm-1",
    name: "Arjun Architects",
    role: "Lead Architectural Consultant",
    rating: "4.9",
    experience: "14 years in luxury residential design",
    status: "Verified Kallisto Partner",
  },
  {
    id: "tm-2",
    name: "Apex Structural Engineers",
    role: "Structural & Civil Consultant",
    rating: "4.8",
    experience: "Seismic Zone III certified engineers",
    status: "Verified Kallisto Partner",
  },
  {
    id: "tm-3",
    name: "Kallisto Field QA & Site Audit",
    role: "Independent Inspection & Escrow Verification",
    rating: "5.0",
    experience: "Field QA certification team",
    status: "Authoritative Kallisto Core",
  },
];

export function ClientProjectDetailDrawer({
  project,
  onClose,
  onOpenOdinWithPrompt,
}: ClientProjectDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<DetailTab>("timeline");

  return (
    <div className={styles.drawerOverlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.drawerModal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.drawerHeader}>
          <div className={styles.drawerHeaderLeft}>
            <div className={styles.drawerTitleRow}>
              <h2 className={styles.drawerTitle}>{project.name}</h2>
              <span className={styles.cardCodeBadge}>{project.code}</span>
              <span className={styles.stageBadge}>
                <span className={styles.stageDot} />
                {project.stage}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
              {project.location} • {project.category} • Target Completion: {project.targetCompletion}
            </p>
          </div>

          <button
            type="button"
            className={styles.drawerCloseBtn}
            onClick={onClose}
            aria-label="Close project details"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className={styles.drawerNavTabs} role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "timeline"}
            className={`${styles.drawerTabBtn} ${activeTab === "timeline" ? styles.drawerTabBtnActive : ""}`}
            onClick={() => setActiveTab("timeline")}
          >
            <Clock size={14} />
            <span>Timeline & Milestones</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "deliverables"}
            className={`${styles.drawerTabBtn} ${activeTab === "deliverables" ? styles.drawerTabBtnActive : ""}`}
            onClick={() => setActiveTab("deliverables")}
          >
            <DocumentsDuotoneIcon size={14} />
            <span>Deliverables & Files ({project.fileCount})</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "finance"}
            className={`${styles.drawerTabBtn} ${activeTab === "finance" ? styles.drawerTabBtnActive : ""}`}
            onClick={() => setActiveTab("finance")}
          >
            <PaymentsDuotoneIcon size={14} />
            <span>Escrow & Payments</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "team"}
            className={`${styles.drawerTabBtn} ${activeTab === "team" ? styles.drawerTabBtnActive : ""}`}
            onClick={() => setActiveTab("team")}
          >
            <Users size={14} />
            <span>Project Team</span>
          </button>
        </div>

        {/* Body Content */}
        <div className={styles.drawerBody}>
          {/* TAB 1: TIMELINE & MILESTONES */}
          {activeTab === "timeline" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>
                  Current Phase: {project.stage} ({project.progress}% Complete)
                </span>
                <button
                  type="button"
                  className={styles.odinChatBtn}
                  onClick={() =>
                    onOpenOdinWithPrompt(`Give me a detailed status update and timeline forecast for ${project.name}`)
                  }
                >
                  <Sparkles size={13} />
                  <span>Ask Odin about Timeline</span>
                </button>
              </div>

              <div className={styles.timelineList}>
                {TIMELINE_STAGES.map((s) => (
                  <div key={s.id} className={styles.timelineItem}>
                    <div
                      className={`${styles.timelineNode} ${
                        s.status === "completed"
                          ? styles.timelineNodeCompleted
                          : s.status === "active"
                          ? styles.timelineNodeActive
                          : ""
                      }`}
                    >
                      {s.status === "completed" && "✓"}
                      {s.status === "locked" && <Lock size={10} />}
                    </div>
                    <div className={styles.timelineTitle}>{s.title}</div>
                    <span style={{ fontSize: "11px", color: s.status === "active" ? "#ea580c" : "#94a3b8", fontWeight: 600 }}>
                      {s.date}
                    </span>
                    <div className={styles.timelineDesc}>{s.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: DELIVERABLES */}
          {activeTab === "deliverables" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>
                  Submitted Drawings, Specifications & Renders
                </span>
                <span style={{ fontSize: "12px", color: "#64748b" }}>{DELIVERABLES_LIST.length} files available</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {DELIVERABLES_LIST.map((del) => (
                  <div
                    key={del.id}
                    style={{
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                      padding: "12px 16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "12px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "8px",
                          background: "#ffffff",
                          border: "1px solid #e2e8f0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#ea580c",
                          flexShrink: 0,
                        }}
                      >
                        <FileCheck size={18} />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 }}>
                        <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>{del.name}</span>
                        <span style={{ fontSize: "11px", color: "#64748b" }}>
                          {del.category} • {del.size} • {del.date}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          padding: "3px 8px",
                          borderRadius: "6px",
                          background: del.status === "Action Required" ? "#fff1f2" : "#f0fdf4",
                          color: del.status === "Action Required" ? "#e11d48" : "#16a34a",
                        }}
                      >
                        {del.status}
                      </span>
                      <button
                        type="button"
                        className={styles.detailsBtn}
                        onClick={() => onOpenOdinWithPrompt(del.prompt)}
                      >
                        <Sparkles size={12} />
                        <span>Inspect</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: FINANCE & ESCROW */}
          {activeTab === "finance" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "14px",
                  padding: "16px 20px",
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "16px",
                }}
              >
                <div>
                  <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>
                    Total Contract
                  </span>
                  <div style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", marginTop: "2px" }}>
                    {project.totalBudget}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>
                    Paid / Escrow Settled
                  </span>
                  <div style={{ fontSize: "18px", fontWeight: 800, color: "#059669", marginTop: "2px" }}>
                    {project.paidAmount}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>
                    Pending Balance
                  </span>
                  <div style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", marginTop: "2px" }}>
                    {project.pendingAmount}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>Milestone Payment Schedule</span>
                <button
                  type="button"
                  className={styles.odinChatBtn}
                  onClick={() =>
                    onOpenOdinWithPrompt(`Give me a detailed financial audit and escrow summary for ${project.name}`)
                  }
                >
                  <Sparkles size={13} />
                  <span>Audit in Odin</span>
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    padding: "12px 16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>
                      Milestone 1: Architectural Concept & Permitting
                    </span>
                    <p style={{ margin: "2px 0 0", fontSize: "11.5px", color: "#059669" }}>
                      ✓ Verified by QA • ₹15,00,000 Settled
                    </p>
                  </div>
                  <span style={{ fontSize: "11.5px", fontWeight: 700, color: "#059669" }}>Paid</span>
                </div>

                <div
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    padding: "12px 16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>
                      Milestone 2: Soil Investigation & Foundation
                    </span>
                    <p style={{ margin: "2px 0 0", fontSize: "11.5px", color: "#059669" }}>
                      ✓ Verified by QA • ₹30,00,000 Settled
                    </p>
                  </div>
                  <span style={{ fontSize: "11.5px", fontWeight: 700, color: "#059669" }}>Paid</span>
                </div>

                <div
                  style={{
                    background: "#fffbeb",
                    border: "1px solid #fde68a",
                    borderRadius: "12px",
                    padding: "12px 16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#92400e" }}>
                      Milestone 3: Plinth Beam & Superstructure
                    </span>
                    <p style={{ margin: "2px 0 0", fontSize: "11.5px", color: "#b45309" }}>
                      ⏳ Inspection complete • ₹20,00,000 Ready for Authorization
                    </p>
                  </div>
                  <button
                    type="button"
                    className={styles.odinChatBtn}
                    style={{ background: "#d97706", borderColor: "#d97706" }}
                    onClick={() =>
                      onOpenOdinWithPrompt(`Authorize Milestone 3 payment of ₹20,00,000 for ${project.name}`)
                    }
                  >
                    <span>Authorize ₹20L →</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TEAM */}
          {activeTab === "team" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>
                Assigned Specialists & Project Leads
              </span>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {TEAM_MEMBERS.map((tm) => (
                  <div
                    key={tm.id}
                    style={{
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                      padding: "14px 16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "10px",
                          background: "#0f172a",
                          color: "#ffffff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "14px",
                          fontWeight: 700,
                        }}
                      >
                        {tm.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontSize: "13.5px", fontWeight: 700, color: "#0f172a" }}>{tm.name}</span>
                          <span style={{ fontSize: "11px", color: "#eab308", display: "flex", alignItems: "center", gap: "2px", fontWeight: 700 }}>
                            ★ {tm.rating}
                          </span>
                        </div>
                        <span style={{ fontSize: "11.5px", color: "#64748b" }}>{tm.role}</span>
                        <span style={{ fontSize: "10.5px", color: "#94a3b8" }}>{tm.experience}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className={styles.detailsBtn}
                      onClick={() =>
                        onOpenOdinWithPrompt(`Connect me with ${tm.name} regarding project ${project.name}`)
                      }
                    >
                      <Sparkles size={12} />
                      <span>Contact Lead</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
