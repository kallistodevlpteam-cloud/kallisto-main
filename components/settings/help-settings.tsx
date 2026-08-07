"use client";

import React, { useState } from "react";
import styles from "../../app/settings/settings.module.css";
import { useSearchParams, useRouter } from "next/navigation";
import { ExternalLink, MessageSquare, Send, BookOpen } from "lucide-react";

interface HelpSettingsProps {
  user: {
    uid: string;
    role: string;
  };
}

export function HelpSettings({ user }: HelpSettingsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeSub = searchParams.get("sub") || "centre";

  const [bugTitle, setBugTitle] = useState("");
  const [bugDesc, setBugDesc] = useState("");

  const handleSubTabChange = (sub: string) => {
    router.push(`/settings/help?sub=${sub}`);
  };

  const handleReportBug = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bugTitle.trim() || !bugDesc.trim()) return;
    alert(`Bug report submitted: "${bugTitle}"\nThank you for helping us improve Kallisto!`);
    setBugTitle("");
    setBugDesc("");
  };

  const menuItems = [
    { key: "centre", label: "Help Centre" },
    { key: "contact", label: "Contact Support" },
    { key: "report", label: "Report an issue" },
    { key: "privacy", label: "Privacy & Terms" },
  ];

  return (
    <div className={`${styles.settingsContentOutlet} ${styles.preferencesSubLayout}`}>
      <div className={styles.preferencesSidebar}>
        {menuItems.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`${styles.sidebarItem} ${activeSub === item.key ? styles.sidebarItemActive : ""}`}
            onClick={() => handleSubTabChange(item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className={styles.preferencesContent}>
        {activeSub === "centre" && (
          <div className={styles.profileCleanContainer}>
            <section>
              <div className={styles.profileSectionHeader}>
                <h2 className={styles.profileSectionTitle}>Help Centre</h2>
                <p className={styles.profileSectionSubtitle}>
                  Browse through tutorials, user guides, and FAQs.
                </p>
              </div>

              <div
                style={{
                  padding: "20px",
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "20px",
                }}
              >
                <div>
                  <div style={{ fontSize: "14.5px", fontWeight: 600, color: "#111827" }}>
                    Kallisto Knowledgebase
                  </div>
                  <div style={{ fontSize: "12.5px", color: "#6b7280", marginTop: "2px" }}>
                    Find step-by-step guides on BOQ generation, payment settlement, and client drawing reviews.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => window.open("https://kallisto.build/docs", "_blank")}
                  style={{
                    height: "38px",
                    padding: "0 14px",
                    borderRadius: "8px",
                    background: "#ffffff",
                    border: "1px solid #e5e7eb",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#111827",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    flexShrink: 0,
                  }}
                >
                  <BookOpen size={15} />
                  <span>Open Docs</span>
                  <ExternalLink size={13} color="#6b7280" />
                </button>
              </div>
            </section>
          </div>
        )}

        {activeSub === "contact" && (
          <div className={styles.profileCleanContainer}>
            <section>
              <div className={styles.profileSectionHeader}>
                <h2 className={styles.profileSectionTitle}>Contact Support</h2>
                <p className={styles.profileSectionSubtitle}>
                  Reach out to the Kallisto operations and partner support desk.
                </p>
              </div>

              <div
                style={{
                  padding: "20px",
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "20px",
                }}
              >
                <div>
                  <div style={{ fontSize: "14.5px", fontWeight: 600, color: "#111827" }}>
                    Live Partner Support
                  </div>
                  <div style={{ fontSize: "12.5px", color: "#6b7280", marginTop: "2px" }}>
                    Chat directly with an operations coordinator about verification or disputes.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => alert("Connecting to partner support live chat...")}
                  style={{
                    height: "38px",
                    padding: "0 14px",
                    borderRadius: "8px",
                    background: "#111827",
                    border: "none",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#ffffff",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    flexShrink: 0,
                  }}
                >
                  <MessageSquare size={15} />
                  <span>Start Live Chat</span>
                </button>
              </div>
            </section>
          </div>
        )}

        {activeSub === "report" && (
          <div className={styles.profileCleanContainer}>
            <section>
              <div className={styles.profileSectionHeader}>
                <h2 className={styles.profileSectionTitle}>Report an Issue</h2>
                <p className={styles.profileSectionSubtitle}>
                  Report application bugs, performance lags, or layout glitches.
                </p>
              </div>

              <form onSubmit={handleReportBug} className={styles.cleanFormGrid}>
                <div className={`${styles.cleanFieldGroup} ${styles.fullWidthField}`}>
                  <label className={styles.cleanFieldLabel} htmlFor="bugTitle">Summary</label>
                  <input
                    id="bugTitle"
                    type="text"
                    placeholder="e.g. Calendar Board view overlap bug"
                    className={styles.cleanInput}
                    value={bugTitle}
                    onChange={(e) => setBugTitle(e.target.value)}
                    required
                  />
                </div>

                <div className={`${styles.cleanFieldGroup} ${styles.fullWidthField}`}>
                  <label className={styles.cleanFieldLabel} htmlFor="bugDesc">Detailed Description</label>
                  <textarea
                    id="bugDesc"
                    placeholder="Explain exactly how to reproduce the issue..."
                    className={styles.cleanInput}
                    style={{ minHeight: "110px", padding: "10px 14px", resize: "vertical" }}
                    value={bugDesc}
                    onChange={(e) => setBugDesc(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.fullWidthField} style={{ marginTop: "4px" }}>
                  <button
                    type="submit"
                    style={{
                      height: "40px",
                      padding: "0 18px",
                      borderRadius: "8px",
                      background: "#111827",
                      border: "none",
                      fontSize: "13.5px",
                      fontWeight: 600,
                      color: "#ffffff",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <Send size={15} />
                    <span>Submit Bug Report</span>
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}

        {activeSub === "privacy" && (
          <div className={styles.profileCleanContainer}>
            <section>
              <div className={styles.profileSectionHeader}>
                <h2 className={styles.profileSectionTitle}>Privacy & Terms</h2>
                <p className={styles.profileSectionSubtitle}>
                  Review Kallisto partner agreement terms and data protection policies.
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div
                  style={{
                    padding: "18px 20px",
                    background: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "20px",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>
                      Partner Agreement Terms
                    </div>
                    <div style={{ fontSize: "12.5px", color: "#6b7280", marginTop: "2px" }}>
                      Standard legal terms for service providers working on client briefs.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => alert("Opening Partner Terms document...")}
                    style={{
                      height: "36px",
                      padding: "0 14px",
                      borderRadius: "8px",
                      background: "#ffffff",
                      border: "1px solid #e5e7eb",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#111827",
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >
                    Read Terms
                  </button>
                </div>

                <div
                  style={{
                    padding: "18px 20px",
                    background: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "20px",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>
                      Data Privacy Policy
                    </div>
                    <div style={{ fontSize: "12.5px", color: "#6b7280", marginTop: "2px" }}>
                      Detailed disclosure on client details and layout IP protection.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => alert("Opening Privacy Policy document...")}
                    style={{
                      height: "36px",
                      padding: "0 14px",
                      borderRadius: "8px",
                      background: "#ffffff",
                      border: "1px solid #e5e7eb",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#111827",
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >
                    Read Privacy Policy
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
