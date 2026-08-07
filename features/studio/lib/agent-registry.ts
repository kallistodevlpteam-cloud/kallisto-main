import { StudioAgentType, StudioWorkspaceType } from "@/types/domain/studio";
import { StudioIntent, StudioSourceType } from "../types/studio-source";

export interface StudioAgentConfig {
  id: StudioAgentType | "auto";
  name: string;
  oneLineCapability: string;
  category: string;
  supportedIntents: StudioIntent[];
  supportedWorkspaceTypes: StudioWorkspaceType[];
  supportedSourceTypes: StudioSourceType[];
  availability: "Ready" | "Beta" | "Processing" | "Coming soon";
  avatarBg: string;
}

export const STUDIO_AGENT_REGISTRY: Record<StudioAgentType | "auto", StudioAgentConfig> = {
  auto: {
    id: "auto",
    name: "Auto Agent",
    oneLineCapability: "Intelligent agent router based on project context & prompt",
    category: "Specialist Router",
    supportedIntents: ["create", "analyse", "review", "resolve"],
    supportedWorkspaceTypes: ["boq", "estimate", "visualisation", "proposal", "specification_report"],
    supportedSourceTypes: ["drawing", "document", "image", "note", "boq", "estimate", "project_file"],
    availability: "Ready",
    avatarBg: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
  },
  boq_builder: {
    id: "boq_builder",
    name: "BOQ Builder Agent",
    oneLineCapability: "Drawings to structured BOQs",
    category: "Cost & Estimation",
    supportedIntents: ["create", "analyse"],
    supportedWorkspaceTypes: ["boq"],
    supportedSourceTypes: ["drawing", "document", "boq"],
    availability: "Ready",
    avatarBg: "linear-gradient(135deg, #059669 0%, #047857 100%)",
  },
  project_estimate: {
    id: "project_estimate",
    name: "Project Estimate Agent",
    oneLineCapability: "Early & detailed cost models",
    category: "Cost & Estimation",
    supportedIntents: ["create", "review"],
    supportedWorkspaceTypes: ["estimate"],
    supportedSourceTypes: ["document", "estimate", "drawing"],
    availability: "Ready",
    avatarBg: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
  },
  specification_report: {
    id: "specification_report",
    name: "Specification & Report Agent",
    oneLineCapability: "Specifications & field reports",
    category: "Documentation",
    supportedIntents: ["create", "analyse", "review", "resolve"],
    supportedWorkspaceTypes: ["specification_report"],
    supportedSourceTypes: ["document", "note", "image"],
    availability: "Ready",
    avatarBg: "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)",
  },
  visualisation: {
    id: "visualisation",
    name: "Visualisation Agent",
    oneLineCapability: "Interior & exterior visual renders",
    category: "Design & Render",
    supportedIntents: ["create"],
    supportedWorkspaceTypes: ["visualisation"],
    supportedSourceTypes: ["image", "drawing"],
    availability: "Beta",
    avatarBg: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
  },
  proposal: {
    id: "proposal",
    name: "Proposal Agent",
    oneLineCapability: "Client proposals & pitch decks",
    category: "Commercial",
    supportedIntents: ["create", "review"],
    supportedWorkspaceTypes: ["proposal"],
    supportedSourceTypes: ["document", "note", "boq", "estimate"],
    availability: "Ready",
    avatarBg: "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)",
  },
  site_report: {
    id: "site_report",
    name: "Site Report Agent",
    oneLineCapability: "Site notes to inspection logs",
    category: "Site & Construction",
    supportedIntents: ["analyse", "review", "resolve"],
    supportedWorkspaceTypes: ["specification_report"],
    supportedSourceTypes: ["note", "image", "document"],
    availability: "Processing",
    avatarBg: "linear-gradient(135deg, #4338ca 0%, #3730a3 100%)",
  },
};
