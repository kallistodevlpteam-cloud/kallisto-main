"use client";

import React from "react";
import Link from "next/link";
import { Clock, FileText, FolderPlus, Inbox, Plus } from "lucide-react";
import styles from "../home-workspace.module.css";

export function QuickActionTiles() {
  const actions = [
    {
      id: "qa-1",
      label: "Add Enquiry",
      icon: Plus,
      href: "/enquiries",
      bgGradient: "linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)",
    },
    {
      id: "qa-2",
      label: "Upload Document",
      icon: FolderPlus,
      href: "/documents",
      bgGradient: "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)",
    },
    {
      id: "qa-3",
      label: "Schedule Visit",
      icon: Clock,
      href: "/calendar",
      bgGradient: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)",
    },
    {
      id: "qa-4",
      label: "Open BOQ Engine",
      icon: FileText,
      href: "/tools",
      bgGradient: "linear-gradient(135deg, #059669 0%, #047857 100%)",
    },
  ];

  return (
    <div className={styles.quickActionTilesRow} aria-label="Quick actions">
      {actions.map((act) => {
        const IconComponent = act.icon;
        return (
          <Link
            key={act.id}
            href={act.href}
            className={styles.quickActionTile}
            title={act.label}
          >
            <div
              className={styles.tileIconSquare}
              style={{ background: act.bgGradient }}
            >
              <IconComponent size={24} className={styles.tileIcon} />
            </div>
            <span className={styles.tileLabel}>{act.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
