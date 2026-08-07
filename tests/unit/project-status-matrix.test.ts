import { describe, expect, it } from "vitest";
import {
  isStatusTransitionAllowed,
  validateStatusTransition,
  InvalidStatusTransitionError,
} from "@/features/projects/utils/project-status-matrix";

describe("Project Status Transition Matrix & Governance", () => {
  it("allows valid forward lifecycle status transitions", () => {
    expect(isStatusTransitionAllowed("UPCOMING", "ACTIVE")).toBe(true);
    expect(isStatusTransitionAllowed("UPCOMING", "ON_HOLD")).toBe(true);
    expect(isStatusTransitionAllowed("UPCOMING", "CANCELLED")).toBe(true);
    expect(isStatusTransitionAllowed("ACTIVE", "ON_HOLD")).toBe(true);
    expect(isStatusTransitionAllowed("ACTIVE", "COMPLETED")).toBe(true);
    expect(isStatusTransitionAllowed("ON_HOLD", "ACTIVE")).toBe(true);
    expect(isStatusTransitionAllowed("COMPLETED", "ARCHIVED")).toBe(true);
  });

  it("rejects invalid status transitions with InvalidStatusTransitionError", () => {
    expect(() => validateStatusTransition("COMPLETED", "UPCOMING")).toThrow(
      InvalidStatusTransitionError
    );
    expect(() => validateStatusTransition("ARCHIVED", "ACTIVE")).toThrow(
      /terminal state/i
    );
  });

  it("permits COMPLETED -> ACTIVE only through explicit projects.reopen permission and valid reason", () => {
    // Missing permission
    expect(
      isStatusTransitionAllowed("COMPLETED", "ACTIVE", {
        hasReopenPermission: false,
        reason: "Client expanded scope for Phase 2",
      })
    ).toBe(false);

    // Reason under 5 chars (e.g. "abc")
    expect(
      isStatusTransitionAllowed("COMPLETED", "ACTIVE", {
        hasReopenPermission: true,
        reason: "abc",
      })
    ).toBe(false);

    // Valid permission and reason >= 5 chars
    expect(
      isStatusTransitionAllowed("COMPLETED", "ACTIVE", {
        hasReopenPermission: true,
        reason: "Client signed Phase 2 extension contract.",
      })
    ).toBe(true);

    expect(() =>
      validateStatusTransition("COMPLETED", "ACTIVE", {
        hasReopenPermission: true,
        reason: "Client signed Phase 2 extension contract.",
      })
    ).not.toThrow();
  });
});
