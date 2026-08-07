"use client";

import React, { useState } from "react";
import styles from "../../app/settings/settings.module.css";
import { UserPlus, Trash2 } from "lucide-react";

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
      role: inviteRole as any,
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
    <div className={styles.settingsContentOutlet}>
      <div className={styles.profileCleanContainer}>
        <section>
          <div className={styles.profileSectionHeader}>
            <h2 className={styles.profileSectionTitle}>Invite Member</h2>
            <p className={styles.profileSectionSubtitle}>
              Bring team members into your workspace.
            </p>
          </div>

          <form onSubmit={handleInviteMember} className={styles.cleanFormGrid}>
            <div className={styles.cleanFieldGroup} style={{ gridColumn: "span 1" }}>
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

            <div className={styles.cleanFieldGroup} style={{ gridColumn: "span 1" }}>
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
              <button
                type="submit"
                style={{
                  background: "#111827",
                  color: "#ffffff",
                  height: "40px",
                  padding: "0 18px",
                  borderRadius: "8px",
                  fontWeight: 600,
                  border: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer",
                }}
              >
                <UserPlus size={16} />
                <span>Invite Member</span>
              </button>
            </div>
          </form>
        </section>

        <section style={{ marginTop: "12px" }}>
          <div className={styles.profileSectionHeader}>
            <h2 className={styles.profileSectionTitle}>Team Members</h2>
            <p className={styles.profileSectionSubtitle}>
              Manage access and roles of current collaborators.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {teamMembers.map((member) => (
              <div
                key={member.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 18px",
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "10px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      background: "#f3f4f6",
                      color: "#111827",
                      fontWeight: 700,
                      fontSize: "13px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {member.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>
                      {member.name}
                    </div>
                    <div style={{ fontSize: "12.5px", color: "#6b7280" }}>{member.email}</div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span
                    style={{
                      padding: "3px 8px",
                      background: "#f3f4f6",
                      border: "1px solid #e5e7eb",
                      color: "#374151",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  >
                    {member.role}
                  </span>

                  {permissions.canManageMembers && member.role !== "Workspace Owner" && (
                    <button
                      type="button"
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#ef4444",
                        cursor: "pointer",
                        padding: "6px",
                        borderRadius: "6px",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      title="Remove member"
                      onClick={() => handleRemoveMember(member.id, member.name)}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
