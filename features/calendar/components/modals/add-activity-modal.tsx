"use client";

import React, { useState } from "react";
import { X, CalendarDays, CheckSquare, Flag } from "lucide-react";
import type { CalendarActivityType, CalendarVisibility } from "@/types/domain/calendar";
import type { CreateActivityInput } from "../../repositories/calendar-activity.repository";
import type { CreateScheduleItemInput } from "../../repositories/project-schedule.repository";
import styles from "../calendar-workspace-page.module.css";

function getNextDate(date: string) {
  const nextDate = new Date(`${date}T00:00:00Z`);
  nextDate.setUTCDate(nextDate.getUTCDate() + 1);
  return nextDate.toISOString().substring(0, 10);
}

interface AddActivityModalProps {
  initialCreationType: "schedule_event" | "add_task" | "add_milestone";
  initialDate?: string;
  projectsList: Array<{ id: string; name: string }>;
  onClose: () => void;
  onSubmit: (
    activityInput: CreateActivityInput,
    createScheduleItem?: CreateScheduleItemInput,
    idempotencyKey?: string
  ) => Promise<unknown>;
}

export function AddActivityModal({
  initialCreationType,
  initialDate = "2026-07-24",
  projectsList,
  onClose,
  onSubmit,
}: AddActivityModalProps) {
  const [creationType, setCreationType] = useState<"schedule_event" | "add_task" | "add_milestone">(
    initialCreationType
  );
  const [title, setTitle] = useState("");
  const [activityType, setActivityType] = useState<CalendarActivityType>("site_visit");
  const [visibility, setVisibility] = useState<CalendarVisibility>("project");
  const [date, setDate] = useState(initialDate);
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("11:30");
  const isAllDay = false;
  const [projectId, setProjectId] = useState(projectsList[0]?.id || "proj-101");
  const [location, setLocation] = useState("");
  const notes = "";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!title.trim()) {
      setErrorMsg("Title cannot be empty.");
      return;
    }

    setIsSubmitting(true);
    const idempotencyKey = `idemp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    try {
      if (creationType === "schedule_event") {
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

        const activityInput: CreateActivityInput = {
          workspaceId: "ws-kallisto",
          title: title.trim(),
          activityType,
          visibility,
          ownerId: "usr-1",
          assigneeIds: ["usr-1"],
          time: timeObj,
          projectId: visibility === "project" ? projectId : undefined,
          location: location.trim() || undefined,
          notes: notes.trim() || undefined,
        };

        await onSubmit(activityInput, undefined, idempotencyKey);
      } else if (creationType === "add_task" || creationType === "add_milestone") {
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
          assigneeId: "usr-1",
        };

        const activityInput: CreateActivityInput = {
          workspaceId: "ws-kallisto",
          title: title.trim(),
          activityType: itemType === "milestone" ? "milestone" : "task",
          visibility: "project",
          ownerId: "usr-1",
          assigneeIds: ["usr-1"],
          time: {
            allDay: true,
            startDate: date,
            endDateExclusive: date,
            timezone: "Asia/Kolkata",
          },
          projectId,
          notes: notes.trim() || undefined,
        };

        await onSubmit(activityInput, scheduleInput, idempotencyKey);
      }

      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to create activity.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>Add Activity</h3>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Creation Type Selector Tabs */}
        <div className={styles.modalTypeSelector}>
          <button
            type="button"
            className={`${styles.typeSelectorBtn} ${
              creationType === "schedule_event" ? styles.typeSelectorActive : ""
            }`}
            onClick={() => setCreationType("schedule_event")}
          >
            <CalendarDays size={15} />
            <span>Schedule event</span>
          </button>
          <button
            type="button"
            className={`${styles.typeSelectorBtn} ${
              creationType === "add_task" ? styles.typeSelectorActive : ""
            }`}
            onClick={() => setCreationType("add_task")}
          >
            <CheckSquare size={15} />
            <span>Add task</span>
          </button>
          <button
            type="button"
            className={`${styles.typeSelectorBtn} ${
              creationType === "add_milestone" ? styles.typeSelectorActive : ""
            }`}
            onClick={() => setCreationType("add_milestone")}
          >
            <Flag size={15} />
            <span>Add milestone</span>
          </button>
        </div>

        {errorMsg && <div className={styles.errorAlertBox}>{errorMsg}</div>}

        <form onSubmit={handleSubmitForm} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Client Site Visit & Foundation Inspection"
              className={styles.formInput}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {creationType === "schedule_event" && (
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Activity Category</label>
              <select
                className={styles.formSelect}
                value={activityType}
                onChange={(e) => setActivityType(e.target.value as CalendarActivityType)}
              >
                <option value="site_visit">Site Visit</option>
                <option value="client_meeting">Client Meeting</option>
                <option value="team_meeting">Team Meeting</option>
                <option value="inspection">Inspection</option>
                <option value="drawing_delivery">Drawing Delivery</option>
                <option value="approval">Approval</option>
                <option value="payment_review">Payment Review</option>
              </select>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Date</label>
              <input
                type="date"
                required
                className={styles.formInput}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Visibility</label>
              <select
                className={styles.formSelect}
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as CalendarVisibility)}
              >
                <option value="project">Project Visible</option>
                <option value="workspace">Workspace Shared</option>
                <option value="private">Private (Masked)</option>
              </select>
            </div>
          </div>

          {creationType === "schedule_event" && !isAllDay && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Start Time</label>
                <input
                  type="time"
                  className={styles.formInput}
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>End Time</label>
                <input
                  type="time"
                  className={styles.formInput}
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Link Project</label>
            <select
              className={styles.formSelect}
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
            >
              {projectsList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {creationType === "schedule_event" && (
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Location / Link</label>
              <input
                type="text"
                placeholder="e.g. On-site Site B or Google Meet link"
                className={styles.formInput}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          )}

          <div className={styles.modalFooter}>
            <button type="button" className={styles.btnSecondary} onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className={styles.btnPrimary} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Activity"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
