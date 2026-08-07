"use client";

import { MoreHorizontal, Plus, UsersRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import styles from "./hands-overview.module.css";

const OVERFLOW_ACTIONS = [
  "Manage workforce partners",
  "Worker categories",
  "Rate settings",
  "Hands settings",
] as const;

type OverflowAction = (typeof OVERFLOW_ACTIONS)[number];

interface HandsPageHeaderProps {
  onRequestWorkforce: () => void;
  onOverflowAction: (action: OverflowAction) => void;
}

export function HandsPageHeader({
  onRequestWorkforce,
  onOverflowAction,
}: HandsPageHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const actionGroupRef = useRef<HTMLDivElement>(null);
  const overflowButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (
        actionGroupRef.current &&
        !actionGroupRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && menuOpen) {
        setMenuOpen(false);
        overflowButtonRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  return (
    <div className={`page-heading ${styles.pageHeading}`}>
      <div>
        <h1>Hands</h1>
        <p className="heading-note">
          Coordinate field workforce, labour requests, site deployments and
          attendance.
        </p>
      </div>

      <div className={styles.headerActions} ref={actionGroupRef}>
        <button
          type="button"
          className={`primary-action ${styles.headerPrimaryAction}`}
          onClick={onRequestWorkforce}
        >
          <Plus size={15} aria-hidden="true" />
          <span>Request workforce</span>
        </button>
        <button
          ref={overflowButtonRef}
          type="button"
          className={styles.iconButton}
          aria-label="Open Hands settings menu"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((current) => !current)}
        >
          <MoreHorizontal size={17} aria-hidden="true" />
        </button>

        {menuOpen ? (
          <div className={styles.headerMenu} role="menu">
            <div className={styles.menuLabel}>
              <UsersRound size={14} aria-hidden="true" />
              Workforce setup
            </div>
            {OVERFLOW_ACTIONS.map((action) => (
              <button
                key={action}
                type="button"
                role="menuitem"
                className={styles.menuItem}
                onClick={() => {
                  setMenuOpen(false);
                  onOverflowAction(action);
                }}
              >
                {action}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
