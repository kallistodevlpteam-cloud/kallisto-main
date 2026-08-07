export type SectionStatus =
  | "idle"
  | "loading"
  | "success"
  | "empty"
  | "stale"
  | "error"
  | "offline"
  | "restricted";

export type DestinationState =
  | { availability: "available"; route: string }
  | { availability: "coming-soon" }
  | { availability: "restricted"; reason: string };

export type ProjectHealth =
  | "on_track"
  | "attention"
  | "delayed"
  | "blocked"
  | "planned"
  | "completed"
  | "healthy"
  | "watch"
  | "at-risk";

export type WorkspaceCapability =
  | "home.view"
  | "financials.view"
  | "procurement.approve"
  | "boq.approve"
  | "payment.verify"
  | "document.approve"
  | "variation.approve"
  | "serviceArea.update"
  | "calendar.private.view";

export interface AssignedProjectCardData {
  id: string;
  name: string;
  city: string;
  imageUrl: string;
  phase: string;
  health: ProjectHealth;
  completionPercentage: number;
  currentActivity?: string;
  nextMilestone?: {
    title: string;
    date: string;
  };
  attentionCount?: number;
  href: string;
}

export interface PriorityPreview {
  id: string;
  tag: string;
  projectName: string;
  subtitle?: string;
  state: "overdue" | "blocked" | "scheduled" | "due-today" | "pending" | "info";
  priorityLevel: "critical" | "high" | "medium";
  dueText?: string;
  dueDate?: string; // ISO format date string for ranking decay
  assignedTo?: string;
  actionLabel: string;
  destination: DestinationState;
  financialExposure?: number; // In INR (₹)
  isClientBlocking?: boolean;
  isProjectBlocking?: boolean;
  updatedAt?: string; // ISO date string for tie-breaking
}

export interface RecentWorkItem {
  id: string;
  projectName: string;
  category: string;
  subTitle: string;
  status: string;
  updatedAt: string;
  actionLabel: string;
  destination: DestinationState;
}

export interface ActiveProjectItem {
  id: string;
  name: string;
  clientName: string;
  location: string;
  city?: string;
  phase: string;
  progressPercent: number; // 0 to 100
  health: ProjectHealth;
  nextMilestone: string;
  nextDeadline: string;
  currentActivity?: string;
  nextMilestoneDetails?: {
    title: string;
    date: string;
  };
  attentionCount?: number;
  pendingApprovalsCount: number;
  overdueTasksCount: number;
  expectedPayment?: string; // Display string e.g. "₹3.10L payment expected"
  expectedPaymentRaw?: number; // Raw numeric amount in INR for permission filtering
  owner: string;
  ownerAvatar?: string;
  thumbnailUrl?: string;
  statusState: "overdue" | "due-today" | "scheduled" | "blocked" | "pending" | "info";
  destination: DestinationState;
}

export type ScheduleEventType =
  | "delivery"
  | "site-visit"
  | "inspection"
  | "approval"
  | "meeting"
  | "payment"
  | "private";

export interface HomeSchedulePreviewItem {
  id: string;
  timeOrDate: string;
  title: string;
  projectName: string;
  typeChip: ScheduleEventType;
  isPrivate?: boolean;
  participants?: string[];
  route: string;
  isUpcoming?: boolean;
}

export type RequestCategory = "all" | "procurement" | "boq" | "payments" | "documents";

export interface ApprovalRequestItem {
  id: string;
  requestId: string; // e.g. "REQ-101"
  requestType: "procurement" | "boq" | "payment" | "document" | "variation";
  category: "procurement" | "boq" | "payments" | "documents";
  projectName: string;
  requestedBy: string;
  requestedDate: string;
  itemsSummary: string; // e.g. "Cement OPC 53 — 100 bags, Steel FE500 — 100 kg"
  amountOrQuantities?: string;
  amountRaw?: number; // INR numeric value for financial permission checks
  neededByDate: string;
  status: "Awaiting approval" | "Approved" | "Rejected";
  version: number;
  updatedAt: string; // ISO date string for stale detection
  rejectionReason?: string;
}

export interface RecentActivityItem {
  id: string;
  title: string;
  projectName: string;
  actor: string;
  timeAgo: string;
  category: string;
  iconType: "boq" | "site" | "task" | "document" | "payment";
  route: string;
}

export interface PipelineItem {
  id: string;
  title: string;
  countLabel: string;
  category: string;
  destination: DestinationState;
}

export interface CommitmentItem {
  id: string;
  title: string;
  subtitle: string;
  category: "payment" | "meeting" | "deadline";
  dueLabel: string;
  destination: DestinationState;
}

export interface PracticeOverviewData {
  pipeline: PipelineItem[];
  commitments: CommitmentItem[];
}

export type OdinSource =
  | "home-work-today"
  | "home-your-work-today"
  | "home-priority-preview"
  | "home-continue-working"
  | "home-current-work"
  | "home-workspace-launcher"
  | "home-templates";

export interface OdinContextPayload {
  route: "/home";
  workspaceId: string;
  source: OdinSource;
  activeEntityId?: string;
  activeEntityType?: string;
}

export interface OpenOdinOptions {
  prompt: string;
  context: OdinContextPayload;
}

export interface ApprovalActionResult {
  success: boolean;
  requestId: string;
  newStatus: "Awaiting approval" | "Approved" | "Rejected";
  serverTimestamp: string;
  auditRecordId: string;
  error?: string;
}
