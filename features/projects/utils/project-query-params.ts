import { ProjectFilterParams, ProjectStatus } from "../types/project.types";

export function parseProjectQueryParams(
  searchParams: URLSearchParams | Record<string, string | string[] | undefined>
): ProjectFilterParams {
  const getParam = (key: string): string | undefined => {
    if (searchParams instanceof URLSearchParams) {
      return searchParams.get(key) || undefined;
    }
    const val = searchParams[key];
    if (Array.isArray(val)) return val[0];
    return val;
  };

  const getArrayParam = (key: string): string[] => {
    if (searchParams instanceof URLSearchParams) {
      return searchParams.getAll(key).filter(Boolean);
    }
    const val = searchParams[key];
    if (Array.isArray(val)) return val;
    if (typeof val === "string") return val.split(",").map((s) => s.trim()).filter(Boolean);
    return [];
  };

  const rawStatus = getParam("status");
  let status: ProjectStatus | "ALL" | undefined = undefined;

  if (rawStatus) {
    const sLower = rawStatus.toLowerCase();
    if (sLower === "active") status = "ACTIVE";
    else if (sLower === "upcoming") status = "UPCOMING";
    else if (sLower === "on-hold" || sLower === "on_hold") status = "ON_HOLD";
    else if (sLower === "completed") status = "COMPLETED";
    else if (sLower === "all") status = "ALL";
    else if (sLower === "archived") status = "ARCHIVED";
    else if (sLower === "cancelled") status = "CANCELLED";
  }

  const q = getParam("q") || getParam("searchQuery") || undefined;
  const ownership = getParam("ownership") || getParam("owner") || undefined;
  const location = getParam("location") || undefined;
  const sort = (getParam("sort") as ProjectFilterParams["sort"]) || undefined;
  const cursor = getParam("cursor") || undefined;

  const rawLimit = getParam("limit");
  const limit = rawLimit ? parseInt(rawLimit, 10) : undefined;

  const phase = getArrayParam("phase") as ProjectFilterParams["phase"];
  const attention = getArrayParam("attention") as ProjectFilterParams["attention"];
  const lifecycle = getArrayParam("lifecycle") as ProjectFilterParams["lifecycle"];

  return {
    status,
    q,
    ownership,
    phase: phase && phase.length ? phase : undefined,
    attention: attention && attention.length ? attention : undefined,
    location,
    lifecycle: lifecycle && lifecycle.length ? lifecycle : undefined,
    sort,
    cursor,
    limit: limit && !isNaN(limit) ? limit : 25,
  };
}

export function serializeProjectQueryParams(
  params: ProjectFilterParams,
  options?: { preserveCursor?: boolean }
): URLSearchParams {
  const searchParams = new URLSearchParams();

  if (params.status) {
    if (params.status === "ON_HOLD" || params.status === "on-hold") searchParams.set("status", "on-hold");
    else searchParams.set("status", params.status.toLowerCase());
  }

  if (params.q && params.q.trim()) {
    searchParams.set("q", params.q.trim());
  }

  if (params.ownership) {
    searchParams.set("ownership", params.ownership);
  }

  if (params.location && params.location.trim()) {
    searchParams.set("location", params.location.trim());
  }

  if (params.sort) {
    searchParams.set("sort", params.sort);
  }

  if (params.phase && params.phase.length > 0) {
    params.phase.forEach((p) => searchParams.append("phase", p));
  }

  if (params.attention && params.attention.length > 0) {
    params.attention.forEach((a) => searchParams.append("attention", a));
  }

  if (params.lifecycle && params.lifecycle.length > 0) {
    params.lifecycle.forEach((l) => searchParams.append("lifecycle", l));
  }

  // Preserve cursor ONLY if explicit option flag is passed
  if (options?.preserveCursor && params.cursor) {
    searchParams.set("cursor", params.cursor);
  }

  return searchParams;
}
