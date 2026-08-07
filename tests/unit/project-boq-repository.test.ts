import { describe, expect, it } from "vitest";
import { createMockProjectBoq } from "@/features/projects/boq/data/mock-project-boq";
import { MemoryProjectBoqRepository } from "@/features/projects/boq/repositories/memory-project-boq.repository";

describe("project BOQ memory repository", () => {
  it("updates direct items and subsection items while recalculating derived values", async () => {
    const snapshot = createMockProjectBoq("proj-001", "Nila Residence", "KAL-2024-001");
    const repository = new MemoryProjectBoqRepository(snapshot);

    // Update subsection item (A.01.02)
    const updatedSubItem = await repository.updateItem("proj-001", {
      itemId: "item-a-01-02",
      versionId: "version-1-2",
      quantity: 100,
      rate: 800,
    });
    expect(updatedSubItem.quantity).toBe(100);
    expect(updatedSubItem.rate).toBe(800);
    expect(updatedSubItem.amount).toBe(80_000);

    // Update direct item (B.02)
    const updatedDirItem = await repository.updateItem("proj-001", {
      itemId: "item-b-02",
      versionId: "version-1-2",
      rate: 500,
    });
    expect(updatedDirItem.rate).toBe(500);
    expect(updatedDirItem.amount).toBe(32_000);
  });

  it("adds direct items and subsection items to current version and rejects invalid subsection IDs", async () => {
    const snapshot = createMockProjectBoq("proj-001", "Nila Residence", "KAL-2024-001");
    const repository = new MemoryProjectBoqRepository(snapshot);

    // Add direct item to Section B
    const newDirItem = await repository.addItem("proj-001", {
      sectionId: "section-b",
      code: "B.03",
      description: "Compaction of backfill soil",
      unit: "m³",
      quantity: 64,
      rate: 150,
    });
    expect(newDirItem.sectionId).toBe("section-b");
    expect(newDirItem.subsectionId).toBeNull();
    expect(newDirItem.amount).toBe(9_600);

    // Add subsection item to Section A (sub-a-01)
    const newSubItem = await repository.addItem("proj-001", {
      sectionId: "section-a",
      subsectionId: "sub-a-01",
      code: "A.01.05",
      description: "Disinfect bathroom surface after demolition",
      unit: "LS",
      quantity: 1,
      rate: 5_000,
    });
    expect(newSubItem.sectionId).toBe("section-a");
    expect(newSubItem.subsectionId).toBe("sub-a-01");
    expect(newSubItem.amount).toBe(5_000);

    // Reject invalid subsection ID belonging to another section
    await expect(
      repository.addItem("proj-001", {
        sectionId: "section-b",
        subsectionId: "sub-a-01",
        code: "B.04",
        description: "Invalid cross section assignment",
        unit: "LS",
      })
    ).rejects.toThrow(/not found in section section-b/i);
  });

  it("rejects mutations on locked versions", async () => {
    const snapshot = createMockProjectBoq("proj-001", "Nila Residence", "KAL-2024-001");
    const repository = new MemoryProjectBoqRepository(snapshot);

    await expect(
      repository.updateItem("proj-001", {
        itemId: "item-a-01-01",
        versionId: "version-1-0",
        rate: 900,
      })
    ).rejects.toThrow(/immutable/i);
  });
});
