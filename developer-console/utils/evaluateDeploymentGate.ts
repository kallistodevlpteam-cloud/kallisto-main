import {
  PageReadinessManifest,
  ReadinessCheckDefinition,
  ReadinessCheckRecord,
  BackendActionDefinition,
  BackendActionRecord,
  DeveloperIssue,
  DiagnosticResult,
  Environment,
  AcceptedRiskOverride,
  DeploymentGateResult,
} from "../types/developerConsole.types";

export function evaluateDeploymentGate(
  manifest: PageReadinessManifest | null,
  checks: ReadinessCheckDefinition[],
  records: ReadinessCheckRecord[],
  actions: BackendActionDefinition[],
  actionRecords: BackendActionRecord[],
  issues: DeveloperIssue[],
  diagnostics: DiagnosticResult[],
  currentBuildId: string,
  currentEnvironment: Environment,
  overrides: AcceptedRiskOverride[],
  persistenceStatus: "available" | "unavailable" = "available"
): DeploymentGateResult {
  const reasons: string[] = [];

  // 1. Missing Manifest Blocker (non-overridable)
  if (!manifest) {
    return {
      status: "production_blocked",
      reasons: [
        "Page manifest is missing. Verification cannot be validated.",
        "System blocker: MANIFEST_MISSING",
      ],
      overridesAllowed: false,
    };
  }

  let criticalFailureCount = 0;
  let nonCriticalFailureCount = 0;

  // 2. Build Metadata check
  if (!currentBuildId || currentBuildId === "Unknown") {
    reasons.push("Build metadata is unavailable. Production readiness is blocked.");
    criticalFailureCount++;
  }

  // 3. Persistence Repository check
  if (persistenceStatus === "unavailable") {
    reasons.push("Remote persistence repository is unavailable. Production deployment is blocked.");
    criticalFailureCount++;
  }

  const recordMap = new Map(records.map((r) => [r.itemId, r]));
  const actionRecordMap = new Map(actionRecords.map((r) => [r.actionId, r]));
  const overrideMap = new Map(overrides.map((o) => [o.itemId, o]));

  // Helper to check if a check or action is overridden
  const isOverridden = (itemId: string, category: string) => {
    const isCriticalCategory = ["authentication", "security", "data_loading"].includes(category);
    if (isCriticalCategory) return false;

    const override = overrideMap.get(itemId);
    if (!override) return false;

    if (override.buildId !== currentBuildId) return false;
    const expiry = new Date(override.expiryDate);
    if (isNaN(expiry.getTime()) || expiry.getTime() < Date.now()) return false;

    if (
      override.scope !== "both" &&
      override.scope !== (currentEnvironment === "production" ? "production" : "staging")
    ) {
      return false;
    }

    return true;
  };

  // 4. Check Required Backend Actions
  for (const action of actions) {
    const record = actionRecordMap.get(action.actionId);
    const status = record ? record.status : "not_verified";

    if (action.isRequired) {
      if (status !== "connected" && status !== "tested") {
        const msg = `Required backend action "${action.actionName}" is in state "${status}". Must be connected or tested.`;
        reasons.push(msg);
        criticalFailureCount++;
      }
    }
  }

  // 5. Check Checklist Items
  for (const check of checks) {
    const record = recordMap.get(check.itemId);
    const status = record ? record.status : "not_verified";

    const isFailed = status !== "connected" && status !== "tested" && status !== "skipped_with_reason";

    if (isFailed) {
      const isCritical =
        check.isRequired ||
        ["authentication", "security", "data_loading"].includes(check.category) ||
        check.blockingLevel === "production";
      const hasOverride = isOverridden(check.itemId, check.category);

      if (!hasOverride) {
        const msg = `Checklist item "${check.title}" is in status "${status}".`;
        reasons.push(msg);
        if (isCritical) {
          criticalFailureCount++;
        } else {
          nonCriticalFailureCount++;
        }
      }
    }

    // Build and Environment check
    if (record && record.status !== "not_verified" && record.status !== "skipped_with_reason") {
      if (record.buildId !== currentBuildId) {
        reasons.push(`Verification record for "${check.title}" belongs to an older build ("${record.buildId || "unknown"}").`);
        criticalFailureCount++;
      }
      if (record.environment !== currentEnvironment) {
        reasons.push(`Verification record for "${check.title}" belongs to another environment ("${record.environment}").`);
        criticalFailureCount++;
      }
    }
  }

  // 6. Unresolved Issues
  const activeIssues = issues.filter(
    (issue) => issue.status === "open" || issue.status === "investigating" || issue.status === "in_progress"
  );
  for (const issue of activeIssues) {
    if (issue.severity === "blocker" || issue.severity === "critical") {
      reasons.push(`Unresolved critical/blocker issue: "${issue.title}".`);
      criticalFailureCount++;
    } else if (issue.severity === "major") {
      reasons.push(`Unresolved major issue: "${issue.title}".`);
      nonCriticalFailureCount++;
    }
  }

  // 7. Diagnostics Checks
  for (const diag of diagnostics) {
    const failedStates = ["error", "missing", "invalid", "unknown", "stale", "unavailable", "not_run"];
    if (failedStates.includes(diag.status)) {
      const isCritical = diag.trustLevel === "server_verified";
      const msg = `Required diagnostic check "${diag.key}" is in failed/incomplete state "${diag.status}".`;
      reasons.push(msg);
      if (isCritical) {
        criticalFailureCount++;
      } else {
        nonCriticalFailureCount++;
      }
    }
  }

  // 8. Resolve Status
  if (criticalFailureCount > 0) {
    return {
      status: "production_blocked",
      reasons,
      overridesAllowed: false,
    };
  }

  if (nonCriticalFailureCount > 0) {
    return {
      status: "not_ready",
      reasons,
      overridesAllowed: true,
    };
  }

  if (currentEnvironment === "production") {
    return {
      status: "ready_for_production",
      reasons: [],
      overridesAllowed: false,
    };
  } else if (currentEnvironment === "staging") {
    return {
      status: "staging_verification_required",
      reasons: [],
      overridesAllowed: false,
    };
  } else {
    return {
      status: "ready_for_staging",
      reasons: [],
      overridesAllowed: false,
    };
  }
}
