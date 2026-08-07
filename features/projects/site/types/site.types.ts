export type SiteView =
  | "overview"
  | "daily_logs"
  | "inspections"
  | "issues"
  | "attendance";

export type SiteActivityStatus =
  | "scheduled"
  | "in_progress"
  | "blocked"
  | "awaiting_inspection"
  | "completed"
  | "cancelled";

export type SiteIssueSeverity = "low" | "medium" | "high" | "critical";

export type SiteDailyLogStatus =
  | "draft"
  | "submitted"
  | "approved"
  | "returned";

export type SiteDeliveryStatus =
  | "expected"
  | "arrived"
  | "partially_received"
  | "rejected"
  | "delayed";

export type SiteEvidenceType =
  | "progress_photo"
  | "inspection_evidence"
  | "delivery_proof"
  | "issue_evidence"
  | "measurement_evidence";

export interface SiteActivityComment {
  id: string;
  author: string;
  message: string;
  createdAt: string;
}

export interface SiteAuditEvent {
  id: string;
  action: string;
  actor: string;
  createdAt: string;
}

export interface SiteActivity {
  id: string;
  projectId: string;
  startTime: string;
  endTime: string;
  title: string;
  zone: string;
  crew: string;
  workerCount?: number;
  status: SiteActivityStatus;
  progressPercent: number;
  evidenceCount: number;
  lastUpdatedTime: string;
  description: string;
  dependencies: string[];
  plannedDuration: string;
  actualDuration?: string;
  linkedTimelineTaskId?: string;
  linkedTimelineTaskLabel?: string;
  linkedBoqItemId?: string;
  linkedBoqItemLabel?: string;
  comments: SiteActivityComment[];
  auditHistory: SiteAuditEvent[];
}

export interface SiteAttendanceSummary {
  date: string;
  siteStatus: "open" | "closed";
  lastCheckInTime: string;
  peopleOnSite: number;
  expectedPeople: number;
  checkedOutPeople: number;
  absentPeople: number;
  supervisors: number;
  contractors: number;
}

export interface SiteDailyLog {
  id: string;
  projectId: string;
  date: string;
  dateLabel: string;
  status: SiteDailyLogStatus;
  submittedBy: string;
  submittedAt?: string;
  workCompleted: string;
  constraints: string;
  workforceSummary: string;
  materialsReceived: string;
  equipmentUsed: string;
  safetyObservations: string;
  evidenceCount: number;
  revisionHistory: string[];
}

export interface SiteInspection {
  id: string;
  projectId: string;
  title: string;
  zone: string;
  inspectionType: "quality" | "safety" | "milestone";
  relatedActivityTitle: string;
  scheduledAt: string;
  scheduledLabel: string;
  status:
    | "due"
    | "scheduled"
    | "in_progress"
    | "awaiting_approval"
    | "passed"
    | "failed"
    | "cancelled";
  inspectorName: string;
  evidenceIds: string[];
}

export interface SiteIssue {
  id: string;
  projectId: string;
  title: string;
  severity: SiteIssueSeverity;
  location: string;
  ownerName: string;
  age: string;
  raisedDateLabel: string;
  dueDateLabel: string;
  linkedActivityTitle: string;
  status:
    | "open"
    | "in_progress"
    | "blocked"
    | "under_review"
    | "supplier_follow_up"
    | "resolved";
  linkedTimelineTaskId?: string;
  linkedBoqItemId?: string;
}

export interface SiteCrewAttendance {
  id: string;
  crewName: string;
  presentCount: number;
  expectedCount: number;
}

export interface SiteAttendanceWorker {
  id: string;
  projectId: string;
  name: string;
  trade: string;
  contractor: string;
  checkInTime: string;
  checkOutTime?: string;
  totalHours: string;
  status: "on_site" | "checked_out" | "absent";
}

export interface SiteDelivery {
  id: string;
  projectId: string;
  material: string;
  supplier: string;
  expectedTime: string;
  quantity: string;
  receivingPerson: string;
  status: SiteDeliveryStatus;
  linkedBoqItemId?: string;
}

export interface SiteEvidence {
  id: string;
  projectId: string;
  capturedAt: string;
  activityId: string;
  activityTitle: string;
  uploadedBy: string;
  evidenceType: SiteEvidenceType;
  visualTone: "structure" | "electrical" | "inspection" | "delivery";
}

export interface SiteAlert {
  id: string;
  label: string;
  tone: "warning" | "danger";
  targetView: SiteView;
}

export interface SiteDailyProgress {
  id: string;
  projectId: string;
  workPackage: string;
  completedQuantity: number;
  totalQuantity: number;
  unit: string;
  progressPercent: number;
  variancePercent: number;
  varianceState: "behind" | "on_plan" | "ahead";
  linkedTimelineTaskId?: string;
  linkedBoqItemId?: string;
}

export interface SiteDay {
  projectId: string;
  projectName: string;
  date: string;
  attendance: SiteAttendanceSummary;
  safety: {
    activeIncidentCount: number;
    lastToolboxTalk: string;
  };
  nextControlPoint: {
    title: string;
    scheduledTime: string;
    assignmentStatus: string;
  };
  activities: SiteActivity[];
  dailyLogs: SiteDailyLog[];
  inspections: SiteInspection[];
  issues: SiteIssue[];
  attendanceCrews: SiteCrewAttendance[];
  attendanceWorkers: SiteAttendanceWorker[];
  deliveries: SiteDelivery[];
  evidence: SiteEvidence[];
  alerts: SiteAlert[];
  progress: SiteDailyProgress[];
}
