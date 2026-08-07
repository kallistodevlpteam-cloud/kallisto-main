import { describe, it, expect } from "vitest";
import {
  calculateTaskProgress,
  validateTaskDependencies,
  ProjectTask,
  ProjectTaskDomainError,
  TaskChecklistItem,
} from "@/types/domain/project-task";
import { projectTaskMockRepository } from "@/services/repositories/project-task.mock-repository";
import { projectTaskService } from "@/services/repositories/project-task.service";

describe("Project Tasks Domain & Repository Unit Tests", () => {
  const baseTask: ProjectTask = {
    id: "task-test-1",
    workspaceId: "ws-default",
    projectId: "proj-1",
    version: 1,
    title: "Test Task",
    workPackageId: "wp-1",
    status: "in_progress",
    priority: "normal",
    assigneeIds: ["user-arjun"],
    reporterId: "user-arjun",
    progress: 50,
    visibility: "project_team",
    checklistItemIds: [],
    dependencyIds: [],
    attachmentIds: [],
    commentCount: 0,
    createdAt: "2026-07-24T00:00:00Z",
    updatedAt: "2026-07-24T00:00:00Z",
  };

  it("calculates progress correctly based on status and checklist", () => {
    // 1. Completed forces 100
    const completedTask = { ...baseTask, status: "completed" as const, progress: 20 };
    expect(calculateTaskProgress(completedTask, [])).toBe(100);

    // 2. Cancelled forces undefined
    const cancelledTask = { ...baseTask, status: "cancelled" as const, progress: 40 };
    expect(calculateTaskProgress(cancelledTask, [])).toBeUndefined();

    // 3. Checklist items derive progress %
    const checklistItems: TaskChecklistItem[] = [
      { id: "chk-1", taskId: "task-test-1", label: "Item 1", completed: true, createdAt: "", updatedAt: "" },
      { id: "chk-2", taskId: "task-test-1", label: "Item 2", completed: false, createdAt: "", updatedAt: "" },
      { id: "chk-3", taskId: "task-test-1", label: "Item 3", completed: true, createdAt: "", updatedAt: "" },
      { id: "chk-4", taskId: "task-test-1", label: "Item 4", completed: false, createdAt: "", updatedAt: "" },
    ];
    // 2 of 4 = 50%
    expect(calculateTaskProgress(baseTask, checklistItems)).toBe(50);

    // 4. No checklist returns manual progress
    expect(calculateTaskProgress(baseTask, [])).toBe(50);
  });

  it("validates dependency rules and throws domain errors", () => {
    const allTasksMap = new Map<string, ProjectTask>();
    allTasksMap.set("task-test-1", baseTask);

    const depTask: ProjectTask = {
      ...baseTask,
      id: "task-dep-1",
      dependencyIds: [],
    };
    allTasksMap.set("task-dep-1", depTask);

    // 1. Self-dependency error
    expect(() => validateTaskDependencies(baseTask, "task-test-1", allTasksMap)).toThrow(
      ProjectTaskDomainError
    );

    // 2. Duplicate dependency error
    const taskWithDep = { ...baseTask, dependencyIds: ["task-dep-1"] };
    expect(() => validateTaskDependencies(taskWithDep, "task-dep-1", allTasksMap)).toThrow(
      ProjectTaskDomainError
    );

    // 3. Cross-project dependency error
    const crossProjTask: ProjectTask = {
      ...depTask,
      id: "task-cross",
      projectId: "proj-other",
    };
    allTasksMap.set("task-cross", crossProjTask);
    expect(() => validateTaskDependencies(baseTask, "task-cross", allTasksMap)).toThrow(
      ProjectTaskDomainError
    );

    // 4. Cancelled dependency error
    const cancelledDep: ProjectTask = {
      ...depTask,
      id: "task-cancelled-dep",
      status: "cancelled",
    };
    allTasksMap.set("task-cancelled-dep", cancelledDep);
    expect(() => validateTaskDependencies(baseTask, "task-cancelled-dep", allTasksMap)).toThrow(
      ProjectTaskDomainError
    );

    // 5. Circular dependency error
    const cycleA: ProjectTask = { ...baseTask, id: "cycle-a", dependencyIds: ["cycle-b"] };
    const cycleB: ProjectTask = { ...baseTask, id: "cycle-b", dependencyIds: ["cycle-a"] };
    allTasksMap.set("cycle-a", cycleA);
    allTasksMap.set("cycle-b", cycleB);
    expect(() => validateTaskDependencies(cycleA, "cycle-b", allTasksMap)).toThrow(
      ProjectTaskDomainError
    );
  });

  it("lists all 24 tasks grouped into 6 work packages", async () => {
    const result = await projectTaskMockRepository.list({
      workspaceId: "ws-default",
      projectId: "proj-1",
    });

    expect(result.totalCount).toBe(24);
    expect(result.groups.length).toBe(6);
    expect(result.attentionSummary.blockedCount).toBeGreaterThan(0);
    expect(result.attentionSummary.overdueCount).toBeGreaterThan(0);
    expect(result.attentionSummary.dueThisWeekCount).toBeGreaterThan(0);
  });

  it("enforces status transition requirements", async () => {
    // 1. Blocked requires blockerReason
    await expect(
      projectTaskMockRepository.changeStatus({
        workspaceId: "ws-default",
        projectId: "proj-1",
        taskId: "task-101",
        status: "blocked",
        actorId: "user-arjun",
        expectedVersion: 1,
        idempotencyKey: "idem-block-fail",
      })
    ).rejects.toThrow("Blocker reason is required");

    // 2. Client approval completion requires approvalEvidenceId
    await expect(
      projectTaskMockRepository.changeStatus({
        workspaceId: "ws-default",
        projectId: "proj-1",
        taskId: "task-601", // Client Approval WP
        status: "completed",
        actorId: "user-arjun",
        expectedVersion: 1,
        idempotencyKey: "idem-approve-fail",
      })
    ).rejects.toThrow("Client approval tasks require approval evidence");
  });

  it("is idempotent for duplicate creation calls", async () => {
    const key = `idem-create-${Date.now()}`;
    const command = {
      workspaceId: "ws-default",
      projectId: "proj-1",
      actorId: "user-arjun",
      idempotencyKey: key,
      title: "Idempotent Task",
      workPackageId: "wp-1",
      assigneeIds: ["user-arjun"],
      reporterId: "user-arjun",
      visibility: "project_team" as const,
    };

    const task1 = await projectTaskService.createTask(command);
    const task2 = await projectTaskService.createTask(command);

    expect(task1.id).toBe(task2.id);
  });

  it("supports sorting tasks by recently_updated, due_date, priority, progress, and created_at", async () => {
    const listSort = async (sortBy: "recently_updated" | "due_date" | "priority" | "progress" | "created_at") => {
      const page = await projectTaskMockRepository.list({
        workspaceId: "ws-default",
        projectId: "proj-1",
        sortBy,
      });
      return page.groups.flatMap((g) => g.tasks);
    };

    const recentlyUpdated = await listSort("recently_updated");
    expect(recentlyUpdated.length).toBeGreaterThan(0);

    const byPriority = await listSort("priority");
    expect(byPriority.length).toBeGreaterThan(0);
    // Highest priority (critical) should appear before low priority in sorted list
    const criticalIdx = byPriority.findIndex((t) => t.priority === "critical");
    const lowIdx = byPriority.findIndex((t) => t.priority === "low");
    if (criticalIdx !== -1 && lowIdx !== -1) {
      expect(criticalIdx).toBeLessThan(lowIdx);
    }

    const byProgress = await listSort("progress");
    expect(byProgress.length).toBeGreaterThan(0);
  });

  it("searches tasks by task title, assignee name, and phase", async () => {
    // 1. Search by assignee name (e.g. Rahul)
    const rahulSearch = await projectTaskMockRepository.list({
      workspaceId: "ws-default",
      projectId: "proj-1",
      searchQuery: "Rahul",
    });
    expect(rahulSearch.totalCount).toBeGreaterThan(0);
    const rahulTasks = rahulSearch.groups.flatMap((g) => g.tasks);
    expect(rahulTasks.every((t) => t.assigneeIds.includes("user-rahul") || t.title.toLowerCase().includes("rahul"))).toBe(true);

    // 2. Search by phase / work package (e.g. Structural)
    const structSearch = await projectTaskMockRepository.list({
      workspaceId: "ws-default",
      projectId: "proj-1",
      searchQuery: "Structural",
    });
    expect(structSearch.totalCount).toBeGreaterThan(0);
  });

  it("orders risk tasks (overdue & blocked) before non-risk and completed tasks within groups", async () => {
    const page = await projectTaskMockRepository.list({
      workspaceId: "ws-default",
      projectId: "proj-1",
      sortBy: "needs_attention",
    });

    const structGroup = page.groups.find((g) => g.workPackage.id === "wp-1");
    expect(structGroup).toBeDefined();

    if (structGroup && structGroup.tasks.length >= 2) {
      const firstTask = structGroup.tasks[0];
      const lastTask = structGroup.tasks[structGroup.tasks.length - 1];

      // Overdue / blocked critical task should appear at top
      expect(firstTask.status === "blocked" || (firstTask.dueDate && firstTask.dueDate < "2026-07-24")).toBe(true);

      // Completed task should appear at bottom
      expect(lastTask.status).toBe("completed");
    }
  });
});
