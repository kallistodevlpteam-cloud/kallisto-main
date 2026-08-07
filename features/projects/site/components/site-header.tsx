"use client";

import { useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  MoreHorizontal,
  Plus,
  TriangleAlert,
  Truck,
  Users,
} from "lucide-react";
import styles from "./project-site-workspace.module.css";

export type SiteHeaderAction =
  | "log_update"
  | "daily_log"
  | "attendance"
  | "inspection"
  | "issue"
  | "delivery";

interface SiteHeaderProps {
  projectName: string;
  date: string;
  primaryAction: SiteHeaderAction;
  primaryActionLabel: string;
  onDateChange: (value: string) => void;
  onPrimaryAction: () => void;
  onOverflowAction: (action: SiteHeaderAction) => void;
}

const overflowActions: Array<{
  id: SiteHeaderAction;
  label: string;
  icon: typeof Users;
}> = [
  { id: "log_update", label: "Log Site Update", icon: ClipboardList },
  { id: "daily_log", label: "Create Daily Log", icon: ClipboardList },
  { id: "attendance", label: "Open Attendance Register", icon: Users },
  { id: "inspection", label: "Schedule Inspection", icon: ClipboardCheck },
  { id: "issue", label: "Report issue", icon: TriangleAlert },
  { id: "delivery", label: "Record delivery", icon: Truck },
];

export function SiteHeader({
  projectName,
  date,
  primaryAction,
  primaryActionLabel,
  onDateChange,
  onPrimaryAction,
  onOverflowAction,
}: SiteHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (
        menuContainerRef.current &&
        !menuContainerRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  function handleMenuAction(action: SiteHeaderAction) {
    onOverflowAction(action);
    setIsMenuOpen(false);
  }

  return (
    <header className={styles.siteHeader}>
      <div className={styles.siteHeaderIdentity}>
        <h2 id="site-workspace-title">Site Operations</h2>
        <p>Live field activity and execution records for {projectName}.</p>
      </div>

      <div className={styles.siteHeaderActions}>
        <label className={styles.dateControl}>
          <CalendarDays size={15} aria-hidden="true" />
          <span className="sr-only">Site record date</span>
          <input
            type="date"
            aria-label="Site record date"
            value={date}
            onChange={(event) => onDateChange(event.target.value)}
          />
        </label>

        <button
          type="button"
          className={styles.primaryButton}
          onClick={onPrimaryAction}
        >
          <Plus size={15} aria-hidden="true" />
          {primaryActionLabel}
        </button>

        <div
          className={styles.overflowMenuContainer}
          ref={menuContainerRef}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setIsMenuOpen(false);
            }
          }}
        >
          <button
            type="button"
            className={styles.iconButton}
            aria-label="More site actions"
            aria-haspopup="menu"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((current) => !current)}
          >
            <MoreHorizontal size={17} aria-hidden="true" />
          </button>

          {isMenuOpen ? (
            <div className={styles.overflowMenu} role="menu">
              <div className={styles.overflowMenuLabel}>
                <ClipboardList size={14} aria-hidden="true" />
                Site records
              </div>
              {overflowActions
                .filter((action) => action.id !== primaryAction)
                .map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    type="button"
                    role="menuitem"
                    onClick={() => handleMenuAction(action.id)}
                  >
                    <Icon size={15} aria-hidden="true" />
                    {action.label}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
