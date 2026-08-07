export const WORKSPACE_CONFIG = {
  brandName: "Kallisto",
  currentWorkspaceName: "Arjun Architects",
  workspaceType: "Virtual Office",
  navigationLabel: "Hive Studio",
  studioRoute: "/studio",
  currency: "INR",
} as const;

export interface BreadcrumbMeta {
  parent: string;
  current: string;
}

export const ROUTE_BREADCRUMBS: Record<string, BreadcrumbMeta> = {
  "/": { parent: WORKSPACE_CONFIG.workspaceType, current: "Home" },
  "/home": { parent: WORKSPACE_CONFIG.workspaceType, current: "Home" },
  "/studio": { parent: WORKSPACE_CONFIG.workspaceType, current: WORKSPACE_CONFIG.navigationLabel },
  "/studio/boq": { parent: WORKSPACE_CONFIG.navigationLabel, current: "BOQ Engine" },
  "/studio/ai-plans": { parent: WORKSPACE_CONFIG.navigationLabel, current: "AI Plans" },
  "/studio/proposals": { parent: WORKSPACE_CONFIG.navigationLabel, current: "Proposals" },
  "/virtual-office": { parent: WORKSPACE_CONFIG.workspaceType, current: WORKSPACE_CONFIG.navigationLabel },
  "/enquiries": { parent: WORKSPACE_CONFIG.workspaceType, current: "Enquiries" },
  "/projects": { parent: WORKSPACE_CONFIG.workspaceType, current: "Projects" },
  "/team": { parent: WORKSPACE_CONFIG.workspaceType, current: "Team" },
  "/clients": { parent: WORKSPACE_CONFIG.workspaceType, current: "Clients" },
  "/public-profile": { parent: WORKSPACE_CONFIG.workspaceType, current: "Public Profile" },
  "/portfolio": { parent: WORKSPACE_CONFIG.workspaceType, current: "Portfolio" },
  "/documents": { parent: WORKSPACE_CONFIG.workspaceType, current: "Documents" },
  "/calendar": { parent: WORKSPACE_CONFIG.workspaceType, current: "Calendar" },
  "/payments": { parent: WORKSPACE_CONFIG.workspaceType, current: "Payments" },
  "/analytics": { parent: WORKSPACE_CONFIG.workspaceType, current: "Analytics" },
  "/hub": { parent: WORKSPACE_CONFIG.workspaceType, current: "Hub" },
  "/hands": { parent: WORKSPACE_CONFIG.workspaceType, current: "Hands" },
  "/basics": { parent: WORKSPACE_CONFIG.workspaceType, current: "Basics" },
  "/basics/experts": { parent: "Basics", current: "Find Experts" },
  "/basics/requirements": { parent: "Basics", current: "Requirements" },
  "/basics/proposals": { parent: "Basics", current: "Proposals" },
  "/basics/engagements": { parent: "Basics", current: "Engagements" },
  "/tools": { parent: WORKSPACE_CONFIG.workspaceType, current: "More Tools" },
};
