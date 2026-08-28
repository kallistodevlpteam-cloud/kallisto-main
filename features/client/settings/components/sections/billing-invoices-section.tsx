"use client";

import React, { useState } from "react";
import { Download, FileText } from "lucide-react";
import { RupeeIcon } from "@/components/layout/sidebar-icons";
import type { ClientInvoiceItem } from "../../types/client-settings.types";
import styles from "../../styles/client-settings.module.css";

const INITIAL_INVOICES: ClientInvoiceItem[] = [
  {
    id: "inv-1",
    invoiceNumber: "KAL-INV-2026-089",
    projectId: "nila-residence",
    projectName: "Nila Residence",
    milestoneDescription: "Concept Design & Architectural 3D Views Release",
    date: "Aug 15, 2026",
    amount: 150000,
    status: "paid",
  },
  {
    id: "inv-2",
    invoiceNumber: "KAL-INV-2026-074",
    projectId: "nila-residence",
    projectName: "Nila Residence",
    milestoneDescription: "Site Feasibility & Soil Investigation Advance",
    date: "Jul 28, 2026",
    amount: 75000,
    status: "paid",
  },
  {
    id: "inv-3",
    invoiceNumber: "KAL-INV-2026-061",
    projectId: "malabar-heritage",
    projectName: "Malabar Heritage Villa",
    milestoneDescription: "Foundation & Plinth Stage Masonry Milestone",
    date: "Jun 12, 2026",
    amount: 450000,
    status: "paid",
  },
  {
    id: "inv-4",
    invoiceNumber: "KAL-INV-2026-042",
    projectId: "malabar-heritage",
    projectName: "Malabar Heritage Villa",
    milestoneDescription: "RCC Column & Lintel Casting Milestone",
    date: "Aug 20, 2026",
    amount: 320000,
    status: "pending",
  },
];

export function BillingInvoicesSection() {
  const [filterProject, setFilterProject] = useState<string>("all");

  const filteredInvoices = INITIAL_INVOICES.filter((inv) => {
    if (filterProject === "all") return true;
    return inv.projectId === filterProject;
  });

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <h2 className={styles.cardHeaderTitle}>Billing Statements & Invoices</h2>
          <p className={styles.cardHeaderSubtitle}>
            Download verified GST tax invoices, escrow release receipts, and payment statements.
          </p>
        </div>
      </div>

      {/* Filter toolbar */}
      <div
        style={{
          padding: "14px 24px",
          borderBottom: "1px solid var(--line, #e2e8f0)",
          background: "#f8fafc",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: "12.5px", fontWeight: 600, color: "#475569" }}>
          Filter Billing by Project:
        </span>
        <select
          className={styles.select}
          style={{ width: "240px", padding: "6px 10px", fontSize: "13px" }}
          value={filterProject}
          onChange={(e) => setFilterProject(e.target.value)}
        >
          <option value="all">All Projects ({INITIAL_INVOICES.length})</option>
          <option value="nila-residence">Nila Residence (2)</option>
          <option value="malabar-heritage">Malabar Heritage Villa (2)</option>
        </select>
      </div>

      <div className={styles.cardBody} style={{ padding: "0" }}>
        <table className={styles.settingsTable}>
          <thead>
            <tr>
              <th>Invoice / Receipt</th>
              <th>Project & Milestone</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Download</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.map((inv) => (
              <tr key={inv.id}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <FileText size={16} color="#64748b" />
                    <span style={{ fontWeight: 600, fontSize: "13px" }}>{inv.invoiceNumber}</span>
                  </div>
                </td>
                <td>
                  <div style={{ fontWeight: 600, fontSize: "13px" }}>{inv.projectName}</div>
                  <div style={{ fontSize: "11.5px", color: "#64748b" }}>{inv.milestoneDescription}</div>
                </td>
                <td>{inv.date}</td>
                <td>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "2px", fontWeight: 600 }}>
                    <RupeeIcon size={14} />
                    <span>{inv.amount.toLocaleString("en-IN")}</span>
                  </div>
                </td>
                <td>
                  <span
                    className={`${styles.badge} ${
                      inv.status === "paid" ? styles.badgeActive : styles.badgePending
                    }`}
                  >
                    {inv.status === "paid" ? "Paid & Settled" : "Pending Release"}
                  </span>
                </td>
                <td style={{ textAlign: "right" }}>
                  <button
                    type="button"
                    className={styles.btnSecondary}
                    style={{ fontSize: "12px", padding: "4px 8px" }}
                    onClick={() => alert(`Downloading ${inv.invoiceNumber}.pdf`)}
                  >
                    <Download size={13} />
                    <span>PDF</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
