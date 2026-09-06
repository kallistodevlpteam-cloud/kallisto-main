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
    id: "create-boq",
    label: "Create a BOQ",
    intent: "create",
    suggestedPrompt: "Create a BOQ for this project",
  },
  {
    id: "create-proposal",
    label: "Draft Proposal",
    intent: "create",
    suggestedPrompt: "Draft a client proposal for this project",
  },
  {
    id: "create-estimate",
    label: "Cost Estimate",
    intent: "create",
    suggestedPrompt: "Prepare a cost estimate for this project",
  },
  {
    id: "generate-render",
    label: "3D Visualisation",
    intent: "create",
    suggestedPrompt: "Generate 3D visualisations for this project",
  },
];

export const PROPOSAL_REVISION_ACTIONS: StudioMessageAction[] = [
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

  if (classification.kind === "greeting") {
    return {
      id: msgId,
      taskId,
      role: "assistant",
      kind: "text",
      content: `What would you like to create, analyse, review or resolve for ${projectName}?`,
      createdAt: new Date().toISOString(),
      actions: CLARIFICATION_ACTIONS,
    };
  }

  if (agentResolution && classification.kind === "actionable" && !prompt) {
    return {
      id: msgId,
      taskId,
      role: "assistant",
      kind: "status",
      content: `Initialising ${agentResolution.agentName}...`,
      createdAt: new Date().toISOString(),
    };
  }

  // 1. VERIFICATION COMPLETION -> ASK TO SHARE REQUIREMENTS
  const isVerificationResponse =
    lowerPrompt.includes("proceed") ||
    lowerPrompt.includes("verified my contact") ||
    lowerPrompt.includes("verified my identity") ||
    lowerPrompt.includes("verify details") ||
    lowerPrompt.includes("verification complete") ||
    lowerPrompt.includes("identity verified");

  if (isVerificationResponse) {
    const providerName = projectName || "the service provider";
    return {
      id: msgId,
      taskId,
      role: "assistant",
      kind: "text",
      content: `Your verification is complete! Would you like to share your requirements with **${providerName}**?`,
      createdAt: new Date().toISOString(),
      actions: [
        {
          id: "share-reqs",
          label: "Share Project Requirements",
          intent: "create",
          suggestedPrompt: `I would like to share our project requirements: 10 cents plot area, 4BHK layout (approx 3,200 sq.ft), contemporary tropical aesthetic with sustainable materials.`,
        },
        {
          id: "upload-drawings",
          label: "Upload Site Survey & Drawings",
          intent: "create",
          suggestedPrompt: `I have uploaded our site layout and boundary survey drawings for feasibility assessment.`,
        },
        {
          id: "schedule-call",
          label: "Schedule Direct Consultation Call",
          intent: "create",
          suggestedPrompt: `Please schedule an introductory consultation call with ${providerName} to discuss initial project objectives.`,
        },
      ],
    };
  }

  // 2. PACKAGE ENQUIRY & CONSULTATION ONBOARDING INTENT -> SHOW PROVIDER CARD & ASK FOR VERIFICATION
  const isPackageEnquiry =
    lowerPrompt.includes("confirm and proceed") ||
    lowerPrompt.includes("consultation order") ||
    lowerPrompt.includes("package enquiry") ||
    (lowerPrompt.includes("package") && (lowerPrompt.includes("design package") || lowerPrompt.includes("execution") || lowerPrompt.includes("architect")));

  if (isPackageEnquiry) {
    const packageMatch = prompt.match(/"([^"]+)"/);
    const packageTitle = packageMatch ? packageMatch[1] : "Selected Design Package";

    const priceMatch = prompt.match(/\((₹[^)]+)\)/);
    const packagePrice = priceMatch ? priceMatch[1] : "₹5,00,000";

    const fromMatch = prompt.match(/from\s+([^.]+)/i);
    const providerName = fromMatch ? fromMatch[1].trim() : (projectName || "Apex Structural Consultants");

    return {
      id: msgId,
      taskId,
      role: "assistant",
      kind: "text",
      content: `You have chosen **${providerName}**.\n\nPlease verify your contact details to proceed with this consultation.`,
      createdAt: new Date().toISOString(),
      providerCard: {
        providerId: "provider-selected",
        name: providerName,
        packageTitle: packageTitle,
        packagePrice: packagePrice,
        avatarUrl: "/assets/arjun-avatar.jpg",
        rating: 4.9,
        reviewsCount: 34,
        isVerified: true,
      },
      actions: [
        {
          id: "proceed",
          label: "Proceed",
          intent: "create",
          suggestedPrompt: "I have verified my contact details and identity. Please proceed.",
        },
      ],
    };
  }

  // 2. REVISION INTENT: User explicitly requests changes or submits revision chip
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
    } else if (lowerPrompt.includes("payment") || lowerPrompt.includes("terms") || lowerPrompt.includes("advance")) {
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

  // 3. EXPLICIT PROPOSAL GENERATION INTENT: First turn when user explicitly requests a proposal
  const isExplicitProposalCreation =
    isInitialOutputGeneration ||
    agentResolution?.agentId === "proposal" ||
    (classification.kind === "actionable" && classification.outputType === "proposal") ||
    lowerPrompt.includes("create proposal") ||
    lowerPrompt.includes("generate proposal") ||
    lowerPrompt.includes("draft proposal") ||
    (lowerPrompt.includes("proposal") && (lowerPrompt.includes("create") || lowerPrompt.includes("draft") || lowerPrompt.includes("generate")));

  if (isExplicitProposalCreation) {
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
      actions: PROPOSAL_REVISION_ACTIONS,
    };
  }

  // 4. CONVERSATION / QUERY INTENT: Normal follow-up prompt without output reference
  return {
    id: msgId,
    taskId,
    role: "assistant",
    kind: "text",
    content: `Understood. I have updated the project context notes for ${projectName} with your latest inputs. Let me know if you need specific revisions to the proposal.`,
    createdAt: new Date().toISOString(),
  };
}

