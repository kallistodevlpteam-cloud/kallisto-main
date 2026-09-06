"use client";

import React, { useState } from "react";
import { Headphones, BookOpen, Send, Check } from "lucide-react";
import styles from "../../app/settings/settings.module.css";

interface HelpSettingsProps {
  user: {
    uid: string;
    role: string;
  };
}

export function HelpSettings({ user }: HelpSettingsProps) {
  const [issueTitle, setIssueTitle] = useState("");
  const [issueCategory, setIssueCategory] = useState("milestone_escrow");
  const [issueDesc, setIssueDesc] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueTitle.trim()) return;
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setIssueTitle("");
      setIssueDesc("");
    }, 2500);
  };

  return (
    <div className={styles.contentScrollArea}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.cardHeaderTitle}>Help & Support</h2>
            <p className={styles.cardHeaderSubtitle}>
              Access dedicated practice concierge, browse documentation, or open an urgent support ticket.
            </p>
          </div>
          {isSubmitted && (
            <div className={styles.toastSaved}>
              <Check size={14} />
              <span>Ticket Submitted</span>
            </div>
          )}
        </div>

        <div className={styles.cardBody}>
          {/* Concierge Banner */}
          <div
            style={{
              background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
              borderRadius: "14px",
              padding: "20px 24px",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <Headphones size={18} color="#38bdf8" />
                <span style={{ fontSize: "15px", fontWeight: 700 }}>Dedicated Practice Concierge</span>
              </div>
              <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8", maxWidth: "480px", lineHeight: "1.4" }}>
                Reach your assigned Kallisto Practice Success Manager for urgent dispute resolution, site feasibility queries, or escrow settlements.
              </p>
            </div>
            <a
              href="mailto:support@kallisto.design"
              className={styles.btnSecondary}
              style={{ background: "#ffffff", color: "#0f172a", textDecoration: "none" }}
            >
              Contact Concierge
            </a>
          </div>

          {/* Support Ticket Form */}
          <form onSubmit={handleSubmit} className={styles.cleanFormGrid} style={{ marginTop: "12px" }}>
            <div className={styles.cleanFieldGroup}>
              <label className={styles.cleanFieldLabel}>Issue Subject</label>
              <input
                type="text"
                placeholder="Brief summary of your query"
                className={styles.cleanInput}
                value={issueTitle}
                onChange={(e) => setIssueTitle(e.target.value)}
                required
              />
            </div>

            <div className={styles.cleanFieldGroup}>
              <label className={styles.cleanFieldLabel}>Category</label>
              <select
                className={styles.cleanSelect}
                value={issueCategory}
                onChange={(e) => setIssueCategory(e.target.value)}
              >
                <option value="milestone_escrow">Milestone Escrow & Payout</option>
                <option value="drawing_approval">Client Approval Workflow</option>
                <option value="boq_variations">BOQ & Scope Variations</option>
                <option value="technical_bug">Platform / Technical Bug</option>
              </select>
            </div>

            <div className={`${styles.cleanFieldGroup} ${styles.fullWidthField}`}>
              <label className={styles.cleanFieldLabel}>Detailed Description</label>
              <textarea
                className={styles.cleanTextarea}
                rows={4}
                placeholder="Describe your issue or provide relevant project references..."
                value={issueDesc}
                onChange={(e) => setIssueDesc(e.target.value)}
              />
            </div>

            <div className={styles.fullWidthField} style={{ display: "flex", justifyContent: "flex-end" }}>
              <button type="submit" className={styles.btnPrimary}>
                <Send size={14} />
                <span>Submit Ticket</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
