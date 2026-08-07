import { StudioWorkspaceType } from "@/types/domain/studio";
import { StudioIntent } from "../types/studio-source";

export type StudioPromptClassification =
  | { kind: "greeting" }
  | { kind: "vague" }
  | {
      kind: "actionable";
      intent?: StudioIntent;
      outputType?: StudioWorkspaceType;
    };

const COMMON_GREETINGS = new Set([
  "hi",
  "hello",
  "hey",
  "hoi",
  "help",
  "hello there",
  "good morning",
  "good afternoon",
  "good evening",
  "greetings",
  "hallo",
  "hi there",
]);

/**
  Normalizes user prompt by stripping punctuation, emojis, extra whitespace,
  and converting to lowercase.
 */
export function normalizePrompt(prompt: string): string {
  if (!prompt) return "";
  return prompt
    .toLowerCase()
    // Strip trailing emojis and punctuation
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "")
    .replace(/[!?,.:;'"\-–—_]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
  Classifies a prompt as a greeting, vague input, or actionable construction request.
 */
export function classifyStudioPrompt(prompt: string): StudioPromptClassification {
  const normalized = normalizePrompt(prompt);

  if (!normalized) {
    return { kind: "vague" };
  }

  if (COMMON_GREETINGS.has(normalized)) {
    return { kind: "greeting" };
  }

  // Keywords detection for actionable intent and output type
  const isBOQ = /boq|bill of quantit|quantity|bill/i.test(normalized);
  const isEstimate = /estimate|cost|budget|pricing|price/i.test(normalized);
  const isProposal = /proposal|pitch|client deck|bid/i.test(normalized);
  const isVis = /render|visualisation|visualization|renderings|3d|perspective/i.test(normalized);
  const isSpec = /spec|specification|material spec|workmanship/i.test(normalized);
  const isSiteReport = /site report|site visit|progress report|field report/i.test(normalized);

  if (isBOQ) return { kind: "actionable", intent: "create", outputType: "boq" };
  if (isEstimate) return { kind: "actionable", intent: "create", outputType: "estimate" };
  if (isProposal) return { kind: "actionable", intent: "create", outputType: "proposal" };
  if (isVis) return { kind: "actionable", intent: "create", outputType: "visualisation" };
  if (isSpec) return { kind: "actionable", intent: "create", outputType: "specification" };
  if (isSiteReport) return { kind: "actionable", intent: "create", outputType: "site_report" };

  if (/analyse|analyze|check|review|drawing|floor plan/i.test(normalized)) {
    return { kind: "actionable", intent: "analyse" };
  }

  if (normalized.length < 6) {
    return { kind: "vague" };
  }

  return { kind: "actionable", intent: "create" };
}
