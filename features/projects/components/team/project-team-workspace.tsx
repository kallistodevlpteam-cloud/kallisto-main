"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Plus,
  LayoutGrid,
  List,
  CheckCircle2,
  Clock,
  Calendar,
  Phone,
  Mail,
  ArrowRight,
  ShieldCheck,
  Briefcase,
  Layers,
  Sparkles,
  X,
  FileCheck2,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import styles from "./project-team-workspace.module.css";

export interface ProjectTeamMemberData {
  id: string;
  name: string;
  role: string;
  avatar: string;
  phone: string;
  email: string;
  allocation: number; // percentage (e.g. 100, 80, 50)
  statusTag: string;
  statusTagColor: "green" | "purple" | "blue" | "amber";
  activeTasksCount: number;
  currentTask: {
    title: string;
    stage: "In Progress" | "Pending Review" | "Pending" | "Completed";
    dueDate: string;
  };
  latestUpdate: {
    content: string;
    timestamp: string;
  };
  timelineMilestone: {
    name: string;
    status: "Completed" | "In Progress" | "Upcoming";
    dueDate: string;
  };
}

export const INITIAL_PROJECT_TEAM: ProjectTeamMemberData[] = [
  {
    id: "arjun-menon",
    name: "Arjun Menon",
    role: "Project Manager",
    avatar: "/assets/arjun-avatar.jpg",
    phone: "+91 98470 12345",
    email: "arjun.m@kallisto.design",
    allocation: 100,
    statusTag: "Active Lead",
    statusTagColor: "green",
    activeTasksCount: 3,
    currentTask: {
      title: "Review slab casting schedule & concrete logistics",
      stage: "In Progress",
      dueDate: "Today, 5:00 PM",
    },
    latestUpdate: {
      content: "Logged site concrete batching test certificate #CB-9481 (Passed)",
      timestamp: "2 hrs ago",
    },
    timelineMilestone: {
      name: "MEP Coordination & Slab Casting",
      status: "In Progress",
      dueDate: "04 Sep 2026",
    },
  },
  {
    id: "priya-sharma",
    name: "Priya Sharma",
    role: "Lead Architect",
    avatar: "/assets/priya-avatar.jpg",
    phone: "+91 98471 23456",
    email: "priya.s@kallisto.design",
    allocation: 80,
    statusTag: "Design Sign-off",
    statusTagColor: "purple",
    activeTasksCount: 2,
    currentTask: {
      title: "Living room elevation & spatial joinery details",
      stage: "Pending Review",
      dueDate: "In 2 days",
    },
    latestUpdate: {
      content: "Uploaded Architectural Drawing Sheet A-104 (v2.1 Approved by Client)",
      timestamp: "Yesterday",
    },
    timelineMilestone: {
      name: "Interior Design Concept Approval",
      status: "In Progress",
      dueDate: "08 Sep 2026",
    },
  },
];

export interface ProjectTeamWorkspaceProps {
  projectId?: string;
  projectName?: string;
}

export function ProjectTeamWorkspace({
  projectId = "prj-1",
  projectName = "Nila Residence",
}: ProjectTeamWorkspaceProps) {
  const [members, setMembers] = useState<ProjectTeamMemberData[]>(INITIAL_PROJECT_TEAM);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Member Form State
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("Architect");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberPhone, setNewMemberPhone] = useState("+91 ");
  const [newMemberAllocation, setNewMemberAllocation] = useState(80);
  const [newMemberTask, setNewMemberTask] = useState("");
  const [newMemberMilestone, setNewMemberMilestone] = useState("Phase 2 Execution");
  const [newMemberAuthority, setNewMemberAuthority] = useState("Design Contributor");

  // Filtered members list
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.currentTask.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.timelineMilestone.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole =
        selectedRole === "all" ||
        m.role.toLowerCase().includes(selectedRole.toLowerCase());

      return matchesSearch && matchesRole;
    });
  }, [members, searchQuery, selectedRole]);

  // Aggregate Metrics
  const totalMembers = members.length;
  const distinctRoles = Array.from(new Set(members.map((m) => m.role))).length;
  const totalActiveTasks = members.reduce((acc, m) => acc + m.activeTasksCount, 0);
  const avgAllocation = Math.round(
    members.reduce((acc, m) => acc + m.allocation, 0) / (members.length || 1)
  );
  const signOffLeads = members.filter(
    (m) => m.statusTagColor === "purple" || m.statusTagColor === "green"
  ).length;

  function handleAddMemberSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    const newMember: ProjectTeamMemberData = {
      id: `member-${Date.now()}`,
      name: newMemberName.trim(),
      role: newMemberRole,
      avatar: "/assets/arjun-avatar.jpg",
      email: newMemberEmail || `${newMemberName.toLowerCase().replace(/\s+/g, ".")}@kallisto.design`,
      phone: newMemberPhone || "+91 98470 00000",
      allocation: newMemberAllocation,
      statusTag: newMemberAuthority,
      statusTagColor: "purple",
      activeTasksCount: newMemberTask ? 1 : 0,
      currentTask: {
        title: newMemberTask || "Initial project onboarding & briefing",
        stage: "In Progress",
        dueDate: "Next Week",
      },
      latestUpdate: {
        content: `Assigned to ${projectName} by Practice Lead`,
        timestamp: "Just now",
      },
      timelineMilestone: {
        name: newMemberMilestone,
        status: "In Progress",
        dueDate: "End of Month",
      },
    };

    setMembers((prev) => [newMember, ...prev]);
    setIsAddModalOpen(false);

    // Reset Form
    setNewMemberName("");
    setNewMemberTask("");
    setNewMemberEmail("");

    // Show feedback toast
    setToastMessage(`Added ${newMember.name} as ${newMember.role} to ${projectName}`);
    setTimeout(() => setToastMessage(null), 4000);
  }

  function getBadgeClass(color: "green" | "purple" | "blue" | "amber") {
    switch (color) {
      case "green":
        return styles.badgeGreen;
      case "purple":
        return styles.badgePurple;
      case "blue":
        return styles.badgeBlue;
      case "amber":
        return styles.badgeAmber;
      default:
        return styles.badgeGreen;
    }
  }

  function getStagePillClass(stage: "In Progress" | "Pending Review" | "Pending" | "Completed") {
    switch (stage) {
      case "In Progress":
        return styles.stageProgress;
      case "Pending Review":
        return styles.stageReview;
      case "Completed":
        return styles.stageCompleted;
      case "Pending":
      default:
        return styles.stagePending;
    }
  }

  return (
    <div className={styles.workspaceRoot}>
      {/* ── Toast Notification ────────────────────────────────────────── */}
      {toastMessage && (
        <div className={styles.successToast}>
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── 1. KPI & Summary Metrics Strip ───────────────────────────── */}
      <div className={styles.kpiStrip}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Assigned Team</span>
            <Users size={16} />
          </div>
          <span className={styles.kpiValue}>{totalMembers}</span>
          <span className={styles.kpiSubText}>All active personnel</span>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Disciplines</span>
            <Briefcase size={16} />
          </div>
          <span className={styles.kpiValue}>{distinctRoles}</span>
          <span className={styles.kpiSubText}>Cross-functional roles</span>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Active Tasks</span>
            <FileCheck2 size={16} />
          </div>
          <span className={styles.kpiValue}>{totalActiveTasks}</span>
          <span className={styles.kpiSubText}>Assigned in project</span>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Avg Allocation</span>
            <TrendingUp size={16} />
          </div>
          <span className={styles.kpiValue}>{avgAllocation}%</span>
          <span className={styles.kpiSubText}>Dedicated bandwidth</span>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Sign-off Leads</span>
            <ShieldCheck size={16} />
          </div>
          <span className={styles.kpiValue}>{signOffLeads}</span>
          <span className={styles.kpiSubText}>Verified approval roles</span>
        </div>
      </div>

      {/* ── 2. Toolbar (Search, Filter, View Mode, Add Action) ───────── */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <div className={styles.searchBox}>
            <Search size={15} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search by name, role, task..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className={styles.roleFilterSelect}
            aria-label="Filter by role"
          >
            <option value="all">All Roles ({members.length})</option>
            <option value="Manager">Project Managers</option>
            <option value="Architect">Architects</option>
            <option value="Engineer">Engineers</option>
            <option value="Designer">Interior Designers</option>
            <option value="Surveyor">Quality Surveyors</option>
            <option value="Cost">BOQ & Cost Leads</option>
          </select>
        </div>

        <div className={styles.toolbarRight}>
          <div className={styles.viewToggleGroup}>
            <button
              type="button"
              className={`${styles.viewToggleBtn} ${viewMode === "grid" ? styles.viewToggleBtnActive : ""}`}
              onClick={() => setViewMode("grid")}
              title="Card Grid View"
            >
              <LayoutGrid size={14} />
              <span>Cards</span>
            </button>
            <button
              type="button"
              className={`${styles.viewToggleBtn} ${viewMode === "table" ? styles.viewToggleBtnActive : ""}`}
              onClick={() => setViewMode("table")}
              title="Matrix Table View"
            >
              <List size={14} />
              <span>Matrix</span>
            </button>
          </div>

          <button
            type="button"
            className={styles.addMemberBtn}
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus size={15} />
            <span>Add Team Member</span>
          </button>
        </div>
      </div>

      {/* ── 3. Team Members Grid View ─────────────────────────────────── */}
      {viewMode === "grid" ? (
        <div className={styles.membersGrid}>
          {filteredMembers.map((member) => (
            <div key={member.id} className={styles.memberCard}>
              {/* Card Header */}
              <div className={styles.cardHeader}>
                <div className={styles.memberIdentity}>
                  <div className={styles.avatarBox}>
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className={styles.avatarImg}
                    />
                    <span className={styles.onlineDot} />
                  </div>
                  <div className={styles.metaNames}>
                    <span className={styles.memberName}>{member.name}</span>
                    <span className={styles.memberRole}>{member.role}</span>
                  </div>
                </div>
                <span className={`${styles.authorityBadge} ${getBadgeClass(member.statusTagColor)}`}>
                  {member.statusTag}
                </span>
              </div>

              {/* Workload & Allocation Progress */}
              <div className={styles.allocationRow}>
                <div className={styles.allocationTop}>
                  <span className={styles.allocationLabel}>Project Allocation</span>
                  <span className={styles.allocationVal}>{member.allocation}% Dedicated</span>
                </div>
                <div className={styles.allocationBarTrack}>
                  <div
                    className={styles.allocationBarFill}
                    style={{ width: `${Math.min(member.allocation, 100)}%` }}
                  />
                </div>
              </div>

              {/* Operational Info Blocks: Tasks, Updates & Timeline */}
              <div className={styles.infoBlocksGrid}>
                {/* Active Task */}
                <div className={styles.infoBlock}>
                  <Briefcase size={14} className={styles.blockIcon} />
                  <div className={styles.blockContent}>
                    <div className={styles.blockTitleRow}>
                      <span className={styles.blockHeading}>
                        Current Task ({member.activeTasksCount})
                      </span>
                      <span className={`${styles.blockStagePill} ${getStagePillClass(member.currentTask.stage)}`}>
                        {member.currentTask.stage}
                      </span>
                    </div>
                    <span className={styles.blockText} title={member.currentTask.title}>
                      {member.currentTask.title}
                    </span>
                    <span className={styles.blockMetaSub}>
                      Due: {member.currentTask.dueDate}
                    </span>
                  </div>
                </div>

                {/* Latest Update */}
                <div className={styles.infoBlock}>
                  <Clock size={14} className={styles.blockIcon} />
                  <div className={styles.blockContent}>
                    <div className={styles.blockTitleRow}>
                      <span className={styles.blockHeading}>Latest Activity</span>
                      <span className={styles.blockMetaSub}>{member.latestUpdate.timestamp}</span>
                    </div>
                    <span className={styles.blockText} title={member.latestUpdate.content}>
                      {member.latestUpdate.content}
                    </span>
                  </div>
                </div>

                {/* Timeline Milestone */}
                <div className={styles.infoBlock}>
                  <Calendar size={14} className={styles.blockIcon} />
                  <div className={styles.blockContent}>
                    <div className={styles.blockTitleRow}>
                      <span className={styles.blockHeading}>Assigned Milestone</span>
                      <span className={styles.blockMetaSub}>{member.timelineMilestone.dueDate}</span>
                    </div>
                    <span className={styles.blockText} title={member.timelineMilestone.name}>
                      {member.timelineMilestone.name}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer: Contacts & Action Links */}
              <div className={styles.cardFooter}>
                <div className={styles.contactInfo}>
                  <a href={`tel:${member.phone}`} className={styles.contactItem} title={member.phone}>
                    <Phone size={12} />
                    <span>Call</span>
                  </a>
                  <a href={`mailto:${member.email}`} className={styles.contactItem} title={member.email}>
                    <Mail size={12} />
                    <span>Email</span>
                  </a>
                </div>

                <div className={styles.actionLinksGroup}>
                  <Link
                    href={`/projects/${projectId}/tasks`}
                    className={styles.actionBtn}
                  >
                    <span>View Tasks</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ── Matrix Table View ───────────────────────────────────────── */
        <div className={styles.tableWrapper}>
          <table className={styles.matrixTable}>
            <thead>
              <tr>
                <th>Team Member</th>
                <th>Project Role</th>
                <th>Allocation</th>
                <th>Assigned Task</th>
                <th>Latest Update</th>
                <th>Milestone Target</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <tr key={member.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <img
                        src={member.avatar}
                        alt={member.name}
                        style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }}
                      />
                      <div>
                        <strong style={{ display: "block", color: "#0f172a" }}>{member.name}</strong>
                        <span style={{ fontSize: "11px", color: "#64748b" }}>{member.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>
                      <span style={{ fontWeight: 600, color: "#334155", display: "block" }}>{member.role}</span>
                      <span className={`${styles.authorityBadge} ${getBadgeClass(member.statusTagColor)}`}>
                        {member.statusTag}
                      </span>
                    </div>
                  </td>
                  <td>
                    <strong style={{ color: "#0f172a" }}>{member.allocation}%</strong>
                  </td>
                  <td>
                    <div style={{ maxWidth: "220px" }}>
                      <span style={{ display: "block", fontWeight: 500, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {member.currentTask.title}
                      </span>
                      <span className={`${styles.blockStagePill} ${getStagePillClass(member.currentTask.stage)}`}>
                        {member.currentTask.stage}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div style={{ maxWidth: "220px" }}>
                      <span style={{ display: "block", color: "#475569", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {member.latestUpdate.content}
                      </span>
                      <span style={{ fontSize: "11px", color: "#94a3b8" }}>{member.latestUpdate.timestamp}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ maxWidth: "180px" }}>
                      <span style={{ display: "block", fontWeight: 600, color: "#334155" }}>
                        {member.timelineMilestone.name}
                      </span>
                      <span style={{ fontSize: "11px", color: "#64748b" }}>
                        {member.timelineMilestone.dueDate}
                      </span>
                    </div>
                  </td>
                  <td>
                    <Link
                      href={`/projects/${projectId}/tasks`}
                      className={styles.actionBtn}
                    >
                      <span>Tasks</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── 4. Add Team Member Modal Dialog ───────────────────────────── */}
      {isAddModalOpen && (
        <div className={styles.modalBackdrop} onClick={() => setIsAddModalOpen(false)}>
          <div className={styles.modalDialog} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Add Member to {projectName}</h3>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setIsAddModalOpen(false)}
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddMemberSubmit} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maya Chandran"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Project Role</label>
                  <select
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value)}
                    className={styles.formSelect}
                  >
                    <option value="Lead Architect">Lead Architect</option>
                    <option value="Project Manager">Project Manager</option>
                    <option value="Structural Engineer">Structural Engineer</option>
                    <option value="Interior Designer">Interior Designer</option>
                    <option value="Quantity Surveyor">Quantity Surveyor</option>
                    <option value="Site Engineer">Site Engineer</option>
                    <option value="MEP Consultant">MEP Consultant</option>
                    <option value="Landscape Architect">Landscape Architect</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Authority Tag</label>
                  <select
                    value={newMemberAuthority}
                    onChange={(e) => setNewMemberAuthority(e.target.value)}
                    className={styles.formSelect}
                  >
                    <option value="Design Sign-off">Design Sign-off</option>
                    <option value="Active Lead">Active Lead</option>
                    <option value="Site Verification">Site Verification</option>
                    <option value="Finishes & FF&E">Finishes & FF&E</option>
                    <option value="Cost Controller">Cost Controller</option>
                    <option value="Field Execution">Field Execution</option>
                    <option value="Auditing">Auditing</option>
                  </select>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Email Address</label>
                  <input
                    type="email"
                    placeholder="name@kallisto.design"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+91 98470 12345"
                    value={newMemberPhone}
                    onChange={(e) => setNewMemberPhone(e.target.value)}
                    className={styles.formInput}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Allocation (%)</label>
                  <select
                    value={newMemberAllocation}
                    onChange={(e) => setNewMemberAllocation(Number(e.target.value))}
                    className={styles.formSelect}
                  >
                    <option value={100}>100% Full-time</option>
                    <option value={80}>80% Dedicated</option>
                    <option value={60}>60% Dedicated</option>
                    <option value={50}>50% Part-time</option>
                    <option value={30}>30% Advisory</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Assigned Milestone</label>
                  <select
                    value={newMemberMilestone}
                    onChange={(e) => setNewMemberMilestone(e.target.value)}
                    className={styles.formSelect}
                  >
                    <option value="Phase 2 Execution">Phase 2 Execution</option>
                    <option value="Design Development">Design Development</option>
                    <option value="Slab Casting & Structure">Slab Casting & Structure</option>
                    <option value="Finishes & Fit-out">Finishes & Fit-out</option>
                    <option value="Statutory Sanctions">Statutory Sanctions</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Initial Assigned Task</label>
                <input
                  type="text"
                  placeholder="e.g. Prepare detailed joinery drawings and review hardware"
                  value={newMemberTask}
                  onChange={(e) => setNewMemberTask(e.target.value)}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.submitBtn}>
                  Add to Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
