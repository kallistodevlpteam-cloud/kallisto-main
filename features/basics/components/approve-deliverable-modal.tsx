"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Compass,
  FileCheck2,
  FolderOpen,
  HardHat,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import type { BasicsDeliverable, BasicsEngagement, BasicsProvider } from "../types/basics.types";
import {
  PROJECT_STAKEHOLDERS,
  stakeholderToDocumentOwner,
} from "@/features/projects/components/documents/drive-access-stakeholders";
import { ProjectDocumentOwner } from "@/types/domain/project-document";
import styles from "./basics-workspace.module.css";

export interface ApproveDeliverableModalProps {
  isOpen: boolean;
  onClose: () => void;
  deliverable: BasicsDeliverable;
  engagement: BasicsEngagement;
  provider: BasicsProvider;
  onConfirmApproval: (options: {
    addToDrive: boolean;
    folderId: string;
    sharedWith: ProjectDocumentOwner[];
  }) => Promise<void>;
}

type StakeholderFilterCategory = "all" | "hands" | "team" | "basics";

export function ApproveDeliverableModal({
  isOpen,
  onClose,
  deliverable,
  engagement,
  provider,
  onConfirmApproval,
}: ApproveDeliverableModalProps) {
  const latestVersion = deliverable.versions.at(-1);

  // Auto-detect default target folder based on deliverable name
  const getDefaultFolder = (): string => {
    const lower = deliverable.name.toLowerCase();
    if (lower.includes("drawing") || lower.includes("plan") || lower.includes("layout")) {
      return "drawings";
    }
    if (lower.includes("report") || lower.includes("calculation") || lower.includes("schedule")) {
      return "documents";
    }
    return "approvals";
  };

  const [addToDrive, setAddToDrive] = useState(true);
  const [folderId, setFolderId] = useState(getDefaultFolder());
  const [activeCategory, setActiveCategory] = useState<StakeholderFilterCategory>("all");
  
  // By default, pre-select Hands workers and Team members for convenience
  const [selectedStakeholderIds, setSelectedStakeholderIds] = useState<string[]>(() => {
    return PROJECT_STAKEHOLDERS.map((s) => s.id);
  });
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !latestVersion) return null;

  const toggleStakeholder = (id: string) => {
    setSelectedStakeholderIds((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
    );
  };

  const selectAll = () => {
    setSelectedStakeholderIds(PROJECT_STAKEHOLDERS.map((s) => s.id));
  };

  const selectHandsOnly = () => {
    setSelectedStakeholderIds(
      PROJECT_STAKEHOLDERS.filter((s) => s.category === "hands").map((s) => s.id),
    );
  };

  const clearSelection = () => {
    setSelectedStakeholderIds([]);
  };

  const filteredStakeholders =
    activeCategory === "all"
      ? PROJECT_STAKEHOLDERS
      : PROJECT_STAKEHOLDERS.filter((s) => s.category === activeCategory);

  const handsCount = PROJECT_STAKEHOLDERS.filter((s) => s.category === "hands").length;
  const teamCount = PROJECT_STAKEHOLDERS.filter((s) => s.category === "team").length;
  const basicsCount = PROJECT_STAKEHOLDERS.filter((s) => s.category === "basics").length;

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      const selectedStakeholders = PROJECT_STAKEHOLDERS.filter((s) =>
        selectedStakeholderIds.includes(s.id),
      );
      const sharedWithOwners = selectedStakeholders.map(stakeholderToDocumentOwner);

      await onConfirmApproval({
        addToDrive,
        folderId,
        sharedWith: sharedWithOwners,
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={styles.chatModalOverlay}
      onClick={submitting ? undefined : onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="approve-drive-modal-title"
    >
      <div
        className={styles.deliverableReviewDialog}
        style={{ maxWidth: "680px" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={styles.deliverableReviewHeader}>
          <div className={styles.deliverableReviewHeaderLeft}>
            <div className={styles.deliverableReviewBadgeRow}>
              <span className={styles.deliverableReviewProjectTag}>
                {engagement.projectName}
              </span>
              <span className={styles.deliverableReviewDisciplineTag}>
                {engagement.title}
              </span>
            </div>
            <h2 id="approve-drive-modal-title" className={styles.deliverableReviewTitle}>
              Approve & Add to Project Drive
            </h2>
            <p className={styles.deliverableReviewSubtitle}>
              Authorize deliverable completion, publish to Project Drive, and give access to project stakeholders.
            </p>
          </div>
          <button
            type="button"
            className={styles.chatModalCloseBtn}
            onClick={onClose}
            disabled={submitting}
            aria-label="Close modal"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className={styles.deliverableReviewBody} style={{ gap: "18px" }}>
          {/* Deliverable Summary Box */}
          <div className={styles.deliverableFileHighlightCard}>
            <div className={styles.deliverableFileHighlightLeft}>
              <div className={styles.approvalOutputFileIconWrap} aria-hidden="true">
                <FileCheck2 size={24} className={styles.approvalFileIcon} />
                <span className={styles.approvalFileExtBadge}>PDF</span>
              </div>
              <div className={styles.deliverableFileHighlightInfo}>
                <div className={styles.deliverableFileHighlightTitleRow}>
                  <strong className={styles.deliverableFileHighlightName}>
                    {latestVersion.fileName || `${deliverable.name}.pdf`}
                  </strong>
                  <span className={styles.deliverableVersionPill}>
                    Rev 0{latestVersion.version}
                  </span>
                </div>
                <div className={styles.deliverableFileHighlightMeta}>
                  <span>{deliverable.name}</span>
                  <span>·</span>
                  <span>Submitted by {provider.name}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Drive Destination Section */}
          <div className={styles.detailPanel} style={{ padding: "16px", borderRadius: "10px" }}>
            <label
              htmlFor="add-to-drive-checkbox"
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                cursor: "pointer",
              }}
            >
              <input
                id="add-to-drive-checkbox"
                aria-label="Add to Project Drive"
                type="checkbox"
                checked={addToDrive}
                onChange={(e) => setAddToDrive(e.target.checked)}
                style={{
                  marginTop: "3px",
                  width: "16px",
                  height: "16px",
                  accentColor: "#0f172a",
                }}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <strong style={{ fontSize: "13.5px", color: "#0f172a" }}>
                  Add to Project Drive
                </strong>
                <span style={{ fontSize: "12px", color: "#64748b" }}>
                  Publish an approved, immutable copy directly to the project&apos;s centralized Drive repository.
                </span>
              </div>
            </label>

            {addToDrive ? (
              <div
                style={{
                  marginTop: "12px",
                  paddingTop: "12px",
                  borderTop: "1px solid #f1f5f9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <FolderOpen size={15} style={{ color: "#0f172a" }} aria-hidden="true" />
                  <span style={{ fontSize: "12.5px", fontWeight: 600, color: "#0f172a" }}>
                    Destination Folder:
                  </span>
                </div>
                <select
                  value={folderId}
                  onChange={(e) => setFolderId(e.target.value)}
                  className={styles.select}
                  style={{ width: "auto", minWidth: "180px", padding: "6px 12px", fontSize: "12.5px" }}
                >
                  <option value="approvals">📁 Approvals</option>
                  <option value="drawings">📁 Drawings</option>
                  <option value="documents">📁 Documents</option>
                  <option value="site-reports">📁 Site Reports</option>
                  <option value="contracts">📁 Contracts</option>
                </select>
              </div>
            ) : null}
          </div>

          {/* Stakeholder Access Section */}
          {addToDrive ? (
            <div className={styles.detailPanel} style={{ padding: "16px", borderRadius: "10px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  flexWrap: "wrap",
                  marginBottom: "10px",
                }}
              >
                <div>
                  <h3 style={{ margin: 0, fontSize: "13.5px", fontWeight: 700, color: "#0f172a" }}>
                    Give Access To
                  </h3>
                  <p style={{ margin: "2px 0 0", fontSize: "11.5px", color: "#64748b" }}>
                    Select who can view and download this file (Workers in Hands, Team Members, Other Teams).
                  </p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <button
                    type="button"
                    className={styles.tertiaryButton}
                    style={{ fontSize: "11px", padding: "3px 8px" }}
                    onClick={selectAll}
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    className={styles.tertiaryButton}
                    style={{ fontSize: "11px", padding: "3px 8px" }}
                    onClick={selectHandsOnly}
                  >
                    Hands Only
                  </button>
                  <button
                    type="button"
                    className={styles.tertiaryButton}
                    style={{ fontSize: "11px", padding: "3px 8px" }}
                    onClick={clearSelection}
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Category Filter Pills */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  paddingBottom: "10px",
                  borderBottom: "1px solid #f1f5f9",
                  overflowX: "auto",
                }}
              >
                <button
                  type="button"
                  onClick={() => setActiveCategory("all")}
                  className={styles.secondaryButton}
                  style={{
                    fontSize: "11.5px",
                    padding: "4px 10px",
                    background: activeCategory === "all" ? "#0f172a" : "#ffffff",
                    color: activeCategory === "all" ? "#ffffff" : "#475569",
                    borderColor: activeCategory === "all" ? "#0f172a" : "#cbd5e1",
                  }}
                >
                  All ({PROJECT_STAKEHOLDERS.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategory("hands")}
                  className={styles.secondaryButton}
                  style={{
                    fontSize: "11.5px",
                    padding: "4px 10px",
                    background: activeCategory === "hands" ? "#0f172a" : "#ffffff",
                    color: activeCategory === "hands" ? "#ffffff" : "#475569",
                    borderColor: activeCategory === "hands" ? "#0f172a" : "#cbd5e1",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <HardHat size={12} />
                  <span>Workers in Hands ({handsCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategory("team")}
                  className={styles.secondaryButton}
                  style={{
                    fontSize: "11.5px",
                    padding: "4px 10px",
                    background: activeCategory === "team" ? "#0f172a" : "#ffffff",
                    color: activeCategory === "team" ? "#ffffff" : "#475569",
                    borderColor: activeCategory === "team" ? "#0f172a" : "#cbd5e1",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <Users size={12} />
                  <span>Team Members ({teamCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategory("basics")}
                  className={styles.secondaryButton}
                  style={{
                    fontSize: "11.5px",
                    padding: "4px 10px",
                    background: activeCategory === "basics" ? "#0f172a" : "#ffffff",
                    color: activeCategory === "basics" ? "#ffffff" : "#475569",
                    borderColor: activeCategory === "basics" ? "#0f172a" : "#cbd5e1",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <Compass size={12} />
                  <span>Other Teams ({basicsCount})</span>
                </button>
              </div>

              {/* Stakeholders List */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  marginTop: "12px",
                  maxHeight: "220px",
                  overflowY: "auto",
                  paddingRight: "4px",
                }}
              >
                {filteredStakeholders.map((stakeholder) => {
                  const isSelected = selectedStakeholderIds.includes(stakeholder.id);
                  return (
                    <div
                      key={stakeholder.id}
                      onClick={() => toggleStakeholder(stakeholder.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 12px",
                        background: isSelected ? "#f8fafc" : "#ffffff",
                        border: `1px solid ${isSelected ? "#0f172a" : "#e2e8f0"}`,
                        borderRadius: "8px",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleStakeholder(stakeholder.id)}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            width: "15px",
                            height: "15px",
                            accentColor: "#0f172a",
                            cursor: "pointer",
                          }}
                        />

                        <div
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            background:
                              stakeholder.category === "hands"
                                ? "#fef3c7"
                                : stakeholder.category === "team"
                                ? "#e0f2fe"
                                : "#ede9fe",
                            color:
                              stakeholder.category === "hands"
                                ? "#92400e"
                                : stakeholder.category === "team"
                                ? "#0369a1"
                                : "#5b21b6",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "12px",
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                          aria-hidden="true"
                        >
                          {stakeholder.category === "hands" ? (
                            <HardHat size={14} />
                          ) : stakeholder.category === "team" ? (
                            <Users size={14} />
                          ) : (
                            <Compass size={14} />
                          )}
                        </div>

                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{ fontSize: "12.5px", fontWeight: 650, color: "#0f172a" }}>
                              {stakeholder.name}
                            </span>
                            <span
                              style={{
                                fontSize: "10px",
                                fontWeight: 600,
                                padding: "1px 6px",
                                borderRadius: "4px",
                                background:
                                  stakeholder.category === "hands"
                                    ? "#fffbeb"
                                    : stakeholder.category === "team"
                                    ? "#f0f9ff"
                                    : "#f5f3ff",
                                color:
                                  stakeholder.category === "hands"
                                    ? "#b45309"
                                    : stakeholder.category === "team"
                                    ? "#0284c7"
                                    : "#7c3aed",
                                border: `1px solid ${
                                  stakeholder.category === "hands"
                                    ? "#fde68a"
                                    : stakeholder.category === "team"
                                    ? "#bae6fd"
                                    : "#ddd6fe"
                                }`,
                              }}
                            >
                              {stakeholder.category === "hands"
                                ? "Workers in Hands"
                                : stakeholder.category === "team"
                                ? "Team Member"
                                : "Other Teams"}
                            </span>
                          </div>
                          <span style={{ fontSize: "11px", color: "#64748b" }}>
                            {stakeholder.organization} · {stakeholder.role}
                          </span>
                        </div>
                      </div>

                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          padding: "3px 8px",
                          borderRadius: "4px",
                          background: isSelected ? "#ecfdf5" : "#f1f5f9",
                          color: isSelected ? "#047857" : "#64748b",
                          border: `1px solid ${isSelected ? "#a7f3d0" : "#cbd5e1"}`,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {isSelected ? "✓ Can View & Download" : "No Access"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* Authoritative Sign-Off Note */}
          <div
            style={{
              padding: "10px 14px",
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "12px",
              color: "#166534",
            }}
          >
            <ShieldCheck size={16} style={{ color: "#16a34a", flexShrink: 0 }} />
            <span>
              Authorizing approval triggers client milestone release and records immutable sign-off by{" "}
              <strong>Arjun Mehta</strong>.
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className={styles.deliverableReviewFooter}>
          <div className={styles.deliverableFooterLeft}>
            <span style={{ fontSize: "12px", color: "#64748b" }}>
              {addToDrive
                ? `Access granted to ${selectedStakeholderIds.length} stakeholder(s)`
                : "Deliverable will not be published to Drive"}
            </span>
          </div>

          <div className={styles.deliverableFooterRight}>
            <button
              type="button"
              className={styles.deliverableCloseActionBtn}
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="button"
              className={styles.deliverableApproveBtn}
              onClick={() => void handleConfirm()}
              disabled={submitting}
            >
              <CheckCircle2 size={15} aria-hidden="true" />
              <span>{submitting ? "Approving..." : addToDrive ? "Approve & Add to Drive" : "Approve Deliverable"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
