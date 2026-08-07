import React from "react";
import styles from "./settings.module.css";

export default function SettingsLoading() {
  return (
    <div className={styles.settingsContentOutlet} style={{ padding: "40px 0", textAlign: "center", color: "#64748b" }}>
      <div style={{ display: "inline-block", width: "24px", height: "24px", border: "2px solid #e2e8f0", borderTopColor: "#2563eb", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div style={{ marginTop: "12px", fontSize: "13.5px" }}>Loading settings...</div>
    </div>
  );
}
