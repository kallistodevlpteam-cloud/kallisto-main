export type ProjectUpdateType =
  | "general"
  | "milestone"
  | "task_completed"
  | "document_uploaded"
  | "approval_requested"
  | "approval_decided"
  | "site_report"
  | "issue"
  | "variation"
  | "payment"
  | "meeting"
  | "system";

export type UpdateVisibility = "project_team" | "client_visible" | "internal";

export interface ProjectUpdateAttachment {
  id: string;
  type: "image" | "document";
  url: string;
  thumbnailUrl?: string;
  name: string;
  sizeBytes?: number;
  mimeType?: string;
  storageObjectId?: string;
  downloadUrl?: string;
  documentCategory?: string;
  revisesDocumentId?: string;
  dimensions?: { width: number; height: number };
  uploadProgress?: number; // 0..100
  uploadStatus?: "uploading" | "completed" | "error";
  errorMessage?: string;
  overlayBadgeText?: string;
}

export interface ProjectUpdateDocumentPublication {
  status: "not_required" | "pending" | "partial" | "published" | "failed";
  publishedDocumentIds: string[];
  failedAttachments: Array<{
    attachmentId: string;
    fileName: string;
    error: string;
  }>;
  lastAttemptedAt?: string;
}

export interface ProjectUpdateLinkedEntity {
  type:
    | "task"
    | "milestone"
    | "document"
    | "approval"
    | "site_report"
    | "boq"
    | "payment"
    | "variation";
  id: string;
  title: string;
  subtitle?: string;
  status?: string;
  progress?: number;
  metadata?: Record<string, string>;
}

export interface ProjectUpdateReply {
  id: string;
  updateId: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  authorAvatar?: string;
  body: string;
  createdAt: string;
  updatedAt?: string;
  attachments?: ProjectUpdateAttachment[];
}

export interface ProjectUpdate {
  id: string;
  projectId: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  authorAvatar?: string;
  type: ProjectUpdateType;
  title?: string;
  body?: string;
  visibility: UpdateVisibility;
  attachments?: ProjectUpdateAttachment[];
  publishedDocumentIds?: string[];
  documentPublication?: ProjectUpdateDocumentPublication;
  linkedEntity?: ProjectUpdateLinkedEntity;
  mentionedUserIds?: string[];
  isPinned?: boolean;
  pinnedBy?: string;
  isImportant?: boolean;
  acknowledgementCount: number;
  acknowledgedByCurrentUser?: boolean;
  acknowledgedAvatars?: string[];
  mediaBadgeText?: string;
  savedByCurrentUser?: boolean;
  reactions?: Record<string, number>;
  userReaction?: string;
  replyCount: number;
  replies?: ProjectUpdateReply[];
  createdAt: string;
  updatedAt?: string;
  locationMetadata?: string;
}

export type ProjectUpdateCursor = {
  createdAt: string;
  id: string;
};

export type ProjectUpdatePage = {
  items: ProjectUpdate[];
  nextCursor?: ProjectUpdateCursor;
  hasMore: boolean;
};

export interface ListProjectUpdatesInput {
  projectId: string;
  typeFilter?: string; // 'all' | 'milestone' | 'task' | 'document' | 'approval' | 'site' | 'finance'
  sort?: "latest" | "oldest";
  cursor?: ProjectUpdateCursor;
  limit?: number;
}

export interface CreateProjectUpdateInput {
  projectId: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  authorAvatar?: string;
  type: ProjectUpdateType;
  title?: string;
  body?: string;
  visibility: UpdateVisibility;
  attachments?: ProjectUpdateAttachment[];
  linkedEntity?: ProjectUpdateLinkedEntity;
}

export interface CreateProjectUpdateReplyInput {
  updateId: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  authorAvatar?: string;
  body: string;
  attachments?: ProjectUpdateAttachment[];
}
