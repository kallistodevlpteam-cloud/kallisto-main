import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProjectFilterParams, ProjectStatus } from "../types/project.types";
import { parseProjectQueryParams, serializeProjectQueryParams } from "../utils/project-query-params";

export function useProjectFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const searchParamsStr = searchParams?.toString() || "";

  const currentFilters = useMemo(
    () => parseProjectQueryParams(searchParams),
    [searchParamsStr]
  );

  const filtersRef = useRef(currentFilters);
  filtersRef.current = currentFilters;

  const [searchInput, setSearchInput] = useState(currentFilters.q || "");

  // Synchronize local searchInput when URL `q` parameter changes externally (e.g. browser back/forward)
  useEffect(() => {
    setSearchInput(currentFilters.q || "");
  }, [currentFilters.q]);

  // Debounced search typing -> update `q` in URL
  useEffect(() => {
    const handler = setTimeout(() => {
      const activeFilters = filtersRef.current;
      const urlQ = activeFilters.q || "";
      const typedQ = searchInput.trim();
      if (typedQ !== urlQ) {
        startTransition(() => {
          const newParams: ProjectFilterParams = {
            ...activeFilters,
            q: typedQ || undefined,
            cursor: undefined,
          };
          const serialized = serializeProjectQueryParams(newParams);
          const queryStr = serialized.toString() ? `?${serialized.toString()}` : "";
          router.replace(`/projects${queryStr}`, { scroll: false });
        });
      }
    }, 280);

    return () => clearTimeout(handler);
  }, [searchInput, router]);

  // Update status tab using router.push
  const setStatusTab = useCallback(
    (newStatus: ProjectStatus | "ALL") => {
      startTransition(() => {
        const activeFilters = filtersRef.current;
        const newParams: ProjectFilterParams = {
          ...activeFilters,
          status: newStatus === "ACTIVE" ? undefined : newStatus,
          cursor: undefined,
        };
        const serialized = serializeProjectQueryParams(newParams);
        const queryStr = serialized.toString() ? `?${serialized.toString()}` : "";
        router.push(`/projects${queryStr}`);
      });
    },
    [router]
  );

  // Update active filters using router.push
  const setFilters = useCallback(
    (updated: Partial<ProjectFilterParams>) => {
      startTransition(() => {
        const activeFilters = filtersRef.current;
        const newParams: ProjectFilterParams = {
          ...activeFilters,
          ...updated,
          cursor: undefined,
        };
        const serialized = serializeProjectQueryParams(newParams);
        const queryStr = serialized.toString() ? `?${serialized.toString()}` : "";
        router.push(`/projects${queryStr}`);
      });
    },
    [router]
  );

  // Pagination navigation
  const setPageCursor = useCallback(
    (newCursor: string | undefined) => {
      startTransition(() => {
        const activeFilters = filtersRef.current;
        const newParams: ProjectFilterParams = {
          ...activeFilters,
          cursor: newCursor,
        };
        const serialized = serializeProjectQueryParams(newParams, { preserveCursor: true });
        const queryStr = serialized.toString() ? `?${serialized.toString()}` : "";
        router.push(`/projects${queryStr}`);
      });
    },
    [router]
  );

  const clearAllFilters = useCallback(() => {
    setSearchInput("");
    startTransition(() => {
      const activeFilters = filtersRef.current;
      const newParams: ProjectFilterParams = {
        status: activeFilters.status,
      };
      const serialized = serializeProjectQueryParams(newParams);
      const queryStr = serialized.toString() ? `?${serialized.toString()}` : "";
      router.push(`/projects${queryStr}`);
    });
  }, [router]);

  return {
    filters: currentFilters,
    searchInput,
    setSearchInput,
    setStatusTab,
    setFilters,
    setPageCursor,
    clearAllFilters,
  };
}
