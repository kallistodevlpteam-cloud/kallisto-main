import { authedFetch, getStoredAuthToken } from "@/lib/auth/authed-fetch";
import { fetchBackendDashboard } from "@/lib/backend/backend-client";

export interface ActiveProjectItem {
  id: number;
  name: string;
  type: string;
  status: string;
  coverImageUrl: string | null;
  clientName: string | null;
  location: string | null;
  updatedAt: number | null;
}

export interface PriorityPreview {
  id: number;
  projectId: number;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  phase: string | null;
  type: "task" | "milestone";
  financialExposure?: number;
}

export interface PipelineItem {
  id: number;
  name: string;
  type: string;
  clientName: string | null;
  location: string | null;
  budget: number | string | null;
  createdAt: number | null;
}

export interface SchedulePreviewItem {
  id: number;
  projectId: number;
  title: string;
  dueDate: string | null;
  phase: string | null;
  status: string;
  type: "task" | "milestone";
}

export interface RecentActivityItem {
  id: number;
  projectId: number;
  type: string;
  title: string;
  actor: string | null;
  createdAt: string;
}

export interface DashboardData {
  activeProjects: ActiveProjectItem[];
  needsAttention: PriorityPreview[];
  pipeline: PipelineItem[];
  schedulePreview: SchedulePreviewItem[];
  recentActivities: RecentActivityItem[];
}

/** Fetch dashboard data from the real backend.
 * Falls back to empty states if the backend is unavailable. */
export async function fetchDashboardData(): Promise<DashboardData> {
  try {
    const token = getStoredAuthToken() || undefined;
    const data = await fetchBackendDashboard(token);

    return {
      activeProjects: data.active_projects.map((p) => ({
        id: p.id,
        name: p.name,
        type: p.type,
        status: p.status,
        coverImageUrl: p.coverImageUrl,
        clientName: p.clientName,
        location: p.location,
        updatedAt: typeof p.updatedAt === "string" ? new Date(p.updatedAt).getTime() : (p.updatedAt ?? null),
      })),
      needsAttention: data.needs_attention.map((a) => ({
        id: a.id,
        projectId: a.projectId,
        title: a.title,
        status: a.status,
        priority: a.priority ?? "medium",
        dueDate: a.dueDate,
        phase: a.phase,
        type: a.type as "task" | "milestone",
        financialExposure: a.financialExposure,
      })),
      pipeline: data.pipeline.map((p) => ({
        id: p.id,
        name: p.name,
        type: p.type,
        clientName: p.clientName,
        location: p.location,
        budget: p.budget,
        createdAt: typeof p.createdAt === "string" ? new Date(p.createdAt).getTime() : (p.createdAt ?? null),
      })),
      schedulePreview: data.schedule_preview.map((s) => ({
        id: s.id,
        projectId: s.projectId,
        title: s.title,
        dueDate: s.dueDate,
        phase: s.phase,
        status: s.status,
        type: s.type as "task" | "milestone",
      })),
      recentActivities: data.recent_activities.map((a) => ({
        id: a.id,
        projectId: a.projectId,
        type: a.type,
        title: a.title,
        actor: a.actor,
        createdAt: a.createdAt,
      })),
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn("Dashboard backend fetch failed, returning empty:", error);
    return {
      activeProjects: [],
      needsAttention: [],
      pipeline: [],
      schedulePreview: [],
      recentActivities: [],
    };
  }
}

/** Legacy service object compatible with the existing HomeWorkspace hook. */
export const homeWorkspaceService = {
  async getActiveProjects(_userRole?: string): Promise<ActiveProjectItem[]> {
    const data = await fetchDashboardData();
    return data.activeProjects;
  },
  async getPriorityPreviews(_userRole?: string): Promise<PriorityPreview[]> {
    const data = await fetchDashboardData();
    return data.needsAttention;
  },
  async getSchedulePreview(_userRole?: string): Promise<SchedulePreviewItem[]> {
    const data = await fetchDashboardData();
    return data.schedulePreview;
  },
  async getRecentActivities(_userRole?: string): Promise<RecentActivityItem[]> {
    const data = await fetchDashboardData();
    return data.recentActivities;
  },
  async getPipelineItems(_userRole?: string): Promise<PipelineItem[]> {
    const data = await fetchDashboardData();
    return data.pipeline;
  },
};
