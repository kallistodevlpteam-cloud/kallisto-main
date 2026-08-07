export type BoqNumericValue = number | null | undefined;

export type BoqItemStatus =
  | "Draft"
  | "Reviewed"
  | "Approved"
  | "Needs attention";

export type BoqWorkspaceStatus = "Draft" | "In review" | "Approved";

export type BoqVariationStatus =
  | "Draft"
  | "Submitted"
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Withdrawn";

export type BoqVersionStatus = "Draft" | "Reviewed" | "Approved" | "Superseded";

export interface BoqItem {
  id: string;
  sectionId: string;
  subsectionId?: string | null;
  code: string;
  description: string;
  unit: string;
  quantity?: number | null;
  rate?: number | null;
  amount: number | null;
  status: BoqItemStatus;
  notes?: string;
  lastUpdatedAt: string;
  lastUpdatedBy: string;
}

export interface BoqSubsection {
  id: string;
  sectionId: string;
  code: string;
  title: string;
  itemCount: number;
  subtotal: number;
  items: BoqItem[];
}

export interface BoqSection {
  id: string;
  code: string;
  title: string;
  itemCount: number;
  subtotal: number;
  directItems: BoqItem[];
  subsections: BoqSubsection[];
}

export interface BoqVariation {
  id: string;
  reference: string;
  title: string;
  status: BoqVariationStatus;
  financialImpact: number;
  submittedBy: string;
  submittedAt: string;
  decisionBy?: string;
  decisionAt?: string;
  evidenceReference?: string;
  boqReference?: string;
}

export interface BoqVersion {
  id: string;
  label: string;
  status: BoqVersionStatus;
  total: number;
  createdAt: string;
  createdBy: string;
  note: string;
  isCurrent: boolean;
  isLocked: boolean;
}

export interface BoqRateComponent {
  id: string;
  itemCode: string;
  itemDescription: string;
  material: number;
  labour: number;
  plant: number;
  overhead: number;
  totalRate: number;
}

export interface ProjectBoqSnapshot {
  id: string;
  projectId: string;
  projectName: string;
  projectCode: string;
  status: BoqWorkspaceStatus;
  currentVersionId: string;
  baseTotal: number;
  sectionCount: number;
  workItemCount: number;
  hiddenValidationIssueCount: number;
  sections: BoqSection[];
  variations: BoqVariation[];
  versions: BoqVersion[];
  rateAnalysis: BoqRateComponent[];
  updatedAt: string;
}

export interface UpdateBoqItemInput {
  itemId: string;
  versionId: string;
  quantity?: number | null;
  rate?: number | null;
}

export interface AddBoqItemInput {
  sectionId: string;
  subsectionId?: string | null;
  code: string;
  description: string;
  unit: string;
  quantity?: number | null;
  rate?: number | null;
}
