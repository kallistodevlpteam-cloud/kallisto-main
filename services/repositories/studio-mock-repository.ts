import {
  StudioAuditEvent,
  StudioComment,
  StudioOutputVersion,
  StudioProjectOption,
  StudioTask,
  StudioUseCaseDefinition,
} from "@/types/domain/studio";
import { IStudioRepository } from "./studio-repository";

const MOCK_PROJECTS: StudioProjectOption[] = [
  {
    id: "proj-res-001",
    workspaceId: "ws-kallisto-01",
    code: "KAL-RES-2026-01",
    name: "Luxury Villa Horizon - Living Space & Terrace",
    projectType: "Residential Architecture",
    phase: "Design Development",
    location: "Banjara Hills, Hyderabad",
    status: "active",
    lastActivityAt: "2026-07-22T10:00:00Z",
  },
  {
    id: "proj-apt-002",
    workspaceId: "ws-kallisto-01",
    code: "KAL-APT-2026-04",
    name: "Sereno Heights Penthouse Interior Refurbishment",
    projectType: "Interior Design",
    phase: "BOQ & Estimation",
    location: "Jubilee Hills, Hyderabad",
    status: "active",
    lastActivityAt: "2026-07-21T16:30:00Z",
  },
  {
    id: "proj-com-003",
    workspaceId: "ws-kallisto-01",
    code: "KAL-COM-2026-09",
    name: "Apex Tech Park - Corporate Lobby & Amenities",
    projectType: "Commercial Interior",
    phase: "Pre-construction",
    location: "HITEC City, Hyderabad",
    status: "upcoming",
    lastActivityAt: "2026-07-20T11:15:00Z",
  },
  {
    id: "proj-rec-004",
    workspaceId: "ws-kallisto-01",
    code: "KAL-REC-2026-12",
    name: "Greenwood Eco Resort Pavilion & Clubhouse",
    projectType: "Hospitality Design",
    phase: "Feasibility & Concept",
    location: "Gachibowli, Hyderabad",
    status: "active",
    lastActivityAt: "2026-07-19T14:20:00Z",
  },
];

const USE_CASE_DEFINITIONS: StudioUseCaseDefinition[] = [
  // BOQ
  {
    id: "create_detailed_boq",
    workspaceType: "boq",
    label: "Create Detailed BOQ",
    description: "Itemized Bill of Quantities with trade-wise material and labour breakdown",
    availableStartMethods: ["scratch", "template", "import", "duplicate", "draft"],
    requiredPermissions: ["create", "view_financial_data"],
  },
  {
    id: "create_package_boq",
    workspaceType: "boq",
    label: "Create Package-wise BOQ",
    description: "Package-level commercial BOQ structured by trade package",
    availableStartMethods: ["scratch", "template", "duplicate", "draft"],
    requiredPermissions: ["create", "view_financial_data"],
  },
  {
    id: "create_rate_analysis",
    workspaceType: "boq",
    label: "Create Rate Analysis",
    description: "Unit rate breakdowns comparing material, labour, plant and overhead costs",
    availableStartMethods: ["scratch", "template", "import", "draft"],
    requiredPermissions: ["create", "view_financial_data"],
  },
  {
    id: "import_existing_boq",
    workspaceType: "boq",
    label: "Import Existing BOQ",
    description: "Import and map an existing Excel or CSV spreadsheet into Kallisto BOQ engine",
    availableStartMethods: ["import"],
    requiredPermissions: ["create", "view_financial_data"],
  },
  {
    id: "create_variation_estimate",
    workspaceType: "boq",
    label: "Create Variation Estimate",
    description: "Assess scope variation financial impacts against approved revised contract totals",
    availableStartMethods: ["scratch", "duplicate", "draft"],
    requiredPermissions: ["create", "view_financial_data"],
  },
  {
    id: "review_existing_boq",
    workspaceType: "boq",
    label: "Review an Existing BOQ",
    description: "Audit missing rates, quantities and duplicate line items on an active BOQ",
    availableStartMethods: ["draft"],
    requiredPermissions: ["review", "view_financial_data"],
  },

  // ESTIMATE
  {
    id: "quick_project_cost",
    workspaceType: "estimate",
    label: "Quick Project Cost",
    description: "Rapid cost-per-sq-ft estimate based on quality tier and location",
    availableStartMethods: ["scratch", "template"],
    requiredPermissions: ["create", "view_financial_data"],
  },
  {
    id: "preliminary_estimate",
    workspaceType: "estimate",
    label: "Preliminary Estimate",
    description: "Concept-stage budget allocation across major construction packages",
    availableStartMethods: ["scratch", "template", "duplicate", "draft"],
    requiredPermissions: ["create", "view_financial_data"],
  },
  {
    id: "detailed_estimate",
    workspaceType: "estimate",
    label: "Detailed Estimate",
    description: "Comprehensive budget plan with quality tier adjustments and tax calculations",
    availableStartMethods: ["scratch", "template", "import", "duplicate", "draft"],
    requiredPermissions: ["create", "view_financial_data"],
  },
  {
    id: "package_estimate",
    workspaceType: "estimate",
    label: "Package-wise Estimate",
    description: "Trade-package budget allocation and subcontractor target planning",
    availableStartMethods: ["scratch", "template", "draft"],
    requiredPermissions: ["create", "view_financial_data"],
  },
  {
    id: "phase_budget",
    workspaceType: "estimate",
    label: "Phase-wise Budget",
    description: "Cashflow requirement schedule mapped across project delivery phases",
    availableStartMethods: ["scratch", "template", "draft"],
    requiredPermissions: ["create", "view_financial_data"],
  },
  {
    id: "compare_cost_scenarios",
    workspaceType: "estimate",
    label: "Compare Cost Scenarios",
    description: "Value-engineering scenario matrix comparing standard, premium and luxury specs",
    availableStartMethods: ["template", "duplicate"],
    requiredPermissions: ["create", "view_financial_data"],
  },

  // VISUALISATION
  {
    id: "interior_vis",
    workspaceType: "visualisation",
    label: "Interior Visualisation",
    description: "Photorealistic interior rendering, lighting study and material representation",
    availableStartMethods: ["scratch", "template", "import", "duplicate", "draft"],
    requiredPermissions: ["create"],
  },
  {
    id: "exterior_vis",
    workspaceType: "visualisation",
    label: "Exterior Visualisation",
    description: "Exterior façade concept views, day/night lighting and landscape renders",
    availableStartMethods: ["scratch", "template", "import", "duplicate", "draft"],
    requiredPermissions: ["create"],
  },
  {
    id: "material_color_options",
    workspaceType: "visualisation",
    label: "Material or Colour Options",
    description: "Side-by-side material alternative studies and colour finish palettes",
    availableStartMethods: ["template", "import", "draft"],
    requiredPermissions: ["create"],
  },
  {
    id: "mood_board",
    workspaceType: "visualisation",
    label: "Mood Board",
    description: "Curated material boards, texture samples and aesthetic concept boards",
    availableStartMethods: ["scratch", "template", "import", "draft"],
    requiredPermissions: ["create"],
  },
  {
    id: "enhance_existing_image",
    workspaceType: "visualisation",
    label: "Enhance an Existing Image",
    description: "AI-assisted enhancement of architectural sketches or photos",
    availableStartMethods: ["import"],
    requiredPermissions: ["create"],
  },
  {
    id: "presentation_views",
    workspaceType: "visualisation",
    label: "Presentation Views",
    description: "Client-ready presentation renders formatted for pitch decks and boards",
    availableStartMethods: ["scratch", "template", "duplicate", "draft"],
    requiredPermissions: ["create"],
  },

  // PROPOSAL
  {
    id: "project_proposal",
    workspaceType: "proposal",
    label: "Project Proposal",
    description: "Complete practice proposal with scope, team profile and deliverable schedules",
    availableStartMethods: ["scratch", "template", "import", "duplicate", "draft"],
    requiredPermissions: ["create"],
  },
  {
    id: "fee_proposal",
    workspaceType: "proposal",
    label: "Fee Proposal",
    description: "Architectural fee schedule, scope boundaries and payment milestones",
    availableStartMethods: ["scratch", "template", "duplicate", "draft"],
    requiredPermissions: ["create"],
  },
  {
    id: "scope_of_work",
    workspaceType: "proposal",
    label: "Scope of Work",
    description: "Detailed deliverable list, exclusions and client responsibility assumptions",
    availableStartMethods: ["scratch", "template", "draft"],
    requiredPermissions: ["create"],
  },
  {
    id: "client_presentation",
    workspaceType: "proposal",
    label: "Client Presentation",
    description: "Executive presentation deck for client milestone review meetings",
    availableStartMethods: ["scratch", "template", "duplicate", "draft"],
    requiredPermissions: ["create"],
  },
  {
    id: "design_presentation",
    workspaceType: "proposal",
    label: "Design Presentation",
    description: "Design narrative presentation highlighting concepts and material specs",
    availableStartMethods: ["scratch", "template", "duplicate", "draft"],
    requiredPermissions: ["create"],
  },
  {
    id: "progress_presentation",
    workspaceType: "proposal",
    label: "Progress Presentation",
    description: "Construction progress deck comparing site progress against milestone schedule",
    availableStartMethods: ["scratch", "template", "import", "draft"],
    requiredPermissions: ["create"],
  },

  // SPECIFICATION & REPORT
  {
    id: "material_spec",
    workspaceType: "specification_report",
    label: "Material Specification",
    description: "Technical material specifications, approved-makes list and finish schedules",
    availableStartMethods: ["scratch", "template", "import", "duplicate", "draft"],
    requiredPermissions: ["create"],
  },
  {
    id: "workmanship_spec",
    workspaceType: "specification_report",
    label: "Workmanship Specification",
    description: "Trade execution guidelines, installation standards and quality tolerances",
    availableStartMethods: ["scratch", "template", "draft"],
    requiredPermissions: ["create"],
  },
  {
    id: "site_visit_report",
    workspaceType: "specification_report",
    label: "Site Visit Report",
    description: "Site observation report with captioned photographs and issue assignments",
    availableStartMethods: ["template", "import", "draft"],
    requiredPermissions: ["create"],
  },
  {
    id: "weekly_progress_report",
    workspaceType: "specification_report",
    label: "Weekly Progress Report",
    description: "Weekly construction progress report tracking safety, quality and milestone completion",
    availableStartMethods: ["template", "import", "duplicate", "draft"],
    requiredPermissions: ["create"],
  },
  {
    id: "feasibility_report",
    workspaceType: "specification_report",
    label: "Feasibility Report",
    description: "Site constraint, zoning, budget and physical feasibility assessment report",
    availableStartMethods: ["scratch", "template", "draft"],
    requiredPermissions: ["create"],
  },
  {
    id: "project_status_report",
    workspaceType: "specification_report",
    label: "Project Status Report",
    description: "Executive multi-dimensional status update for project stakeholders",
    availableStartMethods: ["template", "duplicate", "draft"],
    requiredPermissions: ["create"],
  },
];

export class StudioMockRepository implements IStudioRepository {
  private tasks: Map<string, StudioTask> = new Map();
  private versions: Map<string, StudioOutputVersion> = new Map();
  private auditEvents: Map<string, StudioAuditEvent[]> = new Map();
  private comments: Map<string, StudioComment[]> = new Map();

  async getProjects(): Promise<StudioProjectOption[]> {
    return [...MOCK_PROJECTS];
  }

  async getTasks(): Promise<StudioTask[]> {
    return Array.from(this.tasks.values());
  }

  async getAvailableProjects(query?: string): Promise<StudioProjectOption[]> {
    if (!query || query.trim() === "") {
      return [...MOCK_PROJECTS];
    }
    const q = query.toLowerCase().trim();
    return MOCK_PROJECTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.projectType.toLowerCase().includes(q) ||
        (p.location && p.location.toLowerCase().includes(q))
    );
  }

  async getProjectById(projectId: string): Promise<StudioProjectOption | null> {
    const proj = MOCK_PROJECTS.find((p) => p.id === projectId);
    return proj || null;
  }

  getUseCaseDefinitions(): StudioUseCaseDefinition[] {
    return [...USE_CASE_DEFINITIONS];
  }

  getUseCaseDefinition(useCaseId: string): StudioUseCaseDefinition | undefined {
    return USE_CASE_DEFINITIONS.find((def) => def.id === useCaseId);
  }

  async getTaskById(taskId: string): Promise<StudioTask | null> {
    const task = this.tasks.get(taskId);
    return task || null;
  }

  async getTaskVersion(versionId: string): Promise<StudioOutputVersion | null> {
    const ver = this.versions.get(versionId);
    return ver || null;
  }

  async getLatestTaskVersion(taskId: string): Promise<StudioOutputVersion | null> {
    const taskVers = Array.from(this.versions.values())
      .filter((v) => v.taskId === taskId)
      .sort((a, b) => b.versionNumber - a.versionNumber);
    return taskVers[0] || null;
  }

  async getAllTaskVersions(taskId: string): Promise<StudioOutputVersion[]> {
    return Array.from(this.versions.values())
      .filter((v) => v.taskId === taskId)
      .sort((a, b) => a.versionNumber - b.versionNumber);
  }

  async saveTask(task: StudioTask, version: StudioOutputVersion): Promise<void> {
    this.tasks.set(task.id, { ...task });
    this.versions.set(version.id, { ...version });
  }

  async updateTask(task: StudioTask): Promise<void> {
    this.tasks.set(task.id, { ...task });
  }

  async saveVersion(version: StudioOutputVersion): Promise<void> {
    this.versions.set(version.id, { ...version });
  }

  async getAuditEvents(taskId: string): Promise<StudioAuditEvent[]> {
    return this.auditEvents.get(taskId) || [];
  }

  async addAuditEvent(event: StudioAuditEvent): Promise<void> {
    const list = this.auditEvents.get(event.taskId) || [];
    list.push({ ...event });
    this.auditEvents.set(event.taskId, list);
  }

  async getComments(taskId: string): Promise<StudioComment[]> {
    return this.comments.get(taskId) || [];
  }

  async addComment(comment: StudioComment): Promise<void> {
    const list = this.comments.get(comment.taskId) || [];
    list.push({ ...comment });
    this.comments.set(comment.taskId, list);
  }
}
