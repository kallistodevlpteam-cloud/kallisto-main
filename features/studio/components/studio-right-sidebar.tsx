"use client";

import React, { useState } from "react";
import {
  FileSpreadsheet,
  FileText,
  History,
  Image as ImageIcon,
  Layers,
  MessageSquare,
  X,
} from "lucide-react";
import styles from "./studio-right-sidebar.module.css";
import type { StudioTask } from "@/types/domain/studio";

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

import { StudioRightPanelMode, StudioRightPanelState } from "@/types/domain/studio-right-panel";
import { OutputPreviewPanel } from "./output-preview-panel";

export interface StudioRightSidebarProps {
  task?: StudioTask | null;
  panelState?: StudioRightPanelState;
  onStateChange?: (state: StudioRightPanelState) => void;
  onRequestChanges?: () => void;
  /**
   * Authoritative recipient resolved from the project client record.
   * Pass null when no client is linked — this disables Send to client.
   */
  recipient?: import("@/types/domain/studio").StudioDeliveryRecipient | null;
  /** Attachment names to surface in the send confirmation dialog. */
  attachmentNames?: string[];
  recentChats?: RecentChat[];
  relatedFiles?: UploadedFile[];
  onSelectChat?: (chat: RecentChat) => void;
  onSelectFile?: (file: UploadedFile) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
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
}: StudioRightSidebarProps) {
  const [internalPanelState, setInternalPanelState] = useState<StudioRightPanelState>({
    mode: "outputs",
    selectedOutputId: "out-1",
    selectedVersionId: "V01",
  });

  const [internalTab, setInternalTab] = useState<"outputs" | "chats">("outputs");
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
          title="View Outputs"
          aria-label="View Outputs"
        >
          <svg width="24" height="26" viewBox="0 0 24 26" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="studioFileBackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4338ca" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
              <linearGradient id="studioFileFrontGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#0ea5e9" />
                <stop offset="100%" stopColor="#2dd4bf" />
              </linearGradient>
              <linearGradient id="studioFileFoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3730a3" />
                <stop offset="100%" stopColor="#4338ca" />
              </linearGradient>
            </defs>
            <rect x="1" y="5" width="16" height="20" rx="4" fill="url(#studioFileBackGrad)" />
            <path
              d="M 6.5 1 H 16 L 22.5 7.5 V 21 C 22.5 23.2 20.7 25 18.5 25 H 8.5 C 6.3 25 4.5 23.2 4.5 21 V 3 C 4.5 1.9 5.4 1 6.5 1 Z"
              fill="url(#studioFileFrontGrad)"
            />
            <path
              d="M 16 1 L 22.5 7.5 H 18 C 16.9 7.5 16 6.6 16 5.5 V 1 Z"
              fill="url(#studioFileFoldGrad)"
            />
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

  // ── OUTPUTS & CHAT HISTORY MODE ──
  return (
    <aside className={`${styles.sidebarContainer} ${className}`}>
      {/* Top Header & Tab Switcher Bar */}
      <div className={styles.sidebarTopBar}>
        <div className={styles.tabsRow}>
          <button
            type="button"
            className={`${styles.tabBtn} ${internalTab === "outputs" ? styles.activeTabBtn : ""}`}
            onClick={() => setInternalTab("outputs")}
          >
            <Layers size={13} />
            <span>Outputs</span>
            <span className={styles.tabBadge}>V01</span>
          </button>

          <button
            type="button"
            className={`${styles.tabBtn} ${internalTab === "chats" ? styles.activeTabBtn : ""}`}
            onClick={() => setInternalTab("chats")}
          >
            <History size={13} />
            <span>Chat History</span>
          </button>
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

      {/* TAB 1: OUTPUTS (Linked to Active Task Context) */}
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
                    <FileText size={15} />
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
                <span className={styles.versionTime}>15m ago</span>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>LINKED PROJECT FILES</span>
            </div>

            <div className={styles.itemList}>
              {relatedFiles.map((file) => (
                <div
                  key={file.id}
                  className={styles.itemRow}
                  onClick={() => onSelectFile?.(file)}
                  role="button"
                  tabIndex={0}
                >
                  <div className={`${styles.fileIconWrapper} ${styles[`file_${file.type}`]}`}>
                    {file.type === "pdf" ? (
                      <FileText size={14} />
                    ) : file.type === "xlsx" ? (
                      <FileSpreadsheet size={14} />
                    ) : (
                      <ImageIcon size={14} />
                    )}
                  </div>
                  <div className={styles.itemTextCol}>
                    <span className={styles.itemTitle}>{file.name}</span>
                    <span className={styles.itemSubtext}>{file.size}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* TAB 2: CHAT HISTORY (Project-Scoped with Filter) */}
      {internalTab === "chats" && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>
              {showAllChatsFilter ? "ALL CHATS" : "PROJECT CHATS"}
            </span>
            <button
              type="button"
              className={styles.viewAllBtn}
              onClick={() => setShowAllChatsFilter((prev) => !prev)}
            >
              {showAllChatsFilter ? "Show Project Chats" : "All Chats"}
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
                  <MessageSquare size={13} />
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
