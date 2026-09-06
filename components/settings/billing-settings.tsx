"use client";

import React, { useState } from "react";
import { Download, Check } from "lucide-react";
import styles from "../../app/settings/settings.module.css";

interface BillingSettingsProps {
  workspace: {
    id: string;
    name: string;
  };
  permissions: {
    canManageBilling: boolean;
  };
}

export function BillingSettings({ workspace, permissions }: BillingSettingsProps) {
  const [bankName, setBankName] = useState("HDFC Bank — Panampilly Nagar Branch");
  const [accountNumber, setAccountNumber] = useState("•••• •••• •••• 4321");
  const [ifscCode, setIfscCode] = useState("HDFC0001234");
  const [gstin, setGstin] = useState("32AAAAA0000A1Z5");
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const INVOICES = [
    { id: "INV-2026-081", date: "01 Aug 2026", description: "Kallisto Studio Enterprise — Monthly", amount: "₹4,999", status: "Paid" },
    { id: "INV-2026-071", date: "01 Jul 2026", description: "Kallisto Studio Enterprise — Monthly", amount: "₹4,999", status: "Paid" },
    { id: "INV-2026-061", date: "01 Jun 2026", description: "Kallisto Studio Enterprise — Monthly", amount: "₹4,999", status: "Paid" },
  ];

  return (
    <div className={styles.contentScrollArea}>
      {/* 1. Subscription & Payout Details */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.cardHeaderTitle}>Billing & Invoices</h2>
            <p className={styles.cardHeaderSubtitle}>
              Manage bank payout details for milestone escrow settlements and download subscription invoices.
            </p>
          </div>
          {isSaved && (
            <div className={styles.toastSaved}>
              <Check size={14} />
              <span>Saved</span>
            </div>
          )}
        </div>

        <div className={styles.cardBody}>
          <div className={styles.cleanFormGrid}>
            <div className={styles.cleanFieldGroup}>
              <label className={styles.cleanFieldLabel}>Designated Payout Bank</label>
              <input
                type="text"
                className={styles.cleanInput}
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
              />
            </div>

            <div className={styles.cleanFieldGroup}>
              <label className={styles.cleanFieldLabel}>Account Number</label>
              <input
                type="text"
                className={styles.cleanInput}
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
              />
            </div>

            <div className={styles.cleanFieldGroup}>
              <label className={styles.cleanFieldLabel}>IFSC Code</label>
              <input
                type="text"
                className={styles.cleanInput}
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value)}
              />
            </div>

            <div className={styles.cleanFieldGroup}>
              <label className={styles.cleanFieldLabel}>GSTIN / Tax ID</label>
              <input
                type="text"
                className={styles.cleanInput}
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
            <button type="button" className={styles.btnPrimary} onClick={handleSave}>
              {isSaved ? (
                <>
                  <Check size={14} color="#ffffff" />
                  <span>Saved</span>
                </>
              ) : (
                <span>Save Payout Credentials</span>
              )}
            </button>
          </div>

          {/* Invoices Table */}
          <div className={styles.subSection} style={{ marginTop: "24px" }}>
            <h3 className={styles.subSectionTitle}>Invoice History</h3>
            <p className={styles.subSectionDesc}>
              Download VAT/GST compliant tax receipts and subscription billing statements.
            </p>

            <table className={styles.deviceTable}>
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Receipt</th>
                </tr>
              </thead>
              <tbody>
                {INVOICES.map((inv) => (
                  <tr key={inv.id}>
                    <td style={{ fontWeight: 600 }}>{inv.id}</td>
                    <td style={{ color: "var(--muted, #64748b)" }}>{inv.date}</td>
                    <td>{inv.description}</td>
                    <td style={{ fontWeight: 600 }}>{inv.amount}</td>
                    <td>
                      <span className={styles.thisDeviceBadge} style={{ color: "#16a34a", background: "#f0fdf4", borderColor: "#bbf7d0" }}>
                        {inv.status}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button type="button" className={styles.btnSecondary} style={{ padding: "4px 8px", fontSize: "11.5px" }}>
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
      </div>
    </div>
  );
}
