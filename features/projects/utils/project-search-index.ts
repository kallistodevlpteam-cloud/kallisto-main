import { ProjectSearchIndex } from "../types/project.types";

export function normalizeSearchString(str: string): string {
  return str.toLowerCase().trim().replace(/[^\w\s-]/g, "");
}

export function generateSearchTokens(fields: Array<string | null | undefined>): string[] {
  const tokenSet = new Set<string>();

  fields.forEach((field) => {
    if (!field) return;
    const normalized = normalizeSearchString(field);
    if (!normalized) return;

    const words = normalized.split(/\s+/).filter(Boolean);
    words.forEach((word) => {
      tokenSet.add(word);
      for (let i = 2; i <= word.length; i++) {
        tokenSet.add(word.slice(0, i));
      }
    });
  });

  return Array.from(tokenSet);
}

export function buildProjectSearchIndex(
  projectId: string,
  workspaceId: string,
  projectName: string,
  projectCode: string,
  clientName: string,
  siteLocation: string,
  ownerName?: string
): ProjectSearchIndex {
  const normName = normalizeSearchString(projectName);
  const normCode = normalizeSearchString(projectCode);
  const normClient = normalizeSearchString(clientName);
  const normLocation = normalizeSearchString(siteLocation);

  const searchTokens = generateSearchTokens([
    projectName,
    projectCode,
    clientName,
    siteLocation,
    ownerName,
  ]);

  return {
    projectId,
    workspaceId,
    normalizedName: normName,
    normalizedCode: normCode,
    normalizedClientName: normClient,
    normalizedLocation: normLocation,
    searchTokens,
    updatedAt: new Date().toISOString(),
  };
}

export function matchesSearchIndex(index: ProjectSearchIndex, query: string): boolean {
  const normalizedQuery = normalizeSearchString(query);
  if (!normalizedQuery) return true;

  const queryTerms = normalizedQuery.split(/\s+/).filter(Boolean);

  return queryTerms.every((term) => {
    if (index.normalizedName.includes(term)) return true;
    if (index.normalizedCode.includes(term)) return true;
    if (index.normalizedClientName.includes(term)) return true;
    if (index.normalizedLocation.includes(term)) return true;
    return index.searchTokens.some((token) => token.startsWith(term) || token === term);
  });
}
