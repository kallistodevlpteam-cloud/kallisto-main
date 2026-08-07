import React from "react";
import styles from "../../app/settings/settings.module.css";

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  isDanger?: boolean;
}

export function SettingsSection({ title, description, children, isDanger }: SettingsSectionProps) {
  return (
    <section className={`${styles.sectionContainer} ${isDanger ? styles.dangerSection : ""}`}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        {description && <p className={styles.sectionDescription}>{description}</p>}
      </div>
      <div className={styles.sectionContent}>{children}</div>
    </section>
  );
}
