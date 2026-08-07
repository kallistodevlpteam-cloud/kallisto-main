"use client";

import { LockKeyhole, Search, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import type {
  PermissionGrant,
  PermissionKey,
  ProjectAccess,
  ProjectSummary,
  TeamMember,
} from "../types/team.types";
import { PERMISSION_KEYS } from "../utils/team-permission-rules";
import { TeamEmptyState } from "./team-empty-state";
import styles from "./team-page.module.css";

interface ProjectAccessTableProps {
  projects: ProjectSummary[];
  members: TeamMember[];
  access: ProjectAccess[];
  selectedProjectId: string;
  onProjectChange: (projectId: string) => void;
  onPermissionChange: (
    memberId: string,
    permission: PermissionKey,
    enabled: boolean,
  ) => void;
}

const PERMISSION_LABELS: Record<PermissionKey, string> = {
  view: "View",
  edit: "Edit",
  files: "Files",
  finance: "Finance",
  admin: "Admin",
};

interface PermissionControlProps {
  member: TeamMember;
  permission: PermissionKey;
  grant: PermissionGrant;
  editable: boolean;
  onChange: (enabled: boolean) => void;
}

function PermissionControl({
  member,
  permission,
  grant,
  editable,
  onChange,
}: PermissionControlProps) {
  const label = PERMISSION_LABELS[permission];
  const disabled = !editable || grant.locked;

  return (
    <span className={styles.permissionControl}>
      <input
        type="checkbox"
        aria-label={`${member.name} ${label} permission`}
        checked={grant.enabled}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
      {grant.locked ? (
        <span
          className={styles.inheritedIndicator}
          title="Inherited from role"
          aria-label="Inherited from role"
        >
          <LockKeyhole size={11} />
        </span>
      ) : null}
    </span>
  );
}

export function ProjectAccessTable({
  projects,
  members,
  access,
  selectedProjectId,
  onProjectChange,
  onPermissionChange,
}: ProjectAccessTableProps) {
  const [memberSearch, setMemberSearch] = useState("");
  const [isManaging, setIsManaging] = useState(false);

  const visibleAccess = useMemo(() => {
    const normalizedQuery = memberSearch.trim().toLocaleLowerCase();
    return access
      .filter((entry) => entry.projectId === selectedProjectId)
      .filter((entry) => {
        const member = members.find((candidate) => candidate.id === entry.memberId);
        if (!member) return false;
        return (
          !normalizedQuery ||
          `${member.name} ${member.email}`
            .toLocaleLowerCase()
            .includes(normalizedQuery)
        );
      });
  }, [access, memberSearch, members, selectedProjectId]);

  const selectedProject = projects.find(
    (project) => project.id === selectedProjectId,
  );

  return (
    <section className={`${styles.card} ${styles.projectAccessCard}`}>
      <header className={`${styles.cardHeader} ${styles.projectAccessHeader}`}>
        <div>
          <h2>Project access</h2>
          <p>Control member permissions for individual projects.</p>
        </div>
        <div className={styles.projectAccessControls}>
          <label className={styles.projectSelector}>
            <span className="sr-only">Project</span>
            <select
              aria-label="Project selector"
              value={selectedProjectId}
              onChange={(event) => {
                onProjectChange(event.target.value);
                setMemberSearch("");
                setIsManaging(false);
              }}
            >
              <option value="">Select a project</option>
              {projects.map((project) => (
                <option value={project.id} key={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.projectMemberSearch}>
            <Search size={14} aria-hidden="true" />
            <span className="sr-only">Search project members</span>
            <input
              type="search"
              placeholder="Search members"
              value={memberSearch}
              onChange={(event) => setMemberSearch(event.target.value)}
              disabled={!selectedProject}
            />
          </label>
          <button
            type="button"
            className={isManaging ? styles.secondaryButton : styles.primaryButton}
            disabled={!selectedProject || visibleAccess.length === 0}
            aria-pressed={isManaging}
            onClick={() => setIsManaging((current) => !current)}
          >
            <ShieldCheck size={15} />
            {isManaging ? "Done managing" : "Manage access"}
          </button>
        </div>
      </header>

      {!selectedProject ? (
        <TeamEmptyState
          title="Select a project"
          description="Choose a project to review its member permissions."
        />
      ) : visibleAccess.length === 0 ? (
        <TeamEmptyState
          title={memberSearch ? "No project members found" : "No members assigned"}
          description={
            memberSearch
              ? "Try a different member name or email."
              : "Assign a workspace member before configuring permissions."
          }
          actionLabel={memberSearch ? "Clear search" : undefined}
          onAction={memberSearch ? () => setMemberSearch("") : undefined}
          variant={memberSearch ? "search" : "members"}
        />
      ) : (
        <>
          <div
            className={styles.permissionTable}
            role="grid"
            aria-label={`${selectedProject.name} project permissions`}
          >
            <div className={styles.permissionHeader} role="row">
              <div role="columnheader">Member</div>
              <div role="columnheader">Project role</div>
              {PERMISSION_KEYS.map((permission) => (
                <div role="columnheader" key={permission}>
                  {PERMISSION_LABELS[permission]}
                </div>
              ))}
            </div>

            <div>
              {visibleAccess.map((entry) => {
                const member = members.find(
                  (candidate) => candidate.id === entry.memberId,
                );
                if (!member) return null;

                return (
                  <div className={styles.permissionRow} role="row" key={member.id}>
                    <div className={styles.permissionMember} role="gridcell">
                      <strong>{member.name}</strong>
                      <small>{member.email}</small>
                    </div>
                    <div className={styles.projectRoleCell} role="gridcell">
                      {entry.projectRole}
                    </div>
                    {PERMISSION_KEYS.map((permission) => (
                      <div role="gridcell" key={permission}>
                        <PermissionControl
                          member={member}
                          permission={permission}
                          grant={entry.permissions[permission]}
                          editable={isManaging}
                          onChange={(enabled) =>
                            onPermissionChange(member.id, permission, enabled)
                          }
                        />
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>

          <div className={styles.mobilePermissionList}>
            {visibleAccess.map((entry) => {
              const member = members.find(
                (candidate) => candidate.id === entry.memberId,
              );
              if (!member) return null;

              return (
                <details className={styles.permissionPanel} key={member.id}>
                  <summary>
                    <span>
                      <strong>{member.name}</strong>
                      <small>{entry.projectRole}</small>
                    </span>
                  </summary>
                  <div className={styles.permissionPanelBody}>
                    {PERMISSION_KEYS.map((permission) => (
                      <label key={permission}>
                        <span>{PERMISSION_LABELS[permission]}</span>
                        <PermissionControl
                          member={member}
                          permission={permission}
                          grant={entry.permissions[permission]}
                          editable={isManaging}
                          onChange={(enabled) =>
                            onPermissionChange(member.id, permission, enabled)
                          }
                        />
                      </label>
                    ))}
                  </div>
                </details>
              );
            })}
          </div>
        </>
      )}

      {selectedProject && visibleAccess.length > 0 ? (
        <footer className={styles.permissionLegend}>
          <LockKeyhole size={12} />
          <span>Locked permissions are inherited from the workspace role.</span>
        </footer>
      ) : null}
    </section>
  );
}
