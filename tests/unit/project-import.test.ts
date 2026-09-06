import { describe, expect, it } from "vitest";
import { projectImportService } from "@/features/projects/services/project-import.service";
import { UserSecurityContext } from "@/features/projects/types/project.types";

describe("Import Project Engine — Validate-and-Preview & Atomic Confirmation", () => {
  const importerContext: UserSecurityContext = {
    userId: "user-current",
    role: "lead_architect",
    workspaceId: "ws-default",
    permissions: ["projects.view", "projects.import"],
  };

  it("validates import payload, generates validationId, and detects client matches", async () => {
    const preview = await projectImportService.validateAndPreviewImport(importerContext, {
      projectName: "Malabar Heritage Mansion",
      projectCode: "PRJ-MHM-99",
      clientName: "Anoop Menon",
      email: "anoop@menongroup.com",
      siteLocation: "Kochi, Kerala",
      phase: "Concept",
    });

    expect(preview.isValid).toBe(true);
    expect(preview.validationId).toMatch(/^val-/);
    expect(preview.matchingClientCandidates.length).toBeGreaterThan(0);
    expect(preview.matchingClientCandidates[0].name).toBe("Anoop Kumar");
  });

  it("rejects import preview when project code already exists in workspace", async () => {
    const preview = await projectImportService.validateAndPreviewImport(importerContext, {
      projectName: "Duplicate Code Attempt",
      projectCode: "PRJ-RES-24", // Existing code in dev store
      clientName: "Test Client",
    });

    expect(preview.isValid).toBe(false);
    expect(preview.errors.some((e) => e.includes("already exists"))).toBe(true);
  });

  it("executes confirmImport atomically using server validationId and prevents duplicate submissions via idempotency key", async () => {
    const preview = await projectImportService.validateAndPreviewImport(importerContext, {
      projectName: "Unique Import Villa",
      projectCode: `PRJ-UNQ-${Date.now()}`,
      clientName: "Unique Import Client",
    });

    const idempotencyKey = `idempotency-test-${Date.now()}`;

    const confirmRes = await projectImportService.confirmImport(importerContext, {
      validationId: preview.validationId,
      idempotencyKey,
      clientSelection: {
        mode: "use_existing",
        selectedClientId: "cli-101",
      },
    });

    expect(confirmRes.success).toBe(true);
    expect(confirmRes.project.name).toBe("Unique Import Villa");

    // Second submission with same idempotency key must throw duplicate submission error
    await expect(
      projectImportService.confirmImport(importerContext, {
        validationId: preview.validationId,
        idempotencyKey,
        clientSelection: {
          mode: "use_existing",
          selectedClientId: "cli-101",
        },
      })
    ).rejects.toThrow(/already been processed/i);
  });
});
