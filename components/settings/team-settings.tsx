"use client";

import React, { useState } from "react";
import { UserPlus, Trash2 } from "lucide-react";
import styles from "../../app/settings/settings.module.css";

interface TeamSettingsProps {
  workspace: {
    id: string;
    name: string;
  };
  permissions: {
    canManageMembers: boolean;
  };
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "Workspace Owner" | "Admin" | "Member" | "Viewer";
}

export function TeamSettings({ workspace, permissions }: TeamSettingsProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: "1", name: "Saran Kumar", email: "ceoofkallisto@gmail.com", role: "Workspace Owner" },
    { id: "2", name: "Nisha Menon", email: "nisha@kallisto.build", role: "Admin" },
    { id: "3", name: "Kallisto AI", email: "ai-copilot@kallisto.build", role: "Member" },
  ]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"Admin" | "Member" | "Viewer">("Member");

  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!permissions.canManageMembers) {
      alert("Permission denied. Only workspace administrators can invite team members.");
      return;
    }
    if (!inviteEmail.trim()) return;
    const newMember: TeamMember = {
      id: String(Date.now()),
      name: inviteEmail.split("@")[0],
      email: inviteEmail.trim(),
      role: inviteRole,
    };
    setTeamMembers((prev) => [...prev, newMember]);
    setInviteEmail("");
    alert(`Invitation sent to ${inviteEmail}`);
  };

  const handleRemoveMember = (id: string, name: string) => {
    if (!permissions.canManageMembers) {
      alert("Permission denied. Only workspace administrators can remove team members.");
      return;
    }
    if (confirm(`Are you sure you want to remove ${name} from this workspace?`)) {
      setTeamMembers((prev) => prev.filter((m) => m.id !== id));
      alert(`${name} has been removed.`);
    }
  };

  return (
    <div className={styles.contentScrollArea}>
      {/* 1. Invite Member */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.cardHeaderTitle}>Invite Member</h2>
            <p className={styles.cardHeaderSubtitle}>
              Bring team members into your workspace.
            </p>
          </div>
        </div>

        <div className={styles.cardBody}>
          <form onSubmit={handleInviteMember} className={styles.cleanFormGrid}>
            <div className={styles.cleanFieldGroup}>
              <label className={styles.cleanFieldLabel}>Member Email</label>
              <input
                type="email"
                placeholder="team-member@email.com"
                className={styles.cleanInput}
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
              />
            </div>

            <div className={styles.cleanFieldGroup}>
              <label className={styles.cleanFieldLabel}>Role</label>
              <select
                className={styles.cleanSelect}
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as any)}
              >
                <option value="Admin">Admin</option>
                <option value="Member">Member</option>
                <option value="Viewer">Viewer</option>
              </select>
            </div>

            <div className={styles.fullWidthField} style={{ marginTop: "4px" }}>
              <button type="submit" className={styles.btnPrimary}>
                <UserPlus size={14} />
                <span>Invite Member</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 2. Team Members List */}
      <div className={styles.card} style={{ marginTop: "16px" }}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.cardHeaderTitle}>Team Members</h2>
            <p className={styles.cardHeaderSubtitle}>
              Manage access and roles of current collaborators.
            </p>
          </div>
        </div>

        <div className={styles.cardBody}>
          <table className={styles.deviceTable}>
            <thead>
              <tr>
                <th>MEMBER</th>
                <th>ROLE</th>
                <th style={{ textAlign: "right" }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {teamMembers.map((member) => (
                <tr key={member.id}>
                  <td>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span style={{ fontWeight: 600 }}>{member.name}</span>
                      <span style={{ fontSize: "12px", color: "#64748b" }}>{member.email}</span>
                    </div>
                  </td>
                  <td>
                    <span
                      style={{
                        padding: "2px 8px",
                        background: "#f1f5f9",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#334155",
                      }}
                    >
                      {member.role}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {permissions.canManageMembers && member.role !== "Workspace Owner" && (
                      <button
                        type="button"
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#ef4444",
                          cursor: "pointer",
                          padding: "6px",
                        }}
                        title={`Remove ${member.name}`}
                        onClick={() => handleRemoveMember(member.id, member.name)}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
