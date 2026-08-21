/**
 * Studio Conversation Timeline Event Types
 *
 * Defines the domain model for meaningful activity/milestone markers
 * along the Hive Studio conversation spine.
 */

export type ConversationEventType =
  | "REQUIREMENT"
  | "MESSAGE"
  | "DOCUMENT"
  | "DRAWING"
  | "REVISION"
  | "AI_ACTION"
  | "TASK"
  | "DECISION"
  | "APPROVAL"
  | "ISSUE";

export type ConversationRelatedEntityType =
  | "document"
  | "drawing"
  | "output"
  | "proposal"
  | "boq"
  | "estimate"
  | "task"
  | "decision"
  | "approval";

export interface ConversationEvent {
  /** Unique identifier for the timeline event */
  id: string;
  /** Thread or task ID this event belongs to */
  threadId?: string;
  /** Project identifier */
  projectId?: string;
  /** Domain classification for the event */
  type: ConversationEventType;
  /** Primary title / heading (e.g. "PROPOSAL V01 READY", "DRAWING REVISION") */
  title: string;
  /** Concise summary / description of what occurred */
  summary: string;
  /** Optional bullet details (e.g. ["3 drawing changes", "2 comments"]) */
  details?: string[];
  /** Human-readable or relative timestamp */
  timestamp: string;
  /** Exact message ID linked to this event for jump-to-turn scrolling */
  messageId: string;
  /** Related entity classification for quick-open actions */
  relatedEntityType?: ConversationRelatedEntityType;
  /** Target entity ID (e.g. output ID "out-1") */
  relatedEntityId?: string;
  /** Version identifier (e.g. "V01", "V02") */
  relatedEntityVersion?: string;
  /** Action button label (e.g. "Open preview", "View drawing") */
  relatedEntityActionLabel?: string;
  /** Lifecycle status */
  status?: "pending" | "completed" | "in_progress" | "approved" | "rejected";
  /** If true, the event marker gets slightly elevated prominence on the spine */
  isImportant?: boolean;
}
