"use client";

import React, { useState } from "react";
import { UserPlus, MoreVertical, ShieldCheck, Check } from "lucide-react";
import type { ClientProjectAccessMember } from "../../types/client-settings.types";
import styles from "../../styles/client-settings.module.css";

const INITIAL_MEMBERS: ClientProjectAccessMember[] = [
  {
    id: "mem-1",
    name: "Saran Kumar",
    email: "saran.kumar@example.com",
    role: "Owner",
    projectId: "nila-residence",
    projectName: "Nila Residence",
    accessLevel: "Full Access",
    status: "Active",
    permissions: {
      overview: true,
      documents: true,
      financial: true,
      enquiries: true,
      approvals: true,
      payments: true,
    },
  },
  {
    id: "mem-2",
    name: "Arjun Menon",
    email: "arjun@studiomenon.in",
    role: "Architect",
    projectId: "nila-residence",
    projectName: "Nila Residence",
    accessLevel: "View & Approve",
    status: "Active",
    permissions: {
      overview: true,
      documents: true,
      financial: false,
      enquiries: true,
      approvals: true,
      payments: false,
    },
  },
  {
    id: "mem-3",
    name: "Priya Sharma",
    email: "priya.sharma@gmail.com",
    role: "Family Member",
    projectId: "nila-residence",
    projectName: "Nila Residence",
    accessLevel: "View Only",
    status: "Active",
    permissions: {
      overview: true,
      documents: true,
      financial: false,
      enquiries: false,
      approvals: false,
      payments: false,
    },
  },
  {
    id: "mem-4",
    name: "Thomas Varghese",
    email: "thomas@varghesepmc.com",
    role: "Project Manager",
    projectId: "malabar-heritage",
    projectName: "Malabar Heritage Villa",
    accessLevel: "View & Approve",
    status: "Active",
    permissions: {
      overview: true,
      documents: true,
      financial: true,
      enquiries: false,
      approvals: true,
      payments: false,
    },
  },
];

export function ProjectAccessSection() {
  const [members, setMembers] = useState<ClientProjectAccessMember[]>(INITIAL_MEMBERS);
  const [filterProject, setFilterProject] = useState<string>("all");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedMemberForEdit, setSelectedMemberForEdit] = useState<ClientProjectAccessMember | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<ClientProjectAccessMember["role"]>("Family Member");
  const [inviteProject, setInviteProject] = useState("Nila Residence");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredMembers = members.filter((m) => {
    if (filterProject === "all") return true;
    return m.projectId === filterProject;
  });

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newMember: ClientProjectAccessMember = {
      id: `mem-${Date.now()}`,
      name: inviteName,
      email: inviteEmail,
      role: inviteRole,
      projectId: inviteProject.toLowerCase().replace(/\s+/g, "-"),
      projectName: inviteProject,
      accessLevel: "View Only",
      status: "Pending Invite",
      permissions: {
        overview: true,
        documents: true,
        financial: false,
        enquiries: false,
        approvals: false,
        payments: false,
      },
    };
    setMembers([...members, newMember]);
    setShowInviteModal(false);
    setInviteName("");
    setInviteEmail("");
    showToast(`Invitation sent to ${inviteEmail}`);
  };

  const handleRemoveMember = (id: string) => {
    setMembers(members.filter((m) => m.id !== id));
    setSelectedMemberForEdit(null);
    showToast("Collaborator access removed");
  };

  const handleSavePermissions = () => {
    if (!selectedMemberForEdit) return;
    setMembers(members.map((m) => (m.id === selectedMemberForEdit.id ? selectedMemberForEdit : m)));
    setSelectedMemberForEdit(null);
    showToast("Access permissions updated");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.cardHeaderTitle}>Project Collaborators & Access</h2>
            <p className={styles.cardHeaderSubtitle}>
              Control who can view your project drawings, approve milestones, and inspect financial budgets.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {toastMessage && (
              <div className={styles.toastSaved}>
                <Check size={14} />
                <span>{toastMessage}</span>
              </div>
            )}
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={() => setShowInviteModal(true)}
            >
              <UserPlus size={14} />
              <span>Invite Person</span>
            </button>
          </div>
        </div>

        {/* Project Filter Toolbar */}
        <div style={{ padding: "14px 24px", borderBottom: "1px solid var(--line, #e2e8f0)", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "12.5px", fontWeight: 600, color: "#475569" }}>
            Filter by Project:
          </span>
          <select
            className={styles.select}
            style={{ width: "240px", padding: "6px 10px", fontSize: "13px" }}
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
          >
            <option value="all">All Projects ({members.length})</option>
            <option value="nila-residence">Nila Residence (3)</option>
            <option value="malabar-heritage">Malabar Heritage Villa (1)</option>
          </select>
        </div>

        {/* Table of Members */}
        <div className={styles.cardBody} style={{ padding: "0" }}>
          <table className={styles.settingsTable}>
            <thead>
              <tr>
                <th>Person</th>
                <th>Role</th>
                <th>Project</th>
                <th>Access Level</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <tr key={member.id}>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: "13.5px" }}>{member.name}</div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>{member.email}</div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 500 }}>{member.role}</span>
                  </td>
                  <td>{member.projectName}</td>
                  <td>
                    <span style={{ fontSize: "12.5px", fontWeight: 500 }}>{member.accessLevel}</span>
                  </td>
                  <td>
                    <span
                      className={`${styles.badge} ${
                        member.status === "Active" ? styles.badgeActive : styles.badgePending
                      }`}
                    >
                      {member.status}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {member.role !== "Owner" ? (
                      <div style={{ display: "inline-flex", gap: "8px" }}>
                        <button
                          type="button"
                          className={styles.btnSecondary}
                          style={{ fontSize: "12px", padding: "4px 8px" }}
                          onClick={() => setSelectedMemberForEdit(member)}
                        >
                          Manage
                        </button>
                        <button
                          type="button"
                          className={styles.btnSecondary}
                          style={{ fontSize: "12px", padding: "4px 8px", color: "#ef4444" }}
                          onClick={() => handleRemoveMember(member.id)}
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: "12px", color: "#64748b" }}>Account Owner</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "16px",
          }}
          role="dialog"
          aria-modal="true"
        >
          <form
            onSubmit={handleInviteSubmit}
            className={styles.card}
            style={{ width: "100%", maxWidth: "480px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)" }}
          >
            <div className={styles.cardHeader}>
              <h3 className={styles.cardHeaderTitle}>Invite Project Collaborator</h3>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="invName">Full Name</label>
                <input
                  id="invName"
                  type="text"
                  className={styles.input}
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Arjun Menon"
                  required
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="invEmail">Email Address</label>
                <input
                  id="invEmail"
                  type="email"
                  className={styles.input}
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="e.g. arjun@studiomenon.in"
                  required
                />
              </div>

              <div className={styles.inputGrid}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="invRole">Role</label>
                  <select
                    id="invRole"
                    className={styles.select}
                    value={inviteRole}
                    onChange={(e) =>
                      setInviteRole(e.target.value as ClientProjectAccessMember["role"])
                    }
                  >
                    <option value="Family Member">Family Member</option>
                    <option value="Architect">Architect</option>
                    <option value="Project Manager">Project Manager</option>
                    <option value="Consultant">Consultant / Engineer</option>
                    <option value="Contractor">Contractor</option>
                  </select>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="invProject">Project</label>
                  <select
                    id="invProject"
                    className={styles.select}
                    value={inviteProject}
                    onChange={(e) => setInviteProject(e.target.value)}
                  >
                    <option value="Nila Residence">Nila Residence</option>
                    <option value="Malabar Heritage Villa">Malabar Heritage Villa</option>
                  </select>
                </div>
              </div>
            </div>
            <div className={styles.cardFooter}>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => setShowInviteModal(false)}
              >
                Cancel
              </button>
              <button type="submit" className={styles.btnPrimary}>
                Send Invitation
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Manage Permissions Modal */}
      {selectedMemberForEdit && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "16px",
          }}
          role="dialog"
          aria-modal="true"
        >
          <div
            className={styles.card}
            style={{ width: "100%", maxWidth: "520px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)" }}
          >
            <div className={styles.cardHeader}>
              <div>
                <h3 className={styles.cardHeaderTitle}>Manage Permissions</h3>
                <p className={styles.cardHeaderSubtitle}>
                  {selectedMemberForEdit.name} · {selectedMemberForEdit.projectName}
                </p>
              </div>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.settingRow}>
                <div className={styles.settingInfo}>
                  <span className={styles.settingLabel}>Project Overview</span>
                  <span className={styles.settingDesc}>View project brief, milestones and progress feed.</span>
                </div>
                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    checked={selectedMemberForEdit.permissions.overview}
                    onChange={(e) =>
                      setSelectedMemberForEdit({
                        ...selectedMemberForEdit,
                        permissions: {
                          ...selectedMemberForEdit.permissions,
                          overview: e.target.checked,
                        },
                      })
                    }
                  />
                  <span className={styles.slider} />
                </label>
              </div>

              <div className={styles.settingRow}>
                <div className={styles.settingInfo}>
                  <span className={styles.settingLabel}>Documents & Drawings</span>
                  <span className={styles.settingDesc}>Access CAD, 3D views, and architectural sheets.</span>
                </div>
                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    checked={selectedMemberForEdit.permissions.documents}
                    onChange={(e) =>
                      setSelectedMemberForEdit({
                        ...selectedMemberForEdit,
                        permissions: {
                          ...selectedMemberForEdit.permissions,
                          documents: e.target.checked,
                        },
                      })
                    }
                  />
                  <span className={styles.slider} />
                </label>
              </div>

              <div className={styles.settingRow}>
                <div className={styles.settingInfo}>
                  <span className={styles.settingLabel}>Financial Information</span>
                  <span className={styles.settingDesc}>View BOQ rates, payment schedules, and invoices.</span>
                </div>
                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    checked={selectedMemberForEdit.permissions.financial}
                    onChange={(e) =>
                      setSelectedMemberForEdit({
                        ...selectedMemberForEdit,
                        permissions: {
                          ...selectedMemberForEdit.permissions,
                          financial: e.target.checked,
                        },
                      })
                    }
                  />
                  <span className={styles.slider} />
                </label>
              </div>

              <div className={styles.settingRow}>
                <div className={styles.settingInfo}>
                  <span className={styles.settingLabel}>Approvals Authority</span>
                  <span className={styles.settingDesc}>Approve variation orders, drawing revisions, and estimates.</span>
                </div>
                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    checked={selectedMemberForEdit.permissions.approvals}
                    onChange={(e) =>
                      setSelectedMemberForEdit({
                        ...selectedMemberForEdit,
                        permissions: {
                          ...selectedMemberForEdit.permissions,
                          approvals: e.target.checked,
                        },
                      })
                    }
                  />
                  <span className={styles.slider} />
                </label>
              </div>
            </div>
            <div className={styles.cardFooter}>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => setSelectedMemberForEdit(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={handleSavePermissions}
              >
                Save Permissions
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
