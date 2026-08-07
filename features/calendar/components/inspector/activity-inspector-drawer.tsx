"use client";

import React, { useState } from "react";
import { X, Clock, MapPin, Building2, User, ShieldAlert, CheckCircle2, Link2, Calendar as CalendarIcon } from "lucide-react";
import type { PresentableActivity } from "../../services/calendar-activity.service";
import type { PresentableScheduleItem } from "../../services/project-schedule.service";
import styles from "../calendar-workspace-page.module.css";

interface ActivityInspectorDrawerProps {
  selectedParam: string | null; // "activity:<id>" | "schedule:<id>"
  activities: PresentableActivity[];
  scheduleItems: PresentableScheduleItem[];
  onClose: () => void;
  onUpdateActivityDate: (id: string, newTime: PresentableActivity["time"]) => Promise<unknown>;
}

export function ActivityInspectorDrawer({
  selectedParam,
  activities,
  scheduleItems,
  onClose,
  onUpdateActivityDate,
}: ActivityInspectorDrawerProps) {
  if (!selectedParam) return null;

  const [isActivity, recordId] = selectedParam.includes(":")
    ? [selectedParam.startsWith("activity:"), selectedParam.substring(selectedParam.indexOf(":") + 1)]
    : [true, selectedParam];

  const targetActivity = isActivity ? activities.find((a) => a.id === recordId) : null;
  const targetSchedule = !isActivity ? scheduleItems.find((s) => s.id === recordId) : null;

  if (!targetActivity && !targetSchedule) return null;

  return (
    <div className={styles.inspectorOverlay} onClick={onClose}>
      <div className={styles.inspectorDrawer} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.inspectorHeader}>
          <div className={styles.inspectorTitleGroup}>
            <span className={styles.inspectorTypeBadge}>
              {targetActivity ? `Calendar Activity (${targetActivity.activityType})` : `Schedule Item (${targetSchedule?.itemType})`}
            </span>
            <h2 className={styles.inspectorTitle}>{targetActivity ? targetActivity.title : targetSchedule?.title}</h2>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close inspector">
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className={styles.inspectorBody}>
          {targetActivity && (
            <>
              <div className={styles.inspectorField}>
                <label className={styles.fieldLabel}>Date & Time</label>
                <div className={styles.fieldValueBox}>
                  <Clock size={15} />
                  <span>
                    {targetActivity.time.allDay
                      ? `All Day · ${targetActivity.time.startDate}`
                      : `${targetActivity.time.startAt.substring(0, 10)} · ${new Date(targetActivity.time.startAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} – ${new Date(targetActivity.time.endAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} (${targetActivity.time.timezone})`}
                  </span>
                </div>
              </div>

              {targetActivity.projectId && (
                <div className={styles.inspectorField}>
                  <label className={styles.fieldLabel}>Linked Project</label>
                  <div className={styles.fieldValueBox}>
                    <Building2 size={15} />
                    <span>{targetActivity.projectId}</span>
                  </div>
                </div>
              )}

              {targetActivity.location && (
                <div className={styles.inspectorField}>
                  <label className={styles.fieldLabel}>Location / Format</label>
                  <div className={styles.fieldValueBox}>
                    <MapPin size={15} />
                    <span>{targetActivity.location}</span>
                  </div>
                </div>
              )}

              <div className={styles.inspectorField}>
                <label className={styles.fieldLabel}>Owner & Assignees</label>
                <div className={styles.fieldValueBox}>
                  <User size={15} />
                  <span>Owner: {targetActivity.ownerId}</span>
                </div>
              </div>

              {targetActivity.notes && (
                <div className={styles.inspectorField}>
                  <label className={styles.fieldLabel}>Notes & Instructions</label>
                  <p className={styles.notesText}>{targetActivity.notes}</p>
                </div>
              )}

              {targetActivity.linkedScheduleItemId && (
                <div className={styles.linkedNoticeBox}>
                  <Link2 size={15} />
                  <div>
                    <strong>Linked Schedule Item</strong>
                    <p>ID: {targetActivity.linkedScheduleItemId} (Authoritative sync enabled)</p>
                  </div>
                </div>
              )}
            </>
          )}

          {targetSchedule && (
            <>
              <div className={styles.inspectorField}>
                <label className={styles.fieldLabel}>Schedule Dates</label>
                <div className={styles.fieldValueBox}>
                  <CalendarIcon size={15} />
                  <span>Start: {targetSchedule.startDate} · Due: {targetSchedule.dueDate}</span>
                </div>
              </div>

              {targetSchedule.baselineStartDate && (
                <div className={styles.inspectorField}>
                  <label className={styles.fieldLabel}>Baseline Comparison</label>
                  <div className={styles.fieldValueBox}>
                    <span>Baseline Start: {targetSchedule.baselineStartDate} · Baseline Due: {targetSchedule.baselineDueDate}</span>
                  </div>
                </div>
              )}

              <div className={styles.inspectorField}>
                <label className={styles.fieldLabel}>Progress & Status</label>
                <div className={styles.fieldValueBox}>
                  <span>Progress: {targetSchedule.progress ?? 0}% · Status: {targetSchedule.status}</span>
                </div>
              </div>

              {targetSchedule.blockerReason && (
                <div className={styles.blockerNoticeBox}>
                  <ShieldAlert size={15} />
                  <div>
                    <strong>Blocker Reason</strong>
                    <p>{targetSchedule.blockerReason}</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className={styles.inspectorFooter}>
          <button type="button" className={styles.btnSecondary} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
