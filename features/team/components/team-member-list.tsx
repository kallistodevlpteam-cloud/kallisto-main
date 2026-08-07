import type {
  MemberAction,
  ProjectSummary,
  TeamMember,
  TeamMemberFilters,
} from "../types/team.types";
import { TeamEmptyState } from "./team-empty-state";
import { TeamFilterToolbar } from "./team-filter-toolbar";
import { TeamMemberMobileCard } from "./team-member-mobile-card";
import { TeamMemberRow } from "./team-member-row";
import styles from "./team-page.module.css";

interface TeamMemberListProps {
  members: TeamMember[];
  totalMembers: number;
  projects: ProjectSummary[];
  filters: TeamMemberFilters;
  onFiltersChange: (filters: TeamMemberFilters) => void;
  onClearFilters: () => void;
  onMemberAction: (member: TeamMember, action: MemberAction) => void;
}

export function TeamMemberList({
  members,
  totalMembers,
  projects,
  filters,
  onFiltersChange,
  onClearFilters,
  onMemberAction,
}: TeamMemberListProps) {
  return (
    <section className={`${styles.card} ${styles.membersCard}`}>
      <header className={styles.cardHeader}>
        <div>
          <h2>Team members</h2>
          <p>People with access to Arjun Architects.</p>
        </div>
        <span className={styles.headerCount}>{totalMembers} members</span>
      </header>

      <TeamFilterToolbar
        filters={filters}
        projects={projects}
        onChange={onFiltersChange}
      />

      {members.length > 0 ? (
        <>
          <div
            className={styles.membersTable}
            role="grid"
            aria-label="Workspace members"
          >
            <div className={styles.memberTableHeader} role="row">
              <div role="columnheader">Member</div>
              <div role="columnheader">Role</div>
              <div role="columnheader">Projects</div>
              <div role="columnheader">Workload</div>
              <div role="columnheader">Last active</div>
              <div role="columnheader">Status</div>
              <div role="columnheader">
                <span className="sr-only">Actions</span>
              </div>
            </div>
            <div className={styles.memberTableBody}>
              {members.map((member) => (
                <TeamMemberRow
                  key={member.id}
                  member={member}
                  onAction={onMemberAction}
                />
              ))}
            </div>
          </div>

          <div className={styles.mobileMemberList} aria-label="Workspace members">
            {members.map((member) => (
              <TeamMemberMobileCard
                key={member.id}
                member={member}
                onAction={onMemberAction}
              />
            ))}
          </div>
        </>
      ) : (
        <TeamEmptyState
          title="No members found"
          description="Try a different search or clear the active filters."
          actionLabel="Clear filters"
          onAction={onClearFilters}
          variant="search"
        />
      )}
    </section>
  );
}
