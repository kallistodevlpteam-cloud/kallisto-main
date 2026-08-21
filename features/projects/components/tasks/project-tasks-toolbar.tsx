"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import styles from "../../projects.module.css";

interface ProjectTasksToolbarProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  priorityFilter: string;
  onPriorityFilterChange: (priority: string) => void;
  assigneeFilter: string;
  onAssigneeFilterChange: (assignee: string) => void;
  phaseFilter: string;
  onPhaseFilterChange: (phase: string) => void;
  scope: "all" | "mine";
  onScopeChange: (scope: "all" | "mine") => void;
  sortBy?: string;
  onSortByChange?: (sort: string) => void;
}

export function ProjectTasksToolbar({
  searchQuery,
  onSearchQueryChange,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  assigneeFilter,
  onAssigneeFilterChange,
  phaseFilter,
  onPhaseFilterChange,
  scope,
  onScopeChange,
  sortBy,
  onSortByChange,
}: ProjectTasksToolbarProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const STATUS_LABELS: Record<string, string> = {
    all: "Status",
    active: "Active",
    todo: "To Do",
    in_progress: "In Progress",
    waiting: "Waiting",
    blocked: "Blocked",
    completed: "Completed",
  };

  const PRIORITY_LABELS: Record<string, string> = {
    all: "Priority",
    critical: "Critical",
    high: "High",
    normal: "Normal",
    low: "Low",
  };

  const ASSIGNEE_LABELS: Record<string, string> = {
    all: "Assignee",
    "user-rahul": "Rahul Sharma",
    "user-arjun": "Arjun Menon",
    "user-priya": "Priya Patel",
    unassigned: "Unassigned",
  };

  const PHASE_LABELS: Record<string, string> = {
    all: "Phase",
    "phase-1": "Phase 1: Design & Approval",
    "phase-2": "Phase 2: Superstructure",
    "phase-3": "Phase 3: MEP & Services",
    "phase-4": "Phase 4: Interior Fit-out",
  };

  const SORT_LABELS: Record<string, string> = {
    recently_updated: "Recently updated",
    due_date: "Due date",
    priority: "Priority",
    progress: "Progress",
    created_at: "Date created",
  };

  const hasActiveFilters =
    statusFilter !== "all" ||
    priorityFilter !== "all" ||
    assigneeFilter !== "all" ||
    phaseFilter !== "all" ||
    searchQuery.trim() !== "";

  return (
    <div className={`${styles.projectTasksToolbar} projectTasksToolbar`} ref={toolbarRef}>
      {/* Left Continuous Filter Controls */}
      <div className={styles.taskToolbarLeft}>
        {/* Clear Active Filters */}
        {hasActiveFilters && (
          <button
            type="button"
            className={styles.pillClearAllBtn}
            onClick={() => {
              onSearchQueryChange("");
              onStatusFilterChange("all");
              onPriorityFilterChange("all");
              onAssigneeFilterChange("all");
              onPhaseFilterChange("all");
            }}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Right Scope Segmented Control & Sort Dropdown */}
      <div className={styles.taskToolbarRight}>
        {/* Scope Toggle Button */}
        <div className={styles.taskScopeControl}>
          <button
            type="button"
            className={`${styles.scopeBtn} ${scope === "mine" ? styles.scopeBtnActive : ""}`}
            onClick={() => onScopeChange("mine")}
          >
            My Tasks
          </button>
          <button
            type="button"
            className={`${styles.scopeBtn} ${scope === "all" ? styles.scopeBtnActive : ""}`}
            onClick={() => onScopeChange("all")}
          >
            All Tasks
          </button>
        </div>
      </div>
    </div>
  );
}
