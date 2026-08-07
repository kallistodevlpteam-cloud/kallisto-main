import type {
  PermissionGrant,
  PermissionKey,
  WorkspaceRole,
} from "../types/team.types";

export const PERMISSION_KEYS: readonly PermissionKey[] = [
  "view",
  "edit",
  "files",
  "finance",
  "admin",
];

type PermissionDefaults = Record<PermissionKey, boolean>;

const CONTRIBUTOR_DEFAULTS: PermissionDefaults = {
  view: true,
  edit: true,
  files: true,
  finance: false,
  admin: false,
};

const ROLE_DEFAULTS: Record<WorkspaceRole, PermissionDefaults> = {
  "Workspace Owner": {
    view: true,
    edit: true,
    files: true,
    finance: true,
    admin: true,
  },
  Admin: {
    view: true,
    edit: true,
    files: true,
    finance: true,
    admin: true,
  },
  "Project Manager": {
    view: true,
    edit: true,
    files: true,
    finance: false,
    admin: false,
  },
  Architect: CONTRIBUTOR_DEFAULTS,
  "Interior Designer": CONTRIBUTOR_DEFAULTS,
  "Quantity Surveyor": CONTRIBUTOR_DEFAULTS,
  Contributor: CONTRIBUTOR_DEFAULTS,
  Finance: {
    view: true,
    edit: false,
    files: true,
    finance: false,
    admin: false,
  },
  Viewer: {
    view: true,
    edit: false,
    files: false,
    finance: false,
    admin: false,
  },
};

const OVERRIDABLE_PERMISSIONS: Record<WorkspaceRole, readonly PermissionKey[]> = {
  "Workspace Owner": [],
  Admin: [],
  "Project Manager": ["view", "edit", "files", "finance"],
  Architect: ["view", "edit", "files"],
  "Interior Designer": ["view", "edit", "files"],
  "Quantity Surveyor": ["view", "edit", "files", "finance"],
  Contributor: ["view", "edit", "files"],
  Finance: ["view", "files", "finance"],
  Viewer: ["view", "files"],
};

export function getRolePermissionDefaults(
  role: WorkspaceRole,
): PermissionDefaults {
  return { ...ROLE_DEFAULTS[role] };
}

export function canOverridePermission(
  role: WorkspaceRole,
  permission: PermissionKey,
): boolean {
  if (role === "Viewer" && permission === "edit") {
    return false;
  }

  return OVERRIDABLE_PERMISSIONS[role].includes(permission);
}

export function buildProjectPermissions(
  role: WorkspaceRole,
  overrides: Partial<Record<PermissionKey, boolean>> = {},
): Record<PermissionKey, PermissionGrant> {
  const defaults = getRolePermissionDefaults(role);

  return PERMISSION_KEYS.reduce<Record<PermissionKey, PermissionGrant>>(
    (permissions, permission) => {
      const hasAllowedOverride =
        Object.prototype.hasOwnProperty.call(overrides, permission) &&
        canOverridePermission(role, permission);

      permissions[permission] = hasAllowedOverride
        ? {
            enabled: Boolean(overrides[permission]),
            source: "project_override",
            locked: false,
          }
        : {
            enabled: defaults[permission],
            source: "workspace_role",
            locked: true,
          };

      return permissions;
    },
    {} as Record<PermissionKey, PermissionGrant>,
  );
}
