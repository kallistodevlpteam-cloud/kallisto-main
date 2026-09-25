export type HandsProjectStatus = "active" | "upcoming" | "completed" | "paused";

export type HandsLifecyclePhase =
  | "all"
  | "created"
  | "pre_construction"
  | "construction"
  | "post_construction";

export type HandsSiteStatus = "ON SITE" | "IN TRANSIT" | "OFF SITE" | "COMPLETED";

export type HandsProjectHealth = "on_track" | "at_risk" | "delayed";

export interface HandsProjectCrewMember {
  id: string;
  name: string;
  trade: string;
  level: string;
  status: "Present" | "Absent";
  phone: string;
}

export interface HandsProjectUpdate {
  id: string;
  authorName: string;
  authorRole: string;
  timestamp: string;
  category: string;
  text: string;
  mediaUrls?: string[];
}

export interface HandsProjectRecord {
  id: string;
  slug: string;
  projectName: string;
  clientName: string;
  category: string;
  location: string;
  status: HandsProjectStatus;
  lifecyclePhase?: HandsLifecyclePhase;
  siteStatus: HandsSiteStatus;
  currentDay: number;
  totalDays: number;
  totalWorkersAssigned: number;
  tradesBreakdown: string;
  startDate: string;
  endDate: string;
  attendance: {
    present: number;
    total: number;
    absent: number;
  };
  health: HandsProjectHealth;
  healthMessage: string;
  supervisor: {
    name: string;
    phone: string;
    avatar?: string;
  };
  coverImage: string;
  dailyBillingRate: number;
  totalContractValue: number;
  odinBrief: string;
  crew: HandsProjectCrewMember[];
  recentUpdates?: HandsProjectUpdate[];
}

export interface HandsProjectSummaryMetrics {
  activeProjects: number;
  upcomingProjects: number;
  completedProjects: number;
  overallProgress: string;
}
