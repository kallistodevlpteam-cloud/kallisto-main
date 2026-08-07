"use client";

import React, { useState } from "react";
import styles from "../../app/settings/settings.module.css";
import { Key, Copy, Trash2, Check, AlertTriangle } from "lucide-react";

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  creator: string;
  createdAt: string;
  lastUsedAt: string;
}

interface DeveloperSettingsProps {
  user: {
    uid: string;
    role: string;
  };
  permissions: {
    canManageApiKeys: boolean;
  };
}

export function DeveloperSettings({ user, permissions }: DeveloperSettingsProps) {
  const [keys, setKeys] = useState<ApiKey[]>([
    {
      id: "key_1",
      name: "Staging Webhook Key",
      prefix: "sk_live_51Odin_8x9a...",
      creator: "Saran Kumar",
      createdAt: "2026-07-10T12:00:00Z",
      lastUsedAt: "2026-07-21T08:12:00Z",
    },
  ]);
  const [newKeyName, setNewKeyName] = useState("");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [keyCopied, setKeyCopied] = useState(false);

  const handleGenerateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    if (!permissions.canManageApiKeys) {
      alert("Permission denied. Only developers can manage API keys.");
      return;
    }

    if (!confirm("Are you sure you want to generate a new API Key? This operation will be audited.")) {
      return;
    }

    const secureRandomSuffix = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
    const keyString = `sk_live_51Odin_${secureRandomSuffix}`;
    const displayPrefix = `sk_live_51Odin_${secureRandomSuffix.substring(0, 4)}...`;

    const newKey: ApiKey = {
      id: `key_${Date.now()}`,
      name: newKeyName.trim(),
      prefix: displayPrefix,
      creator: "Saran Kumar",
      createdAt: new Date().toISOString(),
      lastUsedAt: "Never",
    };

    setKeys((prev) => [...prev, newKey]);
    setGeneratedKey(keyString);
    setNewKeyName("");
  };

  const handleRevokeKey = (id: string, name: string) => {
    if (!permissions.canManageApiKeys) {
      alert("Permission denied.");
      return;
    }

    if (!confirm(`Are you sure you want to permanently revoke "${name}"? This operation cannot be undone and will be audited.`)) {
      return;
    }

    setKeys((prev) => prev.filter((k) => k.id !== id));
    alert(`API Key "${name}" has been revoked.`);
  };

  return (
    <div className={styles.settingsContentOutlet}>
      <div className={styles.profileCleanContainer}>
        {generatedKey && (
          <div
            style={{
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              borderRadius: "12px",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <div style={{ fontSize: "14.5px", fontWeight: 600, color: "#1e3a8a", display: "flex", alignItems: "center", gap: "6px" }}>
              <AlertTriangle size={17} color="#1d4ed8" /> Save your API key now
            </div>
            <div style={{ fontSize: "13px", color: "#1e40af", lineHeight: "1.4" }}>
              For security, we can only show this key once. If you lose it, you will have to generate a new one.
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                background: "#ffffff",
                border: "1px solid #cbd5e1",
                padding: "8px 14px",
                borderRadius: "8px",
              }}
            >
              <code style={{ fontFamily: "monospace", fontSize: "13px", color: "#0f172a", flex: 1 }}>{generatedKey}</code>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(generatedKey);
                  setKeyCopied(true);
                  setTimeout(() => setKeyCopied(false), 2000);
                }}
                style={{
                  height: "32px",
                  padding: "0 12px",
                  borderRadius: "6px",
                  background: "#ffffff",
                  border: "1px solid #cbd5e1",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                {keyCopied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                <span>{keyCopied ? "Copied" : "Copy Key"}</span>
              </button>
            </div>
            <button
              type="button"
              onClick={() => setGeneratedKey(null)}
              style={{
                height: "36px",
                padding: "0 14px",
                borderRadius: "8px",
                background: "#1e40af",
                color: "#ffffff",
                border: "none",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                width: "fit-content",
              }}
            >
              I have saved this key
            </button>
          </div>
        )}

        {/* Generate API Key */}
        <section>
          <div className={styles.profileSectionHeader}>
            <h2 className={styles.profileSectionTitle}>Generate API Key</h2>
            <p className={styles.profileSectionSubtitle}>
              Generate secret credentials to authenticate custom integration scripts.
            </p>
          </div>

          <form onSubmit={handleGenerateKey} className={styles.cleanFormGrid}>
            <div className={`${styles.cleanFieldGroup} ${styles.fullWidthField}`}>
              <label htmlFor="keyName" className={styles.cleanFieldLabel}>API Key Name</label>
              <div className={styles.websiteInputContainer}>
                <input
                  id="keyName"
                  type="text"
                  placeholder="e.g. Production Webhook"
                  className={styles.cleanInput}
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  className={styles.websitePrefix}
                  style={{
                    borderRight: "none",
                    borderLeft: "1px solid #e5e7eb",
                    borderTopRightRadius: "8px",
                    borderBottomRightRadius: "8px",
                    borderTopLeftRadius: 0,
                    borderBottomLeftRadius: 0,
                    background: "#111827",
                    color: "#ffffff",
                    cursor: "pointer",
                    gap: "6px",
                    fontWeight: 600,
                  }}
                >
                  <Key size={15} />
                  <span>Generate Key</span>
                </button>
              </div>
            </div>
          </form>
        </section>

        {/* Active API Keys */}
        <section style={{ marginTop: "12px" }}>
          <div className={styles.profileSectionHeader}>
            <h2 className={styles.profileSectionTitle}>Active API Keys</h2>
            <p className={styles.profileSectionSubtitle}>
              A list of secret keys authorized to request details for this workspace.
            </p>
          </div>

          <div style={{ border: "1px solid #e5e7eb", borderRadius: "12px", overflow: "hidden", background: "#ffffff" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13.5px" }}>
              <thead>
                <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#374151", fontSize: "12.5px" }}>Name</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#374151", fontSize: "12.5px" }}>Prefix</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#374151", fontSize: "12.5px" }}>Creator</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#374151", fontSize: "12.5px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {keys.map((key) => (
                  <tr key={key.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "14px 16px", fontWeight: 600, color: "#111827" }}>{key.name}</td>
                    <td style={{ padding: "14px 16px", fontFamily: "monospace", color: "#4b5563" }}>{key.prefix}</td>
                    <td style={{ padding: "14px 16px", color: "#6b7280" }}>{key.creator}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <button
                        type="button"
                        onClick={() => handleRevokeKey(key.id, key.name)}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#ef4444",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          fontSize: "12.5px",
                          fontWeight: 500,
                        }}
                      >
                        <Trash2 size={15} />
                        <span>Revoke</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

