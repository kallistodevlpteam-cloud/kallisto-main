"use client";

import { useMemo, useState } from "react";
import {
  AlertOctagon,
  CheckCircle2,
  ClockAlert,
  Search,
  ShieldAlert,
  TriangleAlert,
} from "lucide-react";
import { SiteDay, SiteIssue } from "../types/site.types";
import { formatIssueStatus } from "../utils/site-formatters";
import { getIssueSeverityTone } from "../utils/site-status";
import { SiteDataColumn, SiteDataTable } from "./site-data-table";
import { SiteEmptyState } from "./site-empty-state";
import { SiteFilterToolbar } from "./site-filter-toolbar";
import { SiteSectionHeader } from "./site-section-header";
import { SiteBadgeTone, SiteStatusBadge } from "./site-status-badge";
import { SiteSummaryStrip } from "./site-summary-strip";
import styles from "./project-site-workspace.module.css";

type IssueView = "all" | "open" | "in_progress" | "blocked" | "resolved";

interface IssuesViewProps {
  siteDay: SiteDay;
  onAction: (message: string) => void;
}

function severityTone(issue: SiteIssue): SiteBadgeTone {
  return getIssueSeverityTone(issue.severity);
}

function issueStatusTone(status: SiteIssue["status"]): SiteBadgeTone {
  if (status === "resolved") return "success";
  if (status === "blocked") return "danger";
  if (status === "in_progress" || status === "under_review") return "active";
  if (status === "supplier_follow_up") return "warning";
  return "neutral";
}

export function IssuesView({ siteDay, onAction }: IssuesViewProps) {
  const [view, setView] = useState<IssueView>("all");
  const [severity, setSeverity] = useState("all");
  const [owner, setOwner] = useState("all");
  const [location, setLocation] = useState("all");
  const [activity, setActivity] = useState("all");
  const [search, setSearch] = useState("");

  const records = useMemo(() => {
    const query = search.trim().toLowerCase();
    return siteDay.issues.filter((issue) => {
      if (query && !issue.title.toLowerCase().includes(query)) return false;
      if (severity !== "all" && issue.severity !== severity) return false;
      if (owner !== "all" && issue.ownerName !== owner) return false;
      if (location !== "all" && issue.location !== location) return false;
      if (activity !== "all" && issue.linkedActivityTitle !== activity) return false;
      if (view === "open") return issue.status === "open";
      if (view === "in_progress") {
        return issue.status === "in_progress" || issue.status === "under_review";
      }
      if (view === "blocked") return issue.status === "blocked";
      if (view === "resolved") return issue.status === "resolved";
      return true;
    });
  }, [activity, location, owner, search, severity, siteDay.issues, view]);

  const columns: Array<SiteDataColumn<SiteIssue>> = [
    {
      id: "issue",
      label: "Issue",
      priority: "primary",
      render: (issue) => (
        <span className={styles.tablePrimaryCell}>
          <strong>{issue.title}</strong>
          <small>{issue.linkedActivityTitle}</small>
        </span>
      ),
    },
    {
      id: "severity",
      label: "Severity",
      render: (issue) => (
        <SiteStatusBadge label={issue.severity} tone={severityTone(issue)} />
      ),
    },
    { id: "location", label: "Location", render: (issue) => issue.location },
    { id: "owner", label: "Owner", render: (issue) => issue.ownerName },
    {
      id: "raised",
      label: "Raised date",
      render: (issue) => issue.raisedDateLabel,
    },
    { id: "due", label: "Due date", render: (issue) => issue.dueDateLabel },
    {
      id: "status",
      label: "Status",
      render: (issue) => (
        <SiteStatusBadge
          label={formatIssueStatus(issue.status)}
          tone={issueStatusTone(issue.status)}
        />
      ),
    },
  ];

  const openCount = siteDay.issues.filter((issue) => issue.status !== "resolved").length;
  const criticalCount = siteDay.issues.filter(
    (issue) => issue.severity === "critical",
  ).length;

  return (
    <div className={styles.siteSectionView}>
      <SiteSectionHeader
        title="Issue Register"
        description="Field issues affecting quality, safety, cost or schedule."
        meta={`${openCount} active`}
      />

      <SiteSummaryStrip
        ariaLabel="Issue summary"
        metrics={[
          {
            id: "open",
            label: "Open",
            value: String(openCount),
            detail: "Requires ownership",
            icon: TriangleAlert,
            tone: "warning",
          },
          {
            id: "critical",
            label: "Critical",
            value: String(criticalCount),
            detail: "Immediate action",
            icon: AlertOctagon,
            tone: criticalCount > 0 ? "danger" : "neutral",
          },
          {
            id: "overdue",
            label: "Overdue",
            value: "0",
            detail: "Past due date",
            icon: ClockAlert,
          },
          {
            id: "resolved",
            label: "Resolved this week",
            value: "0",
            detail: "Closed issues",
            icon: CheckCircle2,
            tone: "success",
          },
        ]}
      />

      <SiteFilterToolbar
        label="Issues"
        views={[
          { id: "all", label: "All", count: siteDay.issues.length },
          {
            id: "open",
            label: "Open",
            count: siteDay.issues.filter((issue) => issue.status === "open").length,
          },
          {
            id: "in_progress",
            label: "In progress",
            count: siteDay.issues.filter(
              (issue) =>
                issue.status === "in_progress" || issue.status === "under_review",
            ).length,
          },
          { id: "blocked", label: "Blocked", count: 0 },
          { id: "resolved", label: "Resolved", count: 0 },
        ]}
        activeView={view}
        onViewChange={(nextView) => setView(nextView as IssueView)}
      >
        <label className={styles.filterSearch}>
          <Search size={14} aria-hidden="true" />
          <span className="sr-only">Search issues</span>
          <input
            type="search"
            placeholder="Search issues"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <select
          aria-label="Issue severity"
          value={severity}
          onChange={(event) => setSeverity(event.target.value)}
        >
          <option value="all">All severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select
          aria-label="Issue owner"
          value={owner}
          onChange={(event) => setOwner(event.target.value)}
        >
          <option value="all">All owners</option>
          {Array.from(new Set(siteDay.issues.map((issue) => issue.ownerName))).map(
            (ownerName) => (
              <option key={ownerName} value={ownerName}>
                {ownerName}
              </option>
            ),
          )}
        </select>
        <select
          aria-label="Site location"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
        >
          <option value="all">All locations</option>
          {Array.from(new Set(siteDay.issues.map((issue) => issue.location))).map(
            (siteLocation) => (
              <option key={siteLocation} value={siteLocation}>
                {siteLocation}
              </option>
            ),
          )}
        </select>
        <select
          aria-label="Linked activity"
          value={activity}
          onChange={(event) => setActivity(event.target.value)}
        >
          <option value="all">All activities</option>
          {Array.from(
            new Set(siteDay.issues.map((issue) => issue.linkedActivityTitle)),
          ).map((activityTitle) => (
            <option key={activityTitle} value={activityTitle}>
              {activityTitle}
            </option>
          ))}
        </select>
        <input className={styles.filterDate} aria-label="Issue date" type="date" />
      </SiteFilterToolbar>

      {records.length > 0 ? (
        <SiteDataTable
          caption="Project site issues"
          columns={columns}
          records={records}
        />
      ) : (
        <SiteEmptyState
          icon={siteDay.issues.length === 0 ? ShieldAlert : Search}
          title={
            siteDay.issues.length === 0
              ? "No site issues reported"
              : "No issues match these filters"
          }
          description={
            siteDay.issues.length === 0
              ? "Issues affecting quality, safety, cost or schedule will appear here."
              : "Adjust the status or field filters to review another issue set."
          }
          primaryActionLabel={
            siteDay.issues.length === 0 ? "Report Issue" : undefined
          }
          onPrimaryAction={
            siteDay.issues.length === 0
              ? () => onAction("Issue reporting opened in mock mode.")
              : undefined
          }
          presentation="compact"
        />
      )}
    </div>
  );
}
