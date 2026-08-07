import { ProjectStatus } from "../types/project.types";

export class InvalidStatusTransitionError extends Error {
  public fromStatus: ProjectStatus;
  public toStatus: ProjectStatus;
  public reasonCode: string;

  constructor(fromStatus: ProjectStatus, toStatus: ProjectStatus, message: string, reasonCode = "INVALID_TRANSITION") {
    super(message);
    this.name = "InvalidStatusTransitionError";
    this.fromStatus = fromStatus;
    this.toStatus = toStatus;
    this.reasonCode = reasonCode;
  }
}

export const ALLOWED_STATUS_TRANSITIONS: Record<ProjectStatus, ProjectStatus[]> = {
  UPCOMING: ["ACTIVE", "ON_HOLD", "CANCELLED"],
  ACTIVE: ["ON_HOLD", "COMPLETED", "CANCELLED"],
  ON_HOLD: ["ACTIVE", "CANCELLED", "ARCHIVED"],
  COMPLETED: ["ARCHIVED"], // Note: ACTIVE allowed only via explicit reopen transition check
  CANCELLED: ["ARCHIVED"],
  ARCHIVED: [],
};

export function isStatusTransitionAllowed(
  fromStatus: ProjectStatus,
  toStatus: ProjectStatus,
  options?: { hasReopenPermission?: boolean; reason?: string }
): boolean {
  if (fromStatus === toStatus) return true;

  if (fromStatus === "COMPLETED" && toStatus === "ACTIVE") {
    return Boolean(options?.hasReopenPermission && options?.reason && options.reason.trim().length >= 5);
  }

  const allowedNext = ALLOWED_STATUS_TRANSITIONS[fromStatus] || [];
  return allowedNext.includes(toStatus);
}

export function validateStatusTransition(
  fromStatus: ProjectStatus,
  toStatus: ProjectStatus,
  options?: { hasReopenPermission?: boolean; reason?: string }
): void {
  if (fromStatus === toStatus) {
    return;
  }

  if (fromStatus === "ARCHIVED") {
    throw new InvalidStatusTransitionError(
      fromStatus,
      toStatus,
      "Archived projects are in a terminal state and cannot be directly transitioned.",
      "TERMINAL_STATE"
    );
  }

  if (fromStatus === "COMPLETED" && toStatus === "ACTIVE") {
    if (!options?.hasReopenPermission) {
      throw new InvalidStatusTransitionError(
        fromStatus,
        toStatus,
        "Reopening a completed project requires explicit 'projects.reopen' permission.",
        "PERMISSION_DENIED"
      );
    }
    if (!options?.reason || options.reason.trim().length < 5) {
      throw new InvalidStatusTransitionError(
        fromStatus,
        toStatus,
        "Reopening a completed project requires a valid reason of at least 5 characters.",
        "REASON_REQUIRED"
      );
    }
    return;
  }

  const allowedNext = ALLOWED_STATUS_TRANSITIONS[fromStatus] || [];
  if (!allowedNext.includes(toStatus)) {
    throw new InvalidStatusTransitionError(
      fromStatus,
      toStatus,
      `Cannot transition project from '${fromStatus}' to '${toStatus}'.`,
      "INVALID_TRANSITION"
    );
  }
}
