"use client";

import {
  AllDocumentsDuotoneIcon,
  SharedWithMeDuotoneIcon,
  StarredDuotoneIcon,
} from "@/components/layout/sidebar-icons";

import { DriveScope } from "./drive-query-state";
import styles from "./project-documents-workspace.module.css";

const scopes: Array<{
  id: DriveScope;
  label: string;
  icon: typeof AllDocumentsDuotoneIcon;
}> = [
  { id: "all", label: "All Documents", icon: AllDocumentsDuotoneIcon },
  { id: "shared", label: "Shared with me", icon: SharedWithMeDuotoneIcon },
  { id: "starred", label: "Starred", icon: StarredDuotoneIcon },
];

interface DriveScopeTabsProps {
  scope: DriveScope;
  onChange: (scope: DriveScope) => void;
  counts?: Partial<Record<DriveScope, number>>;
}

export function DriveScopeTabs({ scope, onChange, counts }: DriveScopeTabsProps) {
  return (
    <nav className={styles.scopeTabs} aria-label="Document scopes">
      {scopes.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={scope === id}
          className={scope === id ? styles.scopeTabActive : styles.scopeTab}
          onClick={() => onChange(id)}
        >
          <Icon size={16} aria-hidden="true" />
          <span>{label}</span>
          {counts?.[id] !== undefined && counts[id]! > 0 ? (
            <span className={styles.scopeCount}>{counts[id]}</span>
          ) : null}
        </button>
      ))}
    </nav>
  );
}

interface DriveTopBarProps {
  scope: DriveScope;
  onScopeChange: (scope: DriveScope) => void;
  counts?: Partial<Record<DriveScope, number>>;
}

export function DriveTopBar({ scope, onScopeChange, counts }: DriveTopBarProps) {
  return (
    <div className={styles.topControlBar}>
      <DriveScopeTabs scope={scope} onChange={onScopeChange} counts={counts} />
    </div>
  );
}
