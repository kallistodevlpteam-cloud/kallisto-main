"use client";

import React from "react";
import { X } from "lucide-react";
import { ProjectFilterState } from "@/types/domain/project";
import styles from "./projects.module.css";

interface ProjectFiltersProps {
  filters: Partial<ProjectFilterState>;
  onFilterChange: (newFilters: Partial<ProjectFilterState>) => void;
  onClose: () => void;
  onClear: () => void;
}

export function ProjectFilters({
  filters,
  onFilterChange,
  onClose,
  onClear,
}: ProjectFiltersProps) {
  return (
    <div className={styles.filterPopover} role="dialog" aria-label="Filter projects">
      <div className={styles.filterPopoverHeader}>
        <span>Filter Projects</span>
        <button type="button" onClick={onClose} aria-label="Close filters">
          <X size={14} />
        </button>
      </div>

      <div className={styles.filterGroup}>
        <label className={styles.filterLabel} htmlFor="filter-phase">
          Project Phase
        </label>
        <select
          id="filter-phase"
          className={styles.filterSelect}
          value={filters.phase || ""}
          onChange={(e) => onFilterChange({ ...filters, phase: e.target.value })}
        >
          <option value="">All Phases</option>
          <option value="Concept">Concept</option>
          <option value="BOQ">BOQ</option>
          <option value="Feasibility">Feasibility</option>
          <option value="Working drawings">Working Drawings</option>
          <option value="Handover">Handover</option>
        </select>
      </div>

      <div className={styles.filterGroup}>
        <label className={styles.filterLabel} htmlFor="filter-type">
          Project Type
        </label>
        <select
          id="filter-type"
          className={styles.filterSelect}
          value={filters.projectType || ""}
          onChange={(e) => onFilterChange({ ...filters, projectType: e.target.value })}
        >
          <option value="">All Types</option>
          <option value="Residence">Residence</option>
          <option value="Villa">Villa</option>
          <option value="Commercial">Commercial</option>
          <option value="Penthouse">Penthouse</option>
        </select>
      </div>

      <div className={styles.filterGroup}>
        <label className={styles.filterLabel} htmlFor="filter-owner">
          Responsible Owner
        </label>
        <select
          id="filter-owner"
          className={styles.filterSelect}
          value={filters.ownerId || ""}
          onChange={(e) => onFilterChange({ ...filters, ownerId: e.target.value })}
        >
          <option value="">All Team Members</option>
          <option value="user-current">Arjun</option>
          <option value="user-002">Rohit</option>
          <option value="user-003">Vivek</option>
          <option value="user-004">Priya</option>
        </select>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
        <button type="button" className={styles.clearFilterLink} onClick={onClear}>
          Reset all filters
        </button>
        <button type="button" className={styles.primaryBtn} onClick={onClose}>
          Apply
        </button>
      </div>
    </div>
  );
}
