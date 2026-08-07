"use client";

import { useState, useEffect, useCallback } from "react";
import { MemoryCalendarActivityRepository } from "../repositories/memory/memory-calendar-activity.repository";
import { MemoryProjectScheduleRepository } from "../repositories/memory/memory-project-schedule.repository";
import { MemoryCalendarUnitOfWork } from "../repositories/memory/memory-calendar-unit-of-work";
import { ProjectScheduleService, type PresentableScheduleItem } from "../services/project-schedule.service";
import type { ScheduleFilterInput, CreateScheduleItemInput } from "../repositories/project-schedule.repository";

// Share singleton instances
const memoryActivityRepo = new MemoryCalendarActivityRepository();
const memoryScheduleRepo = new MemoryProjectScheduleRepository();
const memoryUoW = new MemoryCalendarUnitOfWork(memoryActivityRepo, memoryScheduleRepo);
const projectScheduleService = new ProjectScheduleService(memoryUoW);

export function useProjectSchedule(filter?: ScheduleFilterInput) {
  const [scheduleItems, setScheduleItems] = useState<PresentableScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const filterJson = JSON.stringify(filter || {});

  const fetchScheduleItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const activeFilter: ScheduleFilterInput = JSON.parse(filterJson);
      const data = await projectScheduleService.getScheduleItemsForProject(activeFilter);
      setScheduleItems(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load project schedule items."));
    } finally {
      setIsLoading(false);
    }
  }, [filterJson]);

  useEffect(() => {
    let isActive = true;
    queueMicrotask(() => {
      if (isActive) {
        void fetchScheduleItems();
      }
    });
    return () => {
      isActive = false;
    };
  }, [fetchScheduleItems]);

  const createScheduleItem = useCallback(
    async (input: CreateScheduleItemInput, idempotencyKey?: string) => {
      setIsLoading(true);
      try {
        const item = await projectScheduleService.createScheduleItem(input, idempotencyKey);
        await fetchScheduleItems();
        return item;
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to create schedule item."));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchScheduleItems]
  );

  return {
    scheduleItems,
    isLoading,
    error,
    refetch: fetchScheduleItems,
    createScheduleItem,
  };
}
