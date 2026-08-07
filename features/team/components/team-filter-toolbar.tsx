"use client";

import { ListFilter, Search, X } from "lucide-react";
import { useState } from "react";
import { WORKSPACE_ROLES } from "../types/team.types";
import type {
  MemberStatus,
  ProjectSummary,
  TeamMemberFilters,
  WorkspaceRole,
} from "../types/team.types";
import styles from "./team-page.module.css";

interface TeamFilterToolbarProps {
  filters: TeamMemberFilters;
  projects: ProjectSummary[];
  onChange: (filters: TeamMemberFilters) => void;
}

export function TeamFilterToolbar({
  filters,
  projects,
  onChange,
}: TeamFilterToolbarProps) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const activeFilterCount = [
    filters.role !== "all",
    filters.projectId !== "all",
    filters.status !== "all",
  ].filter(Boolean).length;

  const updateFilters = (updates: Partial<TeamMemberFilters>) => {
    onChange({ ...filters, ...updates });
  };

  const filterControls = (
    <>
      <label className={styles.compactSelect}>
        <span className="sr-only">Filter by role</span>
        <select
          aria-label="Role filter"
          value={filters.role}
          onChange={(event) =>
            updateFilters({
              role: event.target.value as "all" | WorkspaceRole,
            })
          }
        >
          <option value="all">All roles</option>
          {WORKSPACE_ROLES.map((role) => (
            <option value={role} key={role}>
              {role}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.compactSelect}>
        <span className="sr-only">Filter by project</span>
        <select
          aria-label="Project filter"
          value={filters.projectId}
          onChange={(event) => updateFilters({ projectId: event.target.value })}
        >
          <option value="all">All projects</option>
          {projects.map((project) => (
            <option value={project.id} key={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.compactSelect}>
        <span className="sr-only">Filter by status</span>
        <select
          aria-label="Status filter"
          value={filters.status}
          onChange={(event) =>
            updateFilters({
              status: event.target.value as "all" | MemberStatus,
            })
          }
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="invited">Invited</option>
          <option value="inactive">Inactive</option>
        </select>
      </label>
    </>
  );

  return (
    <div className={styles.filterToolbar}>
      <label className={styles.searchControl}>
        <Search size={15} aria-hidden="true" />
        <span className="sr-only">Search team members</span>
        <input
          type="search"
          placeholder="Search team members"
          value={filters.query}
          onChange={(event) => updateFilters({ query: event.target.value })}
        />
      </label>

      <div className={styles.desktopFilters}>{filterControls}</div>

      <button
        type="button"
        className={styles.filterButton}
        aria-expanded={mobileFiltersOpen}
        aria-controls="team-mobile-filters"
        onClick={() => setMobileFiltersOpen((current) => !current)}
      >
        {mobileFiltersOpen ? <X size={15} /> : <ListFilter size={15} />}
        <span>Filter</span>
        {activeFilterCount > 0 ? (
          <strong aria-label={`${activeFilterCount} active filters`}>
            {activeFilterCount}
          </strong>
        ) : null}
      </button>

      {mobileFiltersOpen ? (
        <div className={styles.mobileFilters} id="team-mobile-filters">
          {filterControls}
        </div>
      ) : null}
    </div>
  );
}
