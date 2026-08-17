import { StudioChatMessage } from "@/types/domain/studio-message";
import { StudioTask } from "@/types/domain/studio";
import { ConversationEvent } from "@/types/domain/studio-conversation-event";
import { formatRelativeTime } from "@/lib/utils/format-relative-time";

export interface DeriveEventsOptions {
  messages: StudioChatMessage[];
  task?: StudioTask | null;
  projectName?: string;
}

/**
 * Derives meaningful, chronological timeline events from conversation messages
 * and active task outputs for the Hive Studio Conversation Spine.
 */
export function deriveConversationEvents(options: DeriveEventsOptions): ConversationEvent[] {
  const { messages, task, projectName = "Villa Design Consultation" } = options;
  if (!messages || messages.length === 0) return [];

  const events: ConversationEvent[] = [];

  messages.forEach((msg, index) => {
    // Skip transient thinking or validation loading states
    if (
      msg.kind === "status" ||
      msg.content.startsWith("Initialising ") ||
      msg.content.startsWith("Processing ") ||
      msg.content === "Thinking..."
    ) {
      return;
    }

    const timestamp = formatRelativeTime(msg.createdAt);

    // ── 1. USER MESSAGES ──
    if (msg.role === "user") {
      const isFirstTurn = index === 0;
      const lowerContent = msg.content.toLowerCase();

      // Check if user attached drawings / files
      if (msg.sources && msg.sources.length > 0) {
        const fileNames = msg.sources.map((s) => s.name || "Source file");
        const isDrawing = msg.sources.some((s) => s.type === "drawing" || s.name?.endsWith(".pdf") || s.name?.endsWith(".png"));

        events.push({
          id: `evt-${msg.id}-attachments`,
          threadId: msg.taskId || task?.id,
          projectId: task?.projectId,
          type: isDrawing ? "DRAWING" : "DOCUMENT",
          title: isDrawing ? "DRAWING UPLOADED" : "DOCUMENT ATTACHED",
          summary: `Attached ${msg.sources.length} source ${msg.sources.length === 1 ? "file" : "files"} to project context.`,
          details: fileNames.slice(0, 3).map((name) => `• ${name}`),
          timestamp,
          messageId: msg.id,
          relatedEntityType: isDrawing ? "drawing" : "document",
          relatedEntityActionLabel: "View files",
          isImportant: true,
        });
      }

      // Check if user prompt is a revision request
      const isRevision =
        lowerContent.includes("revise") ||
        lowerContent.includes("change") ||
        lowerContent.includes("update") ||
        lowerContent.includes("timeline") ||
        lowerContent.includes("payment") ||
        lowerContent.includes("mep") ||
        lowerContent.includes("furniture");

      if (isFirstTurn) {
        events.push({
          id: `evt-${msg.id}-req`,
          threadId: msg.taskId || task?.id,
          projectId: task?.projectId,
          type: "REQUIREMENT",
          title: "PROJECT REQUIREMENT",
          summary: msg.content.length > 120 ? `${msg.content.substring(0, 117)}…` : msg.content,
          details: [
            `• Project: ${projectName}`,
            "• Scope: 2D floorplans, 3D interior renders, BOQ estimate",
          ],
          chips: [
            { id: "brief", label: "Project Brief", icon: "file" },
          ],
          timestamp,
          messageId: msg.id,
          isImportant: true,
        });
      } else if (isRevision) {
        events.push({
          id: `evt-${msg.id}-rev`,
          threadId: msg.taskId || task?.id,
          projectId: task?.projectId,
          type: "REVISION",
          title: "REVISION REQUEST",
          summary: msg.content.length > 120 ? `${msg.content.substring(0, 117)}…` : msg.content,
          details: [
            lowerContent.includes("timeline") || lowerContent.includes("month")
              ? "• Revised delivery schedule to 4 months"
              : lowerContent.includes("mep") || lowerContent.includes("furniture")
              ? "• Include MEP & loose furniture procurement in scope"
              : "• Adjusted project scope and parameters",
          ],
          chips: [
            { id: "rev", label: "Revision Note", icon: "file" },
          ],
          timestamp,
          messageId: msg.id,
          isImportant: true,
        });
      } else {
        events.push({
          id: `evt-${msg.id}-msg`,
          threadId: msg.taskId || task?.id,
          projectId: task?.projectId,
          type: "MESSAGE",
          title: "USER QUERY",
          summary: msg.content.length > 120 ? `${msg.content.substring(0, 117)}…` : msg.content,
          details: [
            `• Message query: "${msg.content.length > 60 ? msg.content.substring(0, 57) + "…" : msg.content}"`,
          ],
          timestamp,
          messageId: msg.id,
          isImportant: false,
        });
      }
      return;
    }

    // ── 2. ASSISTANT RESPONSES ──
    if (msg.role === "assistant") {
      const outputRef = msg.outputReference;

      if (outputRef) {
        const isVersion1 = outputRef.versionId === "V01" || outputRef.eventType === "created";
        const versionLabel = outputRef.versionId || "V01";

        if (isVersion1) {
          events.push({
            id: `evt-${msg.id}-out-v1`,
            threadId: msg.taskId || task?.id,
            projectId: task?.projectId,
            type: "AI_ACTION",
            title: `PROPOSAL ${versionLabel} READY`,
            summary: `Created initial ${outputRef.title || "Proposal"} draft from project scope and budget.`,
            details: [
              "• Spatial layout & 2D architectural floorplans",
              "• Budget: ₹18L – ₹25L commercial breakdown",
              "• Schedule: 6-month phased delivery milestones",
            ],
            chips: [
              { id: "preview", label: "Web preview...", icon: "globe" },
              { id: "pdf", label: `Villa_Proposal_${versionLabel}.pdf`, icon: "file" },
            ],
            timestamp,
            messageId: msg.id,
            relatedEntityType: "output",
            relatedEntityId: outputRef.outputId || "out-1",
            relatedEntityVersion: versionLabel,
            relatedEntityActionLabel: "Open preview",
            status: "completed",
            isImportant: true,
          });
        } else {
          events.push({
            id: `evt-${msg.id}-out-rev`,
            threadId: msg.taskId || task?.id,
            projectId: task?.projectId,
            type: "REVISION",
            title: `PROPOSAL ${versionLabel} UPDATED`,
            summary: `Updated proposal draft to ${versionLabel} incorporating requested changes.`,
            details: [
              "• Revised timeline & delivery phases to 4 months",
              "• Updated commercial milestone payout schedule",
              "• Synchronized BOQ line items with revised scope",
            ],
            chips: [
              { id: "preview", label: "Web preview...", icon: "globe" },
              { id: "pdf", label: `Villa_Proposal_${versionLabel}.pdf`, icon: "file" },
            ],
            timestamp,
            messageId: msg.id,
            relatedEntityType: "output",
            relatedEntityId: outputRef.outputId || "out-1",
            relatedEntityVersion: versionLabel,
            relatedEntityActionLabel: "Open preview",
            status: "completed",
            isImportant: true,
          });
        }
      } else {
        events.push({
          id: `evt-${msg.id}-assistant`,
          threadId: msg.taskId || task?.id,
          projectId: task?.projectId,
          type: "AI_ACTION",
          title: "AI RESPONSE",
          summary: msg.content.length > 120 ? `${msg.content.substring(0, 117)}…` : msg.content,
          details: [
            "• Processed query and updated project session state",
          ],
          timestamp,
          messageId: msg.id,
          isImportant: false,
        });
      }
    }
  });

  return events;
}
