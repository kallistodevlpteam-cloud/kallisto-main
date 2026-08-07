"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  Building2,
  Milestone,
  Link as LinkIcon,
  Paperclip,
  MessageSquare,
  Plus,
  Trash2,
  Eye,
  Edit2,
  Send,
} from "lucide-react";
import { ProjectTask, TaskChecklistItem, TaskPanelState, WorkPackage } from "@/types/domain/project-task";
import { projectTaskService } from "@/services/repositories/project-task.service";
import styles from "../../projects.module.css";

interface ProjectTaskPanelProps {
  panelState: TaskPanelState;
  projectId: string;
  projectName: string;
  workPackages: WorkPackage[];
  onClose: () => void;
  onTaskUpdated: () => void;
}

export function ProjectTaskPanel({
  panelState,
  projectId,
  projectName,
  workPackages,
  onClose,
  onTaskUpdated,
}: ProjectTaskPanelProps) {
  const [task, setTask] = useState<ProjectTask | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states for Create / Edit
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [workPackageId, setWorkPackageId] = useState(workPackages[0]?.id || "wp-1");
  const [status, setStatus] = useState<ProjectTask["status"]>("todo");
  const [priority, setPriority] = useState<ProjectTask["priority"]>("normal");
  const [visibility, setVisibility] = useState<ProjectTask["visibility"]>("project_team");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [blockerReason, setBlockerReason] = useState("");
  const [newChecklistLabel, setNewChecklistLabel] = useState("");
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Array<{ id: string; author: string; text: string; time: string }>>([
    { id: "c1", author: "Arjun Menon", text: "Checked reinforcement layout with site engineer.", time: "Today 09:30 AM" },
    { id: "c2", author: "Rahul Sharma", text: "Lab test cube strength report pending from auditor.", time: "Yesterday 04:15 PM" },
  ]);

  // Load task detail when inspect or edit
  useEffect(() => {
    async function loadTask() {
      if (panelState.type === "inspect" || panelState.type === "edit") {
        setLoading(true);
        setErrorMessage(null);
        try {
          const t = await projectTaskService.getTaskById("ws-default", projectId, panelState.taskId);
          if (t) {
            setTask(t);
            setTitle(t.title);
            setDescription(t.description || "");
            setWorkPackageId(t.workPackageId);
            setStatus(t.status);
            setPriority(t.priority);
            setVisibility(t.visibility);
            setStartDate(t.startDate || "");
            setDueDate(t.dueDate || "");
            setBlockerReason(t.blockerReason || "");
          } else {
            setErrorMessage("Task not found.");
          }
        } catch (err) {
          console.error(err);
          setErrorMessage("Failed to load task.");
        } finally {
          setLoading(false);
        }
      } else if (panelState.type === "create") {
        setTask(null);
        setTitle("");
        setDescription("");
        setWorkPackageId(workPackages[0]?.id || "wp-1");
        setStatus("todo");
        setPriority("normal");
        setVisibility("project_team");
        setStartDate("2026-07-24");
        setDueDate("2026-07-30");
        setBlockerReason("");
      }
    }

    loadTask();
  }, [panelState, projectId, workPackages]);

  if (panelState.type === "closed") {
    return null;
  }

  // Submit Create Task
  async function handleCreateTask(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await projectTaskService.createTask({
        workspaceId: "ws-default",
        projectId,
        actorId: "user-arjun",
        idempotencyKey: `create-${Date.now()}`,
        title,
        description,
        workPackageId,
        status,
        priority,
        visibility,
        startDate,
        dueDate,
        assigneeIds: ["user-arjun"],
        reporterId: "user-arjun",
      });

      onTaskUpdated();
      onClose();
    } catch (err: unknown) {
      console.error(err);
      setErrorMessage((err as Error).message || "Failed to create task.");
    }
  }

  // Submit Status Change
  async function handleStatusChange(newStatus: ProjectTask["status"]) {
    if (!task) return;
    setErrorMessage(null);

    let reason = blockerReason;
    if (newStatus === "blocked" && !reason) {
      reason = "Awaiting material verification from vendor";
    }

    try {
      const updated = await projectTaskService.changeTaskStatus({
        workspaceId: "ws-default",
        projectId,
        taskId: task.id,
        status: newStatus,
        actorId: "user-arjun",
        expectedVersion: task.version,
        idempotencyKey: `status-${task.id}-${Date.now()}`,
        blockerReason: newStatus === "blocked" ? reason : undefined,
        approvalEvidenceId: task.workPackageId === "wp-6" && newStatus === "completed" ? "ev-approval-101" : undefined,
      });

      setTask(updated);
      setStatus(updated.status);
      onTaskUpdated();
    } catch (err: unknown) {
      console.error(err);
      setErrorMessage((err as Error).message || "Status transition failed.");
    }
  }

  // Submit Visibility Change
  async function handleVisibilityChange(newVis: ProjectTask["visibility"]) {
    if (!task) return;
    try {
      const updated = await projectTaskService.changeTaskVisibility({
        workspaceId: "ws-default",
        projectId,
        taskId: task.id,
        actorId: "user-arjun",
        expectedVersion: task.version,
        idempotencyKey: `vis-${task.id}-${Date.now()}`,
        targetVisibility: newVis,
        confirmation: true,
      });
      setTask(updated);
      setVisibility(updated.visibility);
      onTaskUpdated();
    } catch (err: unknown) {
      console.error(err);
      setErrorMessage((err as Error).message || "Visibility change failed.");
    }
  }

  // Post Comment
  function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim()) return;

    setComments([
      ...comments,
      {
        id: `c-${Date.now()}`,
        author: "Arjun Menon",
        text: commentText.trim(),
        time: "Just now",
      },
    ]);
    setCommentText("");
  }

  return (
    <div className={styles.panelBackdrop} onClick={onClose}>
      <div
        className={styles.panelContainer}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className={styles.panelHeader}>
          <div className={styles.panelHeaderTitleGroup}>
            <span className={styles.panelEyebrow}>
              {projectName} · {panelState.type === "create" ? "New Task" : task?.id || "Task"}
            </span>
            <h3 className={styles.panelTitle}>
              {panelState.type === "create"
                ? "Create Project Task"
                : panelState.type === "edit"
                ? "Edit Task"
                : task?.title || "Task Details"}
            </h3>
          </div>

          <button
            type="button"
            className={styles.panelCloseBtn}
            onClick={onClose}
            aria-label="Close panel"
          >
            <X size={18} />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className={styles.panelErrorAlert}>
            <AlertTriangle size={15} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Body Content */}
        {loading ? (
          <div className={styles.panelLoadingState}>Loading task workspace data...</div>
        ) : panelState.type === "create" ? (
          /* CREATE TASK FORM */
          <form className={styles.panelForm} onSubmit={handleCreateTask}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Task Title *</label>
              <input
                type="text"
                className={styles.formInput}
                placeholder="e.g. Confirm reinforcement steel batching"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Work Package *</label>
              <select
                className={styles.formSelect}
                value={workPackageId}
                onChange={(e) => setWorkPackageId(e.target.value)}
              >
                {workPackages.map((wp) => (
                  <option key={wp.id} value={wp.id}>
                    {wp.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Status</label>
                <select
                  className={styles.formSelect}
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ProjectTask["status"])}
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="waiting">Waiting</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Priority</label>
                <select
                  className={styles.formSelect}
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as ProjectTask["priority"])}
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Start Date</label>
                <input
                  type="date"
                  className={styles.formInput}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Due Date</label>
                <input
                  type="date"
                  className={styles.formInput}
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Visibility</label>
              <select
                className={styles.formSelect}
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as ProjectTask["visibility"])}
              >
                <option value="project_team">Project Team (Internal)</option>
                <option value="client_visible">Client Visible</option>
                <option value="internal">Internal Only</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Description</label>
              <textarea
                className={styles.formTextarea}
                rows={4}
                placeholder="Enter scope details, site zone, or technical notes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className={styles.formFooter}>
              <button type="button" className={styles.secondaryBtn} onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className={styles.primaryBtn}>
                Create Task
              </button>
            </div>
          </form>
        ) : task ? (
          /* INSPECT / EDIT TASK VIEW */
          <div className={styles.panelBody}>
            {/* Quick Actions */}
            <div className={styles.panelActionBar}>
              <button
                type="button"
                className={`${styles.panelActionBtn} ${
                  task.status === "completed" ? styles.actionCompleted : ""
                }`}
                onClick={() => handleStatusChange(task.status === "completed" ? "in_progress" : "completed")}
              >
                <CheckCircle2 size={15} />
                <span>{task.status === "completed" ? "Completed" : "Mark Complete"}</span>
              </button>

              <button
                type="button"
                className={styles.panelActionBtn}
                onClick={() => handleVisibilityChange(task.visibility === "client_visible" ? "project_team" : "client_visible")}
              >
                <Eye size={15} />
                <span>{task.visibility === "client_visible" ? "Client Visible" : "Make Client Visible"}</span>
              </button>
            </div>

            {/* Overview Details */}
            <div className={styles.panelSection}>
              <h5 className={styles.panelSectionTitle}>Task Overview</h5>
              <div className={styles.panelMetaGrid}>
                <div className={styles.panelMetaItem}>
                  <Building2 size={14} />
                  <span>Work Package:</span>
                  <strong>
                    {workPackages.find((wp) => wp.id === task.workPackageId)?.name || task.workPackageId}
                  </strong>
                </div>

                <div className={styles.panelMetaItem}>
                  <User size={14} />
                  <span>Assignee:</span>
                  <strong>{task.assigneeIds.join(", ") || "Arjun Menon"}</strong>
                </div>

                <div className={styles.panelMetaItem}>
                  <Clock size={14} />
                  <span>Timeline:</span>
                  <strong>{task.dueDate ? `Due ${task.dueDate}` : "No due date"}</strong>
                </div>

                {task.phaseId && (
                  <div className={styles.panelMetaItem}>
                    <Milestone size={14} />
                    <span>Phase:</span>
                    <strong>{task.phaseId}</strong>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className={styles.panelSection}>
              <h5 className={styles.panelSectionTitle}>Description</h5>
              <p className={styles.panelDescText}>
                {task.description || "No specific description provided for this task scope."}
              </p>
            </div>

            {/* Blocker Alert Banner */}
            {task.blockerReason && (
              <div className={styles.panelBlockerBanner}>
                <AlertTriangle size={16} />
                <div>
                  <strong>Task Blocked</strong>
                  <p>{task.blockerReason}</p>
                </div>
              </div>
            )}

            {/* Progress & Checklist */}
            <div className={styles.panelSection}>
              <div className={styles.panelSectionHeader}>
                <h5 className={styles.panelSectionTitle}>Checklist & Progress</h5>
                <span className={styles.panelProgressBadge}>{task.progress !== undefined ? `${task.progress}%` : "—"}</span>
              </div>

              <div className={styles.panelProgressTrack}>
                <div className={styles.panelProgressValue} style={{ width: `${task.progress || 0}%` }} />
              </div>

              {/* Comments Section */}
              <div className={styles.panelSection} style={{ marginTop: 24 }}>
                <h5 className={styles.panelSectionTitle}>Activity & Comments</h5>
                <div className={styles.commentsList}>
                  {comments.map((c) => (
                    <div key={c.id} className={styles.commentItem}>
                      <div className={styles.commentHeader}>
                        <strong className={styles.commentAuthor}>{c.author}</strong>
                        <span className={styles.commentTime}>{c.time}</span>
                      </div>
                      <p className={styles.commentText}>{c.text}</p>
                    </div>
                  ))}
                </div>

                <form className={styles.commentComposer} onSubmit={handleAddComment}>
                  <input
                    type="text"
                    className={styles.commentInput}
                    placeholder="Add a comment or site note..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                  <button type="submit" className={styles.commentSubmitBtn} disabled={!commentText.trim()}>
                    <Send size={13} />
                  </button>
                </form>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
