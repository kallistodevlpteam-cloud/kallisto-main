export type ProcurementStage =
  | "requirements"
  | "quotations"
  | "approval"
  | "ordered"
  | "delivered";

export type MaterialRequestStatus =
  | "quotes_received"
  | "awaiting_quotes"
  | "approval_pending"
  | "ordered"
  | "delivered";

export type HubProjectFilter = "nila-residence" | "lake-house" | "all";

export type HubCategoryFilter =
  | "all"
  | "cement"
  | "electrical"
  | "sanitaryware"
  | "steel";

export type RequiredDateFilter = "all" | "overdue" | "7_days" | "30_days";

export interface HubQueryState {
  project: HubProjectFilter;
  stage: ProcurementStage;
  status: MaterialRequestStatus | null;
  category: HubCategoryFilter;
  search: string;
  attention: boolean;
  requiredDate: RequiredDateFilter;
}

export interface ProjectOption {
  id: Exclude<HubProjectFilter, "all">;
  name: string;
}

export interface ProcurementMetric {
  label: string;
  value: string;
  tone?: "neutral" | "warning";
}

export interface PipelineStageSummary {
  id: ProcurementStage;
  label: string;
  countLabel: string;
  valueLabel: string;
}

export interface MaterialRequest {
  id: string;
  name: string;
  projectId: Exclude<HubProjectFilter, "all">;
  projectName: string;
  categories: ReadonlyArray<string>;
  categoryGroup: Exclude<HubCategoryFilter, "all">;
  quoteCount: number;
  requiredBy: string;
  requiredByLabel: string;
  status: MaterialRequestStatus;
  stage: Exclude<ProcurementStage, "requirements">;
  actionLabel: "Review" | "View" | "Compare" | "Track";
  needsAttention: boolean;
}

export interface ProcurementAlert {
  id: string;
  severity: "critical" | "warning" | "info";
  title: string;
  metadata: string;
  requestId?: string;
  targetStage?: ProcurementStage;
}

export interface UpcomingDelivery {
  id: string;
  material: string;
  dueLabel: string;
  requestId?: string;
}

export interface RecentSupplier {
  id: string;
  name: string;
  verified: boolean;
  location: string;
  categories: string;
  completedOrders: number;
  averageFulfilment: string;
}

export interface HubWorkspaceData {
  projects: ReadonlyArray<ProjectOption>;
  metrics: ReadonlyArray<ProcurementMetric>;
  pipeline: ReadonlyArray<PipelineStageSummary>;
  requests: ReadonlyArray<MaterialRequest>;
  alerts: ReadonlyArray<ProcurementAlert>;
  deliveries: ReadonlyArray<UpcomingDelivery>;
  suppliers: ReadonlyArray<RecentSupplier>;
}
