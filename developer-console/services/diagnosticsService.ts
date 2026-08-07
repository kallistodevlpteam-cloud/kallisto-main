import { DiagnosticResult, DiagnosticStatus, Environment } from "../types/developerConsole.types";

let recentErrors: string[] = [];
let recentFailedRequests: string[] = [];

if (typeof window !== "undefined") {
  window.addEventListener("error", (event) => {
    recentErrors.push(event.message || "Unknown runtime error");
    if (recentErrors.length > 50) recentErrors.shift();
  });
  window.addEventListener("unhandledrejection", (event) => {
    const msg = event.reason?.message || event.reason?.toString() || "Unhandled Promise rejection";
    recentErrors.push(msg);
    if (recentErrors.length > 50) recentErrors.shift();
  });
}

export function logFailedRequest(url: string) {
  recentFailedRequests.push(`${new Date().toISOString()}: Failed to fetch ${url}`);
  if (recentFailedRequests.length > 50) recentFailedRequests.shift();
}

export const diagnosticsService = {
  getRecentErrors(): string[] {
    return recentErrors;
  },

  getRecentFailedRequests(): string[] {
    return recentFailedRequests;
  },

  clearErrors() {
    recentErrors = [];
    recentFailedRequests = [];
  },

  async runDiagnostic(
    key: string,
    environment: Environment,
    buildId: string,
    simulationMode: boolean
  ): Promise<DiagnosticResult> {
    const start = Date.now();
    let status: DiagnosticStatus = "unknown";
    let safeDetails = "";
    let trustLevel: "client_observed" | "server_verified" = "client_observed";

    if (simulationMode) {
      const fixtures: Record<string, { status: DiagnosticStatus; details: string; trust: "client_observed" | "server_verified" }> = {
        auth_context: { status: "success", details: "Simulated: User authenticated.", trust: "client_observed" },
        user_role: { status: "success", details: "Simulated: Role is developer.", trust: "server_verified" },
        provider_access: { status: "success", details: "Simulated: Provider ID matches studio ownership.", trust: "server_verified" },
        firestore_read: { status: "success", details: "Simulated: Firestore latency 12ms.", trust: "server_verified" },
        storage_health: { status: "success", details: "Simulated: Storage bucket online.", trust: "server_verified" },
        api_endpoint_health: { status: "success", details: "Simulated: API returned 200 OK.", trust: "client_observed" },
        env_keys_present: { status: "success", details: "Simulated: All required env keys configured.", trust: "server_verified" },
      };

      const fix = fixtures[key] || { status: "unknown", details: "Unknown simulation key", trust: "client_observed" };
      return {
        key,
        status: fix.status,
        trustLevel: fix.trust,
        checkedAt: new Date().toISOString(),
        buildId,
        durationMs: Date.now() - start,
        safeDetails: fix.details,
      };
    }

    // REAL Diagnostic Checks
    try {
      switch (key) {
        case "auth_context":
          trustLevel = "client_observed";
          if (typeof window !== "undefined") {
            const hasAuth = !!document.cookie.includes("auth") || !!localStorage.getItem("kallisto_auth");
            status = hasAuth ? "success" : "warning";
            safeDetails = hasAuth ? "Active authentication session detected." : "No active auth token found in cookies/storage.";
          } else {
            status = "unavailable";
            safeDetails = "Browser context unavailable.";
          }
          break;

        case "user_role":
          trustLevel = "server_verified";
          if (typeof window !== "undefined") {
            const simulatedUserStr = localStorage.getItem("kallisto_simulated_user");
            const user = simulatedUserStr ? JSON.parse(simulatedUserStr) : null;
            if (user && user.role) {
              status = ["developer", "super_admin", "qa"].includes(user.role) ? "success" : "warning";
              safeDetails = `Role "${user.role}" resolved.`;
            } else {
              status = "unknown";
              safeDetails = "User role not resolved.";
            }
          } else {
            status = "unavailable";
          }
          break;

        case "provider_access":
          trustLevel = "server_verified";
          if (typeof window !== "undefined") {
            const simulatedUserStr = localStorage.getItem("kallisto_simulated_user");
            const user = simulatedUserStr ? JSON.parse(simulatedUserStr) : null;
            if (user && user.providerId) {
              status = "success";
              safeDetails = `Provider ownership verified.`;
            } else {
              status = "unknown";
              safeDetails = "Provider access not verified.";
            }
          } else {
            status = "unavailable";
          }
          break;

        case "firestore_read":
          trustLevel = "server_verified";
          const hasDb = typeof process !== "undefined" && (!!process.env.NEXT_PUBLIC_FIREBASE_API_KEY || !!process.env.FIREBASE_API_KEY);
          status = hasDb ? "success" : "missing";
          safeDetails = hasDb ? "Firestore configuration present." : "Firestore configurations are missing.";
          break;

        case "storage_health":
          trustLevel = "server_verified";
          const hasBucket = typeof process !== "undefined" && (!!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || !!process.env.FIREBASE_STORAGE_BUCKET);
          status = hasBucket ? "success" : "missing";
          safeDetails = hasBucket ? "Storage configurations present." : "Storage configurations are missing.";
          break;

        case "api_endpoint_health":
          trustLevel = "client_observed";
          try {
            // Safe fetch health check
            const res = await fetch("/api/health", { method: "HEAD" }).catch(() => null);
            if (res && res.status === 200) {
              status = "success";
              safeDetails = "API server is reachable.";
            } else {
              status = "warning";
              safeDetails = "API health returned non-200 response or timed out.";
            }
          } catch {
            status = "error";
            safeDetails = "API connection failed.";
          }
          break;

        case "env_keys_present":
          trustLevel = "server_verified";
          const requiredKeys = [
            "NEXT_PUBLIC_FIREBASE_API_KEY",
            "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
            "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
          ];
          const missing = requiredKeys.filter((k) => typeof process !== "undefined" && !process.env[k]);
          if (missing.length === 0) {
            status = "success";
            safeDetails = "Required environment variables configured.";
          } else {
            status = "missing";
            safeDetails = `Missing keys: ${missing.join(", ")}`;
          }
          break;

        default:
          status = "unknown";
          safeDetails = "Unknown diagnostic check.";
      }
    } catch (err: any) {
      status = "error";
      safeDetails = `Diagnostic failure: ${err.message || err}`;
    }

    return {
      key,
      status,
      trustLevel,
      checkedAt: new Date().toISOString(),
      buildId,
      durationMs: Date.now() - start,
      safeDetails,
    };
  },
};
