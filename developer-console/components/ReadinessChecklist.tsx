import React, { useState } from "react";
import { DeveloperConsoleHook } from "../hooks/useDeveloperConsole";
import { ReadinessCheckDefinition } from "../types/developerConsole.types";

interface ReadinessChecklistProps {
  consoleState: DeveloperConsoleHook;
}

export function ReadinessChecklist({ consoleState }: ReadinessChecklistProps) {
  const { manifest, checklistRecords, updateCheckStatus, isMissing } = consoleState;
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Form states
  const [formStatus, setFormStatus] = useState<string>("");
  const [formNotes, setFormNotes] = useState<string>("");
  const [formEvidence, setFormEvidence] = useState<string>("");

  if (!manifest || isMissing) {
    return (
      <p style={{ color: "var(--muted)", fontSize: "12px", textAlign: "center", marginTop: "20px" }}>
        Checklist requirements are disabled because the page manifest is missing.
      </p>
    );
  }

  const checks = manifest.checklistRequirements;
  const recordsMap = new Map(checklistRecords.map((r) => [r.itemId, r]));

  // Group by category
  const categories: Record<string, ReadinessCheckDefinition[]> = {};
  checks.forEach((check) => {
    if (!categories[check.category]) {
      categories[check.category] = [];
    }
    categories[check.category].push(check);
  });

  const handleExpand = (checkId: string) => {
    if (expandedId === checkId) {
      setExpandedId(null);
    } else {
      setExpandedId(checkId);
      const record = recordsMap.get(checkId);
      setFormStatus(record ? record.status : "not_verified");
      setFormNotes(record?.notes || "");
      setFormEvidence(record?.evidence?.join(", ") || "");
    }
  };

  const handleSave = async (checkId: string) => {
    const evidenceArray = formEvidence
      ? formEvidence.split(",").map((s) => s.trim())
      : [];
    await updateCheckStatus(checkId, formStatus, formNotes, evidenceArray);
    setExpandedId(null);
  };

  return (
    <div>
      {Object.keys(categories).map((cat) => (
        <div key={cat}>
          <div className="checklist-category-header">
            {cat.replace("_", " ")}
          </div>
          {categories[cat].map((check) => {
            const record = recordsMap.get(check.itemId);
            const status = record ? record.status : "not_verified";
            const isExpanded = expandedId === check.itemId;

            let pillClass = "neutral";
            if (status === "connected" || status === "tested") pillClass = "success";
            else if (status === "mocked" || status === "partial") pillClass = "warning";
            else if (status === "blocked" || status === "failed") pillClass = "error";

            return (
              <div className="checklist-row" key={check.itemId}>
                <div
                  className="checklist-row-top"
                  onClick={() => handleExpand(check.itemId)}
                  style={{ cursor: "pointer" }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleExpand(check.itemId);
                    }
                  }}
                  aria-expanded={isExpanded}
                >
                  <div>
                    <div className="checklist-item-title">
                      {check.title} {check.isRequired && <span style={{ color: "#ef4444" }}>*</span>}
                    </div>
                    <div className="checklist-item-desc">{check.description}</div>
                  </div>
                  <span className={`status-pill ${pillClass}`}>{status}</span>
                </div>

                {isExpanded && (
                  <div className="checklist-item-form">
                    <div className="checklist-item-form-full" style={{ fontSize: "11px", color: "var(--soft)" }}>
                      Verified by: <strong>{record?.checkedBy || "N/A"}</strong> at {record?.checkedAt ? new Date(record.checkedAt).toLocaleString() : "N/A"}
                    </div>

                    <label htmlFor={`checkStatus-${check.itemId}`}>
                      Status
                      <select
                        id={`checkStatus-${check.itemId}`}
                        value={formStatus}
                        onChange={(e) => setFormStatus(e.target.value)}
                      >
                        <option value="not_verified">not_verified</option>
                        <option value="not_started">not_started</option>
                        <option value="mocked">mocked</option>
                        <option value="partial">partial</option>
                        <option value="connected">connected</option>
                        <option value="tested">tested</option>
                        <option value="blocked">blocked</option>
                        <option value="failed">failed</option>
                        <option value="skipped_with_reason">skipped_with_reason</option>
                      </select>
                    </label>

                    <label htmlFor={`checkEvidence-${check.itemId}`}>
                      Evidence References
                      <input
                        id={`checkEvidence-${check.itemId}`}
                        type="text"
                        placeholder="e.g. pr-12, commit-abc"
                        value={formEvidence}
                        onChange={(e) => setFormEvidence(e.target.value)}
                      />
                    </label>

                    <label htmlFor={`checkNotes-${check.itemId}`} className="checklist-item-form-full">
                      Notes
                      <input
                        id={`checkNotes-${check.itemId}`}
                        type="text"
                        placeholder="Write audit details..."
                        value={formNotes}
                        onChange={(e) => setFormNotes(e.target.value)}
                      />
                    </label>

                    <button
                      type="button"
                      className="issue-submit-btn"
                      onClick={() => handleSave(check.itemId)}
                      style={{ gridColumn: "1 / span 2", marginTop: "8px" }}
                    >
                      Save Verification
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
