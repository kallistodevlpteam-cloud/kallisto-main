"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CreateFinanceTransactionInput,
  ProjectFinanceSnapshot,
} from "../types/project-finance.types";
import {
  ProjectFinanceService,
  projectFinanceService,
} from "../services/project-finance.service";

export function useProjectFinance(
  projectId: string,
  projectName: string,
  projectCode: string,
  service: ProjectFinanceService = projectFinanceService
) {
  const [snapshot, setSnapshot] = useState<ProjectFinanceSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFinance = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const nextSnapshot = await service.getProjectFinance(
        projectId,
        projectName,
        projectCode
      );
      setSnapshot(nextSnapshot);
    } catch {
      setError("The project finance workspace could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [projectCode, projectId, projectName, service]);

  useEffect(() => {
    let cancelled = false;

    service
      .getProjectFinance(projectId, projectName, projectCode)
      .then((nextSnapshot) => {
        if (!cancelled) {
          setSnapshot(nextSnapshot);
          setError(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("The project finance workspace could not be loaded.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [projectCode, projectId, projectName, service]);

  const addTransaction = useCallback(
    async (input: CreateFinanceTransactionInput) => {
      if (saving) {
        throw new Error("A transaction is already being saved.");
      }

      setSaving(true);
      setError(null);

      try {
        const result = await service.addTransaction(projectId, input);
        setSnapshot(result.snapshot);
        return result.transaction;
      } catch (caughtError) {
        throw caughtError;
      } finally {
        setSaving(false);
      }
    },
    [projectId, saving, service]
  );

  return {
    snapshot,
    loading,
    saving,
    error,
    retry: loadFinance,
    addTransaction,
  };
}
