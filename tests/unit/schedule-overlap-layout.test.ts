import { describe, expect, it } from "vitest";
import { layoutOverlappingActivities } from "@/features/projects/components/schedule/schedule-overlap-layout";

describe("schedule overlap layout", () => {
  it("places overlapping events in side-by-side columns", () => {
    const layout = layoutOverlappingActivities([
      { id: "a", startTime: "09:00", endTime: "11:00" },
      { id: "b", startTime: "10:00", endTime: "12:00" },
      { id: "c", startTime: "10:30", endTime: "11:30" },
    ]);

    expect(layout.a).toEqual({ columnIndex: 0, columnCount: 3 });
    expect(layout.b).toEqual({ columnIndex: 1, columnCount: 3 });
    expect(layout.c).toEqual({ columnIndex: 2, columnCount: 3 });
  });

  it("reuses a column after an event ends", () => {
    const layout = layoutOverlappingActivities([
      { id: "a", startTime: "09:00", endTime: "10:00" },
      { id: "b", startTime: "09:30", endTime: "11:00" },
      { id: "c", startTime: "10:00", endTime: "10:30" },
    ]);

    expect(layout.a.columnIndex).toBe(0);
    expect(layout.b.columnIndex).toBe(1);
    expect(layout.c.columnIndex).toBe(0);
    expect(layout.c.columnCount).toBe(2);
  });

  it("keeps non-overlapping events full width", () => {
    const layout = layoutOverlappingActivities([
      { id: "a", startTime: "09:00", endTime: "10:00" },
      { id: "b", startTime: "10:00", endTime: "11:00" },
    ]);

    expect(layout.a.columnCount).toBe(1);
    expect(layout.b.columnCount).toBe(1);
  });
});
