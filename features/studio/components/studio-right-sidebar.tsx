"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileCheck,
  FileSpreadsheet,
  FileText,
  History,
  Layers,
  Lightbulb,
  MapPin,
  Sparkles,
  X,
} from "lucide-react";
import {
  DocumentsDuotoneIcon,
  FeedbackDuotoneIcon,
  HistoryDuotoneIcon,
  OdinDuotoneIcon,
  OutputsDuotoneIcon,
  PortfolioDuotoneIcon,
  SpreadsheetDuotoneIcon,
} from "@/components/layout/sidebar-icons";
import styles from "./studio-right-sidebar.module.css";
import type { StudioTask } from "@/types/domain/studio";
import { StudioRightPanelMode, StudioRightPanelState } from "@/types/domain/studio-right-panel";
import { OutputPreviewPanel } from "./output-preview-panel";

export interface RecentChat {
  id: string;
  title: string;
  timestamp: string;
  projectKey?: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: string;
  type: "pdf" | "png" | "jpg" | "xlsx";
  timestamp: string;
  projectKey?: string;
}

const PROJECT_CHATS: RecentChat[] = [
  { id: "pc1", title: "Villa Design Consultation — Proposal Draft", timestamp: "Active session", projectKey: "villa-design" },
  { id: "pc2", title: "Villa Design — Initial Scope & Budget Review", timestamp: "Yesterday", projectKey: "villa-design" },
  { id: "pc3", title: "Villa Design — Spatial Layout Notes", timestamp: "3 days ago", projectKey: "villa-design" },
];

const ALL_RECENT_CHATS: RecentChat[] = [
  ...PROJECT_CHATS,
  { id: "c1", title: "Nila Residence BOQ", timestamp: "2h ago" },
  { id: "c2", title: "Structural Analysis", timestamp: "Yesterday" },
  { id: "c3", title: "Cost Estimation", timestamp: "2 days ago" },
  { id: "c4", title: "Interior Design Review", timestamp: "3 days ago" },
  { id: "c5", title: "Site Feasibility Survey", timestamp: "4 days ago" },
  { id: "c6", title: "HVAC Layout Planning", timestamp: "6 days ago" },
];

const LINKED_PROJECT_FILES: UploadedFile[] = [
  { id: "f1", name: "Floor Plan - Ground.pdf", size: "2.4 MB • PDF", type: "pdf", timestamp: "2h ago", projectKey: "villa-design" },
  { id: "f2", name: "Spatial_3D_Renders.png", size: "5.1 MB • PNG", type: "png", timestamp: "2h ago", projectKey: "villa-design" },
  { id: "f3", name: "BOQ_Initial_Takeoff.xlsx", size: "1.4 MB • XLSX", type: "xlsx", timestamp: "2h ago", projectKey: "villa-design" },
];

export interface StudioRightSidebarProps {
  task?: StudioTask | null;
  panelState?: StudioRightPanelState;
  onStateChange?: (state: StudioRightPanelState) => void;
  onRequestChanges?: () => void;
  recipient?: import("@/types/domain/studio").StudioDeliveryRecipient | null;
  attachmentNames?: string[];
  recentChats?: RecentChat[];
  relatedFiles?: UploadedFile[];
  onSelectChat?: (chat: RecentChat) => void;
  onSelectFile?: (file: UploadedFile) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
  projectName?: string;
  onSelectPrompt?: (promptText: string) => void;
}

export function StudioRightSidebar({
  task,
  panelState: externalPanelState,
  onStateChange,
  onRequestChanges,
  recipient = null,
  attachmentNames = [],
  recentChats = ALL_RECENT_CHATS,
  relatedFiles = LINKED_PROJECT_FILES,
  onSelectChat,
  onSelectFile,
  isCollapsed: externalIsCollapsed,
  onToggleCollapse,
  className = "",
  projectName = "Luxury Villa Horizon",
  onSelectPrompt = () => {},
}: StudioRightSidebarProps) {
  const [internalPanelState, setInternalPanelState] = useState<StudioRightPanelState>({
    mode: "outputs",
    selectedOutputId: "out-1",
    selectedVersionId: "V01",
  });

  const [internalTab, setInternalTab] = useState<"intelligence" | "outputs" | "chats">("intelligence");
  const [showAllChatsFilter, setShowAllChatsFilter] = useState(false);

  const panelState = externalPanelState || internalPanelState;

  const updateState = (newState: StudioRightPanelState) => {
    if (onStateChange) {
      onStateChange(newState);
    } else {
      setInternalPanelState(newState);
    }
  };

  const isCollapsed = panelState.mode === "collapsed" || externalIsCollapsed;

  const handleToggleCollapse = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      updateState({
        ...panelState,
        mode: panelState.mode === "collapsed" ? "outputs" : "collapsed",
      });
    }
  };

  const displayChats = showAllChatsFilter ? recentChats : PROJECT_CHATS;

  // ── COLLAPSED MODE ──
  if (isCollapsed) {
    return (
      <aside className={`${styles.sidebarContainer} ${styles.sidebarContainerCollapsed} ${className}`}>
        <button
          type="button"
          onClick={() => updateState({ mode: "outputs", selectedOutputId: panelState.selectedOutputId, selectedVersionId: panelState.selectedVersionId })}
          className={styles.glassIconBtn}
          title="Open Project Panel"
          aria-label="Open Project Panel"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="16" rx="4" />
            <line x1="16" y1="8" x2="16" y2="16" />
          </svg>
        </button>
      </aside>
    );
  }

  // ── PREVIEW MODE (Split Right-Side Preview Panel) ──
  if (panelState.mode === "preview") {
    return (
      <aside className={`${styles.sidebarContainer} ${className}`} style={{ padding: 0 }}>
        <OutputPreviewPanel
          task={task}
          selectedOutputId={panelState.selectedOutputId}
          selectedVersionId={panelState.selectedVersionId || "V01"}
          recipient={recipient}
          attachmentNames={attachmentNames}
          onBackToOutputs={() =>
            updateState({
              mode: "outputs",
              selectedOutputId: panelState.selectedOutputId,
              selectedVersionId: panelState.selectedVersionId,
            })
          }
          onClose={() =>
            updateState({
              mode: "collapsed",
              selectedOutputId: panelState.selectedOutputId,
              selectedVersionId: panelState.selectedVersionId,
            })
          }
          onRequestChanges={() => {
            onRequestChanges?.();
            updateState({
              mode: "collapsed",
              selectedOutputId: panelState.selectedOutputId,
              selectedVersionId: panelState.selectedVersionId,
            });
          }}
        />
      </aside>
    );
  }

  // ── PROJECT INTELLIGENCE, OUTPUTS & CHAT HISTORY MODE ──
  return (
    <aside className={`${styles.sidebarContainer} ${className}`}>
      {/* Top Header & Title Bar */}
      <div className={styles.sidebarTopBar}>
        <div className={styles.sidebarHeaderLabelWrap}>
          <OdinDuotoneIcon size={15} style={{ color: "#7c3aed" }} />
          <span className={styles.sidebarHeaderLabel}>Project</span>
        </div>

        <button
          type="button"
          onClick={handleToggleCollapse}
          className={styles.collapseToggleBtn}
          title="Close Panel"
          aria-label="Close Panel"
        >
          <X size={15} />
        </button>
      </div>

      {/* TAB 1: PROJECT INTELLIGENCE & SIDEBAR MENUS */}
      {internalTab === "intelligence" && (
        <div className={styles.intelligenceSidebarMenu}>
          {/* Section 1: Project Scope Header Card */}
          <div className={styles.sidebarProjectCard}>
            <div className={styles.sidebarBadgeRow}>
              <span className={styles.sidebarCodeBadge}>KAL-RES-2026-01</span>
              <span className={styles.sidebarPhaseBadge}>
                <span className={styles.sidebarPhaseDot} />
                Design Development
              </span>
            </div>
            <h3 className={styles.sidebarProjectTitle}>{projectName}</h3>
            <p className={styles.sidebarSubScope}>Living Space & Terrace · 12 files · 4 tasks</p>
          </div>

          {/* Section 2: Odin Connected Knowledge Base */}
          <div className={styles.sidebarSection}>
            <div className={styles.sidebarSectionHeader}>
              <div className={styles.sidebarHeaderTitle}>
                <Sparkles size={13} style={{ color: "#7c3aed" }} />
                <span>Odin has access to</span>
              </div>
            </div>

            <div className={styles.sidebarPillsGrid}>
              <div className={styles.sidebarAccessPill}>
                <Layers size={12} />
                <span>Drawings (Rev 04)</span>
              </div>
              <div className={styles.sidebarAccessPill}>
                <FileText size={12} />
                <span>Documents (12)</span>
              </div>
              <div className={styles.sidebarAccessPill}>
                <FileCheck size={12} />
                <span>BOQ (Preliminary)</span>
              </div>
              <div className={styles.sidebarAccessPill}>
                <CheckCircle2 size={12} />
                <span>Tasks (4)</span>
              </div>
              <div className={styles.sidebarAccessPill}>
                <Clock size={12} />
                <span>Project history</span>
              </div>
              <div className={styles.sidebarAccessPill}>
                <MapPin size={12} />
                <span>Site Feasibility</span>
              </div>
            </div>
          </div>

          {/* Section 3: Recent Project Work */}
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

          {/* Section 4: Odin Noticed (Proactive AI Observations) */}
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
                    `Draft a client review package for the Italian marble flooring specification in ${projectName}.`
                  )
                }
                role="button"
                tabIndex={0}
              >
                <div className={styles.sidebarNoticedIcon} style={{ background: "#eff6ff", color: "#2563eb" }}>
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

      {/* TAB 2: OUTPUTS (Linked to Active Task Context) */}
      {internalTab === "outputs" && (
        <>
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>LINKED PROPOSAL DRAFT</span>
            </div>

            <div
              className={styles.outputCard}
              onClick={() =>
                updateState({
                  mode: "preview",
                  selectedOutputId: "out-1",
                  selectedVersionId: "V01",
                })
              }
              role="button"
              tabIndex={0}
              style={{ cursor: "pointer" }}
            >
              <div className={styles.outputCardHeader}>
                <div className={styles.outputTitleRow}>
                  <div className={styles.outputIconWrapper}>
                    <DocumentsDuotoneIcon size={16} />
                  </div>
                  <div>
                    <div className={styles.outputTitleText}>Villa Design Proposal</div>
                    <div className={styles.outputMetaText}>Version V01 • Click to preview</div>
                  </div>
                </div>
                <span className={styles.statusPill}>Ready for Review</span>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>REVISION LOG</span>
            </div>

            <div className={styles.versionList}>
              <div
                className={styles.versionRow}
                onClick={() =>
                  updateState({
                    mode: "preview",
                    selectedOutputId: "out-1",
                    selectedVersionId: "V01",
                  })
                }
                role="button"
                tabIndex={0}
                style={{ cursor: "pointer" }}
              >
                <span className={styles.versionBadgeCurrent}>V01 (Current Draft)</span>
                <span className={styles.versionTime}>Just now</span>
              </div>
              <div className={styles.versionRow}>
                <span style={{ color: "#64748b" }}>V00 (Originating Context)</span>
                <span className={styles.versionTime}>Initial import</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* TAB 3: CHAT HISTORY */}
      {internalTab === "chats" && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>RECENT CONVERSATIONS</span>
            <button
              type="button"
              className={styles.viewAllBtn}
              onClick={() => setShowAllChatsFilter((prev) => !prev)}
            >
              {showAllChatsFilter ? "Show Project Only" : "Show All Projects"}
            </button>
          </div>

          <div className={styles.itemList}>
            {displayChats.map((chat) => (
              <div
                key={chat.id}
                className={styles.itemRow}
                onClick={() => onSelectChat?.(chat)}
                role="button"
                tabIndex={0}
              >
                <div className={styles.chatIconWrapper}>
                  <HistoryDuotoneIcon size={14} />
                </div>
                <div className={styles.itemTextCol}>
                  <span className={styles.itemTitle}>{chat.title}</span>
                  <span className={styles.itemSubtext}>{chat.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
