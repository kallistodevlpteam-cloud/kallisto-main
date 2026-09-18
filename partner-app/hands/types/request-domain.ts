import { WorkerTrade } from "./worker-domain";

export type LabourRequestStatus = "new" | "reviewing" | "accepted" | "closed" | "rejected";

export type HandsRequestTabType = "requests" | "history";

export type WorkforceMatchState = "full" | "partial" | "none";

export interface TradeRequirement {
  trade: WorkerTrade;
  requiredCount: number;
  availableCount: number;
  matchingWorkerIds: string[];
}

export type RequestTaskStatus = "pending" | "scheduled" | "in-progress" | "pending-review" | "completed";

export interface RequestTaskItem {
  id: string;
  title: string;
  description?: string;
  category?: string;
  trade?: WorkerTrade | string;
  workersCount?: number;
  period?: string; // e.g. "Sep 05 – Sep 12 (Week 1)"
  status?: RequestTaskStatus | string;
  estimatedHours?: string; // e.g. "120h"
  priority?: "High" | "Medium" | "Low" | string;
}

export interface LabourRequest {
  id: string; // e.g. KH-R-1024
  projectName: string;
  clientName: string;
  location: string;
  locationDetails?: {
    address: string;
    coordinates?: string;
    landmark?: string;
  };
  requirements: TradeRequirement[];
  startDate: string; // e.g. "Sep 05, 2026"
  estimatedDuration: string; // e.g. "30 Days"
  endDate?: string; // e.g. "Oct 05, 2026"
  workingHours: string; // e.g. "8:00 AM – 5:00 PM"
  urgency: "urgent" | "normal" | "scheduled";
  status: LabourRequestStatus;
  createdAt: string; // e.g. "2h ago"
  notes?: string;
  scopeOfWork?: string[];
  tasks?: RequestTaskItem[];
  assignedWorkerIds?: string[];
  contactPerson?: {
    name: string;
    phone: string;
    role: string;
  };
}

export interface RequestMatchSummary {
  matchState: WorkforceMatchState;
  totalRequired: number;
  totalAvailable: number;
  shortages: { trade: WorkerTrade; shortBy: number }[];
  matchPercentage: number;
}

export interface RequestSummaryMetrics {
  newRequests: number;
  workersNeeded: number;
  canFulfil: number;
  needAttention: number;
}
