"use client";

import React from "react";
import { Clock, MessageSquare, AlertTriangle, CheckCircle2 } from "lucide-react";
import { ProjectTask, WorkPackage } from "@/types/domain/project-task";
import styles from "../../projects.module.css";

interface ProjectTaskBoardProps {
  tasks: ProjectTask[];
  workPackages: WorkPackage[];
  onSelectTask: (taskId: string) => void;
  onChangeStatus: (taskId: string, newStatus: ProjectTask["status"]) => void;
}

export function ProjectTaskBoard({
  tasks,
  workPackages,
  onSelectTask,
  onChangeStatus,
}: ProjectTaskBoardProps) {
  const wpMap = new Map(workPackages.map((wp) => [wp.id, wp.name]));

  // Column definitions
  const columns = [
    { id: "todo", label: "To Do", statuses: ["todo"] },
    { id: "in_progress", label: "In Progress", statuses: ["in_progress"] },
    { id: "waiting_blocked", label: "Waiting / Blocked", statuses: ["waiting", "blocked"] },
    { id: "completed", label: "Completed", statuses: ["completed"] },
  ];

  return (
    <div className={styles.boardContainer}>
      {columns.map((col) => {
        const colTasks = tasks.filter((t) => col.statuses.includes(t.status));

        return (
          <div key={col.id} className={styles.boardColumn}>
            {/* Column Header */}
            <div className={styles.boardColumnHeader}>
              <div className={styles.columnTitleGroup}>
                <span className={styles.columnTitle}>{col.label}</span>
                <span className={styles.columnCount}>{colTasks.length}</span>
              </div>
            </div>

            {/* Task Cards Stack */}
            <div className={styles.boardCardsList}>
              {colTasks.length === 0 ? (
                <div className={styles.boardEmptyCard}>No tasks</div>
              ) : (
                colTasks.map((task) => {
                  const wpName = wpMap.get(task.workPackageId) || "General";
                  const isBlocked = task.status === "blocked";
                  const isCompleted = task.status === "completed";

                  return (
                    <div
                      key={task.id}
                      className={`${styles.boardCard} ${isBlocked ? styles.boardCardBlocked : ""} ${isCompleted ? styles.boardCardCompleted : ""}`}
                      onClick={() => onSelectTask(task.id)}
                    >
                      <div className={styles.boardCardHeader}>
                        <span className={styles.boardCardWorkPackage}>{wpName}</span>
                        {!isCompleted && task.priority === "critical" && (
                          <span className={styles.boardPriorityCritical}>Critical</span>
                        )}
                        {!isCompleted && task.priority === "high" && (
                          <span className={styles.boardPriorityHigh}>High</span>
                        )}
                        {isCompleted && (task.priority === "critical" || task.priority === "high") && (
                          <span className={styles.boardPriorityCompleted}>
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                          </span>
                        )}
                      </div>

                      <h4 className={`${styles.boardCardTitle} ${isCompleted ? styles.taskTitleCompleted : ""}`}>
                        {task.title}
                      </h4>

                      {task.blockerReason && (
                        <div className={styles.boardBlockerNote}>
                          <AlertTriangle size={11} />
                          <span>{task.blockerReason}</span>
                        </div>
                      )}

                      <div className={styles.boardCardFooter}>
                        <span className={styles.boardTimeline}>
                          <Clock size={11} />
                          <span>{task.dueDate || "No date"}</span>
                        </span>

                        <div className={styles.boardFooterRight}>
                          {task.commentCount > 0 && (
                            <span className={styles.boardMetaItem}>
                              <MessageSquare size={11} />
                              <span>{task.commentCount}</span>
                            </span>
                          )}
                          {task.progress !== undefined && task.progress >= 0 && (
                            <span className={styles.boardProgressBadge}>{task.progress}%</span>
                          )}
                        </div>
                      </div>

                      {/* Status Selector dropdown */}
                      <div className={styles.boardCardActionRow}>
                        <select
                          className={styles.boardStatusSelect}
                          value={task.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            e.stopPropagation();
                            onChangeStatus(task.id, e.target.value as ProjectTask["status"]);
                          }}
                        >
                          <option value="todo">To Do</option>
                          <option value="in_progress">In Progress</option>
                          <option value="waiting">Waiting</option>
                          <option value="blocked">Blocked</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
