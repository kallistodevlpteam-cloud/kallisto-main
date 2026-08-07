"use client";

import { useMemo, useState } from "react";
import {
  CalendarClock,
  Camera,
  ClipboardList,
  CloudRain,
  FileClock,
  HardHat,
  History,
  PackageCheck,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { SiteDailyLog, SiteDailyLogStatus, SiteDay } from "../types/site.types";
import { SiteDateNavigation } from "./site-date-navigation";
import { SiteEmptyState } from "./site-empty-state";
import { SiteFilterToolbar } from "./site-filter-toolbar";
import { SiteSectionHeader } from "./site-section-header";
import { SiteStatusBadge, SiteBadgeTone } from "./site-status-badge";
import { SiteSummaryStrip } from "./site-summary-strip";
import styles from "./project-site-workspace.module.css";

type DailyLogFilter = "all" | SiteDailyLogStatus;

interface DailyLogsViewProps {
  siteDay: SiteDay;
  onAction: (message: string) => void;
}

const dailyLogViews: Array<{ id: DailyLogFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "submitted", label: "Submitted" },
  { id: "draft", label: "Draft" },
  { id: "approved", label: "Approved" },
  { id: "returned", label: "Returned" },
];

function logTone(status: SiteDailyLogStatus): SiteBadgeTone {
  if (status === "approved") return "success";
  if (status === "submitted") return "active";
  if (status === "returned") return "danger";
  return "neutral";
}

function logLabel(status: SiteDailyLogStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function DailyLogRecord({ log }: { log: SiteDailyLog }) {
  return (
    <article className={styles.dailyLogRecord}>
      <header>
        <div>
          <time dateTime={log.date}>{log.dateLabel}</time>
          <span>Submitted by {log.submittedBy}</span>
        </div>
        <SiteStatusBadge label={logLabel(log.status)} tone={logTone(log.status)} />
      </header>

      <div className={styles.dailyLogBody}>
        <section>
          <h4>Work completed</h4>
          <p>{log.workCompleted}</p>
        </section>
        <section>
          <h4>Constraints</h4>
          <p>{log.constraints}</p>
        </section>
      </div>

      <dl className={styles.dailyLogDetails}>
        <div>
          <dt>
            <HardHat size={14} aria-hidden="true" />
            Workforce
          </dt>
          <dd>{log.workforceSummary}</dd>
        </div>
        <div>
          <dt>
            <PackageCheck size={14} aria-hidden="true" />
            Materials
          </dt>
          <dd>{log.materialsReceived}</dd>
        </div>
        <div>
          <dt>
            <Wrench size={14} aria-hidden="true" />
            Equipment
          </dt>
          <dd>{log.equipmentUsed}</dd>
        </div>
        <div>
          <dt>
            <ShieldCheck size={14} aria-hidden="true" />
            Safety
          </dt>
          <dd>{log.safetyObservations}</dd>
        </div>
      </dl>

      <footer>
        <span>
          <Camera size={14} aria-hidden="true" />
          {log.evidenceCount} evidence
        </span>
        <span>
          <History size={14} aria-hidden="true" />
          {log.revisionHistory.length} revision events
        </span>
        {log.submittedAt ? <span>{log.submittedAt}</span> : null}
      </footer>
    </article>
  );
}

export function DailyLogsView({ siteDay, onAction }: DailyLogsViewProps) {
  const [filter, setFilter] = useState<DailyLogFilter>("all");
  const filteredLogs = useMemo(
    () =>
      filter === "all"
        ? siteDay.dailyLogs
        : siteDay.dailyLogs.filter((log) => log.status === filter),
    [filter, siteDay.dailyLogs],
  );

  return (
    <div className={styles.siteSectionView}>
      <SiteSectionHeader
        title="Daily Logs"
        description="Daily execution records, workforce, constraints and field evidence."
        meta="Current site day"
        actions={
          <SiteDateNavigation
            label="27 July 2026"
            nextDisabled
            onPrevious={() => onAction("Previous site day selected in mock mode.")}
            onNext={() => onAction("Next site day selected in mock mode.")}
          />
        }
      />

      <SiteSummaryStrip
        ariaLabel="Daily log summary"
        metrics={[
          {
            id: "status",
            label: "Log status",
            value: "Not submitted",
            detail: "Due today",
            icon: FileClock,
            tone: "warning",
          },
          {
            id: "weather",
            label: "Weather",
            value: "29°C",
            detail: "Light rain",
            icon: CloudRain,
          },
          {
            id: "workforce",
            label: "Workforce",
            value: "28",
            detail: "Expected on site",
            icon: HardHat,
          },
          {
            id: "activities",
            label: "Scheduled",
            value: "4",
            detail: "Site activities",
            icon: CalendarClock,
          },
          {
            id: "evidence",
            label: "Evidence",
            value: "0",
            detail: "Uploads today",
            icon: Camera,
          },
        ]}
      />

      <SiteFilterToolbar
        label="Daily logs"
        views={dailyLogViews.map((view) => ({
          ...view,
          count:
            view.id === "all"
              ? siteDay.dailyLogs.length
              : siteDay.dailyLogs.filter((log) => log.status === view.id).length,
        }))}
        activeView={filter}
        onViewChange={(view) => setFilter(view as DailyLogFilter)}
      />

      <SiteEmptyState
        icon={ClipboardList}
        title="Today’s daily log has not been submitted"
        description="Record completed work, workforce, constraints, safety observations and field evidence."
        primaryActionLabel="Create Daily Log"
        onPrimaryAction={() => onAction("Daily log editor opened in mock mode.")}
        supportingContent={
          <span>4 scheduled site activities will be available for selection.</span>
        }
        presentation="compact"
      />

      <section className={styles.recordSection} aria-labelledby="recent-daily-logs">
        <div className={styles.recordSectionHeader}>
          <div>
            <h3 id="recent-daily-logs">Recent daily logs</h3>
            <p>Submission, approval and revision history for earlier site days.</p>
          </div>
          <span>{filteredLogs.length} records</span>
        </div>

        {filteredLogs.length > 0 ? (
          <div className={styles.dailyLogList}>
            {filteredLogs.map((log) => (
              <DailyLogRecord key={log.id} log={log} />
            ))}
          </div>
        ) : (
          <SiteEmptyState
            icon={ClipboardList}
            title={`No ${filter} daily logs`}
            description="Choose another status to review available project-day records."
            presentation="compact"
          />
        )}
      </section>
    </div>
  );
}
