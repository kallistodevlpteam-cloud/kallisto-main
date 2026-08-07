import { DeveloperIssue, Environment } from "../types/developerConsole.types";
import { simulatedRemoteDatabase } from "./readinessService";

export interface DeveloperIssueRepository {
  status: "available" | "unavailable";
  getIssues(pageId: string, environment: Environment): Promise<DeveloperIssue[]>;
  saveIssue(issue: DeveloperIssue, environment: Environment, actor: { uid: string; role: string }): Promise<void>;
  updateIssueStatus(
    issueId: string,
    status: DeveloperIssue["status"],
    resolutionNotes: string | undefined,
    environment: Environment,
    actor: { uid: string; role: string }
  ): Promise<void>;
}

// Global server-side simulated database for staging/production issues
export const simulatedRemoteIssues = {
  issues: [] as DeveloperIssue[],
};

// Real production Remote issue repository (Fails closed / unavailable)
export class RemoteDeveloperIssueRepository implements DeveloperIssueRepository {
  status = "unavailable" as const;

  async getIssues(pageId: string, environment: Environment): Promise<DeveloperIssue[]> {
    return [];
  }

  async saveIssue(issue: DeveloperIssue, environment: Environment, actor: { uid: string; role: string }): Promise<void> {
    throw new Error("Persistence status unavailable. Production remote repository is not connected.");
  }

  async updateIssueStatus(
    issueId: string,
    status: DeveloperIssue["status"],
    resolutionNotes: string | undefined,
    environment: Environment,
    actor: { uid: string; role: string }
  ): Promise<void> {
    throw new Error("Persistence status unavailable. Production remote repository is not connected.");
  }
}

// Mock Remote issue repository for Simulation Mode inside local/dev
export class MockRemoteDeveloperIssueRepository implements DeveloperIssueRepository {
  status = "available" as const;

  async getIssues(pageId: string, environment: Environment): Promise<DeveloperIssue[]> {
    return simulatedRemoteIssues.issues.filter((i) => i.pageId === pageId);
  }

  async saveIssue(issue: DeveloperIssue, environment: Environment, actor: { uid: string; role: string }): Promise<void> {
    const trustedRoles = ["developer", "super_admin", "qa"];
    if (!trustedRoles.includes(actor.role)) {
      throw new Error("Server Authorization Error: Unauthorized role for creating issues.");
    }

    simulatedRemoteIssues.issues.push(issue);

    const auditId = "audit_" + Math.random().toString(36).substr(2, 9);
    simulatedRemoteDatabase.auditLogs.push({
      auditId,
      timestamp: new Date().toISOString(),
      actorId: actor.uid,
      actorRole: actor.role,
      action: "CREATE_ISSUE",
      details: `Created issue "${issue.title}" with severity "${issue.severity}".`,
      pageId: issue.pageId,
      environment,
      buildId: "unknown",
    });
  }

  async updateIssueStatus(
    issueId: string,
    status: DeveloperIssue["status"],
    resolutionNotes: string | undefined,
    environment: Environment,
    actor: { uid: string; role: string }
  ): Promise<void> {
    const trustedRoles = ["developer", "super_admin", "qa"];
    if (!trustedRoles.includes(actor.role)) {
      throw new Error("Server Authorization Error: Unauthorized role for updating issues.");
    }

    const issue = simulatedRemoteIssues.issues.find((i) => i.issueId === issueId);
    if (!issue) {
      throw new Error("Server Error: Issue not found.");
    }

    const oldStatus = issue.status;
    issue.status = status;
    if (status === "resolved") {
      issue.resolvedDate = new Date().toISOString();
      issue.resolutionNotes = resolutionNotes;
    }

    const auditId = "audit_" + Math.random().toString(36).substr(2, 9);
    simulatedRemoteDatabase.auditLogs.push({
      auditId,
      timestamp: new Date().toISOString(),
      actorId: actor.uid,
      actorRole: actor.role,
      action: "UPDATE_ISSUE_STATUS",
      details: `Updated issue "${issue.title}" status from "${oldStatus}" to "${status}".`,
      pageId: issue.pageId,
      environment,
      buildId: "unknown",
    });
  }
}

export class LocalDeveloperIssueRepository implements DeveloperIssueRepository {
  status = "available" as const;

  private isBrowser(): boolean {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
  }

  private getLocalStorageIssues(key: string): DeveloperIssue[] {
    if (!this.isBrowser()) return [];
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  async getIssues(pageId: string, environment: Environment): Promise<DeveloperIssue[]> {
    if (environment === "staging" || environment === "production") {
      throw new Error("Local repository cannot access staging or production issues.");
    }
    const key = `kallisto_issues_${pageId}_local`;
    return this.getLocalStorageIssues(key);
  }

  async saveIssue(issue: DeveloperIssue, environment: Environment, actor: { uid: string; role: string }): Promise<void> {
    if (environment === "staging" || environment === "production") {
      throw new Error("Local repository cannot write staging or production issues.");
    }
    if (!this.isBrowser()) return;

    const key = `kallisto_issues_${issue.pageId}_local`;
    const existing = this.getLocalStorageIssues(key);
    existing.push(issue);
    localStorage.setItem(key, JSON.stringify(existing));
  }

  async updateIssueStatus(
    issueId: string,
    status: DeveloperIssue["status"],
    resolutionNotes: string | undefined,
    environment: Environment,
    actor: { uid: string; role: string }
  ): Promise<void> {
    if (environment === "staging" || environment === "production") {
      throw new Error("Local repository cannot write staging or production issues.");
    }
    if (!this.isBrowser()) return;

    let foundKey = "";
    let foundIssues: DeveloperIssue[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("kallisto_issues_") && key.endsWith("_local")) {
        const data = localStorage.getItem(key);
        const parsed: DeveloperIssue[] = data ? JSON.parse(data) : [];
        if (parsed.some((issue) => issue.issueId === issueId)) {
          foundKey = key;
          foundIssues = parsed;
          break;
        }
      }
    }

    if (!foundKey) {
      throw new Error("Local Error: Issue not found.");
    }

    const updated = foundIssues.map((issue) => {
      if (issue.issueId === issueId) {
        const resolvedDate = status === "resolved" ? new Date().toISOString() : undefined;
        return {
          ...issue,
          status,
          resolvedDate,
          resolutionNotes,
        };
      }
      return issue;
    });

    localStorage.setItem(foundKey, JSON.stringify(updated));
  }
}

export function getIssueRepository(environment: Environment, simulationMode: boolean): DeveloperIssueRepository {
  if (simulationMode) {
    if (environment === "staging" || environment === "production") {
      throw new Error("Simulation mode is not allowed in staging or production.");
    }
    return new MockRemoteDeveloperIssueRepository();
  }

  if (environment === "staging" || environment === "production") {
    return new RemoteDeveloperIssueRepository();
  }

  return new LocalDeveloperIssueRepository();
}
