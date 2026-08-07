import {
  ProjectScheduleActivity,
  ProjectSchedulePhase,
  ScheduleSummaryContext,
} from "../../../domain/project-schedule.types";

export interface ProjectScheduleSummary {
  currentPhase: string | null;
  progressPercent: number;
  scheduleVarianceDays: number | null;
  scheduleHealth: "on_track" | "at_risk" | "delayed" | "unknown";
  overdueCount: number;
  blockedCount: number;
  nextMilestone: {
    id: string;
    title: string;
    dueDate: string;
  } | null;
}

/**
 * Calculates project schedule variance in calendar days
 */
function calculateScheduleVariance(activities: ProjectScheduleActivity[]): number | null {
  const activeActivities = activities.filter((a) => a.status !== "cancelled");
  if (activeActivities.length === 0) return null;

  // Forecast completion date: latest plannedEndDate among incomplete, non-cancelled activities
  const incompletePlannedDates = activeActivities
    .filter((a) => a.status !== "completed" && a.plannedEndDate)
    .map((a) => a.plannedEndDate as string);

  let forecastDateStr: string | null = null;
  if (incompletePlannedDates.length > 0) {
    forecastDateStr = incompletePlannedDates.reduce((max, d) => (d > max ? d : max));
  } else {
    // Fallback if all completed: use latest actualEndDate or plannedEndDate
    const allEndDates = activeActivities
      .map((a) => a.actualEndDate || a.plannedEndDate)
      .filter((d): d is string => d !== null);
    if (allEndDates.length > 0) {
      forecastDateStr = allEndDates.reduce((max, d) => (d > max ? d : max));
    }
  }

  // Baseline completion date: latest baselineEndDate among non-cancelled activities
  const baselineDates = activeActivities
    .map((a) => a.baselineEndDate)
    .filter((d): d is string => d !== null);

  if (!forecastDateStr || baselineDates.length === 0) {
    return null; // Return null if baseline is missing rather than false 0
  }

  const baselineDateStr = baselineDates.reduce((max, d) => (d > max ? d : max));

  // Project-local calendar day difference
  const forecastTime = new Date(forecastDateStr).getTime();
  const baselineTime = new Date(baselineDateStr).getTime();
  const diffDays = Math.round((forecastTime - baselineTime) / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Derives schedule health based on variance days & blocked critical items
 */
function deriveScheduleHealth(
  varianceDays: number | null,
  blockedCount: number
): "on_track" | "at_risk" | "delayed" | "unknown" {
  if (varianceDays === null) return "unknown";
  if (blockedCount > 0 || varianceDays > 3) return "delayed";
  if (varianceDays > 0) return "at_risk";
  return "on_track";
}

export function getProjectScheduleSummary(
  activities: ProjectScheduleActivity[],
  phases: ProjectSchedulePhase[],
  context: ScheduleSummaryContext
): ProjectScheduleSummary {
  // 1. Current Active Phase
  const activePhase = phases.find((p) => p.status === "active") || phases[0] || null;
  const currentPhase = activePhase ? activePhase.name : null;

  // 2. Weighted Overall Progress
  let totalWeight = 0;
  let weightedProgress = 0;

  for (const act of activities) {
    if (act.status === "cancelled") continue;
    const w = act.weight || 1;
    totalWeight += w;
    weightedProgress += (act.progressPercent / 100) * w;
  }

  const progressPercent = totalWeight > 0 ? Math.round((weightedProgress / totalWeight) * 100) : 0;

  // 3. Schedule Variance & Health
  const scheduleVarianceDays = calculateScheduleVariance(activities);
  const blockedCount = activities.filter((a) => a.status === "blocked").length;
  const scheduleHealth = deriveScheduleHealth(scheduleVarianceDays, blockedCount);

  // 4. Overdue Count (dueDate < today && not completed)
  const overdueCount = activities.filter(
    (a) =>
      a.status !== "completed" &&
      a.status !== "cancelled" &&
      a.plannedEndDate &&
      a.plannedEndDate < context.today
  ).length;

  // 5. Next Milestone
  const upcomingMilestones = activities.filter(
    (a) =>
      (a.type === "milestone" || a.isMilestone) &&
      a.status !== "completed" &&
      a.status !== "cancelled" &&
      a.plannedEndDate &&
      a.plannedEndDate >= context.today
  );

  upcomingMilestones.sort((a, b) => (a.plannedEndDate! > b.plannedEndDate! ? 1 : -1));
  const firstMilestone = upcomingMilestones[0];

  const nextMilestone = firstMilestone
    ? {
        id: firstMilestone.id,
        title: firstMilestone.title,
        dueDate: firstMilestone.plannedEndDate!,
      }
    : null;

  return {
    currentPhase,
    progressPercent,
    scheduleVarianceDays,
    scheduleHealth,
    overdueCount,
    blockedCount,
    nextMilestone,
  };
}
