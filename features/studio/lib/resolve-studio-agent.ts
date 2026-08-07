import { StudioAgentType, StudioWorkspaceType } from "@/types/domain/studio";
import { StudioIntent, StudioSource } from "../types/studio-source";
import { STUDIO_AGENT_REGISTRY } from "./agent-registry";

export interface AgentResolution {
  agentId: StudioAgentType | "auto";
  confidence: number; // 0.0 to 1.0
  reason:
    | "explicit_selection"
    | "output_type"
    | "intent"
    | "source_type"
    | "prompt_match"
    | "fallback";
  explanation?: string;
}

export function resolveStudioAgent(params: {
  selectedAgent?: StudioAgentType | "auto" | null;
  selectedOutputType?: StudioWorkspaceType | null;
  intent?: StudioIntent | null;
  sources?: StudioSource[];
  prompt?: string;
}): AgentResolution {
  const { selectedAgent, selectedOutputType, intent, sources = [], prompt = "" } = params;

  // 1. Explicitly selected agent (override)
  if (selectedAgent && selectedAgent !== "auto") {
    return {
      agentId: selectedAgent,
      confidence: 1.0,
      reason: "explicit_selection",
      explanation: `Explicitly selected ${STUDIO_AGENT_REGISTRY[selectedAgent]?.name || selectedAgent}`,
    };
  }

  // 2. Explicit output type mapping
  if (selectedOutputType) {
    if (selectedOutputType === "boq") {
      return { agentId: "boq_builder", confidence: 0.95, reason: "output_type", explanation: "Matched BOQ output type to BOQ Builder Agent" };
    }
    if (selectedOutputType === "estimate") {
      return { agentId: "project_estimate", confidence: 0.95, reason: "output_type", explanation: "Matched Estimate output type to Project Estimate Agent" };
    }
    if (selectedOutputType === "visualisation") {
      return { agentId: "visualisation", confidence: 0.95, reason: "output_type", explanation: "Matched Visualisation output type to Visualisation Agent" };
    }
    if (selectedOutputType === "proposal") {
      return { agentId: "proposal", confidence: 0.95, reason: "output_type", explanation: "Matched Proposal output type to Proposal Agent" };
    }
    if (selectedOutputType === "specification_report") {
      return { agentId: "specification_report", confidence: 0.9, reason: "output_type", explanation: "Matched Specification output type to Specification & Report Agent" };
    }
  }

  // 3. Prompt classification keywords
  const promptLower = prompt.toLowerCase();
  if (promptLower.includes("boq") || promptLower.includes("quantity") || promptLower.includes("bill of quantities") || promptLower.includes("takeoff")) {
    return { agentId: "boq_builder", confidence: 0.85, reason: "prompt_match", explanation: "Matched quantity takeoff terms in prompt" };
  }
  if (promptLower.includes("estimate") || promptLower.includes("cost") || promptLower.includes("budget") || promptLower.includes("rate analysis")) {
    return { agentId: "project_estimate", confidence: 0.85, reason: "prompt_match", explanation: "Matched cost estimation terms in prompt" };
  }
  if (promptLower.includes("render") || promptLower.includes("vis") || promptLower.includes("3d") || promptLower.includes("mood board") || promptLower.includes("image")) {
    return { agentId: "visualisation", confidence: 0.85, reason: "prompt_match", explanation: "Matched rendering terms in prompt" };
  }
  if (promptLower.includes("proposal") || promptLower.includes("pitch") || promptLower.includes("fee") || promptLower.includes("scope")) {
    return { agentId: "proposal", confidence: 0.85, reason: "prompt_match", explanation: "Matched commercial proposal terms in prompt" };
  }
  if (promptLower.includes("spec") || promptLower.includes("site report") || promptLower.includes("inspection") || promptLower.includes("log")) {
    return { agentId: "site_report", confidence: 0.8, reason: "prompt_match", explanation: "Matched site report terms in prompt" };
  }

  // 4. Source types attached
  const sourceTypes = sources.map((s) => s.type);
  if (sourceTypes.includes("drawing")) {
    return { agentId: "boq_builder", confidence: 0.75, reason: "source_type", explanation: "Attached drawings routed to BOQ Builder Agent" };
  }
  if (sourceTypes.includes("image")) {
    return { agentId: "visualisation", confidence: 0.75, reason: "source_type", explanation: "Attached images routed to Visualisation Agent" };
  }

  // 5. Selected intent fallback
  if (intent === "analyse") {
    return { agentId: "boq_builder", confidence: 0.7, reason: "intent", explanation: "Drawing analysis routed to BOQ Builder Agent" };
  }
  if (intent === "resolve") {
    return { agentId: "specification_report", confidence: 0.7, reason: "intent", explanation: "Project issue resolution routed to Specification & Report Agent" };
  }

  // 6. Auto Agent fallback
  return {
    agentId: "auto",
    confidence: 0.5,
    reason: "fallback",
    explanation: "Defaulted to Auto Agent for general workflow assistance",
  };
}
