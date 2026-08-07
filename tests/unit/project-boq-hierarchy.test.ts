import { describe, expect, it } from "vitest";
import { createMockProjectBoq } from "@/features/projects/boq/data/mock-project-boq";
import { normalizeProjectBoqSnapshot } from "@/features/projects/boq/utils/normalize-project-boq";
import {
  calculateSectionSubtotal,
  calculateSubsectionSubtotal,
  findBoqItemContext,
  getAllBoqItems,
  getSectionItemCount,
  getSectionItems,
  getSubsectionItemCount,
  recalculateBoqHierarchy,
} from "@/features/projects/boq/utils/project-boq-hierarchy";

describe("project BOQ hierarchy utilities", () => {
  it("normalizes legacy section.items to section.directItems immutably", () => {
    const legacySnapshot = {
      id: "legacy-boq",
      projectId: "proj-legacy",
      projectName: "Legacy Project",
      projectCode: "LEG-001",
      status: "Draft" as const,
      currentVersionId: "v1",
      baseTotal: 1000,
      sectionCount: 1,
      workItemCount: 1,
      hiddenValidationIssueCount: 0,
      updatedAt: "2026-07-26T09:30:00.000Z",
      versions: [],
      variations: [],
      rateAnalysis: [],
      sections: [
        {
          id: "sec-legacy",
          code: "LEG",
          title: "Legacy Section",
          itemCount: 1,
          subtotal: 1000,
          items: [
            {
              id: "item-leg-1",
              sectionId: "sec-legacy",
              code: "LEG.01",
              description: "Legacy Item",
              unit: "m²",
              quantity: 10,
              rate: 100,
              amount: 1000,
              status: "Approved" as const,
              lastUpdatedAt: "2026-07-26T09:30:00.000Z",
              lastUpdatedBy: "Admin",
            },
          ],
        },
      ],
    };

    const normalized = normalizeProjectBoqSnapshot(legacySnapshot);

    expect(normalized.sections[0].directItems.length).toBe(1);
    expect(normalized.sections[0].subsections.length).toBe(0);
    expect(normalized.sections[0].directItems[0].subsectionId).toBeNull();
    expect(legacySnapshot.sections[0]).not.toHaveProperty("directItems");
  });

  it("proves recalculateBoqHierarchy is strictly immutable", () => {
    const snapshot = createMockProjectBoq("proj-001", "Nila Residence", "KAL-2024-001");
    const original = structuredClone(snapshot);

    const result = recalculateBoqHierarchy(snapshot);

    expect(snapshot).toEqual(original);
    expect(result).not.toBe(snapshot);
  });

  it("calculates counts and subtotals accurately for direct, subsection, and mixed sections", () => {
    const snapshot = createMockProjectBoq("proj-001", "Nila Residence", "KAL-2024-001");

    // Section A: Subsections only
    const secA = snapshot.sections.find((s) => s.code === "Phase 1")!;
    expect(getSectionItemCount(secA)).toBe(7);
    expect(calculateSectionSubtotal(secA)).toBe(270_700);

    // Section B: Direct items only
    const secB = snapshot.sections.find((s) => s.code === "Phase 2")!;
    expect(getSectionItemCount(secB)).toBe(2);

    // Section D: True Mixed Hierarchy (directItems + subsections)
    const secD = snapshot.sections.find((s) => s.code === "Phase 4")!;
    expect(secD.directItems.length).toBe(2);
    expect(secD.subsections.length).toBe(1);

    const directCount = secD.directItems.length;
    const subCount = getSubsectionItemCount(secD.subsections[0]);
    expect(getSectionItemCount(secD)).toBe(directCount + subCount);
    expect(getSectionItemCount(secD)).toBe(4);

    const directSubtotal = secD.directItems.reduce(
      (acc, i) => (i.amount !== null ? acc + i.amount : acc),
      0
    );
    const subSubtotal = calculateSubsectionSubtotal(secD.subsections[0]);
    expect(calculateSectionSubtotal(secD)).toBe(directSubtotal + subSubtotal);
  });

  it("locates item context for both direct items and subsection items", () => {
    const snapshot = createMockProjectBoq("proj-001", "Nila Residence", "KAL-2024-001");

    // Direct item in Section D
    const directCtx = findBoqItemContext(snapshot, "item-d-dir-01");
    expect(directCtx).not.toBeNull();
    expect(directCtx?.section.code).toBe("Phase 4");
    expect(directCtx?.subsection).toBeNull();
    expect(directCtx?.item.code).toBe("P4.01-DIR");

    // Subsection item in Section D (P4.01.01)
    const subCtx = findBoqItemContext(snapshot, "item-d-01-01");
    expect(subCtx).not.toBeNull();
    expect(subCtx?.section.code).toBe("Phase 4");
    expect(subCtx?.subsection?.code).toBe("P4.01");
    expect(subCtx?.item.code).toBe("P4.01.01");
  });
});
