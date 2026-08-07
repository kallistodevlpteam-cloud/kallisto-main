export interface ProjectHeaderTeamMember {
  id: string;
  name: string;
  initials: string;
}

export interface ProjectHeaderMilestone {
  title: string;
  supportingText: string;
}

export interface ProjectHeaderManager {
  name: string;
  avatarUrl?: string;
}

export interface ProjectNavigationItem {
  key: string;
  label: string;
}
