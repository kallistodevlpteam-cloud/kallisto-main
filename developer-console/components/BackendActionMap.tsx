import React, { useState } from "react";
import { DeveloperConsoleHook } from "../hooks/useDeveloperConsole";

interface BackendActionMapProps {
  consoleState: DeveloperConsoleHook;
}

export function BackendActionMap({ consoleState }: BackendActionMapProps) {
  const { manifest, actionRecords, isMissing } = consoleState;
  const [statusFilter, setStatusFilter] = useState<string>("all");

  if (!manifest || isMissing) {
    return (
      <p style={{ color: "var(--muted)", fontSize: "12px", textAlign: "center", marginTop: "20px" }}>
        Backend Actions are disabled because the page manifest is missing.
      </p>
    );
  }

  const actions = manifest.backendActions;
  const recordMap = new Map(actionRecords.map((r) => [r.actionId, r]));

  const filteredActions = actions.filter((action) => {
    const record = recordMap.get(action.actionId);
    const status = record ? record.status : "not_verified";
    if (statusFilter === "all") return true;
    return status === statusFilter;
  });

  return (
    <div>
      <div className="inspector-toolbar">
        <label htmlFor="actionFilterSelect" className="sr-only">Filter by Status</label>
        <select
          id="actionFilterSelect"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="inspector-search"
          style={{ width: "100%" }}
        >
          <option value="all">All Statuses</option>
          <option value="not_verified">not_verified</option>
          <option value="not_started">not_started</option>
          <option value="mocked">mocked</option>
          <option value="partial">partial</option>
          <option value="connected">connected</option>
          <option value="tested">tested</option>
          <option value="blocked">blocked</option>
          <option value="failed">failed</option>
        </select>
      </div>

      <div>
        {filteredActions.length === 0 ? (
          <p style={{ color: "var(--soft)", fontSize: "12px", textAlign: "center" }}>
            No backend actions found matching filter.
          </p>
        ) : (
          filteredActions.map((action) => {
            const record = recordMap.get(action.actionId);
            const status = record ? record.status : "not_verified";

            let pillClass = "neutral";
            if (status === "tested" || status === "connected") pillClass = "success";
            else if (status === "mocked" || status === "partial") pillClass = "warning";
            else if (status === "blocked" || status === "failed") pillClass = "error";

            return (
              <div className="action-card" key={action.actionId}>
                <div className="action-card-header">
                  <h5>{action.actionName}</h5>
                  <span className={`status-pill ${pillClass}`}>{status}</span>
                </div>
                <div className="action-meta-list">
                  <div className="action-meta-item">
                    UI Component: <strong>{action.uiComponent}</strong>
                  </div>
                  <div className="action-meta-item">
                    Event Handler: <strong>{action.eventHandler}</strong>
                  </div>
                  <div className="action-meta-item">
                    Service Method: <strong>{action.serviceMethod}</strong>
                  </div>
                  <div className="action-meta-item">
                    API Endpoint: <strong>{action.apiEndpoint}</strong>
                  </div>
                  <div className="action-meta-item">
                    DB Target: <strong>{action.databaseTarget}</strong>
                  </div>
                  <div className="action-meta-item">
                    Permission: <strong>{action.requiredPermission}</strong>
                  </div>
                  {action.notes && (
                    <div className="action-meta-item" style={{ marginTop: "4px", fontStyle: "italic" }}>
                      Note: {action.notes}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
