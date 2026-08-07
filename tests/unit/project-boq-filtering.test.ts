import { describe, expect, it } from "vitest";
import { createMockProjectBoq } from "@/features/projects/boq/data/mock-project-boq";
import { filterAndSortBoqSections } from "@/features/projects/boq/utils/project-boq-filtering";

describe("project BOQ tree-aware filtering and sorting", () => {
  it("preserves parent section and subsection when item matches search query", () => {
    const snapshot = createMockProjectBoq("proj-001", "Nila Residence", "KAL-2024-001");

    // Search for "Crack repair" (item in Section Phase 4, Subsection P4.01)
    const filtered = filterAndSortBoqSections(
      snapshot.sections,
      "Crack repair",
      "all",
      "code"
    );

    expect(filtered.length).toBe(1);
    expect(filtered[0].code).toBe("Phase 4");
    expect(filtered[0].subsections.length).toBe(1);
    expect(filtered[0].subsections[0].code).toBe("P4.01");
    expect(filtered[0].subsections[0].items[0].description).toContain("Crack repair");
  });

  it("preserves parent section and items when subsection title matches search query", () => {
    const snapshot = createMockProjectBoq("proj-001", "Nila Residence", "KAL-2024-001");

    // Search for "Kitchen Unit" (matches Subsection P1.02 title)
    const filtered = filterAndSortBoqSections(
      snapshot.sections,
      "Kitchen Unit",
      "all",
      "code"
    );

    expect(filtered.length).toBe(1);
    expect(filtered[0].code).toBe("Phase 1");
    expect(filtered[0].subsections.some((sub) => sub.code === "P1.02")).toBe(true);
  });

  it("applies status filtering and removes empty subsections and sections", () => {
    const snapshot = createMockProjectBoq("proj-001", "Nila Residence", "KAL-2024-001");

    // Filter by 'issues' (Needs attention)
    const filtered = filterAndSortBoqSections(
      snapshot.sections,
      "",
      "issues",
      "code"
    );

    for (const sec of filtered) {
      for (const item of sec.directItems) {
        expect(item.status).toBe("Needs attention");
      }
      for (const sub of sec.subsections) {
        expect(sub.items.length).toBeGreaterThan(0);
        for (const item of sub.items) {
          expect(item.status).toBe("Needs attention");
        }
      }
    }
  });

  it("sorts items locally inside each group without flattening tree structure", () => {
    const snapshot = createMockProjectBoq("proj-001", "Nila Residence", "KAL-2024-001");

    const filtered = filterAndSortBoqSections(
      snapshot.sections,
      "",
      "all",
      "description"
    );

    // Section Phase 1 should still have its subsections
    const secA = filtered.find((s) => s.code === "Phase 1")!;
    expect(secA.subsections.length).toBeGreaterThan(0);

    // Items inside P1.01 should be sorted by description alphabetically
    const subA1Items = secA.subsections[0].items;
    for (let i = 0; i < subA1Items.length - 1; i++) {
      expect(
        subA1Items[i].description.localeCompare(subA1Items[i + 1].description)
      ).toBeLessThanOrEqual(0);
    }
  });
});
