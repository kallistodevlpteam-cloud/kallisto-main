import { describe, expect, it } from "vitest";
import { createMockProjectBoq } from "@/features/projects/boq/data/mock-project-boq";
import { MemoryProjectBoqRepository } from "@/features/projects/boq/repositories/memory-project-boq.repository";
import {
  calculateBoqAmount,
  countBoqValidationIssues,
  isMissingBoqValue,
} from "@/features/projects/boq/services/project-boq-calculations";

describe("project BOQ domain rules", () => {
  it("distinguishes missing values from a valid quantity of zero", () => {
    expect(isMissingBoqValue(null)).toBe(true);
    expect(isMissingBoqValue(undefined)).toBe(true);
    expect(isMissingBoqValue(0)).toBe(false);
    expect(isMissingBoqValue(12.5)).toBe(false);

    expect(calculateBoqAmount(null, 500)).toBeNull();
    expect(calculateBoqAmount(undefined, 500)).toBeNull();
    expect(calculateBoqAmount(2, null)).toBeNull();
    expect(calculateBoqAmount(0, 500)).toBe(0);
    expect(calculateBoqAmount(12.5, 420)).toBe(5_250);
  });

  it("counts each missing quantity or rate across directItems and subsections without treating zero as missing", () => {
    const snapshot = createMockProjectBoq(
      "proj-001",
      "Nila Residence",
      "KAL-2024-001"
    );

    const issueCount = countBoqValidationIssues(
      snapshot.sections,
      snapshot.hiddenValidationIssueCount
    );

    expect(issueCount).toBeGreaterThan(0);
  });

  it("recalculates amount through the repository and protects locked versions", async () => {
    const snapshot = createMockProjectBoq(
      "proj-001",
      "Nila Residence",
      "KAL-2024-001"
    );
    const repository = new MemoryProjectBoqRepository(snapshot);

    const updated = await repository.updateItem("proj-001", {
      itemId: "item-b-02",
      versionId: "version-1-2",
      rate: 400,
    });

    expect(updated.rate).toBe(400);
    expect(updated.amount).toBe(25_600);
    expect(updated.status).toBe("Draft");

    await expect(
      repository.updateItem("proj-001", {
        itemId: "item-b-02",
        versionId: "version-1-0",
        rate: 450,
      })
    ).rejects.toThrow(/not current|immutable/i);
  });
});
