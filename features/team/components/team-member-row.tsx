"use client";

import { LockKeyhole, MoreHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type {
  MemberAction,
  TeamMember,
} from "../types/team.types";
import styles from "./team-page.module.css";

interface TeamMemberRowProps {
  member: TeamMember;
  onAction: (member: TeamMember, action: MemberAction) => void;
}

const MEMBER_ACTIONS: Array<{ action: MemberAction; label: string }> = [
  { action: "view_profile", label: "View profile" },
  { action: "edit_role", label: "Edit role" },
  { action: "manage_project_access", label: "Manage project access" },
  { action: "deactivate", label: "Deactivate member" },
  { action: "remove", label: "Remove from workspace" },
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toLocaleUpperCase();
}

function getStatusLabel(member: TeamMember): string {
  if (member.status === "active") return "Active";
  if (member.status === "invited") return "Invited";
  return "Inactive";
}

export function TeamMemberRow({ member, onAction }: TeamMemberRowProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const ownerProtected = member.role === "Workspace Owner";

  useEffect(() => {
    if (!menuOpen) return;

    const closeMenu = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent && event.key !== "Escape") return;
      if (
        event instanceof MouseEvent &&
        menuRef.current?.contains(event.target as Node)
      ) {
        return;
      }
      setMenuOpen(false);
    };

    document.addEventListener("mousedown", closeMenu);
    document.addEventListener("keydown", closeMenu);
    return () => {
      document.removeEventListener("mousedown", closeMenu);
      document.removeEventListener("keydown", closeMenu);
    };
  }, [menuOpen]);

  return (
    <div className={styles.memberRow} role="row">
      <div className={styles.memberIdentity} role="gridcell">
        <span className={styles.avatar} aria-hidden="true">
          {getInitials(member.name)}
        </span>
        <span className={styles.memberCopy}>
          <strong>{member.name}</strong>
          <small>{member.email}</small>
        </span>
      </div>

      <div role="gridcell">
        <span className={styles.roleBadge}>{member.role}</span>
      </div>

      <div className={styles.projectsCell} role="gridcell">
        {member.projectIds.length} projects
      </div>

      <div className={styles.workloadCell} role="gridcell">
        <span>{member.workload}%</span>
        <span
          className={styles.workloadTrack}
          role="progressbar"
          aria-label={`${member.name} workload`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={member.workload}
        >
          <span style={{ width: `${member.workload}%` }} />
        </span>
      </div>

      <div className={styles.lastActiveCell} role="gridcell">
        {member.lastActive}
      </div>

      <div role="gridcell">
        <span
          className={`${styles.statusLabel} ${
            member.status === "active"
              ? styles.statusActive
              : member.status === "invited"
                ? styles.statusInvited
                : styles.statusInactive
          }`}
        >
          <span aria-hidden="true" />
          {getStatusLabel(member)}
        </span>
      </div>

      <div className={styles.actionsCell} role="gridcell" ref={menuRef}>
        <button
          type="button"
          className={styles.iconButton}
          aria-label={`Actions for ${member.name}`}
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          onClick={() => setMenuOpen((current) => !current)}
        >
          <MoreHorizontal size={17} />
        </button>
        {menuOpen ? (
          <div className={styles.memberMenu} role="menu">
            {MEMBER_ACTIONS.map(({ action, label }) => {
              const protectedAction =
                ownerProtected &&
                ["edit_role", "deactivate", "remove"].includes(action);

              if (ownerProtected && ["deactivate", "remove"].includes(action)) {
                return null;
              }

              return (
                <button
                  type="button"
                  role="menuitem"
                  key={action}
                  disabled={protectedAction}
                  onClick={() => {
                    onAction(member, action);
                    setMenuOpen(false);
                  }}
                >
                  <span>{label}</span>
                  {protectedAction ? (
                    <LockKeyhole size={13} aria-label="Owner role protected" />
                  ) : null}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
