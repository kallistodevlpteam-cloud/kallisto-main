import { ProjectUpdateType } from "@/types/domain/project-update";

export type ProjectDocumentFolderId =
  | "drawings"
  | "documents"
  | "approvals"
  | "contracts"
  | "site-reports"
  | "renderings"
  | "boq-estimates"
  | "photos-media"
  | "unfiled";

export interface ResolveDocumentFolderInput {
  selectedCategory?: string;
  attachmentCategory?: string;
  updateType?: ProjectUpdateType;
  fileName: string;
  mimeType?: string;
}

export function resolveDocumentFolder(input: ResolveDocumentFolderInput): ProjectDocumentFolderId {
  const { selectedCategory, attachmentCategory, updateType, fileName, mimeType } = input;
  const nameLower = fileName.toLowerCase();
  const ext = fileName.includes(".") ? fileName.split(".").pop()?.toLowerCase() : "";

  // 1. Explicit attachment category
  if (attachmentCategory && isValidFolderId(attachmentCategory)) {
    return attachmentCategory as ProjectDocumentFolderId;
  }

  // 2. Explicit composer-selected category
  if (selectedCategory && isValidFolderId(selectedCategory)) {
    return selectedCategory as ProjectDocumentFolderId;
  }

  // Handle category labels mapped to IDs
  if (selectedCategory) {
    const mapped = mapLabelToFolderId(selectedCategory);
    if (mapped) return mapped;
  }
  if (attachmentCategory) {
    const mapped = mapLabelToFolderId(attachmentCategory);
    if (mapped) return mapped;
  }

  // 3. Keyword matching (high precision)
  if (nameLower.includes("drawing") || nameLower.includes("elevation") || nameLower.includes("layout") || nameLower.includes("floor plan") || nameLower.includes("structural")) {
    return "drawings";
  }
  if (nameLower.includes("approval") || nameLower.includes("sign-off") || nameLower.includes("signoff") || nameLower.includes("permit")) {
    return "approvals";
  }
  if (nameLower.includes("contract") || nameLower.includes("agreement") || nameLower.includes("subcontract") || nameLower.includes("scope of work")) {
    return "contracts";
  }
  if (nameLower.includes("site report") || nameLower.includes("inspection") || nameLower.includes("audit") || nameLower.includes("feasibility") || nameLower.includes("log")) {
    return "site-reports";
  }
  if (nameLower.includes("render") || nameLower.includes("3d") || nameLower.includes("perspective") || nameLower.includes("photo") || nameLower.includes("video")) {
    return "renderings";
  }
  if (nameLower.includes("document") || nameLower.includes("spec") || nameLower.includes("manual") || nameLower.includes("checklist") || nameLower.includes("guide")) {
    return "documents";
  }
  if (nameLower.includes("boq") || nameLower.includes("estimate") || nameLower.includes("rate analysis") || nameLower.includes("cost summary")) {
    return "boq-estimates";
  }

  // 4. Update type precedence
  if (updateType === "site_report") return "site-reports";
  if (updateType === "approval_requested" || updateType === "approval_decided") return "approvals";
  if (updateType === "variation") return "boq-estimates";
  if (updateType === "milestone") return "site-reports";

  // 5. MIME type & extension
  if (mimeType?.includes("dwg") || ext === "dwg" || ext === "dxf") return "drawings";
  if (mimeType?.startsWith("image/") || mimeType?.startsWith("video/") || ext === "png" || ext === "jpg" || ext === "jpeg" || ext === "webp" || ext === "mp4") return "renderings";

  // 6. Default fallback
  return "unfiled";
}

function isValidFolderId(val: string): boolean {
  return [
    "drawings",
    "documents",
    "approvals",
    "contracts",
    "site-reports",
    "renderings",
    "boq-estimates",
    "photos-media",
    "unfiled",
  ].includes(val);
}

function mapLabelToFolderId(label: string): ProjectDocumentFolderId | null {
  const norm = label.trim().toLowerCase();
  if (norm.includes("drawing")) return "drawings";
  if (norm.includes("document")) return "documents";
  if (norm.includes("approval")) return "approvals";
  if (norm.includes("contract")) return "contracts";
  if (norm.includes("site") || norm.includes("report")) return "site-reports";
  if (norm.includes("render") || norm.includes("photo") || norm.includes("media")) return "renderings";
  if (norm.includes("boq") || norm.includes("estimate")) return "boq-estimates";
  if (norm.includes("unfiled") || norm.includes("uncategorized")) return "unfiled";
  return null;
}
