import {
  ActiveProjectItem,
  ApprovalActionResult,
  ApprovalRequestItem,
  CommitmentItem,
  HomeSchedulePreviewItem,
  PipelineItem,
  PriorityPreview,
  ProjectHealth,
  RecentActivityItem,
  RecentWorkItem,
  WorkspaceCapability,
} from "@/types/domain/home";
import {
  MOCK_ACTIVE_PROJECTS,
  MOCK_APPROVAL_REQUESTS,
  MOCK_COMMITMENT_ITEMS,
  MOCK_NEEDS_ATTENTION_ITEMS,
  MOCK_PIPELINE_ITEMS,
  MOCK_RECENT_ACTIVITIES,
  MOCK_RECENT_WORK_ITEMS,
  MOCK_SCHEDULE_PREVIEW_ITEMS,
} from "./home-workspace-mock-data";

export const RANKING_CONFIG = {
  SEVERITY_WEIGHTS: { critical: 1000, high: 500, medium: 200 } as const,
  OVERDUE_DAY_WEIGHT: 50,
  CLIENT_BLOCKING_WEIGHT: 200,
  PROJECT_BLOCKING_WEIGHT: 300,
  DEADLINE_HOUR_DECAY: 2,
  MAX_FINANCIAL_EXPOSURE_CAP: 1_000_000, // ₹10,00,000 cap
  MAX_FINANCIAL_SCORE: 300,
};

export function calculatePriorityScore(item: PriorityPreview, now: Date = new Date()): number {
  const dueMs = item.dueDate ? new Date(item.dueDate).getTime() : now.getTime();
  const nowMs = now.getTime();

  // Clamped overdue days (only positive if past due date)
  const rawOverdueDays = (nowMs - dueMs) / (1000 * 60 * 60 * 24);
  const overdueDays = Math.max(0, Math.floor(rawOverdueDays));

  // Clamped remaining hours until deadline (only positive if before due date)
  const rawHoursUntilDeadline = (dueMs - nowMs) / (1000 * 60 * 60);
  const hoursUntilDeadline = Math.max(0, Math.floor(rawHoursUntilDeadline));

  // Capped & normalized financial exposure
  const financialAmount = Math.min(
    RANKING_CONFIG.MAX_FINANCIAL_EXPOSURE_CAP,
    Math.max(0, item.financialExposure ?? 0)
  );
  const financialScore =
    (financialAmount / RANKING_CONFIG.MAX_FINANCIAL_EXPOSURE_CAP) *
    RANKING_CONFIG.MAX_FINANCIAL_SCORE;

  // Numeric weights for boolean flags
  const clientBlockingWeight = item.isClientBlocking ? RANKING_CONFIG.CLIENT_BLOCKING_WEIGHT : 0;
  const projectBlockingWeight = item.isProjectBlocking ? RANKING_CONFIG.PROJECT_BLOCKING_WEIGHT : 0;
  const severityWeight = RANKING_CONFIG.SEVERITY_WEIGHTS[item.priorityLevel] ?? 200;

  return (
    severityWeight +
    overdueDays * RANKING_CONFIG.OVERDUE_DAY_WEIGHT +
    financialScore +
    clientBlockingWeight +
    projectBlockingWeight -
    hoursUntilDeadline * RANKING_CONFIG.DEADLINE_HOUR_DECAY
  );
}

export function rankNeedsAttentionItems(
  items: PriorityPreview[],
  now: Date = new Date()
): PriorityPreview[] {
  return [...items].sort((a, b) => {
    const scoreA = calculatePriorityScore(a, now);
    const scoreB = calculatePriorityScore(b, now);

    if (scoreA !== scoreB) {
      return scoreB - scoreA; // Higher score first
    }

    // Deterministic Tie-Breaking Order:
    // 1. Project-blocking status (true first)
    if (!!a.isProjectBlocking !== !!b.isProjectBlocking) {
      return a.isProjectBlocking ? -1 : 1;
    }

    // 2. Overdue duration (larger overdue first)
    const dueMsA = a.dueDate ? new Date(a.dueDate).getTime() : now.getTime();
    const dueMsB = b.dueDate ? new Date(b.dueDate).getTime() : now.getTime();
    const overdueA = Math.max(0, now.getTime() - dueMsA);
    const overdueB = Math.max(0, now.getTime() - dueMsB);
    if (overdueA !== overdueB) {
      return overdueB - overdueA;
    }

    // 3. Severity (critical > high > medium)
    const sevOrder = { critical: 3, high: 2, medium: 1 };
    const sevA = sevOrder[a.priorityLevel] ?? 1;
    const sevB = sevOrder[b.priorityLevel] ?? 1;
    if (sevA !== sevB) {
      return sevB - sevA;
    }

    // 4. Earliest deadline (ascending)
    if (dueMsA !== dueMsB) {
      return dueMsA - dueMsB;
    }

    // 5. Most recently updated (descending)
    const updatedA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const updatedB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    return updatedB - updatedA;
  });
}

export function calculateProjectHealth(project: {
  pendingApprovalsCount: number;
  overdueTasksCount: number;
  healthOverride?: ProjectHealth;
}): ProjectHealth {
  if (project.healthOverride) {
    return project.healthOverride;
  }
  if (project.overdueTasksCount > 1 || (project.pendingApprovalsCount > 1 && project.overdueTasksCount > 0)) {
    return "blocked";
  }
  if (project.overdueTasksCount === 1 || project.pendingApprovalsCount > 1) {
    return "at-risk";
  }
  if (project.pendingApprovalsCount === 1) {
    return "watch";
  }
  return "healthy";
}

const ROLE_CAPABILITIES: Record<string, WorkspaceCapability[]> = {
  owner: [
    "home.view",
    "financials.view",
    "procurement.approve",
    "boq.approve",
    "payment.verify",
    "document.approve",
    "variation.approve",
    "serviceArea.update",
    "calendar.private.view",
  ],
  admin: [
    "home.view",
    "financials.view",
    "procurement.approve",
    "boq.approve",
    "payment.verify",
    "document.approve",
    "variation.approve",
    "serviceArea.update",
    "calendar.private.view",
  ],
  project_manager: [
    "home.view",
    "financials.view",
    "procurement.approve",
    "boq.approve",
    "document.approve",
    "variation.approve",
  ],
  designer: ["home.view", "document.approve"],
  site_supervisor: ["home.view", "document.approve"],
  finance_user: ["home.view", "financials.view", "payment.verify", "boq.approve"],
  team_member: ["home.view"],
  read_only: ["home.view"],
};

export function hasCapability(userRole: string = "owner", capability: WorkspaceCapability): boolean {
  const caps = ROLE_CAPABILITIES[userRole.toLowerCase()] ?? ROLE_CAPABILITIES["owner"];
  return caps.includes(capability);
}

// In-memory store for simulation of repository mutations
const requestsStore = [...MOCK_APPROVAL_REQUESTS];
const executedIdempotencyKeys = new Set<string>();

export interface HomeWorkspaceService {
  getPriorityPreviews: (userRole?: string) => Promise<PriorityPreview[]>;
  getRecentWorkItems: () => Promise<RecentWorkItem[]>;
  getActiveProjects: (userRole?: string) => Promise<ActiveProjectItem[]>;
  getTodaySchedulePreview: (userRole?: string) => Promise<HomeSchedulePreviewItem[]>;
  getUpcomingSchedulePreview: (userRole?: string) => Promise<HomeSchedulePreviewItem[]>;
  getApprovalRequests: (userRole?: string, category?: string) => Promise<ApprovalRequestItem[]>;
  getRecentActivities: () => Promise<RecentActivityItem[]>;
  getPipelineItems: () => Promise<PipelineItem[]>;
  getCommitmentItems: () => Promise<CommitmentItem[]>;
  getPendingEnquiryCount: () => Promise<number | null>;
  executeApprovalAction: (params: {
    requestId: string;
    action: "approve" | "reject";
    rejectionReason?: string;
    idempotencyKey: string;
    expectedVersion: number;
    userRole?: string;
  }) => Promise<ApprovalActionResult>;
}

export const homeWorkspaceService: HomeWorkspaceService = {
  async getPriorityPreviews(userRole: string = "owner"): Promise<PriorityPreview[]> {
    if (!hasCapability(userRole, "home.view")) {
      return [];
    }
    const ranked = rankNeedsAttentionItems(MOCK_NEEDS_ATTENTION_ITEMS);
    // Filter financial exposure if role cannot view financials
    if (!hasCapability(userRole, "financials.view")) {
      return ranked.map((item) => ({
        ...item,
        financialExposure: undefined,
      }));
    }
    return ranked;
  },

  async getRecentWorkItems(): Promise<RecentWorkItem[]> {
    return MOCK_RECENT_WORK_ITEMS;
  },

  async getActiveProjects(userRole: string = "owner"): Promise<ActiveProjectItem[]> {
    if (!hasCapability(userRole, "home.view")) {
      return [];
    }
    const canViewFinancials = hasCapability(userRole, "financials.view");
    return MOCK_ACTIVE_PROJECTS.map((project) => ({
      ...project,
      health: calculateProjectHealth(project),
      expectedPayment: canViewFinancials ? project.expectedPayment : undefined,
      expectedPaymentRaw: canViewFinancials ? project.expectedPaymentRaw : undefined,
    }));
  },

  async getTodaySchedulePreview(userRole: string = "owner"): Promise<HomeSchedulePreviewItem[]> {
    const canViewPrivate = hasCapability(userRole, "calendar.private.view");
    const todayEvents = MOCK_SCHEDULE_PREVIEW_ITEMS.filter((item) => !item.isUpcoming);

    return todayEvents.map((event) => {
      if (event.isPrivate && !canViewPrivate) {
        return {
          ...event,
          title: "Busy",
          projectName: "Private Event",
          participants: [],
        };
      }
      return event;
    });
  },

  async getUpcomingSchedulePreview(userRole: string = "owner"): Promise<HomeSchedulePreviewItem[]> {
    const canViewPrivate = hasCapability(userRole, "calendar.private.view");
    const upcomingEvents = MOCK_SCHEDULE_PREVIEW_ITEMS.filter((item) => item.isUpcoming);

    return upcomingEvents.map((event) => {
      if (event.isPrivate && !canViewPrivate) {
        return {
          ...event,
          title: "Busy",
          projectName: "Private Event",
          participants: [],
        };
      }
      return event;
    });
  },

  async getApprovalRequests(userRole: string = "owner", category: string = "all"): Promise<ApprovalRequestItem[]> {
    let list = [...requestsStore];
    if (category !== "all") {
      list = list.filter((item) => item.category === category);
    }
    const canViewFinancials = hasCapability(userRole, "financials.view");
    return list.map((item) => ({
      ...item,
      amountOrQuantities: canViewFinancials || !item.amountRaw ? item.amountOrQuantities : "Quantities restricted",
      amountRaw: canViewFinancials ? item.amountRaw : undefined,
    }));
  },

  async getRecentActivities(): Promise<RecentActivityItem[]> {
    return MOCK_RECENT_ACTIVITIES;
  },

  async getPipelineItems(): Promise<PipelineItem[]> {
    return MOCK_PIPELINE_ITEMS;
  },

  async getCommitmentItems(): Promise<CommitmentItem[]> {
    return MOCK_COMMITMENT_ITEMS;
  },

  async getPendingEnquiryCount(): Promise<number | null> {
    const pipelineItem = MOCK_PIPELINE_ITEMS.find((item) => item.id === "pipe-1");
    const countMatch = pipelineItem?.countLabel?.match(/^\d+/);
    return countMatch ? Number.parseInt(countMatch[0], 10) : 4;
  },

  async executeApprovalAction({
    requestId,
    action,
    rejectionReason,
    idempotencyKey,
    expectedVersion,
    userRole = "owner",
  }): Promise<ApprovalActionResult> {
    // 1. Idempotency Check
    if (executedIdempotencyKeys.has(idempotencyKey)) {
      const existing = requestsStore.find((r) => r.requestId === requestId || r.id === requestId);
      return {
        success: true,
        requestId,
        newStatus: existing?.status === "Approved" ? "Approved" : "Rejected",
        serverTimestamp: new Date().toISOString(),
        auditRecordId: `audit-idem-${idempotencyKey}`,
      };
    }

    // 2. Execution-time Capability Check
    const reqIndex = requestsStore.findIndex((r) => r.requestId === requestId || r.id === requestId);
    if (reqIndex === -1) {
      return {
        success: false,
        requestId,
        newStatus: "Awaiting approval",
        serverTimestamp: new Date().toISOString(),
        auditRecordId: "",
        error: "Request record not found.",
      };
    }

    const reqItem = requestsStore[reqIndex];

    let requiredCap: WorkspaceCapability = "document.approve";
    if (reqItem.requestType === "procurement") requiredCap = "procurement.approve";
    else if (reqItem.requestType === "boq") requiredCap = "boq.approve";
    else if (reqItem.requestType === "payment") requiredCap = "payment.verify";
    else if (reqItem.requestType === "variation") requiredCap = "variation.approve";

    if (!hasCapability(userRole, requiredCap)) {
      return {
        success: false,
        requestId,
        newStatus: reqItem.status,
        serverTimestamp: new Date().toISOString(),
        auditRecordId: "",
        error: `Insufficient permissions: User lacks ${requiredCap} capability.`,
      };
    }

    // 3. Stale Record Detection
    if (reqItem.version !== expectedVersion) {
      return {
        success: false,
        requestId,
        newStatus: reqItem.status,
        serverTimestamp: new Date().toISOString(),
        auditRecordId: "",
        error: "Stale record: This request was modified by another user. Please refresh.",
      };
    }

    // 4. Mandatory Rejection Reason Check
    if (action === "reject" && (!rejectionReason || !rejectionReason.trim())) {
      return {
        success: false,
        requestId,
        newStatus: reqItem.status,
        serverTimestamp: new Date().toISOString(),
        auditRecordId: "",
        error: "Rejection reason is required.",
      };
    }

    // 5. Update State & Create Audit Record
    const newStatus = action === "approve" ? "Approved" : "Rejected";
    const serverTimestamp = new Date().toISOString();
    const auditRecordId = `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    requestsStore[reqIndex] = {
      ...reqItem,
      status: newStatus,
      version: reqItem.version + 1,
      updatedAt: serverTimestamp,
      rejectionReason: action === "reject" ? rejectionReason : undefined,
    };

    executedIdempotencyKeys.add(idempotencyKey);

    return {
      success: true,
      requestId,
      newStatus,
      serverTimestamp,
      auditRecordId,
    };
  },
};
