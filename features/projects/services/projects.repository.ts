import {
  Project,
  ProjectAuditEvent,
  ProjectFilterParams,
  ProjectMemberRecord,
  ProjectSearchIndex,
  ProjectStatus,
  UserSecurityContext,
} from "../types/project.types";

import {
  buildProjectSearchIndex,
  matchesSearchIndex,
} from "../utils/project-search-index";

import { isUserAuthorizedForProject } from "./project-authorization";
import { DEV_CLIENTS, DEV_PROJECTS } from "@/services/repositories/development-project-adapter";

// Global Datastore State
const projectsStore: Project[] = [
  ...DEV_PROJECTS.map((p) => {
    let status: ProjectStatus = "ACTIVE";
    const pStatusLower = p.status.toLowerCase();
    if (pStatusLower === "upcoming") status = "UPCOMING";
    else if (pStatusLower === "active") status = "ACTIVE";
    else if (pStatusLower === "on_hold" || pStatusLower === "on-hold") status = "ON_HOLD";
    else if (pStatusLower === "completed") status = "COMPLETED";
    else if (pStatusLower === "archived") status = "ARCHIVED";
    else if (pStatusLower === "cancelled") status = "CANCELLED";

    // Requirement #2: Correct Skyline Corporate HQ Suite fixture (Option A: ACTIVE with phase Post-handover & pending warranty audit action)
    if (p.id === "proj-5") {
      return {
        id: "proj-5",
        workspaceId: p.workspaceId,
        clientId: p.clientId,
        name: "Skyline Corporate HQ Suite",
        code: "PRJ-SCH-05",
        type: "Commercial Office Interior",
        status: "ACTIVE" as ProjectStatus,
        health: "ON_TRACK" as const,
        phase: "Post-handover" as const,
        phaseProgress: "Warranty inspection pending",
        ownerId: p.ownerId || "user-current",
        ownerName: p.ownerName || "Arjun",
        siteLocationId: "loc-5",
        siteLocation: p.location,
        nextActionId: "act-proj-5",
        nextAction: {
          id: "act-proj-5",
          projectId: "proj-5",
          title: "Warranty & snag list final audit complete",
          type: "SITE_INSPECTION" as const,
          ownerId: p.ownerId || "user-current",
          ownerName: p.ownerName || "Arjun",
          dueAt: new Date(Date.now() + 4 * 24 * 3600 * 1000).toISOString(),
          status: "PENDING" as const,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        },
        startDate: p.startDate,
        targetCompletionDate: p.targetCompletionDate,
        createdAt: p.createdAt,
        createdBy: p.ownerId || "user-current",
        updatedAt: p.updatedAt,
      };
    }

    return {
      id: p.id,
      workspaceId: p.workspaceId,
      clientId: p.clientId,
      name: p.name,
      code: p.projectCode,
      type: p.projectType,
      status,
      health: p.status === "active" && p.upcomingDeadline?.includes("Overdue")
        ? ("NEEDS_ATTENTION" as const)
        : ("ON_TRACK" as const),
      phase: (p.phase === "Feasibility & Kickoff" ? "Site verification" : p.phase) as any,
      phaseProgress: p.phase === "Concept approval" ? "3 of 6 deliverables approved" : undefined,
      ownerId: p.ownerId || "user-current",
      ownerName: p.ownerName || "Arjun",
      siteLocationId: "loc-1",
      siteLocation: p.location,
      nextActionId: `act-${p.id}`,
      nextAction: p.nextRequiredAction
        ? {
            id: `act-${p.id}`,
            projectId: p.id,
            title: p.nextRequiredAction,
            type: "CLIENT_APPROVAL" as const,
            ownerId: p.ownerId || "user-current",
            ownerName: p.ownerName || "Arjun",
            dueAt: p.upcomingDeadline?.includes("Overdue")
              ? new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
              : p.upcomingDeadline?.includes("Today")
              ? new Date().toISOString()
              : new Date(Date.now() + 4 * 24 * 3600 * 1000).toISOString(),
            status: p.status === "on_hold" ? ("BLOCKED" as const) : ("PENDING" as const),
            blockedReason: p.status === "on_hold" ? "Paused by client request" : null,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
          }
        : null,
      startDate: p.startDate,
      targetCompletionDate: p.targetCompletionDate,
      createdAt: p.createdAt,
      createdBy: p.ownerId || "user-current",
      updatedAt: p.updatedAt,
    };
  }),
  // Requirement #2: Completed project fixture with nextAction = null
  {
    id: "proj-6",
    workspaceId: "ws-default",
    clientId: "cli-101",
    name: "Oakridge Estate",
    code: "PRJ-ORE-06",
    type: "Luxury Residential Villa",
    status: "COMPLETED" as ProjectStatus,
    health: "ON_TRACK" as const,
    phase: "Handover" as const,
    phaseProgress: "Handover certified",
    ownerId: "user-current",
    ownerName: "Arjun",
    siteLocationId: "loc-6",
    siteLocation: "Kochi, Kerala",
    nextActionId: null,
    nextAction: null, // COMPLETED project with null nextAction
    startDate: "2025-01-10",
    targetCompletionDate: "2026-04-30",
    actualCompletionDate: "2026-04-30",
    createdAt: "2025-01-10T10:00:00.000Z",
    createdBy: "user-current",
    updatedAt: "2026-04-30T16:00:00.000Z",
  },
];

const searchIndexesStore: ProjectSearchIndex[] = projectsStore.map((p) => {
  const client = DEV_CLIENTS.find((c) => c.id === p.clientId);
  return buildProjectSearchIndex(
    p.id,
    p.workspaceId,
    p.name,
    p.code,
    client ? client.name : "Client",
    p.siteLocation || "",
    p.ownerName || ""
  );
});

const membersStore: ProjectMemberRecord[] = projectsStore.map((p) => ({
  projectId: p.id,
  userId: p.ownerId || "user-current",
  role: "Lead",
  addedAt: p.createdAt,
}));

const auditEventsStore: ProjectAuditEvent[] = [];
const idempotencyKeysStore = new Set<string>();
const validationSessionsStore = new Map<string, { data: unknown; expiresAt: number }>();

export interface RepositoryQueryResult {
  projects: Project[];
  totalMatching: number;
  nextCursor: string | null;
  hasMore: boolean;
  statusCounts: {
    active: number;
    upcoming: number;
    onHold: number;
    completed: number;
    all: number;
  };
  attentionCounts: {
    overdueActions: number;
    blockedProjects: number;
    pendingClientDecisions: number;
  };
}

export const projectsRepository = {
  async queryProjects(
    context: UserSecurityContext,
    params: ProjectFilterParams
  ): Promise<RepositoryQueryResult> {
    const workspaceProjects = projectsStore.filter(
      (p) =>
        p.workspaceId === context.workspaceId &&
        isUserAuthorizedForProject(context, p, membersStore)
    );

    const matchesNonStatusFilters = (p: Project, ignoreStatusTab = false): boolean => {
      if (params.q && params.q.trim()) {
        const searchIndex = searchIndexesStore.find((idx) => idx.projectId === p.id);
        if (!searchIndex || !matchesSearchIndex(searchIndex, params.q)) {
          return false;
        }
      }

      if (params.ownership) {
        if (params.ownership === "my_projects") {
          if (p.ownerId !== context.userId) return false;
        } else if (params.ownership !== "all_projects" && p.ownerId !== params.ownership) {
          return false;
        }
      }

      if (params.phase && params.phase.length > 0) {
        if (!params.phase.includes(p.phase)) return false;
      }

      if (params.location && params.location.trim()) {
        const locQ = params.location.toLowerCase().trim();
        if (!p.siteLocation || !p.siteLocation.toLowerCase().includes(locQ)) return false;
      }

      if (params.attention && params.attention.length > 0) {
        const now = new Date();
        const matchesAnyAttention = params.attention.some((att) => {
          if (att === "overdue") {
            return p.nextAction?.dueAt && new Date(p.nextAction.dueAt) < now;
          }
          if (att === "blocked") {
            return p.health === "BLOCKED" || p.status === "ON_HOLD" || p.nextAction?.status === "BLOCKED";
          }
          if (att === "awaiting_client") {
            return p.nextAction?.title.toLowerCase().includes("client") || p.nextAction?.type === "CLIENT_APPROVAL";
          }
          if (att === "missing_owner") {
            return !p.ownerId;
          }
          if (att === "missing_next_action") {
            return !p.nextAction;
          }
          return false;
        });
        if (!matchesAnyAttention) return false;
      }

      if (!ignoreStatusTab) {
        const lifecycleFilter = params.lifecycle || [];
        const isArchivedRequested = lifecycleFilter.includes("ARCHIVED") || params.status === "ARCHIVED";
        const isCancelledRequested = lifecycleFilter.includes("CANCELLED") || params.status === "CANCELLED";

        if (p.status === "ARCHIVED" && !isArchivedRequested) return false;
        if (p.status === "CANCELLED" && !isCancelledRequested && params.status !== "ALL" && params.status !== undefined) {
          return false;
        }
      }

      return true;
    };

    // Unpaginated filtered base ignoring ONLY the active status tab parameter
    const filteredBaseForCounts = workspaceProjects.filter((p) => matchesNonStatusFilters(p, true));

    // Calculate statusCounts
    const statusCounts = {
      active: filteredBaseForCounts.filter((p) => p.status === "ACTIVE").length,
      upcoming: filteredBaseForCounts.filter((p) => p.status === "UPCOMING").length,
      onHold: filteredBaseForCounts.filter((p) => p.status === "ON_HOLD").length,
      completed: filteredBaseForCounts.filter((p) => p.status === "COMPLETED").length,
      all: filteredBaseForCounts.filter((p) => p.status !== "ARCHIVED").length,
    };

    // Requirement #1: Strict lifecycle status filtering for returned items
    let targetStatus: ProjectStatus | "ALL" = "ACTIVE";
    if (params.status) {
      if (params.status === "on-hold" || params.status === "ON_HOLD") targetStatus = "ON_HOLD";
      else targetStatus = params.status as ProjectStatus | "ALL";
    }

    let filteredProjects = workspaceProjects.filter((p) => matchesNonStatusFilters(p, false));

    if (targetStatus !== "ALL") {
      filteredProjects = filteredProjects.filter((p) => p.status === targetStatus);
    }

    // Requirement #3: Attention counts match the selected status tab & active filters
    const now = new Date();
    const attentionCounts = {
      overdueActions: filteredProjects.filter(
        (p) => p.nextAction?.dueAt && new Date(p.nextAction.dueAt) < now
      ).length,
      blockedProjects: filteredProjects.filter(
        (p) => p.health === "BLOCKED" || p.status === "ON_HOLD" || p.nextAction?.status === "BLOCKED"
      ).length,
      pendingClientDecisions: filteredProjects.filter(
        (p) => p.nextAction?.title.toLowerCase().includes("client") || p.nextAction?.type === "CLIENT_APPROVAL"
      ).length,
    };

    // Sorting
    const sort = params.sort || "action-due";
    filteredProjects.sort((a, b) => {
      if (sort === "action-due") {
        const aOverdue = a.nextAction?.dueAt && new Date(a.nextAction.dueAt) < now ? 1 : 0;
        const bOverdue = b.nextAction?.dueAt && new Date(b.nextAction.dueAt) < now ? 1 : 0;
        if (aOverdue !== bOverdue) return bOverdue - aOverdue;

        const aDue = a.nextAction?.dueAt ? new Date(a.nextAction.dueAt).getTime() : Infinity;
        const bDue = b.nextAction?.dueAt ? new Date(b.nextAction.dueAt).getTime() : Infinity;
        return aDue - bDue;
      }
      if (sort === "recently-updated") {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
      if (sort === "project-name") {
        return a.name.localeCompare(b.name);
      }
      if (sort === "start-date") {
        return new Date(b.startDate || 0).getTime() - new Date(a.startDate || 0).getTime();
      }
      return 0;
    });

    const totalMatching = filteredProjects.length;
    const limit = params.limit || 25;
    let startIndex = 0;

    if (params.cursor) {
      try {
        const decoded = JSON.parse(Buffer.from(params.cursor, "base64").toString("utf-8"));
        if (typeof decoded.offset === "number") {
          startIndex = decoded.offset;
        }
      } catch {
        startIndex = 0;
      }
    }

    const paginatedItems = filteredProjects.slice(startIndex, startIndex + limit);
    const nextOffset = startIndex + limit;
    const hasMore = nextOffset < totalMatching;

    const nextCursor = hasMore
      ? Buffer.from(JSON.stringify({ offset: nextOffset, t: Date.now() })).toString("base64")
      : null;

    return {
      projects: paginatedItems,
      totalMatching,
      nextCursor,
      hasMore,
      statusCounts,
      attentionCounts,
    };
  },

  async getProjectRawById(
    context: UserSecurityContext,
    id: string
  ): Promise<Project | null> {
    const project = projectsStore.find((p) => p.id === id && p.workspaceId === context.workspaceId);
    if (!project) return null;

    if (!isUserAuthorizedForProject(context, project, membersStore)) {
      return null;
    }
    return project;
  },

  async updateProjectStatus(
    context: UserSecurityContext,
    projectId: string,
    newStatus: ProjectStatus,
    reason?: string
  ): Promise<Project> {
    const projectIndex = projectsStore.findIndex(
      (p) => p.id === projectId && p.workspaceId === context.workspaceId
    );

    if (projectIndex === -1) {
      throw new Error(`Project ${projectId} not found.`);
    }

    const project = projectsStore[projectIndex];
    if (!isUserAuthorizedForProject(context, project, membersStore)) {
      throw new Error("Unauthorized to modify project status.");
    }

    const now = new Date().toISOString();
    const updatedProject: Project = {
      ...project,
      status: newStatus,
      updatedAt: now,
      archivedAt: newStatus === "ARCHIVED" ? now : project.archivedAt,
    };

    projectsStore[projectIndex] = updatedProject;

    const auditEvent: ProjectAuditEvent = {
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      workspaceId: context.workspaceId,
      projectId,
      eventType: newStatus === "ACTIVE" && project.status === "COMPLETED" ? "PROJECT_REOPENED" : "STATUS_CHANGED",
      fromStatus: project.status,
      toStatus: newStatus,
      actorId: context.userId,
      actorRole: context.role,
      timestamp: now,
      reason,
    };
    auditEventsStore.push(auditEvent);

    return updatedProject;
  },

  async saveValidationSession(validationId: string, data: unknown, ttlMs = 15 * 60 * 1000): Promise<void> {
    validationSessionsStore.set(validationId, {
      data,
      expiresAt: Date.now() + ttlMs,
    });
  },

  async getValidationSession(validationId: string): Promise<unknown | null> {
    const session = validationSessionsStore.get(validationId);
    if (!session) return null;
    if (Date.now() > session.expiresAt) {
      validationSessionsStore.delete(validationId);
      return null;
    }
    return session.data;
  },

  async isIdempotencyKeyUsed(key: string): Promise<boolean> {
    return idempotencyKeysStore.has(key);
  },

  async markIdempotencyKeyUsed(key: string): Promise<void> {
    idempotencyKeysStore.add(key);
  },

  async isProjectCodeExists(workspaceId: string, code: string): Promise<boolean> {
    const norm = code.trim().toLowerCase();
    return projectsStore.some(
      (p) => p.workspaceId === workspaceId && p.code.trim().toLowerCase() === norm
    );
  },

  async insertProject(project: Project): Promise<void> {
    projectsStore.unshift(project);
    const client = DEV_CLIENTS.find((c) => c.id === project.clientId);
    const searchIdx = buildProjectSearchIndex(
      project.id,
      project.workspaceId,
      project.name,
      project.code,
      client ? client.name : "Client",
      project.siteLocation || "",
      project.ownerName || ""
    );
    searchIndexesStore.unshift(searchIdx);
    membersStore.push({
      projectId: project.id,
      userId: project.ownerId || "user-current",
      role: "Lead",
      addedAt: project.createdAt,
    });
  },

  async getAuditLogsForProject(projectId: string): Promise<ProjectAuditEvent[]> {
    return auditEventsStore.filter((a) => a.projectId === projectId);
  },
};
