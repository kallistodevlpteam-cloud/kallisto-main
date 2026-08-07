"use client";

import { useCallback, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type DriveScope = "all" | "shared" | "starred";
export type DriveViewMode = "list" | "grid";
export type DriveSort =
  | "updated-desc"
  | "updated-asc"
  | "name-asc"
  | "name-desc"
  | "size-desc"
  | "size-asc";
export type DriveModifiedRange = "all" | "today" | "week" | "month" | "older";

export interface DriveQueryState {
  scope: DriveScope;
  selectedFolderId: string;
  searchQuery: string;
  filters: {
    types: string[];
    people: string[];
    modifiedRange: DriveModifiedRange;
    sources: string[];
  };
  sort: DriveSort;
  viewMode: DriveViewMode;
  page: number;
}

const DEFAULT_QUERY: DriveQueryState = {
  scope: "all",
  selectedFolderId: "all",
  searchQuery: "",
  filters: {
    types: [],
    people: [],
    modifiedRange: "all",
    sources: [],
  },
  sort: "updated-desc",
  viewMode: "list",
  page: 1,
};

function getList(params: URLSearchParams, key: string): string[] {
  return (params.get(key) ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function isOneOf<T extends string>(
  value: string | null,
  values: readonly T[],
): value is T {
  return value !== null && values.includes(value as T);
}

export function parseDriveQuery(params: URLSearchParams): DriveQueryState {
  const page = Number.parseInt(params.get("page") ?? "1", 10);
  const scope = params.get("scope");
  const view = params.get("view");
  const sort = params.get("sort");
  const modified = params.get("modified");

  return {
    ...DEFAULT_QUERY,
    scope: isOneOf(scope, ["all", "shared", "starred"] as const) ? scope : "all",
    selectedFolderId: params.get("folder") || "all",
    searchQuery: params.get("q") ?? "",
    filters: {
      types: getList(params, "type"),
      people: getList(params, "people"),
      modifiedRange: isOneOf(
        modified,
        ["all", "today", "week", "month", "older"] as const,
      )
        ? modified
        : "all",
      sources: getList(params, "source"),
    },
    sort: isOneOf(
      sort,
      [
        "updated-desc",
        "updated-asc",
        "name-asc",
        "name-desc",
        "size-desc",
        "size-asc",
      ] as const,
    )
      ? sort
      : "updated-desc",
    viewMode: isOneOf(view, ["list", "grid"] as const) ? view : "list",
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

export function toSearchParams(query: DriveQueryState): URLSearchParams {
  const params = new URLSearchParams();
  if (query.scope !== "all") params.set("scope", query.scope);
  if (query.selectedFolderId !== "all") params.set("folder", query.selectedFolderId);
  if (query.searchQuery) params.set("q", query.searchQuery);
  if (query.filters.types.length) params.set("type", query.filters.types.join(","));
  if (query.filters.people.length) params.set("people", query.filters.people.join(","));
  if (query.filters.modifiedRange !== "all") {
    params.set("modified", query.filters.modifiedRange);
  }
  if (query.filters.sources.length) params.set("source", query.filters.sources.join(","));
  if (query.sort !== "updated-desc") params.set("sort", query.sort);
  if (query.viewMode !== "list") params.set("view", query.viewMode);
  if (query.page > 1) params.set("page", String(query.page));
  return params;
}

export function useDriveQueryState() {
  const router = useRouter();
  const pathname = usePathname() || "/documents";
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();

  const [query, setQuery] = useState<DriveQueryState>(() =>
    parseDriveQuery(new URLSearchParams(searchParamsString)),
  );
  const [prevParamsString, setPrevParamsString] = useState(searchParamsString);

  // Sync state during render when searchParamsString changes (e.g. navigation or Browser Back/Forward)
  if (searchParamsString !== prevParamsString) {
    setPrevParamsString(searchParamsString);
    setQuery(parseDriveQuery(new URLSearchParams(searchParamsString)));
  }

  const updateQuery = useCallback(
    (
      update:
        | Partial<DriveQueryState>
        | ((current: DriveQueryState) => Partial<DriveQueryState>),
      options: { resetPage?: boolean; replace?: boolean } = {},
    ) => {
      setQuery((current) => {
        const patch = typeof update === "function" ? update(current) : update;
        const next: DriveQueryState = {
          ...current,
          ...patch,
          filters: patch.filters ?? current.filters,
          page: options.resetPage ? 1 : (patch.page ?? current.page),
        };

        const params = toSearchParams(next);
        const queryString = params.toString();
        const url = queryString ? `${pathname}?${queryString}` : pathname;

        if (options.replace ?? true) {
          router.replace(url, { scroll: false });
        } else {
          router.push(url, { scroll: false });
        }

        return next;
      });
    },
    [pathname, router],
  );

  const setFilters = useCallback(
    (filters: DriveQueryState["filters"]) => {
      updateQuery({ filters }, { resetPage: true });
    },
    [updateQuery],
  );

  return { query, updateQuery, setFilters };
}
