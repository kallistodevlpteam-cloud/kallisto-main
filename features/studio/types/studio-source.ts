export type StudioSourceType =
  | "drawing"
  | "document"
  | "image"
  | "note"
  | "boq"
  | "estimate"
  | "project_file";

export interface StudioSource {
  id: string;
  type: StudioSourceType;
  name: string;
  mimeType?: string;
  size?: number;
  status: "queued" | "uploading" | "ready" | "failed";
  storageReference?: string;
  errorCode?: string;
  errorMessage?: string;
  progress?: number;
}

export type StudioIntent = "create" | "analyse" | "review" | "resolve";

export type StudioWorkspaceMode =
  | "idle"        // No active task
  | "validating"  // Checking project, source, and agent requirements
  | "ready"       // Valid task created, awaiting generation trigger
  | "generating"  // Backend generation in progress
  | "review"      // Output exists and requires user review
  | "failed";     // Validation, upload, or generation failed
