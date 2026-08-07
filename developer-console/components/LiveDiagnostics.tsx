import React from "react";
import { DiagnosticResult, PageReadinessManifest } from "../types/developerConsole.types";
import { diagnosticsService } from "../services/diagnosticsService";

interface LiveDiagnosticsProps {
  manifest: PageReadinessManifest | null;
  results: DiagnosticResult[];
  isRunning: boolean;
  onRefresh: () => void;
}

export function LiveDiagnostics({ manifest, results, isRunning, onRefresh }: LiveDiagnosticsProps) {
  if (!manifest) return <div>No manifest loaded.</div>;

  const errors = diagnosticsService.getRecentErrors();
  const failedReqs = diagnosticsService.getRecentFailedRequests();

  return (
    <div>
      <div className="inspector-toolbar">
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRunning}
          className="inspector-copy-btn"
          style={{ width: "100%" }}
        >
          {isRunning ? "Running Diagnostics..." : "Refresh Live Diagnostics"}
        </button>
      </div>

      <div className="diag-list">
        {results.map((res) => {
          let statusClass = "neutral";
          if (res.status === "success") statusClass = "success";
          else if (res.status === "warning") statusClass = "warning";
          else if (
            res.status === "error" ||
            res.status === "missing" ||
            res.status === "invalid" ||
            res.status === "unavailable"
          ) {
            statusClass = "error";
          }

          return (
            <div className="diag-row" key={res.key}>
              <div className="diag-header">
                <span className="diag-label">{res.key.replace("_", " ")}</span>
                <span className={`status-pill ${statusClass}`}>{res.status}</span>
              </div>
              <div className="diag-desc">
                Trust Level: <strong>{res.trustLevel}</strong>
              </div>
              {res.safeDetails && <div className="diag-details">{res.safeDetails}</div>}
              <div style={{ fontSize: "10px", color: "var(--soft)", marginTop: "4px" }}>
                Checked at {new Date(res.checkedAt).toLocaleTimeString()}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: "24px" }}>
        <h4 style={{ margin: "0 0 10px 0", fontSize: "13px" }}>Captured Frontend Page Errors ({errors.length})</h4>
        {errors.length === 0 ? (
          <p style={{ color: "var(--soft)", fontSize: "11.5px" }}>No uncaught runtime errors recorded.</p>
        ) : (
          <div className="json-inspector-box" style={{ maxHeight: "160px", background: "#f8f9fa", color: "#374151", border: "1px solid var(--line-strong)" }}>
            {errors.map((err, idx) => (
              <div key={idx} style={{ marginBottom: "6px", color: "#b91c1c", fontSize: "11px" }}>
                • {err}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: "20px" }}>
        <h4 style={{ margin: "0 0 10px 0", fontSize: "13px" }}>Failed Network Requests ({failedReqs.length})</h4>
        {failedReqs.length === 0 ? (
          <p style={{ color: "var(--soft)", fontSize: "11.5px" }}>No failed network requests logged.</p>
        ) : (
          <div className="json-inspector-box" style={{ maxHeight: "160px", background: "#f8f9fa", color: "#374151", border: "1px solid var(--line-strong)" }}>
            {failedReqs.map((req, idx) => (
              <div key={idx} style={{ marginBottom: "6px", color: "#b45309", fontSize: "11px" }}>
                • {req}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
