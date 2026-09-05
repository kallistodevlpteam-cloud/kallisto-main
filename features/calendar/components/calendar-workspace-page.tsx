"use client";

import React, { useState } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { useCalendarQueryState } from "../hooks/use-calendar-query-state";
import { useCalendarActivities } from "../hooks/use-calendar-activities";
import { useProjectSchedule } from "../hooks/use-project-schedule";
import { CalendarTab } from "./calendar-tab/calendar-tab";
import { AddActivityModal } from "./modals/add-activity-modal";
import { MOCK_PROJECTS } from "../data/mock-calendar-data";
import styles from "./calendar-workspace-page.module.css";

export function CalendarWorkspacePage() {
  const { state: queryState, setQueryState } = useCalendarQueryState();

  // Activity filter built from persistent URL search params
  const activityFilter = {
    projectId: queryState.project || undefined,
    activityType: queryState.activityType || undefined,
    visibility: queryState.visibility || undefined,
    includeCompleted: true,
    scope: queryState.scope,
  };

  const {
    activities,
    isLoading: isActivitiesLoading,
    error: activitiesError,
    refetch: refetchActivities,
    createActivity,
  } = useCalendarActivities(activityFilter);

  const {
    isLoading: isScheduleLoading,
    error: scheduleError,
    refetch: refetchSchedule,
  } = useProjectSchedule({ projectId: queryState.project || undefined });

  // Creation Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [creationType, setCreationType] = useState<"schedule_event" | "add_task" | "add_milestone">(
    "schedule_event"
  );

  const handleOpenAddModal = (type: "schedule_event" | "add_task" | "add_milestone") => {
    setCreationType(type);
    setAddModalOpen(true);
  };

  const handleSelectItem = (id: string, type: "activity" | "schedule") => {
    setQueryState({ selected: `${type}:${id}` });
  };

  const isLoading = isActivitiesLoading || isScheduleLoading;
  const hasError = activitiesError || scheduleError;

  return (
    <div className={`${styles.container} calendarWorkspaceRoot`}>
      {/* Loading State */}
      {isLoading && (
        <div className="route-state-box route-state-loading" aria-label="Loading calendar workspace">
          <div className="skeleton-bar skeleton-title" />
          <div className="skeleton-bar skeleton-subtitle" />
          <div className="skeleton-grid">
            <div className="skeleton-card" />
            <div className="skeleton-card" />
          </div>
        </div>
      )}

      {/* Error State */}
      {hasError && !isLoading && (
        <div className="route-state-box route-state-error" aria-label="Error loading calendar">
          <div className="error-state-icon">
            <AlertTriangle size={32} strokeWidth={1.5} />
          </div>
          <h3>Failed to load Calendar Operations</h3>
          <p>{activitiesError?.message || scheduleError?.message || "Service request encountered an unexpected error."}</p>
          <button
            type="button"
            className="retry-action-btn"
            onClick={() => {
              refetchActivities();
              refetchSchedule();
            }}
          >
            <RefreshCw size={14} />
            <span>Retry request</span>
          </button>
        </div>
      )}

      {/* Direct Clean Calendar Workspace */}
      {!isLoading && !hasError && (
        <CalendarTab
          queryState={queryState}
          onUpdateQuery={setQueryState}
          activities={activities}
          projectsList={MOCK_PROJECTS}
          onSelectActivity={(id) => handleSelectItem(id, "activity")}
          onAddActivity={(date) => {
            if (date) setQueryState({ date });
            handleOpenAddModal("add_task");
          }}
        />
      )}

      {/* Add Activity Creation Modal */}
      {addModalOpen && (
        <AddActivityModal
          initialCreationType={creationType}
          initialDate={queryState.date}
          projectsList={MOCK_PROJECTS}
          onClose={() => setAddModalOpen(false)}
          onSubmit={async (actInput, schInput, idemp) => {
            const res = await createActivity(actInput, schInput, idemp);
            if (actInput.time) {
              const targetDate = actInput.time.allDay
                ? actInput.time.startDate
                : actInput.time.startAt.substring(0, 10);
              if (targetDate) {
                setQueryState({ date: targetDate });
              }
            }
            if (res?.activity?.id) {
              handleSelectItem(res.activity.id, "activity");
            }
          }}
        />
      )}
    </div>
  );
}
