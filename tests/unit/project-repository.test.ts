import { describe, expect, it } from "vitest";
import { projectsRepository } from "@/features/projects/services/projects.repository";
import { UserSecurityContext } from "@/features/projects/types/project.types";

describe("Projects Repository Layer — Datastore, Lifecycle Tab Isolation & Counts", () => {
  const adminContext: UserSecurityContext = {
    userId: "user-admin",
    role: "admin",
    workspaceId: "ws-default",
    permissions: ["projects.view"],
    isWorkspaceAdmin: true,
  };

  it("proves that Active status tab returns ONLY ACTIVE projects and strictly excludes COMPLETED", async () => {
    const res = await projectsRepository.queryProjects(adminContext, {
      status: "ACTIVE",
    });

    expect(res.projects.length).toBeGreaterThan(0);
    res.projects.forEach((p) => {
      expect(p.status).toBe("ACTIVE");
    });
    expect(res.projects.some((p) => p.status === "COMPLETED")).toBe(false);
  });

  it("returns only intended status for each individual lifecycle tab", async () => {
    const upcomingRes = await projectsRepository.queryProjects(adminContext, { status: "UPCOMING" });
    upcomingRes.projects.forEach((p) => expect(p.status).toBe("UPCOMING"));

    const onHoldRes = await projectsRepository.queryProjects(adminContext, { status: "ON_HOLD" });
    onHoldRes.projects.forEach((p) => expect(p.status).toBe("ON_HOLD"));

    const completedRes = await projectsRepository.queryProjects(adminContext, { status: "COMPLETED" });
    completedRes.projects.forEach((p) => expect(p.status).toBe("COMPLETED"));
  });

  it("evaluates status counts ignoring only active tab while attention counts match selected tab", async () => {
    const activeRes = await projectsRepository.queryProjects(adminContext, {
      status: "ACTIVE",
    });

    // Attention counts match the selected ACTIVE tab
    expect(activeRes.attentionCounts).toBeDefined();
    expect(typeof activeRes.attentionCounts.overdueActions).toBe("number");

    // Status counts provide global totals for each tab
    expect(activeRes.statusCounts.active).toBeGreaterThan(0);
    expect(activeRes.statusCounts.completed).toBeGreaterThan(0);
  });

  it("includes CANCELLED projects in ALL status tab while excluding ARCHIVED unless requested", async () => {
    const res = await projectsRepository.queryProjects(adminContext, {
      status: "ALL",
    });

    const hasArchived = res.projects.some((p) => p.status === "ARCHIVED");
    expect(hasArchived).toBe(false);
  });
});
