"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  ChevronDown,
  Building2,
  Check,
  CheckCircle2,
} from "lucide-react";
import {
  PreConstructionDuotoneIcon,
  ConstructionDuotoneIcon,
  PostConstructionDuotoneIcon,
} from "@/components/layout/sidebar-icons";
import {
  HandsProjectRecord,
  HandsLifecyclePhase,
} from "../../types/project-domain";
import {
  INITIAL_HANDS_PROJECTS,
  calculateHandsProjectsMetrics,
} from "../../mock/projects-mock-data";
import { HandsProjectCard } from "./hands-project-card";
import styles from "./hands-projects.module.css";

// Custom Kallisto Duotone Icons for Summary Cards
function ActiveProjectsIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 9.5C2 8.7 2.7 8 3.5 8H20.5C21.3 8 22 8.7 22 9.5V18C22 19.7 20.7 21 19 21H5C3.3 21 2 19.7 2 18V9.5Z" fill="currentColor" />
      <path d="M8 8V5C8 3.9 8.9 3 10 3H14C15.1 3 16 3.9 16 5V8H8Z" fill="currentColor" opacity="0.38" />
      <path d="M10 12H14" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function UpcomingIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 6H20C21.1 6 22 6.9 22 8V20C22 21.1 21.1 22 20 22H14V6Z" fill="currentColor" opacity="0.38" />
      <path d="M2 22H14V4C14 2.9 13.1 2 12 2H4C2.9 2 2 2.9 2 4V22ZM5 6H8V8H5V6ZM5 10H8V12H5V10ZM5 14H8V16H5V14ZM5 18H8V20H5V18Z" fill="currentColor" />
    </svg>
  );
}

function CompletedIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12Z" fill="currentColor" opacity="0.38" />
      <path d="M12 14C7.58 14 4 15.79 4 18V20H20V18C20 15.79 16.42 14 12 14Z" fill="currentColor" />
    </svg>
  );
}

function OverallProgressIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.18" />
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7.5 12.3L10.5 15.3L16.5 9.3" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const ALL_LOCATIONS = [
  "Bangalore, Karnataka",
  "Calicut, Kerala",
  "Kochi, Kerala",
  "Kottayam, Kerala",
  "Munnar, Kerala",
  "Thrissur, Kerala",
  "Trivandrum, Kerala",
];

const ALL_PHASES = [
  "Briefing",
  "Site verification",
  "Concept",
  "Design development",
  "Approvals",
  "BOQ and procurement",
  "Construction",
  "Handover",
  "Post-handover",
];

const ATTENTION_OPTIONS = [
  "All Status",
  "Needs Attention",
  "Overdue action",
  "Blocked",
  "Awaiting client",
];

const SORT_OPTIONS = [
  "Recently updated",
  "Progress High-Low",
  "Name A-Z",
];

export function HandsProjectsWorkspace() {
  const [projects] = useState<HandsProjectRecord[]>(INITIAL_HANDS_PROJECTS);

  // Active Section Tab State: "current" | "upcoming" | "completed" | "all"
  const [activeTab, setActiveTab] = useState<"current" | "upcoming" | "completed" | "all">("all");

  // Floating Popover active state
  const [activePopover, setActivePopover] = useState<"phase" | "attention" | "location" | "sort" | null>(null);

  // Popover filter values
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);
  const [selectedAttention, setSelectedAttention] = useState<string>("All Status");
  const [selectedSort, setSelectedSort] = useState<string>("Recently updated");
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [appliedLocations, setAppliedLocations] = useState<string[]>([]);
  const [locationSearch, setLocationSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Outside click listener to close popovers when clicking outside dropdown anchor
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      if (target && !target.closest(`.${styles.popoverAnchor}`)) {
        setActivePopover(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Summary Metrics
  const metrics = useMemo(() => {
    return calculateHandsProjectsMetrics(projects);
  }, [projects]);

  // Section Tab Counts
  const tabCounts = useMemo(() => {
    return {
      current: projects.filter((p) => p.status === "active").length,
      upcoming: projects.filter((p) => p.status === "upcoming").length,
      completed: projects.filter((p) => p.status === "completed").length,
    };
  }, [projects]);

  // Filtered Projects List
  const filteredProjects = useMemo(() => {
    let list = projects.filter((p) => {
      // 0. Section Tab Filter
      if (activeTab === "current") {
        if (p.status !== "active") return false;
      } else if (activeTab === "upcoming") {
        if (p.status !== "upcoming") return false;
      } else if (activeTab === "completed") {
        if (p.status !== "completed") return false;
      }

      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = p.projectName.toLowerCase().includes(q);
        const matchesClient = p.clientName.toLowerCase().includes(q);
        const matchesLoc = p.location.toLowerCase().includes(q);
        if (!matchesName && !matchesClient && !matchesLoc) return false;
      }

      // 2. Location Checkbox Filter
      if (appliedLocations.length > 0) {
        const matchesLoc = appliedLocations.some((loc) => {
          const cityOnly = loc.split(",")[0].trim().toLowerCase();
          return p.location.toLowerCase().includes(cityOnly);
        });
        if (!matchesLoc) return false;
      }

      // 3. Attention Filter
      if (selectedAttention === "Needs Attention") {
        if (p.health !== "at_risk" && p.attendance.absent === 0) {
          return false;
        }
      }

      return true;
    });

    // Sorting
    if (selectedSort === "Progress High-Low") {
      list = [...list].sort((a, b) => {
        const aPct = a.currentDay / a.totalDays;
        const bPct = b.currentDay / b.totalDays;
        return bPct - aPct;
      });
    } else if (selectedSort === "Name A-Z") {
      list = [...list].sort((a, b) => a.projectName.localeCompare(b.projectName));
    }

    return list;
  }, [projects, activeTab, searchQuery, appliedLocations, selectedAttention, selectedSort]);

  const filteredLocationOptions = useMemo(() => {
    if (!locationSearch.trim()) return ALL_LOCATIONS;
    return ALL_LOCATIONS.filter((loc) =>
      loc.toLowerCase().includes(locationSearch.toLowerCase().trim())
    );
  }, [locationSearch]);

  const toggleLocationSelection = (loc: string) => {
    setSelectedLocations((prev) =>
      prev.includes(loc) ? prev.filter((item) => item !== loc) : [...prev, loc]
    );
  };

  const handleApplyLocations = () => {
    setAppliedLocations(selectedLocations);
    setActivePopover(null);
  };

  const handleClearLocations = () => {
    setSelectedLocations([]);
    setAppliedLocations([]);
    setActivePopover(null);
  };

  return (
    <div className={styles.workspace}>
      {/* 1. Page Header (Matching Reference Image) */}
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Projects</h1>
          <p className={styles.pageDescription}>
            Manage active, upcoming, on hold and completed work across your practice.
          </p>
        </div>
        <div className={styles.headerSearchWrap}>
          <Search size={15} className={styles.headerSearchIcon} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search project, client or code..."
            className={styles.headerSearchInput}
          />
        </div>
      </header>

      {/* 2. 4 Summary KPI Cards Grid */}
      <section className={styles.summaryGrid} aria-label="Operational Summary">
        <div className={styles.summaryCard}>
          <div className={styles.summaryIconBox} style={{ backgroundColor: "#f1f5f9", color: "#0f172a" }}>
            <ActiveProjectsIcon size={18} />
          </div>
          <div className={styles.summaryTexts}>
            <span className={styles.summaryValue}>{metrics.activeProjects}</span>
            <span className={styles.summaryLabel}>Active Projects</span>
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryIconBox} style={{ backgroundColor: "#ecfdf5", color: "#059669" }}>
            <UpcomingIcon size={18} />
          </div>
          <div className={styles.summaryTexts}>
            <span className={styles.summaryValue}>{metrics.upcomingProjects}</span>
            <span className={styles.summaryLabel}>Upcoming</span>
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryIconBox} style={{ backgroundColor: "#f5f3ff", color: "#7c3aed" }}>
            <CompletedIcon size={18} />
          </div>
          <div className={styles.summaryTexts}>
            <span className={styles.summaryValue}>{metrics.completedProjects}</span>
            <span className={styles.summaryLabel}>Completed</span>
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryIconBox} style={{ backgroundColor: "#ecfdf5", color: "#059669" }}>
            <OverallProgressIcon size={18} />
          </div>
          <div className={styles.summaryTexts}>
            <span className={styles.summaryValue}>{metrics.overallProgress}</span>
            <span className={styles.summaryLabel}>Overall Progress</span>
          </div>
        </div>
      </section>

      {/* 3. Section Tabs Navigation Bar (Current Projects, Upcoming, Completed) */}
      <nav className={styles.tabsNav} role="tablist" aria-label="Project Status Tabs">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "current"}
          className={`${styles.tabBtn} ${activeTab === "current" ? styles.tabBtnActive : ""}`}
          onClick={() => setActiveTab(activeTab === "current" ? "all" : "current")}
        >
          <ActiveProjectsIcon size={15} />
          <span>Current Projects</span>
          <span className={styles.tabCount}>{tabCounts.current}</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "upcoming"}
          className={`${styles.tabBtn} ${activeTab === "upcoming" ? styles.tabBtnActive : ""}`}
          onClick={() => setActiveTab(activeTab === "upcoming" ? "all" : "upcoming")}
        >
          <UpcomingIcon size={15} />
          <span>Upcoming</span>
          <span className={styles.tabCount}>{tabCounts.upcoming}</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "completed"}
          className={`${styles.tabBtn} ${activeTab === "completed" ? styles.tabBtnActive : ""}`}
          onClick={() => setActiveTab(activeTab === "completed" ? "all" : "completed")}
        >
          <CompletedIcon size={15} />
          <span>Completed</span>
          <span className={styles.tabCount}>{tabCounts.completed}</span>
        </button>
      </nav>

      {/* 3. Floating Dropdown Filter Bar */}
      <div className={styles.topFilterBar} role="search" aria-label="Projects filters">
        <div className={styles.filterPillGroup}>
          {/* 1. Project Phase Dropdown */}
          <div className={styles.popoverAnchor}>
            <button
              type="button"
              className={`${styles.filterPillBtn} ${activePopover === "phase" ? styles.filterPillBtnActive : ""}`}
              onClick={() => setActivePopover(activePopover === "phase" ? null : "phase")}
            >
              <span>{selectedPhase || "Project Phase"}</span>
              <ChevronDown size={14} color="#475569" />
            </button>

            {activePopover === "phase" && (
              <div className={styles.popoverDropdownCard}>
                <div className={styles.popoverMenuList}>
                  {ALL_PHASES.map((phase) => (
                    <button
                      key={phase}
                      type="button"
                      className={`${styles.popoverMenuItem} ${selectedPhase === phase ? styles.popoverMenuItemActive : ""}`}
                      onClick={() => {
                        setSelectedPhase(selectedPhase === phase ? null : phase);
                        setActivePopover(null);
                      }}
                    >
                      <span>{phase}</span>
                      {selectedPhase === phase && <Check size={14} color="#0f172a" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 2. Needs Attention Dropdown */}
          <div className={styles.popoverAnchor}>
            <button
              type="button"
              className={`${styles.filterPillBtn} ${activePopover === "attention" ? styles.filterPillBtnActive : ""}`}
              onClick={() => setActivePopover(activePopover === "attention" ? null : "attention")}
            >
              <span>{selectedAttention}</span>
              <ChevronDown size={14} color="#475569" />
            </button>

            {activePopover === "attention" && (
              <div className={styles.popoverDropdownCard}>
                <div className={styles.popoverMenuList}>
                  {ATTENTION_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      className={`${styles.popoverMenuItem} ${selectedAttention === opt ? styles.popoverMenuItemActive : ""}`}
                      onClick={() => {
                        setSelectedAttention(opt);
                        setActivePopover(null);
                      }}
                    >
                      <span>{opt}</span>
                      {selectedAttention === opt && <Check size={14} color="#0f172a" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3. Location Checkbox Dropdown */}
          <div className={styles.popoverAnchor}>
            <button
              type="button"
              className={`${styles.filterPillBtn} ${activePopover === "location" || appliedLocations.length > 0 ? styles.filterPillBtnActive : ""}`}
              onClick={() => setActivePopover(activePopover === "location" ? null : "location")}
            >
              <span>
                {appliedLocations.length === 1
                  ? appliedLocations[0].split(",")[0]
                  : appliedLocations.length > 1
                  ? `Location (${appliedLocations.length})`
                  : "Location"}
              </span>
              <ChevronDown size={14} color="#475569" />
            </button>

            {activePopover === "location" && (
              <div className={`${styles.popoverDropdownCard} ${styles.locationPopoverCard}`}>
                <div className={styles.popoverSearchBox}>
                  <Search size={14} className={styles.popoverSearchIcon} />
                  <input
                    type="text"
                    value={locationSearch}
                    onChange={(e) => setLocationSearch(e.target.value)}
                    placeholder="Search city or district"
                    className={styles.popoverInput}
                    autoFocus
                  />
                </div>

                <div className={styles.popoverCheckboxList}>
                  {filteredLocationOptions.map((loc) => (
                    <label key={loc} className={styles.popoverCheckboxRow}>
                      <input
                        type="checkbox"
                        checked={selectedLocations.includes(loc)}
                        onChange={() => toggleLocationSelection(loc)}
                        className={styles.checkboxInput}
                      />
                      <span>{loc}</span>
                    </label>
                  ))}
                </div>

                <div className={styles.popoverDivider} />

                <div className={styles.popoverFooterRow}>
                  <button type="button" className={styles.clearTextBtn} onClick={handleClearLocations}>
                    Clear
                  </button>
                  <button type="button" className={styles.applyBtn} onClick={handleApplyLocations}>
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 4. Recently Updated Dropdown */}
          <div className={styles.popoverAnchor}>
            <button
              type="button"
              className={`${styles.filterPillBtn} ${activePopover === "sort" ? styles.filterPillBtnActive : ""}`}
              onClick={() => setActivePopover(activePopover === "sort" ? null : "sort")}
            >
              <span>{selectedSort}</span>
              <ChevronDown size={14} color="#475569" />
            </button>

            {activePopover === "sort" && (
              <div className={styles.popoverDropdownCard}>
                <div className={styles.popoverMenuList}>
                  {SORT_OPTIONS.map((sortOpt) => (
                    <button
                      key={sortOpt}
                      type="button"
                      className={`${styles.popoverMenuItem} ${selectedSort === sortOpt ? styles.popoverMenuItemActive : ""}`}
                      onClick={() => {
                        setSelectedSort(sortOpt);
                        setActivePopover(null);
                      }}
                    >
                      <span>{sortOpt}</span>
                      {selectedSort === sortOpt && <Check size={14} color="#0f172a" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={styles.searchWrap}>
          <Search size={13} className={styles.searchIcon} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects..."
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* 4. 4-Column Projects Cards Grid */}
      {filteredProjects.length > 0 ? (
        <main className={styles.projectsGrid}>
          {filteredProjects.map((project) => (
            <HandsProjectCard
              key={project.id}
              project={project}
            />
          ))}
        </main>
      ) : (
        <div className={styles.emptyState}>
          <Building2 size={36} color="#94a3b8" />
          <div className={styles.emptyTitle}>No projects found</div>
          <div className={styles.emptySub}>
            Try changing filter options or clearing search terms to view active projects.
          </div>
        </div>
      )}
    </div>
  );
}
