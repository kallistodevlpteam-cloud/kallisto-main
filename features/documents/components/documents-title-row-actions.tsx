"use client";

/**
 * DocumentsTitleRowActions
 *
 * Renders Top Navigation Options: Task | Docs | BOQ | Finance | Site | Timeline
 */

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  CreditCard,
  FileText,
  Folder,
  SquareCheckBig,
} from "lucide-react";

const NAV_CHIPS = [
  { id: "task", label: "Task", icon: SquareCheckBig, href: "/tasks" },
  { id: "docs", label: "Drive", icon: Folder, href: "/documents" },
  { id: "boq", label: "BOQ", icon: FileText, href: "/boq" },
  { id: "finance", label: "Finance", icon: CreditCard, href: "/finance" },
  { id: "site", label: "Site", icon: Building2, href: "/site" },
] as const;

export function DocumentsTitleRowActions() {
  const pathname = usePathname() || "";

  let projectId: string | null = null;
  if (pathname.startsWith("/projects/")) {
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length >= 2 && parts[1] !== "page") {
      projectId = parts[1];
    }
  }

  return (
    <nav className="docs-title-actions" aria-label="Document page navigation">
      <div className="title-status-chips" aria-label="Project Navigation Options">
        {NAV_CHIPS.map((chip) => {
          const Icon = chip.icon;

          let targetHref: string = chip.href;
          if (projectId) {
            const moduleSlug = chip.id === "docs" ? "documents" : chip.id === "task" ? "tasks" : chip.id;
            targetHref = `/projects/${projectId}/${moduleSlug}`;
          }

          const isActive =
            pathname === targetHref ||
            pathname === chip.href ||
            (chip.href !== "/documents" && pathname.startsWith(chip.href)) ||
            (projectId !== null && (
              pathname === `/projects/${projectId}/${chip.id}` ||
              pathname === `/projects/${projectId}/${chip.id === "docs" ? "documents" : chip.id === "task" ? "tasks" : chip.id}`
            ));

          return (
            <Link
              key={chip.id}
              href={targetHref}
              className={`title-status-chip ${isActive ? "is-active" : ""}`}
            >
              <Icon size={18} strokeWidth={1.75} className="title-chip-icon" aria-hidden="true" />
              <span>{chip.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
