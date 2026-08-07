import { describe, expect, it } from "vitest";
import { projectsService } from "@/features/projects/services/projects.service";
import { UserSecurityContext } from "@/features/projects/types/project.types";

describe("Projects Service Layer — DTO Mapping & Governance", () => {
  const userContext: UserSecurityContext = {
    userId: "user-current",
    role: "lead_architect",
    workspaceId: "ws-default",
    permissions: [
      "projects.view",
      "projects.edit",
      "projects.assign_owner",
      "projects.place_on_hold",
      "projects.complete",
      "projects.reopen",
      "projects.archive",
    ],
  };

  it("maps raw domain entities to ProjectListItem DTO with nullable nextAction", async () => {
    const res = await projectsService.getProjectsWorkspaceQuery(userContext, {
      status: "ACTIVE",
    });

    expect(res.items.length).toBeGreaterThan(0);
    const item = res.items[0];

    expect(item).toHaveProperty("id");
    expect(item).toHaveProperty("name");
    expect(item).toHaveProperty("code");
    expect(item).toHaveProperty("clientDisplayName");
    expect(item).toHaveProperty("owner");
    expect(item).toHaveProperty("allowedActions");

    // Financial details should NOT be present in ProjectListItem DTO
    expect(item).not.toHaveProperty("contractValue");
    expect(item).not.toHaveProperty("billingDetails");
  });

  it("reopens a completed project when user has projects.reopen permission and provides a valid reason", async () => {
    // Reopen project 'proj-5' (Skyline Corporate HQ Suite)
    const result = await projectsService.reopenProject(
      userContext,
      "proj-5",
      "Client requested post-handover Phase 2 interior expansion."
    );

    expect(result.success).toBe(true);
    expect(result.newStatus).toBe("ACTIVE");
  });
});
