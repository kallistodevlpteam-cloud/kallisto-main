"use client";

import React, { useState, useMemo } from "react";
import {
  Plus,
  Search,
  ChevronDown,
  Building2,
  Users,
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
} from "lucide-react";
import {
  TeamDuotoneIcon,
  DocumentsDuotoneIcon,
  ProjectsDuotoneIcon,
  AnalyticsDuotoneIcon,
  ShieldDuotoneIcon,
  EnquiriesDuotoneIcon,
} from "@/components/layout/sidebar-icons";
import {
  AssignmentDeployment,
  AssignmentHealth,
} from "../../types/assignment-domain";
import {
  INITIAL_ASSIGNMENTS,
  calculateAssignmentMetrics,
} from "../../mock/assignments-mock-data";
import { HandsAssignmentCard } from "./hands-assignment-card";
import { HandsAssignmentDrawer } from "./hands-assignment-drawer";
import styles from "./hands-assignments.module.css";

export function HandsAssignmentsWorkspace() {
  const [assignments, setAssignments] = useState<AssignmentDeployment[]>(INITIAL_ASSIGNMENTS);
  const [selectedHealthTab, setSelectedHealthTab] = useState<AssignmentHealth | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrade, setSelectedTrade] = useState("All");
  const [selectedSort, setSelectedSort] = useState("default");

  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentDeployment | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Derived Summary Metrics
  const metrics = useMemo(() => {
    return calculateAssignmentMetrics(assignments);
  }, [assignments]);

  // Tab counts
  const tabCounts = useMemo(() => {
    return {
      all: assignments.length,
      on_track: assignments.filter((a) => a.health === "on_track").length,
      attention_required: assignments.filter((a) => a.health === "attention_required").length,
      at_risk: assignments.filter((a) => a.health === "at_risk").length,
    };
  }, [assignments]);

  // Filtered assignments
  const filteredAssignments = useMemo(() => {
    return assignments.filter((assignment) => {
      // 1. Health tab filter
      if (selectedHealthTab !== "all" && assignment.health !== selectedHealthTab) {
        return false;
      }

      // 2. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesProject = assignment.projectName.toLowerCase().includes(q);
        const matchesLocation = assignment.location.toLowerCase().includes(q);
        const matchesClient = assignment.clientName.toLowerCase().includes(q);
        const matchesTrades = assignment.tradesBreakdown.toLowerCase().includes(q);
        const matchesSupervisor = assignment.supervisor.name.toLowerCase().includes(q);

        if (!matchesProject && !matchesLocation && !matchesClient && !matchesTrades && !matchesSupervisor) {
          return false;
        }
      }

      // 3. Trade filter
      if (selectedTrade !== "All") {
        if (!assignment.tradesBreakdown.toLowerCase().includes(selectedTrade.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }, [assignments, selectedHealthTab, searchQuery, selectedTrade]);

  const handleOpenDetail = (assignment: AssignmentDeployment) => {
    setSelectedAssignment(assignment);
    setIsDrawerOpen(true);
  };

  return (
    <div className={styles.workspace}>
      {/* 1. Header Row (Title, Subtitle & + Assign Crew Button) */}
      <header className={styles.pageHeader}>
        <div>
          <div className={styles.titleRow}>
            <h1 className={styles.pageTitle}>Assignments</h1>
            <span className={styles.pageTitleSub}>· Live Deployments & Crew Allocations</span>
          </div>
          <p className={styles.pageDescription}>
            Active project site allocations, team lead assignments, shift timelines, and supervisor check-ins.
          </p>
        </div>

        <button
          type="button"
          className={styles.primaryActionBtn}
          onClick={() => {
            alert("New Crew Assignment flow ready. Select project to allocate crew.");
          }}
          aria-label="Assign Crew"
        >
          <Plus size={15} />
          <span>Assign Crew</span>
        </button>
      </header>

      {/* 2. Top Telemetry & Filters Bar */}
      <div className={styles.telemetryBarContainer} role="search" aria-label="Assignments search and filters">
        <div className={styles.telemetryStrip}>
          <div className={styles.telemetryLeft}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
              <strong style={{ color: "#0f172a", fontWeight: 700 }}>{metrics.activeDeployments}</strong>
              <span>Active Deployments</span>
            </span>
            <span className={styles.telemetryDot}>·</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
              <strong style={{ color: "#059669", fontWeight: 700 }}>{metrics.sitesCovered}</strong>
              <span>Sites Covered</span>
            </span>
            <span className={styles.telemetryDot}>·</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
              <strong style={{ color: "#2563eb", fontWeight: 700 }}>{metrics.shiftCompletion}</strong>
              <span>Shift Completion</span>
            </span>
          </div>

          <div className={styles.liveBadge}>
            <span className={styles.liveDot} />
            <span>Live</span>
          </div>
        </div>

        <div className={styles.filterControlsGroup}>
          <div className={styles.searchWrap}>
            <Search size={13} className={styles.searchIcon} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search assignments, projects..."
              className={styles.searchInput}
            />
          </div>

          <button
            type="button"
            className={styles.filterPillBtn}
            onClick={() => {
              const trades = ["All", "Masons", "Electricians", "Plumbers", "Carpenters", "Painters"];
              const currentIdx = trades.indexOf(selectedTrade);
              const nextTrade = trades[(currentIdx + 1) % trades.length];
              setSelectedTrade(nextTrade);
            }}
          >
            <span>{selectedTrade === "All" ? "Trade" : selectedTrade}</span>
            <ChevronDown size={12} color="#64748b" />
          </button>

          <button
            type="button"
            className={styles.filterPillBtn}
            onClick={() => {
              const sorts = ["default", "workers_desc", "duration_desc"];
              const nextSort = sorts[(sorts.indexOf(selectedSort) + 1) % sorts.length];
              setSelectedSort(nextSort);
            }}
          >
            <span>Sort</span>
            <ChevronDown size={12} color="#64748b" />
          </button>
        </div>
      </div>

      {/* 3. Operational 4-Card Summary Grid */}
      <section className={styles.summaryGrid} aria-label="Operational Summary">
        {/* Card 1: Active Deployments */}
        <div className={styles.summaryCard}>
          <div className={styles.summaryIconBox} style={{ backgroundColor: "#eff6ff", color: "#2563eb" }}>
            <Briefcase size={18} />
          </div>
          <div className={styles.summaryTexts}>
            <span className={styles.summaryValue}>{metrics.activeDeployments}</span>
            <span className={styles.summaryLabel}>Active Deployments</span>
          </div>
        </div>

        {/* Card 2: Sites Covered */}
        <div className={styles.summaryCard}>
          <div className={styles.summaryIconBox} style={{ backgroundColor: "#ecfdf5", color: "#059669" }}>
            <Building2 size={18} />
          </div>
          <div className={styles.summaryTexts}>
            <span className={styles.summaryValue}>{metrics.sitesCovered}</span>
            <span className={styles.summaryLabel}>Sites Covered</span>
          </div>
        </div>

        {/* Card 3: Deployed Crew */}
        <div className={styles.summaryCard}>
          <div className={styles.summaryIconBox} style={{ backgroundColor: "#f5f3ff", color: "#7c3aed" }}>
            <Users size={18} />
          </div>
          <div className={styles.summaryTexts}>
            <span className={styles.summaryValue}>{metrics.deployedCrew}</span>
            <span className={styles.summaryLabel}>Deployed Crew</span>
          </div>
        </div>

        {/* Card 4: Shift Completion */}
        <div className={styles.summaryCard}>
          <div className={styles.summaryIconBox} style={{ backgroundColor: "#ecfdf5", color: "#059669" }}>
            <CheckCircle2 size={18} />
          </div>
          <div className={styles.summaryTexts}>
            <span className={styles.summaryValue}>{metrics.shiftCompletion}</span>
            <span className={styles.summaryLabel}>Shift Completion</span>
          </div>
        </div>
      </section>

      {/* 4. Assignment Health Filter Tabs */}
      <div className={styles.segmentedTabsContainer} role="tablist" aria-label="Assignment Health Navigation">
        <button
          type="button"
          className={`${styles.segmentedTabBtn} ${selectedHealthTab === "all" ? styles.segmentedTabBtnActive : ""}`}
          onClick={() => setSelectedHealthTab("all")}
          role="tab"
          aria-selected={selectedHealthTab === "all"}
        >
          <ProjectsDuotoneIcon size={14} style={{ color: selectedHealthTab === "all" ? "#2563eb" : "#94a3b8" }} />
          <span>All Deployments</span>
          <span className={`${styles.tabCount} ${selectedHealthTab === "all" ? styles.tabCountActive : ""}`}>
            {tabCounts.all}
          </span>
        </button>

        <button
          type="button"
          className={`${styles.segmentedTabBtn} ${selectedHealthTab === "on_track" ? styles.segmentedTabBtnActive : ""}`}
          onClick={() => setSelectedHealthTab("on_track")}
          role="tab"
          aria-selected={selectedHealthTab === "on_track"}
        >
          <ShieldDuotoneIcon size={14} style={{ color: selectedHealthTab === "on_track" ? "#059669" : "#94a3b8" }} />
          <span>On Track</span>
          <span className={`${styles.tabCount} ${selectedHealthTab === "on_track" ? styles.tabCountActive : ""}`}>
            {tabCounts.on_track}
          </span>
        </button>

        <button
          type="button"
          className={`${styles.segmentedTabBtn} ${selectedHealthTab === "attention_required" ? styles.segmentedTabBtnActive : ""}`}
          onClick={() => setSelectedHealthTab("attention_required")}
          role="tab"
          aria-selected={selectedHealthTab === "attention_required"}
        >
          <AlertTriangle size={14} style={{ color: selectedHealthTab === "attention_required" ? "#d97706" : "#94a3b8" }} />
          <span>Attention Required</span>
          <span className={`${styles.tabCount} ${selectedHealthTab === "attention_required" ? styles.tabCountActive : ""}`}>
            {tabCounts.attention_required}
          </span>
        </button>

        <button
          type="button"
          className={`${styles.segmentedTabBtn} ${selectedHealthTab === "at_risk" ? styles.segmentedTabBtnActive : ""}`}
          onClick={() => setSelectedHealthTab("at_risk")}
          role="tab"
          aria-selected={selectedHealthTab === "at_risk"}
        >
          <AlertCircle size={14} style={{ color: selectedHealthTab === "at_risk" ? "#dc2626" : "#94a3b8" }} />
          <span>At Risk</span>
          <span className={`${styles.tabCount} ${selectedHealthTab === "at_risk" ? styles.tabCountActive : ""}`}>
            {tabCounts.at_risk}
          </span>
        </button>
      </div>

      {/* 5. Assignment Cards Grid */}
      <div className={styles.assignmentsGrid}>
        {filteredAssignments.map((assignment) => (
          <HandsAssignmentCard
            key={assignment.id}
            assignment={assignment}
            isSelected={selectedAssignment?.id === assignment.id}
            onSelect={(a) => setSelectedAssignment(a)}
            onOpenDetail={handleOpenDetail}
          />
        ))}
      </div>

      {/* 6. Assignment Detail Drawer */}
      <HandsAssignmentDrawer
        assignment={selectedAssignment}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
}
