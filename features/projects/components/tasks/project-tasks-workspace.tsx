"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Plus, ChevronDown } from "lucide-react";
import { Project } from "@/types/domain/project";
import {
  ProjectTask,
  TaskPanelState,
  WorkPackage,
} from "@/types/domain/project-task";
import { ProjectTaskPage } from "@/services/repositories/project-task.repository";
import { projectTaskService } from "@/services/repositories/project-task.service";
import { ProjectTasksToolbar } from "./project-tasks-toolbar";
import { ProjectTaskGroup } from "./project-task-group";
import { ProjectTaskBoard } from "./project-task-board";
import { ProjectTaskPanel } from "./project-task-panel";
import { ProjectScheduleWorkspace } from "../schedule/project-schedule-workspace";
import styles from "../../projects.module.css";

const SORT_LABEL_MAP: Record<string, string> = {
  recently_updated: "Recently updated",
  due_date: "Due date",
  priority: "Priority",
  progress: "Progress",
  created_at: "Date created",
};

interface ProjectTasksWorkspaceProps {
  project: Project;
}

export function ProjectTasksWorkspace({ project }: ProjectTasksWorkspaceProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Read URL State
  const scope = (searchParams.get("scope") as "all" | "mine") || "all";
  const viewMode = (searchParams.get("view") as "list" | "board") || "list";
  const statusFilter = searchParams.get("status") || "all";
  const priorityFilter = searchParams.get("priority") || "all";
  const assigneeFilter = searchParams.get("assignee") || "all";
  const phaseFilter = searchParams.get("phase") || "all";
  const sortBy = searchParams.get("sort") || "recently_updated";
  const searchQuery = searchParams.get("q") || "";
  const taskQueryId = searchParams.get("task") || null;

  // Default collapsed state
  const DEFAULT_COLLAPSED: Record<string, boolean> = {
    "wp-1": false,
    "wp-2": false,
    "wp-3": true,
    "wp-4": true,
    "wp-5": true,
    "wp-6": true,
    "structural-works": false,
    "architectural-drawings": false,
    "mep-coordination": true,
    "procurement": true,
    "site-execution": true,
    "client-approvals": true,
  };

  // Component State
  const [taskPage, setTaskPage] = useState<ProjectTaskPage | null>(null);
  const [workPackages, setWorkPackages] = useState<WorkPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>(DEFAULT_COLLAPSED);
  const [panelState, setPanelState] = useState<TaskPanelState>({ type: "closed" });
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [openColDropdown, setOpenColDropdown] = useState<string | null>(null);
  const [activeHeaderTab, setActiveHeaderTab] = useState<"tasks" | "timeline">("tasks");

  const STATUS_LABELS: Record<string, string> = {
    all: "All Statuses",
    active: "Active",
    todo: "To Do",
    in_progress: "In Progress",
    waiting: "Waiting",
    blocked: "Blocked",
    completed: "Completed",
  };

  const PRIORITY_LABELS: Record<string, string> = {
    all: "All Priorities",
    critical: "Critical",
    high: "High",
    normal: "Normal",
    low: "Low",
  };

  const ASSIGNEE_LABELS: Record<string, string> = {
    all: "All Assignees",
    "user-rahul": "Rahul Sharma",
    "user-arjun": "Arjun Menon",
    "user-priya": "Priya Patel",
    unassigned: "Unassigned",
  };

  const PHASE_LABELS: Record<string, string> = {
    all: "All Phases",
    "phase-1": "Phase 1: Design & Approval",
    "phase-2": "Phase 2: Superstructure",
    "phase-3": "Phase 3: MEP & Services",
    "phase-4": "Phase 4: Interior Fit-out",
  };

  // Load localStorage collapsed state
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`kallisto_collapsed_wp_${project.id}`);
      if (stored) {
        setCollapsedGroups({ ...DEFAULT_COLLAPSED, ...JSON.parse(stored) });
      } else {
        setCollapsedGroups(DEFAULT_COLLAPSED);
      }
    } catch {
      setCollapsedGroups(DEFAULT_COLLAPSED);
    }
  }, [project.id]);

  // Sync task query parameter to panel state and auto-expand target group
  useEffect(() => {
    if (taskQueryId) {
      setPanelState({ type: "inspect", taskId: taskQueryId });
      if (taskPage) {
        const targetTask = taskPage.groups.flatMap((g) => g.tasks).find((t) => t.id === taskQueryId);
        if (targetTask) {
          setCollapsedGroups((prev) => ({
            ...prev,
            [targetTask.workPackageId]: false,
          }));
        }
      }
    } else {
      setPanelState((prev) => (prev.type === "inspect" ? { type: "closed" } : prev));
    }
  }, [taskQueryId, taskPage]);

  // Helper to determine if a work package is collapsed
  function isWpCollapsed(wp: WorkPackage): boolean {
    if (collapsedGroups[wp.id] !== undefined) return collapsedGroups[wp.id];
    const slug = wp.name.toLowerCase().replace(/\s+/g, "-");
    if (collapsedGroups[slug] !== undefined) return collapsedGroups[slug];
    const isDefaultExpanded = wp.id === "wp-1" || wp.id === "wp-2" || wp.name.toLowerCase().includes("structural") || wp.name.toLowerCase().includes("architectural");
    return !isDefaultExpanded;
  }

  // Helper to update URL search parameters without full page reload
  const updateUrlParams = useCallback(
    (newParams: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", "tasks"); // Ensure tasks tab param is preserved

      Object.entries(newParams).forEach(([key, val]) => {
        if (val === null || val === "" || (key === "scope" && val === "all") || (key === "view" && val === "list")) {
          params.delete(key);
        } else {
          params.set(key, val);
        }
      });

      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  // Fetch tasks and work packages
  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const wpList = await projectTaskService.getWorkPackages(project.workspaceId || "ws-default", project.id);
      setWorkPackages(wpList);

      const page = await projectTaskService.listTasks({
        workspaceId: project.workspaceId || "ws-default",
        projectId: project.id,
        scope,
        searchQuery,
        statusFilter: statusFilter as any,
        priorityFilter: priorityFilter as any,
        assigneeFilter: assigneeFilter as any,
        phaseFilter: phaseFilter as any,
        sortBy: sortBy as any,
      });

      setTaskPage(page);
    } catch (err) {
      console.error("Failed to load project tasks:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [project.id, project.workspaceId, scope, searchQuery, statusFilter, priorityFilter, assigneeFilter, phaseFilter, sortBy]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Toggle group collapse and persist
  function toggleGroupCollapse(wpId: string) {
    const updated = { ...collapsedGroups, [wpId]: !collapsedGroups[wpId] };
    setCollapsedGroups(updated);
    try {
      localStorage.setItem(`kallisto_collapsed_wp_${project.id}`, JSON.stringify(updated));
    } catch {
      // Ignore storage errors
    }
  }

  // Quick Inline Status Completion Toggle
  async function handleToggleTaskComplete(taskId: string, currentStatus: ProjectTask["status"]) {
    if (!taskPage) return;
    const task = taskPage.groups.flatMap((g) => g.tasks).find((t) => t.id === taskId);
    if (!task) return;

    const targetStatus = currentStatus === "completed" ? "in_progress" : "completed";

    try {
      await projectTaskService.changeTaskStatus({
        workspaceId: project.workspaceId || "ws-default",
        projectId: project.id,
        taskId,
        status: targetStatus,
        actorId: "user-arjun",
        expectedVersion: task.version,
        idempotencyKey: `toggle-complete-${taskId}-${Date.now()}`,
        approvalEvidenceId: task.workPackageId === "wp-6" && targetStatus === "completed" ? "ev-approval-101" : undefined,
      });

      loadTasks();
    } catch (err) {
      console.error("Failed to change task status:", err);
    }
  }

  // Open Task Inspector
  function handleSelectTask(taskId: string) {
    setPanelState({ type: "inspect", taskId });
    updateUrlParams({ task: taskId });
  }

  // Close Side Panel
  function handleClosePanel() {
    setPanelState({ type: "closed" });
    updateUrlParams({ task: null });
  }

  // Collect all tasks across groups for calculations and Board view
  const allLoadedTasks = taskPage ? taskPage.groups.flatMap((g: { tasks: ProjectTask[] }) => g.tasks) : [];

  const summaryTotalCount = taskPage ? taskPage.totalCount : allLoadedTasks.length;
  const summaryOverdueCount = taskPage
    ? taskPage.attentionSummary.overdueCount
    : allLoadedTasks.filter((t) => t.dueDate && t.dueDate < "2026-07-24" && t.status !== "completed" && t.status !== "cancelled").length;
  const summaryBlockedCount = taskPage
    ? taskPage.attentionSummary.blockedCount
    : allLoadedTasks.filter((t) => t.status === "blocked").length;
  const summaryDueThisWeekCount = taskPage
    ? taskPage.attentionSummary.dueThisWeekCount
    : allLoadedTasks.filter(
        (t) =>
          t.dueDate &&
          t.dueDate >= "2026-07-24" &&
          t.dueDate <= "2026-07-31" &&
          t.status !== "completed" &&
          t.status !== "cancelled"
      ).length;

  return (
    <div className={`${styles.projectTasksWorkspace} projectTasksWorkspace`}>
      {/* 1. Tasks Workspace Title Card with Primary CTA */}
      <div className={`${styles.projectTasksHeadingRow} projectTasksHeadingRow`}>
        <div className={styles.tabHeadingGroup}>
          <button
            type="button"
            className={`${styles.headerTabBtn} ${activeHeaderTab === "tasks" ? styles.headerTabBtnActive : ""}`}
            onClick={() => setActiveHeaderTab("tasks")}
          >
            List
          </button>
          <button
            type="button"
            className={`${styles.headerTabBtn} ${activeHeaderTab === "timeline" ? styles.headerTabBtnActive : ""}`}
            onClick={() => setActiveHeaderTab("timeline")}
          >
            Timeline
          </button>
        </div>
        {activeHeaderTab === "tasks" && (
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={() => setPanelState({ type: "create" })}
          >
            <Plus size={14} />
            <span>Add Task</span>
          </button>
        )}
      </div>

      {activeHeaderTab === "timeline" ? (
        <div style={{ marginTop: "12px", width: "100%", flex: 1, minHeight: 0, height: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <ProjectScheduleWorkspace
            projectId={project.id}
            projectName={project.name || "Nila Residence"}
          />
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, overflowY: "auto", paddingBottom: "32px" }}>
          <p className={`${styles.projectTasksDescription} projectTasksDescription`} style={{ marginTop: "12px" }}>
            Track and coordinate project work across teams and phases.
          </p>

          {/* Restrained Operational Summary Row */}
          <div className={`${styles.taskOperationalSummaryRow} taskOperationalSummaryRow`}>
            <span className={styles.summaryMetricTotal}>
              {summaryTotalCount} {summaryTotalCount === 1 ? "task" : "tasks"}
            </span>
            <span className={styles.summaryDot}>·</span>
            <span className={`${styles.summaryMetricItem} ${summaryOverdueCount > 0 ? styles.summaryMetricOverdue : ""}`}>
              {summaryOverdueCount} overdue
            </span>
            <span className={styles.summaryDot}>·</span>
            <span className={`${styles.summaryMetricItem} ${summaryBlockedCount > 0 ? styles.summaryMetricBlocked : ""}`}>
              {summaryBlockedCount} blocked
            </span>
            <span className={styles.summaryDot}>·</span>
            <span className={styles.summaryMetricItem}>
              {summaryDueThisWeekCount} due this week
            </span>
          </div>

          {/* 2. Unified Continuous Control Toolbar */}
          <ProjectTasksToolbar
            searchQuery={searchQuery}
            onSearchQueryChange={(q) => updateUrlParams({ q })}
            statusFilter={statusFilter}
            onStatusFilterChange={(st) => updateUrlParams({ status: st })}
            priorityFilter={priorityFilter}
            onPriorityFilterChange={(pr) => updateUrlParams({ priority: pr })}
            assigneeFilter={assigneeFilter}
            onAssigneeFilterChange={(as) => updateUrlParams({ assignee: as })}
            phaseFilter={phaseFilter}
            onPhaseFilterChange={(ph) => updateUrlParams({ phase: ph })}
            scope={scope}
            onScopeChange={(s) => updateUrlParams({ scope: s })}
            sortBy={sortBy}
            onSortByChange={(so) => updateUrlParams({ sort: so })}
          />

          {/* Loading / Error States */}
          {loading && !taskPage ? (
            <div className={styles.tasksLoadingState}>
              <div className="skeleton-bar skeleton-title" />
              <div className="skeleton-bar skeleton-subtitle" />
              <div className="skeleton-card" />
            </div>
          ) : error ? (
            <div className={styles.tasksErrorState}>
              <p>Failed to load tasks for this project.</p>
              <button type="button" className={styles.secondaryBtn} onClick={loadTasks}>
                Retry
              </button>
            </div>
          ) : (
            /* LIST VIEW: Single Desktop Column Header + Work Package Groups */
            <div>
          <div className={`${styles.desktopStickyTableHeader} desktopStickyTableHeader`}>
            <span>TASK</span>

            {/* ASSIGNEE Column Filter */}
            <div style={{ position: "relative" }}>
              <button
                type="button"
                className={`${styles.colHeaderBtn} ${assigneeFilter !== "all" ? styles.colHeaderBtnActive : ""}`}
                onClick={() => setOpenColDropdown(openColDropdown === "assignee" ? null : "assignee")}
              >
                <span>ASSIGNEE</span>
                <ChevronDown size={11} />
              </button>
              {openColDropdown === "assignee" && (
                <div className={styles.colHeaderDropdownMenu} role="menu">
                  {Object.entries(ASSIGNEE_LABELS).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      className={`${styles.dropdownItem} ${assigneeFilter === key ? styles.dropdownItemActive : ""}`}
                      onClick={() => {
                        updateUrlParams({ assignee: key });
                        setOpenColDropdown(null);
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* STATUS Column Filter */}
            <div style={{ position: "relative" }}>
              <button
                type="button"
                className={`${styles.colHeaderBtn} ${statusFilter !== "all" ? styles.colHeaderBtnActive : ""}`}
                onClick={() => setOpenColDropdown(openColDropdown === "status" ? null : "status")}
              >
                <span>STATUS</span>
                <ChevronDown size={11} />
              </button>
              {openColDropdown === "status" && (
                <div className={styles.colHeaderDropdownMenu} role="menu">
                  {Object.entries(STATUS_LABELS).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      className={`${styles.dropdownItem} ${statusFilter === key ? styles.dropdownItemActive : ""}`}
                      onClick={() => {
                        updateUrlParams({ status: key });
                        setOpenColDropdown(null);
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* TIMELINE / PHASE Column Filter */}
            <div style={{ position: "relative" }}>
              <button
                type="button"
                className={`${styles.colHeaderBtn} ${phaseFilter !== "all" ? styles.colHeaderBtnActive : ""}`}
                onClick={() => setOpenColDropdown(openColDropdown === "phase" ? null : "phase")}
              >
                <span>TIMELINE</span>
                <ChevronDown size={11} />
              </button>
              {openColDropdown === "phase" && (
                <div className={styles.colHeaderDropdownMenu} role="menu">
                  {Object.entries(PHASE_LABELS).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      className={`${styles.dropdownItem} ${phaseFilter === key ? styles.dropdownItemActive : ""}`}
                      onClick={() => {
                        updateUrlParams({ phase: key });
                        setOpenColDropdown(null);
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* PRIORITY Column Filter */}
            <div style={{ position: "relative" }}>
              <button
                type="button"
                className={`${styles.colHeaderBtn} ${priorityFilter !== "all" ? styles.colHeaderBtnActive : ""}`}
                onClick={() => setOpenColDropdown(openColDropdown === "priority" ? null : "priority")}
              >
                <span>PRIORITY</span>
                <ChevronDown size={11} />
              </button>
              {openColDropdown === "priority" && (
                <div className={styles.colHeaderDropdownMenu} role="menu">
                  {Object.entries(PRIORITY_LABELS).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      className={`${styles.dropdownItem} ${priorityFilter === key ? styles.dropdownItemActive : ""}`}
                      onClick={() => {
                        updateUrlParams({ priority: key });
                        setOpenColDropdown(null);
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <span>PROGRESS</span>
            <span></span>
          </div>

          <div className={`${styles.projectTaskGroups} projectTaskGroups`}>
            {taskPage?.groups.map((group: { workPackage: WorkPackage; tasks: ProjectTask[] }) => (
              <ProjectTaskGroup
                key={group.workPackage.id}
                workPackage={group.workPackage}
                tasks={group.tasks}
                isCollapsed={isWpCollapsed(group.workPackage)}
                onToggleCollapse={() => toggleGroupCollapse(group.workPackage.id)}
                onSelectTask={handleSelectTask}
                onToggleTaskComplete={handleToggleTaskComplete}
              />
            ))}
          </div>
        </div>
      )}
        </div>
      )}

      {/* Single Drawer / Inspector Panel */}
      <ProjectTaskPanel
        panelState={panelState}
        projectId={project.id}
        projectName={project.name || "Nila Residence"}
        workPackages={workPackages}
        onClose={handleClosePanel}
        onTaskUpdated={() => {
          handleClosePanel();
          loadTasks();
        }}
      />
    </div>
  );
}
