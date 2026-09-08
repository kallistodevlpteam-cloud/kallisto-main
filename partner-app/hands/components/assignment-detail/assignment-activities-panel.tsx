"use client";

import React, { useState, useMemo } from "react";
import { DeploymentActivitiesCalendar } from "@/features/hands/components/deployment-activities-calendar";
import { AddTaskModal } from "@/features/hands/components/add-task-modal";
import { PARTNER_LABOUR_TASKS } from "../../utils/partner-assignment-tasks";
import type {
  Deployment,
  DeploymentActivityTask,
  DeploymentContractor,
  DeploymentStatus,
} from "@/features/hands/types/hands.types";
import type { AssignmentDeployment } from "../../types/assignment-domain";

interface AssignmentActivitiesPanelProps {
  assignmentId?: string;
  projectName?: string;
  supervisorName?: string;
  assignment?: AssignmentDeployment;
}

export function AssignmentActivitiesPanel({
  assignmentId,
  projectName,
  supervisorName,
  assignment,
}: AssignmentActivitiesPanelProps) {
  const [selectedDate, setSelectedDate] = useState<string>("2026-09-08");
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [tasksList, setTasksList] = useState<DeploymentActivityTask[]>(PARTNER_LABOUR_TASKS);

  const resolvedProjectName = assignment?.projectName || projectName || "Greenwood Residency";
  const resolvedSupervisorName = assignment?.supervisor?.name || supervisorName || "Suresh Nair";

  const contractors: DeploymentContractor[] = useMemo(
    () => [
      { id: "c1", name: "Apex Integrated Civil", trade: "Masonry Contractor", workerCount: 8, rating: 4.9 },
      { id: "c2", name: "Malabar Site Crew", trade: "Helper & Staging Crew", workerCount: 4, rating: 4.8 },
    ],
    []
  );

  const deployment: Deployment = useMemo(
    () => ({
      id: assignment?.id || assignmentId || "ASG-101",
      projectId: assignment?.id || assignmentId || "ASG-101",
      projectName: resolvedProjectName,
      location: assignment?.location || "Kazhakkoottam, Kerala",
      workforce: assignment?.tradesBreakdown || "8 Masons · 4 Helpers",
      shift: `Day ${assignment?.currentDay || 12} of ${assignment?.totalDays || 30} · 8:00 AM – 5:00 PM`,
      attendance: {
        state: "recorded",
        present: assignment?.attendance?.present || 10,
        total: assignment?.attendance?.total || 12,
      },
      supervisor: resolvedSupervisorName,
      dailyCost: assignment?.accounts?.dailyBillingRate || 14200,
      status: (assignment?.health === "attention_required" ? "Needs attention" : "Active") as DeploymentStatus,
      startDate: assignment?.startDate || "Sep 05",
      endDate: assignment?.endDate || "Oct 05",
      coverImage: assignment?.coverImage,
      contractors: contractors,
      todayActivity: {
        headline: "Level 2 Structural Block Masonry & Lintel Casting",
        siteLog: `Supervisor ${resolvedSupervisorName} logged: Shift underway at 8:00 AM with full 12-worker muster (8 Masons, 4 Helpers). Masonry gang 1 completing Level 2 south perimeter wall alignment; gang 2 binding lintel rebar and checking plumb lines.`,
        loggedAt: "Today, 10:45 AM",
      },
    }),
    [assignment, assignmentId, resolvedProjectName, resolvedSupervisorName, contractors]
  );

  const handleAddTask = (newTask: DeploymentActivityTask) => {
    const targetDate = newTask.date || selectedDate || "2026-09-08";
    const taskWithDefaults: DeploymentActivityTask = {
      ...newTask,
      date: targetDate,
      contractorName: newTask.contractorName || "Apex Integrated Civil",
      boqItemCode: newTask.boqItemCode || "BOQ-04.1",
      boqItemName: newTask.boqItemName || "230mm Solid Block Masonry in CM 1:6 (Labour)",
      ganttPhaseId: newTask.ganttPhaseId || "phase-2",
      ganttPhaseName: newTask.ganttPhaseName || "Phase 2: Superstructure Masonry & Lintel Level",
      serviceCategory: newTask.serviceCategory || "Block Masonry & Structural Works",
    };
    setTasksList((prev) => [taskWithDefaults, ...prev]);
    setSelectedDate(targetDate);
    setIsAddTaskModalOpen(false);
  };

  const handleUpdateTask = (updatedTask: DeploymentActivityTask) => {
    setTasksList((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );
  };

  const handleCancelTask = (taskId: string, reason: string) => {
    setTasksList((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: "cancelled",
              cancellationReason: reason,
              cancelledAt: new Date().toISOString(),
              cancelledBy: resolvedSupervisorName,
            }
          : t
      )
    );
  };

  const handleToggleTaskStatus = (taskId: string) => {
    setTasksList((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const nextStatus: DeploymentActivityTask["status"] =
          t.status === "pending" || t.status === "scheduled"
            ? "in-progress"
            : t.status === "in-progress"
            ? "completed"
            : "pending";
        return { ...t, status: nextStatus };
      })
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%" }}>
      <DeploymentActivitiesCalendar
        tasks={tasksList}
        contractors={contractors}
        deployment={deployment}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        onAddTaskClick={(date) => {
          if (date) setSelectedDate(date);
          setIsAddTaskModalOpen(true);
        }}
        onUpdateTask={handleUpdateTask}
        onCancelTask={handleCancelTask}
        onToggleStatus={handleToggleTaskStatus}
        variant="partner"
      />

      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        projectName={resolvedProjectName}
        supervisorName={resolvedSupervisorName}
        contractors={contractors}
        initialDate={selectedDate}
        variant="partner"
        hideContractorSelect={true}
        onAddTask={handleAddTask}
      />
    </div>
  );
}
