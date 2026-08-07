import { describe, expect, it } from "vitest";
import {
  buildProjectPermissions,
  canOverridePermission,
  getRolePermissionDefaults,
} from "./team-permission-rules";

describe("team permission rules", () => {
  it("keeps workspace owner permissions enabled and inherited", () => {
    const permissions = buildProjectPermissions("Workspace Owner", {
      edit: false,
      finance: false,
    });

    expect(Object.values(permissions).every((grant) => grant.enabled)).toBe(true);
    expect(Object.values(permissions).every((grant) => grant.locked)).toBe(true);
    expect(
      Object.values(permissions).every(
        (grant) => grant.source === "workspace_role",
      ),
    ).toBe(true);
  });

  it("never allows a Viewer to edit", () => {
    const permissions = buildProjectPermissions("Viewer", { edit: true });

    expect(canOverridePermission("Viewer", "edit")).toBe(false);
    expect(permissions.edit).toEqual({
      enabled: false,
      source: "workspace_role",
      locked: true,
    });
  });

  it("requires an explicit project override for Finance access", () => {
    const defaults = getRolePermissionDefaults("Finance");
    const permissions = buildProjectPermissions("Finance", { finance: true });

    expect(defaults.finance).toBe(false);
    expect(permissions.finance).toEqual({
      enabled: true,
      source: "project_override",
      locked: false,
    });
  });
});
