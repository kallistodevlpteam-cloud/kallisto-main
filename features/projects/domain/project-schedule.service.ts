import {
  ProjectScheduleActivity,
  ProjectSchedulePhase,
  ProjectSchedulePermissions,
  ScheduleSummaryContext,
} from "./project-schedule.types";
import { projectScheduleRepository } from "./project-schedule.repository";

export interface ScheduleLoadResult {
  phases: ProjectSchedulePhase[];
  activities: ProjectScheduleActivity[];
  permissions: ProjectSchedulePermissions;
  context: ScheduleSummaryContext;
}

export interface ScheduleActor {
  id: string;
  role: "admin" | "provider" | "client" | "viewer";
}

export class ProjectScheduleService {
  async getSchedule(params: {
    projectId: string;
    actor: ScheduleActor;
    todayStr?: string;
  }): Promise<ScheduleLoadResult> {
    const phases = await projectScheduleRepository.getPhasesByProjectId(params.projectId);
    const rawActivities = await projectScheduleRepository.getActivitiesByProjectId(params.projectId);

    // Resolve permissions based on actor role
    const permissions: ProjectSchedulePermissions = {
      canViewSchedule: true,
      canCreateActivity: params.actor.role === "admin" || params.actor.role === "provider",
      canEditActivity: params.actor.role === "admin" || params.actor.role === "provider",
      canDeleteActivity: params.actor.role === "admin",
      canCompleteActivity: params.actor.role === "admin" || params.actor.role === "provider",
      canEditBaseline: params.actor.role === "admin",
      canViewBaseline: true,
      canViewPrivateActivities: params.actor.role === "admin" || params.actor.role === "provider",
      canViewRestrictedDates: true,
      canManageDependencies: params.actor.role === "admin" || params.actor.role === "provider",
      canApproveActivity: params.actor.role === "admin" || params.actor.role === "client",
    };

    // Filter private activities at data boundary if unauthorized
    const activities = rawActivities.filter((act) => {
      if (act.visibility === "private" && !permissions.canViewPrivateActivities) {
        return false;
      }
      return true;
    });

    const context: ScheduleSummaryContext = {
      today: params.todayStr || new Date().toISOString().slice(0, 10),
      timezone: "Asia/Kolkata",
    };

    return {
      phases,
      activities,
      permissions,
      context,
    };
  }
}

export const projectScheduleService = new ProjectScheduleService();
