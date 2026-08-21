import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Environment,
  UserRole,
  ReadinessCheckRecord,
  BackendActionRecord,
  DeveloperIssue,
  AcceptedRiskOverride,
  AuditRecord,
} from "../types/developerConsole.types";
import { getReadinessRepository } from "../services/readinessService";
import { getIssueRepository } from "../services/developerIssueService";
import { canAccessDeveloperConsole } from "../utils/accessControl";
import { usePageReadinessManifest } from "./usePageReadinessManifest";
import { calculateReadiness } from "../utils/calculateReadiness";
import { getRouteTitle } from "../utils/routeScope";
import { getBuildMetadata } from "../utils/buildMetadata";

export function useDeveloperConsole() {
  const router = useRouter();
  const { manifest, isSupported, isMissing, pathname } = usePageReadinessManifest();

  // Load authoritative build metadata
  const buildMeta = getBuildMetadata();
  const buildId = buildMeta.buildId;
  const commitId = buildMeta.commitId;
  const appVersion = buildMeta.appVersion;

  // Trusted runtime variables (read-only)
  const [trueUser, setTrueUser] = useState<{ uid: string; role: UserRole; providerId?: string } | null>(null);
  const [trueEnvironment, setTrueEnvironment] = useState<Environment>("development");
  const [trueFeatureFlags, setTrueFeatureFlags] = useState<{ developerConsoleEnabled?: boolean }>({
    developerConsoleEnabled: false,
  });

  const [isResolvingAuth, setIsResolvingAuth] = useState(true);
  const [isConsoleAllowed, setIsConsoleAllowed] = useState(false);

  // Simulation Mode states
  const [simulationMode, setSimulationMode] = useState(false);
  const [simulatedRole, setSimulatedRole] = useState<UserRole>("developer");
  const [simulatedEnvironment, setSimulatedEnvironment] = useState<Environment>("development");
  const [simulatedFeatureFlags, setSimulatedFeatureFlags] = useState<{ developerConsoleEnabled?: boolean }>({
    developerConsoleEnabled: true,
  });

  // Persistence States
  const [checklistRecords, setChecklistRecords] = useState<ReadinessCheckRecord[]>([]);
  const [actionRecords, setActionRecords] = useState<BackendActionRecord[]>([]);
  const [issues, setIssues] = useState<DeveloperIssue[]>([]);
  const [overrides, setOverrides] = useState<AcceptedRiskOverride[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditRecord[]>([]);

  // Resolve active environment/user based on simulation flag
  const activeUser = simulationMode
    ? { uid: "sim_user_123", role: simulatedRole, providerId: "sim_provider_456" }
    : trueUser;

  const activeEnvironment = simulationMode ? simulatedEnvironment : trueEnvironment;

  const activeFeatureFlags = simulationMode ? simulatedFeatureFlags : trueFeatureFlags;

  // Sync simulated role/mode with cookies for server components authorization check
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isAuth = document.cookie.includes("kallisto_auth_token=") || Boolean(localStorage.getItem("kallisto_auth_token"));
      if (!isAuth) return;

      const activeRole = simulationMode ? simulatedRole : (trueUser?.role || "developer");
      
      const match = document.cookie.match(/(?:^|; )kallisto_simulated_role=([^;]*)/);
      const currentCookieRole = match ? match[1] : null;

      if (currentCookieRole !== activeRole) {
        document.cookie = `kallisto_simulated_role=${activeRole}; path=/; max-age=31536000`;
        router.refresh();
      }
    }
  }, [simulationMode, simulatedRole, trueUser, router]);

  // Initialize runtime variables
  useEffect(() => {
    let env: Environment = "development";
    if (process.env.NODE_ENV === "production") {
      env = "production";
    } else if (typeof window !== "undefined" && window.location.hostname === "localhost") {
      env = "local";
    }
    setTrueEnvironment(env);

    setTrueFeatureFlags({
      developerConsoleEnabled: env !== "production", // default disabled in production
    });

    const timer = setTimeout(() => {
      const resolvedUser = {
        uid: "arjun_architects_dev",
        role: "developer" as UserRole,
        providerId: "arjun_arch_provider_id",
      };
      setTrueUser(resolvedUser);

      if (typeof window !== "undefined") {
        localStorage.setItem("kallisto_simulated_user", JSON.stringify(resolvedUser));
      }

      setIsResolvingAuth(false);
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  // Compute console access criteria
  useEffect(() => {
    if (isResolvingAuth) return;

    const allowed = canAccessDeveloperConsole(
      trueUser,
      trueEnvironment,
      trueFeatureFlags,
      isSupported
    );

    setIsConsoleAllowed(allowed);
  }, [isResolvingAuth, trueUser, trueEnvironment, trueFeatureFlags, isSupported]);

  // Disable Simulation Mode if manifest is missing or if environment is staging/production
  useEffect(() => {
    if (isMissing || trueEnvironment === "staging" || trueEnvironment === "production") {
      setSimulationMode(false);
    }
  }, [isMissing, trueEnvironment]);

  // Load records
  const loadRecords = useCallback(async () => {
    if (!manifest || !isSupported) return;

    const repo = getReadinessRepository(activeEnvironment, simulationMode);
    const issueRepo = getIssueRepository(activeEnvironment, simulationMode);

    try {
      const records = await repo.getChecklistRecords(manifest.pageId, activeEnvironment, buildId);
      const ovs = await repo.getOverrides(manifest.pageId, buildId, activeEnvironment);
      const iss = await issueRepo.getIssues(manifest.pageId, activeEnvironment);
      const audits = await repo.getAuditLogs(manifest.pageId, activeEnvironment);

      setChecklistRecords(records);
      setOverrides(ovs);
      setIssues(iss);
      setAuditLogs(audits);
    } catch (err) {
      console.error("Failed to load developer console records", err);
    }
  }, [manifest, isSupported, activeEnvironment, simulationMode, buildId]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  // Actions
  const updateCheckStatus = async (itemId: string, status: any, notes?: string, evidence?: string[]) => {
    if (!manifest || !activeUser) return;

    const repo = getReadinessRepository(activeEnvironment, simulationMode);
    const record: ReadinessCheckRecord = {
      itemId,
      pageId: manifest.pageId,
      providerId: activeUser.providerId,
      environment: activeEnvironment,
      status,
      checkedBy: activeUser.uid,
      checkedAt: new Date().toISOString(),
      notes,
      evidence,
      buildId,
      manifestVersion: manifest.manifestVersion,
    };

    await repo.saveChecklistRecord(record, activeUser);
    await loadRecords();
  };

  const createIssue = async (title: string, description: string, severity: any, category: string) => {
    if (!manifest || !activeUser) return;

    const issueRepo = getIssueRepository(activeEnvironment, simulationMode);
    const issue: DeveloperIssue = {
      issueId: "issue_" + Math.random().toString(36).substr(2, 9),
      pageId: manifest.pageId,
      title,
      description,
      severity,
      category,
      status: "open",
      owner: activeUser.uid,
      createdDate: new Date().toISOString(),
    };

    await issueRepo.saveIssue(issue, activeEnvironment, activeUser);
    await loadRecords();
  };

  const updateIssueStatus = async (issueId: string, status: any, resolutionNotes?: string) => {
    if (!activeUser) return;
    const issueRepo = getIssueRepository(activeEnvironment, simulationMode);
    await issueRepo.updateIssueStatus(issueId, status, resolutionNotes, activeEnvironment, activeUser);
    await loadRecords();
  };

  const createOverride = async (
    itemId: string,
    reason: string,
    expiryDate: string,
    scope: "staging" | "production" | "both"
  ) => {
    if (!manifest || !activeUser) return;

    const repo = getReadinessRepository(activeEnvironment, simulationMode);
    const override: AcceptedRiskOverride = {
      overrideId: "override_" + Math.random().toString(36).substr(2, 9),
      pageId: manifest.pageId,
      itemId,
      approver: activeUser.uid,
      reason,
      expiryDate,
      scope,
      buildId,
      createdAt: new Date().toISOString(),
    };

    await repo.saveOverride(override, activeUser);
    await loadRecords();
  };

  // Derive repo persistence status
  const currentRepo = getReadinessRepository(activeEnvironment, simulationMode);
  const persistenceStatus = currentRepo.status;

  // Calculate readiness percentage
  const readiness = calculateReadiness(
    manifest ? manifest.checklistRequirements : [],
    checklistRecords,
    manifest ? manifest.backendActions : [],
    actionRecords,
    isMissing // pass manifestMissing flag
  );

  // Resolve safe route title
  const resolvedPageName = manifest ? manifest.pageName : getRouteTitle(pathname);

  return {
    manifest,
    isSupported,
    isMissing,
    pathname,
    buildId,
    commitId,
    appVersion,
    buildMetaAvailable: buildMeta.isAvailable,
    resolvedPageName,
    trueEnvironment,
    trueUser,
    isConsoleAllowed,
    isResolvingAuth,

    // Simulation states
    simulationMode: simulationMode && !isMissing && (trueEnvironment === "local" || trueEnvironment === "development"),
    setSimulationMode: (val: boolean) => {
      if (isMissing) return;
      if (trueEnvironment === "local" || trueEnvironment === "development") {
        setSimulationMode(val);
      }
    },
    simulatedRole,
    setSimulatedRole,
    simulatedEnvironment,
    setSimulatedEnvironment,
    simulatedFeatureFlags,
    setSimulatedFeatureFlags,

    activeEnvironment,
    activeUser,
    activeFeatureFlags,

    // Data lists
    checklistRecords,
    actionRecords,
    issues,
    overrides,
    auditLogs,
    persistenceStatus,

    // Actions
    updateCheckStatus,
    createIssue,
    updateIssueStatus,
    createOverride,
    reload: loadRecords,

    // Calculated stats
    readiness,
  };
}
export type DeveloperConsoleHook = ReturnType<typeof useDeveloperConsole>;
