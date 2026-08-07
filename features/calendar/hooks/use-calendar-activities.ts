"use client";

import { useState, useEffect, useCallback } from "react";
import { MemoryCalendarActivityRepository } from "../repositories/memory/memory-calendar-activity.repository";
import { MemoryProjectScheduleRepository } from "../repositories/memory/memory-project-schedule.repository";
import { MemoryCalendarUnitOfWork } from "../repositories/memory/memory-calendar-unit-of-work";
import { CalendarActivityService, type PresentableActivity } from "../services/calendar-activity.service";
import type { ActivityFilterInput, CreateActivityInput } from "../repositories/calendar-activity.repository";
import type { CreateScheduleItemInput } from "../repositories/project-schedule.repository";
import type { UserContext } from "../services/calendar-permissions.service";
import type { CalendarActivity } from "@/types/domain/calendar";

// Singleton memory instances for workspace demonstration
const memoryActivityRepo = new MemoryCalendarActivityRepository();
const memoryScheduleRepo = new MemoryProjectScheduleRepository();
const memoryUoW = new MemoryCalendarUnitOfWork(memoryActivityRepo, memoryScheduleRepo);
const calendarActivityService = new CalendarActivityService(memoryUoW);

const DEFAULT_USER_CONTEXT: UserContext = {
  userId: "usr-1",
  userRole: "provider_lead",
  projectMemberships: [
    "proj-101",
    "proj-102",
    "proj-103",
    "proj-104",
    "proj-105",
    "proj-201",
    "proj-202",
    "proj-203",
    "proj-204",
  ],
};

export function useCalendarActivities(filter?: ActivityFilterInput, userContext: UserContext = DEFAULT_USER_CONTEXT) {
  const [activities, setActivities] = useState<PresentableActivity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const filterJson = JSON.stringify(filter || {});
  const userCtxJson = JSON.stringify(userContext);

  const fetchActivities = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const activeFilter: ActivityFilterInput = JSON.parse(filterJson);
      const activeUserCtx: UserContext = JSON.parse(userCtxJson);
      const data = await calendarActivityService.getActivitiesForWorkspace(activeFilter, activeUserCtx);
      setActivities(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load calendar activities."));
    } finally {
      setIsLoading(false);
    }
  }, [filterJson, userCtxJson]);

  useEffect(() => {
    let isActive = true;
    queueMicrotask(() => {
      if (isActive) {
        void fetchActivities();
      }
    });
    return () => {
      isActive = false;
    };
  }, [fetchActivities]);

  const createActivity = useCallback(
    async (
      activityInput: CreateActivityInput,
      createScheduleItem?: CreateScheduleItemInput,
      idempotencyKey?: string
    ) => {
      setIsLoading(true);
      try {
        const result = await calendarActivityService.createActivityWithOptionalScheduleItem(
          { activity: activityInput, createScheduleItem },
          idempotencyKey
        );
        await fetchActivities();
        return result;
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to create activity."));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchActivities]
  );

  const updateActivityDate = useCallback(
    async (activityId: string, newTime: CalendarActivity["time"]) => {
      setIsLoading(true);
      try {
        const result = await calendarActivityService.updateLinkedDate(activityId, newTime);
        await fetchActivities();
        return result;
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to update activity date."));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchActivities]
  );

  const markActivityComplete = useCallback(
    async (activityId: string) => {
      setError(null);
      setActivities((current) =>
        current.map((activity) =>
          activity.id === activityId
            ? { ...activity, status: "completed", isOverdue: false }
            : activity
        )
      );

      try {
        const result = await calendarActivityService.markActivityComplete(activityId);
        await fetchActivities();
        return result;
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to complete activity."));
        await fetchActivities();
        throw err;
      }
    },
    [fetchActivities]
  );

  return {
    activities,
    isLoading,
    error,
    refetch: fetchActivities,
    createActivity,
    updateActivityDate,
    markActivityComplete,
  };
}
