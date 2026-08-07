import { useState, useEffect, useCallback } from "react";
import { PageReadinessManifest, DiagnosticResult, Environment } from "../types/developerConsole.types";
import { diagnosticsService } from "../services/diagnosticsService";

export function usePageDiagnostics(
  manifest: PageReadinessManifest | null,
  environment: Environment,
  buildId: string,
  simulationMode: boolean
) {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [lastRunTimestamp, setLastRunTimestamp] = useState<string | null>(null);

  const runAllDiagnostics = useCallback(async () => {
    if (!manifest) {
      setResults([]);
      return;
    }

    setIsRunning(true);
    const diagDefs = manifest.diagnostics;
    const runResults: DiagnosticResult[] = [];

    for (const def of diagDefs) {
      const res = await diagnosticsService.runDiagnostic(def.key, environment, buildId, simulationMode);
      runResults.push(res);
    }

    setResults(runResults);
    setLastRunTimestamp(new Date().toISOString());
    setIsRunning(false);
  }, [manifest, environment, buildId, simulationMode]);

  useEffect(() => {
    if (manifest) {
      runAllDiagnostics();
    } else {
      setResults([]);
    }
  }, [manifest, runAllDiagnostics]);

  return {
    results,
    isRunning,
    lastRunTimestamp,
    refresh: runAllDiagnostics,
  };
}
