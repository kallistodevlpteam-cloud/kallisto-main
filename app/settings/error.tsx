"use client";

import React, { useEffect } from "react";
import styles from "./settings.module.css";
import { AlertCircle } from "lucide-react";

interface SettingsErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function SettingsError({ error, reset }: SettingsErrorProps) {
  useEffect(() => {
    console.error("Settings module error:", error);
  }, [error]);

  return (
    <div className={styles.deniedContainer} style={{ borderStyle: "solid", borderColor: "#fca5a5", background: "#fff5f5" }}>
      <AlertCircle size={36} style={{ color: "#ef4444", marginBottom: "16px" }} />
      <h3 className={styles.deniedTitle} style={{ color: "#991b1b" }}>Something went wrong!</h3>
      <p className={styles.deniedMessage} style={{ color: "#b91c1c", marginBottom: "16px" }}>
        An error occurred while loading settings: {error.message || "Unknown error"}
      </p>
      <button
        type="button"
        className={styles.actionBtn}
        style={{ background: "#ffffff", borderColor: "#fca5a5", color: "#b91c1c" }}
        onClick={() => reset()}
      >
        Try again
      </button>
    </div>
  );
}
