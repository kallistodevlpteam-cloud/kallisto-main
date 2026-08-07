"use client";

import React, { useId, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Edit3,
  FileText,
  Link as LinkIcon,
  Save,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { formatTimeLabel, timeToMinutes } from "./schedule-positioning";
import {
  ScheduleActivityItem,
  ScheduleActivityStatus,
  ScheduleActivityType,
  SchedulePermissions,
  ScheduleSlotSelection,
  ScheduleWorkstream,
} from "./schedule-types";
import styles from "./schedule.module.css";

export type ScheduleInspectorMode = "view" | "edit" | "create";

export interface ScheduleRightPanelProps {
  activity: ScheduleActivityItem | null;
  isOpen: boolean;
  mode: ScheduleInspectorMode;
  projectId: string;
  selectedDate: string;
  initialSlot: ScheduleSlotSelection | null;
  createType: ScheduleActivityType;
  permissions: SchedulePermissions;
  onModeChange: (mode: ScheduleInspectorMode) => void;
  onClose: () => void;
  onSave: (activity: Partial<ScheduleActivityItem>) => void;
  onDelete: (activityId: string) => void;
}

export function ScheduleRightPanel({
  activity,
  isOpen,
  mode,
  projectId,
  selectedDate,
  initialSlot,
  createType,
  permissions,
  onModeChange,
  onClose,
  onSave,
  onDelete,
}: ScheduleRightPanelProps) {
  if (!isOpen) return null;

  return (
    <aside
      className={styles.contextualRightPanelContainer}
      aria-label="Schedule inspector"
    >
      <div className={styles.panelHeaderRow}>
        <div className={styles.panelTitleStack}>
          <h2 className={styles.panelTitleText}>
            {mode === "create"
              ? createType === "Milestone"
                ? "Add milestone"
                : "Add activity"
              : mode === "edit"
              ? "Edit activity"
              : "Activity details"}
          </h2>
          <span className={styles.panelSubText}>
            {mode === "create" ? "Project schedule" : activity?.id}
          </span>
        </div>
        <button
          type="button"
          className={styles.closePanelBtn}
          onClick={onClose}
          aria-label="Close schedule inspector"
        >
          <X size={17} />
        </button>
      </div>

      {mode === "view" && activity ? (
        <ActivityDetails
          activity={activity}
          permissions={permissions}
          onEdit={() => onModeChange("edit")}
          onDelete={() => onDelete(activity.id)}
        />
      ) : (
        <ScheduleInspectorForm
          key={`${mode}-${activity?.id ?? "new"}-${initialSlot?.date ?? selectedDate}-${
            initialSlot?.startTime ?? ""
          }`}
          activity={activity}
          mode={mode}
          projectId={projectId}
          selectedDate={selectedDate}
          initialSlot={initialSlot}
          createType={createType}
          onCancel={onClose}
          onSave={onSave}
        />
      )}
    </aside>
  );
}

function ActivityDetails({
  activity,
  permissions,
  onEdit,
  onDelete,
}: {
  activity: ScheduleActivityItem;
  permissions: SchedulePermissions;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const dateLabel =
    activity.startDate === activity.endDate
      ? activity.startDate
      : `${activity.startDate} to ${activity.endDate}`;
  const timeLabel =
    !activity.allDay && activity.startTime && activity.endTime
      ? `${formatTimeLabel(activity.startTime)}\u2013${formatTimeLabel(
          activity.endTime
        )}`
      : "All day";

  return (
    <div className={styles.inspectorDetails}>
      <div className={styles.inspectorHero}>
        <span className={styles.inspectorStatus}>{activity.status}</span>
        <h3>{activity.title}</h3>
        <span className={styles.inspectorWorkstream}>{activity.workstream}</span>
      </div>

      <dl className={styles.detailsList}>
        <DetailRow
          icon={<CalendarDays size={15} />}
          label="Date"
          value={dateLabel}
        />
        <DetailRow icon={<Clock3 size={15} />} label="Time" value={timeLabel} />
        <DetailRow
          icon={<UserRound size={15} />}
          label="Owner"
          value={activity.owner}
        />
        <DetailRow
          icon={<CheckCircle2 size={15} />}
          label="Type and phase"
          value={`${activity.type}, ${activity.phase}`}
        />
        <DetailRow
          icon={<LinkIcon size={15} />}
          label="Dependency"
          value={activity.dependency || "No dependency"}
        />
        <DetailRow
          icon={<FileText size={15} />}
          label="Linked record"
          value={activity.linkedDocument || "No linked record"}
        />
      </dl>

      <div className={styles.progressSection}>
        <div className={styles.progressLabelRow}>
          <span>Progress</span>
          <strong>{activity.progressPercent ?? 0}%</strong>
        </div>
        <div className={styles.progressTrack}>
          <span style={{ width: `${activity.progressPercent ?? 0}%` }} />
        </div>
      </div>

      {activity.notes && (
        <section className={styles.inspectorNotes}>
          <h4>Notes</h4>
          <p>{activity.notes}</p>
        </section>
      )}

      <div className={styles.panelFooterActions}>
        {permissions.canDeleteActivity && (
          confirmingDelete ? (
            <div className={styles.deleteConfirm}>
              <span>Delete this activity?</span>
              <button type="button" onClick={onDelete}>
                Delete
              </button>
              <button type="button" onClick={() => setConfirmingDelete(false)}>
                Keep
              </button>
            </div>
          ) : (
            <button
              type="button"
              className={styles.deleteBtn}
              onClick={() => setConfirmingDelete(true)}
            >
              <Trash2 size={14} />
              <span>Delete</span>
            </button>
          )
        )}

        {permissions.canEditActivity && (
          <button type="button" className={styles.savePrimaryBtn} onClick={onEdit}>
            <Edit3 size={14} />
            <span>Edit</span>
          </button>
        )}
      </div>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className={styles.detailRow}>
      <span className={styles.detailIcon}>{icon}</span>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function ScheduleInspectorForm({
  activity,
  mode,
  projectId,
  selectedDate,
  initialSlot,
  createType,
  onCancel,
  onSave,
}: {
  activity: ScheduleActivityItem | null;
  mode: ScheduleInspectorMode;
  projectId: string;
  selectedDate: string;
  initialSlot: ScheduleSlotSelection | null;
  createType: ScheduleActivityType;
  onCancel: () => void;
  onSave: (activity: Partial<ScheduleActivityItem>) => void;
}) {
  const idPrefix = useId();
  const isEditing = mode === "edit" && activity;
  const [title, setTitle] = useState(isEditing ? activity.title : "");
  const [type, setType] = useState<ScheduleActivityType>(
    isEditing ? activity.type : createType
  );
  const [phase, setPhase] = useState(
    isEditing ? activity.phase : "Construction"
  );
  const [workstream, setWorkstream] = useState<ScheduleWorkstream>(
    isEditing ? activity.workstream : "Structure"
  );
  const [startDate, setStartDate] = useState(
    isEditing ? activity.startDate : initialSlot?.date ?? selectedDate
  );
  const [endDate, setEndDate] = useState(
    isEditing ? activity.endDate : initialSlot?.date ?? selectedDate
  );
  const [allDay, setAllDay] = useState(
    isEditing ? activity.allDay : createType === "Milestone" && !initialSlot
  );
  const [startTime, setStartTime] = useState(
    isEditing ? activity.startTime ?? "09:00" : initialSlot?.startTime ?? "10:00"
  );
  const [endTime, setEndTime] = useState(
    isEditing ? activity.endTime ?? "10:00" : initialSlot?.endTime ?? "11:00"
  );
  const [owner, setOwner] = useState(
    isEditing ? activity.owner : "Arun Mehta"
  );
  const [dependency, setDependency] = useState(
    isEditing ? activity.dependency ?? "" : ""
  );
  const [status, setStatus] = useState<ScheduleActivityStatus>(
    isEditing ? activity.status : "Scheduled"
  );
  const [linkedDocument, setLinkedDocument] = useState(
    isEditing ? activity.linkedDocument ?? "" : ""
  );
  const [notes, setNotes] = useState(isEditing ? activity.notes ?? "" : "");
  const [validationError, setValidationError] = useState("");

  const fieldId = (name: string) => `${idPrefix}-${name}`;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (endDate < startDate) {
      setValidationError("End date must be on or after the start date.");
      return;
    }
    if (
      !allDay &&
      startDate === endDate &&
      timeToMinutes(endTime) <= timeToMinutes(startTime)
    ) {
      setValidationError("End time must be later than the start time.");
      return;
    }

    onSave({
      id: activity?.id,
      projectId,
      title: title.trim(),
      type,
      phase,
      workstream,
      startDate,
      endDate,
      allDay,
      startTime: allDay ? undefined : startTime,
      endTime: allDay ? undefined : endTime,
      owner: owner.trim(),
      ownerInitials: owner
        .split(" ")
        .filter(Boolean)
        .map((name) => name[0])
        .join("")
        .toUpperCase()
        .slice(0, 2),
      dependency: dependency.trim() || undefined,
      status,
      linkedDocument: linkedDocument.trim() || undefined,
      notes: notes.trim() || undefined,
      progressPercent: activity?.progressPercent ?? 0,
    });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.panelFormBody}>
      {validationError && (
        <div className={styles.formError} role="alert">
          {validationError}
        </div>
      )}

      <FormField id={fieldId("title")} label="Title">
        <input
          id={fieldId("title")}
          type="text"
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="e.g. Roof slab casting"
          className={styles.fieldTextInput}
        />
      </FormField>

      <div className={styles.fieldTwoColGrid}>
        <FormField id={fieldId("type")} label="Type">
          <select
            id={fieldId("type")}
            value={type}
            onChange={(event) =>
              setType(event.target.value as ScheduleActivityType)
            }
            className={styles.fieldSelectInput}
          >
            {["Milestone", "Site task", "Approval", "Procurement", "Inspection", "Meeting"].map(
              (value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              )
            )}
          </select>
        </FormField>

        <FormField id={fieldId("status")} label="Status">
          <select
            id={fieldId("status")}
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as ScheduleActivityStatus)
            }
            className={styles.fieldSelectInput}
          >
            {["Scheduled", "In progress", "Pending approval", "Blocked", "Completed", "Delayed"].map(
              (value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              )
            )}
          </select>
        </FormField>
      </div>

      <div className={styles.fieldTwoColGrid}>
        <FormField id={fieldId("phase")} label="Phase">
          <select
            id={fieldId("phase")}
            value={phase}
            onChange={(event) => setPhase(event.target.value)}
            className={styles.fieldSelectInput}
          >
            {["Pre-design", "Design", "Procurement", "Construction", "Handover"].map(
              (value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              )
            )}
          </select>
        </FormField>

        <FormField id={fieldId("workstream")} label="Workstream">
          <select
            id={fieldId("workstream")}
            value={workstream}
            onChange={(event) =>
              setWorkstream(event.target.value as ScheduleWorkstream)
            }
            className={styles.fieldSelectInput}
          >
            {["Architecture", "Structure", "MEP", "Procurement", "Site execution", "Client approvals"].map(
              (value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              )
            )}
          </select>
        </FormField>
      </div>

      <label className={styles.allDayToggle}>
        <input
          type="checkbox"
          checked={allDay}
          onChange={(event) => setAllDay(event.target.checked)}
        />
        <span>All-day or multi-day activity</span>
      </label>

      <div className={styles.fieldTwoColGrid}>
        <FormField id={fieldId("start-date")} label="Date">
          <input
            id={fieldId("start-date")}
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            className={styles.fieldTextInput}
          />
        </FormField>
        <FormField id={fieldId("end-date")} label="End date">
          <input
            id={fieldId("end-date")}
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            className={styles.fieldTextInput}
          />
        </FormField>
      </div>

      {!allDay && (
        <div className={styles.fieldTwoColGrid}>
          <FormField id={fieldId("start-time")} label="Start time">
            <input
              id={fieldId("start-time")}
              type="time"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
              className={styles.fieldTextInput}
            />
          </FormField>
          <FormField id={fieldId("end-time")} label="End time">
            <input
              id={fieldId("end-time")}
              type="time"
              value={endTime}
              onChange={(event) => setEndTime(event.target.value)}
              className={styles.fieldTextInput}
            />
          </FormField>
        </div>
      )}

      <FormField id={fieldId("owner")} label="Owner">
        <input
          id={fieldId("owner")}
          type="text"
          value={owner}
          onChange={(event) => setOwner(event.target.value)}
          className={styles.fieldTextInput}
        />
      </FormField>

      <FormField id={fieldId("dependency")} label="Dependency">
        <input
          id={fieldId("dependency")}
          type="text"
          value={dependency}
          onChange={(event) => setDependency(event.target.value)}
          placeholder="Activity or approval dependency"
          className={styles.fieldTextInput}
        />
      </FormField>

      <FormField id={fieldId("linked-record")} label="Linked record">
        <div className={styles.inputWithIconRow}>
          <LinkIcon size={14} className={styles.inputLeftIcon} />
          <input
            id={fieldId("linked-record")}
            type="text"
            value={linkedDocument}
            onChange={(event) => setLinkedDocument(event.target.value)}
            placeholder="Task, drawing, document or approval"
            className={styles.fieldTextInputWithIcon}
          />
        </div>
      </FormField>

      <FormField id={fieldId("notes")} label="Notes">
        <textarea
          id={fieldId("notes")}
          rows={4}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          className={styles.fieldTextareaInput}
        />
      </FormField>

      <div className={styles.panelFooterActions}>
        <button type="button" className={styles.cancelBtn} onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className={styles.savePrimaryBtn}>
          <Save size={14} />
          <span>{mode === "create" ? "Create item" : "Save changes"}</span>
        </button>
      </div>
    </form>
  );
}

function FormField({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.formFieldGroup}>
      <label htmlFor={id} className={styles.fieldLabel}>
        {label}
      </label>
      {children}
    </div>
  );
}
