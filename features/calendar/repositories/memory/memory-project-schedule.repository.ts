import type { ProjectScheduleItem } from "@/types/domain/calendar";
import type {
  IProjectScheduleRepository,
  ScheduleFilterInput,
  CreateScheduleItemInput,
} from "../project-schedule.repository";
import { INITIAL_SCHEDULE_ITEMS_DATA } from "../../data/mock-calendar-data";

export class MemoryProjectScheduleRepository implements IProjectScheduleRepository {
  private items: Map<string, ProjectScheduleItem> = new Map();
  private idempotencyRegistry: Map<string, ProjectScheduleItem> = new Map();

  constructor(initialData: ProjectScheduleItem[] = INITIAL_SCHEDULE_ITEMS_DATA) {
    initialData.forEach((item) => this.items.set(item.id, { ...item }));
  }

  async listScheduleItems(filter?: ScheduleFilterInput): Promise<ProjectScheduleItem[]> {
    let result = Array.from(this.items.values());

    if (!filter) return result;

    if (filter.projectId) {
      result = result.filter((i) => i.projectId === filter.projectId);
    }
    if (filter.itemType) {
      result = result.filter((i) => i.itemType === filter.itemType);
    }
    if (filter.status) {
      result = result.filter((i) => i.status === filter.status);
    }
    if (filter.assigneeId) {
      result = result.filter((i) => i.assigneeId === filter.assigneeId);
    }

    return result;
  }

  async getScheduleItemById(id: string): Promise<ProjectScheduleItem | null> {
    const item = this.items.get(id);
    return item ? { ...item } : null;
  }

  async createScheduleItem(
    input: CreateScheduleItemInput,
    idempotencyKey?: string
  ): Promise<ProjectScheduleItem> {
    if (idempotencyKey && this.idempotencyRegistry.has(idempotencyKey)) {
      return { ...this.idempotencyRegistry.get(idempotencyKey)! };
    }

    const id = `sch-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newItem: ProjectScheduleItem = {
      id,
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      title: input.title,
      itemType: input.itemType,
      startDate: input.startDate,
      dueDate: input.dueDate,
      baselineStartDate: input.baselineStartDate,
      baselineDueDate: input.baselineDueDate,
      progress: input.progress ?? 0,
      status: input.status,
      assigneeId: input.assigneeId,
      dependencyIds: input.dependencyIds || [],
      blockerReason: input.blockerReason,
      linkedActivityIds: input.linkedActivityIds || [],
    };

    this.items.set(id, newItem);

    if (idempotencyKey) {
      this.idempotencyRegistry.set(idempotencyKey, newItem);
    }

    return { ...newItem };
  }

  async updateScheduleItem(
    id: string,
    patch: Partial<ProjectScheduleItem>
  ): Promise<ProjectScheduleItem> {
    const existing = this.items.get(id);
    if (!existing) {
      throw new Error(`Schedule item with id ${id} not found.`);
    }

    const updated: ProjectScheduleItem = {
      ...existing,
      ...patch,
      id: existing.id,
    };

    this.items.set(id, updated);
    return { ...updated };
  }

  async deleteScheduleItem(id: string): Promise<void> {
    this.items.delete(id);
  }
}
