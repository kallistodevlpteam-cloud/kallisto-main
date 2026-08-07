"use client";

import { useMemo, useState } from "react";
import {
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Search,
  TriangleAlert,
} from "lucide-react";
import { SiteDay, SiteInspection } from "../types/site.types";
import { SiteDataColumn, SiteDataTable } from "./site-data-table";
import { SiteEmptyState } from "./site-empty-state";
import { SiteFilterToolbar } from "./site-filter-toolbar";
import { SiteSectionHeader } from "./site-section-header";
import { SiteStatusBadge, SiteBadgeTone } from "./site-status-badge";
import { SiteSummaryStrip } from "./site-summary-strip";
import styles from "./project-site-workspace.module.css";

type InspectionView = "all" | "due" | "upcoming" | "completed" | "failed";

interface InspectionsViewProps {
  siteDay: SiteDay;
  onAction: (message: string) => void;
}

function inspectionTone(status: SiteInspection["status"]): SiteBadgeTone {
  if (status === "due" || status === "awaiting_approval") return "warning";
  if (status === "failed") return "danger";
  if (status === "passed") return "success";
  if (status === "in_progress") return "active";
  return "neutral";
}

function inspectionLabel(status: SiteInspection["status"]): string {
  const labels: Record<SiteInspection["status"], string> = {
    due: "Due",
    scheduled: "Scheduled",
    in_progress: "In progress",
    awaiting_approval: "Awaiting approval",
    passed: "Passed",
    failed: "Failed",
    cancelled: "Cancelled",
  };
  return labels[status];
}

export function InspectionsView({ siteDay, onAction }: InspectionsViewProps) {
  const [view, setView] = useState<InspectionView>("all");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [inspectorFilter, setInspectorFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const records = useMemo(() => {
    const query = search.trim().toLowerCase();
    return siteDay.inspections.filter((inspection) => {
      if (
        query &&
        !`${inspection.title} ${inspection.relatedActivityTitle} ${inspection.inspectorName}`
          .toLowerCase()
          .includes(query)
      ) {
        return false;
      }
      if (typeFilter !== "all" && inspection.inspectionType !== typeFilter) {
        return false;
      }
      if (inspectorFilter !== "all" && inspection.inspectorName !== inspectorFilter) {
        return false;
      }
      if (statusFilter !== "all" && inspection.status !== statusFilter) {
        return false;
      }
      if (view === "due") return inspection.status === "due";
      if (view === "upcoming") return inspection.status === "scheduled";
      if (view === "completed") return inspection.status === "passed";
      if (view === "failed") return inspection.status === "failed";
      return true;
    });
  }, [
    inspectorFilter,
    search,
    siteDay.inspections,
    statusFilter,
    typeFilter,
    view,
  ]);

  const columns: Array<SiteDataColumn<SiteInspection>> = [
    {
      id: "inspection",
      label: "Inspection",
      priority: "primary",
      render: (inspection) => (
        <span className={styles.tablePrimaryCell}>
          <strong>{inspection.title}</strong>
          <small>{inspection.inspectionType}</small>
        </span>
      ),
    },
    {
      id: "activity",
      label: "Related activity",
      render: (inspection) => inspection.relatedActivityTitle,
    },
    {
      id: "schedule",
      label: "Scheduled time",
      render: (inspection) => inspection.scheduledLabel,
    },
    {
      id: "inspector",
      label: "Inspector",
      render: (inspection) => inspection.inspectorName,
    },
    {
      id: "evidence",
      label: "Evidence",
      render: (inspection) => `${inspection.evidenceIds.length} evidence`,
    },
    {
      id: "status",
      label: "Result / status",
      render: (inspection) => (
        <SiteStatusBadge
          label={inspectionLabel(inspection.status)}
          tone={inspectionTone(inspection.status)}
        />
      ),
    },
  ];

  const dueCount = siteDay.inspections.filter(
    (inspection) => inspection.status === "due",
  ).length;
  const upcomingCount = siteDay.inspections.filter(
    (inspection) => inspection.status === "scheduled",
  ).length;

  return (
    <div className={styles.siteSectionView}>
      <SiteSectionHeader
        title="Inspection Register"
        description="Quality, safety and milestone controls linked to site activities."
        meta={`${siteDay.inspections.length} inspections`}
      />

      <SiteSummaryStrip
        ariaLabel="Inspection summary"
        metrics={[
          {
            id: "due",
            label: "Due today",
            value: String(dueCount),
            detail: "Requires action",
            icon: Clock3,
            tone: "warning",
          },
          {
            id: "upcoming",
            label: "Upcoming",
            value: String(upcomingCount),
            detail: "Next 7 days",
            icon: CalendarClock,
          },
          {
            id: "approval",
            label: "Awaiting approval",
            value: "0",
            detail: "Pending decision",
            icon: ClipboardCheck,
          },
          {
            id: "failed",
            label: "Failed",
            value: "0",
            detail: "Open correction",
            icon: TriangleAlert,
            tone: "danger",
          },
        ]}
      />

      <SiteFilterToolbar
        label="Inspections"
        views={[
          { id: "all", label: "All", count: siteDay.inspections.length },
          { id: "due", label: "Due", count: dueCount },
          { id: "upcoming", label: "Upcoming", count: upcomingCount },
          { id: "completed", label: "Completed", count: 0 },
          { id: "failed", label: "Failed", count: 0 },
        ]}
        activeView={view}
        onViewChange={(nextView) => setView(nextView as InspectionView)}
      >
        <label className={styles.filterSearch}>
          <Search size={14} aria-hidden="true" />
          <span className="sr-only">Search inspections</span>
          <input
            type="search"
            placeholder="Search inspections"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <select
          aria-label="Inspection type"
          value={typeFilter}
          onChange={(event) => setTypeFilter(event.target.value)}
        >
          <option value="all">All types</option>
          <option value="quality">Quality</option>
          <option value="safety">Safety</option>
          <option value="milestone">Milestone</option>
        </select>
        <select
          aria-label="Inspector"
          value={inspectorFilter}
          onChange={(event) => setInspectorFilter(event.target.value)}
        >
          <option value="all">All inspectors</option>
          {Array.from(
            new Set(siteDay.inspections.map((inspection) => inspection.inspectorName)),
          ).map((inspector) => (
            <option key={inspector} value={inspector}>
              {inspector}
            </option>
          ))}
        </select>
        <input className={styles.filterDate} aria-label="Inspection date" type="date" />
        <select
          aria-label="Inspection status"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="all">All statuses</option>
          <option value="due">Due</option>
          <option value="scheduled">Scheduled</option>
          <option value="passed">Passed</option>
          <option value="failed">Failed</option>
        </select>
      </SiteFilterToolbar>

      {records.length > 0 ? (
        <SiteDataTable
          caption="Project site inspections"
          columns={columns}
          records={records}
        />
      ) : (
        <SiteEmptyState
          icon={records.length === 0 && siteDay.inspections.length === 0 ? ClipboardCheck : CheckCircle2}
          title={
            siteDay.inspections.length === 0
              ? "No inspections have been created"
              : "No inspections match these filters"
          }
          description={
            siteDay.inspections.length === 0
              ? "Schedule quality, safety or milestone inspections linked to site activities."
              : "Adjust the view or filters to review another inspection set."
          }
          primaryActionLabel={
            siteDay.inspections.length === 0 ? "Schedule Inspection" : undefined
          }
          onPrimaryAction={
            siteDay.inspections.length === 0
              ? () => onAction("Inspection scheduling opened in mock mode.")
              : undefined
          }
          presentation="compact"
        />
      )}
    </div>
  );
}
