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
  HomeDuotoneIcon,
  TaskDuotoneIcon,
  DriveDuotoneIcon,
  BoqDuotoneIcon,
  FinanceDuotoneIcon,
  SiteDuotoneIcon,
} from "@/components/layout/sidebar-icons";

const NAV_CHIPS = [
  { id: "task", label: "Task", icon: TaskDuotoneIcon, color: "#10b981", href: "/tasks" },
  { id: "docs", label: "Drive", icon: DriveDuotoneIcon, color: "#f59e0b", href: "/documents" },
  { id: "boq", label: "BOQ", icon: BoqDuotoneIcon, color: "#6366f1", href: "/boq" },
  { id: "finance", label: "Finance", icon: FinanceDuotoneIcon, color: "#f43f5e", href: "/finance" },
  { id: "site", label: "Site", icon: SiteDuotoneIcon, color: "#0ea5e9", href: "/site" },
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

  const homeHref = projectId ? `/projects/${projectId}` : "/projects";
  const isOverviewPage =
    projectId !== null
      ? pathname === `/projects/${projectId}` || pathname === `/projects/${projectId}/`
      : pathname === "/projects" || pathname === "/" || pathname === "/home";

  return (
    <nav className="docs-title-actions" aria-label="Document page navigation">
      <div className="title-status-chips" aria-label="Project Navigation Options">
        {!isOverviewPage && (
          <Link
            href={homeHref}
            className="title-home-btn"
            title="Project Overview"
            aria-label="Back to project overview"
          >
            <HomeDuotoneIcon
              size={18}
              className="title-chip-icon"
              style={{ color: "#3b82f6" }}
              aria-hidden="true"
            />
          </Link>
        )}
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
              <Icon
                size={18}
                strokeWidth={1.75}
                className="title-chip-icon"
                style={{ color: chip.color }}
                aria-hidden="true"
              />
              <span>{chip.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
