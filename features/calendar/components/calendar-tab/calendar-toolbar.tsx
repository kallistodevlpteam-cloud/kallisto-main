"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  X,
  Calendar as CalendarIcon,
} from "lucide-react";
import type { CalendarQueryState } from "../../hooks/use-calendar-query-state";
import styles from "../calendar-workspace-page.module.css";

interface CalendarToolbarProps {
  queryState: CalendarQueryState;
  onUpdateQuery: (updates: Partial<CalendarQueryState>) => void;
  onNavigateToday: () => void;
  onNavigatePrev: () => void;
  onNavigateNext: () => void;
  currentRangeLabel: string;
  projectsList: Array<{ id: string; name: string }>;
}

export function CalendarToolbar({
  queryState,
  onUpdateQuery,
  onNavigateToday,
  onNavigatePrev,
  onNavigateNext,
  currentRangeLabel,
  projectsList,
}: CalendarToolbarProps) {
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setFilterPopoverOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Compute active removable chips
  const activeChips: Array<{ key: keyof CalendarQueryState; label: string }> = [];

  if (queryState.scope !== "mine") {
    activeChips.push({ key: "scope", label: `Scope: ${queryState.scope}` });
  }
  if (queryState.project) {
    const projName = projectsList.find((p) => p.id === queryState.project)?.name || queryState.project;
    activeChips.push({ key: "project", label: `Project: ${projName}` });
  }
  if (queryState.activityType) {
    activeChips.push({ key: "activityType", label: `Type: ${queryState.activityType}` });
  }
  if (queryState.visibility) {
    activeChips.push({ key: "visibility", label: `Visibility: ${queryState.visibility}` });
  }
  if (queryState.includeCompleted) {
    activeChips.push({ key: "includeCompleted", label: "Include Completed" });
  }

  return (
    <div className={styles.toolbarContainer}>
      <div className={styles.toolbarMainRow}>
        {/* Left Toolbar Controls */}
        <div className={styles.toolbarLeft}>
          <button
            type="button"
            className={styles.todayNavBtn}
            onClick={onNavigateToday}
            title="Navigate calendar view to current date"
          >
            Today
          </button>

          <div className={styles.navBtnGroup}>
            <button
              type="button"
              className={styles.iconNavBtn}
              onClick={onNavigatePrev}
              aria-label="Previous period"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              className={styles.iconNavBtn}
              onClick={onNavigateNext}
              aria-label="Next period"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <span className={styles.rangeHeading}>{currentRangeLabel}</span>
        </div>

        {/* Right Toolbar Controls */}
        <div className={styles.toolbarRight}>
          {/* Search Box */}
          <div className={styles.searchBox}>
            <Search size={14} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search activities..."
              className={styles.searchInput}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          {/* Filter Popover Button */}
          <div style={{ position: "relative" }} ref={popoverRef}>
            <button
              type="button"
              className={`${styles.filterBtn} ${activeChips.length > 0 ? styles.filterBtnActive : ""}`}
              onClick={() => setFilterPopoverOpen((prev) => !prev)}
            >
              <Filter size={15} />
              <span>Filters</span>
              {activeChips.length > 0 && (
                <span className={styles.filterBadgeCount}>{activeChips.length}</span>
              )}
            </button>

            {/* Filter Popover */}
            {filterPopoverOpen && (
              <div className={styles.filterPopover}>
                <div className={styles.popoverHeader}>
                  <h4>Calendar Filters</h4>
                  <button
                    type="button"
                    className={styles.closePopoverBtn}
                    onClick={() => setFilterPopoverOpen(false)}
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className={styles.popoverForm}>
                  {/* Calendar Scope */}
                  <div className={styles.popoverGroup}>
                    <label className={styles.popoverLabel}>Calendar Scope</label>
                    <select
                      className={styles.popoverSelect}
                      value={queryState.scope}
                      onChange={(e) => {
                        const val = e.target.value as CalendarQueryState["scope"];
                        onUpdateQuery({ scope: val });
                      }}
                    >
                      <option value="mine">My Calendar</option>
                      <option value="team">Team Calendar</option>
                      <option value="project">Project Scope (Requires Project ID)</option>
                    </select>
                  </div>

                  {/* Project Selector */}
                  <div className={styles.popoverGroup}>
                    <label className={styles.popoverLabel}>Filter by Project</label>
                    <select
                      className={styles.popoverSelect}
                      value={queryState.project || ""}
                      onChange={(e) => {
                        const val = e.target.value || null;
                        onUpdateQuery({ project: val });
                      }}
                    >
                      <option value="">All Projects</option>
                      {projectsList.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Activity Type */}
                  <div className={styles.popoverGroup}>
                    <label className={styles.popoverLabel}>Activity Type</label>
                    <select
                      className={styles.popoverSelect}
                      value={queryState.activityType || ""}
                      onChange={(e) => {
                        const val = (e.target.value as CalendarQueryState["activityType"]) || null;
                        onUpdateQuery({ activityType: val });
                      }}
                    >
                      <option value="">All Activity Types</option>
                      <option value="site_visit">Site Visit</option>
                      <option value="client_meeting">Client Meeting</option>
                      <option value="team_meeting">Team Meeting</option>
                      <option value="inspection">Inspection</option>
                      <option value="drawing_delivery">Drawing Delivery</option>
                      <option value="approval">Approval</option>
                      <option value="payment_review">Payment Review</option>
                    </select>
                  </div>

                  {/* Visibility */}
                  <div className={styles.popoverGroup}>
                    <label className={styles.popoverLabel}>Visibility</label>
                    <select
                      className={styles.popoverSelect}
                      value={queryState.visibility || ""}
                      onChange={(e) => {
                        const val = (e.target.value as CalendarQueryState["visibility"]) || null;
                        onUpdateQuery({ visibility: val });
                      }}
                    >
                      <option value="">All Visibilities</option>
                      <option value="private">Private Only</option>
                      <option value="project">Project Only</option>
                      <option value="workspace">Workspace Shared</option>
                    </select>
                  </div>

                  {/* Include Completed */}
                  <div className={styles.popoverCheckboxGroup}>
                    <input
                      type="checkbox"
                      id="includeCompletedCheck"
                      checked={queryState.includeCompleted}
                      onChange={(e) => onUpdateQuery({ includeCompleted: e.target.checked })}
                    />
                    <label htmlFor="includeCompletedCheck">Include completed activities</label>
                  </div>

                  <div className={styles.popoverFooter}>
                    <button
                      type="button"
                      className={styles.clearFiltersBtn}
                      onClick={() =>
                        onUpdateQuery({
                          scope: "mine",
                          project: null,
                          activityType: null,
                          visibility: null,
                          includeCompleted: false,
                        })
                      }
                    >
                      Reset All Filters
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* View Switcher Tabs: Week | Month | Agenda */}
          <div className={styles.viewSegmentedControl} role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={queryState.view === "week"}
              className={`${styles.viewSegmentBtn} ${
                queryState.view === "week" ? styles.viewSegmentActive : ""
              }`}
              onClick={() => onUpdateQuery({ view: "week" })}
            >
              Week
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={queryState.view === "month"}
              className={`${styles.viewSegmentBtn} ${
                queryState.view === "month" ? styles.viewSegmentActive : ""
              }`}
              onClick={() => onUpdateQuery({ view: "month" })}
            >
              Month
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={queryState.view === "agenda"}
              className={`${styles.viewSegmentBtn} ${
                queryState.view === "agenda" ? styles.viewSegmentActive : ""
              }`}
              onClick={() => onUpdateQuery({ view: "agenda" })}
            >
              Agenda
            </button>
          </div>
        </div>
      </div>

      {/* Removable Filter Chips Bar */}
      {activeChips.length > 0 && (
        <div className={styles.chipsBar}>
          <span className={styles.chipsLabel}>Active filters:</span>
          {activeChips.map((chip) => (
            <span key={String(chip.key)} className={styles.filterChip}>
              <span>{chip.label}</span>
              <button
                type="button"
                className={styles.removeChipBtn}
                onClick={() => onUpdateQuery({ [chip.key]: null })}
                title={`Remove ${chip.label}`}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
