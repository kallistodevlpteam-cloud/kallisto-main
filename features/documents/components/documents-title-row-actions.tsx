"use client";

/**
 * DocumentsTitleRowActions
 *
 * Renders Top Navigation Options: Task | Docs | BOQ | Finance | Site
 * Supports both Provider Virtual Office and Client POV workspaces.
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
  { id: "task", label: "Task", icon: TaskDuotoneIcon, color: "#10b981", defaultHref: "/tasks" },
  { id: "docs", label: "Drive", icon: DriveDuotoneIcon, color: "#f59e0b", defaultHref: "/documents" },
  { id: "boq", label: "BOQ", icon: BoqDuotoneIcon, color: "#6366f1", defaultHref: "/boq" },
  { id: "finance", label: "Finance", icon: FinanceDuotoneIcon, color: "#f43f5e", defaultHref: "/finance" },
  { id: "site", label: "Site", icon: SiteDuotoneIcon, color: "#0ea5e9", defaultHref: "/site" },
] as const;

export function DocumentsTitleRowActions() {
  const pathname = usePathname() || "";
  const isClient = pathname.startsWith("/client");

  let projectId: string | null = null;
  if (isClient && pathname.startsWith("/client/projects/")) {
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length >= 3 && parts[2] !== "page") {
      projectId = parts[2];
    }
  } else if (!isClient && pathname.startsWith("/projects/")) {
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length >= 2 && parts[1] !== "page") {
      projectId = parts[1];
    }
  }

  const homeHref = isClient
    ? projectId
      ? `/client/projects/${projectId}`
      : "/client/projects"
    : projectId
    ? `/projects/${projectId}`
    : "/projects";

  const isOverviewPage =
    projectId !== null
      ? isClient
        ? pathname === `/client/projects/${projectId}` || pathname === `/client/projects/${projectId}/`
        : pathname === `/projects/${projectId}` || pathname === `/projects/${projectId}/`
      : isClient
      ? pathname === "/client/projects" || pathname === "/client"
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
          const moduleSlug = chip.id === "docs" ? "documents" : chip.id === "task" ? "tasks" : chip.id;

          let targetHref: string;
          if (isClient) {
            targetHref = projectId
              ? `/client/projects/${projectId}/${moduleSlug}`
              : `/client/projects`;
          } else {
            targetHref = projectId
              ? `/projects/${projectId}/${moduleSlug}`
              : chip.defaultHref;
          }

          const isActive =
            pathname === targetHref ||
            (!isClient && pathname === chip.defaultHref) ||
            (!isClient && chip.defaultHref !== "/documents" && pathname.startsWith(chip.defaultHref)) ||
            (projectId !== null && (
              pathname === (isClient ? `/client/projects/${projectId}/${chip.id}` : `/projects/${projectId}/${chip.id}`) ||
              pathname === (isClient ? `/client/projects/${projectId}/${moduleSlug}` : `/projects/${projectId}/${moduleSlug}`)
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
