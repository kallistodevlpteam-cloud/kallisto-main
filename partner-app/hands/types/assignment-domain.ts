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
  };
  crew: AssignedWorkerRecord[];
  coverImage?: string;
}

export interface AssignmentSummaryMetrics {
  activeDeployments: number;
  sitesCovered: number;
  deployedCrew: number;
  shiftCompletion: string;
  attentionCount: number;
  atRiskCount: number;
}
