export type WorkerTrade =
  | "Masons"
  | "Helpers"
  | "Painters"
  | "Electricians"
  | "Carpenters"
  | "Plumbers"
  | "Welders"
  | "Tile workers";

export type HandsTab =
  | "overview"
  | "requests"
  | "deployments"
  | "attendance"
  | "payments";

export type DeploymentStatus =
  | "Active"
  | "Needs attention"
  | "Awaiting check-in";

export type RequestStatus =
  | "Draft"
  | "Open"
  | "Partially assigned"
  | "Matching workers"
  | "Fulfilled";

export type DemandState = "Confirmed" | "Request pending" | "Not requested";

export type AttentionSeverity = "critical" | "warning" | "info";

export interface AttendanceSummary {
  state: "recorded" | "pending";
  present?: number;
  total?: number;
}

export interface DeploymentActivityTask {
  id: string;
  title: string;
  status: "completed" | "in-progress" | "pending" | "delayed" | "cancelled" | "scheduled" | "on-hold";
  time?: string;
  date?: string; // e.g. "2026-09-08" (YYYY-MM-DD)
  trade?: string;
  contractorName?: string;
  description?: string;
  boqItemCode?: string; // e.g. "BOQ-04.1"
  boqItemName?: string; // e.g. "230mm Wire-Cut Brick Masonry in CM 1:6"
  boqQuantity?: string; // e.g. "450 / 1,200 sq ft"
  ganttPhaseId?: string; // e.g. "phase-2"
  ganttPhaseName?: string; // e.g. "Phase 2: Superstructure Masonry & Lintel Level"
  serviceCategory?: string; // e.g. "Civil & Structural Execution"
  cancellationReason?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  workersCount?: number;
}

export interface DeploymentHistoryLogEntry {
  id: string;
  date: string;
  shiftNumber?: string;
  time: string;
  author: string;
  authorRole: string;
  category:
    | "Muster & Shift Progress"
    | "Shift Completion Sign-off"
    | "Milestone Verification"
    | "Safety & Logistics"
    | "Task Event"
    | "General";
  content: string;
  tasksCompleted?: string[];
  attendanceSummary?: string;
  dailyRateOrCost?: string;
}

export interface DeploymentTodayActivity {
  headline: string;
  description?: string;
  tasks?: DeploymentActivityTask[];
  siteLog?: string;
  loggedAt?: string;
}

export interface AssignedWorker {
  id: string;
  name: string;
  role: string;
  trade: string;
  status: "active" | "on-leave" | "delayed";
  shiftTiming?: string;
  checkInTime?: string;
  taskAssignment?: string;
  phone?: string;
  experience?: string;
}

export interface DeploymentContractor {
  id?: string;
  name: string;
  trade?: string;
  workerCount?: number;
  activeWorkers?: number;
  onLeaveWorkers?: number;
  assignedWorkers?: AssignedWorker[];
  crewId?: string;
  rating?: number;
  reviewCount?: number;
  leadName?: string;
  experienceYears?: number;
  verified?: boolean;
  badge?: string;
  avatar?: string;
  contactPhone?: string;
  specialization?: string;
}

export interface Deployment {
  id: string;
  projectId: string;
  projectName: string;
  location: string;
  workforce: string;
  shift: string;
  attendance: AttendanceSummary;
  supervisor: string;
  dailyCost: number;
  status: DeploymentStatus;
  startDate: string;
  endDate: string;
  coverImage?: string;
  category?: string;
  overallProgress?: number;
  dueLabel?: string;
  workerUpdate?: string;
  activeWorkers?: number;
  onLeaveWorkers?: number;
  workerTypes?: string;
  contractorName?: string;
  contractors?: (DeploymentContractor | string)[];
  todayActivity?: DeploymentTodayActivity;
}

export interface RequestTradeItem {
  trade: WorkerTrade;
  quantity: number;
  fulfilled?: number;
  skillLevel?: string;
  dailyRate?: number;
}

export interface WorkforceRequest {
  id: string;
  projectId: string;
  projectName: string;
  location?: string;
  trade: WorkerTrade | string;
  requiredDate: string;
  quantity: number;
  fulfilled: number;
  status: RequestStatus;
  contractorName?: string;
  contractorBrand?: string;
  contractorCoverImage?: string;
  contractorRating?: number;
  contractorExperienceYears?: number;
  dailyRate?: number;
  skillLevel?: string;
  shiftTiming?: string;
  duration?: string;
  durationDays?: number;
  startDate?: string;
  endDate?: string;
  isMultiTrade?: boolean;
  tradesBreakdown?: RequestTradeItem[];
}

export interface WorkforceDemand {
  id: string;
  dateLabel: string;
  projectName: string;
  trade: WorkerTrade;
  quantity: number;
  state: DemandState;
}

export interface HandsMetric {
  id: string;
  label: string;
  value: number;
  valueFormat: "number" | "currency";
  supportingText: string;
  tone?: "neutral" | "positive" | "warning" | "negative";
  icon: "workers" | "deployments" | "positions" | "cost";
}

export interface AttentionItem {
  id: string;
  title: string;
  detail: string;
  actionLabel: string;
  actionTab: HandsTab;
  severity: AttentionSeverity;
}

export interface HandsOverviewData {
  metrics: HandsMetric[];
  deployments: Deployment[];
  requests: WorkforceRequest[];
  attentionItems: AttentionItem[];
  demand: WorkforceDemand[];
}

export interface WorkforceRequestDraftItem {
  trade: WorkerTrade | string;
  workerCount: string;
  skillLevel?: string;
  dailyRate?: string;
}

export interface WorkforceRequestDraft {
  projectId: string;
  siteLocation: string;
  trade: WorkerTrade | string;
  workerCount: string;
  skillLevel: string;
  startDate: string;
  endDate?: string;
  expectedDuration: string;
  shiftTiming: string;
  requiredToolsOrCertifications: string;
  siteContact: string;
  notes: string;
  contractorName?: string;
  isMultiTrade?: boolean;
  tradesBreakdown?: WorkforceRequestDraftItem[];
}

export interface WorkforceRequestSubmission {
  projectId: string;
  siteLocation: string;
  trade: WorkerTrade | string;
  workerCount: number;
  skillLevel: string;
  startDate: string;
  endDate?: string;
  expectedDuration: string;
  shiftTiming: string;
  requiredToolsOrCertifications: string;
  siteContact: string;
  notes: string;
  contractorName?: string;
  isMultiTrade?: boolean;
  tradesBreakdown?: RequestTradeItem[];
}

export type WorkforceRequestField = keyof WorkforceRequestDraft;

export type WorkforceRequestErrors = Partial<
  Record<WorkforceRequestField, string>
>;

export type PaymentMethod = "bank_transfer" | "upi_transfer";

export interface ContractorPaymentRecord {
  id: string;
  requestId?: string;
  projectId?: string;
  contractorName: string;
  workerCount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  bankDetails?: {
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    beneficiaryName: string;
    utrReference: string;
  };
  upiDetails?: {
    upiId: string;
    qrCodeUrl?: string;
    transactionId: string;
  };
  paidAt: string;
  status: "Completed" | "Pending Verification" | "Processing";
}
