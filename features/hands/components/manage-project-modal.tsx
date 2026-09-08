"use client";

import React from "react";
import Link from "next/link";
import {
  X,
  ExternalLink,
  FolderKanban,
  ListTodo,
  Calculator,
  CalendarRange,
  HardHat,
  Receipt,
  Building2,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import type { Deployment } from "../types/hands.types";

interface ManageProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  deployment: Deployment;
  basePath?: string;
}

export function ManageProjectModal({
  isOpen,
  onClose,
  deployment,
  basePath: _basePath = "/hands",
}: ManageProjectModalProps) {
  if (!isOpen) return null;

  const projectId = deployment.projectId || "proj-001";

  const managementModules = [
    {
      title: "Project Tasks & Deliverables",
      description: "Manage architecture & structural task items, assignees, deadlines, and milestone reviews.",
      href: `/projects/${projectId}/tasks`,
      icon: ListTodo,
      color: "#2563eb",
      badge: "Active",
    },
    {
      title: "BOQ & Quantities",
      description: "Inspect Bill of Quantities, approved item rates, material takeoffs, and line-item specs.",
      href: `/projects/${projectId}/boq`,
      icon: Calculator,
      color: "#059669",
      badge: "Approved",
    },
    {
      title: "Schedule & Gantt Timeline",
      description: "Track project phases, activity dependencies, critical paths, and milestone deadlines.",
      href: `/projects/${projectId}/timeline`,
      icon: CalendarRange,
      color: "#7c3aed",
      badge: "On Track",
    },
    {
      title: "Site Inspections & Snags",
      description: "Access field supervision logs, site photos, snag items, and compliance records.",
      href: `/projects/${projectId}/site`,
      icon: HardHat,
      color: "#ea580c",
      badge: "Inspection",
    },
    {
      title: "Project Finance & Variations",
      description: "Review contract total, approved variation claims, payment schedules, and stage milestones.",
      href: `/projects/${projectId}/finance`,
      icon: Receipt,
      color: "#0284c7",
      badge: "Financial",
    },
    {
      title: "Full Project Overview",
      description: "Open the comprehensive master project dashboard with all drawings and client approvals.",
      href: `/projects/${projectId}`,
      icon: FolderKanban,
      color: "#0f172a",
      badge: "Master",
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="manage-project-modal-title"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "16px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "680px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          overflow: "hidden",
          border: "1px solid #e2e8f0",
          animation: "fadeIn 150ms ease-out",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 24px",
            borderBottom: "1px solid #f1f5f9",
            backgroundColor: "#f8fafc",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Building2 size={18} color="#0f172a" />
              <h2
                id="manage-project-modal-title"
                style={{
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "#0f172a",
                  margin: 0,
                }}
              >
                Manage Project · {deployment.projectName}
              </h2>
            </div>
            <p style={{ fontSize: "12px", color: "#64748b", margin: "3px 0 0" }}>
              Access full project workspaces, task boards, BOQ, timeline, and financial controls
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close manage project modal"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              backgroundColor: "#ffffff",
              color: "#64748b",
              cursor: "pointer",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Project Snapshot Header */}
        <div
          style={{
            padding: "14px 24px",
            backgroundColor: "#ffffff",
            borderBottom: "1px solid #f1f5f9",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "12px",
          }}
        >
          <div style={{ borderRight: "1px solid #f1f5f9", paddingRight: "12px" }}>
            <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 600, display: "block" }}>
              Location & Dates
            </span>
            <strong style={{ fontSize: "12px", color: "#0f172a" }}>{deployment.location}</strong>
          </div>
          <div style={{ borderRight: "1px solid #f1f5f9", paddingRight: "12px" }}>
            <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 600, display: "block" }}>
              Deployment Status
            </span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "11.5px",
                fontWeight: 700,
                color: "#16a34a",
              }}
            >
              <CheckCircle2 size={12} />
              {deployment.status || "Active Deployment"}
            </span>
          </div>
          <div>
            <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 600, display: "block" }}>
              Lead Supervisor
            </span>
            <strong style={{ fontSize: "12px", color: "#0f172a" }}>{deployment.supervisor}</strong>
          </div>
        </div>

        {/* Grid of Workspaces */}
        <div
          style={{
            padding: "20px 24px",
            overflowY: "auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
          }}
        >
          {managementModules.map((m) => {
            const Icon = m.icon;
            return (
              <Link
                key={m.title}
                href={m.href}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: "14px 16px",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  backgroundColor: "#ffffff",
                  textDecoration: "none",
                  transition: "all 150ms ease",
                  gap: "6px",
                  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.03)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = m.color;
                  e.currentTarget.style.backgroundColor = "#f8fafc";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.backgroundColor = "#ffffff";
                  e.currentTarget.style.transform = "none";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      backgroundColor: `${m.color}15`,
                      color: m.color,
                    }}
                  >
                    <Icon size={16} />
                  </div>
                  <span
                    style={{
                      fontSize: "10.5px",
                      fontWeight: 700,
                      color: m.color,
                      backgroundColor: `${m.color}12`,
                      padding: "2px 7px",
                      borderRadius: "9999px",
                    }}
                  >
                    {m.badge}
                  </span>
                </div>
                <strong style={{ fontSize: "13px", color: "#0f172a", marginTop: "4px" }}>
                  {m.title}
                </strong>
                <p style={{ fontSize: "11.5px", color: "#64748b", margin: 0, lineHeight: 1.4 }}>
                  {m.description}
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "11.5px",
                    fontWeight: 650,
                    color: m.color,
                    marginTop: "auto",
                    paddingTop: "6px",
                  }}
                >
                  <span>Open workspace</span>
                  <ChevronRight size={13} />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 24px",
            borderTop: "1px solid #f1f5f9",
            backgroundColor: "#f8fafc",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11.5px", color: "#64748b" }}>
            <ShieldCheck size={14} color="#16a34a" />
            <span>Authoritative Kallisto Project Record</span>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "7px 14px",
                fontSize: "12px",
                fontWeight: 600,
                color: "#475569",
                backgroundColor: "#ffffff",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Close
            </button>
            <Link
              href={`/projects/${projectId}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "7px 16px",
                fontSize: "12px",
                fontWeight: 650,
                color: "#ffffff",
                backgroundColor: "#0f172a",
                borderRadius: "8px",
                textDecoration: "none",
              }}
            >
              <span>Open Full Workspace</span>
              <ExternalLink size={12} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
