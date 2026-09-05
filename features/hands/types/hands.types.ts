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
  status: "completed" | "in-progress" | "pending" | "delayed";
  time?: string;
  trade?: string;
}

export interface DeploymentTodayActivity {
  headline: string;
  description?: string;
  tasks?: DeploymentActivityTask[];
  siteLog?: string;
  loggedAt?: string;
}

export interface DeploymentContractor {
  id?: string;
  name: string;
  trade?: string;
  workerCount?: number;
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
