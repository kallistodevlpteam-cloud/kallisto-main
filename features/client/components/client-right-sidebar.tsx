"use client";

import React, { useState } from "react";
import {
  X,
  Plus,
  Clock,
  Sparkles,
  ArrowRight,
  FileSpreadsheet,
  FileText,
  FileCheck,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Lock,
  Building,
  CreditCard,
  Folder,
} from "lucide-react";
import {
  OdinDuotoneIcon,
  DocumentsDuotoneIcon,
  PaymentsDuotoneIcon,
  HistoryDuotoneIcon,
  ProjectsDuotoneIcon,
  TeamDuotoneIcon,
} from "@/components/layout/sidebar-icons";
import { ClientProject } from "../types";
import styles from "./client-right-sidebar.module.css";

export interface ClientRightSidebarProps {
  project?: ClientProject | null;
  onClose: () => void;
  onSelectPrompt: (promptText: string) => void;
  onNewChat?: () => void;
  className?: string;
}

type ClientSidebarTab = "project" | "files" | "finance" | "history";

const MOCK_FILES = [
  {
    id: "f-1",
    name: "Ground_Floor_Plan_Rev2.pdf",
    category: "Architectural Drawing",
    badge: "Under Review",
    badgeClass: "badgeReview",
    size: "8.4 MB",
    time: "Today, 11:30 AM",
    icon: FileCheck,
    iconBg: "#f0f9ff",
    iconColor: "#0284c7",
    prompt: "Review architectural drawing Ground_Floor_Plan_Rev2.pdf and verify column alignments.",
  },
  {
    id: "f-2",
    name: "Preliminary_BOQ_V2.xlsx",
    category: "Cost & Quantity",
    badge: "Draft V02",
    badgeClass: "badgeDraft",
    size: "1.2 MB",
    time: "2 hours ago",
    icon: FileSpreadsheet,
    iconBg: "#f0fdf4",
    iconColor: "#16a34a",
    prompt: "Review and update the Preliminary BOQ for Ground Floor.",
  },
  {
    id: "f-3",
    name: "Material_Spec_Sheet_Living.pdf",
    category: "Interior Specs",
    badge: "Ready",
    badgeClass: "badgeReady",
    size: "3.5 MB",
    time: "Yesterday",
    icon: FileText,
    iconBg: "#faf5ff",
    iconColor: "#9333ea",
    prompt: "Check material specifications for the Living Room.",
  },
  {
    id: "f-4",
    name: "Topography_Survey_V1.dwg",
    category: "Site Feasibility",
    badge: "Approved",
    badgeClass: "badgeDraft",
    size: "14.2 MB",
    time: "3 days ago",
    icon: FileCheck,
    iconBg: "#ecfeff",
    iconColor: "#0891b2",
    prompt: "Show me the site topography and soil survey data.",
  },
];

const MOCK_MILESTONES = [
  {
    id: "m-1",
    title: "1. Concept & Architectural Layout",
    amount: "₹15,00,000",
    status: "Settled",
    statusText: "Verified by Architect & QA",
    isCompleted: true,
  },
  {
    id: "m-2",
    title: "2. Structural Engineering & Soil Approval",
    amount: "₹30,00,000",
    status: "Settled",
    statusText: "Authorized on June 18",
    isCompleted: true,
  },
  {
    id: "m-3",
    title: "3. Foundation & Plinth Beam Casting",
    amount: "₹20,00,000",
    status: "Due for Authorization",
    statusText: "Site engineer inspection completed",
    isDue: true,
    actionPrompt: "Authorize Milestone 3 payment of ₹20,00,000 for Foundation & Plinth Beam Casting.",
  },
  {
    id: "m-4",
    title: "4. Superstructure & Roof Slab Casting",
    amount: "₹20,00,000",
    status: "Locked",
    statusText: "Unlocks after Milestone 3",
    isLocked: true,
  },
];

const MOCK_CLIENT_HISTORY = [
  {
    id: "h-1",
    query: "How much have I paid so far?",
    time: "10 mins ago",
  },
  {
    id: "h-2",
    query: "Find an electrical contractor for this project",
    time: "2 hours ago",
  },
  {
    id: "h-3",
    query: "What's pending on my project?",
    time: "Yesterday",
  },
  {
    id: "h-4",
    query: "Review living room material specs",
    time: "2 days ago",
  },
];

export function ClientRightSidebar({
  project,
  onClose,
  onSelectPrompt,
  onNewChat,
  className = "",
}: ClientRightSidebarProps) {
  const [activeTab, setActiveTab] = useState<ClientSidebarTab>("project");
  const projectName = project ? project.name : "Kowdiar Villa";

  return (
    <aside
      className={`${styles.sidebarContainer} ${className}`}
      aria-label="Client Project Intelligence Panel"
    >
      {/* Top Header & Tab Switcher Bar */}
      <div className={styles.sidebarTopBar}>
        <div className={styles.tabsRow} role="tablist" aria-label="Sidebar sections">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "project"}
            className={`${styles.tabBtn} ${activeTab === "project" ? styles.activeTabBtn : ""}`}
            onClick={() => setActiveTab("project")}
            title="Project Intelligence"
          >
            <OdinDuotoneIcon size={14} style={{ color: "#7c3aed" }} />
            <span>Project</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "files"}
            className={`${styles.tabBtn} ${activeTab === "files" ? styles.activeTabBtn : ""}`}
            onClick={() => setActiveTab("files")}
            title="Project Files & Drawings"
          >
            <DocumentsDuotoneIcon size={14} style={{ color: "#0284c7" }} />
            <span>Files</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "finance"}
            className={`${styles.tabBtn} ${activeTab === "finance" ? styles.activeTabBtn : ""}`}
            onClick={() => setActiveTab("finance")}
            title="Milestone Escrow & Payments"
          >
            <PaymentsDuotoneIcon size={14} style={{ color: "#ea580c" }} />
            <span>Finance</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "history"}
            className={`${styles.tabBtn} ${activeTab === "history" ? styles.activeTabBtn : ""}`}
            onClick={() => setActiveTab("history")}
            title="Conversation History"
          >
            <HistoryDuotoneIcon size={14} style={{ color: "#f59e0b" }} />
            <span>History</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className={styles.collapseToggleBtn}
          title="Close panel"
          aria-label="Close panel"
        >
          <X size={15} />
        </button>
      </div>

      {/* =========================================================
          TAB 1: PROJECT INTELLIGENCE & OBSERVATIONS
          ========================================================= */}
      {activeTab === "project" && (
        <div className={styles.sidebarBody}>
          {/* New Chat Option in Project Section (Top Action) */}
          {onNewChat && (
            <button
              type="button"
              className={styles.newChatBannerBtn}
              onClick={onNewChat}
              title="Start a new chat with Odin"
              aria-label="Start new chat"
            >
              <div className={styles.newChatBannerLeft}>
                <div className={styles.newChatIconWrap}>
                  <Plus size={15} strokeWidth={2.4} />
                </div>
                <div className={styles.newChatMeta}>
                  <span className={styles.newChatTitle}>New chat</span>
                  <span className={styles.newChatSubtitle}>Start a fresh query for {projectName}</span>
                </div>
              </div>
              <ArrowRight size={13} className={styles.sidebarArrow} />
            </button>
          )}

          {/* Project Snapshot Card */}
          {project && (
            <div className={styles.projectSnapshotCard}>
              <div className={styles.snapshotTopRow}>
                <h3 className={styles.projectTitle}>{project.name}</h3>
                <span className={styles.stageBadge}>
                  <span className={styles.stageDot} />
                  {project.stage}
                </span>
              </div>
              <p className={styles.projectSubMeta}>
                {project.location} • {project.category}
              </p>

              <div className={styles.projectMetricsGrid}>
                <div className={styles.metricItem}>
                  <span className={styles.metricLabel}>Total Contract</span>
                  <span className={styles.metricValue}>{project.totalBudget}</span>
                </div>
                <div className={styles.metricItem}>
                  <span className={styles.metricLabel}>Settled Amount</span>
                  <span className={styles.metricValue} style={{ color: "#059669" }}>
                    {project.paidAmount}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Section 1: Recent Project Work */}
          <div className={styles.sidebarSection}>
            <div className={styles.sidebarSectionHeader}>
              <div className={styles.sidebarHeaderTitle}>
                <Clock size={13} style={{ color: "#64748b" }} />
                <span>Recent work</span>
              </div>
              <span className={styles.sidebarSectionCount}>3 items</span>
            </div>

            <div className={styles.sidebarWorkList}>
              <div
                className={styles.sidebarWorkItem}
                onClick={() =>
                  onSelectPrompt(
                    `Review and update the Preliminary BOQ for Ground Floor in ${projectName}`
                  )
                }
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onSelectPrompt(`Review and update the Preliminary BOQ for Ground Floor in ${projectName}`);
                  }
                }}
              >
                <div className={styles.sidebarWorkIcon} style={{ background: "#f0fdf4", color: "#16a34a" }}>
                  <FileSpreadsheet size={14} />
                </div>
                <div className={styles.sidebarWorkMeta}>
                  <div className={styles.sidebarWorkTitleRow}>
                    <span className={styles.sidebarWorkTitle}>Preliminary BOQ</span>
                    <span className={styles.badgeDraft}>Draft V02</span>
                  </div>
                  <span className={styles.sidebarWorkSubtitle}>Ground Floor · 2h ago</span>
                </div>
                <ArrowRight size={12} className={styles.sidebarArrow} />
              </div>

              <div
                className={styles.sidebarWorkItem}
                onClick={() =>
                  onSelectPrompt(
                    `Check material specifications for the Living Room in ${projectName}`
                  )
                }
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onSelectPrompt(`Check material specifications for the Living Room in ${projectName}`);
                  }
                }}
              >
                <div className={styles.sidebarWorkIcon} style={{ background: "#faf5ff", color: "#9333ea" }}>
                  <FileText size={14} />
                </div>
                <div className={styles.sidebarWorkMeta}>
                  <div className={styles.sidebarWorkTitleRow}>
                    <span className={styles.sidebarWorkTitle}>Material specification</span>
                    <span className={styles.badgeReady}>Ready</span>
                  </div>
                  <span className={styles.sidebarWorkSubtitle}>Living Room · 18 items</span>
                </div>
                <ArrowRight size={12} className={styles.sidebarArrow} />
              </div>

              <div
                className={styles.sidebarWorkItem}
                onClick={() =>
                  onSelectPrompt(
                    `Inspect architectural drawing review Rev 04 for ${projectName}`
                  )
                }
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onSelectPrompt(`Inspect architectural drawing review Rev 04 for ${projectName}`);
                  }
                }}
              >
                <div className={styles.sidebarWorkIcon} style={{ background: "#f0f9ff", color: "#0284c7" }}>
                  <FileCheck size={14} />
                </div>
                <div className={styles.sidebarWorkMeta}>
                  <div className={styles.sidebarWorkTitleRow}>
                    <span className={styles.sidebarWorkTitle}>Drawing review</span>
                    <span className={styles.badgeReview}>Review</span>
                  </div>
                  <span className={styles.sidebarWorkSubtitle}>Rev 04 · 92% complete</span>
                </div>
                <ArrowRight size={12} className={styles.sidebarArrow} />
              </div>
            </div>
          </div>

          {/* Section 2: Odin Noticed (Proactive AI Observations) */}
          <div className={styles.sidebarSection}>
            <div className={styles.sidebarSectionHeader}>
              <div className={styles.sidebarHeaderTitle}>
                <Sparkles size={13} style={{ color: "#e11d48" }} />
                <span>Odin noticed</span>
              </div>
              <span className={styles.badgeAlert}>3 observations</span>
            </div>

            <div className={styles.sidebarNoticedList}>
              <div
                className={styles.sidebarNoticedCard}
                onClick={() =>
                  onSelectPrompt(
                    `Inspect the 3 missing dimensions in the terrace drawing of ${projectName} and suggest corrections.`
                  )
                }
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onSelectPrompt(`Inspect the 3 missing dimensions in the terrace drawing of ${projectName} and suggest corrections.`);
                  }
                }}
              >
                <div className={styles.sidebarNoticedIcon} style={{ background: "#fff1f2", color: "#e11d48" }}>
                  <AlertTriangle size={13} />
                </div>
                <div className={styles.sidebarNoticedMeta}>
                  <div className={styles.sidebarNoticedTitle}>3 missing dimensions in terrace drawing</div>
                  <div className={styles.sidebarNoticedDesc}>Slab edge & column line C-4 not dimensioned.</div>
                  <span className={styles.sidebarActionLink}>Inspect in Odin →</span>
                </div>
              </div>

              <div
                className={styles.sidebarNoticedCard}
                onClick={() =>
                  onSelectPrompt(
                    `Calculate and add electrical sub-allowance for automated lighting in ${projectName} BOQ.`
                  )
                }
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onSelectPrompt(`Calculate and add electrical sub-allowance for automated lighting in ${projectName} BOQ.`);
                  }
                }}
              >
                <div className={styles.sidebarNoticedIcon} style={{ background: "#fffbeb", color: "#d97706" }}>
                  <Lightbulb size={13} />
                </div>
                <div className={styles.sidebarNoticedMeta}>
                  <div className={styles.sidebarNoticedTitle}>BOQ has no electrical allowance</div>
                  <div className={styles.sidebarNoticedDesc}>Automation & DB sub-panels need sum.</div>
                  <span className={styles.sidebarActionLink}>Add allowance →</span>
                </div>
              </div>

              <div
                className={styles.sidebarNoticedCard}
                onClick={() =>
                  onSelectPrompt(
                    `Review Italian marble flooring specifications and client approval workflow for ${projectName}.`
                  )
                }
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onSelectPrompt(`Review Italian marble flooring specifications and client approval workflow for ${projectName}.`);
                  }
                }}
              >
                <div className={styles.sidebarNoticedIcon} style={{ background: "#f0fdf4", color: "#16a34a" }}>
                  <CheckCircle2 size={13} />
                </div>
                <div className={styles.sidebarNoticedMeta}>
                  <div className={styles.sidebarNoticedTitle}>Client approval pending for flooring</div>
                  <div className={styles.sidebarNoticedDesc}>Italian marble specification ready.</div>
                  <span className={styles.sidebarActionLink}>Review item →</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 2: PROJECT FILES & DRAWINGS
          ========================================================= */}
      {activeTab === "files" && (
        <div className={styles.sidebarBody}>
          <div className={styles.sidebarSection}>
            <div className={styles.sidebarSectionHeader}>
              <div className={styles.sidebarHeaderTitle}>
                <Folder size={13} style={{ color: "#0284c7" }} />
                <span>Project Deliverables</span>
              </div>
              <span className={styles.sidebarSectionCount}>{MOCK_FILES.length} files</span>
            </div>

            <div className={styles.sidebarWorkList}>
              {MOCK_FILES.map((f) => {
                const IconComponent = f.icon;
                return (
                  <div
                    key={f.id}
                    className={styles.sidebarWorkItem}
                    onClick={() => onSelectPrompt(f.prompt)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        onSelectPrompt(f.prompt);
                      }
                    }}
                  >
                    <div
                      className={styles.sidebarWorkIcon}
                      style={{ background: f.iconBg, color: f.iconColor }}
                    >
                      <IconComponent size={14} />
                    </div>
                    <div className={styles.sidebarWorkMeta}>
                      <div className={styles.sidebarWorkTitleRow}>
                        <span className={styles.sidebarWorkTitle}>{f.name}</span>
                        <span className={styles[f.badgeClass] || styles.badgeDraft}>{f.badge}</span>
                      </div>
                      <span className={styles.sidebarWorkSubtitle}>
                        {f.size} • {f.time}
                      </span>
                    </div>
                    <ArrowRight size={12} className={styles.sidebarArrow} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 3: MILESTONE ESCROW & FINANCE
          ========================================================= */}
      {activeTab === "finance" && (
        <div className={styles.sidebarBody}>
          {project && (
            <div className={styles.financialSummaryCard}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                  Escrow Progress
                </span>
                <span style={{ fontSize: "12px", fontWeight: 750, color: "#0f172a" }}>
                  {project.progress}% Settled
                </span>
              </div>
              <div className={styles.progressBarContainer}>
                <div className={styles.progressBarFill} style={{ width: `${project.progress}%` }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11.5px", marginTop: "2px" }}>
                <span style={{ color: "#64748b" }}>
                  Paid: <strong style={{ color: "#059669" }}>{project.paidAmount}</strong>
                </span>
                <span style={{ color: "#64748b" }}>
                  Pending: <strong style={{ color: "#0f172a" }}>{project.pendingAmount}</strong>
                </span>
              </div>
            </div>
          )}

          <div className={styles.sidebarSection}>
            <div className={styles.sidebarSectionHeader}>
              <div className={styles.sidebarHeaderTitle}>
                <CreditCard size={13} style={{ color: "#ea580c" }} />
                <span>Milestone Schedule</span>
              </div>
              <span className={styles.sidebarSectionCount}>4 stages</span>
            </div>

            <div className={styles.sidebarWorkList}>
              {MOCK_MILESTONES.map((m) => (
                <div key={m.id} className={styles.milestoneCard}>
                  <div className={styles.milestoneTop}>
                    <span className={styles.milestoneTitle}>{m.title}</span>
                    <span className={styles.milestoneAmount}>{m.amount}</span>
                  </div>

                  <div className={styles.milestoneStatusRow}>
                    <span style={{ color: m.isCompleted ? "#059669" : m.isDue ? "#d97706" : "#94a3b8" }}>
                      {m.isCompleted && "✓ "}
                      {m.isLocked && <Lock size={10} style={{ display: "inline", marginRight: "3px" }} />}
                      {m.statusText}
                    </span>

                    {m.isDue && m.actionPrompt && (
                      <button
                        type="button"
                        className={styles.milestoneActionBtn}
                        onClick={() => onSelectPrompt(m.actionPrompt!)}
                      >
                        Authorize →
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 4: CONVERSATION HISTORY
          ========================================================= */}
      {activeTab === "history" && (
        <div className={styles.sidebarBody}>
          <div className={styles.sidebarSection}>
            <div className={styles.sidebarSectionHeader}>
              <div className={styles.sidebarHeaderTitle}>
                <Clock size={13} style={{ color: "#f59e0b" }} />
                <span>Recent Queries</span>
              </div>
              <span className={styles.sidebarSectionCount}>{MOCK_CLIENT_HISTORY.length}</span>
            </div>

            <div className={styles.sidebarWorkList}>
              {MOCK_CLIENT_HISTORY.map((h) => (
                <div
                  key={h.id}
                  className={styles.sidebarWorkItem}
                  onClick={() => onSelectPrompt(h.query)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      onSelectPrompt(h.query);
                    }
                  }}
                >
                  <div
                    className={styles.sidebarWorkIcon}
                    style={{ background: "#fef3c7", color: "#d97706" }}
                  >
                    <HistoryDuotoneIcon size={14} />
                  </div>
                  <div className={styles.sidebarWorkMeta}>
                    <span className={styles.sidebarWorkTitle}>{h.query}</span>
                    <span className={styles.sidebarWorkSubtitle}>{h.time}</span>
                  </div>
                  <ArrowRight size={12} className={styles.sidebarArrow} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
