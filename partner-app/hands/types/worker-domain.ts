export type WorkerTrade =
  | "Mason"
  | "Helper"
  | "Carpenter"
  | "Electrician"
  | "Plumber"
  | "Painter"
  | "Steel Fixer"
  | "Tile Worker"
  | "Welder"
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
  imageUrl?: string;
}

export interface WorkerVerificationDetails {
  identityVerified: boolean;
  phoneVerified: boolean;
  tradeCertified: boolean;
  kycDocumentType?: string;
  verifiedAt?: string;
}

export interface WorkerBankDetails {
  accountHolderName: string;
  bankName: string;
  accountNumberMasked: string;
  ifscCode: string;
  branchName: string;
  upiId?: string;
  verificationStatus: "Verified" | "Pending" | "Rejected";
  verifiedAt?: string;
}

export interface WorkerDocumentItem {
  id: string;
  title: string;
  type: "Aadhaar Card" | "Trade Certificate" | "Police Verification" | "Bank Passbook" | "Safety License" | "Other";
  documentNumber?: string;
  issueDate?: string;
  expiryDate?: string;
  status: "Verified" | "Pending Review" | "Expired";
  fileUrl?: string;
}

export interface WorkerAttendanceRecord {
  id: string;
  date: string;
  projectName: string;
  checkInTime: string;
  checkOutTime: string;
  hoursWorked: number;
  overtimeHours: number;
  status: "Present" | "Half-Day" | "Absent" | "On-Leave";
  approvedBy: string;
}

export interface WorkerFinancialTransaction {
  id: string;
  date: string;
  projectName: string;
  description: string;
  amount: number;
  type: "Credit" | "Payout" | "Advance" | "Bonus";
  status: "Paid" | "Pending" | "Processing";
  paymentMethod: "UPI" | "Bank Transfer" | "Cash";
  referenceNo: string;
}

export interface WorkerSkillProficiency {
  skill: string;
  category: string;
  ratingScore: number; // 0-100
  proficiencyLevel: "Master" | "Expert" | "Proficient" | "Basic";
}

export interface WorkerSupervisorReview {
  id: string;
  projectName: string;
  reviewerName: string;
  reviewerRole: string;
  date: string;
  rating: number; // 1-5
  comment: string;
  aspects: {
    punctuality: number;
    quality: number;
    safetyCompliance: number;
    efficiency: number;
  };
}

export interface WorkerDetailExtended {
  totalWorkDaysLogged: number;
  attendanceRatePercentage: number;
  qualityRatingScore: number; // e.g. 4.9 out of 5
  ytdEarnings: number;
  summaryBio: string;
  dateOfBirth?: string;
  permanentAddress?: string;
  bloodGroup?: string;
  maritalStatus?: string;
  nationality?: string;
  religion?: string;
  alternateMobile?: string;
  email?: string;
  currentAddress?: string;
  state?: string;
  pinCode?: string;
  bankDetails: WorkerBankDetails;
  documents: WorkerDocumentItem[];
  attendanceLogs: WorkerAttendanceRecord[];
  financialTransactions: WorkerFinancialTransaction[];
  skillProficiencies: WorkerSkillProficiency[];
  supervisorReviews: WorkerSupervisorReview[];
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
  bloodGroup?: string;
  maritalStatus?: string;
  nationality?: string;
  religion?: string;
  emergencyContact?: string;
  alternateMobile?: string;
  email?: string;
  currentAddress?: string;
  state?: string;
  pinCode?: string;
  secondarySkills?: string[];
  skillLevel?: "Beginner" | "Skilled" | "Highly skilled" | string;
  workRadius?: string;
  languages?: string[];
  idDocumentType?: string;
  idNumber?: string;
  availableFromDate?: string;
  verifiedByContractor?: boolean;
  // Detailed extended profile for Worker Detail Page
  extended?: WorkerDetailExtended;
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

