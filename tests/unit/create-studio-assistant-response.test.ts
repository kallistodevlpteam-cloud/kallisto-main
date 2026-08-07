import { describe, expect, it } from "vitest";
import { createStudioAssistantResponse, CLARIFICATION_ACTIONS } from "@/features/studio/lib/create-studio-assistant-response";

describe("createStudioAssistantResponse", () => {
  it("generates clarification response with action chips for greetings", () => {
    const response = createStudioAssistantResponse({
      taskId: "task-1",
      classification: { kind: "greeting" },
      projectName: "Luxury Villa Horizon",
    });

    expect(response.role).toBe("assistant");
    expect(response.content).toBe("What would you like to create, analyse, review or resolve for Luxury Villa Horizon?");
    expect(response.actions).toEqual(CLARIFICATION_ACTIONS);
    expect(response.actions?.[0].label).toBe("Create a BOQ");
  });

  it("generates structured actionable response with resolved agent info", () => {
    const response = createStudioAssistantResponse({
      taskId: "task-1",
      classification: { kind: "actionable", intent: "create", outputType: "boq" },
      projectName: "Luxury Villa Horizon",
      agentResolution: { agentId: "boq_builder", agentName: "BOQ Builder Agent" },
    });

    expect(response.role).toBe("assistant");
    expect(response.kind).toBe("status");
    expect(response.content).toContain("Initialising BOQ Builder Agent");
    expect(response.actions).toBeUndefined();
  });
});
