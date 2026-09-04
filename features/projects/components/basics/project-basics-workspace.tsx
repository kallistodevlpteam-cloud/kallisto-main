"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, MessageSquare } from "lucide-react";
import styles from "./project-basics-workspace.module.css";

export interface ProjectBasicsWorkspaceProps {
  projectId: string;
  projectName?: string;
  builtUpArea?: string;
  timeline?: string;
}

interface BasicsServiceItem {
  id: string;
  name: string;
  category: string;
  provider: string;
  lead: string;
  fee: string;
  status: "active" | "completed";
  statusText: string;
  latestUpdate: string;
  updateTime: string;
}

const CONNECTED_SERVICES: BasicsServiceItem[] = [
  {
    id: "bs-01",
    name: "RCC Structural Engineering & Peer Review",
    category: "Engineering",
    provider: "Axis Structures (Kochi)",
    lead: "Er. Rahul Nair",
    fee: "₹85,000",
    status: "active",
    statusText: "Active (75%)",
    latestUpdate: "Uploaded Sheet ST-204 for first-floor slab beam reinforcement detailing.",
    updateTime: "Yesterday",
  },
  {
    id: "bs-02",
    name: "Integrated MEP Engineering (Electrical & Plumbing)",
    category: "MEP Consulting",
    provider: "Enviro MEP Consultants (Kozhikode)",
    lead: "Siddharth K",
    fee: "₹68,000",
    status: "active",
    statusText: "Active (60%)",
    latestUpdate: "Updated solar PV inverter tie-in circuits & breaker schedule in DB Schedule.",
    updateTime: "2 days ago",
  },
  {
    id: "bs-03",
    name: "Soil Geotechnical Investigation & Bearing Stability",
    category: "Specialist Consulting",
    provider: "Terra Geotechnics (Thrissur)",
    lead: "Dr. Jacob V",
    fee: "₹42,000",
    status: "completed",
    statusText: "Completed",
    latestUpdate: "Soil borehole testing certified 180 kN/m² safe bearing capacity with zero differential settlement risk.",
    updateTime: "18 May",
  },
  {
    id: "bs-04",
    name: "Building Permit & Statutory Sanctions Advisory",
    category: "Compliance",
    provider: "PermitPath Consultants (Thiruvananthapuram)",
    lead: "Anand M",
    fee: "₹35,000",
    status: "completed",
    statusText: "Sanctioned",
    latestUpdate: "Municipal Corporation Town Planning Dept approved residential building permit order #KMBR-2026-0814.",
    updateTime: "02 Jun",
  },
];

export function ProjectBasicsWorkspace({
  projectId,
  projectName = "Nila Residence",
}: ProjectBasicsWorkspaceProps) {
  return (
    <div className={styles.workspaceRoot}>
      {/* ── 1. Top Header Row ─────────────────────────────────── */}
      <div className={styles.headerRow}>
        <div className={styles.titleGroup}>
          <h4 className={styles.heading}>Basics Services</h4>
          <span className={styles.countBadge}>
            {CONNECTED_SERVICES.length} Connected Services
          </span>
        </div>
        <Link href="/basics" className={styles.profileBtn}>
          <span>Open Basics Workspace</span>
          <ArrowRight size={13} />
        </Link>
      </div>

      {/* ── 2. Connected Basics Services & Live Updates ─────────── */}
      <div className={styles.servicesSection}>
        <div className={styles.servicesList}>
          {CONNECTED_SERVICES.map((svc) => (
            <div key={svc.id} className={styles.serviceRow}>
              <div className={styles.serviceMain}>
                <div className={styles.serviceTitleRow}>
                  <span className={styles.serviceTitle}>{svc.name}</span>
                  <span className={styles.serviceCategory}>{svc.category}</span>
                </div>
                <div className={styles.serviceProvider}>
                  <span>Provider: <strong>{svc.provider}</strong></span>
                  <span style={{ margin: "0 6px" }}>·</span>
                  <span>Lead: <strong>{svc.lead}</strong></span>
                </div>
                <div className={styles.serviceUpdate}>
                  <MessageSquare size={12} color="#0284c7" style={{ flexShrink: 0 }} />
                  <span className={styles.updateText}>{svc.latestUpdate}</span>
                  <span className={styles.updateTime}>{svc.updateTime}</span>
                </div>
              </div>

              <div className={styles.serviceActions}>
                <span className={styles.serviceFee}>Fee: {svc.fee}</span>
                <span
                  className={
                    svc.status === "active"
                      ? styles.statusTagActive
                      : styles.statusTagCompleted
                  }
                >
                  {svc.statusText}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
