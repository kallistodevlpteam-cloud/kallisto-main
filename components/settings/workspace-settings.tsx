"use client";

import React, { useState } from "react";
import styles from "../../app/settings/settings.module.css";
import { Copy, Trash2, Check } from "lucide-react";

interface WorkspaceSettingsProps {
  workspace: {
    id: string;
    name: string;
  };
  user: {
    uid: string;
    role: string;
  };
  permissions: {
    canDeleteWorkspace: boolean;
  };
}

export function WorkspaceSettings({ workspace, user, permissions }: WorkspaceSettingsProps) {
  const [workspaceName, setWorkspaceName] = useState(workspace.name);
  const [copied, setCopied] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(workspace.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeleteWorkspace = () => {
    if (!permissions.canDeleteWorkspace) {
      alert("Permission denied. Only the workspace owner can delete this workspace.");
      return;
    }
    const confirmation = prompt("To confirm deletion, type 'DELETE' below:");
    if (confirmation === "DELETE") {
      alert("Workspace has been permanently deleted.");
    } else if (confirmation !== null) {
      alert("Deletion canceled. Confirmation text did not match.");
    }
  };

  return (
    <div className={styles.settingsContentOutlet}>
      <div className={styles.profileCleanContainer}>
        <section>
          <div className={styles.profileSectionHeader}>
            <h2 className={styles.profileSectionTitle}>Workspace Identity</h2>
            <p className={styles.profileSectionSubtitle}>
              Identify your practice inside Kallisto dashboards.
            </p>
          </div>

          <div className={styles.cleanFormGrid}>
            <div className={`${styles.cleanFieldGroup} ${styles.fullWidthField}`}>
              <label className={styles.cleanFieldLabel}>Workspace Name</label>
              <input
                type="text"
                className={styles.cleanInput}
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                placeholder="Enter workspace name"
              />
            </div>

            <div className={`${styles.cleanFieldGroup} ${styles.fullWidthField}`}>
              <label className={styles.cleanFieldLabel}>Workspace ID</label>
              <div className={styles.websiteInputContainer}>
                <input
                  type="text"
                  className={styles.cleanInput}
                  value={workspace.id}
                  readOnly
                  style={{ background: "#f9fafb", cursor: "default" }}
                />
                <button
                  type="button"
                  className={styles.websitePrefix}
                  style={{
                    borderRight: "1px solid #e5e7eb",
                    borderLeft: "none",
                    borderTopRightRadius: "8px",
                    borderBottomRightRadius: "8px",
                    borderTopLeftRadius: 0,
                    borderBottomLeftRadius: 0,
                    cursor: "pointer",
                    gap: "6px",
                    fontWeight: 500,
                  }}
                  onClick={handleCopyId}
                >
                  {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                  <span>{copied ? "Copied" : "Copy ID"}</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        <section style={{ marginTop: "12px" }}>
          <div className={styles.profileSectionHeader}>
            <h2 className={styles.profileSectionTitle} style={{ color: "#dc2626" }}>
              Danger Zone
            </h2>
            <p className={styles.profileSectionSubtitle}>
              Irreversible actions for this workspace.
            </p>
          </div>

          <div
            style={{
              padding: "20px",
              background: "#fffafb",
              border: "1px solid #fee2e2",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "20px",
            }}
          >
            <div>
              <div style={{ fontSize: "14px", fontWeight: 600, color: "#991b1b" }}>
                Delete Workspace
              </div>
              <div style={{ fontSize: "12.5px", color: "#b91c1c", marginTop: "2px" }}>
                Permanently delete this workspace, all team member permissions, and all associated projects.
              </div>
            </div>
            <button
              type="button"
              className={`${styles.actionBtn} ${styles.dangerBtn}`}
              onClick={handleDeleteWorkspace}
              style={{ flexShrink: 0, height: "38px", padding: "0 16px" }}
            >
              <Trash2 size={15} style={{ marginRight: "6px" }} />
              Delete Workspace
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
