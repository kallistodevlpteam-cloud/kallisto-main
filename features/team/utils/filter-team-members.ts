import type { TeamMember, TeamMemberFilters } from "../types/team.types";

function normalizeSearchValue(value: string): string {
  return value.trim().toLocaleLowerCase().replace(/\s+/g, " ");
}

export function filterTeamMembers(
  members: TeamMember[],
  filters: TeamMemberFilters,
): TeamMember[] {
  const queryTokens = normalizeSearchValue(filters.query).split(" ").filter(Boolean);

  return members.filter((member) => {
    const searchableText = normalizeSearchValue(
      `${member.name} ${member.email} ${member.role}`,
    );
    const matchesQuery = queryTokens.every((token) => searchableText.includes(token));
    const matchesRole = filters.role === "all" || member.role === filters.role;
    const matchesProject =
      filters.projectId === "all" || member.projectIds.includes(filters.projectId);
    const matchesStatus =
      filters.status === "all" || member.status === filters.status;

    return matchesQuery && matchesRole && matchesProject && matchesStatus;
  });
}
