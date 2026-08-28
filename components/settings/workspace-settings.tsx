"use client";

import React, { useState } from "react";
import { Copy, Trash2, Check } from "lucide-react";
import styles from "../../app/settings/settings.module.css";

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
  const [workspaceName, setWorkspaceName] = useState(workspace.name || "Arjun Architects Studio");
  const [subdomain, setSubdomain] = useState("arjun-architects");
  const [copied, setCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(workspace.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
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
    <div className={styles.contentScrollArea}>
      {/* 1. Workspace Identity */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.cardHeaderTitle}>Workspace Identity</h2>
            <p className={styles.cardHeaderSubtitle}>
              Identify your practice inside Kallisto dashboards and client portal.
            </p>
          </div>
        </div>

        <div className={styles.cardBody}>
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
              <div className={styles.copyInputGroup}>
                <input
                  type="text"
                  className={styles.copyInputText}
                  value={workspace.id}
                  readOnly
                />
                <button
                  type="button"
                  className={styles.btnSecondary}
                  style={{ padding: "4px 10px", fontSize: "12px" }}
                  onClick={handleCopyId}
                >
                  {copied ? <Check size={13} color="#16a34a" /> : <Copy size={13} />}
                  <span>{copied ? "Copied" : "Copy ID"}</span>
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
            <button type="button" className={styles.btnPrimary} onClick={handleSave}>
              {isSaved ? (
                <>
                  <Check size={14} color="#ffffff" />
                  <span>Saved</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Danger Zone */}
      <div className={styles.card} style={{ marginTop: "16px" }}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.cardHeaderTitle} style={{ color: "#dc2626" }}>Danger Zone</h2>
            <p className={styles.cardHeaderSubtitle}>
              Irreversible actions for this workspace.
            </p>
          </div>
        </div>

        <div className={styles.cardBody}>
          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel} style={{ color: "#991b1b" }}>Delete Workspace</span>
              <span className={styles.settingDesc} style={{ color: "#b91c1c" }}>
                Permanently delete this workspace, all team member permissions, and all associated projects.
              </span>
            </div>
            <div className={styles.settingControl}>
              <button
                type="button"
                className={styles.btnDanger}
                onClick={handleDeleteWorkspace}
              >
                <Trash2 size={14} />
                <span>Delete Workspace</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
