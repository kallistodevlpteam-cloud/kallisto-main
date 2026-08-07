import { describe, expect, it } from "vitest";
import type { WorkforceRequestDraft } from "../types/hands.types";
import { validateWorkforceRequest } from "./hands-validation";

const validRequest: WorkforceRequestDraft = {
  projectId: "proj-001",
  siteLocation: "Thiruvananthapuram",
  trade: "Carpenters",
  workerCount: "5",
  skillLevel: "skilled",
  startDate: "2026-07-28",
  expectedDuration: "2 weeks",
  shiftTiming: "8:00 AM – 5:00 PM",
  requiredToolsOrCertifications: "",
  siteContact: "Rajeev K.",
  notes: "",
};

describe("Workforce request validation", () => {
  it("requires project, trade, a positive worker count, start date and duration", () => {
    const errors = validateWorkforceRequest({
      ...validRequest,
      projectId: "",
      trade: "",
      workerCount: "0",
      startDate: "",
      expectedDuration: " ",
    });

    expect(errors).toEqual({
      projectId: "Select a project.",
      trade: "Select a worker trade.",
      workerCount: "Enter a worker count greater than zero.",
      startDate: "Select a start date.",
      expectedDuration: "Enter the expected duration.",
    });
  });

  it("rejects a non-numeric worker count", () => {
    const errors = validateWorkforceRequest({
      ...validRequest,
      workerCount: "not-a-number",
    });

    expect(errors.workerCount).toBe(
      "Enter a worker count greater than zero.",
    );
  });

  it("accepts a complete valid request", () => {
    expect(validateWorkforceRequest(validRequest)).toEqual({});
  });
});
