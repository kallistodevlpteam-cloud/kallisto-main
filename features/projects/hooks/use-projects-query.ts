import { useCallback, useEffect, useRef, useState } from "react";
import { ProjectFilterParams, ProjectsWorkspaceQueryResult, UserSecurityContext } from "../types/project.types";
import { projectsService } from "../services/projects.service";

export function useProjectsQuery(
  context: UserSecurityContext,
  filters: ProjectFilterParams
) {
  const [data, setData] = useState<ProjectsWorkspaceQueryResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [forbidden, setForbidden] = useState(false);

  const requestIdRef = useRef(0);

  const fetchWorkspace = useCallback(async () => {
    const currentRequestId = ++requestIdRef.current;
    setLoading(true);
    setError(false);
    setForbidden(false);

    try {
      const result = await projectsService.getProjectsWorkspaceQuery(context, filters);

      if (currentRequestId === requestIdRef.current) {
        setData(result);
        setLoading(false);
      }
    } catch (err: unknown) {
      if (currentRequestId === requestIdRef.current) {
        const errMsg = err instanceof Error ? err.message : String(err);
        if (errMsg.includes("Access Denied")) {
          setForbidden(true);
        } else {
          setError(true);
        }
        setLoading(false);
      }
    }
  }, [context, filters]);

  useEffect(() => {
    let isMounted = true;
    const currentRequestId = ++requestIdRef.current;

    projectsService
      .getProjectsWorkspaceQuery(context, filters)
      .then((result) => {
        if (isMounted && currentRequestId === requestIdRef.current) {
          setData(result);
          setLoading(false);
          setError(false);
          setForbidden(false);
        }
      })
      .catch((err: unknown) => {
        if (isMounted && currentRequestId === requestIdRef.current) {
          const errMsg = err instanceof Error ? err.message : String(err);
          if (errMsg.includes("Access Denied")) {
            setForbidden(true);
          } else {
            setError(true);
          }
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [context, filters]);

  return {
    data,
    loading,
    error,
    forbidden,
    refetch: fetchWorkspace,
  };
}
