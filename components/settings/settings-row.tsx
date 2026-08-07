import React from "react";
import styles from "../../app/settings/settings.module.css";

interface SettingsRowProps {
  label: string;
  description?: string;
  children?: React.ReactNode;
  value?: React.ReactNode;
}

export function SettingsRow({ label, description, children, value }: SettingsRowProps) {
  return (
    <div className={styles.settingsRow}>
      <div className={styles.rowInfo}>
        <span className={styles.rowLabel}>{label}</span>
        {description && <span className={styles.rowDesc}>{description}</span>}
        {value && <span className={styles.rowValue}>{value}</span>}
      </div>
      {children && <div className={styles.rowAction}>{children}</div>}
    </div>
  );
}
