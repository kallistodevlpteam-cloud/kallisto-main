import { StudioTaskStatus } from "@/types/domain/studio";

const VALID_TRANSITIONS: Record<StudioTaskStatus, StudioTaskStatus[]> = {
  draft: ["queued", "archived"],
  queued: ["processing", "failed", "archived"],
  processing: ["review_required", "failed", "draft"],
  review_required: ["approved", "changes_requested", "archived"],
  changes_requested: ["draft", "archived"],
  failed: ["queued", "draft", "archived"],
  approved: ["published", "superseded", "archived"],
  published: ["superseded", "archived"],
  superseded: ["archived"],
  archived: [],
};

export class StudioStatusMachine {
  static canTransition(from: StudioTaskStatus, to: StudioTaskStatus): boolean {
    if (from === to) return true;
    const allowed = VALID_TRANSITIONS[from];
    return Boolean(allowed && allowed.includes(to));
  }

  static validateTransition(from: StudioTaskStatus, to: StudioTaskStatus): void {
    if (!this.canTransition(from, to)) {
      throw new Error(`Invalid status transition from '${from}' to '${to}'`);
    }
  }
}
