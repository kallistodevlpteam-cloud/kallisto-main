"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Plus,
  ArrowRight,
  FileSpreadsheet,
  Compass,
  FileText,
  Calculator,
  ClipboardList,
  Presentation,
  X,
  Building2,
  Info,
  Check
} from "lucide-react";
import styles from "../home-workspace.module.css";

export interface StudioToolItem {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  icon: React.ElementType;
  isRecent?: boolean;
  recentTime?: string;
  allowUnassignedDraft?: boolean;
}

const STUDIO_TOOLS: StudioToolItem[] = [
  {
    id: "create-boq",
    title: "Create BOQ",
    description: "Generate a structured BOQ with materials, labour, quantities, rates, and project costing.",
    category: "BOQ & Costing",
    imageUrl: "/assets/quotation-retyping-workflow.png",
    icon: FileSpreadsheet,
    isRecent: true,
    recentTime: "Opened 2h ago",
    allowUnassignedDraft: true,
  },
  {
    id: "generate-ai-plan",
    title: "Generate AI Plan",
    description: "Create early-stage space plans from project requirements, site data, and constraints.",
    category: "Planning",
    imageUrl: "/assets/kallisto-drawing-approval-record.png",
    icon: Compass,
    isRecent: true,
    recentTime: "Opened yesterday",
    allowUnassignedDraft: true,
  },
  {
    id: "create-proposal",
    title: "Create Client Proposal",
    description: "Build a client-ready proposal with scope, deliverables, timeline, and pricing.",
    category: "Proposals",
    imageUrl: "/assets/projects/greenfield-villa.png",
    icon: FileText,
    isRecent: false,
    allowUnassignedDraft: false,
  },
  {
    id: "scope-estimate",
    title: "Scope & Estimate",
    description: "Convert project requirements into a structured scope and preliminary cost estimate.",
    category: "BOQ & Costing",
    imageUrl: "/assets/projects/oak-house.png",
    icon: Calculator,
    isRecent: false,
    allowUnassignedDraft: true,
  },
  {
    id: "create-site-report",
    title: "Create Site Report",
    description: "Generate structured site visit, inspection, progress, or quality reports.",
    category: "Reports",
    imageUrl: "/assets/projects/residence-24.png",
    icon: ClipboardList,
    isRecent: false,
    allowUnassignedDraft: false,
  },
  {
    id: "create-presentation",
    title: "Create Presentation",
    description: "Build a professional client presentation using project information and selected assets.",
    category: "Presentations",
    imageUrl: "/assets/projects/anitha-menon-residence.png",
    icon: Presentation,
    isRecent: false,
    allowUnassignedDraft: true,
  },
];

const MOCK_ACTIVE_PROJECTS = [
  { id: "proj-1", name: "Skyline Apartments — Site B", code: "KAL-2026-081", location: "Thiruvananthapuram" },
  { id: "proj-2", name: "Greenfield Villa — Phase 2", code: "KAL-2026-044", location: "Kochi" },
  { id: "proj-3", name: "Oak House — Interior Renovation", code: "KAL-2026-019", location: "Kozhikode" },
  { id: "proj-4", name: "Anitha Menon Residence", code: "KAL-2026-092", location: "Kottayam" },
];

export function StudioSection() {
  // Modal State for Studio tool execution
  const [selectedToolModal, setSelectedToolModal] = useState<StudioToolItem | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(MOCK_ACTIVE_PROJECTS[0].id);
  const [creationSuccessMessage, setCreationSuccessMessage] = useState<string | null>(null);

  const handleOpenTool = (tool: StudioToolItem) => {
    setSelectedToolModal(tool);
    setCreationSuccessMessage(null);
    if (!tool.allowUnassignedDraft) {
      setSelectedProjectId(MOCK_ACTIVE_PROJECTS[0].id);
    }
  };

  const handleConfirmCreate = () => {
    if (!selectedToolModal) return;
    const projName =
      selectedProjectId === "unassigned"
        ? "Unassigned Exploration Draft"
        : MOCK_ACTIVE_PROJECTS.find((p) => p.id === selectedProjectId)?.name;

    setCreationSuccessMessage(`Opened "${selectedToolModal.title}" for ${projName}.`);
    setTimeout(() => {
      setSelectedToolModal(null);
      setCreationSuccessMessage(null);
    }, 1800);
  };

  // Limit display to top 4 cards
  const homeDisplayTools = STUDIO_TOOLS.slice(0, 4);

  return (
    <section className={styles.studioSectionContainer}>
      {/* 1. Section Header */}
      <div className={styles.studioHeaderRow}>
        <div className={styles.studioTitleBlock}>
          <div className={styles.studioTitleGroup}>
            <h2 className={styles.studioTitle}>Studio</h2>
            <span className={styles.betaBadge}>Beta</span>
          </div>
          <p className={styles.studioSubtitle}>
            Create project-ready BOQs, plans, proposals, reports, and presentations.
          </p>
        </div>

        <div className={styles.studioHeaderActions}>
          <Link
            href="/studio"
            className={styles.btnCreateStudio}
            style={{ textDecoration: "none" }}
          >
            <span>Open Hive Studio</span>
            <ArrowRight size={14} />
          </Link>
          <button
            type="button"
            className={styles.btnCreateStudio}
            onClick={() => handleOpenTool(STUDIO_TOOLS[0])}
          >
            <Plus size={14} />
            <span>Quick Create</span>
          </button>
        </div>
      </div>

      {/* 2. 4-Column Studio Cards Grid */}
      <div className={styles.studioGrid}>
        {homeDisplayTools.length === 0 ? (
          <div className={styles.emptyStudioState}>
            <p>No recent Studio tools found.</p>
          </div>
        ) : (
          homeDisplayTools.map((tool) => (
            <div
              key={tool.id}
              className={styles.studioCard}
              onClick={() => handleOpenTool(tool)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && handleOpenTool(tool)}
            >
              <div className={styles.studioImageContainer}>
                <Image
                  src={tool.imageUrl}
                  alt={tool.title}
                  fill
                  sizes="(max-width: 600px) 100vw, (max-width: 1100px) 50vw, 25vw"
                  className={styles.studioCardImg}
                  unoptimized
                />
              </div>

              <div className={styles.studioCardBody}>
                <div className={styles.cardHeaderTitleRow}>
                  <h3 className={styles.studioCardTitle}>{tool.title}</h3>
                  {tool.recentTime && (
                    <span className={styles.recentTimeBadge}>{tool.recentTime}</span>
                  )}
                </div>
                <p className={styles.studioCardDesc}>{tool.description}</p>
                <span className={styles.studioCategoryPill}>{tool.category}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 4. Studio Creation Flow Dialog Modal */}
      {selectedToolModal && (
        <div className={styles.modalOverlay} onClick={() => setSelectedToolModal(null)}>
          <div
            className={styles.studioModalBox}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleGroup}>
                <div className={styles.modalIconBox}>
                  {React.createElement(selectedToolModal.icon, { size: 18 })}
                </div>
                <div>
                  <h3 className={styles.modalToolTitle}>{selectedToolModal.title}</h3>
                  <span className={styles.modalCategoryBadge}>{selectedToolModal.category}</span>
                </div>
              </div>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setSelectedToolModal(null)}
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <p className={styles.modalDesc}>{selectedToolModal.description}</p>

              {creationSuccessMessage ? (
                <div className={styles.successAlert}>
                  <Check size={16} />
                  <span>{creationSuccessMessage}</span>
                </div>
              ) : (
                <div className={styles.projectSelectBlock}>
                  <label className={styles.projectSelectLabel}>
                    Select a project to continue
                  </label>

                  <select
                    className={styles.projectSelectInput}
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                  >
                    {MOCK_ACTIVE_PROJECTS.map((proj) => (
                      <option key={proj.id} value={proj.id}>
                        {proj.name} ({proj.location})
                      </option>
                    ))}
                    {selectedToolModal.allowUnassignedDraft && (
                      <option value="unassigned">Create unassigned draft</option>
                    )}
                  </select>

                  {selectedProjectId === "unassigned" ? (
                    <div className={styles.unassignedNotice}>
                      <Info size={14} />
                      <span>
                        Temporary exploration allowed for this tool. Link to an active project before finalising.
                      </span>
                    </div>
                  ) : (
                    <div className={styles.contextLoadedNotice}>
                      <Building2 size={14} />
                      <span>
                        Available project context loaded: requirements, site data, BOQ rates & drawing records.
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.modalCancelBtn}
                onClick={() => setSelectedToolModal(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.modalConfirmBtn}
                onClick={handleConfirmCreate}
              >
                <span>Open in Studio</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export const TemplatesSection = StudioSection;
