import {
  AddBoqItemInput,
  BoqItem,
  ProjectBoqSnapshot,
  UpdateBoqItemInput,
} from "@/types/domain/project-boq";
import { createMockProjectBoq } from "../data/mock-project-boq";
import { calculateBoqAmount } from "../services/project-boq-calculations";
import { normalizeProjectBoqSnapshot } from "../utils/normalize-project-boq";
import {
  findBoqItemContext,
  recalculateBoqHierarchy,
} from "../utils/project-boq-hierarchy";
import { ProjectBoqRepository } from "./project-boq.repository";

function cloneSnapshot(snapshot: ProjectBoqSnapshot): ProjectBoqSnapshot {
  return structuredClone(snapshot);
}

export class MemoryProjectBoqRepository implements ProjectBoqRepository {
  private snapshots = new Map<string, ProjectBoqSnapshot>();

  constructor(initialSnapshot?: ProjectBoqSnapshot) {
    if (initialSnapshot) {
      const normalized = normalizeProjectBoqSnapshot(initialSnapshot);
      this.snapshots.set(normalized.projectId, cloneSnapshot(normalized));
    }
  }

  async getByProjectId(
    projectId: string,
    projectName: string,
    projectCode: string
  ): Promise<ProjectBoqSnapshot> {
    let snapshot = this.snapshots.get(projectId);

    if (!snapshot) {
      const rawMock = createMockProjectBoq(projectId, projectName, projectCode);
      snapshot = normalizeProjectBoqSnapshot(rawMock);
      this.snapshots.set(projectId, snapshot);
    }

    return cloneSnapshot(snapshot);
  }

  async updateItem(
    projectId: string,
    input: UpdateBoqItemInput
  ): Promise<BoqItem> {
    const snapshot = this.snapshots.get(projectId);
    if (!snapshot) {
      throw new Error("BOQ workspace not found.");
    }

    const version = snapshot.versions.find(
      (candidate) => candidate.id === input.versionId
    );
    if (!version) {
      throw new Error("BOQ version not found.");
    }
    if (version.isLocked) {
      throw new Error("Approved and reviewed BOQ versions are immutable.");
    }
    if (version.id !== snapshot.currentVersionId) {
      throw new Error("The selected BOQ version is not current.");
    }

    const context = findBoqItemContext(snapshot, input.itemId);
    if (!context) {
      throw new Error("BOQ item not found.");
    }

    const { section, subsection, item: existingItem } = context;
    const quantity =
      "quantity" in input ? input.quantity : existingItem.quantity;
    const rate = "rate" in input ? input.rate : existingItem.rate;
    const amount = calculateBoqAmount(quantity, rate);

    const updatedItem: BoqItem = {
      ...existingItem,
      quantity,
      rate,
      amount,
      status:
        amount === null
          ? "Needs attention"
          : existingItem.status === "Approved"
            ? "Approved"
            : "Draft",
      lastUpdatedAt: new Date().toISOString(),
      lastUpdatedBy: "Arjun Mehta",
    };

    if (subsection) {
      const idx = subsection.items.findIndex((i) => i.id === input.itemId);
      if (idx !== -1) {
        subsection.items[idx] = updatedItem;
      }
    } else {
      const idx = section.directItems.findIndex((i) => i.id === input.itemId);
      if (idx !== -1) {
        section.directItems[idx] = updatedItem;
      }
    }

    const recalculated = recalculateBoqHierarchy(snapshot);
    recalculated.updatedAt = updatedItem.lastUpdatedAt;
    this.snapshots.set(projectId, recalculated);

    return structuredClone(updatedItem);
  }

  async addItem(
    projectId: string,
    input: AddBoqItemInput
  ): Promise<BoqItem> {
    const snapshot = this.snapshots.get(projectId);
    if (!snapshot) {
      throw new Error("BOQ workspace not found.");
    }

    const currentVersion = snapshot.versions.find(
      (version) => version.id === snapshot.currentVersionId
    );
    if (!currentVersion || currentVersion.isLocked) {
      throw new Error("Items cannot be added to a locked BOQ version.");
    }

    const section = snapshot.sections.find(
      (candidate) => candidate.id === input.sectionId
    );
    if (!section) {
      throw new Error("BOQ section not found.");
    }

    let subsectionId: string | null = null;
    if (input.subsectionId) {
      const targetSub = section.subsections.find(
        (sub) => sub.id === input.subsectionId
      );
      if (!targetSub) {
        throw new Error(
          `BOQ subsection ${input.subsectionId} not found in section ${input.sectionId}.`
        );
      }
      subsectionId = targetSub.id;
    }

    const amount = calculateBoqAmount(input.quantity, input.rate);
    const now = new Date().toISOString();
    const newItem: BoqItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      sectionId: section.id,
      subsectionId,
      code: input.code,
      description: input.description,
      unit: input.unit,
      quantity: input.quantity ?? null,
      rate: input.rate ?? null,
      amount,
      status: amount === null ? "Needs attention" : "Draft",
      lastUpdatedAt: now,
      lastUpdatedBy: "Arjun Mehta",
    };

    if (subsectionId) {
      const targetSub = section.subsections.find((sub) => sub.id === subsectionId)!;
      targetSub.items.push(newItem);
    } else {
      section.directItems.push(newItem);
    }

    const recalculated = recalculateBoqHierarchy(snapshot);
    recalculated.updatedAt = now;
    this.snapshots.set(projectId, recalculated);

    return structuredClone(newItem);
  }
}
