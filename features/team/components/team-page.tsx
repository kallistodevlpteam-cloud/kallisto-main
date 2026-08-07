"use client";

import {
  AlertTriangle,
  CheckCircle2,
  LockKeyhole,
  RefreshCw,
  UserPlus,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { RoutePageContainer } from "@/components/ui/route-page-container";
import { getTeamWorkspaceMock } from "../services/team.mock";
import type {
  Invitation,
  InviteMemberInput,
  MemberAction,
  PermissionKey,
  ProjectAccess,
  TeamMember,
  TeamMemberFilters,
  TeamPageViewState,
} from "../types/team.types";
import { filterTeamMembers } from "../utils/filter-team-members";
import { InviteMemberDrawer } from "./invite-member-drawer";
import { PendingInvitationsCard } from "./pending-invitations-card";
import { ProjectAccessTable } from "./project-access-table";
import { RolesPermissionsCard } from "./roles-permissions-card";
import { TeamMemberList } from "./team-member-list";
import { TeamSummaryStrip } from "./team-summary-strip";
import styles from "./team-page.module.css";

interface TeamPageProps {
  initialViewState?: TeamPageViewState;
}

const DEFAULT_FILTERS: TeamMemberFilters = {
  query: "",
  role: "all",
  projectId: "all",
  status: "all",
};

function TeamPageSkeleton() {
  return (
    <div className={styles.teamStack} aria-label="Loading team workspace">
      <div className={`${styles.skeleton} ${styles.summarySkeleton}`} />
      <div className={styles.skeletonGrid}>
        <div className={`${styles.skeleton} ${styles.membersSkeleton}`} />
        <div className={styles.skeletonRail}>
          <div className={`${styles.skeleton} ${styles.utilitySkeleton}`} />
          <div className={`${styles.skeleton} ${styles.utilitySkeleton}`} />
        </div>
      </div>
    </div>
  );
}

function TeamPageState({
  variant,
  onRetry,
}: {
  variant: "error" | "forbidden";
  onRetry?: () => void;
}) {
  const isError = variant === "error";
  const Icon = isError ? AlertTriangle : LockKeyhole;

  return (
    <section className={styles.pageState}>
      <span aria-hidden="true">
        <Icon size={20} />
      </span>
      <h2>{isError ? "Team could not be loaded" : "Team access is restricted"}</h2>
      <p>
        {isError
          ? "The workspace data is temporarily unavailable. Retry the request."
          : "Your workspace role does not allow access to team permissions."}
      </p>
      {isError && onRetry ? (
        <button type="button" className={styles.secondaryButton} onClick={onRetry}>
          <RefreshCw size={14} />
          Retry
        </button>
      ) : null}
    </section>
  );
}

export function TeamPage({ initialViewState = "ready" }: TeamPageProps) {
  const [workspace] = useState(getTeamWorkspaceMock);
  const [viewState, setViewState] = useState(initialViewState);
  const [members] = useState(workspace.members);
  const [invitations, setInvitations] = useState(workspace.invitations);
  const [projectAccess, setProjectAccess] = useState(workspace.projectAccess);
  const [filters, setFilters] = useState<TeamMemberFilters>(DEFAULT_FILTERS);
  const [selectedProjectId, setSelectedProjectId] = useState(
    workspace.projects[0]?.id ?? "",
  );
  const [inviteOpen, setInviteOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const filteredMembers = useMemo(
    () => filterTeamMembers(members, filters),
    [filters, members],
  );

  const activeNowCount = members.filter((member) => member.activeNow).length;
  const availableSeats = Math.max(
    0,
    workspace.seatCapacity - members.length - invitations.length,
  );

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const handleInvite = (input: InviteMemberInput) => {
    const invitation: Invitation = {
      id: `invite-${Date.now()}`,
      email: input.email,
      role: input.role || "Viewer",
      invitedAtLabel: "Invited just now",
      expiresLabel: "Expires in 7 days",
      projectAccess: input.projectAccess,
      selectedProjectIds:
        input.projectAccess === "all"
          ? workspace.projects.map((project) => project.id)
          : input.selectedProjectIds,
    };

    setInvitations((current) => [invitation, ...current]);
    setInviteOpen(false);
    setToast(`Invitation sent to ${invitation.email}.`);
  };

  const handleMemberAction = (
    member: TeamMember,
    action: MemberAction,
  ) => {
    if (action === "manage_project_access") {
      document
        .getElementById("team-project-access")
        ?.scrollIntoView({ behavior: "auto", block: "start" });
      setToast(`Reviewing project access for ${member.name}.`);
      return;
    }

    const actionLabels: Record<MemberAction, string> = {
      view_profile: "Profile selected",
      edit_role: "Role editor selected",
      manage_project_access: "Project access selected",
      deactivate: "Deactivation selected",
      remove: "Removal selected",
    };
    setToast(`${actionLabels[action]} for ${member.name}.`);
  };

  const handlePermissionChange = (
    memberId: string,
    permission: PermissionKey,
    enabled: boolean,
  ) => {
    setProjectAccess((current) =>
      current.map((entry): ProjectAccess => {
        if (
          entry.memberId !== memberId ||
          entry.projectId !== selectedProjectId ||
          entry.permissions[permission].locked
        ) {
          return entry;
        }

        return {
          ...entry,
          permissions: {
            ...entry.permissions,
            [permission]: {
              ...entry.permissions[permission],
              enabled,
            },
          },
        };
      }),
    );
  };

  return (
    <>
      <RoutePageContainer
        title="Team"
        description="Manage studio team members, roles, and project permissions."
        primaryActionLabel="Invite member"
        primaryActionIcon={UserPlus}
        onPrimaryAction={() => setInviteOpen(true)}
      >
        {viewState === "loading" ? <TeamPageSkeleton /> : null}
        {viewState === "error" ? (
          <TeamPageState variant="error" onRetry={() => setViewState("ready")} />
        ) : null}
        {viewState === "forbidden" ? (
          <TeamPageState variant="forbidden" />
        ) : null}

        {viewState === "ready" ? (
          <div className={styles.teamStack}>
            <TeamSummaryStrip
              items={[
                { label: "Team members", value: members.length },
                { label: "Active now", value: activeNowCount },
                { label: "Pending invites", value: invitations.length },
                { label: "Available seats", value: availableSeats },
              ]}
            />

            <div className={styles.mainGrid}>
              <TeamMemberList
                members={filteredMembers}
                totalMembers={members.length}
                projects={workspace.projects}
                filters={filters}
                onFiltersChange={setFilters}
                onClearFilters={() => setFilters(DEFAULT_FILTERS)}
                onMemberAction={handleMemberAction}
              />

              <aside className={styles.utilityColumn}>
                <PendingInvitationsCard
                  invitations={invitations}
                  onInvite={() => setInviteOpen(true)}
                  onResend={(invitationId) => {
                    setInvitations((current) =>
                      current.map((invitation) =>
                        invitation.id === invitationId
                          ? {
                              ...invitation,
                              invitedAtLabel: "Invited just now",
                              expiresLabel: "Expires in 7 days",
                            }
                          : invitation,
                      ),
                    );
                    setToast("Invitation resent.");
                  }}
                  onRevoke={(invitationId) => {
                    setInvitations((current) =>
                      current.filter(
                        (invitation) => invitation.id !== invitationId,
                      ),
                    );
                    setToast("Invitation revoked.");
                  }}
                />
                <RolesPermissionsCard
                  roles={workspace.roleSummaries}
                  onManageRoles={() =>
                    setToast("Role management selected.")
                  }
                />
              </aside>
            </div>

            <div id="team-project-access">
              <ProjectAccessTable
                projects={workspace.projects}
                members={members}
                access={projectAccess}
                selectedProjectId={selectedProjectId}
                onProjectChange={setSelectedProjectId}
                onPermissionChange={handlePermissionChange}
              />
            </div>
          </div>
        ) : null}
      </RoutePageContainer>

      {inviteOpen ? (
        <InviteMemberDrawer
          members={members}
          invitations={invitations}
          projects={workspace.projects}
          onClose={() => setInviteOpen(false)}
          onSubmit={handleInvite}
        />
      ) : null}

      {toast ? (
        <div className={styles.toast} role="status" aria-live="polite">
          <CheckCircle2 size={16} />
          <span>{toast}</span>
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => setToast(null)}
          >
            <X size={14} />
          </button>
        </div>
      ) : null}
    </>
  );
}
