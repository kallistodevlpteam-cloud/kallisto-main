import { describe, it, expect } from "vitest";
import { canAccessDeveloperConsole } from "../../developer-console/utils/accessControl";
import { isServiceProviderVirtualOfficeRoute } from "../../developer-console/utils/routeScope";
import { calculateReadiness } from "../../developer-console/utils/calculateReadiness";
import { evaluateDeploymentGate } from "../../developer-console/utils/evaluateDeploymentGate";
import { redactSensitiveData } from "../../developer-console/utils/redactSensitiveData";
import {
  RemoteDeveloperReadinessRepository,
  getReadinessRepository,
} from "../../developer-console/services/readinessService";
import { PageReadinessManifest } from "../../developer-console/types/developerConsole.types";

describe("Developer Readiness Console Phase 1 Corrected Tests", () => {
  describe("Access Control", () => {
    it("feature flag alone cannot authorize regular users", () => {
      // regular_user with flag enabled is blocked
      expect(
        canAccessDeveloperConsole({ role: "regular_user" }, "production", { developerConsoleEnabled: true }, true)
      ).toBe(false);

      expect(
        canAccessDeveloperConsole({ role: "regular_user" }, "development", { developerConsoleEnabled: true }, true)
      ).toBe(false);
    });

    it("requires all 3 in production: role, flag, and route", () => {
      expect(
        canAccessDeveloperConsole({ role: "developer" }, "production", { developerConsoleEnabled: true }, true)
      ).toBe(true);

      expect(
        canAccessDeveloperConsole({ role: "developer" }, "production", { developerConsoleEnabled: false }, true)
      ).toBe(false);

      expect(
        canAccessDeveloperConsole({ role: "developer" }, "production", { developerConsoleEnabled: true }, false)
      ).toBe(false);
    });
  });

  describe("Route Scoping", () => {
    it("correctly matches virtual office routes and subpaths using segment boundaries", () => {
      expect(isServiceProviderVirtualOfficeRoute("/virtual-office")).toBe(true);
      expect(isServiceProviderVirtualOfficeRoute("/virtual-office/sub")).toBe(true);
      expect(isServiceProviderVirtualOfficeRoute("/calendar")).toBe(true);
      expect(isServiceProviderVirtualOfficeRoute("/projects")).toBe(true);
      expect(isServiceProviderVirtualOfficeRoute("/payments")).toBe(true);

      // Verify segment boundaries reject invalid suffix prefixes
      expect(isServiceProviderVirtualOfficeRoute("/calendar-old")).toBe(false);
      expect(isServiceProviderVirtualOfficeRoute("/projectshack")).toBe(false);
    });
  });

  describe("Missing Manifest handling", () => {
    it("returns null score for missing manifest", () => {
      const result = calculateReadiness([], [], [], [], true); // manifestMissing = true
      expect(result.percentage).toBeNull();
      expect(result.passedCount).toBe("—");
      expect(result.warningCount).toBe("—");
    });

    it("creates a system blocker and blocks production", () => {
      const gateResult = evaluateDeploymentGate(
        null, // manifest = null
        [],
        [],
        [],
        [],
        [],
        [],
        "build123",
        "production",
        []
      );

      expect(gateResult.status).toBe("production_blocked");
      expect(gateResult.reasons.includes("System blocker: MANIFEST_MISSING")).toBe(true);
    });
  });

  describe("Build Metadata Safeties", () => {
    it("blocks production readiness if build metadata is unavailable or Unknown", () => {
      const manifest = { pageId: "page1", checklistRequirements: [], backendActions: [] } as unknown as PageReadinessManifest;
      const gateResult = evaluateDeploymentGate(
        manifest,
        [],
        [],
        [],
        [],
        [],
        [],
        "Unknown", // buildId = Unknown
        "production",
        []
      );

      expect(gateResult.status).toBe("production_blocked");
      expect(gateResult.reasons.some((r) => r.includes("Build metadata is unavailable"))).toBe(true);
    });
  });

  describe("Persistence and Simulation Separation", () => {
    it("locks Simulation Mode repository from staging/production", () => {
      expect(() => getReadinessRepository("production", true)).toThrow("Simulation mode is not allowed in staging or production.");
      expect(() => getReadinessRepository("staging", true)).toThrow("Simulation mode is not allowed in staging or production.");
    });

    it("real remote failures fail closed", async () => {
      const remoteRepo = new RemoteDeveloperReadinessRepository();
      expect(remoteRepo.status).toBe("unavailable");

      await expect(
        remoteRepo.saveChecklistRecord(
          { itemId: "c1", pageId: "p1", environment: "production", status: "tested", manifestVersion: "1" },
          { uid: "dev1", role: "developer" }
        )
      ).rejects.toThrow("Persistence status unavailable");
    });
  });

  describe("Sensitive Data Redaction", () => {
    it("handles circular references, nested keys, and URL redactions", () => {
      const obj: Record<string, unknown> = { key: "secret_token", child: { apikey: "secret_api" } };
      obj.self = obj;

      const redacted = redactSensitiveData(obj);
      expect(redacted.key).toBe("[REDACTED]");
      expect((redacted.child as Record<string, unknown>).apikey).toBe("[REDACTED]");
      expect(redacted.self).toBe("[CIRCULAR_REFERENCE]");
    });
  });
});
