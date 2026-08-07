export type StudioWorkspaceType =
  | "boq"
  | "estimate"
  | "visualisation"
  | "proposal"
  | "specification"
  | "site_report"
  | "specification_report";

export type StudioAgentType =
  | "boq_builder"
  | "project_estimate"
  | "specification_report"
  | "visualisation"
  | "proposal"
  | "site_report";

export type StudioStartMethod =
  | "scratch"
  | "template"
  | "import"
  | "duplicate"
  | "draft";

export type StudioTaskStatus =
  | "draft"
  | "queued"
  | "processing"
  | "review_required"
  | "changes_requested"
  | "approved"
  | "published"
  | "failed"
  | "superseded"
  | "archived";

/**
 * Lifecycle status for a studio output (separate from delivery state).
 * An output's status does not change when a delivery record is created.
 */
export type StudioOutputStatus =
  | "generating"
  | "ready_for_review"
  | "revision_requested"
  | "superseded";

/**
 * Delivery status for a specific output version.
 * Belongs to the version, not the output or task.
 */
export type StudioDeliveryStatus = "not_sent" | "sending" | "delivered" | "failed";

/**
 * Authoritative recipient object. Never fabricated or guessed.
 * Must be resolved from the project's linked client record.
 */
export interface StudioDeliveryRecipient {
  clientId: string;
  name: string;
  email: string;
}

/**
 * Version-scoped delivery state.
 * Each version owns exactly one delivery state and zero or more delivery records.
 * V01 delivered does not affect V02's delivery state.
 */
export interface StudioVersionDeliveryState {
  versionId: string;
  status: StudioDeliveryStatus;
  /** ISO-8601 sent timestamp. Only present when status is "delivered". */
  sentAt?: string;
  /** The delivery record ID for the last successful delivery of this version. */
  deliveryRecordId?: string;
  /** Human-readable failure reason. Only present when status is "failed". */
  failureReason?: string;
}

/**
 * Immutable delivery record written exactly once per successful send.
 * Locked to one output + version. Never mutated by later revisions.
 */
export interface StudioDeliveryRecord {
  /** Delivery record primary key. */
  id: string;
  /** Workspace owning this delivery. */
  workspaceId: string;
  /** Output this record belongs to. */
  outputId: string;
  /** Exact version that was sent — immutable after creation. */
  versionId: string;
  /** Recipient resolved from the project client record. */
  recipient: StudioDeliveryRecipient;
  senderName: string;
  senderId: string;
  /** ISO-8601. Prototype-generated; production: server timestamp. */
  sentAt: string;
  deliveryStatus: "pending" | "delivered" | "failed";
  deliveryChannel: "email" | "link";
  /** Optional freeform message included with the delivery. */
  message?: string;
  /** Identifiers of attachments included in the delivery. */
  attachmentRefs: string[];
  /**
   * Idempotency key format: workspaceId:outputId:versionId:normalizedEmail
   * Guarantees exactly one delivery per version per recipient.
   */
  idempotencyKey: string;
}

export type StudioUseCase =
  // BOQ
  | "create_detailed_boq"
  | "create_package_boq"
  | "create_rate_analysis"
  | "import_existing_boq"
  | "create_variation_estimate"
  | "review_existing_boq"
  // Estimate
  | "quick_project_cost"
  | "preliminary_estimate"
  | "detailed_estimate"
  | "package_estimate"
  | "phase_budget"
  | "compare_cost_scenarios"
  // Visualisation
  | "interior_vis"
  | "exterior_vis"
  | "material_color_options"
  | "mood_board"
  | "enhance_existing_image"
  | "presentation_views"
  // Proposal
  | "project_proposal"
  | "fee_proposal"
  | "scope_of_work"
  | "client_presentation"
  | "design_presentation"
  | "progress_presentation"
  // Specification & Report
  | "material_spec"
  | "workmanship_spec"
  | "site_visit_report"
  | "weekly_progress_report"
  | "feasibility_report"
  | "project_status_report";

export interface StudioProjectOption {
  id: string;
  workspaceId: string;
  code: string;
  name: string;
  projectType: string;
  phase: string;
  location?: string;
  status: string;
  lastActivityAt?: string;
}

export interface StudioUseCaseDefinition {
  id: StudioUseCase;
  workspaceType: StudioWorkspaceType;
  label: string;
  description: string;
  availableStartMethods: StudioStartMethod[];
  requiredPermissions: string[];
}

export interface StudioSourceInput {
  id: string;
  name: string;
  type: "drawing" | "document" | "image" | "note" | "spreadsheet";
  fileUrl?: string;
  sizeBytes?: number;
  uploadedAt: string;
}

export interface StudioSourceInputSnapshot {
  id: string;
  name: string;
  type: "drawing" | "document" | "image" | "note" | "spreadsheet";
  fileUrl?: string;
  snapshotTimestamp: string;
}

export interface BOQTaskConfiguration {
  workspaceType: "boq";
  packageType: string;
  measurementStandard: string;
  drawingRevisionIds: string[];
  rateSourceId?: string;
  costLocation: string;
  includeTaxes: boolean;
  notes?: string;
}

export interface EstimateTaskConfiguration {
  workspaceType: "estimate";
  estimateStage: string;
  totalAreaSqFt: number;
  qualityTier: "standard" | "premium" | "luxury";
  costLocation: string;
  includedPackages: string[];
  contingencyPercentage: number;
  notes?: string;
}

export interface VisualisationTaskConfiguration {
  workspaceType: "visualisation";
  visualType: "interior" | "exterior" | "mood_board" | "image_enhancement";
  referenceFileIds: string[];
  designDirection: string;
  aspectRatio: string;
  outputQuality: string;
  notes?: string;
}

export interface ProposalTaskConfiguration {
  workspaceType: "proposal";
  documentType: string;
  targetAudience: string;
  includedSections: string[];
  milestoneFeeStructure: boolean;
  applyWorkspaceBranding: boolean;
  notes?: string;
}

export interface SpecificationReportTaskConfiguration {
  workspaceType: "specification_report";
  reportCategory: "material" | "workmanship" | "site_visit" | "weekly_progress" | "feasibility";
  siteVisitDate?: string;
  observations: string[];
  attachedPhotoIds: string[];
  assignedPartyIds: string[];
  notes?: string;
}

export type StudioTaskConfiguration =
  | BOQTaskConfiguration
  | EstimateTaskConfiguration
  | VisualisationTaskConfiguration
  | ProposalTaskConfiguration
  | SpecificationReportTaskConfiguration;

export interface StudioTask {
  id: string;
  workspaceId: string;
  projectId: string;
  projectCode: string;
  projectName: string;
  workspaceType: StudioWorkspaceType;
  useCase: StudioUseCase;
  startMethod: StudioStartMethod;
  status: StudioTaskStatus;
  currentVersionId?: string;
  ownerId: string;
  ownerName: string;
  createdByAgent?: StudioAgentType;
  intent?: "create" | "analyse" | "review" | "resolve";
  agentId?: string;
  prompt?: string;
  outputId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudioApproval {
  id: string;
  taskId: string;
  versionId: string;
  approverId: string;
  approverName: string;
  approverRole: string;
  decision: "approved" | "rejected";
  comments?: string;
  timestamp: string;
}

export interface StudioPublishRecord {
  id: string;
  taskId: string;
  versionId: string;
  projectId: string;
  publisherId: string;
  publisherName: string;
  publishedAt: string;
  idempotencyKey: string;
  documentRef?: string;
}

export interface StudioOutputReference {
  id: string;
  title: string;
  summary: string;
  fileUrl?: string;
  fileType?: string;
  financialTotal?: number;
  itemCount?: number;
}

export interface StudioOutputVersion {
  id: string;
  taskId: string;
  projectId: string;
  versionNumber: number;
  versionLabel: string;
  parentVersionId?: string;
  configurationSnapshot: StudioTaskConfiguration;
  sourceInputSnapshots: StudioSourceInputSnapshot[];
  outputReference?: StudioOutputReference;
  approval?: StudioApproval;
  publishRecord?: StudioPublishRecord;
  supersededByVersionId?: string;
  createdAt: string;
  createdByUserId: string;
}

export interface StudioValidationIssue {
  id: string;
  severity: "error" | "warning" | "info";
  code: string;
  message: string;
  field?: string;
}

export interface StudioComment {
  id: string;
  taskId: string;
  versionId?: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  content: string;
  createdAt: string;
}

export interface StudioAuditEvent {
  id: string;
  taskId: string;
  action: string;
  actorId: string;
  actorName: string;
  timestamp: string;
  details?: string;
}

export interface CreateStudioTaskCommand {
  workspaceId: string;
  workspaceType: StudioWorkspaceType;
  useCase: StudioUseCase;
  startMethod: StudioStartMethod;
  projectId: string;
  sourceInputs: StudioSourceInput[];
  configuration: StudioTaskConfiguration;
  createdByUserId: string;
  createdByAgent?: StudioAgentType;
  idempotencyKey: string;
}
