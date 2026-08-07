import { ProjectScheduleActivity, ScheduleSummaryContext } from "../../../domain/project-schedule.types";

export interface ChronologicalGroup {
  id: "needs_attention" | "today" | "upcoming" | "recently_completed" | "unscheduled";
  title: string;
  subtitle?: string;
  activities: ProjectScheduleActivity[];
}

export function getChronologicalGroups(
  activities: ProjectScheduleActivity[],
  context: ScheduleSummaryContext,
  includeCancelled = false
): ChronologicalGroup[] {
  const today = context.today;

  // Filter out cancelled unless explicitly requested
  const validActivities = activities.filter((a) => includeCancelled || a.status !== "cancelled");

  const needsAttention: ProjectScheduleActivity[] = [];
  const todayGroup: ProjectScheduleActivity[] = [];
  const upcomingGroup: ProjectScheduleActivity[] = [];
  const recentlyCompletedGroup: ProjectScheduleActivity[] = [];
  const unscheduledGroup: ProjectScheduleActivity[] = [];

  // Calculate 14 days ago threshold
  const todayMs = new Date(today).getTime();
  const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000;

  for (const act of validActivities) {
    const startDate = act.plannedStartDate;
    const endDate = act.plannedEndDate;

    // 1. Unscheduled Check
    if (!startDate && !endDate) {
      unscheduledGroup.push(act);
      continue;
    }

    // 2. Needs Attention (Blocked, Overdue Incomplete, Rejected Approval)
    const isOverdue = endDate && endDate < today && act.status !== "completed";
    const isBlocked = act.status === "blocked";
    const isRejected = act.approvalStatus === "rejected";

    if ((isBlocked || isOverdue || isRejected) && act.status !== "completed") {
      needsAttention.push(act);
      continue;
    }

    // 3. Recently Completed (Completed within last 14 days)
    if (act.status === "completed") {
      const compDateStr = act.completedAt || act.actualEndDate || endDate;
      if (compDateStr) {
        const compMs = new Date(compDateStr).getTime();
        if (todayMs - compMs <= fourteenDaysMs) {
          recentlyCompletedGroup.push(act);
        }
      }
      continue;
    }

    // 4. Today (Spanning today, starting today, or milestone/approval due today)
    const spansToday = startDate && endDate && startDate <= today && endDate >= today;
    const startsToday = startDate === today;
    const dueToday = endDate === today;

    if (spansToday || startsToday || dueToday) {
      todayGroup.push(act);
      continue;
    }

    // 5. Upcoming (Starting in the future)
    if (startDate && startDate > today) {
      upcomingGroup.push(act);
      continue;
    }

    // Fallback if past due date but not flagged earlier
    if (endDate && endDate < today) {
      needsAttention.push(act);
    } else {
      upcomingGroup.push(act);
    }
  }

  const result: ChronologicalGroup[] = [];

  if (needsAttention.length > 0) {
    result.push({
      id: "needs_attention",
      title: "Needs Attention",
      subtitle: "Overdue, blocked, or rejected activities requiring immediate action",
      activities: needsAttention,
    });
  }

  if (todayGroup.length > 0) {
    result.push({
      id: "today",
      title: "Today",
      subtitle: "Activities active or due today",
      activities: todayGroup,
    });
  }

  if (upcomingGroup.length > 0) {
    result.push({
      id: "upcoming",
      title: "Upcoming",
      subtitle: "Scheduled future activities",
      activities: upcomingGroup,
    });
  }

  if (recentlyCompletedGroup.length > 0) {
    result.push({
      id: "recently_completed",
      title: "Recently Completed",
      subtitle: "Activities completed within the last 14 days",
      activities: recentlyCompletedGroup,
    });
  }

  if (unscheduledGroup.length > 0) {
    result.push({
      id: "unscheduled",
      title: "Unscheduled",
      subtitle: "Activities awaiting date allocation",
      activities: unscheduledGroup,
    });
  }

  return result;
}
