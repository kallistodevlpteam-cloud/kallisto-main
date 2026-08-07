"use client";

import {
  ClipboardList,
  Compass,
  FileText,
  Image as ImageIcon,
  PieChart,
  Presentation,
  X,
} from "lucide-react";
import React, { useEffect } from "react";
import { StudioWorkspaceType } from "@/types/domain/studio";
import styles from "./studio-modal.module.css";

export interface OutputOption {
  id: StudioWorkspaceType;
  title: string;
  badge: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
}

const OUTPUT_OPTIONS: OutputOption[] = [
  {
    id: "boq",
    title: "BOQ & Rate Analysis",
    badge: "BOQ Engine",
    description: "Quantity sheets, measurement take-offs & rate analysis summaries.",
    icon: ClipboardList,
    gradient: "linear-gradient(135deg, #059669 0%, #047857 100%)",
  },
  {
    id: "estimate",
    title: "Project Estimates",
    badge: "Estimates",
    description: "Cost charts, trade breakdowns & early project estimates.",
    icon: PieChart,
    gradient: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
  },
  {
    id: "visualisation",
    title: "Visualisations",
    badge: "Visualisations",
    description: "3D architectural renders, interior spaces & material samples.",
    icon: ImageIcon,
    gradient: "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)",
  },
  {
    id: "proposal",
    title: "Proposals & Presentations",
    badge: "Proposals",
    description: "Presentation boards, fee schedules & client pitch decks.",
    icon: Presentation,
    gradient: "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)",
  },
  {
    id: "specification_report",
    title: "Specifications & Reports",
    badge: "Documentation",
    description: "Technical specifications, site inspection reports & project documentation.",
    icon: FileText,
    gradient: "linear-gradient(135deg, #0891b2 0%, #0e7490 100%)",
  },
  {
    id: "boq",
    title: "Drawing Analysis & Quantity Extraction",
    badge: "Drawing AI",
    description: "Extract quantities, room areas, structural dimensions & CAD take-offs.",
    icon: Compass,
    gradient: "linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)",
  },
];

export interface OutputSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOutput: (workspaceType: StudioWorkspaceType) => void;
}

export function OutputSelectorModal({
  isOpen,
  onClose,
  onSelectOutput,
}: OutputSelectorModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalBackdrop} onClick={onClose} role="dialog" aria-modal="true">
      <div
        className={styles.modalContent}
        style={{ maxWidth: "42rem" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <div className={styles.agentTitleBadgeWrap}>
            <div>
              <h3 className={styles.modalTitle}>Create New Construction Output</h3>
              <p className={styles.modalSubtitle}>
                Select the output type to produce. You can select or assign the project in the next step.
              </p>
            </div>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className={styles.stepBody}>
          <div className={styles.outputModalGrid}>
            {OUTPUT_OPTIONS.map((opt) => {
              const IconComp = opt.icon;
              return (
                <div
                  key={opt.title}
                  className={styles.outputModalCard}
                  onClick={() => {
                    onSelectOutput(opt.id);
                    onClose();
                  }}
                  tabIndex={0}
                  role="button"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelectOutput(opt.id);
                      onClose();
                    }
                  }}
                >
                  <div className={styles.outputCardTop}>
                    <div
                      className={styles.outputCardIcon}
                      style={{ background: opt.gradient }}
                    >
                      <IconComp size={18} />
                    </div>
                    <span className={styles.outputCardBadge}>
                      {opt.badge}
                    </span>
                  </div>
                  <div>
                    <h4 className={styles.outputCardTitle}>
                      {opt.title}
                    </h4>
                    <p className={styles.outputCardDesc}>
                      {opt.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
