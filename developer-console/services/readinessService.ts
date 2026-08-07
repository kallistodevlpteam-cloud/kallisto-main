import {
  ReadinessCheckRecord,
  AcceptedRiskOverride,
  AuditRecord,
  Environment,
} from "../types/developerConsole.types";

export interface DeveloperReadinessRepository {
  status: "available" | "unavailable";
  getChecklistRecords(pageId: string, environment: Environment, buildId: string): Promise<ReadinessCheckRecord[]>;
  saveChecklistRecord(record: ReadinessCheckRecord, actor: { uid: string; role: string }): Promise<void>;
  getOverrides(pageId: string, buildId: string, environment: Environment): Promise<AcceptedRiskOverride[]>;
  saveOverride(override: AcceptedRiskOverride, actor: { uid: string; role: string }): Promise<void>;
  getAuditLogs(pageId: string, environment: Environment): Promise<AuditRecord[]>;
}

// Global server-side simulated database for staging/production records (excludes local storage)
export const simulatedRemoteDatabase = {
  records: [] as ReadinessCheckRecord[],
  overrides: [] as AcceptedRiskOverride[],
  auditLogs: [] as AuditRecord[],
};

// Real remote repository (Fails closed / unavailable until real server operations are set up)
export class RemoteDeveloperReadinessRepository implements DeveloperReadinessRepository {
  status = "unavailable" as const;

  async getChecklistRecords(pageId: string, environment: Environment, buildId: string): Promise<ReadinessCheckRecord[]> {
    return [];
  }

  async saveChecklistRecord(record: ReadinessCheckRecord, actor: { uid: string; role: string }): Promise<void> {
    throw new Error("Persistence status unavailable. Production remote repository is not connected.");
  }

  async getOverrides(pageId: string, buildId: string, environment: Environment): Promise<AcceptedRiskOverride[]> {
    return [];
  }

  async saveOverride(override: AcceptedRiskOverride, actor: { uid: string; role: string }): Promise<void> {
    throw new Error("Persistence status unavailable. Production remote repository is not connected.");
  }

  async getAuditLogs(pageId: string, environment: Environment): Promise<AuditRecord[]> {
    return [];
  }
}

// Mock repository for simulation mode inside local/dev
export class MockRemoteDeveloperReadinessRepository implements DeveloperReadinessRepository {
  status = "available" as const;

  async getChecklistRecords(pageId: string, environment: Environment, buildId: string): Promise<ReadinessCheckRecord[]> {
    return simulatedRemoteDatabase.records.filter(
      (r) => r.pageId === pageId && r.environment === environment
    );
  }

  async saveChecklistRecord(record: ReadinessCheckRecord, actor: { uid: string; role: string }): Promise<void> {
    const trustedRoles = ["developer", "super_admin", "qa"];
    if (!trustedRoles.includes(actor.role)) {
      throw new Error("Server Authorization Error: Unauthorized role.");
    }

    const timestamp = new Date().toISOString();
    const auditId = "audit_" + Math.random().toString(36).substr(2, 9);

    const updatedRecord: ReadinessCheckRecord = {
      ...record,
      checkedBy: actor.uid,
      checkedAt: timestamp,
    };

    simulatedRemoteDatabase.records = simulatedRemoteDatabase.records.filter(
      (r) => !(r.pageId === record.pageId && r.itemId === record.itemId && r.environment === record.environment)
    );
    simulatedRemoteDatabase.records.push(updatedRecord);

    simulatedRemoteDatabase.auditLogs.push({
      auditId,
      timestamp,
      actorId: actor.uid,
      actorRole: actor.role,
      action: "UPDATE_CHECKLIST_ITEM",
      details: `Updated checklist item "${record.itemId}" status to "${record.status}".`,
      pageId: record.pageId,
      environment: record.environment,
      buildId: record.buildId || "unknown",
    });
  }

  async getOverrides(pageId: string, buildId: string, environment: Environment): Promise<AcceptedRiskOverride[]> {
    return simulatedRemoteDatabase.overrides.filter(
      (o) =>
        o.pageId === pageId &&
        o.buildId === buildId &&
        (o.scope === "both" || o.scope === (environment === "production" ? "production" : "staging"))
    );
  }

  async saveOverride(override: AcceptedRiskOverride, actor: { uid: string; role: string }): Promise<void> {
    const trustedRoles = ["developer", "super_admin"];
    if (!trustedRoles.includes(actor.role)) {
      throw new Error("Server Authorization Error: Only developers and super_admins can create overrides.");
    }

    const timestamp = new Date().toISOString();
    const auditId = "audit_" + Math.random().toString(36).substr(2, 9);

    simulatedRemoteDatabase.overrides.push(override);

    simulatedRemoteDatabase.auditLogs.push({
      auditId,
      timestamp,
      actorId: actor.uid,
      actorRole: actor.role,
      action: "CREATE_OVERRIDE",
      details: `Created non-critical override for item "${override.itemId}" with reason: "${override.reason}".`,
      pageId: override.pageId,
      environment: override.scope === "production" ? "production" : "staging",
      buildId: override.buildId,
    });
  }

  async getAuditLogs(pageId: string, environment: Environment): Promise<AuditRecord[]> {
    return simulatedRemoteDatabase.auditLogs.filter(
      (l) => l.pageId === pageId && l.environment === environment
    );
  }
}

export class LocalDeveloperReadinessRepository implements DeveloperReadinessRepository {
  status = "available" as const;

  private isBrowser(): boolean {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
  }

  private getLocalStorageRecords(key: string): ReadinessCheckRecord[] {
    if (!this.isBrowser()) return [];
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private getLocalStorageAudits(key: string): AuditRecord[] {
    if (!this.isBrowser()) return [];
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  async getChecklistRecords(pageId: string, environment: Environment, buildId: string): Promise<ReadinessCheckRecord[]> {
    if (environment === "staging" || environment === "production") {
      throw new Error("Local repository cannot access staging or production records.");
    }
    const key = `kallisto_readiness_${pageId}_${environment}`;
    return this.getLocalStorageRecords(key);
  }

  async saveChecklistRecord(record: ReadinessCheckRecord, actor: { uid: string; role: string }): Promise<void> {
    if (record.environment === "staging" || record.environment === "production") {
      throw new Error("Local repository cannot write staging or production records.");
    }

    const key = `kallisto_readiness_${record.pageId}_${record.environment}`;
    const existing = this.getLocalStorageRecords(key);
    const timestamp = new Date().toISOString();

    const newRecord: ReadinessCheckRecord = {
      ...record,
      checkedBy: actor.uid,
      checkedAt: timestamp,
    };

    const updated = existing.filter((r) => r.itemId !== record.itemId);
    updated.push(newRecord);

    if (this.isBrowser()) {
      localStorage.setItem(key, JSON.stringify(updated));
    }

    // Save Audit
    const auditKey = `kallisto_audit_${record.pageId}_${record.environment}`;
    const existingAudits = this.getLocalStorageAudits(auditKey);
    const auditLog: AuditRecord = {
      auditId: "audit_" + Math.random().toString(36).substr(2, 9),
      timestamp,
      actorId: actor.uid,
      actorRole: actor.role,
      action: "UPDATE_CHECKLIST_ITEM",
      details: `Updated checklist item "${record.itemId}" status to "${record.status}".`,
      pageId: record.pageId,
      environment: record.environment,
      buildId: record.buildId || "unknown",
    };
    existingAudits.push(auditLog);

    if (this.isBrowser()) {
      localStorage.setItem(auditKey, JSON.stringify(existingAudits));
    }
  }

  async getOverrides(pageId: string, buildId: string, environment: Environment): Promise<AcceptedRiskOverride[]> {
    if (environment === "staging" || environment === "production") {
      throw new Error("Local repository cannot access staging or production overrides.");
    }
    const key = `kallisto_overrides_${pageId}_local`;
    if (!this.isBrowser()) return [];
    try {
      const data = localStorage.getItem(key);
      const parsed: AcceptedRiskOverride[] = data ? JSON.parse(data) : [];
      return parsed.filter((o) => o.buildId === buildId);
    } catch {
      return [];
    }
  }

  async saveOverride(override: AcceptedRiskOverride, actor: { uid: string; role: string }): Promise<void> {
    const key = `kallisto_overrides_${override.pageId}_local`;
    if (!this.isBrowser()) return;

    try {
      const data = localStorage.getItem(key);
      const existing: AcceptedRiskOverride[] = data ? JSON.parse(data) : [];
      existing.push(override);
      localStorage.setItem(key, JSON.stringify(existing));

      // Save Audit
      const auditKey = `kallisto_audit_${override.pageId}_local`;
      const existingAudits = this.getLocalStorageAudits(auditKey);
      existingAudits.push({
        auditId: "audit_" + Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        actorId: actor.uid,
        actorRole: actor.role,
        action: "CREATE_OVERRIDE",
        details: `Created override for item "${override.itemId}".`,
        pageId: override.pageId,
        environment: "local",
        buildId: override.buildId,
      });
      localStorage.setItem(auditKey, JSON.stringify(existingAudits));
    } catch {
      // ignore
    }
  }

  async getAuditLogs(pageId: string, environment: Environment): Promise<AuditRecord[]> {
    if (environment === "staging" || environment === "production") {
      throw new Error("Local repository cannot access staging or production audit logs.");
    }
    const key = `kallisto_audit_${pageId}_${environment}`;
    return this.getLocalStorageAudits(key);
  }
}

export function getReadinessRepository(environment: Environment, simulationMode: boolean): DeveloperReadinessRepository {
  if (simulationMode) {
    if (environment === "staging" || environment === "production") {
      throw new Error("Simulation mode is not allowed in staging or production.");
    }
    return new MockRemoteDeveloperReadinessRepository();
  }

  if (environment === "staging" || environment === "production") {
    return new RemoteDeveloperReadinessRepository();
  }

  return new LocalDeveloperReadinessRepository();
}
