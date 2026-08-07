"use client";

import React, { useState } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { useCalendarQueryState, type CalendarTabId } from "../hooks/use-calendar-query-state";
import { useCalendarActivities } from "../hooks/use-calendar-activities";
import { useProjectSchedule } from "../hooks/use-project-schedule";
import { CalendarPageHeader } from "./calendar-page-header";
import { TodayTab } from "./today-tab/today-tab";
import { CalendarTab } from "./calendar-tab/calendar-tab";
import { GanttTab } from "./gantt-tab/gantt-tab";
import { ActivityInspectorDrawer } from "./inspector/activity-inspector-drawer";
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
    // Today is an operational record of the full day, including completed work.
    includeCompleted: queryState.tab === "today" ? true : queryState.includeCompleted,
    scope: queryState.scope,
  };

  const {
    activities,
    isLoading: isActivitiesLoading,
    error: activitiesError,
    refetch: refetchActivities,
    createActivity,
    updateActivityDate,
    markActivityComplete,
  } = useCalendarActivities(activityFilter);

  const {
    scheduleItems,
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

  const handleTabChange = (newTab: CalendarTabId) => {
    setQueryState({ tab: newTab });
  };

  const handleSelectItem = (id: string, type: "activity" | "schedule") => {
    setQueryState({ selected: `${type}:${id}` });
  };

  const handleCloseInspector = () => {
    setQueryState({ selected: null });
  };

  const isLoading = isActivitiesLoading || isScheduleLoading;
  const hasError = activitiesError || scheduleError;

  return (
    <div className={styles.container}>
      {/* Compact Page Header with Restrained Active Underline Tabs (Today | Calendar | Gantt) */}
      <CalendarPageHeader
        activeTab={queryState.tab}
        selectedDate={queryState.date}
        onTabChange={handleTabChange}
        onOpenAddModal={handleOpenAddModal}
      />

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

      {/* Main Active Tab Workspace Render */}
      {!isLoading && !hasError && (
        <>
          {queryState.tab === "today" && (
            <TodayTab
              activities={activities}
              scheduleItems={scheduleItems}
              projectsList={MOCK_PROJECTS}
              selectedDate={queryState.date}
              scope={queryState.scope === "team" ? "team" : "mine"}
              category={queryState.category}
              onSelectActivity={(id) => handleSelectItem(id, "activity")}
              onSelectScheduleItem={(id) => handleSelectItem(id, "schedule")}
              onViewAllSchedule={() => handleTabChange("calendar")}
              onDateChange={(date) => setQueryState({ date, tab: "today" })}
              onScopeChange={(scope) => setQueryState({ scope, tab: "today" })}
              onCategoryChange={(category) => setQueryState({ category, tab: "today" })}
              onAddActivity={() => handleOpenAddModal("schedule_event")}
              onMarkComplete={markActivityComplete}
            />
          )}

          {queryState.tab === "calendar" && (
            <CalendarTab
              queryState={queryState}
              onUpdateQuery={setQueryState}
              activities={activities}
              projectsList={MOCK_PROJECTS}
              onSelectActivity={(id) => handleSelectItem(id, "activity")}
              onAddActivity={(date) => {
                if (date) setQueryState({ date });
                handleOpenAddModal("schedule_event");
              }}
            />
          )}

          {queryState.tab === "gantt" && (
            <GanttTab
              queryState={queryState}
              onUpdateQuery={setQueryState}
              projectsList={MOCK_PROJECTS}
              scheduleItems={scheduleItems}
              onSelectItem={handleSelectItem}
            />
          )}
        </>
      )}

      {/* Contextual Inspector Drawer (Deep-linked via `selected` param) */}
      <ActivityInspectorDrawer
        selectedParam={queryState.selected}
        activities={activities}
        scheduleItems={scheduleItems}
        onClose={handleCloseInspector}
        onUpdateActivityDate={updateActivityDate}
      />

      {/* Add Activity Creation Modal */}
      {addModalOpen && (
        <AddActivityModal
          initialCreationType={creationType}
          initialDate={queryState.date}
          projectsList={MOCK_PROJECTS}
          onClose={() => setAddModalOpen(false)}
          onSubmit={createActivity}
        />
      )}
    </div>
  );
}
