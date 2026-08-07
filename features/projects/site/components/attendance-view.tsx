"use client";

import { useMemo, useState } from "react";
import {
  LogOut,
  Search,
  UserMinus,
  Users,
  UserRoundCheck,
} from "lucide-react";
import { SiteAttendanceWorker, SiteDay } from "../types/site.types";
import { SiteDataColumn, SiteDataTable } from "./site-data-table";
import { SiteDateNavigation } from "./site-date-navigation";
import { SiteEmptyState } from "./site-empty-state";
import { SiteFilterToolbar } from "./site-filter-toolbar";
import { SiteSectionHeader } from "./site-section-header";
import { SiteBadgeTone, SiteStatusBadge } from "./site-status-badge";
import { SiteSummaryStrip } from "./site-summary-strip";
import styles from "./project-site-workspace.module.css";

interface AttendanceViewProps {
  siteDay: SiteDay;
  onAction: (message: string) => void;
}

function attendanceLabel(status: SiteAttendanceWorker["status"]): string {
  const labels: Record<SiteAttendanceWorker["status"], string> = {
    on_site: "On site",
    checked_out: "Checked out",
    absent: "Absent",
  };
  return labels[status];
}

function attendanceTone(status: SiteAttendanceWorker["status"]): SiteBadgeTone {
  if (status === "on_site") return "success";
  if (status === "absent") return "danger";
  return "neutral";
}

export function AttendanceView({ siteDay, onAction }: AttendanceViewProps) {
  const [search, setSearch] = useState("");
  const [trade, setTrade] = useState("all");
  const [contractor, setContractor] = useState("all");
  const [status, setStatus] = useState("all");

  const workers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return siteDay.attendanceWorkers.filter((worker) => {
      if (
        query &&
        !`${worker.name} ${worker.trade} ${worker.contractor}`
          .toLowerCase()
          .includes(query)
      ) {
        return false;
      }
      if (trade !== "all" && worker.trade !== trade) return false;
      if (contractor !== "all" && worker.contractor !== contractor) return false;
      if (status !== "all" && worker.status !== status) return false;
      return true;
    });
  }, [contractor, search, siteDay.attendanceWorkers, status, trade]);

  const columns: Array<SiteDataColumn<SiteAttendanceWorker>> = [
    {
      id: "worker",
      label: "Worker",
      priority: "primary",
      render: (worker) => <strong>{worker.name}</strong>,
    },
    { id: "trade", label: "Trade", render: (worker) => worker.trade },
    {
      id: "contractor",
      label: "Contractor",
      render: (worker) => worker.contractor,
    },
    {
      id: "check-in",
      label: "Check-in",
      render: (worker) => worker.checkInTime,
    },
    {
      id: "check-out",
      label: "Check-out",
      render: (worker) => worker.checkOutTime || "Not checked out",
    },
    {
      id: "hours",
      label: "Total hours",
      render: (worker) => worker.totalHours,
    },
    {
      id: "status",
      label: "Status",
      render: (worker) => (
        <SiteStatusBadge
          label={attendanceLabel(worker.status)}
          tone={attendanceTone(worker.status)}
        />
      ),
    },
  ];

  return (
    <div className={styles.siteSectionView}>
      <SiteSectionHeader
        title="Attendance Register"
        description="Daily workforce presence, trade allocation and site hours."
        meta="Register open"
        actions={
          <SiteDateNavigation
            label="27 July 2026"
            nextDisabled
            onPrevious={() => onAction("Previous attendance day selected in mock mode.")}
            onNext={() => onAction("Next attendance day selected in mock mode.")}
          />
        }
      />

      <SiteSummaryStrip
        ariaLabel="Attendance summary"
        metrics={[
          {
            id: "on-site",
            label: "On site",
            value: String(siteDay.attendance.peopleOnSite),
            detail: "Active check-ins",
            icon: UserRoundCheck,
            tone: "success",
          },
          {
            id: "expected",
            label: "Expected",
            value: String(siteDay.attendance.expectedPeople),
            detail: "Planned workforce",
            icon: Users,
          },
          {
            id: "checked-out",
            label: "Checked out",
            value: String(siteDay.attendance.checkedOutPeople),
            detail: "Completed shifts",
            icon: LogOut,
          },
          {
            id: "absent",
            label: "Absent",
            value: String(siteDay.attendance.absentPeople),
            detail: "Expected, not present",
            icon: UserMinus,
            tone: "warning",
          },
        ]}
      />

      <section className={styles.workforceBreakdown} aria-labelledby="crew-attendance-title">
        <div className={styles.recordSectionHeader}>
          <div>
            <h3 id="crew-attendance-title">Workforce breakdown</h3>
            <p>Present workers against today’s expected crew strength.</p>
          </div>
          <span>4 crews</span>
        </div>
        <div className={styles.crewAttendanceGrid}>
          {siteDay.attendanceCrews.map((crew) => {
            const percent =
              crew.expectedCount > 0
                ? Math.round((crew.presentCount / crew.expectedCount) * 100)
                : 0;
            return (
              <div key={crew.id}>
                <span>
                  <strong>{crew.crewName}</strong>
                  <small>
                    {crew.presentCount} / {crew.expectedCount}
                  </small>
                </span>
                <div
                  role="progressbar"
                  aria-label={`${crew.crewName} attendance`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={percent}
                >
                  <span style={{ width: `${percent}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <SiteFilterToolbar
        label="Attendance"
        views={[{ id: "all", label: "All workers", count: workers.length }]}
        activeView="all"
        onViewChange={() => undefined}
      >
        <label className={styles.filterSearch}>
          <Search size={14} aria-hidden="true" />
          <span className="sr-only">Search attendance</span>
          <input
            type="search"
            placeholder="Search workers"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <select
          aria-label="Trade"
          value={trade}
          onChange={(event) => setTrade(event.target.value)}
        >
          <option value="all">All trades</option>
          {Array.from(new Set(siteDay.attendanceWorkers.map((worker) => worker.trade))).map(
            (workerTrade) => (
              <option key={workerTrade} value={workerTrade}>
                {workerTrade}
              </option>
            ),
          )}
        </select>
        <select
          aria-label="Contractor"
          value={contractor}
          onChange={(event) => setContractor(event.target.value)}
        >
          <option value="all">All contractors</option>
          {Array.from(
            new Set(siteDay.attendanceWorkers.map((worker) => worker.contractor)),
          ).map((workerContractor) => (
            <option key={workerContractor} value={workerContractor}>
              {workerContractor}
            </option>
          ))}
        </select>
        <select
          aria-label="Attendance status"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option value="all">All statuses</option>
          <option value="on_site">On site</option>
          <option value="checked_out">Checked out</option>
          <option value="absent">Absent</option>
        </select>
      </SiteFilterToolbar>

      {workers.length > 0 ? (
        <SiteDataTable
          caption="Daily site attendance"
          columns={columns}
          records={workers}
        />
      ) : siteDay.attendanceWorkers.length === 0 ? (
        <SiteEmptyState
          icon={Users}
          title="Attendance register has not been opened for today"
          description="Record workers, supervisors and contractors entering and leaving the site."
          primaryActionLabel="Open Today’s Register"
          onPrimaryAction={() =>
            onAction("Today’s attendance register opened in mock mode.")
          }
          supportingContent={
            <span>Expected workforce: 32 workers · 4 crews · 3 supervisors</span>
          }
          presentation="compact"
        />
      ) : (
        <SiteEmptyState
          icon={Search}
          title="No workers match these filters"
          description="Adjust the trade, contractor or attendance status filters."
          presentation="compact"
        />
      )}
    </div>
  );
}
