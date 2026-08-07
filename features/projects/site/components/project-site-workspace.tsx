"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ClipboardList, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Project } from "@/types/domain/project";
import { createMockSiteDay } from "../data/site.mock";
import { SiteActivity, SiteDay, SiteView } from "../types/site.types";
import {
  createSiteViewUrl,
  parseSiteView,
} from "../utils/site-query-state";
import { AttendanceView } from "./attendance-view";
import { DailyLogsView } from "./daily-logs-view";
import { DailyProgressCard } from "./daily-progress-card";
import { InspectionsView } from "./inspections-view";
import { IssuesDeliveriesCard } from "./issues-deliveries-card";
import { IssuesView } from "./issues-view";
import { LatestEvidenceCard } from "./latest-evidence-card";
import { SiteActivityInspector } from "./site-activity-inspector";
import { SiteAttentionStrip } from "./site-attention-strip";
import {
  SiteEmptyState,
  SiteErrorState,
  SiteLoadingState,
  SitePermissionState,
} from "./site-empty-state";
import { SiteHeader, SiteHeaderAction } from "./site-header";
import { SiteNavigation } from "./site-navigation";
import { SiteStatusCard } from "./site-status-card";
import { TodayOnSiteCard } from "./today-on-site-card";
import styles from "./project-site-workspace.module.css";

export type SiteWorkspaceDisplayState =
  | "ready"
  | "loading"
  | "error"
  | "permission_denied";

interface ProjectSiteWorkspaceProps {
  project: Project;
  initialView?: SiteView;
  data?: SiteDay | null;
  displayState?: SiteWorkspaceDisplayState;
}

const actionMessages: Record<SiteHeaderAction, string> = {
  log_update: "Site update logging opened in mock mode.",
  daily_log: "Daily log editor opened in mock mode.",
  attendance: "Attendance register opened in mock mode.",
  inspection: "Inspection scheduling opened in mock mode.",
  issue: "Issue report opened in mock mode.",
  delivery: "Delivery record opened in mock mode.",
};

const viewPrimaryActions: Record<
  SiteView,
  { action: SiteHeaderAction; label: string }
> = {
  overview: { action: "log_update", label: "Log Site Update" },
  daily_logs: { action: "daily_log", label: "Create Daily Log" },
  inspections: { action: "inspection", label: "Schedule Inspection" },
  issues: { action: "issue", label: "Report Issue" },
  attendance: {
    action: "attendance",
    label: "Open Attendance Register",
  },
};

export function ProjectSiteWorkspace({
  project,
  initialView = "overview",
  data,
  displayState = "ready",
}: ProjectSiteWorkspaceProps) {
  const searchParams = useSearchParams();
  const queryView = parseSiteView(searchParams.get("siteView"));
  const defaultSiteDay = useMemo(
    () => createMockSiteDay(project.id, project.name),
    [project.id, project.name],
  );
  const siteDay = data === undefined ? defaultSiteDay : data;
  const [activeView, setActiveView] = useState<SiteView>(() => {
    if (typeof window !== "undefined") {
      const browserView = parseSiteView(
        new URLSearchParams(window.location.search).get("siteView"),
      );

      return browserView || queryView || initialView;
    }

    return queryView || initialView;
  });
  const [selectedDate, setSelectedDate] = useState(
    siteDay?.date || defaultSiteDay.date,
  );
  const [selectedActivity, setSelectedActivity] =
    useState<SiteActivity | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [hasRetried, setHasRetried] = useState(false);
  const resolvedDisplayState = hasRetried ? "ready" : displayState;
  const primaryAction = viewPrimaryActions[activeView];

  useEffect(() => {
    function syncViewFromUrl() {
      const urlView = parseSiteView(
        new URLSearchParams(window.location.search).get("siteView"),
      );
      setActiveView(urlView || initialView);
    }

    window.addEventListener("popstate", syncViewFromUrl);
    return () => window.removeEventListener("popstate", syncViewFromUrl);
  }, [initialView]);

  function showNotice(message: string) {
    setNotice(message);
  }

  function handleViewChange(view: SiteView) {
    setActiveView(view);
    const nextUrl = createSiteViewUrl(window.location.href, view);
    window.history.pushState({}, "", nextUrl);
  }

  function handleOverflowAction(action: SiteHeaderAction) {
    const targetViews: Partial<Record<SiteHeaderAction, SiteView>> = {
      attendance: "attendance",
      inspection: "inspections",
      issue: "issues",
      daily_log: "daily_logs",
      log_update: "overview",
    };
    const targetView = targetViews[action];

    if (targetView) {
      handleViewChange(targetView);
    }

    showNotice(actionMessages[action]);
  }

  if (resolvedDisplayState === "loading") {
    return <SiteLoadingState />;
  }

  if (resolvedDisplayState === "error") {
    return (
      <SiteErrorState
        projectCode={project.projectCode}
        onRetry={() => setHasRetried(true)}
      />
    );
  }

  if (resolvedDisplayState === "permission_denied") {
    return <SitePermissionState projectCode={project.projectCode} />;
  }

  if (!siteDay) {
    return (
      <SiteEmptyState
        icon={ClipboardList}
        title="No site day is available"
        description={`Create a field record for ${project.name} before logging activities, attendance or evidence.`}
        primaryActionLabel="Create site day"
        onPrimaryAction={() =>
          showNotice("Site day creation opened in mock mode.")
        }
      />
    );
  }

  return (
    <section
      className={`${styles.siteWorkspace} projectSiteWorkspace`}
      aria-labelledby="site-workspace-title"
      data-project-id={project.id}
    >
      <SiteHeader
        projectName={project.name}
        date={selectedDate}
        primaryAction={primaryAction.action}
        primaryActionLabel={primaryAction.label}
        onDateChange={setSelectedDate}
        onPrimaryAction={() =>
          showNotice(
            `${actionMessages[primaryAction.action].replace(
              " in mock mode.",
              "",
            )} for ${project.name} in mock mode.`,
          )
        }
        onOverflowAction={handleOverflowAction}
      />

      <SiteNavigation
        activeView={activeView}
        onViewChange={handleViewChange}
      />

      {activeView === "overview" ? (
        <div
          id="site-panel-overview"
          role="tabpanel"
          aria-labelledby="site-tab-overview"
          className={styles.siteOverview}
        >
          <SiteAttentionStrip
            alerts={siteDay.alerts}
            onSelect={handleViewChange}
          />

          <div className={styles.overviewGrid}>
            <TodayOnSiteCard
              activities={siteDay.activities}
              onActivitySelect={setSelectedActivity}
            />
            <SiteStatusCard siteDay={siteDay} />
            <DailyProgressCard progress={siteDay.progress} />
            <LatestEvidenceCard
              evidence={siteDay.evidence}
              onViewAll={() =>
                showNotice("Evidence register opened in mock mode.")
              }
            />
            <IssuesDeliveriesCard
              issues={siteDay.issues}
              deliveries={siteDay.deliveries}
            />
          </div>
        </div>
      ) : activeView === "daily_logs" ? (
        <div
          id="site-panel-daily_logs"
          role="tabpanel"
          aria-labelledby="site-tab-daily_logs"
        >
          <DailyLogsView siteDay={siteDay} onAction={showNotice} />
        </div>
      ) : activeView === "inspections" ? (
        <div
          id="site-panel-inspections"
          role="tabpanel"
          aria-labelledby="site-tab-inspections"
        >
          <InspectionsView siteDay={siteDay} onAction={showNotice} />
        </div>
      ) : activeView === "issues" ? (
        <div
          id="site-panel-issues"
          role="tabpanel"
          aria-labelledby="site-tab-issues"
        >
          <IssuesView siteDay={siteDay} onAction={showNotice} />
        </div>
      ) : (
        <div
          id="site-panel-attendance"
          role="tabpanel"
          aria-labelledby="site-tab-attendance"
        >
          <AttendanceView siteDay={siteDay} onAction={showNotice} />
        </div>
      )}

      {notice ? (
        <div className={styles.actionNotice} role="status">
          <CheckCircle2 size={16} aria-hidden="true" />
          <span>{notice}</span>
          <button
            type="button"
            aria-label="Dismiss site action message"
            onClick={() => setNotice(null)}
          >
            <X size={14} aria-hidden="true" />
          </button>
        </div>
      ) : null}

      {selectedActivity ? (
        <SiteActivityInspector
          activity={selectedActivity}
          onClose={() => setSelectedActivity(null)}
        />
      ) : null}
    </section>
  );
}
