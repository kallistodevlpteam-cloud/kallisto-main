export type ProjectDocumentStatus =
  | "draft"
  | "in_review"
  | "changes_requested"
  | "approved"
  | "rejected"
  | "archived"
  | "superseded";

export type ProjectDocumentSource =
  | "team"
  | "client"
  | "field"
  | "system";

export type ProjectDocumentVisibility =
  | "internal"
  | "client_visible"
  | "restricted";

export interface ProjectDocumentOwner {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface ProjectDocumentVersion {
  version: number;
  status: ProjectDocumentStatus;
  createdAt: string;
  createdBy: string;
  sizeBytes: number;
}

export interface ProjectDocumentActivity {
  id: string;
  action: string;
  actorName: string;
  createdAt: string;
}

export type ProjectDocumentSourceType =
  | "project_update"
  | "system"
  | "manual_admin";

export interface ProjectDocument {
  id: string;
  projectId: string;
  name: string;
  extension: string;
  categoryId: string;
  folderId: string | null;
  status: ProjectDocumentStatus;
  visibility: ProjectDocumentVisibility;
  source: ProjectDocumentSource;
  sourceType: ProjectDocumentSourceType;
  sourceUpdateId?: string;
  sourceAttachmentId?: string;
  publishedAt: string;
  publicationKey: string;
  storageObjectId: string;
  downloadUrl: string;
  version: number;
  sizeBytes: number;
  owner: ProjectDocumentOwner;
  linkedMilestone?: {
    id: string;
    name: string;
  };
  sharedWith: ProjectDocumentOwner[];
  versions: ProjectDocumentVersion[];
  recentActivity: ProjectDocumentActivity[];
  isStarred: boolean;
  isUnreadByCurrentUser?: boolean;
  isNew?: boolean;
  isInBin?: boolean;
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  approvedBy?: string;
}

export interface ProjectDocumentFolder {
  id: string;
  projectId: string;
  name: string;
  count: number;
  parentId?: string | null;
}

export interface ProjectDocumentWorkspaceData {
  documents: ProjectDocument[];
  folders: ProjectDocumentFolder[];
  totalFileCount: number;
  lastUpdatedAt: string;
}

export interface ProjectDocumentUploadProgress {
  fileName: string;
  progress: number;
  state: "queued" | "uploading" | "complete" | "failed";
  error?: string;
}

export interface ProjectDocumentUploadResult {
  uploaded: ProjectDocument[];
  failures: Array<{ fileName: string; error: string }>;
}
