export type ProjectStatus =
  | "upcoming"
  | "active"
  | "on_hold"
  | "completed"
  | "cancelled"
  | "archived";

export interface ProjectActivityItem {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: string;
  action: string;
  details?: string;
}

export interface ProjectMilestoneItem {
  id: string;
  title: string;
  dueDate: string;
  status: "pending" | "approved" | "completed" | "overdue";
  phase: string;
}

export interface ProjectTeamMember {
  id: string;
  name: string;
  initials: string;
}

export interface Project {
  id: string;
  workspaceId: string;
  clientId: string;
  enquiryId?: string;
  name: string;
  projectCode: string;
  projectType: string;
  status: ProjectStatus;
  phase: string;
  ownerId: string;
  ownerName: string;
  location: string;
  category?: string;
  description?: string;
  budget?: string;
  startDate?: string;
  targetCompletionDate?: string;
  nextRequiredAction: string;
  upcomingDeadline?: string;
  paymentStatus?: string;
  coverImageUrl?: string;
  thumbnailImageUrl?: string;
  progressPercent?: number;
  managerAvatarUrl?: string;
  teamMembers?: ProjectTeamMember[];
  teamAdditionalCount?: number;
  recentActivity?: ProjectActivityItem[];
  milestones?: ProjectMilestoneItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectFilterState {
  status: ProjectStatus | "all";
  phase?: string;
  projectType?: string;
  location?: string;
  ownerId?: string;
  clientId?: string;
  searchQuery?: string;
  dateRange?: { start?: string; end?: string };
}
