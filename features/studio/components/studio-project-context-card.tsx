"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import {
  DocumentsDuotoneIcon,
  ReviewDuotoneIcon,
} from "@/components/layout/sidebar-icons";
import { StudioProjectOption } from "@/types/domain/studio";
import styles from "./studio-chat-canvas.module.css";

export interface StudioProjectContextCardProps {
  selectedProjectId: string | null;
  projects: StudioProjectOption[];
  onSelectProject: (projectId: string) => void;
  onSelectPrompt?: (promptText: string) => void;
}

const DEFAULT_PROJECTS: StudioProjectOption[] = [
  {
    id: "proj-res-001",
    workspaceId: "ws-kallisto-01",
    code: "KAL-RES-2026-01",
    name: "Luxury Villa Horizon",
    projectType: "Residential Architecture",
    phase: "Design Development",
    status: "active",
  },
  {
    id: "proj-apt-002",
    workspaceId: "ws-kallisto-01",
    code: "KAL-APT-2026-04",
    name: "Sereno Heights Penthouse",
    projectType: "Interior Design",
    phase: "BOQ & Estimation",
    status: "active",
  },
  {
    id: "proj-com-003",
    workspaceId: "ws-kallisto-01",
    code: "KAL-COM-2026-09",
    name: "Apex Tech Park Lobby",
    projectType: "Commercial Interior",
    phase: "Pre-construction",
    status: "upcoming",
  },
  {
    id: "proj-rec-004",
    workspaceId: "ws-kallisto-01",
    code: "KAL-REC-2026-12",
    name: "Greenwood Eco Resort",
    projectType: "Hospitality Design",
    phase: "Feasibility & Concept",
    status: "active",
  },
];

export function StudioProjectContextCard({
  selectedProjectId,
  projects,
  onSelectProject,
}: StudioProjectContextCardProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const projectList = projects.length > 1 ? projects : DEFAULT_PROJECTS;

  const selectedProject =
    projectList.find((p) => p.id === selectedProjectId) ||
    projects.find((p) => p.id === selectedProjectId) ||
    projectList[0];

  // Close dropdown on click outside or Escape key
  useEffect(() => {
    if (!isDropdownOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDropdownOpen]);

  // Derive contextual metadata based on selected project
  const subScope =
    selectedProject.name.includes("Horizon")
      ? "Living Space & Terrace"
      : selectedProject.name.includes("Sereno")
      ? "Interior Fit-Out & Joinery"
      : selectedProject.name.includes("Apex")
      ? "Lobby & Reception Infrastructure"
      : "Main Architectural & Structural Works";

  const fileCount = selectedProject.name.includes("Horizon") ? 12 : selectedProject.name.includes("Sereno") ? 8 : 14;
  const taskCount = selectedProject.name.includes("Horizon") ? 4 : selectedProject.name.includes("Sereno") ? 3 : 5;

  return (
    <div className={styles.projectContextCard} aria-label="Active project context">
      {/* Top Banner: Project Title & Scope */}
      <div className={styles.projectContextTopRow}>
        <div className={styles.projectContextMainMeta}>
          <div className={styles.projectBadgeRow}>
            {/* Interactive Project Dropdown Trigger */}
            <div style={{ position: "relative", display: "inline-flex" }}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={styles.projectCodeBadgeButton}
                aria-label="Select project from dropdown"
                aria-expanded={isDropdownOpen}
                aria-haspopup="listbox"
              >
                <span>{selectedProject.code || "PRJ-2026"}</span>
                <ChevronDown
                  size={11}
                  className={styles.projectCodeChevron}
                  style={{ transform: isDropdownOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                />
              </button>

              {/* Floating Project Options Dropdown */}
              {isDropdownOpen && (
                <div
                  ref={dropdownRef}
                  className={styles.projectDropdownMenu}
                  role="listbox"
                  aria-label="Available projects"
                >
                  <div className={styles.projectDropdownHeader}>SWITCH PROJECT</div>
                  {projectList.map((p) => {
                    const isSelected = p.id === selectedProject.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => {
                          onSelectProject(p.id);
                          setIsDropdownOpen(false);
                        }}
                        className={`${styles.projectDropdownItem} ${
                          isSelected ? styles.projectDropdownItemActive : ""
                        }`}
                      >
                        <div className={styles.projectDropdownItemMeta}>
                          <div className={styles.projectDropdownItemTitleRow}>
                            <span className={styles.projectDropdownItemName}>{p.name}</span>
                            <span className={styles.projectDropdownItemCode}>{p.code}</span>
                          </div>
                          <span className={styles.projectDropdownItemPhase}>
                            {p.phase || "Design Development"}
                          </span>
                        </div>
                        {isSelected && <Check size={14} className={styles.projectDropdownCheck} />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Phase Badge */}
            <span className={styles.projectPhaseBadge}>
              <span className={styles.projectPhaseDot} />
              {selectedProject.phase || "Design Development"}
            </span>

            {/* Scope Metadata with black icons */}
            <span className={styles.projectScopeMeta}>
              <span className={styles.scopeMetaItem}>
                <DocumentsDuotoneIcon size={13} style={{ color: "#0f172a" }} aria-hidden="true" />
                <span>{fileCount} files</span>
              </span>
              <span className={styles.scopeMetaDot}>·</span>
              <span className={styles.scopeMetaItem}>
                <ReviewDuotoneIcon size={13} style={{ color: "#0f172a" }} aria-hidden="true" />
                <span>{taskCount} active tasks</span>
              </span>
            </span>
          </div>

          {/* Project Title Heading with quick dropdown toggle */}
          <h1 className={styles.projectTitleHeading}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={{
                background: "transparent",
                border: "none",
                padding: 0,
                margin: 0,
                color: "inherit",
                fontSize: "inherit",
                fontWeight: "inherit",
                fontFamily: "inherit",
                cursor: "pointer",
                textAlign: "left",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
              title="Click to switch project"
            >
              <span>{selectedProject.name}</span>
              <ChevronDown
                size={16}
                style={{
                  color: "#64748b",
                  transition: "transform 0.15s ease",
                  transform: isDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </button>
          </h1>
          <p className={styles.projectSubScopeSubtitle}>{subScope}</p>
        </div>
      </div>
    </div>
  );
}
