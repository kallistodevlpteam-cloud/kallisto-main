import { describe, expect, it } from "vitest";
import { calculateDueState } from "@/features/projects/utils/project-due-state";

describe("Project Due State Utility — Injected Clock", () => {
  const mockNow = new Date("2026-07-20T10:00:00.000Z");

  it("handles null or undefined dueAt dates gracefully", () => {
    const res = calculateDueState(null, { now: mockNow });
    expect(res.dueState).toBe("no_due_date");
    expect(res.dueLabel).toBe("No deadline");
    expect(res.isOverdue).toBe(false);
  });

  it("identifies overdue actions accurately", () => {
    const pastDate = new Date("2026-07-18T10:00:00.000Z").toISOString();
    const res = calculateDueState(pastDate, { now: mockNow });
    expect(res.dueState).toBe("overdue");
    expect(res.dueLabel).toContain("Overdue by 2 days");
    expect(res.isOverdue).toBe(true);
  });

  it("identifies due-today actions accurately", () => {
    const todayDate = new Date("2026-07-20T16:00:00.000Z").toISOString();
    const res = calculateDueState(todayDate, { now: mockNow });
    expect(res.dueState).toBe("due_today");
    expect(res.dueLabel).toContain("Today");
    expect(res.isOverdue).toBe(false);
  });

  it("identifies due-soon actions (within 7 days)", () => {
    const soonDate = new Date("2026-07-24T10:00:00.000Z").toISOString();
    const res = calculateDueState(soonDate, { now: mockNow });
    expect(res.dueState).toBe("due_soon");
    expect(res.dueLabel).toContain("In 4 days");
    expect(res.isOverdue).toBe(false);
  });
});
