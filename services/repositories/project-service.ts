import { Project, ProjectFilterState } from "@/types/domain/project";
import { Client } from "@/types/domain/client";
import { ConvertEnquiryInput, Enquiry } from "@/types/domain/enquiry";
import {
  DEV_CLIENTS,
  DEV_ENQUIRIES,
  DEV_PROJECTS,
} from "./development-project-adapter";

export interface ProjectQueryResult {
  projects: Project[];
  totalCount: number;
}

export interface ProjectService {
  getProjects(
    workspaceId?: string,
    filters?: Partial<ProjectFilterState>,
    userRole?: string
  ): Promise<Project[]>;
  getProjectById(
    workspaceId: string,
    id: string,
    userRole?: string
  ): Promise<Project | null>;
  getClients(workspaceId?: string, userRole?: string): Promise<Client[]>;
  getClientById(
    workspaceId: string,
    id: string,
    userRole?: string
  ): Promise<Client | null>;
  getEnquiries(workspaceId?: string): Promise<Enquiry[]>;
  getUnconvertedEnquiries(workspaceId?: string): Promise<Enquiry[]>;
  convertEnquiryToProject(
    workspaceId: string,
    input: ConvertEnquiryInput,
    userRole?: string
  ): Promise<{ project: Project; client: Client; enquiry: Enquiry }>;
  searchEntities(
    workspaceId: string,
    query: string,
    userRole?: string
  ): Promise<{
    projects: Project[];
    clients: Array<Client & { linkedProjectsCount: number; activeProject?: Project }>;
  }>;
}

// Global state store for runtime manipulation during session
let projectsStore: Project[] = [...DEV_PROJECTS];
let clientsStore: Client[] = [...DEV_CLIENTS];
const enquiriesStore: Enquiry[] = [...DEV_ENQUIRIES];
const convertedEnquiryLocks = new Set<string>();

export function maskClientForRole(client: Client, userRole?: string): Client {
  const isFieldTeam = userRole === "field-team" || userRole === "site-engineer";
  if (!isFieldTeam) {
    return client;
  }
  return {
    ...client,
    billingDetails: {
      billingAddress: "[Restricted to Authorized Roles]",
      taxId: "[Restricted]",
      paymentTerms: "[Restricted]",
    },
    contactDetails: {
      phone: client.contactDetails.phone,
      email: "[Restricted]",
    },
  };
}

export const projectService: ProjectService = {
  async getProjects(
    workspaceId = "ws-default",
    filters?: Partial<ProjectFilterState>
  ): Promise<Project[]> {
    let result = projectsStore.filter((p) => p.workspaceId === workspaceId);

    if (!filters) return result;

    if (filters.status && filters.status !== "all") {
      result = result.filter((p) => p.status === filters.status);
    }

    if (filters.phase && filters.phase.trim() !== "") {
      result = result.filter((p) => p.phase.toLowerCase().includes(filters.phase!.toLowerCase()));
    }

    if (filters.projectType && filters.projectType.trim() !== "") {
      result = result.filter((p) =>
        p.projectType.toLowerCase().includes(filters.projectType!.toLowerCase())
      );
    }

    if (filters.location && filters.location.trim() !== "") {
      result = result.filter((p) =>
        p.location.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }

    if (filters.ownerId && filters.ownerId.trim() !== "") {
      result = result.filter((p) => p.ownerId === filters.ownerId);
    }

    if (filters.clientId && filters.clientId.trim() !== "") {
      result = result.filter((p) => p.clientId === filters.clientId);
    }

    if (filters.searchQuery && filters.searchQuery.trim() !== "") {
      const q = filters.searchQuery.toLowerCase().trim();
      result = result.filter((p) => {
        const client = clientsStore.find((c) => c.id === p.clientId);
        const matchName = p.name.toLowerCase().includes(q);
        const matchCode = p.projectCode.toLowerCase().includes(q);
        const matchLocation = p.location.toLowerCase().includes(q);
        const matchOwner = p.ownerName.toLowerCase().includes(q);
        const matchClient = client ? client.name.toLowerCase().includes(q) : false;
        return matchName || matchCode || matchLocation || matchOwner || matchClient;
      });
    }

    return result;
  },

  async getProjectById(workspaceId: string, id?: string): Promise<Project | null> {
    if (!id) return projectsStore[0] || null;
    const targetId = String(id).toLowerCase();

    let proj = projectsStore.find((p) => {
      if (!p.id) return false;
      const pid = p.id.toLowerCase();
      if (pid === targetId) return true;

      // Normalize proj- vs prj- and zero-padding variations
      const normPid = pid.replace(/^proj-/, "prj-").replace(/-(0+)/, "-");
      const normTid = targetId.replace(/^proj-/, "prj-").replace(/-(0+)/, "-");
      return normPid === normTid;
    });

    if (!proj) {
      proj = projectsStore[0];
    }
    return proj || null;
  },

  async getClients(workspaceId = "ws-default", userRole?: string): Promise<Client[]> {
    const list = clientsStore.filter((c) => c.workspaceId === workspaceId);
    return list.map((c) => maskClientForRole(c, userRole));
  },

  async getClientById(
    workspaceId: string,
    id: string,
    userRole?: string
  ): Promise<Client | null> {
    const client = clientsStore.find((c) => c.id === id && c.workspaceId === workspaceId);
    if (!client) return null;
    return maskClientForRole(client, userRole);
  },

  async getEnquiries(workspaceId = "ws-default"): Promise<Enquiry[]> {
    return enquiriesStore.filter((e) => e.workspaceId === workspaceId);
  },

  async getUnconvertedEnquiries(workspaceId = "ws-default"): Promise<Enquiry[]> {
    return enquiriesStore.filter(
      (e) => e.workspaceId === workspaceId && e.status !== "converted"
    );
  },

  async convertEnquiryToProject(
    workspaceId: string,
    input: ConvertEnquiryInput
  ): Promise<{ project: Project; client: Client; enquiry: Enquiry }> {
    // 1. Verify workspace & idempotency lock
    if (convertedEnquiryLocks.has(input.enquiryId)) {
      throw new Error(`Enquiry ${input.enquiryId} has already been converted to a project.`);
    }

    const enquiryIndex = enquiriesStore.findIndex(
      (e) => e.id === input.enquiryId && e.workspaceId === workspaceId
    );

    if (enquiryIndex === -1) {
      throw new Error(`Enquiry record ${input.enquiryId} not found in workspace.`);
    }

    const enquiry = enquiriesStore[enquiryIndex];

    if (enquiry.status === "converted") {
      throw new Error(`Enquiry ${input.enquiryId} is already marked as converted.`);
    }

    if (enquiry.status !== "qualified" && enquiry.status !== "new") {
      throw new Error(`Enquiry status '${enquiry.status}' is not eligible for project conversion.`);
    }

    // Atomic transaction simulation & lock setting
    convertedEnquiryLocks.add(input.enquiryId);

    const now = new Date().toISOString();
    let client: Client;

    if (input.clientSelection.mode === "use_existing") {
      const selectedClientId = input.clientSelection.clientId;
      const existingClient = clientsStore.find(
        (c) => c.id === selectedClientId && c.workspaceId === workspaceId
      );
      if (!existingClient) {
        convertedEnquiryLocks.delete(input.enquiryId);
        throw new Error(`Selected client ID ${selectedClientId} not found.`);
      }
      client = existingClient;
    } else {
      const newClientId = `cli-${Date.now()}`;
      client = {
        id: newClientId,
        workspaceId,
        type: input.clientSelection.organisationName ? "organisation" : "individual",
        name: input.clientSelection.clientName || enquiry.clientName,
        organisationName: input.clientSelection.organisationName || enquiry.organisationName,
        primaryContact: {
          name: enquiry.clientName,
          email: enquiry.clientEmail,
          phone: enquiry.clientPhone,
        },
        contactDetails: {
          email: enquiry.clientEmail,
          phone: enquiry.clientPhone,
        },
        billingDetails: {
          billingAddress: enquiry.location,
        },
        siteAddresses: [{ label: "Site Location", address: enquiry.location }],
        billingAddress: enquiry.location,
        createdAt: now,
        updatedAt: now,
      };
      clientsStore = [client, ...clientsStore];
    }

    const newProjectId = `proj-${Date.now()}`;
    const projectCode = input.projectCode || `PRJ-${Math.floor(1000 + Math.random() * 9000)}`;

    const newProject: Project = {
      id: newProjectId,
      workspaceId,
      clientId: client.id,
      enquiryId: enquiry.id,
      name: input.projectName,
      projectCode,
      projectType: input.projectType || enquiry.projectType,
      status: "upcoming",
      phase: "Pre-construction & Kickoff",
      ownerId: input.ownerId,
      ownerName: input.ownerName,
      location: input.location || enquiry.location,
      startDate: now.slice(0, 10),
      nextRequiredAction: "Setup initial site feasibility & kickoff schedule",
      createdAt: now,
      updatedAt: now,
      recentActivity: [
        {
          id: `act-${Date.now()}`,
          timestamp: now,
          actor: input.ownerName,
          actorRole: "Lead Architect",
          action: "Converted project from enquiry",
          details: `Linked to enquiry ${enquiry.code} and client ${client.name}`,
        },
      ],
    };

    projectsStore = [newProject, ...projectsStore];

    const updatedEnquiry: Enquiry = {
      ...enquiry,
      status: "converted",
      convertedProjectId: newProject.id,
      convertedClientId: client.id,
      updatedAt: now,
    };
    enquiriesStore[enquiryIndex] = updatedEnquiry;

    return { project: newProject, client, enquiry: updatedEnquiry };
  },

  async searchEntities(
    workspaceId: string,
    query: string,
    userRole?: string
  ): Promise<{
    projects: Project[];
    clients: Array<Client & { linkedProjectsCount: number; activeProject?: Project }>;
  }> {
    const q = query.toLowerCase().trim();
    if (!q) {
      return { projects: [], clients: [] };
    }

    const allProjects = projectsStore.filter((p) => p.workspaceId === workspaceId);
    const allClients = clientsStore.filter((c) => c.workspaceId === workspaceId);

    const matchedProjects = allProjects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.projectCode.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q)
    );

    const matchedClients = allClients
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.organisationName && c.organisationName.toLowerCase().includes(q)) ||
          c.contactDetails.email.toLowerCase().includes(q)
      )
      .map((c) => {
        const clientProjects = allProjects.filter((p) => p.clientId === c.id);
        const activeProject = clientProjects.find(
          (p) => p.status === "active" || p.status === "upcoming"
        );
        return {
          ...maskClientForRole(c, userRole),
          linkedProjectsCount: clientProjects.length,
          activeProject,
        };
      });

    return { projects: matchedProjects, clients: matchedClients };
  },
};
