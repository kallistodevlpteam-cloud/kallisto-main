import { StudioIntent } from "../types/studio-source";
import { StudioWorkspaceType } from "@/types/domain/studio";

export interface StudioIntentConfig {
  id: StudioIntent;
  title: string;
  description: string;
  placeholder: string;
  suggestedPrompts: string[];
  accentColor: "purple" | "blue" | "green" | "orange";
  defaultWorkspaceType: StudioWorkspaceType;
}

export const STUDIO_INTENTS: Record<StudioIntent, StudioIntentConfig> = {
  create: {
    id: "create",
    title: "Create an output",
    description: "Generate BOQs, estimates, proposals, visualisations and reports.",
    placeholder: "Describe what you want Hive Studio to create (e.g. Prepare BOQ from floor plans)...",
    suggestedPrompts: [
      "Prepare BOQ from floor plans",
      "Create preliminary project estimate",
      "Draft a client presentation",
      "Generate material specifications",
    ],
    accentColor: "purple",
    defaultWorkspaceType: "boq",
  },
  analyse: {
    id: "analyse",
    title: "Analyse drawings",
    description: "Extract quantities, review drawings and detect missing information.",
    placeholder: "Describe the drawing or document analysis task for Hive Studio...",
    suggestedPrompts: [
      "Extract quantities from drawings",
      "Review floor plans for missing details",
      "Compare architectural and structural drawings",
      "Identify incomplete drawing information",
    ],
    accentColor: "blue",
    defaultWorkspaceType: "boq",
  },
  review: {
    id: "review",
    title: "Review or improve",
    description: "Refine outputs, correct errors and improve quality.",
    placeholder: "Specify what you would like Hive Studio to review or refine...",
    suggestedPrompts: [
      "Review this BOQ for missing items",
      "Improve this proposal",
      "Validate estimate assumptions",
      "Rewrite this report professionally",
    ],
    accentColor: "green",
    defaultWorkspaceType: "proposal",
  },
  resolve: {
    id: "resolve",
    title: "Resolve project issue",
    description: "Get help with planning, coordination and project decisions.",
    placeholder: "Describe the project coordination or scope issue you need resolved...",
    suggestedPrompts: [
      "Identify likely project coordination risks",
      "Suggest the next project actions",
      "Help resolve a scope conflict",
      "Build a recovery plan for delayed work",
    ],
    accentColor: "orange",
    defaultWorkspaceType: "specification_report",
  },
};
