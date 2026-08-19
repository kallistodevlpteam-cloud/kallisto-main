"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ProjectScheduleWorkspace } from "@/features/projects/components/schedule/project-schedule-workspace";
import {
  Plus,
  Search,
  ChevronDown,
  CheckCircle2,
  Circle,
  MoreHorizontal,
  Clock,
  AlertTriangle,
  MessageSquare,
  ChevronUp,
} from "lucide-react";

interface TaskItem {
  id: string;
  title: string;
  phase: string;
  commentsCount?: number;
  clientVisible?: boolean;
  assignees: { name: string; avatar: string }[];
  status: "Blocked" | "Waiting" | "In progress" | "To do" | "Completed";
  timeline: string;
  isOverdue?: boolean;
  priority: "Critical" | "High" | "Normal" | "Low";
  progress: number;
  completed: boolean;
}

interface TaskGroup {
  id: string;
  name: string;
  meta: string;
  tasks: TaskItem[];
}

const INITIAL_TASK_GROUPS: TaskGroup[] = [
  {
    id: "g-1",
    name: "Structural Works",
    meta: "5 tasks  ·  1 overdue  ·  1 blocked",
    tasks: [
      {
        id: "t-101",
        title: "Upload concrete cube test results",
        phase: "Superstructure",
        commentsCount: 2,
        assignees: [{ name: "Rahul Sharma", avatar: "/assets/rahul-avatar.jpg" }],
        status: "Blocked",
        timeline: "2 days overdue",
        isOverdue: true,
        priority: "Critical",
        progress: 30,
        completed: false,
      },
      {
        id: "t-102",
        title: "Review reinforcement before slab casting",
        phase: "Superstructure",
        commentsCount: 1,
        assignees: [{ name: "Arjun Menon", avatar: "/assets/arjun-avatar.jpg" }],
        status: "Waiting",
        timeline: "Tomorrow",
        priority: "High",
        progress: 40,
        completed: false,
      },
      {
        id: "t-103",
        title: "Confirm first floor slab casting schedule",
        phase: "Superstructure",
        commentsCount: 1,
        assignees: [
          { name: "Arjun Menon", avatar: "/assets/arjun-avatar.jpg" },
          { name: "Priya Patel", avatar: "/assets/priya-avatar.jpg" },
        ],
        status: "In progress",
        timeline: "Jul 24 - Jul 28",
        priority: "High",
        progress: 60,
        completed: false,
      },
      {
        id: "t-104",
        title: "Resolve staircase-opening structural revision",
        phase: "Superstructure",
        commentsCount: 3,
        assignees: [{ name: "Priya Patel", avatar: "/assets/priya-avatar.jpg" }],
        status: "In progress",
        timeline: "Jul 25 - Aug 2",
        priority: "Normal",
        progress: 50,
        completed: false,
      },
      {
        id: "t-105",
        title: "Prepare rebar fixings reinforcement checklist",
        phase: "Superstructure",
        assignees: [{ name: "Rahul Sharma", avatar: "/assets/rahul-avatar.jpg" }],
        status: "Completed",
        timeline: "Completed Jul 22",
        priority: "Normal",
        progress: 100,
        completed: true,
      },
    ],
  },
  {
    id: "g-2",
    name: "Architectural Drawings",
    meta: "4 tasks  ·  No open risks",
    tasks: [
      {
        id: "t-201",
        title: "Approve joinery specification revision",
        phase: "Design & Approval",
        clientVisible: true,
        assignees: [
          { name: "Priya Patel", avatar: "/assets/priya-avatar.jpg" },
          { name: "Arjun Menon", avatar: "/assets/arjun-avatar.jpg" },
        ],
        status: "Waiting",
        timeline: "Jul 22 - Jul 28",
        priority: "High",
        progress: 20,
        completed: false,
      },
      {
        id: "t-202",
        title: "Coordinate door and window schedule",
        phase: "Design & Approval",
        commentsCount: 2,
        assignees: [{ name: "Rahul Sharma", avatar: "/assets/rahul-avatar.jpg" }],
        status: "In progress",
        timeline: "Jul 26 - Aug 5",
        priority: "Normal",
        progress: 45,
        completed: false,
      },
      {
        id: "t-203",
        title: "Review kitchen-island dimensional update",
        phase: "Design & Approval",
        commentsCount: 1,
        assignees: [{ name: "Priya Patel", avatar: "/assets/priya-avatar.jpg" }],
        status: "To do",
        timeline: "Jul 26 - Jul 30",
        priority: "Low",
        progress: 0,
        completed: false,
      },
      {
        id: "t-204",
        title: "Publish ground-floor layout Rev-03",
        phase: "Design & Approval",
        commentsCount: 5,
        clientVisible: true,
        assignees: [{ name: "Priya Patel", avatar: "/assets/priya-avatar.jpg" }],
        status: "Completed",
        timeline: "Completed Jul 18",
        priority: "Normal",
        progress: 100,
        completed: true,
      },
    ],
  },
];

export function TasksListView() {
  const router = useRouter();
  const [taskGroups, setTaskGroups] = useState<TaskGroup[]>(INITIAL_TASK_GROUPS);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "my">("all");
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [phaseFilter, setPhaseFilter] = useState("all");
  const [openColDropdown, setOpenColDropdown] = useState<string | null>(null);
  const [activeHeaderTab, setActiveHeaderTab] = useState<"tasks" | "timeline">("tasks");

  const STATUS_LABELS: Record<string, string> = {
    all: "All Statuses",
    "In progress": "In progress",
    "To do": "To do",
    "Completed": "Completed",
    "Blocked": "Blocked",
  };

  const PRIORITY_LABELS: Record<string, string> = {
    all: "All Priorities",
    High: "High",
    Normal: "Normal",
    Low: "Low",
  };

  const ASSIGNEE_LABELS: Record<string, string> = {
    all: "All Assignees",
    "Rahul Sharma": "Rahul Sharma",
    "Arjun Menon": "Arjun Menon",
    "Priya Patel": "Priya Patel",
  };

  const PHASE_LABELS: Record<string, string> = {
    all: "All Phases",
    Superstructure: "Superstructure",
    "Design & Approval": "Design & Approval",
  };

  const toggleGroupCollapse = (groupId: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const toggleTaskCompletion = (groupId: string, taskId: string) => {
    setTaskGroups((prevGroups) =>
      prevGroups.map((group) => {
        if (group.id !== groupId) return group;
        return {
          ...group,
          tasks: group.tasks.map((task) => {
            if (task.id !== taskId) return task;
            const isNowCompleted = !task.completed;
            return {
              ...task,
              completed: isNowCompleted,
              status: isNowCompleted ? "Completed" : "In progress",
              progress: isNowCompleted ? 100 : 50,
            };
          }),
        };
      })
    );
  };

  return (
    <div className="tasks-page-container">
      {/* ── HEADER ── */}
      <div className="tasks-page-header" style={{ minHeight: "48px", height: "48px", borderBottom: "1px solid #e2e8f0" }}>
        <div className="tasks-header-left">
          <div className="tab-heading-group">
            <button
              type="button"
              className={`header-tab-btn ${activeHeaderTab === "tasks" ? "is-active" : ""}`}
              onClick={() => setActiveHeaderTab("tasks")}
            >
              Tasks
            </button>
            <button
              type="button"
              className={`header-tab-btn ${activeHeaderTab === "timeline" ? "is-active" : ""}`}
              onClick={() => setActiveHeaderTab("timeline")}
            >
              Timeline
            </button>
          </div>
        </div>
      </div>

      {activeHeaderTab === "timeline" ? (
        <div style={{ marginTop: "12px", width: "100%", flex: 1, minHeight: 0, height: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <ProjectScheduleWorkspace
            projectId="proj-001"
            projectName="Nila Residence"
          />
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, overflowY: "auto", paddingBottom: "32px" }}>
          <p className="tasks-subtitle" style={{ marginTop: "12px" }}>Track and coordinate project work across teams and phases.</p>
          <div className="tasks-summary-metrics">
            <span className="metric-bold">24 tasks</span>
            <span className="dot-sep">•</span>
            <span className="metric-red">3 overdue</span>
            <span className="dot-sep">•</span>
            <span className="metric-amber">2 blocked</span>
            <span className="dot-sep">•</span>
            <span className="metric-blue">11 due this week</span>
          </div>

          {/* ── SEARCH & FILTER BAR ── */}
          <div className="tasks-filter-bar">
        <div className="filter-bar-left">
          {/* Search Box */}
          <div className="tasks-search-box">
            <Search size={14} style={{ color: "#94a3b8", flexShrink: 0, marginRight: "8px" }} />
            <input
              type="text"
              placeholder="Search tasks, assignees or phases"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="tasks-search-input"
            />
          </div>
        </div>

        {/* View Segmented Toggle (My Tasks vs All Project Tasks) */}
        <div className="filter-bar-right">
          <div className="tasks-segmented-toggle">
            <button
              type="button"
              className={`segmented-btn ${activeTab === "my" ? "is-active" : ""}`}
              onClick={() => setActiveTab("my")}
            >
              My Tasks
            </button>
            <button
              type="button"
              className={`segmented-btn ${activeTab === "all" ? "is-active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              All Tasks
            </button>
          </div>
        </div>
      </div>

      {/* ── TABLE HEADERS ── */}
      <div className="tasks-table-head-row">
        <div className="col-task">TASK</div>

        {/* ASSIGNEE Column Filter */}
        <div className="col-assignee" style={{ position: "relative" }}>
          <button
            type="button"
            className={`col-header-filter-btn ${assigneeFilter !== "all" ? "is-active" : ""}`}
            onClick={() => setOpenColDropdown(openColDropdown === "assignee" ? null : "assignee")}
          >
            <span>ASSIGNEE</span>
            <ChevronDown size={11} />
          </button>
          {openColDropdown === "assignee" && (
            <div className="col-header-dropdown-menu" role="menu">
              {Object.entries(ASSIGNEE_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className={`col-dropdown-item ${assigneeFilter === key ? "is-active" : ""}`}
                  onClick={() => {
                    setAssigneeFilter(key);
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
        <div className="col-status" style={{ position: "relative" }}>
          <button
            type="button"
            className={`col-header-filter-btn ${statusFilter !== "all" ? "is-active" : ""}`}
            onClick={() => setOpenColDropdown(openColDropdown === "status" ? null : "status")}
          >
            <span>STATUS</span>
            <ChevronDown size={11} />
          </button>
          {openColDropdown === "status" && (
            <div className="col-header-dropdown-menu" role="menu">
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className={`col-dropdown-item ${statusFilter === key ? "is-active" : ""}`}
                  onClick={() => {
                    setStatusFilter(key);
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
        <div className="col-timeline" style={{ position: "relative" }}>
          <button
            type="button"
            className={`col-header-filter-btn ${phaseFilter !== "all" ? "is-active" : ""}`}
            onClick={() => setOpenColDropdown(openColDropdown === "phase" ? null : "phase")}
          >
            <span>TIMELINE</span>
            <ChevronDown size={11} />
          </button>
          {openColDropdown === "phase" && (
            <div className="col-header-dropdown-menu" role="menu">
              {Object.entries(PHASE_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className={`col-dropdown-item ${phaseFilter === key ? "is-active" : ""}`}
                  onClick={() => {
                    setPhaseFilter(key);
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
        <div className="col-priority" style={{ position: "relative" }}>
          <button
            type="button"
            className={`col-header-filter-btn ${priorityFilter !== "all" ? "is-active" : ""}`}
            onClick={() => setOpenColDropdown(openColDropdown === "priority" ? null : "priority")}
          >
            <span>PRIORITY</span>
            <ChevronDown size={11} />
          </button>
          {openColDropdown === "priority" && (
            <div className="col-header-dropdown-menu" role="menu">
              {Object.entries(PRIORITY_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className={`col-dropdown-item ${priorityFilter === key ? "is-active" : ""}`}
                  onClick={() => {
                    setPriorityFilter(key);
                    setOpenColDropdown(null);
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="col-progress">PROGRESS</div>
      </div>

      {/* ── TASK GROUPS ── */}
      <div className="task-groups-list">
        {taskGroups.map((group) => {
          const isCollapsed = collapsedGroups[group.id];
          const filteredTasks = group.tasks.filter((t) => {
            const matchesSearch =
              t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              t.phase.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === "all" || t.status === statusFilter;
            const matchesPriority = priorityFilter === "all" || t.priority === priorityFilter;
            const matchesAssignee =
              assigneeFilter === "all" ||
              t.assignees.some((a) => a.name === assigneeFilter);
            const matchesPhase = phaseFilter === "all" || t.phase === phaseFilter;
            return matchesSearch && matchesStatus && matchesPriority && matchesAssignee && matchesPhase;
          });

          return (
            <div key={group.id} className="task-group-card">
              {/* Group Banner Header */}
              <div
                className="task-group-header"
                onClick={() => toggleGroupCollapse(group.id)}
              >
                <div className="group-title-row">
                  <span className="group-name">{group.name}</span>
                  <span className="group-meta">{group.meta}</span>
                </div>
                <button type="button" className="group-collapse-btn">
                  {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                </button>
              </div>

              {/* Group Task Rows */}
              {!isCollapsed && (
                <div className="task-rows-stack">
                  {filteredTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`task-item-row ${task.completed ? "is-completed-row" : ""} ${
                        task.status === "Blocked" ? "is-blocked-row" : ""
                      } ${task.status === "Waiting" ? "is-waiting-row" : ""}`}
                    >
                      {/* Column 1: Checkbox & Task Title */}
                      <div className="col-task task-cell">
                        <button
                          type="button"
                          className="task-checkbox-btn"
                          onClick={() => toggleTaskCompletion(group.id, task.id)}
                        >
                          {task.completed ? (
                            <CheckCircle2 size={18} className="icon-checked" />
                          ) : (
                            <Circle size={18} className="icon-unchecked" />
                          )}
                        </button>

                        <div className="task-title-block">
                          <span className={`task-title-text ${task.completed ? "strikethrough" : ""}`}>
                            {task.title}
                          </span>
                          <div className="task-sub-meta">
                            <span className="task-phase-name">{task.phase}</span>
                            {task.commentsCount && (
                              <span className="task-comment-count">
                                <MessageSquare size={11} />
                                <span>{task.commentsCount}</span>
                              </span>
                            )}
                            {task.clientVisible && (
                              <span className="client-visible-badge">CLIENT VISIBLE</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Column 2: Assignee */}
                      <div className="col-assignee assignee-cell">
                        <div className="assignee-avatar-stack">
                          <Image
                            src={task.assignees[0].avatar}
                            alt={task.assignees[0].name}
                            width={22}
                            height={22}
                            className="assignee-avatar"
                          />
                          <span className="assignee-name">{task.assignees[0].name}</span>
                          {task.assignees.length > 1 && (
                            <span className="assignee-more-count">+{task.assignees.length - 1}</span>
                          )}
                        </div>
                      </div>

                      {/* Column 3: Status */}
                      <div className="col-status status-cell">
                        <span className={`status-pill status-${task.status.toLowerCase().replace(/\s+/g, "-")}`}>
                          <span className="status-dot">•</span>
                          <span>{task.status}</span>
                        </span>
                      </div>

                      {/* Column 4: Timeline */}
                      <div className="col-timeline timeline-cell">
                        {task.isOverdue ? (
                          <span className="timeline-overdue-text">
                            <Clock size={13} />
                            <span>{task.timeline}</span>
                          </span>
                        ) : (
                          <span className="timeline-normal-text">{task.timeline}</span>
                        )}
                      </div>

                      {/* Column 5: Priority */}
                      <div className="col-priority priority-cell">
                        <span className={`priority-text priority-${task.priority.toLowerCase()}`}>
                          {task.priority}
                        </span>
                      </div>

                      {/* Column 6: Progress Bar */}
                      <div className="col-progress progress-cell">
                        <span className="progress-percent-text">{task.progress}%</span>
                        <div className="progress-bar-track">
                          <div
                            className={`progress-bar-fill ${task.completed ? "fill-complete" : ""}`}
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                        <button type="button" className="task-row-more-btn" title="More options">
                          <MoreHorizontal size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      </div>
      )}
    </div>
  );
}
