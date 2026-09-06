"use client";

import React, { useState } from "react";
import {
  X,
  CalendarDays,
  CheckSquare,
  Flag,
  Plus,
  Trash2,
} from "lucide-react";
import type { CalendarActivityType, CalendarVisibility } from "@/types/domain/calendar";
import type { CreateActivityInput } from "../../repositories/calendar-activity.repository";
import type { CreateScheduleItemInput } from "../../repositories/project-schedule.repository";
import { CALENDAR_TEAM_MEMBERS } from "../../data/mock-calendar-data";
import styles from "../calendar-workspace-page.module.css";

function getNextDate(date: string) {
  const nextDate = new Date(`${date}T12:00:00Z`);
  nextDate.setUTCDate(nextDate.getUTCDate() + 1);
  return nextDate.toISOString().substring(0, 10);
}

export interface AddActivityModalProps {
  initialCreationType?: "schedule_event" | "add_task" | "add_milestone";
  initialDate?: string;
  projectsList: Array<{ id: string; name: string; code?: string }>;
  onClose: () => void;
  onSubmit: (
    activityInput: CreateActivityInput,
    createScheduleItem?: CreateScheduleItemInput,
    idempotencyKey?: string
  ) => Promise<unknown>;
}

export function AddActivityModal({
  initialCreationType = "add_task",
  initialDate = "2026-07-24",
  projectsList,
  onClose,
  onSubmit,
}: AddActivityModalProps) {
  const [creationType, setCreationType] = useState<"schedule_event" | "add_task" | "add_milestone">(
    initialCreationType
  );
  const [title, setTitle] = useState("");
  const [activityType, setActivityType] = useState<CalendarActivityType>(
    initialCreationType === "add_task"
      ? "task"
      : initialCreationType === "add_milestone"
      ? "milestone"
      : "site_visit"
  );
  const [visibility, setVisibility] = useState<CalendarVisibility>("project");
  const [date, setDate] = useState(initialDate);
  const [isAllDay, setIsAllDay] = useState(initialCreationType !== "schedule_event");
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("11:30");
  const [projectId, setProjectId] = useState(
    projectsList.find((p) => p.id === "proj-201")?.id || projectsList[0]?.id || "proj-101"
  );
  const [teamMemberId, setTeamMemberId] = useState("usr-1");
  const [location, setLocation] = useState("");
  const [comment, setComment] = useState("");
  const [wantedThings, setWantedThings] = useState<string[]>([]);
  const [newWantedInput, setNewWantedInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleTypeTabChange = (type: "schedule_event" | "add_task" | "add_milestone") => {
    setCreationType(type);
    if (type === "add_task") {
      setActivityType("task");
      setIsAllDay(true);
    } else if (type === "add_milestone") {
      setActivityType("milestone");
      setIsAllDay(true);
    } else {
      setActivityType("site_visit");
      setIsAllDay(false);
    }
  };

  const handleAddWantedItem = () => {
    const trimmed = newWantedInput.trim();
    if (!trimmed) return;
    setWantedThings((prev) => [...prev, trimmed]);
    setNewWantedInput("");
  };

  const handleRemoveWantedItem = (index: number) => {
    setWantedThings((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!title.trim()) {
      setErrorMsg("Please enter a title for the task / activity.");
      return;
    }
    if (!projectId) {
      setErrorMsg("Please select a project.");
      return;
    }

    setIsSubmitting(true);
    const idempotencyKey = `idemp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    try {
      // Build notes containing comments and wanted checklist items
      let finalNotes = comment.trim();
      if (wantedThings.length > 0) {
        const checklistText = wantedThings.map((item) => `• ${item.trim()}`).join("\n");
        finalNotes = finalNotes
          ? `${finalNotes}\n\nWanted items / Checklist:\n${checklistText}`
          : `Wanted items / Checklist:\n${checklistText}`;
      }

      const timeObj = isAllDay
        ? {
            allDay: true as const,
            startDate: date,
            endDateExclusive: getNextDate(date),
            timezone: "Asia/Kolkata",
          }
        : {
            allDay: false as const,
            startAt: `${date}T${startTime}:00+05:30`,
            endAt: `${date}T${endTime}:00+05:30`,
            timezone: "Asia/Kolkata",
          };

      if (creationType === "schedule_event") {
        const activityInput: CreateActivityInput = {
          workspaceId: "ws-kallisto",
          title: title.trim(),
          activityType,
          visibility,
          ownerId: teamMemberId,
          assigneeIds: [teamMemberId],
          time: timeObj,
          projectId: visibility === "project" ? projectId : undefined,
          location: location.trim() || undefined,
          notes: finalNotes || undefined,
        };

        await onSubmit(activityInput, undefined, idempotencyKey);
      } else {
        const itemType = creationType === "add_milestone" ? "milestone" : "task";

        const scheduleInput: CreateScheduleItemInput = {
          workspaceId: "ws-kallisto",
          projectId,
          title: title.trim(),
          itemType,
          startDate: date,
          dueDate: date,
          progress: 0,
          status: "todo",
          assigneeId: teamMemberId,
        };

        const activityInput: CreateActivityInput = {
          workspaceId: "ws-kallisto",
          title: title.trim(),
          activityType: itemType === "milestone" ? "milestone" : "task",
          visibility: "project",
          ownerId: teamMemberId,
          assigneeIds: [teamMemberId],
          time: timeObj,
          projectId,
          location: location.trim() || undefined,
          notes: finalNotes || undefined,
        };

        await onSubmit(activityInput, scheduleInput, idempotencyKey);
      }

      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to save activity.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedMember = CALENDAR_TEAM_MEMBERS[teamMemberId] || CALENDAR_TEAM_MEMBERS["usr-1"];

  return (
    <div className={styles.modalOverlay} onClick={onClose} role="dialog" aria-modal="true" aria-label="Add Task / Activity">
      <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className={styles.modalHeader}>
          <div>
            <h3>
              {creationType === "add_task"
                ? "Add Project Task"
                : creationType === "add_milestone"
                ? "Add Project Milestone"
                : "Schedule Calendar Event"}
            </h3>
            <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>
              Specify project, assigned team members, schedule, and checklist items.
            </p>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Creation Type Selector Tabs */}
        <div className={styles.modalTypeSelector}>
          <button
            type="button"
            className={`${styles.typeSelectorBtn} ${
              creationType === "add_task" ? styles.typeSelectorActive : ""
            }`}
            onClick={() => handleTypeTabChange("add_task")}
          >
            <CheckSquare size={15} />
            <span>Task</span>
          </button>
          <button
            type="button"
            className={`${styles.typeSelectorBtn} ${
              creationType === "schedule_event" ? styles.typeSelectorActive : ""
            }`}
            onClick={() => handleTypeTabChange("schedule_event")}
          >
            <CalendarDays size={15} />
            <span>Schedule Event</span>
          </button>
          <button
            type="button"
            className={`${styles.typeSelectorBtn} ${
              creationType === "add_milestone" ? styles.typeSelectorActive : ""
            }`}
            onClick={() => handleTypeTabChange("add_milestone")}
          >
            <Flag size={15} />
            <span>Add Milestone</span>
          </button>
        </div>

        {errorMsg && <div className={styles.errorAlertBox}>{errorMsg}</div>}

        <form onSubmit={handleSubmitForm} noValidate className={styles.modalFormContent}>
          {/* Title Field */}
          <div className={styles.formGroup}>
            <label htmlFor="task-title-input" className={styles.formLabel}>
              Task / Event Title <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              id="task-title-input"
              type="text"
              required
              placeholder="e.g. Review revised structural drawings with site team"
              className={styles.formInput}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          {/* Project & Team Member Row */}
          <div className={styles.formGridTwo}>
            {/* Project Selection */}
            <div className={styles.formGroup}>
              <label htmlFor="task-project-select" className={styles.formLabel}>
                Project Name <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <select
                id="task-project-select"
                className={styles.formSelect}
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                required
              >
                {projectsList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.code ? `(${p.code})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Team Member Selection */}
            <div className={styles.formGroup}>
              <label htmlFor="task-assignee-select" className={styles.formLabel}>
                Assign Team Member
              </label>
              <select
                id="task-assignee-select"
                className={styles.formSelect}
                value={teamMemberId}
                onChange={(e) => setTeamMemberId(e.target.value)}
              >
                {Object.values(CALENDAR_TEAM_MEMBERS).map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} ({member.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Team Member Preview Card */}
          <div className={styles.teamMemberPreviewCard}>
            <span className={styles.teamMemberAvatarBadge}>{selectedMember.avatar}</span>
            <div className={styles.teamMemberInfoCol}>
              <strong className={styles.teamMemberName}>{selectedMember.name}</strong>
              <span className={styles.teamMemberRoleMeta}>
                {selectedMember.role} • {selectedMember.location}
              </span>
            </div>
          </div>

          {/* Category & Visibility Row */}
          <div className={styles.formGridTwo}>
            <div className={styles.formGroup}>
              <label htmlFor="task-category-select" className={styles.formLabel}>Activity Category</label>
              <select
                id="task-category-select"
                className={styles.formSelect}
                value={activityType}
                onChange={(e) => setActivityType(e.target.value as CalendarActivityType)}
              >
                <option value="task">Task</option>
                <option value="site_visit">Site Visit</option>
                <option value="client_meeting">Client Meeting</option>
                <option value="team_meeting">Team Meeting</option>
                <option value="inspection">Site Inspection</option>
                <option value="drawing_delivery">Drawing Delivery</option>
                <option value="approval">Sign-off / Approval</option>
                <option value="payment_review">Payment Review</option>
                <option value="milestone">Project Milestone</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="task-visibility-select" className={styles.formLabel}>Visibility</label>
              <select
                id="task-visibility-select"
                className={styles.formSelect}
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as CalendarVisibility)}
              >
                <option value="project">Project Visible (Team & Client)</option>
                <option value="workspace">Workspace Shared (Internal)</option>
                <option value="private">Private (Only Me)</option>
              </select>
            </div>
          </div>

          {/* Date, Timing & All Day Row */}
          <div className={styles.formGridTwo}>
            <div className={styles.formGroup}>
              <label htmlFor="task-date-input" className={styles.formLabel}>
                Date <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                id="task-date-input"
                type="date"
                required
                className={styles.formInput}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Timing</label>
              <div className={styles.allDayToggleBox}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={isAllDay}
                    onChange={(e) => setIsAllDay(e.target.checked)}
                  />
                  <span>All day task / activity</span>
                </label>
              </div>
            </div>
          </div>

          {/* Start & End Times (when not all-day) */}
          {!isAllDay && (
            <div className={styles.formGridTwo}>
              <div className={styles.formGroup}>
                <label htmlFor="task-start-time" className={styles.formLabel}>Start Time</label>
                <input
                  id="task-start-time"
                  type="time"
                  className={styles.formInput}
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="task-end-time" className={styles.formLabel}>End Time</label>
                <input
                  id="task-end-time"
                  type="time"
                  className={styles.formInput}
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Location / Meeting Link */}
          <div className={styles.formGroup}>
            <label htmlFor="task-location-input" className={styles.formLabel}>
              Location / Video Link (Optional)
            </label>
            <input
              id="task-location-input"
              type="text"
              placeholder="e.g. Kallisto Studio, Kochi or Google Meet link"
              className={styles.formInput}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          {/* Comment / Instructions / Notes */}
          <div className={styles.formGroup}>
            <label htmlFor="task-comment-input" className={styles.formLabel}>
              Comments & Notes
            </label>
            <textarea
              id="task-comment-input"
              rows={3}
              placeholder="Add instructions, context, project comments, or handover notes for the team..."
              className={styles.formTextarea}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          {/* Wanted Things / Deliverables Checklist */}
          <div className={styles.formGroup}>
            <label htmlFor="task-checklist-input" className={styles.formLabel}>
              Wanted Things / Checklist Items ({wantedThings.length})
            </label>
            <div className={styles.checklistInputRow}>
              <input
                id="task-checklist-input"
                type="text"
                placeholder="e.g. Check structural steel test report, verify foundation setback..."
                className={styles.formInput}
                value={newWantedInput}
                onChange={(e) => setNewWantedInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddWantedItem();
                  }
                }}
              />
              <button
                type="button"
                className={styles.addChecklistBtn}
                onClick={handleAddWantedItem}
                aria-label="Add wanted item"
              >
                <Plus size={14} />
                <span>Add</span>
              </button>
            </div>

            {wantedThings.length > 0 && (
              <div className={styles.checklistItemsList}>
                {wantedThings.map((item, idx) => (
                  <div key={idx} className={styles.checklistItemRow}>
                    <span className={styles.checklistBullet}>✓</span>
                    <span className={styles.checklistItemText}>{item}</span>
                    <button
                      type="button"
                      className={styles.checklistRemoveBtn}
                      onClick={() => handleRemoveWantedItem(idx)}
                      aria-label={`Remove ${item}`}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal Actions Footer */}
          <div className={styles.modalFooter}>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.btnPrimary}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Saving..."
                : creationType === "add_task"
                ? "Save Task"
                : creationType === "add_milestone"
                ? "Save Milestone"
                : "Schedule Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
