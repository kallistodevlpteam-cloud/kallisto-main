"use client";

import React, {
  useState,
  useSyncExternalStore,
  useMemo,
  useEffect,
} from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { CalendarRange } from "lucide-react";
import {
  countActiveFilterGroups,
  filterScheduleActivities,
} from "./schedule-activity-filter";
import {
  addMonths,
  endOfMondayWeek,
  formatToolbarRange,
  getDateOnlyInTimeZone,
  getVisibleWeek,
  shiftSchedulePeriod,
  startOfMondayWeek,
} from "./schedule-date-range";
import { ScheduleHeader } from "./schedule-header";
import {
  ScheduleInspectorMode,
  ScheduleRightPanel,
} from "./schedule-right-panel";
import { ScheduleSidebar } from "./schedule-sidebar";
import {
  ScheduleActivityItem,
  ScheduleActivityStatus,
  ScheduleActivityType,
  ScheduleFilterState,
  SchedulePermissions,
  ScheduleSlotSelection,
  ScheduleViewMode,
  ScheduleWorkstream,
} from "./schedule-types";
import { WeekCalendar } from "./week-calendar";
import { GanttWorkspace } from "../timeline/gantt/gantt-workspace";
import {
  DEFAULT_MOCK_ACTIVITIES,
  DEFAULT_MOCK_PHASES,
} from "../../domain/project-schedule.repository";
import { GanttZoom } from "../timeline/query-state/timeline-query-schema";
import {
  ProjectScheduleActivity,
  ProjectSchedulePermissions,
  ProjectActivityType,
  ProjectActivityStatus,
} from "../../domain/project-schedule.types";
import styles from "./schedule.module.css";

export interface ProjectScheduleWorkspaceProps {
  projectId: string;
  projectName: string;
  initialViewMode?: ScheduleViewMode;
  hideHeader?: boolean;
  headerTabs?: React.ReactNode;
}

const PHASES = [
  "Pre-design",
  "Design",
  "Procurement",
  "Construction",
  "Handover",
];

const WORKSTREAMS: ScheduleWorkstream[] = [
  "Architecture",
  "Structure",
  "MEP",
  "Procurement",
  "Site execution",
  "Client approvals",
];

const STATUSES: ScheduleActivityStatus[] = [
  "Scheduled",
  "In progress",
  "Pending approval",
  "Blocked",
  "Completed",
  "Delayed",
];

const TEAM = [
  "Arun Mehta",
  "Rahul Sharma",
  "Arjun Mehta",
  "Anil Kumar",
  "Saran & Rithvik",
  "Anoop Kumar",
  "GeoLab Kerala",
];

const PERMISSIONS: ProjectSchedulePermissions = {
  canViewSchedule: true,
  canCreateActivity: true,
  canEditActivity: true,
  canDeleteActivity: true,
  canCompleteActivity: true,
  canEditBaseline: true,
  canViewBaseline: true,
  canViewPrivateActivities: true,
  canViewRestrictedDates: true,
  canManageDependencies: true,
  canApproveActivity: true,
};

function createScheduleActivities(projectId: string): ScheduleActivityItem[] {
  return [
    {
      id: "sch-1",
      projectId,
      title: "Revised electrical layout review",
      type: "Approval",
      phase: "Procurement",
      workstream: "Client approvals",
      startDate: "2026-07-24",
      endDate: "2026-07-24",
      allDay: false,
      startTime: "09:00",
      endTime: "11:00",
      owner: "Arun Mehta",
      ownerInitials: "AM",
      dependency: "Drawing REV2 dispatch",
      status: "Pending approval",
      linkedDocument: "Drawing_REV2_Electrical.pdf",
      notes: "Decision needed before site conduit chasing starts.",
      progressPercent: 50,
    },
    {
      id: "sch-2",
      projectId,
      title: "Foundation excavation and PCC footing",
      type: "Site task",
      phase: "Construction",
      workstream: "Structure",
      startDate: "2026-07-20",
      endDate: "2026-07-22",
      allDay: true,
      owner: "Rahul Sharma",
      ownerInitials: "RS",
      status: "In progress",
      progressPercent: 68,
    },
    {
      id: "sch-3",
      projectId,
      title: "Roof slab casting",
      type: "Milestone",
      phase: "Construction",
      workstream: "Structure",
      startDate: "2026-07-24",
      endDate: "2026-07-24",
      allDay: false,
      startTime: "11:00",
      endTime: "15:00",
      owner: "Arjun Mehta",
      ownerInitials: "AM",
      dependency: "Rebar quality inspection pass",
      status: "Scheduled",
      isCriticalPath: true,
      progressPercent: 0,
    },
    {
      id: "sch-4",
      projectId,
      title: "Conduit piping and wall chasing",
      type: "Site task",
      phase: "Construction",
      workstream: "MEP",
      startDate: "2026-07-23",
      endDate: "2026-07-23",
      allDay: false,
      startTime: "09:00",
      endTime: "12:00",
      owner: "Anil Kumar",
      ownerInitials: "AK",
      status: "In progress",
      progressPercent: 35,
    },
    {
      id: "sch-5",
      projectId,
      title: "HVAC and electrical drawing dispatch",
      type: "Milestone",
      phase: "Design",
      workstream: "Architecture",
      startDate: "2026-07-24",
      endDate: "2026-07-24",
      allDay: true,
      owner: "Saran & Rithvik",
      ownerInitials: "SR",
      status: "Completed",
      linkedDocument: "MEP_Issue_Set_04.pdf",
      progressPercent: 100,
    },
    {
      id: "sch-6",
      projectId,
      title: "Structural load calculation sign-off",
      type: "Approval",
      phase: "Design",
      workstream: "Client approvals",
      startDate: "2026-07-22",
      endDate: "2026-07-22",
      allDay: true,
      owner: "Anoop Kumar",
      ownerInitials: "AK",
      status: "Completed",
      progressPercent: 100,
    },
    {
      id: "sch-7",
      projectId,
      title: "Geotechnical soil audit",
      type: "Inspection",
      phase: "Pre-design",
      workstream: "Site execution",
      startDate: "2026-07-24",
      endDate: "2026-07-24",
      allDay: false,
      startTime: "10:00",
      endTime: "12:00",
      owner: "GeoLab Kerala",
      ownerInitials: "GL",
      status: "Completed",
      linkedDocument: "Soil_Audit_Final.pdf",
      progressPercent: 100,
    },
    {
      id: "sch-8",
      projectId,
      title: "Site coordination",
      type: "Meeting",
      phase: "Construction",
      workstream: "Site execution",
      startDate: "2026-07-24",
      endDate: "2026-07-24",
      allDay: false,
      startTime: "10:30",
      endTime: "11:30",
      owner: "Arun Mehta",
      ownerInitials: "AM",
      status: "Scheduled",
      progressPercent: 0,
    },
    {
      id: "sch-9",
      projectId,
      title: "Concrete pre-pour checks",
      type: "Inspection",
      phase: "Construction",
      workstream: "Site execution",
      startDate: "2026-07-23",
      endDate: "2026-07-23",
      allDay: false,
      startTime: "07:00",
      endTime: "08:00",
      owner: "Rahul Sharma",
      ownerInitials: "RS",
      status: "Scheduled",
      progressPercent: 0,
    },
    {
      id: "sch-10",
      projectId,
      title: "Weekly safety walk",
      type: "Inspection",
      phase: "Construction",
      workstream: "Site execution",
      startDate: "2026-07-26",
      endDate: "2026-07-26",
      allDay: false,
      startTime: "17:30",
      endTime: "19:00",
      owner: "Rahul Sharma",
      ownerInitials: "RS",
      status: "Scheduled",
      progressPercent: 0,
    },
  ];
}

function subscribeToMobileQuery(onChange: () => void) {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const mediaQuery = window.matchMedia("(max-width: 639px)");
  mediaQuery.addEventListener("change", onChange);
  return () => mediaQuery.removeEventListener("change", onChange);
}

function getMobileSnapshot() {
  return typeof window !== "undefined" && Boolean(window.matchMedia)
    ? window.matchMedia("(max-width: 639px)").matches
    : false;
}

function subscribeToTabletQuery(onChange: () => void) {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const mediaQuery = window.matchMedia("(max-width: 1180px)");
  mediaQuery.addEventListener("change", onChange);
  return () => mediaQuery.removeEventListener("change", onChange);
}

function getTabletSnapshot() {
  return typeof window !== "undefined" && Boolean(window.matchMedia)
    ? window.matchMedia("(max-width: 1180px)").matches
    : false;
}

function getServerSnapshot() {
  return false;
}

export function ProjectScheduleWorkspace({
  projectId,
  projectName,
  initialViewMode,
  hideHeader = false,
  headerTabs,
}: ProjectScheduleWorkspaceProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isDedicatedGanttPage = pathname?.endsWith("/timeline/gantt");

  const isMobile = useSyncExternalStore(
    subscribeToMobileQuery,
    getMobileSnapshot,
    getServerSnapshot
  );
  const isTablet = useSyncExternalStore(
    subscribeToTabletQuery,
    getTabletSnapshot,
    getServerSnapshot
  );
  const [explicitViewMode, setExplicitViewMode] =
    useState<ScheduleViewMode | null>(initialViewMode ?? (isDedicatedGanttPage ? "Gantt" : null));
  const viewMode = explicitViewMode ?? (isMobile ? "Day" : "Week");

  const handleViewModeChange = (mode: ScheduleViewMode) => {
    if (mode === "Gantt") {
      if (!isDedicatedGanttPage) {
        router.push(`/projects/${projectId}/timeline/gantt`);
      } else {
        setExplicitViewMode("Gantt");
      }
    } else {
      if (isDedicatedGanttPage) {
        router.push(`/projects/${projectId}?tab=schedule&view=${mode.toLowerCase()}`);
      } else {
        setExplicitViewMode(mode);
      }
    }
  };
  const searchParams = useSearchParams();
  const [anchorDate, setAnchorDate] = useState("2026-07-24");
  const [selectedDate, setSelectedDate] = useState("2026-07-24");
  const [searchValue, setSearchValue] = useState(searchParams?.get("q") ?? "");

  useEffect(() => {
    setSearchValue(searchParams?.get("q") ?? "");
  }, [searchParams]);
  const [selectedPhases, setSelectedPhases] = useState<string[]>(PHASES);
  const [selectedWorkstreams, setSelectedWorkstreams] =
    useState<string[]>(WORKSTREAMS);
  const [selectedTeam, setSelectedTeam] = useState<string[]>(TEAM);
  const [selectedStatuses, setSelectedStatuses] =
    useState<string[]>(STATUSES);
  const [selectedSavedView, setSelectedSavedView] = useState<string | null>(
    "Weekly Execution Plan"
  );
  const [sidebarPreference, setSidebarPreference] = useState<
    "auto" | "expanded" | "collapsed"
  >("auto");
  const [activities, setActivities] = useState<ScheduleActivityItem[]>(() =>
    createScheduleActivities(projectId)
  );
  const [selectedActivity, setSelectedActivity] =
    useState<ScheduleActivityItem | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [inspectorMode, setInspectorMode] =
    useState<ScheduleInspectorMode>("view");
  const [initialSlot, setInitialSlot] =
    useState<ScheduleSlotSelection | null>(null);
  const [createType, setCreateType] =
    useState<ScheduleActivityType>("Milestone");
  const [ganttZoom, setGanttZoom] = useState<GanttZoom>("week");
  const [showGanttBaseline, setShowGanttBaseline] = useState(false);

  const isSidebarCollapsed =
    sidebarPreference === "auto"
      ? isTablet
      : sidebarPreference === "collapsed";
  const visibleWeekStart = startOfMondayWeek(anchorDate);
  const visibleWeekEnd = endOfMondayWeek(anchorDate);
  const weekDates = getVisibleWeek(anchorDate);
  const visibleDates = viewMode === "Day" ? [selectedDate] : weekDates;
  const todayDate = getDateOnlyInTimeZone();

  const filters: ScheduleFilterState = {
    phases: selectedPhases,
    workstreams: selectedWorkstreams,
    team: selectedTeam,
    statuses: selectedStatuses,
    search: searchValue,
  };
  const availableFilters = {
    phases: PHASES,
    workstreams: WORKSTREAMS,
    team: TEAM,
    statuses: STATUSES,
  };
  const activeFilterCount = countActiveFilterGroups(
    filters,
    availableFilters
  );
  const filteredActivities = filterScheduleActivities(activities, filters);

  const ganttActivities = useMemo(() => {
    const mappedItems: ProjectScheduleActivity[] = activities.map((item) => {
      const phaseIdMap: Record<string, string> = {
        "Pre-design": "phase-1",
        "Design": "phase-2",
        "Procurement": "phase-4",
        "Construction": "phase-6",
        "Handover": "phase-9",
      };
      const statusMap: Record<ScheduleActivityStatus, ProjectActivityStatus> = {
        "Scheduled": "not_started",
        "In progress": "in_progress",
        "Pending approval": "in_progress",
        "Blocked": "blocked",
        "Completed": "completed",
        "Delayed": "blocked",
      };
      const typeMap: Record<ScheduleActivityType, ProjectActivityType> = {
        "Milestone": "milestone",
        "Approval": "approval",
        "Site task": "site_activity",
        "Meeting": "activity",
        "Inspection": "site_activity",
        "Procurement": "activity",
      };
      return {
        id: item.id,
        projectId,
        phaseId: phaseIdMap[item.phase] || "phase-6",
        parentId: null,
        wbsCode: "6.0",
        title: item.title,
        description: item.notes,
        type: typeMap[item.type] || "activity",
        status: statusMap[item.status] || "in_progress",
        plannedStartDate: item.startDate,
        plannedEndDate: item.endDate,
        baselineStartDate: item.startDate,
        baselineEndDate: item.endDate,
        actualStartDate: item.status === "Completed" ? item.startDate : null,
        actualEndDate: item.status === "Completed" ? item.endDate : null,
        completedAt: item.status === "Completed" ? item.endDate : null,
        progressPercent: item.progressPercent ?? (item.status === "Completed" ? 100 : 0),
        weight: 5,
        ownerId: item.owner,
        assigneeName: item.owner,
        dependencies: [],
        visibility: "project",
        approvalStatus: item.type === "Approval" ? "pending" : "approved",
        isMilestone: item.type === "Milestone",
        criticalPath: item.isCriticalPath ?? false,
      };
    });

    const existingIds = new Set(mappedItems.map((a) => a.id));
    const extras = DEFAULT_MOCK_ACTIVITIES.filter((a) => !existingIds.has(a.id));
    return [...mappedItems, ...extras];
  }, [activities, projectId]);

  const toggleValue = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setter((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    );
  };

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    setAnchorDate(date);
  };

  const handleNavigate = (direction: -1 | 1) => {
    const next = shiftSchedulePeriod(
      anchorDate,
      selectedDate,
      viewMode,
      direction
    );
    setAnchorDate(next.anchorDate);
    setSelectedDate(next.selectedDate);
  };

  const handleNavigateToday = () => {
    setAnchorDate(todayDate);
    setSelectedDate(todayDate);
  };

  const handleOpenActivity = (activity: ScheduleActivityItem) => {
    setSelectedActivity((prev) => {
      if (prev?.id === activity.id) {
        setIsInspectorOpen(false);
        return null;
      }
      setIsInspectorOpen(true);
      setInspectorMode("view");
      return activity;
    });
  };

  const handleEditActivity = (activity: ScheduleActivityItem) => {
    handleSaveActivity(activity);
    setSelectedActivity(null);
  };

  const handleOpenMilestone = () => {
    setSelectedActivity(null);
    setInitialSlot(null);
    setCreateType("Milestone");
    setInspectorMode("create");
    setIsInspectorOpen(true);
  };

  const handleOpenSlot = (slot: ScheduleSlotSelection) => {
    setSelectedDate(slot.date);
    setAnchorDate(slot.date);
    setSelectedActivity(null);
    setInitialSlot(slot);
    setCreateType("Site task");
    setInspectorMode("create");
  };

  const handleCloseSlot = () => {
    setInitialSlot(null);
  };

  const handleSaveActivity = (
    activityData: Partial<ScheduleActivityItem>
  ) => {
    if (inspectorMode === "create") {
      const generatedId =
        globalThis.crypto?.randomUUID?.() ?? `sch-${Date.now()}`;
      const newActivity: ScheduleActivityItem = {
        id: generatedId,
        projectId,
        title: activityData.title ?? "New schedule item",
        type: activityData.type ?? createType,
        phase: activityData.phase ?? "Construction",
        workstream: activityData.workstream ?? "Structure",
        startDate: activityData.startDate ?? selectedDate,
        endDate: activityData.endDate ?? selectedDate,
        allDay: activityData.allDay ?? false,
        startTime: activityData.startTime,
        endTime: activityData.endTime,
        owner: activityData.owner ?? "Unassigned",
        ownerInitials: activityData.ownerInitials ?? "UN",
        dependency: activityData.dependency,
        status: activityData.status ?? "Scheduled",
        linkedDocument: activityData.linkedDocument,
        notes: activityData.notes,
        progressPercent: activityData.progressPercent ?? 0,
      };
      setActivities((current) => [newActivity, ...current]);
    } else if (activityData.id) {
      setActivities((current) =>
        current.map((activity) =>
          activity.id === activityData.id
            ? { ...activity, ...activityData }
            : activity
        )
      );
    }
    setInitialSlot(null);
    setIsInspectorOpen(false);
  };

  const handleDeleteActivity = (activityId: string) => {
    setActivities((current) =>
      current.filter((activity) => activity.id !== activityId)
    );
    setSelectedActivity(null);
    setIsInspectorOpen(false);
  };

  return (
    <section
      className={`${styles.schedulePageMainShell} project-schedule-workspace`}
      aria-label={`${projectName} project schedule`}
      data-week-start={visibleWeekStart}
      data-week-end={visibleWeekEnd}
    >
      {!hideHeader && viewMode !== "Gantt" && (
        <ScheduleHeader
          currentDateLabel={(() => {
            const [y, m, d] = selectedDate.split("-").map(Number);
            if (!y || !m || !d) return "30 Jul";
            const dateObj = new Date(y, m - 1, d);
            const dayNum = dateObj.getDate();
            const monthStr = dateObj.toLocaleDateString("en-US", { month: "short" });
            return `${dayNum} ${monthStr}`;
          })()}
          dateRangeLabel={formatToolbarRange(
            anchorDate,
            selectedDate,
            viewMode
          )}
          viewMode={viewMode}
          searchValue={searchValue}
          selectedPhases={selectedPhases}
          selectedWorkstreams={selectedWorkstreams}
          selectedTeam={selectedTeam}
          selectedStatuses={selectedStatuses}
          teamOptions={TEAM}
          onTogglePhase={(phase) => toggleValue(phase, setSelectedPhases)}
          onToggleWorkstream={(workstream) =>
            toggleValue(workstream, setSelectedWorkstreams)
          }
          onToggleTeam={(owner) => toggleValue(owner, setSelectedTeam)}
          onToggleStatus={(status) =>
            toggleValue(status, setSelectedStatuses)
          }
          activeFilterCount={activeFilterCount}
          isFilterSidebarExpanded={!isSidebarCollapsed}
          onViewModeChange={handleViewModeChange}
          onNavigatePrev={() => handleNavigate(-1)}
          onNavigateNext={() => handleNavigate(1)}
          onNavigateToday={handleNavigateToday}
          onSearchChange={setSearchValue}
          onToggleFilter={() =>
            setSidebarPreference(isSidebarCollapsed ? "expanded" : "collapsed")
          }
          onAddMilestoneClick={handleOpenMilestone}
          headerTabs={headerTabs}
        />
      )}

      <div className={styles.scheduleBodyLayoutGrid}>
        {viewMode !== "Gantt" && !hideHeader && (
          <ScheduleSidebar
            anchorDate={anchorDate}
            selectedDate={selectedDate}
            todayDate={todayDate}
            selectedPhases={selectedPhases}
            selectedWorkstreams={selectedWorkstreams}
            selectedTeam={selectedTeam}
            selectedStatuses={selectedStatuses}
            selectedSavedView={selectedSavedView}
            teamOptions={TEAM}
            isCollapsed={isSidebarCollapsed}
            forceExpanded={sidebarPreference === "expanded"}
            activeFilterCount={activeFilterCount}
            onToggleCollapsed={() =>
              setSidebarPreference(
                isSidebarCollapsed ? "expanded" : "collapsed"
              )
            }
            onNavigateMonth={(direction) => {
              const nextDate = addMonths(anchorDate, direction);
              setAnchorDate(nextDate);
              setSelectedDate(nextDate);
            }}
            onNavigateWeek={(direction) => handleNavigate(direction)}
            onSelectDate={handleSelectDate}
            onTogglePhase={(phase) => toggleValue(phase, setSelectedPhases)}
            onToggleWorkstream={(workstream) =>
              toggleValue(workstream, setSelectedWorkstreams)
            }
            onToggleTeam={(owner) => toggleValue(owner, setSelectedTeam)}
            onToggleStatus={(status) =>
              toggleValue(status, setSelectedStatuses)
            }
            onSelectSavedView={setSelectedSavedView}
          />
        )}

        <main className={styles.centralScheduleCalendarWrapper}>
          {viewMode === "Week" || viewMode === "Day" ? (
            <WeekCalendar
              visibleDates={visibleDates}
              selectedDate={selectedDate}
              activities={filteredActivities}
              selectedActivityId={selectedActivity?.id ?? null}
              initialSlot={initialSlot}
              onSelectDate={handleSelectDate}
              onSelectActivity={handleOpenActivity}
              onCreateSlot={handleOpenSlot}
              onCloseSlot={handleCloseSlot}
              onSaveSlot={handleSaveActivity}
              onEditActivity={handleEditActivity}
              onDeleteActivity={handleDeleteActivity}
            />
          ) : viewMode === "Gantt" ? (
            <GanttWorkspace
              projectId={projectId}
              projectName={projectName}
              activities={ganttActivities}
              phases={DEFAULT_MOCK_PHASES}
              permissions={PERMISSIONS}
              context={{ today: todayDate, timezone: "Asia/Kolkata" }}
              selectedActivityId={selectedActivity?.id ?? null}
              zoom={ganttZoom}
              showBaseline={showGanttBaseline}
              searchValue={searchValue}
              onSelectActivity={(id) => {
                const found = activities.find((a) => a.id === id);
                if (found) {
                  handleOpenActivity(found);
                }
              }}
              onZoomChange={setGanttZoom}
              onToggleBaseline={() => setShowGanttBaseline((prev) => !prev)}
              onSearchChange={setSearchValue}
            />
          ) : (
            <div className={styles.alternateViewState}>
              <CalendarRange size={24} aria-hidden="true" />
              <h2>{viewMode} view</h2>
              <p>
                This view keeps the same project date state. Select Day, Week, or Gantt
                for detailed schedule visualization.
              </p>
            </div>
          )}
        </main>

        <ScheduleRightPanel
          activity={selectedActivity}
          isOpen={isInspectorOpen}
          mode={inspectorMode}
          projectId={projectId}
          selectedDate={selectedDate}
          initialSlot={initialSlot}
          createType={createType}
          permissions={PERMISSIONS}
          onModeChange={setInspectorMode}
          onClose={() => setIsInspectorOpen(false)}
          onSave={handleSaveActivity}
          onDelete={handleDeleteActivity}
        />
      </div>
    </section>
  );
}
