export type LegacyEventType =
  | "drawing-deadline"
  | "follow-up"
  | "availability-block";

export type UserCreatableEventType =
  | "client-meeting"
  | "site-visit"
  | "design-review"
  | "submission-deadline"
  | "project-milestone"
  | "internal-meeting"
  | "consultation"
  | "external-appointment"
  | "focus-block"
  | "other";

export type EventType = UserCreatableEventType | "payment-milestone" | LegacyEventType;

export type EventStatus = "scheduled" | "completed" | "cancelled";

export type EventCategory = "meeting" | "deadline" | "milestone";

export type EventVisibility = "workspace" | "private" | "project-team" | "practice" | "client-shared";

export type ReminderMinutes = 0 | 15 | 30 | 60 | 1440 | null;

export type CalendarEventTime =
  | {
      allDay: false;
      startAt: string; // ISO date-time string
      endAt: string;   // ISO date-time string
      timezone: string;
    }
  | {
      allDay: true;
      startDate: string;        // YYYY-MM-DD
      endDateExclusive: string; // YYYY-MM-DD
      timezone: string;
    };

export type CalendarParticipant =
  | { kind: "workspace-user"; userId: string }
  | { kind: "client-contact"; contactId: string }
  | { kind: "external"; email: string; name?: string };

export type RelatedRecord =
  | { type: "project"; id: string }
  | { type: "enquiry"; id: string }
  | { type: "client"; id: string }
  | { type: "internal-practice"; id?: never }
  | { type: "none"; id?: never };

export type CalendarEventSource = "calendar" | "payments" | "project" | "system";

export interface StoredRecurrence {
  frequency: "daily" | "weekly" | "monthly";
  seriesId: string;
}

export interface RecurrenceInput {
  frequency: "daily" | "weekly" | "monthly";
}

export interface CalendarProjectionPreference {
  workspaceId: string;
  userId: string;
  eventId: string;
  reminderMinutes?: ReminderMinutes;
  dismissedAt?: string;
}

export interface BaseCalendarEvent {
  id: string;
  workspaceId: string;
  title: string;
  eventType: EventType;
  time: CalendarEventTime;
  ownerId: string | null; // Nullable for unresolved legacy events. Skip in conflicts.
  requiredParticipants: CalendarParticipant[]; // Accountable owner is never duplicated here
  optionalParticipants: CalendarParticipant[];
  createdBy: string;
  visibility: EventVisibility;
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
  description?: string;
  reminderMinutes?: ReminderMinutes;
  recurrence?: StoredRecurrence;
  source: CalendarEventSource;
  sourceRecordId?: string;
  systemManaged: boolean;
}

export interface ClientMeetingEvent extends BaseCalendarEvent {
  eventType: "client-meeting";
  relatedRecord: { type: "project"; id: string } | { type: "enquiry"; id: string } | { type: "client"; id: string };
  meetingFormat: "in-person" | "video" | "hybrid";
  location?: string;
  meetingUrl?: string;
  requiredDecision: string;
  documentsToReview: string;
}

export interface SiteVisitEvent extends BaseCalendarEvent {
  eventType: "site-visit";
  relatedRecord: { type: "project"; id: string } | { type: "enquiry"; id: string };
  siteAddress: string;
  assignedFieldMemberId: string;
  checklistTemplate: string;
  requirePhotographs: boolean;
  clientConfirmationRequirement: boolean;
}

export interface DesignReviewEvent extends BaseCalendarEvent {
  eventType: "design-review";
  relatedRecord: { type: "project"; id: string };
  drawingReference: string;
  reviewStage: string;
  reviewerId: string;
  requiredDecision: string;
  decisionDeadline: string;
}

export interface SubmissionDeadlineEvent extends BaseCalendarEvent {
  eventType: "submission-deadline";
  relatedRecord: { type: "project"; id: string };
  deliverable: string;
  responsibleOwnerId: string;
  reviewerId: string;
  submissionDestination: string;
  dependencies?: string;
  requiredProofOfSubmission: boolean;
}

export interface ProjectMilestoneEvent extends BaseCalendarEvent {
  eventType: "project-milestone";
  relatedRecord: { type: "project"; id: string };
  projectPhase: string;
  prerequisites?: string;
  verificationOwnerId: string;
  completionEvidenceRequirement: string;
}

export interface PaymentMilestoneEvent extends BaseCalendarEvent {
  eventType: "payment-milestone";
  source: "payments";
  systemManaged: true;
  relatedRecord: { type: "project"; id: string };
  paymentRecordId: string;
  responsibleParty: string;
}

export interface InternalMeetingEvent extends BaseCalendarEvent {
  eventType: "internal-meeting";
  relatedRecord: { type: "internal-practice"; id?: never } | { type: "none"; id?: never };
  agenda: string;
  requiredDecisions?: string;
}

export interface ConsultationEvent extends BaseCalendarEvent {
  eventType: "consultation";
  relatedRecord: { type: "enquiry"; id: string };
  consultationFormat: "in-person" | "video" | "hybrid";
  location?: string;
  meetingUrl?: string;
  requirementSummary: string;
  qualificationOutcomeRequirement: string;
}

export interface ExternalAppointmentEvent extends BaseCalendarEvent {
  eventType: "external-appointment";
  relatedRecord: { type: "client"; id: string } | { type: "none"; id?: never };
  externalPersonOrg: string;
  purpose: string;
  location?: string;
  meetingUrl?: string;
  followUpRequirement?: string;
}

export interface FocusBlockEvent extends BaseCalendarEvent {
  eventType: "focus-block";
  relatedRecord: { type: "project"; id: string } | { type: "none"; id?: never };
  linkedTaskId?: string;
  focusObjective: string;
}

export interface OtherEvent extends BaseCalendarEvent {
  eventType: "other";
  relatedRecord: RelatedRecord;
  legacyType?: LegacyEventType;
  location?: string;
  meetingUrl?: string;
}

export type CalendarEvent =
  | ClientMeetingEvent
  | SiteVisitEvent
  | DesignReviewEvent
  | SubmissionDeadlineEvent
  | ProjectMilestoneEvent
  | PaymentMilestoneEvent
  | InternalMeetingEvent
  | ConsultationEvent
  | ExternalAppointmentEvent
  | FocusBlockEvent
  | OtherEvent;

// Mutation Inputs Types

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

export type UserCreatableCalendarEvent = Exclude<CalendarEvent, PaymentMilestoneEvent>;

type RepositoryOwnedFields =
  | "id"
  | "workspaceId"
  | "createdBy"
  | "createdAt"
  | "updatedAt"
  | "status"
  | "source"
  | "sourceRecordId"
  | "systemManaged";

type RequireOwner<T> = T extends unknown
  ? Omit<T, "ownerId" | "recurrence"> & { ownerId: string; recurrence?: RecurrenceInput }
  : never;

export type CreateCalendarEventInput = RequireOwner<
  DistributiveOmit<
    UserCreatableCalendarEvent,
    RepositoryOwnedFields
  >
>;

export type UpdateableCalendarEventData = RequireOwner<
  DistributiveOmit<
    UserCreatableCalendarEvent,
    RepositoryOwnedFields
  >
>;

export interface UpdateCalendarEventInput {
  id: string;
  expectedUpdatedAt: string; // The UI must submit the stored timestamp to verify optimistic concurrency
  replacement: UpdateableCalendarEventData;
}

// Filter State and Workspace Types

export interface CalendarFilterState {
  eventTypes: EventType[];
  projectId?: string;
  attendeeId?: string;
  myEventsOnly: boolean;
  deadlinesOnly: boolean;
  searchQuery: string;
}

export interface WorkspaceProject {
  id: string;
  name: string;
  code: string;
  clientName?: string;
}

export interface WorkspaceEnquiry {
  id: string;
  title: string;
  code: string;
  clientName?: string;
}

export interface WorkspaceClient {
  id: string;
  name: string;
  company?: string;
}

export interface WorkspaceTeamMember {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string;
}

export type CalendarViewMode = "month" | "week" | "agenda";

export type CalendarPageState = "success" | "loading" | "empty" | "error" | "forbidden";

// Parser result types used by event-parser.ts
export type ParseEventResult =
  | {
      success: true;
      event: CalendarEvent;
      migrated: boolean;
      warnings: string[];
    }
  | {
      success: false;
      raw: unknown;
      errors: string[];
    };

// Canonical Calendar & Gantt Operational Domain Types
export type CalendarActivityType =
  | "site_visit"
  | "client_meeting"
  | "team_meeting"
  | "inspection"
  | "drawing_delivery"
  | "approval"
  | "payment_review"
  | "task"
  | "milestone"
  | "reminder";

export type CalendarVisibility = "private" | "project" | "workspace";

export type CalendarScope = "mine" | "team" | "project";

export interface CalendarActivity {
  id: string;
  workspaceId: string;
  title: string;
  activityType: CalendarActivityType;
  visibility: CalendarVisibility;
  ownerId: string;
  assigneeIds: string[];
  time: CalendarEventTime;
  projectId?: string;
  location?: string;
  meetingUrl?: string;
  notes?: string;
  sourceType: "calendar_activity" | "project_schedule_item";
  sourceId: string;
  linkedScheduleItemId?: string;
  status: "scheduled" | "completed" | "cancelled";
}

export interface ProjectScheduleItem {
  id: string;
  workspaceId: string;
  projectId: string;
  title: string;
  itemType: "phase" | "task" | "deliverable" | "approval" | "milestone";
  startDate: string; // YYYY-MM-DD
  dueDate: string;   // YYYY-MM-DD
  baselineStartDate?: string;
  baselineDueDate?: string;
  progress?: number;
  status: "todo" | "in_progress" | "waiting" | "blocked" | "completed";
  assigneeId?: string;
  dependencyIds: string[];
  blockerReason?: string;
  linkedActivityIds?: string[];
}

