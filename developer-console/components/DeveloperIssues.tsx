import React, { useState } from "react";
import { DeveloperConsoleHook } from "../hooks/useDeveloperConsole";
import { DeveloperIssue } from "../types/developerConsole.types";

interface DeveloperIssuesProps {
  consoleState: DeveloperConsoleHook;
}

export function DeveloperIssues({ consoleState }: DeveloperIssuesProps) {
  const { issues, createIssue, updateIssueStatus } = consoleState;

  // New issue states
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [severity, setSeverity] = useState<DeveloperIssue["severity"]>("major");
  const [category, setCategory] = useState("general");

  // Resolve issue states
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    await createIssue(title, desc, severity, category);
    setTitle("");
    setDesc("");
    setSeverity("major");
    setCategory("general");
  };

  const handleResolve = async (issueId: string) => {
    await updateIssueStatus(issueId, "resolved", resolutionNotes);
    setResolvingId(null);
    setResolutionNotes("");
  };

  return (
    <div>
      <form className="issue-form" onSubmit={handleSubmit}>
        <h4>Log Developer Issue</h4>
        <div className="issue-form-row">
          <label htmlFor="issueTitleInput">Issue Title</label>
          <input
            id="issueTitleInput"
            type="text"
            placeholder="e.g. CSRF check missing"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="issue-form-row">
          <label htmlFor="issueDescText">Description</label>
          <textarea
            id="issueDescText"
            placeholder="Describe the blocker details..."
            rows={2}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
        </div>

        <div className="issue-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <div>
            <label htmlFor="issueSeveritySelect">Severity</label>
            <select
              id="issueSeveritySelect"
              value={severity}
              onChange={(e) => setSeverity(e.target.value as any)}
            >
              <option value="blocker">blocker</option>
              <option value="critical">critical</option>
              <option value="major">major</option>
              <option value="minor">minor</option>
            </select>
          </div>
          <div>
            <label htmlFor="issueCategoryInput">Category</label>
            <input
              id="issueCategoryInput"
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
        </div>

        <button type="submit" className="issue-submit-btn">
          Log Issue
        </button>
      </form>

      <div>
        <h4 style={{ margin: "0 0 10px 0", fontSize: "13px" }}>Open Issues ({issues.length})</h4>
        {issues.length === 0 ? (
          <p style={{ color: "var(--soft)", fontSize: "12px", textAlign: "center" }}>No active issues logged.</p>
        ) : (
          issues.map((issue) => {
            const isOpen = issue.status !== "resolved";

            let sevClass = "neutral";
            if (issue.severity === "blocker" || issue.severity === "critical") sevClass = "error";
            else if (issue.severity === "major") sevClass = "warning";

            return (
              <div className="checklist-row" key={issue.issueId}>
                <div className="action-card-header">
                  <div>
                    <strong style={{ fontSize: "13px" }}>{issue.title}</strong>
                    <div style={{ fontSize: "11px", color: "var(--soft)", marginTop: "2px" }}>
                      Severity: <span className={`status-pill ${sevClass}`} style={{ padding: "0px 4px" }}>{issue.severity}</span> | Category: {issue.category}
                    </div>
                  </div>
                  <span className={`status-pill ${isOpen ? "warning" : "success"}`}>{issue.status}</span>
                </div>

                <p style={{ fontSize: "12px", margin: "8px 0 0 0", color: "#374151" }}>{issue.description}</p>

                {isOpen && resolvingId !== issue.issueId && (
                  <button
                    type="button"
                    className="inspector-copy-btn"
                    style={{ marginTop: "10px", fontSize: "11px", padding: "4px 8px" }}
                    onClick={() => setResolvingId(issue.issueId)}
                  >
                    Mark as Resolved
                  </button>
                )}

                {resolvingId === issue.issueId && (
                  <div style={{ marginTop: "10px", borderTop: "1px dashed var(--line)", paddingTop: "8px" }}>
                    <label htmlFor={`resolveNotes-${issue.issueId}`} style={{ display: "block", fontSize: "11px", color: "var(--muted)", marginBottom: "4px" }}>
                      Resolution Notes
                    </label>
                    <input
                      id={`resolveNotes-${issue.issueId}`}
                      type="text"
                      placeholder="Explain resolution details..."
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      style={{ width: "100%", fontSize: "11px", padding: "4px 8px", borderRadius: "4px", border: "1px solid var(--line)", background: "var(--surface)", marginBottom: "8px" }}
                    />
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        type="button"
                        className="issue-submit-btn"
                        style={{ padding: "4px 8px", fontSize: "11px", marginTop: "0" }}
                        onClick={() => handleResolve(issue.issueId)}
                      >
                        Confirm Resolve
                      </button>
                      <button
                        type="button"
                        className="inspector-copy-btn"
                        style={{ padding: "4px 8px", fontSize: "11px" }}
                        onClick={() => setResolvingId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {!isOpen && (
                  <div style={{ marginTop: "8px", fontSize: "11.5px", color: "#047857", background: "#f0fdf4", padding: "6px", borderRadius: "4px" }}>
                    <strong>Resolved:</strong> {issue.resolutionNotes} (at {issue.resolvedDate ? new Date(issue.resolvedDate).toLocaleDateString() : ""})
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
