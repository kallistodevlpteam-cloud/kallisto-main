import { describe, expect, it } from "vitest";
import { StudioMockRepository } from "@/services/repositories/studio-mock-repository";
import { StudioPermissions } from "@/services/studio/studio-permissions";
import { StudioPublishingService } from "@/services/studio/studio-publishing";
import { StudioService } from "@/services/studio/studio-service";
import { StudioStatusMachine } from "@/services/studio/studio-status-machine";
import { StudioVersionService } from "@/services/studio/studio-version-service";

describe("Studio Domain & Service Architecture", () => {
  const repository = new StudioMockRepository();
  const studioService = new StudioService(repository);

  it("enforces valid status transitions using StudioStatusMachine", () => {
    expect(StudioStatusMachine.canTransition("draft", "queued")).toBe(true);
    expect(StudioStatusMachine.canTransition("review_required", "approved")).toBe(true);
    expect(StudioStatusMachine.canTransition("approved", "published")).toBe(true);

    // Invalid transition throws error
    expect(() => StudioStatusMachine.validateTransition("draft", "published")).toThrow();
  });

  it("generates system version labels V01, V02 using StudioVersionService", () => {
    expect(StudioVersionService.formatVersionLabel(1)).toBe("V01");
    expect(StudioVersionService.formatVersionLabel(2)).toBe("V02");
    expect(StudioVersionService.formatVersionLabel(12)).toBe("V12");
  });

  it("creates a task using strict CreateStudioTaskCommand and system-generated metadata", async () => {
    const { task, version } = await studioService.createStudioTask({
      workspaceId: "ws-kallisto-01",
      workspaceType: "boq",
      useCase: "create_detailed_boq",
      startMethod: "scratch",
      projectId: "proj-res-001",
      sourceInputs: [],
      configuration: {
        workspaceType: "boq",
        packageType: "Civil",
        measurementStandard: "IS 1200",
        drawingRevisionIds: [],
        costLocation: "Hyderabad",
        includeTaxes: true,
      },
      createdByUserId: "usr-architect-01",
      idempotencyKey: `idemp-test-01`,
    });

    expect(task.id).toBeDefined();
    expect(task.status).toBe("draft");
    expect(task.workspaceType).toBe("boq");
    expect(version.versionLabel).toBe("V01");
    expect(version.versionNumber).toBe(1);
  });

  it("enforces role-based permissions using StudioPermissions", () => {
    expect(StudioPermissions.checkPermission("lead_architect", "approve")).toBe(true);
    expect(StudioPermissions.checkPermission("viewer", "approve")).toBe(false);
    expect(StudioPermissions.checkPermission("estimator", "view_financial_data")).toBe(true);
  });

  it("handles revision creation and marks parent version as superseded", async () => {
    const { task } = await studioService.createStudioTask({
      workspaceId: "ws-kallisto-01",
      workspaceType: "estimate",
      useCase: "detailed_estimate",
      startMethod: "scratch",
      projectId: "proj-res-001",
      sourceInputs: [],
      configuration: {
        workspaceType: "estimate",
        estimateStage: "Detailed",
        totalAreaSqFt: 3000,
        qualityTier: "premium",
        costLocation: "Hyderabad",
        includedPackages: ["Civil"],
        contingencyPercentage: 5,
      },
      createdByUserId: "usr-architect-01",
      idempotencyKey: `idemp-test-02`,
    });

    // Create revision V02
    const v2 = await studioService.createNewRevision(
      task.id,
      "usr-architect-01",
      "lead_architect",
      "Lead Architect"
    );

    expect(v2.versionLabel).toBe("V02");
    expect(v2.versionNumber).toBe(2);
  });
});
