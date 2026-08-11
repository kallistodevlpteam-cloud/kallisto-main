"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Filter, Search, X, Check, ChevronDown } from "lucide-react";

import { useProjectFilters } from "./hooks/use-project-filters";
import { useProjectPermissions } from "./hooks/use-project-permissions";
import { useProjectsQuery } from "./hooks/use-projects-query";

import { ImportProjectDrawer } from "./components/import-project-drawer";
import { ProjectSortMenu } from "./components/project-sort-menu";
import { ProjectStatusTabs } from "./components/project-status-tabs";
import { ProjectsPageHeader } from "./components/projects-page-header";
import { ProjectsCardsGrid, SAMPLE_PROJECTS } from "./components/projects-cards-grid";

import { projectsService } from "./services/projects.service";
import { ProjectListItem, ProjectStatus } from "./types/project.types";

import styles from "./projects.module.css";

const MOCK_TEAM_MEMBERS = [
  { id: "tm-1", name: "Sarin Thomas", role: "Lead Architect" },
  { id: "tm-2", name: "Priya Menon", role: "Project Manager" },
  { id: "tm-3", name: "Rahul Krishnan", role: "Senior Designer" },
  { id: "tm-4", name: "Anitha Das", role: "Site Engineer" },
  { id: "tm-5", name: "Vikram R", role: "Estimator" },
];

const KNOWN_LOCATIONS = Array.from(
  new Set(SAMPLE_PROJECTS.map((p) => p.location).filter(Boolean))
).sort((a, b) => a.localeCompare(b));

export function ProjectsWorkspace() {
  const { canImport, securityContext } = useProjectPermissions();

  const {
    filters,
    searchInput,
    setSearchInput,
    setStatusTab,
    setFilters,
    setPageCursor,
    clearAllFilters,
  } = useProjectFilters();

  const { data, loading, error, forbidden, refetch } = useProjectsQuery(
    securityContext,
    filters
  );

  const [showImportDrawer, setShowImportDrawer] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  const [locationSearchText, setLocationSearchText] = useState("");
  const [selectedLocationList, setSelectedLocationList] = useState<string[]>(
    filters.location ? filters.location.split(",").filter(Boolean) : []
  );

  const [reopenTargetProject, setReopenTargetProject] = useState<ProjectListItem | null>(null);
  const [reopenReason, setReopenReason] = useState("");
  const [reopenError, setReopenError] = useState<string | null>(null);
  const [memberSearch, setMemberSearch] = useState("");

  const filteredTeamMembers = MOCK_TEAM_MEMBERS.filter(
    (m) =>
      m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.role.toLowerCase().includes(memberSearch.toLowerCase())
  );

  const filteredKnownLocations = KNOWN_LOCATIONS.filter((loc) =>
    loc.toLowerCase().includes(locationSearchText.toLowerCase())
  );

  const selectedLocCount = filters.location
    ? filters.location.split(",").filter(Boolean).length
    : 0;

  const locationPillLabel =
    selectedLocCount > 0 ? `Location · ${selectedLocCount}` : "Location";

  const getOwnershipLabel = () => {
    if (!filters.ownership || filters.ownership === "all_projects") return "Ownership";
    if (filters.ownership === "my_projects") return "My projects";
    if (filters.ownership === "unassigned") return "Unassigned";
    const member = MOCK_TEAM_MEMBERS.find((m) => m.id === filters.ownership);
    return member ? member.name : "Ownership";
  };

  const isOwnershipActive = Boolean(
    filters.ownership && filters.ownership !== "all_projects"
  );

  useEffect(() => {
    if (openDropdown === "location") {
      setSelectedLocationList(
        filters.location ? filters.location.split(",").filter(Boolean) : []
      );
      setLocationSearchText("");
    }
  }, [filters.location, openDropdown]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (openDropdown && toolbarRef.current && !toolbarRef.current.contains(target)) {
        setOpenDropdown(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openDropdown]);

  const handleUpdateStatus = async (projectId: string, newStatus: ProjectStatus, reason?: string) => {
    try {
      await projectsService.updateProjectLifecycleStatus(
        securityContext,
        projectId,
        newStatus,
        reason
      );
      refetch();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Status update failed: ${msg}`);
    }
  };

  const handleConfirmReopen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reopenTargetProject) return;

    if (!reopenReason || reopenReason.trim().length < 5) {
      setReopenError("Please provide a detailed reason of at least 5 characters for reopening.");
      return;
    }

    try {
      await projectsService.reopenProject(
        securityContext,
        reopenTargetProject.id,
        reopenReason.trim()
      );
      setReopenTargetProject(null);
      setReopenReason("");
      setReopenError(null);
      refetch();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setReopenError(msg || "Failed to reopen project.");
    }
  };

  const hasActiveFilters = Boolean(
    filters.ownership ||
      (filters.phase && filters.phase.length > 0) ||
      (filters.attention && filters.attention.length > 0) ||
      filters.location ||
      (filters.lifecycle && filters.lifecycle.length > 0)
  );

  const normalizedStatus: ProjectStatus | "ALL" | undefined =
    filters.status === "on-hold" ? "ON_HOLD" : filters.status;

  const statusCounts = {
    active: SAMPLE_PROJECTS.filter((p) => p.status === "ACTIVE").length,
    upcoming: SAMPLE_PROJECTS.filter((p) => p.status === "UPCOMING").length,
    onHold: SAMPLE_PROJECTS.filter((p) => p.status === "ON_HOLD").length,
    completed: SAMPLE_PROJECTS.filter((p) => p.status === "COMPLETED").length,
    all: SAMPLE_PROJECTS.length,
  };

  return (
    <div className="workspace-container">
      <div className={styles.projectsContainer}>
        {/* Page Header */}
        <ProjectsPageHeader
          canImport={canImport}
          onOpenImportDrawer={() => setShowImportDrawer(true)}
          searchInput={searchInput}
          setSearchInput={setSearchInput}
        />

        {/* Tab section below the title card */}
        <ProjectStatusTabs
          currentStatus={normalizedStatus}
          counts={statusCounts}
          onSelectTab={setStatusTab}
        />

        {/* Operational Toolbar */}
        <div className={styles.filtersBar} ref={toolbarRef}>
          {/* Filter pills & sort menu */}
          <div className={styles.pillsRow}>
            {/* Ownership Pill */}
            <div className={styles.dropdownContainer}>
              <button
                type="button"
                className={`${styles.pillBtn} ${isOwnershipActive ? styles.pillBtnActive : ""}`}
                onClick={() => setOpenDropdown(openDropdown === "ownership" ? null : "ownership")}
              >
                <span>{getOwnershipLabel()}</span>
                <ChevronDown size={12} />
              </button>
              {openDropdown === "ownership" && (
                <div className={styles.dropdownContent} style={{ minWidth: "220px", padding: "6px" }} role="menu">
                  {/* Option 1: All projects */}
                  <button
                    type="button"
                    className={`${styles.dropdownItem} ${!filters.ownership || filters.ownership === "all_projects" ? styles.dropdownItemActive : ""}`}
                    onClick={() => {
                      setFilters({ ownership: undefined });
                      setOpenDropdown(null);
                    }}
                  >
                    <span>All projects</span>
                    {(!filters.ownership || filters.ownership === "all_projects") && <Check size={14} />}
                  </button>

                  {/* Option 2: My projects */}
                  <button
                    type="button"
                    className={`${styles.dropdownItem} ${filters.ownership === "my_projects" ? styles.dropdownItemActive : ""}`}
                    onClick={() => {
                      setFilters({ ownership: "my_projects" });
                      setOpenDropdown(null);
                    }}
                  >
                    <span>My projects</span>
                    {filters.ownership === "my_projects" && <Check size={14} />}
                  </button>

                  {/* Option 3: Unassigned */}
                  <button
                    type="button"
                    className={`${styles.dropdownItem} ${filters.ownership === "unassigned" ? styles.dropdownItemActive : ""}`}
                    onClick={() => {
                      setFilters({ ownership: "unassigned" });
                      setOpenDropdown(null);
                    }}
                  >
                    <span>Unassigned</span>
                    {filters.ownership === "unassigned" && <Check size={14} />}
                  </button>

                  {/* Team Members Section */}
                  <div className={styles.dropdownDivider} />

                  <div style={{ padding: "4px 4px" }}>
                    <div style={{ position: "relative", width: "100%" }}>
                      <Search size={13} style={{ position: "absolute", left: "8px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                      <input
                        type="text"
                        placeholder="Search team member..."
                        value={memberSearch}
                        onChange={(e) => setMemberSearch(e.target.value)}
                        className={styles.dropdownSearchInput}
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "2px", maxHeight: "180px", overflowY: "auto", marginTop: "2px" }}>
                    {filteredTeamMembers.map((member) => {
                      const isSelected = filters.ownership === member.id;
                      return (
                        <button
                          key={member.id}
                          type="button"
                          className={`${styles.dropdownItem} ${isSelected ? styles.dropdownItemActive : ""}`}
                          onClick={() => {
                            setFilters({ ownership: member.id });
                            setOpenDropdown(null);
                          }}
                        >
                          <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                            <span>{member.name}</span>
                            <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 400 }}>{member.role}</span>
                          </div>
                          {isSelected && <Check size={14} />}
                        </button>
                      );
                    })}
                    {filteredTeamMembers.length === 0 && (
                      <div style={{ padding: "8px 12px", fontSize: "12px", color: "#94a3b8" }}>
                        No team member found.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Phase Pill */}
            <div className={styles.dropdownContainer}>
              <button
                type="button"
                className={`${styles.pillBtn} ${filters.phase && filters.phase.length > 0 ? styles.pillBtnActive : ""}`}
                onClick={() => setOpenDropdown(openDropdown === "phase" ? null : "phase")}
              >
                <span>
                  {filters.phase && filters.phase.length > 0 ? `Phase (${filters.phase.length})` : "Project Phase"}
                </span>
                <ChevronDown size={12} />
              </button>
              {openDropdown === "phase" && (
                <div className={styles.dropdownContent} role="menu">
                  {[
                    "Briefing",
                    "Site verification",
                    "Concept",
                    "Design development",
                    "Approvals",
                    "BOQ and procurement",
                    "Construction",
                    "Handover",
                    "Post-handover",
                  ].map((p) => {
                    const isChecked = filters.phase?.includes(p as any) || false;
                    return (
                      <button
                        key={p}
                        type="button"
                        className={`${styles.dropdownItem} ${isChecked ? styles.dropdownItemActive : ""}`}
                        onClick={() => {
                          const prev = filters.phase || [];
                          const next = prev.includes(p as any)
                            ? prev.filter((item) => item !== p)
                            : [...prev, p];
                          setFilters({ phase: next.length ? (next as any) : undefined });
                        }}
                      >
                        <span>{p}</span>
                        {isChecked && <Check size={14} />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Attention Pill */}
            <div className={styles.dropdownContainer}>
              <button
                type="button"
                className={`${styles.pillBtn} ${filters.attention && filters.attention.length > 0 ? styles.pillBtnActive : ""}`}
                onClick={() => setOpenDropdown(openDropdown === "attention" ? null : "attention")}
              >
                <span>
                  {filters.attention && filters.attention.length > 0
                    ? `Attention (${filters.attention.length})`
                    : "Needs Attention"}
                </span>
                <ChevronDown size={12} />
              </button>
              {openDropdown === "attention" && (
                <div className={styles.dropdownContent} role="menu">
                  {[
                    { value: "overdue", label: "Overdue action" },
                    { value: "blocked", label: "Blocked" },
                    { value: "awaiting_client", label: "Awaiting client" },
                    { value: "missing_owner", label: "Missing owner" },
                    { value: "missing_next_action", label: "Missing next action" },
                  ].map((opt) => {
                    const isChecked = filters.attention?.includes(opt.value as any) || false;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        className={`${styles.dropdownItem} ${isChecked ? styles.dropdownItemActive : ""}`}
                        onClick={() => {
                          const prev = filters.attention || [];
                          const next = prev.includes(opt.value as any)
                            ? prev.filter((item) => item !== opt.value)
                            : [...prev, opt.value];
                          setFilters({ attention: next.length ? (next as any) : undefined });
                        }}
                      >
                        <span>{opt.label}</span>
                        {isChecked && <Check size={14} />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Location Pill */}
            <div className={styles.dropdownContainer}>
              <button
                type="button"
                className={`${styles.pillBtn} ${selectedLocCount > 0 ? styles.pillBtnActive : ""}`}
                onClick={() => setOpenDropdown(openDropdown === "location" ? null : "location")}
              >
                <span>{locationPillLabel}</span>
                <ChevronDown size={12} />
              </button>
              {openDropdown === "location" && (
                <div className={styles.dropdownContent} style={{ minWidth: "240px", padding: "10px", gap: "8px" }} role="menu">
                  {/* Search city or district */}
                  <div style={{ padding: "2px 2px" }}>
                    <div style={{ position: "relative", width: "100%" }}>
                      <Search size={13} style={{ position: "absolute", left: "8px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                      <input
                        type="text"
                        placeholder="Search city or district"
                        value={locationSearchText}
                        onChange={(e) => setLocationSearchText(e.target.value)}
                        className={styles.dropdownSearchInput}
                      />
                    </div>
                  </div>

                  {/* Multi-select Checkbox List */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px", maxHeight: "180px", overflowY: "auto", marginTop: "2px" }}>
                    {filteredKnownLocations.map((loc) => {
                      const isChecked = selectedLocationList.includes(loc);
                      return (
                        <button
                          key={loc}
                          type="button"
                          className={`${styles.dropdownItem} ${isChecked ? styles.dropdownItemActive : ""}`}
                          onClick={() => {
                            setSelectedLocationList((prev) =>
                              prev.includes(loc)
                                ? prev.filter((item) => item !== loc)
                                : [...prev, loc]
                            );
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              readOnly
                              style={{ cursor: "pointer" }}
                            />
                            <span>{loc}</span>
                          </div>
                        </button>
                      );
                    })}
                    {filteredKnownLocations.length === 0 && (
                      <div style={{ padding: "8px 12px", fontSize: "12px", color: "#94a3b8" }}>
                        No location found.
                      </div>
                    )}
                  </div>

                  {/* Footer Controls: Clear & Apply */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #e2e8f0", paddingTop: "8px", marginTop: "4px" }}>
                    <button
                      type="button"
                      className={styles.pillClearAllBtn}
                      onClick={() => {
                        setSelectedLocationList([]);
                        setFilters({ location: undefined });
                        setOpenDropdown(null);
                      }}
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      style={{
                        fontSize: "12.5px",
                        fontWeight: 600,
                        color: "#ffffff",
                        background: "#0f172a",
                        border: "none",
                        borderRadius: "6px",
                        padding: "5px 12px",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        const locString = selectedLocationList.length > 0 ? selectedLocationList.join(",") : undefined;
                        setFilters({ location: locString });
                        setOpenDropdown(null);
                      }}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Clear All active filters option */}
            {hasActiveFilters && (
              <button type="button" className={styles.pillClearAllBtn} onClick={clearAllFilters}>
                Clear all
              </button>
            )}

            {/* Sort Menu */}
            <ProjectSortMenu
              currentSort={filters.sort}
              onSelectSort={(sort) => setFilters({ sort })}
            />
          </div>

          {/* Active Filter Chips Bar */}
          {hasActiveFilters && (
            <div className={styles.activeChipsBar}>
              {filters.ownership && filters.ownership !== "all_projects" && (
                <span className={styles.chip}>
                  <span>{getOwnershipLabel()}</span>
                  <button type="button" onClick={() => setFilters({ ownership: undefined })} aria-label="Remove ownership filter">
                    <X size={12} />
                  </button>
                </span>
              )}

              {filters.phase && filters.phase.map((p) => (
                <span key={p} className={styles.chip}>
                  <span>{p}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const next = filters.phase?.filter((item) => item !== p);
                      setFilters({ phase: next && next.length > 0 ? next : undefined });
                    }}
                    aria-label={`Remove phase filter ${p}`}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}

              {filters.attention && filters.attention.map((a) => (
                <span key={a} className={styles.chip}>
                  <span>{a.replace("_", " ")}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const next = filters.attention?.filter((item) => item !== a);
                      setFilters({ attention: next && next.length > 0 ? next : undefined });
                    }}
                    aria-label={`Remove attention filter ${a}`}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}

              {filters.location && (
                <span className={styles.chip}>
                  <span>Loc: {filters.location}</span>
                  <button type="button" onClick={() => setFilters({ location: undefined })} aria-label="Remove location filter">
                    <X size={12} />
                  </button>
                </span>
              )}

              <button type="button" className={styles.pillClearAllBtn} onClick={clearAllFilters}>
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Project Cards Grid – filtered by active tab & location */}
        <ProjectsCardsGrid
          activeStatus={
            filters.status === "on-hold"
              ? "ON_HOLD"
              : (filters.status as import("./types/project.types").ProjectStatus | "ALL" | undefined) ?? "ACTIVE"
          }
          locationFilter={filters.location}
        />

        {/* Import Project Drawer */}
        <ImportProjectDrawer
          isOpen={showImportDrawer}
          securityContext={securityContext}
          onClose={() => setShowImportDrawer(false)}
          onImportSuccess={() => refetch()}
        />

        {/* Reopen Completed Project Confirmation Dialog */}
        {reopenTargetProject && (
          <div className={styles.reopenModal}>
            <div className={styles.reopenCard} role="dialog" aria-modal="true" aria-label="Reopen Project Modal">
              <h3>Reopen Completed Project</h3>
              <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
                Reopening &quot;{reopenTargetProject.name}&quot; will change its status from COMPLETED back to ACTIVE and write an immutable audit log entry.
              </p>

              {reopenError && (
                <div style={{ color: "#dc2626", fontSize: "12.5px" }}>{reopenError}</div>
              )}

              <form onSubmit={handleConfirmReopen} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <label style={{ fontSize: "12.5px", fontWeight: 500, color: "#334155" }}>
                  Reason for Reopening *
                </label>
                <textarea
                  required
                  className={styles.reopenTextArea}
                  placeholder="State the operational reason for reopening this completed project..."
                  value={reopenReason}
                  onChange={(e) => setReopenReason(e.target.value)}
                />

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "8px" }}>
                  <button
                    type="button"
                    className={styles.secondaryBtn}
                    onClick={() => {
                      setReopenTargetProject(null);
                      setReopenReason("");
                      setReopenError(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className={styles.primaryBtn}>
                    Confirm & Reopen
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
