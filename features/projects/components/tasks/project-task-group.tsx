"use client";

import React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { ProjectTask, WorkPackage } from "@/types/domain/project-task";
import { ProjectTaskRow } from "./project-task-row";
import styles from "../../projects.module.css";

interface ProjectTaskGroupProps {
  workPackage: WorkPackage;
  tasks: ProjectTask[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onSelectTask: (taskId: string) => void;
  onToggleTaskComplete: (taskId: string, currentStatus: ProjectTask["status"]) => void;
}

export function ProjectTaskGroup({
  workPackage,
  tasks,
  isCollapsed,
  onToggleCollapse,
  onSelectTask,
  onToggleTaskComplete,
}: ProjectTaskGroupProps) {
  // Compute concise attention state summary (e.g. 5 tasks · 1 overdue · 1 blocked)
  const overdueCount = tasks.filter((t) => t.dueDate && t.dueDate < "2026-07-24" && t.status !== "completed" && t.status !== "cancelled").length;
  const blockedCount = tasks.filter((t) => t.status === "blocked").length;
  const completedCount = tasks.filter((t) => t.status === "completed").length;

  interface SummaryItem {
    type: "overdue" | "blocked" | "completed" | "normal";
    text: string;
  }

  const summaryParts: SummaryItem[] = [];
  if (overdueCount > 0) {
    summaryParts.push({ type: "overdue", text: `${overdueCount} overdue` });
  }
  if (blockedCount > 0) {
    summaryParts.push({ type: "blocked", text: `${blockedCount} blocked` });
  }
  if (summaryParts.length === 0) {
    if (completedCount === tasks.length && tasks.length > 0) {
      summaryParts.push({ type: "completed", text: "All completed" });
    } else {
      summaryParts.push({ type: "normal", text: "No open risks" });
    }
  }

  return (
    <div
      className={`${styles.projectTaskGroup} projectTaskGroup`}
      data-collapsed={isCollapsed ? "true" : "false"}
    >
      {/* Group Header */}
      <div
        className={`${styles.projectTaskGroupHeader} projectTaskGroupHeader`}
        onClick={onToggleCollapse}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggleCollapse();
          }
        }}
      >
        <div className={styles.groupHeaderTitleCol}>
          <h3 className={`${styles.projectTaskGroupTitle} projectTaskGroupTitle`}>
            {workPackage.name}
          </h3>

          <span className={`${styles.projectTaskGroupCount} projectTaskGroupCount`}>
            {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
          </span>

          {summaryParts.length > 0 && (
            <div className={`${styles.projectTaskGroupSummary} projectTaskGroupSummary`}>
              {summaryParts.map((item, idx) => (
                <React.Fragment key={idx}>
                  <span className={styles.summaryDot}>·</span>
                  <span
                    className={
                      item.type === "overdue"
                        ? styles.summaryOverdue
                        : item.type === "blocked"
                        ? styles.summaryBlocked
                        : item.type === "completed"
                        ? styles.summaryCompleted
                        : styles.summaryNormal
                    }
                  >
                    {item.text}
                  </span>
                </React.Fragment>
              ))}
            </div>
          )}
        </div>

        {/* Right side: Chevron expand/collapse button */}
        <div className={styles.groupHeaderActions}>
          <button
            type="button"
            className={styles.groupCollapseToggleBtn}
            onClick={(e) => {
              e.stopPropagation();
              onToggleCollapse();
            }}
            aria-expanded={!isCollapsed}
            aria-label={`${isCollapsed ? "Expand" : "Collapse"} ${workPackage.name} work package`}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Expanded Table Surface */}
      {!isCollapsed && (
        <div className={`${styles.projectTaskTable} projectTaskTable`}>
          {/* Table Header inside each group (hidden on desktop in favor of single top sticky header) */}
          <div className={`${styles.projectTaskTableHeader} ${styles.groupTaskTableHeaderRepeated} projectTaskTableHeader`}>
            <span>Task</span>
            <span>Assignee</span>
            <span>Status</span>
            <span>Timeline</span>
            <span>Priority</span>
            <span>Progress</span>
            <span></span>
          </div>

          {/* Task Rows */}
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <ProjectTaskRow
                key={task.id}
                task={task}
                onClick={() => onSelectTask(task.id)}
                onToggleComplete={(e) => {
                  e.stopPropagation();
                  onToggleTaskComplete(task.id, task.status);
                }}
              />
            ))
          ) : (
            <div className={styles.emptyGroupState}>
              <p>No tasks in this work package yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
