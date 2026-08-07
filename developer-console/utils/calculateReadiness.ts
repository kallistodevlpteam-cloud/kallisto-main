import {
  ReadinessCheckDefinition,
  ReadinessCheckRecord,
  BackendActionDefinition,
  BackendActionRecord,
} from "../types/developerConsole.types";

export interface ReadinessCalculationResult {
  percentage: number | null;
  passedCount: number | string;
  failedCount: number | string;
  blockerCount: number;
  warningCount: number | string;
  totalCount: number;
  hasFailedCriticalCheck: boolean;
}

export function calculateReadiness(
  checks: ReadinessCheckDefinition[],
  records: ReadinessCheckRecord[],
  actions: BackendActionDefinition[],
  actionRecords: BackendActionRecord[],
  manifestMissing = false
): ReadinessCalculationResult {
  if (manifestMissing) {
    return {
      percentage: null,
      passedCount: "—",
      failedCount: "—",
      blockerCount: 1, // One non-overridable system blocker
      warningCount: "—",
      totalCount: 0,
      hasFailedCriticalCheck: true,
    };
  }

  const recordMap = new Map(records.map((r) => [r.itemId, r]));
  const actionRecordMap = new Map(actionRecords.map((r) => [r.actionId, r]));

  let totalWeight = 0;
  let earnedWeight = 0;
  let passedCount = 0;
  let failedCount = 0;
  let blockerCount = 0;
  let warningCount = 0;
  let hasFailedCriticalCheck = false;

  // 1. Process Checklist Requirements
  for (const check of checks) {
    const record = recordMap.get(check.itemId);
    const status = record ? record.status : "not_verified";

    if (status === "skipped_with_reason") {
      continue; // Skip from weighted scoring
    }

    const weight = check.weight || 1;
    totalWeight += weight;

    let score = 0;
    if (status === "connected" || status === "tested") {
      score = 1.0;
      passedCount++;
    } else if (status === "mocked" || status === "partial") {
      score = 0.5;
      warningCount++;
    } else {
      score = 0.0;
      failedCount++;
      if (check.isRequired || check.blockingLevel === "production" || check.blockingLevel === "staging") {
        hasFailedCriticalCheck = true;
        blockerCount++;
      } else {
        warningCount++;
      }
    }

    earnedWeight += weight * score;
  }

  // 2. Process Backend Actions
  for (const action of actions) {
    const record = actionRecordMap.get(action.actionId);
    const status = record ? record.status : "not_verified";

    if (status === "skipped_with_reason") {
      continue;
    }

    const weight = 3; // Backend actions weight
    totalWeight += weight;

    let score = 0;
    if (status === "tested" || status === "connected") {
      score = 1.0;
      passedCount++;
    } else if (status === "mocked" || status === "partial") {
      score = 0.5;
      warningCount++;
      if (action.isRequired) {
        hasFailedCriticalCheck = true;
        blockerCount++;
      }
    } else {
      score = 0.0;
      failedCount++;
      if (action.isRequired) {
        hasFailedCriticalCheck = true;
        blockerCount++;
      } else {
        warningCount++;
      }
    }

    earnedWeight += weight * score;
  }

  // Never default to 100% when there is no checks but a manifest exists (return 0)
  const percentage = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;

  return {
    percentage,
    passedCount,
    failedCount,
    blockerCount,
    warningCount,
    totalCount: checks.length + actions.length,
    hasFailedCriticalCheck,
  };
}
