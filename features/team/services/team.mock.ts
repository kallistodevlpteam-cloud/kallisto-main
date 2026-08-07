import type {
  ProjectAccess,
  TeamWorkspaceData,
  WorkspaceRole,
} from "../types/team.types";
import { buildProjectPermissions } from "../utils/team-permission-rules";

const PROJECTS = [
  { id: "nila-residence", name: "Nila Residence" },
  { id: "arjun-villa", name: "Arjun Villa" },
  { id: "marina-office", name: "Marina Office" },
  { id: "green-courtyard", name: "Green Courtyard" },
  { id: "riverside-courtyard", name: "Riverside Courtyard" },
  { id: "kovalam-retreat", name: "Kovalam Retreat" },
] as const;

function createAccess(
  memberId: string,
  role: WorkspaceRole,
  overrides: Parameters<typeof buildProjectPermissions>[1] = {},
): ProjectAccess {
  return {
    memberId,
    projectId: "nila-residence",
    projectRole: role,
    permissions: buildProjectPermissions(role, overrides),
  };
}

const TEAM_WORKSPACE: TeamWorkspaceData = {
  workspaceName: "Arjun Architects",
  seatCapacity: 20,
  projects: [...PROJECTS],
  members: [
    {
      id: "arjun-nair",
      name: "Arjun Nair",
      email: "arjun@arjunarchitects.in",
      role: "Workspace Owner",
      projectIds: PROJECTS.map((project) => project.id),
      workload: 82,
      lastActive: "Active now",
      status: "active",
      activeNow: true,
    },
    {
      id: "neha-menon",
      name: "Neha Menon",
      email: "neha@arjunarchitects.in",
      role: "Project Manager",
      projectIds: PROJECTS.slice(0, 4).map((project) => project.id),
      workload: 68,
      lastActive: "12 min ago",
      status: "active",
      activeNow: true,
    },
    {
      id: "rahul-krishnan",
      name: "Rahul Krishnan",
      email: "rahul@arjunarchitects.in",
      role: "Architect",
      projectIds: PROJECTS.slice(0, 3).map((project) => project.id),
      workload: 74,
      lastActive: "1 hr ago",
      status: "active",
      activeNow: true,
    },
    {
      id: "meera-thomas",
      name: "Meera Thomas",
      email: "meera@arjunarchitects.in",
      role: "Interior Designer",
      projectIds: PROJECTS.slice(0, 2).map((project) => project.id),
      workload: 45,
      lastActive: "Yesterday",
      status: "active",
      activeNow: true,
    },
    {
      id: "nikhil-raj",
      name: "Nikhil Raj",
      email: "nikhil@arjunarchitects.in",
      role: "Quantity Surveyor",
      projectIds: [PROJECTS[0].id, PROJECTS[2].id, PROJECTS[4].id],
      workload: 61,
      lastActive: "Yesterday",
      status: "active",
      activeNow: false,
    },
    {
      id: "anjali-s",
      name: "Anjali S",
      email: "anjali@arjunarchitects.in",
      role: "Finance",
      projectIds: [PROJECTS[0].id, PROJECTS[1].id],
      workload: 32,
      lastActive: "3 days ago",
      status: "inactive",
      activeNow: false,
    },
    {
      id: "sanjay-kumar",
      name: "Sanjay Kumar",
      email: "sanjay@arjunarchitects.in",
      role: "Admin",
      projectIds: PROJECTS.slice(0, 4).map((project) => project.id),
      workload: 57,
      lastActive: "28 min ago",
      status: "active",
      activeNow: true,
    },
    {
      id: "devika-r",
      name: "Devika R",
      email: "devika@arjunarchitects.in",
      role: "Viewer",
      projectIds: [PROJECTS[0].id],
      workload: 20,
      lastActive: "2 days ago",
      status: "active",
      activeNow: false,
    },
  ],
  invitations: [
    {
      id: "invite-farhan",
      email: "farhan@studio.in",
      role: "Architect",
      invitedAtLabel: "Invited 2 days ago",
      expiresLabel: "Expires in 5 days",
      projectAccess: "selected",
      selectedProjectIds: ["nila-residence"],
    },
    {
      id: "invite-diya",
      email: "diya@studio.in",
      role: "Viewer",
      invitedAtLabel: "Invited yesterday",
      expiresLabel: "Expires in 6 days",
      projectAccess: "none",
      selectedProjectIds: [],
    },
  ],
  roleSummaries: [
    { role: "Workspace Owner", memberCount: 1 },
    { role: "Admin", memberCount: 1 },
    { role: "Project Manager", memberCount: 1 },
    { role: "Contributor", memberCount: 3 },
    { role: "Finance", memberCount: 1 },
    { role: "Viewer", memberCount: 1 },
  ],
  projectAccess: [
    createAccess("arjun-nair", "Workspace Owner"),
    createAccess("neha-menon", "Project Manager", { finance: false }),
    createAccess("rahul-krishnan", "Architect", { edit: true }),
    createAccess("meera-thomas", "Interior Designer", { files: true }),
    createAccess("nikhil-raj", "Quantity Surveyor", { finance: false }),
    createAccess("anjali-s", "Finance", { finance: true }),
    createAccess("sanjay-kumar", "Admin"),
    createAccess("devika-r", "Viewer", { files: false }),
  ],
};

export function getTeamWorkspaceMock(): TeamWorkspaceData {
  return {
    ...TEAM_WORKSPACE,
    projects: TEAM_WORKSPACE.projects.map((project) => ({ ...project })),
    members: TEAM_WORKSPACE.members.map((member) => ({
      ...member,
      projectIds: [...member.projectIds],
    })),
    invitations: TEAM_WORKSPACE.invitations.map((invitation) => ({
      ...invitation,
      selectedProjectIds: [...invitation.selectedProjectIds],
    })),
    roleSummaries: TEAM_WORKSPACE.roleSummaries.map((summary) => ({ ...summary })),
    projectAccess: TEAM_WORKSPACE.projectAccess.map((access) => ({
      ...access,
      permissions: Object.fromEntries(
        Object.entries(access.permissions).map(([key, grant]) => [
          key,
          { ...grant },
        ]),
      ) as ProjectAccess["permissions"],
    })),
  };
}
