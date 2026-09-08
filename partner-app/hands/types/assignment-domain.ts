export type AssignmentStatus = "active" | "scheduled" | "completed" | "paused";

export type AssignmentHealth = "on_track" | "attention_required" | "at_risk";

export interface AssignedWorkerRecord {
  id: string;
  name: string;
  trade: string;
  level: string;
  status: "Present" | "Absent" | "Unmarked";
  checkInTime?: string;
  phone: string;
  avatar?: string;
}

export interface AssignmentCompletionResult {
  completedDate: string;
  outcome: string;
  qualityScore: string;
  settlementStatus: string;
  totalShiftsDelivered: number;
  handoverCertificateId: string;
  clientSignOffBy: string;
  snagsResolved: string;
  summaryText: string;
}

export interface AssignmentSiteUpdateReply {
  id: string;
  authorName: string;
  authorRole: string;
  authorAvatar?: string;
  timestamp: string;
  text: string;
  acknowledged?: boolean;
}

export interface AssignmentSiteUpdate {
  id: string;
  authorName: string;
  authorRole: string;
  authorAvatar?: string;
  timestamp: string;
  text: string;
  category:
    | "Site Progress"
    | "Crew Deployment"
    | "Daily Briefing"
    | "Safety & Compliance"
    | "Task Handover"
    | "Milestone Update"
    | "Material Check";
  mediaUrls?: string[];
  acknowledged?: boolean;
  replies?: AssignmentSiteUpdateReply[];
}

export type ComplaintSeverity = "high" | "medium" | "low";
export type ComplaintStatus = "open" | "in_review" | "resolved";

export interface ComplaintNote {
  id: string;
  author: string;
  authorRole: string;
  timestamp: string;
  text: string;
}

export interface AssignmentComplaint {
  id: string;
  title: string;
  description: string;
  category: "Material Shortage" | "Safety Hazard" | "Access Delay" | "Site Condition" | "Workforce Dispute";
  severity: ComplaintSeverity;
  status: ComplaintStatus;
  raisedBy: string;
  raisedByRole: string;
  raisedAt: string;
  resolutionNotes?: string;
  resolvedAt?: string;
  notes?: ComplaintNote[];
}

export interface TradeWageRate {
  trade: string;
  workersCount: number;
  ratePerDay: number;
  totalPerDay: number;
}

export type TransactionParty = "contractor" | "site_supervisor";
export type TransactionType =
  | "client_settlement"
  | "supervisor_allowance"
  | "petty_cash_advance"
  | "expense_reimbursement";
export type TransactionStatus = "settled" | "paid" | "processing" | "pending" | "pending_verification";

export interface AssignmentTransaction {
  id: string;
  date: string;
  referenceNo: string;
  paidBy: string;
  paidByRole?: string;
  paidTo?: string;
  title: string;
  description: string;
  amount: number;
  paymentMethod: string;
  status: TransactionStatus;
  invoiceRef?: string;
  party?: TransactionParty;
  counterpartyName?: string;
  counterpartyRole?: "Contractor" | "Site Supervisor";
  type?: TransactionType;
  direction?: "inflow" | "outflow";
  projectName?: string;
  assignmentId?: string;
  clientName?: string;
}

export interface AssignmentAccounts {
  totalContractValue: number;
  dailyBillingRate: number;
  shiftsDelivered: number;
  totalShiftsContracted: number;
  paidAmount: number;
  pendingAmount: number;
  settlementStatus: "On Track - Weekly Cycle" | "Pending Verification" | "100% Settled";
  tradeRates: TradeWageRate[];
  invoiceNumber: string;
  nextDisbursementDate: string;
  transactions?: AssignmentTransaction[];
  supervisorPettyBalance?: number;
}

export interface AssignmentDeployment {
  id: string;
  projectName: string;
  clientName: string;
  location: string;
  status: AssignmentStatus;
  currentDay: number;
  totalDays: number;
  totalWorkersAssigned: number;
  tradesBreakdown: string;
  startDate: string;
  endDate: string;
  siteStatus: "ON SITE" | "IN TRANSIT" | "OFF SITE" | "COMPLETED";
  attendance: {
    present: number;
    total: number;
    unmarked: number;
    absent: number;
  };
  health: AssignmentHealth;
  healthMessage: string;
  supervisor: {
    name: string;
    phone: string;
    avatar?: string;
  };
  crew: AssignedWorkerRecord[];
  coverImage?: string;
  completionResult?: AssignmentCompletionResult;
  updates?: AssignmentSiteUpdate[];
  complaints?: AssignmentComplaint[];
  accounts?: AssignmentAccounts;
  odinBrief?: string;
  activities?: AssignmentActivity[];
}

export type ActivityStatus = "scheduled" | "in_progress" | "completed" | "delayed";

export type ActivityCategory =
  | "Block Masonry"
  | "Scaffolding & Staging"
  | "Safety & Inspection"
  | "Concrete & Formwork"
  | "Material & Logistics"
  | "Curing & Finishing";

export interface AssignmentActivity {
  id: string;
  assignmentId: string;
  title: string;
  description: string;
  date: string; // "YYYY-MM-DD" e.g. "2026-09-08"
  startTime?: string;
  endTime?: string;
  shiftWindow: string; // e.g. "08:00 AM – 05:00 PM"
  category: ActivityCategory;
  location: string; // e.g. "Level 2 - South Elevation"
  assignedCrewText: string; // e.g. "8 Masons · 2 Helpers"
  assignedSupervisor?: string;
  status: ActivityStatus;
  priority?: "normal" | "high" | "urgent";
  notes?: string;
  createdAt: string;
}

export interface AssignmentSummaryMetrics {
  activeDeployments: number;
  sitesCovered: number;
  deployedCrew: number;
  shiftCompletion: string;
  attentionCount: number;
  atRiskCount: number;
}

export type LaborPaymentStatus = "paid" | "processing" | "due";

export interface LaborWageRecord {
  id: string;
  workerId: string;
  workerName: string;
  trade: string;
  level?: string;
  assignmentId: string;
  projectName: string;
  contractorName: string;
  shiftsWorked: number;
  dailyRate: number;
  totalWage: number;
  status: LaborPaymentStatus;
  paymentMethod: string;
  referenceNo: string;
  payoutDate: string;
  avatar?: string;
}
