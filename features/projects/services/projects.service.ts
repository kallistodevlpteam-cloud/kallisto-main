import {
  ProjectFilterParams,
  ProjectListItem,
  ProjectStatus,
  ProjectsWorkspaceQueryResult,
  UserSecurityContext,
} from "../types/project.types";
import { calculateDueState } from "../utils/project-due-state";
import { isStatusTransitionAllowed, validateStatusTransition } from "../utils/project-status-matrix";
import { checkUserPermission } from "./project-authorization";
import { projectsRepository } from "./projects.repository";
import { DEV_CLIENTS } from "@/services/repositories/development-project-adapter";

export const projectsService = {
  async getProjectsWorkspaceQuery(
    context: UserSecurityContext,
    params: ProjectFilterParams,
    options?: { now?: Date | string }
  ): Promise<ProjectsWorkspaceQueryResult> {
    if (!checkUserPermission(context, "projects.view")) {
      throw new Error("Access Denied: User lacks 'projects.view' permission.");
    }

    const repoResult = await projectsRepository.queryProjects(context, params);
    const clock = options?.now || new Date();

    const items: ProjectListItem[] = repoResult.projects.map((proj) => {
      const client = DEV_CLIENTS.find((c) => c.id === proj.clientId);
      const clientDisplayName = client
        ? client.name + (client.organisationName ? ` (${client.organisationName})` : "")
        : "Client";

      let nextActionDto: ProjectListItem["nextAction"] = null;

      if (proj.nextAction) {
        const dueCalc = calculateDueState(proj.nextAction.dueAt, { now: clock });
        const contextStr = proj.status === "ON_HOLD"
          ? "Paused project"
          : proj.nextAction.type === "CLIENT_APPROVAL"
          ? "Awaiting client"
          : `Assigned to ${proj.nextAction.ownerName || proj.ownerName || "Lead"}`;

        nextActionDto = {
          id: proj.nextAction.id,
          title: proj.nextAction.title,
          context: contextStr,
          ownerName: proj.nextAction.ownerName || proj.ownerName || undefined,
          dueAt: proj.nextAction.dueAt,
          dueState: dueCalc.dueState,
          dueLabel: dueCalc.dueLabel,
          isOverdue: dueCalc.isOverdue,
          isBlocked: proj.nextAction.status === "BLOCKED" || proj.status === "ON_HOLD",
        };
      }

      // Compute allowed actions for this user & project state
      const allowedActions: ProjectListItem["allowedActions"] = ["open"];

      if (checkUserPermission(context, "projects.edit")) {
        allowedActions.push("edit");
      }
      if (checkUserPermission(context, "projects.assign_owner")) {
        allowedActions.push("change_owner");
      }
      if (
        checkUserPermission(context, "projects.place_on_hold") &&
        isStatusTransitionAllowed(proj.status, "ON_HOLD")
      ) {
        allowedActions.push("put_on_hold");
      }
      if (
        checkUserPermission(context, "projects.complete") &&
        isStatusTransitionAllowed(proj.status, "COMPLETED")
      ) {
        allowedActions.push("mark_complete");
      }
      if (
        proj.status === "COMPLETED" &&
        checkUserPermission(context, "projects.reopen")
      ) {
        allowedActions.push("reopen");
      }
      if (
        checkUserPermission(context, "projects.archive") &&
        isStatusTransitionAllowed(proj.status, "ARCHIVED")
      ) {
        allowedActions.push("archive");
      }

      const initials = (proj.ownerName || "Lead")
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

      return {
        id: proj.id,
        name: proj.name,
        code: proj.code,
        type: proj.type,
        clientId: proj.clientId,
        clientDisplayName,
        phase: proj.phase,
        phaseProgress: proj.phaseProgress,
        nextAction: nextActionDto,
        owner: {
          id: proj.ownerId,
          name: proj.ownerName || "Unassigned",
          initials,
        },
        status: proj.status,
        health: proj.health,
        updatedAt: proj.updatedAt,
        allowedActions,
      };
    });

    return {
      items,
      nextCursor: repoResult.nextCursor,
      hasMore: repoResult.hasMore,
      totalMatching: repoResult.totalMatching,
      statusCounts: repoResult.statusCounts,
      attentionCounts: repoResult.attentionCounts,
    };
  },

  async updateProjectLifecycleStatus(
    context: UserSecurityContext,
    projectId: string,
    targetStatus: ProjectStatus,
    reason?: string
  ): Promise<{ success: boolean; newStatus: ProjectStatus }> {
    const rawProject = await projectsRepository.getProjectRawById(context, projectId);
    if (!rawProject) {
      throw new Error(`Project ${projectId} not found or access denied.`);
    }

    const hasReopenPermission = checkUserPermission(context, "projects.reopen");

    // Validate state transition against matrix
    validateStatusTransition(rawProject.status, targetStatus, {
      hasReopenPermission,
      reason,
    });

    const updated = await projectsRepository.updateProjectStatus(
      context,
      projectId,
      targetStatus,
      reason
    );

    return {
      success: true,
      newStatus: updated.status,
    };
  },

  async reopenProject(
    context: UserSecurityContext,
    projectId: string,
    reason: string
  ): Promise<{ success: boolean; newStatus: ProjectStatus }> {
    if (!checkUserPermission(context, "projects.reopen")) {
      throw new Error("Access Denied: Reopening a project requires 'projects.reopen' permission.");
    }
    return this.updateProjectLifecycleStatus(context, projectId, "ACTIVE", reason);
  },
};
