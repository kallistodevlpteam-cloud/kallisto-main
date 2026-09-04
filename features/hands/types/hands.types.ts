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
}

export interface WorkforceRequest {
  id: string;
  projectId: string;
  projectName: string;
  trade: WorkerTrade;
  requiredDate: string;
  quantity: number;
  fulfilled: number;
  status: RequestStatus;
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

export interface WorkforceRequestDraft {
  projectId: string;
  siteLocation: string;
  trade: WorkerTrade | "";
  workerCount: string;
  skillLevel: string;
  startDate: string;
  expectedDuration: string;
  shiftTiming: string;
  requiredToolsOrCertifications: string;
  siteContact: string;
  notes: string;
}

export interface WorkforceRequestSubmission {
  projectId: string;
  siteLocation: string;
  trade: WorkerTrade;
  workerCount: number;
  skillLevel: string;
  startDate: string;
  expectedDuration: string;
  shiftTiming: string;
  requiredToolsOrCertifications: string;
  siteContact: string;
  notes: string;
}

export type WorkforceRequestField = keyof WorkforceRequestDraft;

export type WorkforceRequestErrors = Partial<
  Record<WorkforceRequestField, string>
>;
