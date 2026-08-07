import { describe, expect, it } from "vitest";
import { createMockProjectBoq } from "@/features/projects/boq/data/mock-project-boq";
import { buildBoqExportRows } from "@/features/projects/boq/utils/project-boq-export";

describe("project BOQ export builder", () => {
  it("builds canonical CSV rows for full BOQ snapshot", () => {
    const snapshot = createMockProjectBoq("proj-001", "Nila Residence", "KAL-2024-001");
    const rows = buildBoqExportRows(snapshot);

    // Header row check
    expect(rows[0]).toEqual([
      "Section Code",
      "Section Title",
      "Subsection Code",
      "Subsection Title",
      "Item Code",
      "Item Description",
      "Unit",
      "Quantity",
      "Rate",
      "Amount",
      "Status",
      "Version",
    ]);

    // Total rows = header + all work items
    expect(rows.length).toBe(1 + snapshot.workItemCount);

    // Check direct item row (Section Phase 2)
    const directRow = rows.find((r) => r[4] === "P2.01");
    expect(directRow).toBeDefined();
    expect(directRow?.[0]).toBe("Phase 2");
    expect(directRow?.[2]).toBe(""); // Subsection Code empty
    expect(directRow?.[3]).toBe(""); // Subsection Title empty

    // Check subsection item row (Section Phase 1, Subsection P1.01, Item P1.01.01)
    const subRow = rows.find((r) => r[4] === "P1.01.01");
    expect(subRow).toBeDefined();
    expect(subRow?.[0]).toBe("Phase 1");
    expect(subRow?.[2]).toBe("P1.01");
    expect(subRow?.[3]).toBe("Bathroom Demolition of Existing Fixtures & Finishes");
  });

  it("exports only selected work items when selectedItemIds set is provided", () => {
    const snapshot = createMockProjectBoq("proj-001", "Nila Residence", "KAL-2024-001");
    const selected = new Set(["item-a-01-01", "item-b-01"]);

    const rows = buildBoqExportRows(snapshot, selected);

    expect(rows.length).toBe(3); // Header + 2 selected items
    expect(rows[1][4]).toBe("P1.01.01");
    expect(rows[2][4]).toBe("P2.01");
  });
});
