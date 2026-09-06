export type WorkerTrade =
  | "Mason"
  | "Helper"
  | "Carpenter"
  | "Electrician"
  | "Plumber"
  | "Painter"
  | "Steel Fixer"
  | "Tile Worker"
  | "Other";

export type WorkerAvailability = "Available" | "Assigned" | "Unavailable";

export type WorkerVerification = "Verified" | "Pending";

export interface WorkerCurrentAssignment {
  projectId: string;
  projectName: string;
  role: string;
  startDate: string;
  endDate?: string;
  location?: string;
}

export interface WorkerWorkHistoryItem {
  id: string;
  projectName: string;
  role: string;
  dateRange: string;
  location: string;
}

export interface WorkerVerificationDetails {
  identityVerified: boolean;
  phoneVerified: boolean;
  tradeCertified: boolean;
  kycDocumentType?: string;
  verifiedAt?: string;
}

export interface WorkerProfile {
  id: string;
  name: string;
  avatarUrl?: string;
  trade: WorkerTrade;
  experienceYears: number;
  availability: WorkerAvailability;
  currentAssignment?: WorkerCurrentAssignment | null;
  verificationStatus: WorkerVerification;
  phone: string;
  location: string;
  skills: string[];
  level?: "Master" | "Lead" | "Senior" | "Skilled" | "Semi-Skilled" | "Helper" | string;
  verificationDetails: WorkerVerificationDetails;
  recentWork: WorkerWorkHistoryItem[];
  dailyRate?: number;
  notes?: string;
  needsAttentionReason?: string;
  // 3-step registration metadata
  age?: number;
  gender?: string;
  emergencyContact?: string;
  secondarySkills?: string[];
  skillLevel?: "Beginner" | "Skilled" | "Highly skilled" | string;
  workRadius?: string;
  languages?: string[];
  idDocumentType?: string;
  idNumber?: string;
  availableFromDate?: string;
  verifiedByContractor?: boolean;
}

export interface WorkforceSummaryMetrics {
  totalWorkers: number;
  onAssignment: number;
  availableToday: number;
  needsAttention: number;
}

export interface LabourRequestMatch {
  requestId: string;
  projectName: string;
  trade: WorkerTrade;
  requiredWorkers: number;
  assignedWorkers: number;
  location: string;
  startDate: string;
  duration: string;
  urgency: "urgent" | "normal";
  matchingSkills: string[];
}
