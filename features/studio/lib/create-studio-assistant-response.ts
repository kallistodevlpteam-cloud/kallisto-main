import { StudioChatMessage, StudioMessageAction, StudioOutputReference } from "@/types/domain/studio-message";
import { StudioPromptClassification } from "./classify-studio-prompt";

export interface CreateAssistantResponseInput {
  taskId: string;
  classification: StudioPromptClassification;
  projectName?: string;
  prompt?: string;
  validation?: { isValid: boolean; issues: string[] };
  agentResolution?: { agentId: string; agentName: string };
  isInitialOutputGeneration?: boolean;
  currentVersionId?: string;
  hasOutputContextChip?: boolean;
}

export const CLARIFICATION_ACTIONS: StudioMessageAction[] = [
  {
    id: "confirm-mep",
    label: "Include MEP & Furniture in Scope",
    intent: "create",
    suggestedPrompt: "Include MEP services and loose furniture procurement in the main proposal estimate.",
  },
  {
    id: "separate-line-items",
    label: "Keep as Separate Line Items",
    intent: "create",
    suggestedPrompt: "Keep MEP services and loose furniture as separate optional line items.",
  },
  {
    id: "adjust-timeline",
    label: "Change Timeline to 4 Months",
    intent: "create",
    suggestedPrompt: "Revise the project timeline to 4 months.",
  },
  {
    id: "adjust-payment",
    label: "Revise Payment Terms to 20% Advance",
    intent: "create",
    suggestedPrompt: "Revise payment terms to 20% advance, 30% design approval, 40% execution, 10% handover.",
  },
];

export function createStudioAssistantResponse(
  input: CreateAssistantResponseInput
): StudioChatMessage {
  const {
    taskId,
    classification,
    projectName = "Villa Design Consultation",
    prompt = "",
    validation,
    agentResolution,
    isInitialOutputGeneration = false,
    currentVersionId = "V01",
    hasOutputContextChip = false,
  } = input;

  const msgId = `msg-assistant-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const lowerPrompt = prompt.toLowerCase();

  if (validation && !validation.isValid && validation.issues.length > 0) {
    return {
      id: msgId,
      taskId,
      role: "assistant",
      kind: "validation",
      content: `Reviewing project context for ${projectName}. Additional required details: ${validation.issues.join("; ")}.`,
      createdAt: new Date().toISOString(),
    };
  }

  // 1. REVISION INTENT: User requests changes or submits revision chip
  const isRevision =
    hasOutputContextChip ||
    lowerPrompt.includes("request change") ||
    lowerPrompt.includes("revise") ||
    lowerPrompt.includes("update") ||
    lowerPrompt.includes("change") ||
    lowerPrompt.includes("timeline") ||
    lowerPrompt.includes("month") ||
    lowerPrompt.includes("payment") ||
    lowerPrompt.includes("advance") ||
    lowerPrompt.includes("terms") ||
    lowerPrompt.includes("mep") ||
    lowerPrompt.includes("furniture") ||
    lowerPrompt.includes("separate");

  if (isRevision) {
    // Increment version (e.g. V01 -> V02, V02 -> V03)
    const currentNum = parseInt(currentVersionId.replace("V", ""), 10) || 1;
    const nextVersionId = `V${String(currentNum + 1).padStart(2, "0")}`;

    let summaryText = `The proposal draft has been updated to ${nextVersionId} with your requested revisions. Open the preview to review the updated draft.`;
    if (lowerPrompt.includes("timeline") || lowerPrompt.includes("month")) {
      summaryText = `The proposal draft has been updated to ${nextVersionId} with the revised timeline. Review the updated version below or open the preview.`;
    } else if (lowerPrompt.includes("payment") || lowerPrompt.includes("advance") || lowerPrompt.includes("terms")) {
      summaryText = `The proposal draft has been updated to ${nextVersionId} with the revised commercial payment terms. Review the updated version below.`;
    }

    const outputRef: StudioOutputReference = {
      outputId: "out-1",
      versionId: nextVersionId,
      title: "Villa Design Proposal",
      statusBadge: `Updated ${nextVersionId}`,
      eventType: "revised",
    };

    return {
      id: msgId,
      taskId,
      role: "assistant",
      kind: "text",
      content: summaryText,
      createdAt: new Date().toISOString(),
      outputReference: outputRef,
    };
  }

  // 2. CREATION INTENT: First turn of initial output generation
  if (
    isInitialOutputGeneration ||
    agentResolution?.agentId === "proposal" ||
    (classification.kind === "actionable" && classification.outputType === "proposal") ||
    lowerPrompt.includes("create proposal") ||
    lowerPrompt.includes("generate proposal")
  ) {
    const outputRef: StudioOutputReference = {
      outputId: "out-1",
      versionId: "V01",
      title: "Villa Design Proposal",
      statusBadge: "Ready for Review",
      eventType: "created",
    };

    return {
      id: msgId,
      taskId,
      role: "assistant",
      kind: "text",
      content: `The proposal draft is ready. I created a first-pass version using the linked project files, scope and budget. Open the preview to review it or request changes.`,
      createdAt: new Date().toISOString(),
      outputReference: outputRef,
      actions: CLARIFICATION_ACTIONS,
    };
  }

  // 3. CONVERSATION / QUERY INTENT: Normal follow-up prompt without output reference
  return {
    id: msgId,
    taskId,
    role: "assistant",
    kind: "text",
    content: `Understood. I have updated the project context notes for ${projectName} with your latest inputs. Let me know if you need specific revisions to the proposal.`,
    createdAt: new Date().toISOString(),
  };
}
