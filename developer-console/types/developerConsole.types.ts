export type Environment = "local" | "development" | "staging" | "production";

export type UserRole = "developer" | "super_admin" | "qa" | "regular_user";

export type CheckStatus =
  | "not_verified"
  | "not_started"
  | "mocked"
  | "partial"
  | "connected"
  | "tested"
  | "blocked"
  | "failed"
  | "stale"
  | "skipped_with_reason";

export type DiagnosticStatus =
  | "not_run"
  | "running"
  | "success"
  | "warning"
  | "error"
  | "missing"
  | "invalid"
  | "unknown"
  | "stale"
  | "unavailable";

export type IssueStatus = "open" | "investigating" | "in_progress" | "resolved" | "accepted_risk";

export type IssueSeverity = "blocker" | "critical" | "major" | "minor";

export type ReadinessCategory =
  | "authentication"
  | "data_loading"
  | "mutations"
  | "files_media"
  | "security"
  | "reliability"
  | "deployment";

export type ReadinessEvaluationState = "not_evaluated" | "evaluating" | "evaluated" | "invalid" | "stale";

export interface BackendActionDefinition {
  actionId: string;
  actionName: string;
  uiComponent: string;
  eventHandler: string;
  serviceMethod: string;
  apiEndpoint: string;
  databaseTarget: string;
  requiredPermission: string;
  isRequired: boolean;
  notes?: string;
}

export interface BackendActionRecord {
  actionId: string;
  pageId: string;
  status: CheckStatus;
  testedBy?: string;
  testedAt?: string;
  notes?: string;
  buildId?: string;
}

export interface ReadinessCheckDefinition {
  itemId: string;
  category: ReadinessCategory;
  title: string;
  description: string;
  isRequired: boolean;
  isAutomated: boolean;
  weight: number;
  blockingLevel: "none" | "staging" | "production";
}

export interface ReadinessCheckRecord {
  itemId: string;
  pageId: string;
  providerId?: string;
  environment: Environment;
  status: CheckStatus;
  checkedBy?: string;
  checkedAt?: string;
  evidence?: string[];
  notes?: string;
  buildId?: string;
  manifestVersion: string;
}

export interface DiagnosticDefinition {
  key: string;
  label: string;
  description: string;
  trustLevel: "client_observed" | "server_verified";
}

export interface DiagnosticResult {
  key: string;
  status: DiagnosticStatus;
  trustLevel: "client_observed" | "server_verified";
  checkedAt: string;
  buildId: string;
  durationMs?: number;
  safeDetails?: string;
}

export interface DeveloperIssue {
  issueId: string;
  pageId: string;
  title: string;
  description: string;
  severity: IssueSeverity;
  category: string;
  status: IssueStatus;
  owner?: string;
  relatedActionId?: string;
  evidence?: string;
  createdDate: string;
  resolvedDate?: string;
  resolutionNotes?: string;
}

export interface PageReadinessManifest {
  pageId: string;
  pageName: string;
  routePattern: RegExp;
  requiredRoles: string[];
  backendActions: BackendActionDefinition[];
  checklistRequirements: ReadinessCheckDefinition[];
  diagnostics: DiagnosticDefinition[];
  requiredTests: string[];
  manifestVersion: string;
}

export interface DeploymentGateResult {
  status: "not_ready" | "ready_for_staging" | "staging_verification_required" | "ready_for_production" | "production_blocked";
  reasons: string[];
  overridesAllowed: boolean;
}

export interface AcceptedRiskOverride {
  overrideId: string;
  pageId: string;
  itemId: string;
  approver: string;
  reason: string;
  expiryDate: string;
  scope: "staging" | "production" | "both";
  buildId: string;
  createdAt: string;
}

export interface AuditRecord {
  auditId: string;
  timestamp: string;
  actorId: string;
  actorRole: string;
  action: string;
  details: string;
  pageId: string;
  environment: Environment;
  buildId: string;
}
