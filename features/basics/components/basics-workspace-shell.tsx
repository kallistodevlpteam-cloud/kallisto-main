"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./basics-workspace.module.css";

const WORKSPACE_TABS = [
  { label: "Overview", href: "/basics", exact: true },
  { label: "Find Experts", href: "/basics/experts" },
  { label: "Requirements", href: "/basics/requirements" },
  { label: "Proposals", href: "/basics/proposals" },
  { label: "Engagements", href: "/basics/engagements" },
] as const;

export function BasicsWorkspaceShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className={`workspace-container ${styles.workspace}`}>
      <nav className={styles.tabs} aria-label="Basics workspace">
        {WORKSPACE_TABS.map((tab) => {
          const active = "exact" in tab && tab.exact
            ? pathname === tab.href
            : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`${styles.tab} ${active ? styles.tabActive : ""}`}
              aria-current={active ? "page" : undefined}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
      {children}
    </div>
  );
}
