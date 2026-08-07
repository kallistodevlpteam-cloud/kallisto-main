import React, { useEffect, useRef, useState } from "react";
import { X, RefreshCw } from "lucide-react";
import { DeveloperConsoleHook } from "../hooks/useDeveloperConsole";
import { usePageDiagnostics } from "../hooks/usePageDiagnostics";
import { ReadinessOverview } from "./ReadinessOverview";
import { BackendActionMap } from "./BackendActionMap";
import { ReadinessChecklist } from "./ReadinessChecklist";
import { LiveDiagnostics } from "./LiveDiagnostics";
import { DataInspector } from "./DataInspector";
import { DeveloperIssues } from "./DeveloperIssues";
import { DeploymentGate } from "./DeploymentGate";

interface DeveloperReadinessDrawerProps {
  onClose: () => void;
  consoleState: DeveloperConsoleHook;
}

export function DeveloperReadinessDrawer({ onClose, consoleState }: DeveloperReadinessDrawerProps) {
  const {
    manifest,
    isMissing,
    pathname,
    buildId,
    commitId,
    appVersion,
    resolvedPageName,
    activeEnvironment,
    activeUser,
    readiness,
    simulationMode,
  } = consoleState;

  const [activeTab, setActiveTab] = useState<"overview" | "actions" | "checklist" | "diagnostics" | "inspector" | "issues" | "gate">("overview");

  const drawerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Load diagnostics results
  const {
    results: diagnosticResults,
    isRunning: isDiagRunning,
    refresh: refreshDiagnostics,
    lastRunTimestamp,
  } = usePageDiagnostics(manifest, activeEnvironment, buildId, simulationMode);

  // Focus trap & Escape closing
  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;

    if (drawerRef.current) {
      const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex="0"]'
      );
      const activeElement = Array.from(focusable).find(
        (el) => el.tabIndex !== -1 && !el.hasAttribute("disabled") && el.tagName !== "SELECT"
      );
      if (activeElement) {
        activeElement.focus();
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key === "Tab" && drawerRef.current) {
        const focusable = Array.from(
          drawerRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex="0"]'
          )
        ).filter((el) => el.tabIndex !== -1 && !el.hasAttribute("disabled"));

        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            last.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === last) {
            first.focus();
            e.preventDefault();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === "function") {
        previousFocusRef.current.focus();
      }
    };
  }, [onClose]);

  const manifestId = manifest ? manifest.pageId : "manifest-missing";
  const isMoreActive = ["inspector", "issues", "gate"].includes(activeTab);

  return (
    <aside
      className="dev-console-drawer"
      ref={drawerRef}
      role="complementary"
      aria-label="Developer readiness console drawer"
    >
      <header className="dev-console-drawer-header">
        <div className="dev-console-header-top">
          <div>
            <h2>{resolvedPageName}</h2>
            {isMissing ? (
              <div style={{ fontSize: "11px", color: "#b91c1c", fontWeight: "600" }}>Manifest not registered</div>
            ) : (
              <div style={{ fontSize: "11px", color: "var(--soft)", fontFamily: "monospace" }}>{pathname}</div>
            )}
          </div>
          <button
            type="button"
            className="dev-console-close-btn"
            onClick={onClose}
            aria-label="Close developer console"
            title="Close developer console"
          >
            <X size={18} />
          </button>
        </div>

        <div className="dev-console-header-meta">
          <span>Provider ID: <strong>{activeUser?.providerId || "N/A"}</strong></span>
          <span>Manifest ID: <strong>{manifestId}</strong></span>
          <span>App Version: <strong>{appVersion}</strong></span>
          <span>Build ID: <strong>{buildId}</strong></span>
          <span>Env: <strong>{activeEnvironment}</strong></span>
          <span>
            Last Diag: <strong>
              {lastRunTimestamp ? new Date(lastRunTimestamp).toLocaleTimeString() : "N/A"}
            </strong>
            <button
              onClick={refreshDiagnostics}
              style={{ background: "transparent", border: 0, padding: "0 4px", cursor: "pointer", marginLeft: "4px" }}
              title="Rerun Diagnostics"
              disabled={isDiagRunning}
              type="button"
            >
              <RefreshCw size={10} className={isDiagRunning ? "spin" : ""} />
            </button>
          </span>
        </div>

        {isMissing && (
          <div style={{ marginTop: "10px", background: "#fef2f2", border: "1px solid #fca5a5", color: "#991b1b", padding: "6px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "600" }}>
            ⚠️ System Blocker: MANIFEST_MISSING (Verification blocked)
          </div>
        )}

        <div className="dev-console-readiness-bar-wrap">
          <div className="dev-console-readiness-label">
            <span>Overall Readiness</span>
            <span>{readiness.percentage !== null ? `${readiness.percentage}%` : "N/A"}</span>
          </div>
          <div className="dev-console-readiness-bar">
            <div
              className="dev-console-readiness-progress"
              style={{
                width: readiness.percentage !== null ? `${readiness.percentage}%` : "100%",
                background: readiness.percentage === null ? "#9ca3af" : readiness.hasFailedCriticalCheck ? "#ef4444" : "#10b981",
              }}
            />
          </div>
        </div>
      </header>

      {/* Wrapping accessible Tab switcher */}
      <nav className="dev-console-tabs" aria-label="Readiness sections">
        <button
          type="button"
          className={`dev-console-tab-btn ${activeTab === "overview" ? "is-active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          type="button"
          className={`dev-console-tab-btn ${activeTab === "actions" ? "is-active" : ""}`}
          onClick={() => setActiveTab("actions")}
        >
          Actions
        </button>
        <button
          type="button"
          className={`dev-console-tab-btn ${activeTab === "checklist" ? "is-active" : ""}`}
          onClick={() => setActiveTab("checklist")}
        >
          Checklist
        </button>
        <button
          type="button"
          className={`dev-console-tab-btn ${activeTab === "diagnostics" ? "is-active" : ""}`}
          onClick={() => setActiveTab("diagnostics")}
        >
          Diagnostics
        </button>
        
        <select
          className={`dev-console-tab-btn dev-console-select-tab ${isMoreActive ? "is-active" : ""}`}
          value={isMoreActive ? activeTab : "more"}
          onChange={(e) => {
            const val = e.target.value;
            if (val !== "more") {
              setActiveTab(val as any);
            }
          }}
          aria-label="More sections"
        >
          <option value="more" disabled>
            {isMoreActive
              ? `More: ${
                  activeTab === "inspector"
                    ? "Inspector"
                    : activeTab === "issues"
                    ? "Issues"
                    : "Gate"
                }`
              : "More ▾"}
          </option>
          <option value="inspector">Data Inspector</option>
          <option value="issues">Issues</option>
          <option value="gate">Deployment Gate</option>
        </select>
      </nav>

      {/* Tab Panels */}
      <div className="dev-console-content">
        {activeTab === "overview" && <ReadinessOverview consoleState={consoleState} />}
        {activeTab === "actions" && <BackendActionMap consoleState={consoleState} />}
        {activeTab === "checklist" && <ReadinessChecklist consoleState={consoleState} />}
        {activeTab === "diagnostics" && (
          <LiveDiagnostics
            manifest={manifest}
            results={diagnosticResults}
            isRunning={isDiagRunning}
            onRefresh={refreshDiagnostics}
          />
        )}
        {activeTab === "inspector" && <DataInspector pageId={manifest?.pageId || "unknown"} providerId={activeUser?.providerId} />}
        {activeTab === "issues" && <DeveloperIssues consoleState={consoleState} />}
        {activeTab === "gate" && <DeploymentGate consoleState={consoleState} diagnosticResults={diagnosticResults} />}
      </div>
    </aside>
  );
}
