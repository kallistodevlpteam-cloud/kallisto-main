"use client";

import styles from "./basics-workspace.module.css";

export function BasicsWorkspaceShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`workspace-container ${styles.workspace}`}>
      {children}
    </div>
  );
}

