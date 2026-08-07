import React from "react";
import styles from "../../app/settings/settings.module.css";
import { ShieldAlert } from "lucide-react";

export function SettingsAccessDenied({ message }: { message?: string }) {
  return (
    <div className={styles.deniedContainer}>
      <ShieldAlert size={36} className={styles.deniedIcon} />
      <h3 className={styles.deniedTitle}>Access Denied</h3>
      <p className={styles.deniedMessage}>
        {message || "You do not have the required permissions to view or manage these settings. Please contact your workspace administrator."}
      </p>
    </div>
  );
}
