"use client";

import React, { useState } from "react";
import { Copy, Trash2, Check, Plus } from "lucide-react";
import styles from "../../app/settings/settings.module.css";

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
      name: "BIM Studio Sync Key",
      prefix: "sk_live_kal_8x9a...",
      creator: "Arjun Nambiar",
      createdAt: "2026-07-10T12:00:00Z",
      lastUsedAt: "2 hours ago",
    },
    {
      id: "key_2",
      name: "Accounting & Escrow Webhook",
      prefix: "sk_live_kal_3m2b...",
      creator: "Arjun Nambiar",
      createdAt: "2026-08-01T09:30:00Z",
      lastUsedAt: "Yesterday",
    },
  ]);
  const [newKeyName, setNewKeyName] = useState("");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [keyCopied, setKeyCopied] = useState(false);

  const handleGenerateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    const secureRandomSuffix = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
    const keyString = `sk_live_kal_${secureRandomSuffix}`;
    const displayPrefix = `sk_live_kal_${secureRandomSuffix.substring(0, 4)}...`;

    const newKey: ApiKey = {
      id: `key_${Date.now()}`,
      name: newKeyName.trim(),
      prefix: displayPrefix,
      creator: "Arjun Nambiar",
      createdAt: new Date().toISOString(),
      lastUsedAt: "Never",
    };

    setKeys([newKey, ...keys]);
    setGeneratedKey(keyString);
    setNewKeyName("");
  };

  const handleDeleteKey = (id: string) => {
    setKeys(keys.filter((k) => k.id !== id));
  };

  const handleCopyKey = () => {
    if (!generatedKey) return;
    navigator.clipboard.writeText(generatedKey);
    setKeyCopied(true);
    setTimeout(() => setKeyCopied(false), 2000);
  };

  return (
    <div className={styles.contentScrollArea}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.cardHeaderTitle}>Developer API & Webhooks</h2>
            <p className={styles.cardHeaderSubtitle}>
              Manage programmatic API access keys and webhook endpoints for studio automation.
            </p>
          </div>
        </div>

        <div className={styles.cardBody}>
          {/* Create Key Form */}
          <form onSubmit={handleGenerateKey} className={styles.cleanFormGrid}>
            <div className={styles.cleanFieldGroup}>
              <label className={styles.cleanFieldLabel}>Create New API Key</label>
              <input
                type="text"
                placeholder="e.g. BIM Revit Integration, ERP Webhook"
                className={styles.cleanInput}
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
              />
            </div>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button type="submit" className={styles.btnPrimary} style={{ height: "38px" }}>
                <Plus size={15} />
                <span>Generate Key</span>
              </button>
            </div>
          </form>

          {/* Generated Key Alert Banner */}
          {generatedKey && (
            <div
              style={{
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: "10px",
                padding: "16px",
                marginTop: "12px",
              }}
            >
              <div style={{ fontSize: "13px", fontWeight: 650, color: "#166534", marginBottom: "6px" }}>
                API Key Generated Successfully
              </div>
              <div style={{ fontSize: "12px", color: "#15803d", marginBottom: "10px" }}>
                Copy your key now. You will not be able to view it again.
              </div>
              <div className={styles.copyInputGroup}>
                <input
                  type="text"
                  readOnly
                  value={generatedKey}
                  className={styles.copyInputText}
                  style={{ fontFamily: "monospace" }}
                />
                <button type="button" className={styles.btnSecondary} onClick={handleCopyKey}>
                  {keyCopied ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                  <span>{keyCopied ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>
          )}

          {/* Keys Table */}
          <div className={styles.subSection} style={{ marginTop: "16px" }}>
            <h3 className={styles.subSectionTitle}>Active API Keys</h3>
            <p className={styles.subSectionDesc}>
              These keys grant programmatic read/write access to your practice projects and documents.
            </p>

            <table className={styles.deviceTable}>
              <thead>
                <tr>
                  <th>Key Name</th>
                  <th>Prefix</th>
                  <th>Created</th>
                  <th>Last Used</th>
                  <th style={{ textAlign: "right" }}>Revoke</th>
                </tr>
              </thead>
              <tbody>
                {keys.map((k) => (
                  <tr key={k.id}>
                    <td style={{ fontWeight: 600 }}>{k.name}</td>
                    <td style={{ fontFamily: "monospace", color: "var(--muted, #64748b)" }}>{k.prefix}</td>
                    <td style={{ color: "var(--muted, #64748b)" }}>
                      {new Date(k.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td>
                      <span className={styles.thisDeviceBadge} style={{ color: "#0284c7", background: "#f0f9ff", borderColor: "#bae6fd" }}>
                        {k.lastUsedAt}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        type="button"
                        className={styles.btnDanger}
                        onClick={() => handleDeleteKey(k.id)}
                        style={{ padding: "4px 8px", fontSize: "11.5px" }}
                      >
                        <Trash2 size={13} />
                        <span>Revoke</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
