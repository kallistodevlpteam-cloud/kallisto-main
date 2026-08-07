import React from "react";
import { DeveloperConsoleHook } from "../hooks/useDeveloperConsole";

interface ReadinessOverviewProps {
  consoleState: DeveloperConsoleHook;
}

export function ReadinessOverview({ consoleState }: ReadinessOverviewProps) {
  const {
    readiness,
    trueEnvironment,
    simulationMode,
    setSimulationMode,
    simulatedRole,
    setSimulatedRole,
    simulatedEnvironment,
    setSimulatedEnvironment,
    simulatedFeatureFlags,
    setSimulatedFeatureFlags,
    isMissing,
    buildMetaAvailable,
  } = consoleState;

  const showSimControls = trueEnvironment === "local" || trueEnvironment === "development";

  // Score display details
  const scoreText = readiness.percentage !== null ? `${readiness.percentage}%` : "Not evaluated";
  const passedChecksText = readiness.passedCount;
  const warningsText = readiness.warningCount;

  return (
    <div>
      {isMissing && (
        <div className="sim-mode-banner" style={{ background: "#f3f4f6", border: "1px solid #d1d5db", color: "#4b5563" }}>
          ⚠️ Page Manifest is missing. Checklist, Backend Actions, and Simulations are disabled.
        </div>
      )}

      {!buildMetaAvailable && (
        <div className="sim-mode-banner" style={{ background: "#fee2e2", border: "1px solid #fca5a5", color: "#b91c1c" }}>
          ⚠️ Build metadata is unavailable. Production readiness is blocked.
        </div>
      )}

      {showSimControls && (
        <div className="dev-control-panel">
          <h4>Simulation Mode (Local/Dev Only)</h4>
          {isMissing ? (
            <p style={{ color: "#ef4444", fontSize: "12px", margin: 0 }}>
              Register the page manifest before running simulations.
            </p>
          ) : (
            <>
              <div className="dev-control-row">
                <label htmlFor="simModeToggle">Enable Simulation Mode</label>
                <input
                  id="simModeToggle"
                  type="checkbox"
                  checked={simulationMode}
                  onChange={(e) => setSimulationMode(e.target.checked)}
                />
              </div>

              {simulationMode && (
                <>
                  <div className="dev-control-row">
                    <label htmlFor="simRoleSelect">Simulated Role</label>
                    <select
                      id="simRoleSelect"
                      value={simulatedRole}
                      onChange={(e) => setSimulatedRole(e.target.value as any)}
                    >
                      <option value="developer">developer</option>
                      <option value="super_admin">super_admin</option>
                      <option value="qa">qa</option>
                      <option value="regular_user">regular_user</option>
                    </select>
                  </div>

                  <div className="dev-control-row">
                    <label htmlFor="simEnvSelect">Simulated Environment</label>
                    <select
                      id="simEnvSelect"
                      value={simulatedEnvironment}
                      onChange={(e) => setSimulatedEnvironment(e.target.value as any)}
                    >
                      <option value="local">local</option>
                      <option value="development">development</option>
                      <option value="staging">staging</option>
                      <option value="production">production</option>
                    </select>
                  </div>

                  <div className="dev-control-row">
                    <label htmlFor="simFlagsCheck">Console Feature Flag Enabled</label>
                    <input
                      id="simFlagsCheck"
                      type="checkbox"
                      checked={simulatedFeatureFlags.developerConsoleEnabled}
                      onChange={(e) =>
                        setSimulatedFeatureFlags({
                          developerConsoleEnabled: e.target.checked,
                        })
                      }
                    />
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card-title">Readiness Score</div>
          <div className="stat-card-value">{scoreText}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-title">Blockers</div>
          <div className="stat-card-value">{readiness.blockerCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-title">Passed Checks</div>
          <div className="stat-card-value">{passedChecksText}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-title">Warnings</div>
          <div className="stat-card-value">{warningsText}</div>
        </div>
      </div>
    </div>
  );
}
