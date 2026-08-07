import React, { useState } from "react";
import { DeveloperConsoleHook } from "../hooks/useDeveloperConsole";
import { evaluateDeploymentGate } from "../utils/evaluateDeploymentGate";

interface DeploymentGateProps {
  consoleState: DeveloperConsoleHook;
  diagnosticResults: any[];
}

export function DeploymentGate({ consoleState, diagnosticResults }: DeploymentGateProps) {
  const {
    manifest,
    checklistRecords,
    actionRecords,
    issues,
    overrides,
    auditLogs,
    buildId,
    activeEnvironment,
    createOverride,
    persistenceStatus,
  } = consoleState;

  const [targetItemId, setTargetItemId] = useState("");
  const [approver, setApprover] = useState("");
  const [reason, setReason] = useState("");
  const [expiry, setExpiry] = useState("");
  const [scope, setScope] = useState<"staging" | "production" | "both">("staging");

  const gateResult = evaluateDeploymentGate(
    manifest,
    manifest ? manifest.checklistRequirements : [],
    checklistRecords,
    manifest ? manifest.backendActions : [],
    actionRecords,
    issues,
    diagnosticResults,
    buildId,
    activeEnvironment,
    overrides,
    persistenceStatus
  );

  const handleSubmitOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetItemId || !approver || !reason || !expiry) return;
    await createOverride(targetItemId, reason, expiry, scope);
    setTargetItemId("");
    setApprover("");
    setReason("");
    setExpiry("");
    setScope("staging");
  };

  const checks = manifest ? manifest.checklistRequirements : [];
  const recordsMap = new Map(checklistRecords.map((r) => [r.itemId, r]));
  const overrideMap = new Map(overrides.map((o) => [o.itemId, o]));

  const overrideableChecks = checks.filter((check) => {
    const isCritical =
      check.isRequired ||
      ["authentication", "security", "data_loading"].includes(check.category) ||
      check.blockingLevel === "production";

    if (isCritical) return false;

    const record = recordsMap.get(check.itemId);
    const status = record ? record.status : "not_verified";
    const isFailed = status !== "connected" && status !== "tested" && status !== "skipped_with_reason";

    return isFailed && !overrideMap.has(check.itemId);
  });

  let gateClass = "production_blocked";
  let gateText = "Production Blocked";
  if (gateResult.status === "ready_for_production") {
    gateClass = "ready_for_production";
    gateText = "Ready for Production";
  } else if (gateResult.status === "ready_for_staging") {
    gateClass = "ready_for_staging";
    gateText = "Ready for Staging";
  } else if (gateResult.status === "staging_verification_required") {
    gateClass = "staging_verification_required";
    gateText = "Staging Verification Required";
  } else if (gateResult.status === "not_ready") {
    gateClass = "not_ready";
    gateText = "Not Ready";
  }

  return (
    <div>
      <div className={`gate-status-box ${gateClass}`}>
        <div className="gate-status-title">{gateText}</div>
        <div style={{ fontSize: "11px", marginTop: "4px" }}>Build: {buildId}</div>
      </div>

      {gateResult.reasons.length > 0 && (
        <div className="gate-reasons-list">
          <h5>Deployment Blockers / Warnings ({gateResult.reasons.length})</h5>
          <ul>
            {gateResult.reasons.map((reason, index) => (
              <li key={index}>{reason}</li>
            ))}
          </ul>
        </div>
      )}

      {gateResult.overridesAllowed && overrideableChecks.length > 0 && (
        <form className="issue-form" onSubmit={handleSubmitOverride} style={{ marginTop: "24px" }}>
          <h4>Create Risk Override</h4>
          <div className="issue-form-row">
            <label htmlFor="overrideItemSelect">Failing Non-Critical Item</label>
            <select
              id="overrideItemSelect"
              value={targetItemId}
              onChange={(e) => setTargetItemId(e.target.value)}
              required
            >
              <option value="">-- Select Item --</option>
              {overrideableChecks.map((check) => (
                <option key={check.itemId} value={check.itemId}>
                  {check.title}
                </option>
              ))}
            </select>
          </div>

          <div className="issue-form-row">
            <label htmlFor="overrideApproverInput">Authorized Approver Name</label>
            <input
              id="overrideApproverInput"
              type="text"
              placeholder="e.g. Lead QA Developer"
              value={approver}
              onChange={(e) => setApprover(e.target.value)}
              required
            />
          </div>

          <div className="issue-form-row">
            <label htmlFor="overrideReasonInput">Justification Reason</label>
            <input
              id="overrideReasonInput"
              type="text"
              placeholder="e.g. Postponed validation till sprint-3"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>

          <div className="issue-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
              <label htmlFor="overrideExpiryInput">Expiry Date</label>
              <input
                id="overrideExpiryInput"
                type="date"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="overrideScopeSelect">Scope</label>
              <select
                id="overrideScopeSelect"
                value={scope}
                onChange={(e) => setScope(e.target.value as any)}
              >
                <option value="staging">staging</option>
                <option value="production">production</option>
                <option value="both">both</option>
              </select>
            </div>
          </div>

          <button type="submit" className="issue-submit-btn">
            Submit Risk Override
          </button>
        </form>
      )}

      {overrides.length > 0 && (
        <div style={{ marginTop: "24px" }}>
          <h4 style={{ margin: "0 0 10px 0", fontSize: "13px" }}>Active Overrides ({overrides.length})</h4>
          {overrides.map((override) => (
            <div className="checklist-row" key={override.overrideId} style={{ background: "#fffbeb", border: "1px solid #fcd34d" }}>
              <div style={{ fontSize: "12px", fontWeight: "600" }}>
                Item ID: {override.itemId}
              </div>
              <div style={{ fontSize: "11px", color: "var(--muted)", marginTop: "4px" }}>
                Approver: <strong>{override.approver}</strong> | Scope: <strong>{override.scope}</strong> | Expiry: <strong>{new Date(override.expiryDate).toLocaleDateString()}</strong>
              </div>
              <p style={{ fontSize: "11.5px", margin: "6px 0 0 0", fontStyle: "italic" }}>Reason: {override.reason}</p>
            </div>
          ))}
        </div>
      )}

      {auditLogs.length > 0 && (
        <div style={{ marginTop: "24px" }}>
          <h4 style={{ margin: "0 0 10px 0", fontSize: "13px" }}>Immutable Audit Logs ({auditLogs.length})</h4>
          <div className="json-inspector-box" style={{ maxHeight: "200px", background: "#f8f9fa", color: "#374151", border: "1px solid var(--line-strong)", fontSize: "11px" }}>
            {auditLogs
              .slice()
              .reverse()
              .map((log) => (
                <div key={log.auditId} style={{ marginBottom: "8px", borderBottom: "1px dashed var(--line)", paddingBottom: "6px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "var(--soft)" }}>
                    <span>{new Date(log.timestamp).toLocaleString()}</span>
                    <strong>{log.action}</strong>
                  </div>
                  <div style={{ marginTop: "2px" }}>
                    {log.details}
                  </div>
                  <div style={{ fontSize: "10px", color: "var(--soft)", marginTop: "2px" }}>
                    Actor: {log.actorId} ({log.actorRole}) | Env: {log.environment} | Build: {log.buildId}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
