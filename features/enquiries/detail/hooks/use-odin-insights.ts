"use client";

import { useState, useEffect, useCallback } from "react";
import { authedFetch } from "@/lib/auth/authed-fetch";

export interface OdinApiInsight {
  id: string;
  title: string;
  scopeLabel: string;
  summary: string;
  severity: string;
  domainTag?: string;
  whyFlagged?: string;
  affectedArea?: string;
  suggestedQuestion?: string;
  actionPrimary?: {
    label: string;
    type: string;
    payload?: string;
    targetTab?: string;
  };
}

export type AnalysisType = "completeness" | "missing" | "conflict" | "ambiguity";

export interface UseOdinInsightsOptions {
  projectId: string;
  analysisType?: AnalysisType;
}

export function useOdinInsights({ projectId, analysisType }: UseOdinInsightsOptions) {
  const [insights, setInsights] = useState<OdinApiInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = useCallback(async () => {
    if (!projectId || !/^\d+$/.test(projectId)) return;
    setLoading(true);
    setError(null);
    try {
      const res = await authedFetch(
        `/api/projects/${projectId}/insights`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ analysis_type: analysisType ?? null }),
          cache: "no-store",
        }
      );
      const payload = (await res.json()) as {
        status: string;
        insights: OdinApiInsight[];
        message?: string;
      };
      if (!res.ok || payload.status !== "ok") {
        throw new Error(payload.message ?? "Insights request failed");
      }
      setInsights(payload.insights);
    } catch (err) {
      setInsights([]);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [projectId, analysisType]);

  useEffect(() => {
    void fetchInsights();
  }, [fetchInsights]);

  return { insights, loading, error, refetch: fetchInsights };
}
