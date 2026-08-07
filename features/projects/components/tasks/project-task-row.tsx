"use client";

import React from "react";
import Image from "next/image";
import {
  CheckCircle2,
  Circle,
  MessageSquare,
  MoreHorizontal,
  Clock,
} from "lucide-react";
import { ProjectTask } from "@/types/domain/project-task";
import styles from "../../projects.module.css";

interface ProjectTaskRowProps {
  task: ProjectTask;
  onClick: () => void;
  onToggleComplete: (e: React.MouseEvent) => void;
}

export function ProjectTaskRow({ task, onClick, onToggleComplete }: ProjectTaskRowProps) {
  // Format due date string exactly as shown in reference
  function renderTimeline(t: ProjectTask) {
    if (!t.dueDate) return "No due date";
    if (t.status === "completed") {
      const dateStr = t.completedAt ? t.completedAt.slice(0, 10) : t.dueDate;
      const formatted = new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      return `Completed ${formatted}`;
    }

    const todayStr = "2026-07-24";
    if (t.dueDate === todayStr) return "Today";
    if (t.dueDate === "2026-07-25") return "Tomorrow";
    if (t.dueDate < todayStr) {
      const diff = Math.floor((new Date(todayStr).getTime() - new Date(t.dueDate).getTime()) / (1000 * 3600 * 24));
      return `${diff} ${diff === 1 ? "day" : "days"} overdue`;
    }
    if (t.startDate) {
      const s = new Date(t.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const d = new Date(t.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      return `${s} – ${d}`;
    }
    return new Date(t.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  // Format Status Pill exactly as in reference
  function renderStatusPill(status: ProjectTask["status"]) {
    switch (status) {
      case "in_progress":
        return (
          <span className={`${styles.projectTaskStatus} ${styles.statusInProgress}`}>
            <span className={styles.statusDot} />
            <span>In progress</span>
          </span>
        );
      case "waiting":
        return (
          <span className={`${styles.projectTaskStatus} ${styles.statusWaiting}`}>
            <span className={styles.statusDot} />
            <span>Waiting</span>
          </span>
        );
      case "blocked":
        return (
          <span className={`${styles.projectTaskStatus} ${styles.statusBlocked}`}>
            <span className={styles.statusDot} />
            <span>Blocked</span>
          </span>
        );
      case "completed":
        return (
          <span className={`${styles.projectTaskStatus} ${styles.statusCompleted}`}>
            <span className={styles.statusDot} />
            <span>Completed</span>
          </span>
        );
      case "cancelled":
        return (
          <span className={`${styles.projectTaskStatus} ${styles.statusCancelled}`}>
            <span className={styles.statusDot} />
            <span>Cancelled</span>
          </span>
        );
      case "todo":
      default:
        return (
          <span className={`${styles.projectTaskStatus} ${styles.statusTodo}`}>
            <span className={styles.statusDot} />
            <span>To do</span>
          </span>
        );
    }
  }

  // Format Priority exactly as in reference
  function renderPriority(priority: ProjectTask["priority"], isTaskCompleted?: boolean) {
    if (isTaskCompleted) {
      const label = priority.charAt(0).toUpperCase() + priority.slice(1);
      return <span className={`${styles.priorityCell} ${styles.priorityCompleted}`}>{label}</span>;
    }
    switch (priority) {
      case "critical":
        return <span className={`${styles.priorityCell} ${styles.priorityCritical}`}>Critical</span>;
      case "high":
        return <span className={`${styles.priorityCell} ${styles.priorityHigh}`}>High</span>;
      case "low":
        return <span className={`${styles.priorityCell} ${styles.priorityLow}`}>Low</span>;
      case "normal":
      default:
        return <span className={`${styles.priorityCell} ${styles.priorityNormal}`}>Normal</span>;
    }
  }

  // Assignee Mapping
  const ASSIGNEE_MAP: Record<string, { name: string; avatar?: string; initials: string }> = {
    "user-arjun": {
      name: "Arjun Menon",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
      initials: "AM",
    },
    "user-rahul": {
      name: "Rahul Sharma",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      initials: "RS",
    },
    "user-priya": {
      name: "Priya Patel",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
      initials: "PP",
    },
  };

  const primaryAssigneeId = task.assigneeIds[0];
  const primaryAssignee = ASSIGNEE_MAP[primaryAssigneeId] || {
    name: "Unassigned",
    initials: "UA",
  };
  const extraCount = task.assigneeIds.length - 1;
  const isCompleted = task.status === "completed";
  const isOverdue = task.dueDate && task.dueDate < "2026-07-24" && task.status !== "completed" && task.status !== "cancelled";
  const isCriticalOrHigh = task.priority === "critical" || task.priority === "high";
  const isBlocked = task.status === "blocked";
  const isWaitingOrApproaching = (task.status === "waiting" || task.status === "in_progress") && (task.dueDate === "2026-07-24" || task.dueDate === "2026-07-25");

  // Determine restrained row alert styling
  let rowAlertStyle = "";
  if (isCompleted) {
    rowAlertStyle = styles.rowAlertCompleted;
  } else if ((isOverdue && isCriticalOrHigh) || (isBlocked && task.priority === "critical")) {
    rowAlertStyle = styles.rowAlertOverdueCritical;
  } else if (isOverdue || isBlocked) {
    rowAlertStyle = styles.rowAlertOverdue;
  } else if (isWaitingOrApproaching) {
    rowAlertStyle = styles.rowAlertWaiting;
  }

  // Format clean concise phase name (e.g. "Phase 2: Superstructure" -> "Superstructure")
  function getCleanPhaseName(rawPhase?: string): string | null {
    if (!rawPhase) return null;
    if (rawPhase.includes(": ")) return rawPhase.split(": ")[1];
    if (rawPhase === "phase-1") return "Design & Approval";
    if (rawPhase === "phase-2") return "Superstructure";
    return rawPhase;
  }

  // Build secondary metadata items cleanly
  const metaItems: React.ReactNode[] = [];

  // Item 1: Phase (concise)
  const cleanPhase = getCleanPhaseName(task.phaseId);
  if (cleanPhase) {
    metaItems.push(<span key="phase">{cleanPhase}</span>);
  } else if (task.milestoneId) {
    metaItems.push(<span key="ms">{task.milestoneId}</span>);
  }

  // Item 2: Comment count with icon
  if (task.commentCount > 0) {
    metaItems.push(
      <span key="comments" className={styles.metaCommentGroup}>
        <MessageSquare size={12} className={styles.metaCommentIcon} />
        <span>{task.commentCount}</span>
      </span>
    );
  }

  // Item 3: Visibility labels placed after metadata
  if (task.visibility === "client_visible") {
    metaItems.push(
      <span key="client_visible" className={`${styles.projectTaskVisibility} projectTaskVisibility`}>
        CLIENT VISIBLE
      </span>
    );
  }

  return (
    <div
      className={`${styles.projectTaskRow} projectTaskRow ${rowAlertStyle}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* 1. Task Column */}
      <div className={styles.taskCellMain}>
        <button
          type="button"
          className={styles.taskCheckBtn}
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete(e);
          }}
          aria-label={task.status === "completed" ? "Mark incomplete" : "Mark complete"}
        >
          {task.status === "completed" ? (
            <CheckCircle2 size={18} className={styles.checkIconCompleted} />
          ) : (
            <Circle size={18} className={styles.checkIconTodo} />
          )}
        </button>

        <div className={styles.taskTitleGroup}>
          <span
            className={`${styles.projectTaskTitle} projectTaskTitle ${
              task.status === "completed" ? styles.taskTitleCompleted : ""
            }`}
          >
            {task.title}
          </span>

          {/* Secondary Metadata Row */}
          <div className={`${styles.projectTaskMeta} projectTaskMeta`}>
            {metaItems.map((item, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className={styles.metaDot}>·</span>}
                {item}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Assignee Column */}
      <div className={`${styles.projectTaskCell} projectTaskCell ${styles.cellAssignee}`}>
        <div className={`${styles.projectTaskAssignee} projectTaskAssignee`}>
          {primaryAssignee.avatar ? (
            <Image
              src={primaryAssignee.avatar}
              alt={primaryAssignee.name}
              width={24}
              height={24}
              className={`${styles.projectTaskAssigneeAvatar} projectTaskAssigneeAvatar`}
              unoptimized
            />
          ) : (
            <span className={styles.assigneeInitials}>{primaryAssignee.initials}</span>
          )}
          <span className={`${styles.projectTaskAssigneeName} projectTaskAssigneeName`}>
            {primaryAssignee.name}
          </span>
          {extraCount > 0 && <span className={styles.assigneeMoreBadge}>+{extraCount}</span>}
        </div>
      </div>

      {/* 3. Status Column */}
      <div className={`${styles.projectTaskCell} projectTaskCell ${styles.cellStatus}`}>
        {renderStatusPill(task.status)}
      </div>

      {/* 4. Timeline Column */}
      <div className={`${styles.projectTaskCell} projectTaskCell ${styles.cellTimeline}`}>
        <span className={`${styles.timelineText} ${isOverdue ? styles.timelineOverdue : ""}`}>
          {isOverdue && <Clock size={14} style={{ marginRight: 4, display: "inline" }} />}
          {renderTimeline(task)}
        </span>
      </div>

      {/* 5. Priority Column */}
      <div className={`${styles.projectTaskCell} projectTaskCell ${styles.cellPriority}`}>
        {renderPriority(task.priority, isCompleted)}
      </div>

      {/* 6. Progress Column */}
      <div className={`${styles.projectTaskCell} projectTaskCell ${styles.cellProgress}`}>
        {task.progress !== undefined && task.progress >= 0 ? (
          <div className={`${styles.projectTaskProgress} projectTaskProgress`}>
            <span className={`${styles.projectTaskProgressText} projectTaskProgressText`}>
              {task.progress}%
            </span>
            <div className={`${styles.projectTaskProgressTrack} projectTaskProgressTrack`}>
              <div
                className={`${styles.projectTaskProgressValue} projectTaskProgressValue`}
                style={{ width: `${task.progress}%` }}
              />
            </div>
          </div>
        ) : (
          <span className={styles.noProgressDash}>—</span>
        )}
      </div>

      {/* 7. More Overflow Menu */}
      <div className={`${styles.projectTaskCell} projectTaskCell ${styles.cellMore}`}>
        <button
          type="button"
          className={styles.rowMoreBtn}
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          aria-label="Task options"
        >
          <MoreHorizontal size={16} />
        </button>
      </div>
    </div>
  );
}
