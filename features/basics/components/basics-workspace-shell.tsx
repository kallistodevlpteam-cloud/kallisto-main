"use client";

import { usePathname } from "next/navigation";
import styles from "./basics-workspace.module.css";

export function BasicsWorkspaceShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "";
  const isOverview = pathname === "/basics";

  return (
    <div
      className={`workspace-container ${styles.workspace}${
        isOverview ? ` ${styles.basicsOverviewShell}` : ""
      }`}
    >
      {children}
    </div>
  );
}

