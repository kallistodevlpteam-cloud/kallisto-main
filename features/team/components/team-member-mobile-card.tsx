"use client";

import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import type {
  MemberAction,
  TeamMember,
} from "../types/team.types";
import styles from "./team-page.module.css";

interface TeamMemberMobileCardProps {
  member: TeamMember;
  onAction: (member: TeamMember, action: MemberAction) => void;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toLocaleUpperCase();
}

export function TeamMemberMobileCard({
  member,
  onAction,
}: TeamMemberMobileCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article className={styles.memberMobileCard}>
      <div className={styles.mobileMemberHeader}>
        <span className={styles.avatar} aria-hidden="true">
          {getInitials(member.name)}
        </span>
        <span className={styles.memberCopy}>
          <strong>{member.name}</strong>
          <small>{member.email}</small>
        </span>
        <button
          type="button"
          className={styles.iconButton}
          aria-label={`Actions for ${member.name}`}
          aria-expanded={expanded}
          onClick={() => setExpanded((current) => !current)}
        >
          <MoreHorizontal size={17} />
        </button>
      </div>

      <dl className={styles.mobileMemberDetails}>
        <div>
          <dt>Role</dt>
          <dd>{member.role}</dd>
        </div>
        <div>
          <dt>Projects</dt>
          <dd>{member.projectIds.length}</dd>
        </div>
        <div>
          <dt>Workload</dt>
          <dd>{member.workload}%</dd>
        </div>
        <div>
          <dt>Last active</dt>
          <dd>{member.lastActive}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>
            {member.status === "active"
              ? "Active"
              : member.status === "invited"
                ? "Invited"
                : "Inactive"}
          </dd>
        </div>
      </dl>

      {expanded ? (
        <div className={styles.mobileMemberActions}>
          <button
            type="button"
            onClick={() => onAction(member, "view_profile")}
          >
            View profile
          </button>
          <button
            type="button"
            onClick={() => onAction(member, "manage_project_access")}
          >
            Manage access
          </button>
          {member.role !== "Workspace Owner" ? (
            <button
              type="button"
              onClick={() => onAction(member, "edit_role")}
            >
              Edit role
            </button>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
